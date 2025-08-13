// Test script to check employee and project fields in audit logs
require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

async function checkAuditLogFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the most recent consolidated audit logs
    const recentConsolidatedLogs = await AuditLog.find({
      'changes.operation': { 
        $in: ['admin_bulk_schedule_assignment_multiple_projects', 'admin_schedule_assignment_single_project_multiple_employees'] 
      }
    })
    .sort({ timestamp: -1 })
    .limit(5)
    .exec();

    console.log('\n=== CONSOLIDATED AUDIT LOG FIELDS ===');
    
    recentConsolidatedLogs.forEach((log, index) => {
      console.log(`\n${index + 1}. Audit Log ID: ${log._id}`);
      console.log(`   Timestamp: ${log.timestamp ? log.timestamp.toISOString() : 'No date'}`);
      console.log(`   Manager: ${log.manager || 'N/A'}`);
      console.log(`   Action: ${log.action || 'N/A'}`);
      console.log(`   Employee Code: ${log.employeeCode || 'N/A'}`);
      console.log(`   Employee Name: ${log.employeeName || 'N/A'}`);
      console.log(`   Project Name: ${log.projectName || 'N/A'}`);
      console.log(`   Description: ${log.description?.substring(0, 100)}...`);
      
      if (log.changes) {
        console.log(`   Changes Operation: ${log.changes.operation || 'N/A'}`);
        
        if (log.changes.operation === 'admin_bulk_schedule_assignment_multiple_projects') {
          console.log(`   Employee Details in Changes: ${JSON.stringify(log.changes.employeeDetails || 'N/A')}`);
          console.log(`   Project Details in Changes: ${JSON.stringify(log.changes.projectDetails || 'N/A')}`);
          console.log(`   Projects Count: ${log.changes.projectsCount || 'N/A'}`);
          console.log(`   Total Hours: ${log.changes.totalHours || 'N/A'}`);
        } else if (log.changes.operation === 'admin_schedule_assignment_single_project_multiple_employees') {
          console.log(`   Project Details in Changes: ${JSON.stringify(log.changes.projectDetails || 'N/A')}`);
          console.log(`   Employee Details in Changes: ${JSON.stringify(log.changes.employeeDetails || 'N/A')}`);
          console.log(`   Employees Count: ${log.changes.employeesCount || 'N/A'}`);
        }
      }
      
      console.log('   ================================');
    });

    // Also check some regular audit logs for comparison
    console.log('\n=== REGULAR AUDIT LOG FIELDS (for comparison) ===');
    
    const regularLogs = await AuditLog.find({
      action: 'create',
      'changes.operation': { $exists: false }
    })
    .sort({ timestamp: -1 })
    .limit(2)
    .exec();

    regularLogs.forEach((log, index) => {
      console.log(`\n${index + 1}. Regular Audit Log ID: ${log._id}`);
      console.log(`   Employee Code: ${log.employeeCode || 'N/A'}`);
      console.log(`   Employee Name: ${log.employeeName || 'N/A'}`);
      console.log(`   Project Name: ${log.projectName || 'N/A'}`);
      console.log(`   Description: ${log.description?.substring(0, 80)}...`);
    });

  } catch (error) {
    console.error('Error checking audit log fields:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkAuditLogFields();
