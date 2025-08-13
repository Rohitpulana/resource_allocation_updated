require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

async function testConditionLogic() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find the most recent manager audit log with operation type
    const recentAudit = await AuditLog.findOne({
      'changes.operation': { $exists: true },
      description: { $regex: /Manager.*manager.DIH@cbsl.com/ }
    }).sort({ timestamp: -1 });

    if (recentAudit) {
      console.log('Testing Condition Logic:');
      console.log('=======================');
      console.log('Action:', recentAudit.action);
      console.log('Operation:', recentAudit.changes?.operation);
      
      // Test the exact condition from logAuditAction
      const action = recentAudit.action;
      const changes = recentAudit.changes;
      
      const conditionResult = action === 'bulk_assign' || action === 'bulk_replace' || 
        (changes && (changes.operation === 'admin_bulk_schedule_assignment_multiple_projects' || 
                     changes.operation === 'admin_schedule_assignment_single_project_multiple_employees' ||
                     changes.operation === 'manager_bulk_schedule_assignment_multiple_projects' ||
                     changes.operation === 'manager_schedule_assignment_single_project_multiple_employees'));
      
      console.log('Condition Result:', conditionResult);
      console.log('action === "bulk_assign":', action === 'bulk_assign');
      console.log('action === "bulk_replace":', action === 'bulk_replace');
      console.log('changes exists:', !!changes);
      console.log('operation match:', changes && [
        'admin_bulk_schedule_assignment_multiple_projects',
        'admin_schedule_assignment_single_project_multiple_employees',
        'manager_bulk_schedule_assignment_multiple_projects',
        'manager_schedule_assignment_single_project_multiple_employees'
      ].includes(changes.operation));
      
      // Test if employee details exist and what type they are
      if (changes?.employeeDetails) {
        console.log('\nEmployee Details Analysis:');
        console.log('Type:', Array.isArray(changes.employeeDetails) ? 'Array' : 'Object');
        console.log('Value:', JSON.stringify(changes.employeeDetails, null, 2));
        
        if (Array.isArray(changes.employeeDetails)) {
          console.log('Length:', changes.employeeDetails.length);
          if (changes.employeeDetails.length > 0) {
            console.log('First item empCode:', changes.employeeDetails[0].empCode);
            console.log('First item name:', changes.employeeDetails[0].name);
          }
        } else {
          console.log('empCode:', changes.employeeDetails.empCode);
          console.log('name:', changes.employeeDetails.name);
        }
      }
      
      // Test project details
      if (changes?.projectDetails) {
        console.log('\nProject Details Analysis:');
        console.log('Type:', Array.isArray(changes.projectDetails) ? 'Array' : 'Object');
        console.log('Value:', JSON.stringify(changes.projectDetails, null, 2));
        
        if (Array.isArray(changes.projectDetails)) {
          console.log('Project names:', changes.projectDetails.map(p => p.projectName).join(', '));
        } else if (changes.projectDetails.projectName) {
          console.log('Single project name:', changes.projectDetails.projectName);
        }
      }
      
    } else {
      console.log('No manager audit logs with operation found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

testConditionLogic();
