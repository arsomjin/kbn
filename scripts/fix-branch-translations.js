const fs = require('fs');
const path = require('path');

const fixTranslationFile = (filePath) => {
  try {
    // Read and parse the JSON file
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // If the file has branches namespace, flatten it
    const fixedContent = data.branches || data;
    
    // Write back the flattened structure with proper formatting
    fs.writeFileSync(
      filePath,
      JSON.stringify(fixedContent, null, 2),
      'utf8'
    );
    
    console.log(`✅ Successfully fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
};

// Process both English and Thai translation files
const files = [
  path.join(__dirname, '../src/translations/en/branches.json'),
  path.join(__dirname, '../src/translations/th/branches.json')
];

files.forEach(fixTranslationFile);
