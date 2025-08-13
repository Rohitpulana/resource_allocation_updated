// Test the exact logic from logAuditAction function
function testEmployeeProjectExtraction() {
  console.log('Testing Employee/Project Extraction Logic');
  console.log('=========================================');

  // Test case 1: Single employee, multiple projects (manager_bulk_schedule_assignment_multiple_projects)
  const changes1 = {
    operation: 'manager_bulk_schedule_assignment_multiple_projects',
    employeeDetails: { empCode: '3007133135', name: 'Rutvij Shailesh Ambodkar' },
    projectDetails: [
      { projectName: 'KARNATAKA DC', hours: 2, action: 'created' },
      { projectName: 'FILE TRACKER', hours: 2, action: 'created' }
    ]
  };

  // Test case 2: Multiple employees, single project (manager_schedule_assignment_single_project_multiple_employees)
  const changes2 = {
    operation: 'manager_schedule_assignment_single_project_multiple_employees',
    projectDetails: { projectName: 'EZEE FILE' },
    employeeDetails: [
      { empCode: '2103169165', name: 'Nitish Kumar', action: 'created' },
      { empCode: '2103169209', name: 'Ayush Pratap Singh', action: 'created' }
    ]
  };

  function testCase(changes, caseName) {
    console.log(`\n--- ${caseName} ---`);
    
    let employeeCode = '', employeeName = '', projectName = '';
    
    const action = 'create';
    
    // Test the condition
    const isManagerBulkOperation = changes && (
      changes.operation === 'manager_bulk_schedule_assignment_multiple_projects' ||
      changes.operation === 'manager_schedule_assignment_single_project_multiple_employees'
    );
    
    console.log('Is Manager Bulk Operation:', isManagerBulkOperation);
    
    if (isManagerBulkOperation) {
      // For our consolidated operations, get employee info from changes
      if (changes.employeeDetails) {
        if (Array.isArray(changes.employeeDetails)) {
          // Multiple employees - use the first one for the main fields, and create a summary
          if (changes.employeeDetails.length > 0) {
            employeeCode = changes.employeeDetails[0].empCode;
            employeeName = changes.employeeDetails[0].name;
            // If there are multiple employees, create a summary format
            if (changes.employeeDetails.length > 1) {
              const employeeCodes = changes.employeeDetails.map(e => e.empCode).join(', ');
              const employeeNames = changes.employeeDetails.map(e => e.name).join(', ');
              employeeCode = `${changes.employeeDetails.length} employees: ${employeeCodes}`;
              employeeName = employeeNames;
            }
          }
        } else {
          // Single employee object
          employeeCode = changes.employeeDetails.empCode;
          employeeName = changes.employeeDetails.name;
        }
      }
      
      // For our consolidated operations, get project info from changes
      if (changes.projectDetails) {
        if (Array.isArray(changes.projectDetails)) {
          // Multiple projects
          projectName = changes.projectDetails.map(p => p.projectName).join(', ');
        } else if (changes.projectDetails.projectName) {
          // Single project
          projectName = changes.projectDetails.projectName;
        }
      }
    }
    
    console.log('Final values:');
    console.log('- employeeCode:', employeeCode || 'EMPTY');
    console.log('- employeeName:', employeeName || 'EMPTY');
    console.log('- projectName:', projectName || 'EMPTY');
  }

  testCase(changes1, 'Single Employee, Multiple Projects');
  testCase(changes2, 'Multiple Employees, Single Project');
}

testEmployeeProjectExtraction();
