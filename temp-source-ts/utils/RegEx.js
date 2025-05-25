export const extractLastNumbers = (str, length) => {
  if (!str) {
    return str;
  }
  const onlyNumbers = str.replace(/\D/g, '');
  return onlyNumbers.substring(onlyNumbers.length - length);
};

export const removeAllNonAlphaNumericCharacters = str => {
  if (!str || !['string', 'number'].includes(typeof str)) {
    return str;
  }
  // Remove all non-alphanumeric Characters ( A!@12#b$3%^c&*( => A12b3c )
  const replaced = str.toString().replace(/[^a-z0-9]/gi, '');
  return replaced.toLowerCase();
  // The forward slashes / / mark the beginning and end of the regular expression.
  // The square brackets [] are called a character class.
  // The caret ^ symbol means "not the following". In our case this means not any letters in the range of a-z and numbers in the range of 0-9.
  // We use the g (global) flag because we want to match all occurrences of non-alphanumeric characters and not just the first occurrence.
  // The i flag makes our match case insensitive - we match all uppercase and lowercase characters.
};

export const extractOnlyCharacters = str => {
  if (!str) {
    return str;
  }
  // Remove all non-alphanumeric Characters ( A!@12#b$3%^c&*( => A12b3c )
  const replaced = str.replace(/[^a-z]/gi, '');
  return replaced;
};

export const findLastLetterIndex = str => {
  if (!str) {
    return -1;
  }
  let onlyChars = extractOnlyCharacters(str);
  let lastLetter = onlyChars.substring(onlyChars.length - 1);
  return str.lastIndexOf(lastLetter);
};

export const extractNumbersFromLastLetter = str => {
  if (!str) {
    return str;
  }
  const replaced = removeAllNonAlphaNumericCharacters(str);
  let lastLetterIndex = findLastLetterIndex(replaced);
  return replaced.substring(lastLetterIndex + 1);
};

export const hasOnlyDigits = text => {
  if (!text) {
    return false;
  }
  // let inputtxt = text.replace(/(\r\n|\n|\r| |-)/g, '');
  const pattern = /^[0-9]+$/;
  return pattern.test(text);
};

export const hasOnlyLetters = text => {
  if (!text) {
    return false;
  }
  // let inputtxt = text.replace(/(\r\n|\n|\r| |-)/g, '');
  const pattern = /^[a-zA-Z\u0E00-\u0E7F]+$/;
  // const pattern = /^[a-zA-Zก-๏]+$/;
  return pattern.test(text);
};

export const hasLettersOrSpaces = text => {
  if (!text) {
    return false;
  }
  // let inputtxt = text.replace(/(\r\n|\n|\r| |-)/g, '');
  const pattern = /^[a-zA-Z\u0E00-\u0E7F\s]+$/;
  // const pattern = /^[a-zA-Zก-๏]+$/;
  return pattern.test(text);
};

export const hasSpaceBetween = text => {
  if (!text) {
    return false;
  }
  // let inputtxt = text.replace(/(\r\n|\n|\r| |-)/g, '');
  const pattern = /^[a-zA-Zก-๏]+\s+[a-zA-Zก-๏]+$/;
  return pattern.test(text);
};

export const hasNameAndSurnamePattern = text => {
  return hasSpaceBetween(text);
};
