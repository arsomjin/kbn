/**
 * Check if a number is very small (close to zero)
 * @param num - Number to check
 * @returns True if the number is very small
 */
export const isVerySmallNumber = (num: number): boolean => {
  return Math.abs(num) < 0.0000001;
};

/**
 * Convert any value to a number
 * @param val - Value to convert
 * @returns Converted number or 0 if conversion fails
 */
export const Numb = (val: unknown): number => {
  if (val === undefined || val === null || val === '') return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};
