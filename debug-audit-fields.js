require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');

async function checkLoggedValues() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find recent audit logs
    const recentAudits = await AuditLog.find({}).sort({ timestamp: -1 }).limit(3);

    if (recentAudits.length > 0) {
      console.log(`Found ${recentAudits.length} audit logs:`);
      console.log('===============================');
      
      recentAudits.forEach((audit, index) => {
        console.log(`\nAudit Log ${index + 1}:`);
        console.log('Manager:', audit.manager || 'NOT SET');
        console.log('User Role:', audit.userRole || 'NOT SET');
        console.log('Employee Code:', audit.employeeCode || 'NOT SET');
        console.log('Employee Name:', audit.employeeName || 'NOT SET');
        console.log('Project Name:', audit.projectName || 'NOT SET');
        console.log('Action:', audit.action);
        console.log('Operation:', audit.changes?.operation || 'NOT SET');
        console.log('Description:', audit.description.substring(0, 100) + '...');
      });
    } else {
      console.log('No audit logs found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

checkLoggedValues();
