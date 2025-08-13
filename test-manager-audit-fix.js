require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

async function testManagerAuditFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find recent manager audit logs
    const recentAudits = await AuditLog.find({
      description: { $regex: /Manager.*manager.DIH@cbsl.com/ }
    }).sort({ timestamp: -1 }).limit(5);

    console.log('Recent Manager Audit Logs:');
    console.log('=========================');
    
    recentAudits.forEach((audit, index) => {
      console.log(`\nAudit Log ${index + 1}:`);
      console.log('Employee Field:', audit.employee || 'NOT SET');
      console.log('Project Field:', audit.project || 'NOT SET');
      console.log('Action:', audit.action);
      console.log('Description:', audit.description);
      
      if (audit.changes && audit.changes.operation) {
        console.log('Operation Type:', audit.changes.operation);
        
        if (audit.changes.employeeDetails) {
          console.log('Employee Details in Changes:', JSON.stringify(audit.changes.employeeDetails, null, 2));
        }
        
        if (audit.changes.projectDetails) {
          console.log('Project Details in Changes:', JSON.stringify(audit.changes.projectDetails, null, 2));
        }
      }
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

testManagerAuditFields();
