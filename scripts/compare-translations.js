const fs = require('fs');
const path = require('path');

const enFile = require('../src/translations/en/userRoleManager.json');
const thFile = require('../src/translations/th/userRoleManager.json');

function getAllKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((keys, key) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], currentKey));
    } else {
      keys.push(currentKey);
    }
    return keys;
  }, []);
}

const enKeys = getAllKeys(enFile).sort();
const thKeys = getAllKeys(thFile).sort();

const missingInTh = enKeys.filter(key => !thKeys.includes(key));
const missingInEn = thKeys.filter(key => !enKeys.includes(key));

console.log('Missing in Thai:', missingInTh);
console.log('Missing in English:', missingInEn);
