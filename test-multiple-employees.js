// Test script to verify multiple employees on single project consolidation
require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

async function testMultipleEmployeesConsolidation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find audit logs for multiple employees on single project
    const multiEmployeeLogs = await AuditLog.find({
      'changes.operation': 'admin_schedule_assignment_single_project_multiple_employees'
    })
    .sort({ timestamp: -1 })
    .limit(5)
    .exec();

    console.log('\n=== MULTIPLE EMPLOYEES ON SINGLE PROJECT AUDIT LOGS ===');
    
    if (multiEmployeeLogs.length === 0) {
      console.log('No consolidated logs found for multiple employees on single project yet.');
      console.log('This consolidation will work when you assign multiple employees to a single project.');
    } else {
      multiEmployeeLogs.forEach((log, index) => {
        console.log(`\n${index + 1}. Audit Log ID: ${log._id}`);
        console.log(`   Timestamp: ${log.timestamp ? log.timestamp.toISOString() : 'No date'}`);
        console.log(`   Manager: ${log.manager || 'N/A'}`);
        console.log(`   Action: ${log.action || 'N/A'}`);
        console.log(`   Employee Code: ${log.employeeCode || 'N/A'}`);
        console.log(`   Employee Name: ${log.employeeName || 'N/A'}`);
        console.log(`   Project Name: ${log.projectName || 'N/A'}`);
        console.log(`   Description: ${log.description}`);
        
        if (log.changes) {
          console.log(`   Project Details: ${JSON.stringify(log.changes.projectDetails)}`);
          console.log(`   Employees Count: ${log.changes.employeesCount}`);
          console.log(`   Employee Details: ${JSON.stringify(log.changes.employeeDetails)}`);
          console.log(`   Hours: ${log.changes.hours}`);
          console.log(`   Date Range: ${log.changes.dateRange}`);
        }
        console.log('   ================================');
      });
    }

    // Show summary of current consolidation types
    console.log('\n=== CONSOLIDATION SUMMARY ===');
    
    const multiProjectLogs = await AuditLog.countDocuments({
      'changes.operation': 'admin_bulk_schedule_assignment_multiple_projects'
    });
    
    const multiEmployeeLogsCount = await AuditLog.countDocuments({
      'changes.operation': 'admin_schedule_assignment_single_project_multiple_employees'
    });
    
    console.log(`Multiple projects per employee logs: ${multiProjectLogs}`);
    console.log(`Multiple employees per project logs: ${multiEmployeeLogsCount}`);
    
    console.log('\n=== HOW TO TEST MULTIPLE EMPLOYEES ON SINGLE PROJECT ===');
    console.log('1. Go to the admin schedule interface');
    console.log('2. Select MULTIPLE employees (hold Ctrl and click multiple employee checkboxes)');
    console.log('3. Select a SINGLE project from the dropdown');
    console.log('4. Set the hours and date range');
    console.log('5. Submit the form');
    console.log('6. This should create ONE consolidated audit log instead of separate logs for each employee');

  } catch (error) {
    console.error('Error testing multiple employees consolidation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testMultipleEmployeesConsolidation();
