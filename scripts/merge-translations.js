const fs = require('fs');
const path = require('path');

function mergeTranslations(language) {
  const translationsDir = path.join(__dirname, '../src/translations', language);
  const mainTranslationPath = path.join(translationsDir, 'translation.json');
  const firebaseTranslationPath = path.join(translationsDir, 'firebase.json');
  
  // Read files
  const mainTranslations = JSON.parse(fs.readFileSync(mainTranslationPath, 'utf8'));
  const firebaseTranslations = JSON.parse(fs.readFileSync(firebaseTranslationPath, 'utf8'));
  
  // Remove firebase errors from main translations
  if (mainTranslations.firebase && mainTranslations.firebase.errors) {
    delete mainTranslations.firebase;
  }
  if (mainTranslations.auth && mainTranslations.auth.errors) {
    delete mainTranslations.auth.errors;
  }
  
  // Write back the cleaned main translations
  fs.writeFileSync(mainTranslationPath, JSON.stringify(mainTranslations, null, 2));
  console.log(`Updated ${language}/translation.json`);
  
  // Ensure firebase translations have proper structure
  const newFirebaseTranslations = {
    errors: {
      ...firebaseTranslations.errors,
      ...(mainTranslations.firebase?.errors || {}),
      ...(mainTranslations.auth?.errors || {})
    }
  };
  
  fs.writeFileSync(firebaseTranslationPath, JSON.stringify(newFirebaseTranslations, null, 2));
  console.log(`Updated ${language}/firebase.json`);
}

// Run for both languages
['en', 'th'].forEach(mergeTranslations);
