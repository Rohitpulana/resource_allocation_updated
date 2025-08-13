const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Import models
const AuditLog = require('./models/AuditLog');

// Create Express app for testing
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'test-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Mock audit logging function (same as in app.js)
async function logAuditAction(req, action, description, additionalData = {}) {
  try {
    if (!req.session || !req.session.user) {
      console.log('⚠️  No user session found for audit logging');
      return;
    }

    const auditData = {
      manager: req.session.user.email,
      managerName: req.session.user.name,
      userRole: req.session.user.role, // This should be 'admin' or 'manager'
      action,
      description,
      timestamp: new Date(),
      route: req.originalUrl || req.url,
      ...additionalData
    };

    const auditLog = new AuditLog(auditData);
    await auditLog.save();
    
    console.log(`✅ Audit log created: ${action} by ${req.session.user.role} ${req.session.user.email}`);
  } catch (error) {
    console.error('❌ Error creating audit log:', error);
  }
}

// Test routes
app.post('/test-admin-action', async (req, res) => {
  // Mock admin session
  req.session.user = {
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'admin'
  };
  
  await logAuditAction(req, 'TEST_ADMIN_ACTION', 'Test admin action for validation', {
    employeeCode: 'TEST001',
    employeeName: 'Test Employee'
  });
  
  res.json({ success: true, message: 'Admin audit log created' });
});

app.post('/test-manager-action', async (req, res) => {
  // Mock manager session
  req.session.user = {
    email: 'manager@test.com',
    name: 'Test Manager',
    role: 'manager'
  };
  
  await logAuditAction(req, 'TEST_MANAGER_ACTION', 'Test manager action for validation', {
    employeeCode: 'TEST002',
    employeeName: 'Test Employee 2'
  });
  
  res.json({ success: true, message: 'Manager audit log created' });
});

app.get('/test-audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find({
      action: { $in: ['TEST_ADMIN_ACTION', 'TEST_MANAGER_ACTION'] }
    }).sort({ timestamp: -1 }).limit(10);
    
    res.json({
      success: true,
      logs: logs.map(log => ({
        userRole: log.userRole,
        manager: log.manager,
        action: log.action,
        description: log.description,
        timestamp: log.timestamp
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('✅ Connected to MongoDB for audit logging validation');
  
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n🧪 AUDIT LOGGING VALIDATION SERVER`);
    console.log(`Server running on port ${PORT}`);
    console.log('\n📝 Available test endpoints:');
    console.log(`   POST http://localhost:${PORT}/test-admin-action`);
    console.log(`   POST http://localhost:${PORT}/test-manager-action`);
    console.log(`   GET  http://localhost:${PORT}/test-audit-logs`);
    console.log('\n🔍 Test Instructions:');
    console.log('1. Make POST requests to test-admin-action and test-manager-action');
    console.log('2. Check GET test-audit-logs to verify both roles are logged');
    console.log('3. Verify userRole field is properly set');
    console.log('\n⚡ Press Ctrl+C to stop the server');
  });
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
