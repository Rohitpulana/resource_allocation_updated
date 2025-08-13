// Test script to verify consolidated audit logging for bulk assignments
require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

async function testConsolidatedAuditLogging() {
  try {
    // Connect to MongoDB using the same URI as the main app
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find recent audit logs (last 10)
    const recentLogs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .exec();

    console.log('\n=== RECENT AUDIT LOGS ===');
    recentLogs.forEach((log, index) => {
      console.log(`\n${index + 1}. ${log.timestamp ? log.timestamp.toISOString() : 'No date'}`);
      console.log(`   User: ${log.manager || 'Unknown'}`);
      console.log(`   Operation: ${log.action || 'Unknown'}`);
      console.log(`   Description: ${log.description || 'No description'}`);
      
      if (log.changes) {
        console.log(`   Changes Operation: ${log.changes.operation || 'Unknown'}`);
        
        // Show specific details based on operation type
        if (log.changes.operation === 'admin_bulk_schedule_assignment_multiple_projects') {
          console.log(`   Projects Count: ${log.changes.projectsCount || 'Unknown'}`);
          console.log(`   Project Details:`, log.changes.projectDetails || 'None');
          console.log(`   Employee: ${log.changes.employeeDetails?.empCode || 'Unknown'} (${log.changes.employeeDetails?.name || 'Unknown'})`);
          console.log(`   Total Hours: ${log.changes.totalHours || 'Unknown'}`);
        } else if (log.changes.operation === 'admin_schedule_assignment_single_project_multiple_employees') {
          console.log(`   Employees Count: ${log.changes.employeesCount || 'Unknown'}`);
          console.log(`   Employee Details:`, log.changes.employeeDetails || 'None');
          console.log(`   Project: ${log.changes.projectDetails?.projectName || 'Unknown'}`);
          console.log(`   Hours: ${log.changes.hours || 'Unknown'}`);
        } else if (log.changes.operation === 'bulk_replace') {
          console.log(`   Source Projects: ${log.changes.sourceProjects || 'Not specified'}`);
          console.log(`   Target Project: ${log.changes.targetProject || 'Not specified'}`);
          console.log(`   Employee Count: ${log.changes.employeeCount || 'Not specified'}`);
        }
        
        if (log.changes.dateRange) {
          console.log(`   Date Range: ${log.changes.dateRange}`);
        }
      }
      
      if (log.projectName) {
        console.log(`   Project Name: ${log.projectName}`);
      }
      
      console.log('   ---');
    });

    // Look for specific patterns that indicate the issues we fixed
    console.log('\n=== AUDIT LOG ANALYSIS ===');
    
    // Check for consolidated multiple project assignments
    const multiProjectLogs = recentLogs.filter(log => 
      log.changes && log.changes.operation === 'admin_bulk_schedule_assignment_multiple_projects'
    );
    console.log(`\nFound ${multiProjectLogs.length} consolidated multiple project assignment logs`);
    
    // Check for consolidated multiple employee assignments
    const multiEmployeeLogs = recentLogs.filter(log => 
      log.changes && log.changes.operation === 'admin_schedule_assignment_single_project_multiple_employees'
    );
    console.log(`Found ${multiEmployeeLogs.length} consolidated multiple employee assignment logs`);
    
    // Check for bulk replace operations with proper project names
    const bulkReplaceLogs = recentLogs.filter(log => 
      log.changes && log.changes.operation === 'bulk_replace'
    );
    console.log(`Found ${bulkReplaceLogs.length} bulk replace operation logs`);
    
    if (bulkReplaceLogs.length > 0) {
      bulkReplaceLogs.forEach((log, index) => {
        console.log(`\nBulk Replace Log ${index + 1}:`);
        console.log(`  Description mentions projects: ${log.description.includes('projects') ? 'YES' : 'NO'}`);
        console.log(`  Project Name field: ${log.projectName || 'None'}`);
        if (log.changes.sourceProjects) {
          console.log(`  Source Projects in changes: ${Array.isArray(log.changes.sourceProjects) ? log.changes.sourceProjects.join(', ') : log.changes.sourceProjects}`);
        }
      });
    }

  } catch (error) {
    console.error('Error testing audit logging:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testConsolidatedAuditLogging();
