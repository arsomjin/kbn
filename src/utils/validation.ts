export const isString = (val: unknown): val is string => typeof val === 'string';
export const isNumber = (val: unknown): val is number => typeof val === 'number' && !isNaN(val);
export const isDayjs = (val: unknown): val is import('dayjs').Dayjs =>
  !!val && typeof val === 'object' && typeof (val as any).isValid === 'function';
