import { Rule } from 'antd/lib/form';

interface ValidationRule {
  pattern?: RegExp;
  message?: string;
  minLength?: number;
}

type RuleType = 'required' | 'number' | 'mobileNumber' | ValidationRule;

const validateMobileNumber = (value: string): boolean => {
  // Thai mobile number format: 0XX-XXX-XXXX or 0XXXXXXXXX
  const mobileRegex = /^0[1-9]\d{8}$/;
  return mobileRegex.test(value.replace(/-/g, ''));
};

export const getRules = (rules: RuleType[]): Rule[] => {
  const requiredRule: Rule[] = [{ required: true, message: 'กรุณาป้อนข้อมูล' }];
  const numberRule: Rule[] = [
    () => ({
      validator(_rule: unknown, value: unknown) {
        if (!value || !isNaN(Number(value))) {
          return Promise.resolve();
        }
        return Promise.reject('กรุณาป้อนตัวเลข');
      }
    })
  ];
  const mobileNumberRule: Rule[] = [
    () => ({
      validator(_rule: unknown, value: unknown) {
        if (!value) {
          return Promise.resolve();
        }
        if (validateMobileNumber(String(value))) {
          return Promise.resolve();
        }
        return Promise.reject('กรุณาตรวจสอบ เบอร์โทรศัพท์');
      }
    })
  ];

  let result: Rule[] = [];

  rules.forEach(rule => {
    switch (true) {
      case rule === 'required': {
        result = result.concat(requiredRule);
        break;
      }
      case rule === 'number': {
        result = result.concat(numberRule);
        break;
      }
      case rule === 'mobileNumber': {
        result = result.concat(mobileNumberRule);
        break;
      }
      // If user passes an object like { pattern: /regex/, message: '...' }
      case typeof rule === 'object' && 'pattern' in rule && rule.pattern instanceof RegExp: {
        const { pattern, message } = rule as ValidationRule;
        result.push({ pattern, message: message || 'รูปแบบไม่ถูกต้อง' });
        break;
      }
      // If user passes { minLength: 5, message: '...' }
      case typeof rule === 'object' && 'minLength' in rule: {
        const { minLength, message } = rule as ValidationRule;
        result.push({
          min: minLength,
          message: message || `กรุณาป้อนอย่างน้อย ${minLength} ตัวอักษร`
        });
        break;
      }
      default:
        break;
    }
  });

  return result;
};
  