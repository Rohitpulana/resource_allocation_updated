require('dotenv').config();
const mongoose = require('mongoose');

async function checkDatabaseCollections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log('-', collection.name);
    });

    // Check audit logs collection specifically
    const auditCollection = mongoose.connection.db.collection('auditlogs');
    const auditCount = await auditCollection.countDocuments();
    console.log('\nAudit logs count:', auditCount);

    // Check if there might be other audit-related collections
    const allCollections = ['auditlogs', 'audit_logs', 'AuditLog', 'AuditLogs'];
    for (const collName of allCollections) {
      try {
        const coll = mongoose.connection.db.collection(collName);
        const count = await coll.countDocuments();
        if (count > 0) {
          console.log(`\n${collName} collection has ${count} documents`);
          const sample = await coll.findOne({});
          console.log('Sample document:');
          console.log(JSON.stringify(sample, null, 2));
        }
      } catch (err) {
        // Collection doesn't exist
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

checkDatabaseCollections();
