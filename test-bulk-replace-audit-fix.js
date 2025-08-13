const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');
const ProjectMaster = require('./models/ProjectMaster');

async function testBulkReplaceAuditFix() {
  try {
    // Connect to MongoDB (using the same connection as the main app)
    await mongoose.connect('mongodb://localhost:27017/RMS', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Query recent bulk_replace audit logs to check if multiple projects are now recorded correctly
    console.log('\n=== Testing Bulk Replace Audit Fix ===');
    
    const bulkReplaceAudits = await AuditLog.find({ 
      action: 'bulk_replace',
      'changes.sourceProjects': { $exists: true }
    })
    .sort({ timestamp: -1 })
    .limit(5);

    if (bulkReplaceAudits.length === 0) {
      console.log('No bulk_replace audit logs found. The fix will be applied when you perform a bulk replace operation.');
    } else {
      console.log(`Found ${bulkReplaceAudits.length} recent bulk_replace audit logs:`);
      
      for (const audit of bulkReplaceAudits) {
        console.log(`\n--- Audit Log ${audit._id} ---`);
        console.log(`Manager: ${audit.manager}`);
        console.log(`Action: ${audit.action}`);
        console.log(`Description: ${audit.description}`);
        console.log(`ProjectName field: "${audit.projectName}"`);
        
        // Check source projects in changes
        if (audit.changes && audit.changes.sourceProjects) {
          console.log(`Source Projects Count: ${audit.changes.sourceProjects.length}`);
          console.log(`Source Projects:`, audit.changes.sourceProjects.map(p => p.projectName || 'Unknown').join(', '));
          
          // Check if projectName field matches the count in description
          const projectCountInDescription = audit.description.match(/(\d+) projects/);
          const actualProjectCount = audit.changes.sourceProjects.length;
          
          if (projectCountInDescription) {
            const descriptionCount = parseInt(projectCountInDescription[1]);
            console.log(`Description mentions: ${descriptionCount} projects`);
            console.log(`Actual source projects: ${actualProjectCount} projects`);
            
            if (descriptionCount === actualProjectCount) {
              // Check if projectName field contains all projects or just one
              const projectNames = audit.changes.sourceProjects.map(p => p.projectName).filter(Boolean);
              const projectNameField = audit.projectName || '';
              const projectsInField = projectNameField.split(', ').length;
              
              if (actualProjectCount > 1 && projectsInField === 1) {
                console.log('❌ BUG DETECTED: ProjectName field contains only 1 project but should contain all projects');
                console.log(`Expected: ${projectNames.join(', ')}`);
                console.log(`Actual: ${projectNameField}`);
              } else if (actualProjectCount > 1 && projectsInField === actualProjectCount) {
                console.log('✅ FIX VERIFIED: ProjectName field correctly contains all projects');
              } else if (actualProjectCount === 1) {
                console.log('✅ Single project case: ProjectName field correctly contains the project');
              }
            }
          }
        }
        console.log('---');
      }
    }

    // Show example of what the fix should produce
    console.log('\n=== Expected Behavior After Fix ===');
    console.log('When bulk replacing 2 projects:');
    console.log('- Description: "...copied 2 projects (8h) from EMP001..."');
    console.log('- ProjectName field: "Project A, Project B" (all project names)');
    console.log('- Before fix: ProjectName field would only show "Project A" (first project only)');

  } catch (error) {
    console.error('Error testing bulk replace audit fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test
testBulkReplaceAuditFix();
