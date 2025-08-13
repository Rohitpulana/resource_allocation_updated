// Test script to trigger consolidated audit logging and see debug output
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const ProjectMaster = require('./models/ProjectMaster');
const AssignedSchedule = require('./models/AssignedSchedule');

// Import the audit logging function
async function testAuditLogging() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for testing');

    // Create a mock request object
    const mockReq = {
      session: {
        user: {
          email: 'test@cbsl.com',
          role: 'admin'
        }
      },
      originalUrl: '/schedule',
      ip: '127.0.0.1',
      get: () => 'Test User Agent'
    };

    // Simulate our logAuditAction call
    const description = 'Test Admin test@cbsl.com created assignment for TEST123 on 2 projects (PROJECT A, PROJECT B) from Mon Aug 01 2025 to Wed Aug 13 2025 via admin-schedule';
    
    const changes = {
      operation: 'admin_bulk_schedule_assignment_multiple_projects',
      employeeDetails: { empCode: 'TEST123', name: 'Test Employee' },
      projectsCount: 2,
      projectDetails: [
        { projectName: 'PROJECT A', hours: 3, action: 'created' },
        { projectName: 'PROJECT B', hours: 2, action: 'created' }
      ],
      totalHours: 5,
      dateRange: 'Mon Aug 01 2025 to Wed Aug 13 2025',
      assignmentIds: ['test123', 'test456']
    };

    // Import the logAuditAction function from app.js by creating a minimal version
    const AuditLog = require('./models/AuditLog');

    async function testLogAuditAction(req, action, assignmentId, before, after, description, changes = {}) {
      try {
        console.log('🔍 testLogAuditAction called:', { action, assignmentId, description });
        console.log('🔍 Changes:', changes);
        
        // Get user info - support both admin and manager users
        const userEmail = req.session.user?.email || 'Unknown';
        const userRole = req.session.user?.role || 'Unknown';
        const userName = req.session.user?.email?.split('@')[0] || 'Unknown';
        
        console.log('🔍 Creating audit log for user:', { userEmail, userRole });
        
        // Get employee and project names for better description
        let employeeCode = '', employeeName = '', projectName = '';
        
        // Handle bulk operations differently
        console.log('🔍 Checking bulk operation condition:', {
          action,
          hasChanges: !!changes,
          changesOperation: changes?.operation,
          condition1: action === 'bulk_assign',
          condition2: action === 'bulk_replace',
          condition3: changes && (changes.operation === 'admin_bulk_schedule_assignment_multiple_projects' || 
                                  changes.operation === 'admin_schedule_assignment_single_project_multiple_employees')
        });
        
        if (action === 'bulk_assign' || action === 'bulk_replace' || 
            (changes && (changes.operation === 'admin_bulk_schedule_assignment_multiple_projects' || 
                         changes.operation === 'admin_schedule_assignment_single_project_multiple_employees'))) {
          
          console.log('🔍 Entering bulk operation logic');
          
          // For our consolidated operations, get employee info from changes
          if (changes.employeeDetails) {
            console.log('🔍 Setting employee details from changes:', changes.employeeDetails);
            employeeCode = changes.employeeDetails.empCode;
            employeeName = changes.employeeDetails.name;
          }
          
          // For our consolidated operations, get project info from changes
          if (changes.projectDetails) {
            console.log('🔍 Setting project details from changes:', changes.projectDetails);
            if (Array.isArray(changes.projectDetails)) {
              // Multiple projects
              projectName = changes.projectDetails.map(p => p.projectName).join(', ');
            } else if (changes.projectDetails.projectName) {
              // Single project
              projectName = changes.projectDetails.projectName;
            }
          }
          
          console.log('🔍 Final values from bulk operation logic:', { employeeCode, employeeName, projectName });
        }

        const auditEntry = {
          manager: userEmail,
          managerName: userName,
          userRole: userRole,
          action,
          assignmentId,
          employeeCode,
          employeeName,
          projectName,
          description,
          changes,
          before,
          after,
          route: '/schedule',
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        };
        
        console.log('🔍 Final audit entry to be saved:', {
          employeeCode: auditEntry.employeeCode,
          employeeName: auditEntry.employeeName,
          projectName: auditEntry.projectName,
          action: auditEntry.action
        });
        
      } catch (err) {
        console.error('❌ Audit logging error:', err);
      }
    }

    // Test the function
    console.log('\n=== TESTING AUDIT LOGGING FUNCTION ===');
    await testLogAuditAction(mockReq, 'create', 'test123', null, null, description, changes);

  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nTest completed, disconnected from MongoDB');
  }
}

testAuditLogging();
