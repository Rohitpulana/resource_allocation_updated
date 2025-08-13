// Test script to verify the employee field fix for multiple employees
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const ProjectMaster = require('./models/ProjectMaster');

// Mock the logAuditAction function to test our fix
async function testEmployeeFieldFix() {
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

    // Test case 1: Single employee (should work)
    console.log('\n=== TEST CASE 1: Single Employee ===');
    const singleEmployeeChanges = {
      operation: 'admin_bulk_schedule_assignment_multiple_projects',
      employeeDetails: { empCode: 'TEST123', name: 'Test Employee' },
      projectDetails: [{ projectName: 'PROJECT A', hours: 3 }]
    };
    
    let employeeCode = '', employeeName = '';
    if (singleEmployeeChanges.employeeDetails) {
      if (Array.isArray(singleEmployeeChanges.employeeDetails)) {
        if (singleEmployeeChanges.employeeDetails.length > 0) {
          employeeCode = singleEmployeeChanges.employeeDetails[0].empCode;
          employeeName = singleEmployeeChanges.employeeDetails[0].name;
          if (singleEmployeeChanges.employeeDetails.length > 1) {
            const employeeCodes = singleEmployeeChanges.employeeDetails.map(e => e.empCode).join(', ');
            const employeeNames = singleEmployeeChanges.employeeDetails.map(e => e.name).join(', ');
            employeeCode = `${singleEmployeeChanges.employeeDetails.length} employees: ${employeeCodes}`;
            employeeName = employeeNames;
          }
        }
      } else {
        employeeCode = singleEmployeeChanges.employeeDetails.empCode;
        employeeName = singleEmployeeChanges.employeeDetails.name;
      }
    }
    console.log('Result:', { employeeCode, employeeName });

    // Test case 2: Multiple employees (this is the case that was failing)
    console.log('\n=== TEST CASE 2: Multiple Employees ===');
    const multipleEmployeesChanges = {
      operation: 'admin_schedule_assignment_single_project_multiple_employees',
      employeeDetails: [
        { empCode: 'EMP001', name: 'Employee One', action: 'created' },
        { empCode: 'EMP002', name: 'Employee Two', action: 'created' },
        { empCode: 'EMP003', name: 'Employee Three', action: 'created' }
      ],
      projectDetails: { projectName: 'TEST PROJECT' }
    };
    
    employeeCode = '';
    employeeName = '';
    if (multipleEmployeesChanges.employeeDetails) {
      if (Array.isArray(multipleEmployeesChanges.employeeDetails)) {
        if (multipleEmployeesChanges.employeeDetails.length > 0) {
          employeeCode = multipleEmployeesChanges.employeeDetails[0].empCode;
          employeeName = multipleEmployeesChanges.employeeDetails[0].name;
          if (multipleEmployeesChanges.employeeDetails.length > 1) {
            const employeeCodes = multipleEmployeesChanges.employeeDetails.map(e => e.empCode).join(', ');
            const employeeNames = multipleEmployeesChanges.employeeDetails.map(e => e.name).join(', ');
            employeeCode = `${multipleEmployeesChanges.employeeDetails.length} employees: ${employeeCodes}`;
            employeeName = employeeNames;
          }
        }
      } else {
        employeeCode = multipleEmployeesChanges.employeeDetails.empCode;
        employeeName = multipleEmployeesChanges.employeeDetails.name;
      }
    }
    console.log('Result:', { employeeCode, employeeName });
    
    // Test case 3: Real data from the audit log
    console.log('\n=== TEST CASE 3: Real Audit Log Data ===');
    const realAuditData = {
      operation: 'admin_schedule_assignment_single_project_multiple_employees',
      employeeDetails: [
        {"empCode":"3007133089","name":"Kusum Rajesh Vishwakarma","action":"created"},
        {"empCode":"3007133090","name":"Himanshu Sambhaji Thosare","action":"created"}
      ],
      projectDetails: {"projectName":"KARNATAKA DC"}
    };
    
    employeeCode = '';
    employeeName = '';
    if (realAuditData.employeeDetails) {
      if (Array.isArray(realAuditData.employeeDetails)) {
        if (realAuditData.employeeDetails.length > 0) {
          employeeCode = realAuditData.employeeDetails[0].empCode;
          employeeName = realAuditData.employeeDetails[0].name;
          if (realAuditData.employeeDetails.length > 1) {
            const employeeCodes = realAuditData.employeeDetails.map(e => e.empCode).join(', ');
            const employeeNames = realAuditData.employeeDetails.map(e => e.name).join(', ');
            employeeCode = `${realAuditData.employeeDetails.length} employees: ${employeeCodes}`;
            employeeName = employeeNames;
          }
        }
      } else {
        employeeCode = realAuditData.employeeDetails.empCode;
        employeeName = realAuditData.employeeDetails.name;
      }
    }
    console.log('Result:', { employeeCode, employeeName });

  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nTest completed, disconnected from MongoDB');
  }
}

testEmployeeFieldFix();
