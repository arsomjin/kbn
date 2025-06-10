/**
 * Employee Verification Utilities
 * Comprehensive employee lookup and validation for authentication
 */

import { checkCollection } from '../firebase/api';
import { showLog } from '../functions';

/**
 * Employee lookup confidence levels
 */
export const CONFIDENCE_LEVELS = {
  EXACT_MATCH: 'exact_match',           // employeeCode + name match
  CODE_MATCH: 'code_match',             // employeeCode match only
  NAME_MATCH: 'name_match',             // firstName + lastName match
  PARTIAL_MATCH: 'partial_match',       // partial name match
  MULTIPLE_MATCHES: 'multiple_matches', // multiple potential matches
  NO_MATCH: 'no_match'                  // no matches found
};

/**
 * Employee verification result structure
 */
export const createVerificationResult = ({
  success = false,
  confidence = CONFIDENCE_LEVELS.NO_MATCH,
  employee = null,
  employees = [],
  message = '',
  suggestions = []
}) => ({
  success,
  confidence,
  employee,
  employees,
  message,
  suggestions,
  timestamp: Date.now()
});

/**
 * Primary employee verification function
 * @param {Object} params - Verification parameters
 * @param {string} params.employeeCode - Employee code to verify
 * @param {string} params.firstName - Employee first name
 * @param {string} params.lastName - Employee last name
 * @param {Object} params.employees - Employee data object (optional, for offline lookup)
 * @returns {Promise<Object>} Verification result
 */
export const verifyEmployee = async ({
  employeeCode,
  firstName,
  lastName,
  employees = null
}) => {
  try {
    showLog('🔍 Starting employee verification', {
      employeeCode,
      firstName,
      lastName,
      hasEmployeesData: !!employees
    });

    // Method 1: Lookup by employeeCode (Primary)
    if (employeeCode) {
      const codeResult = await verifyByEmployeeCode({
        employeeCode,
        firstName,
        lastName,
        employees
      });
      
      if (codeResult.success) {
        return codeResult;
      }
      
      // If employeeCode lookup failed, continue to name lookup
      showLog('❌ Employee code lookup failed, trying name lookup', {
        employeeCode,
        firstName,
        lastName
      });
    }

    // Method 2: Lookup by firstName + lastName (Fallback)
    if (firstName) {
      const nameResult = await verifyByName({
        firstName,
        lastName,
        employees,
        providedEmployeeCode: employeeCode // for cross-validation
      });
      
      if (nameResult.success) {
        return nameResult;
      }
    }

    // No matches found
    return createVerificationResult({
      success: false,
      confidence: CONFIDENCE_LEVELS.NO_MATCH,
      message: 'ไม่พบข้อมูลพนักงานที่ตรงกับข้อมูลที่ให้มา',
      suggestions: [
        'ตรวจสอบรหัสพนักงานให้ถูกต้อง',
        'ตรวจสอบชื่อ-นามสกุลให้ถูกต้อง',
        'ติดต่อฝ่ายบุคคลหากยังไม่สามารถเข้าสู่ระบบได้'
      ]
    });

  } catch (error) {
    console.error('Error in employee verification:', error);
    return createVerificationResult({
      success: false,
      confidence: CONFIDENCE_LEVELS.NO_MATCH,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลพนักงาน',
      suggestions: ['กรุณาลองใหม่อีกครั้ง หรือติดต่อฝ่ายเทคนิค']
    });
  }
};

/**
 * Verify employee by employeeCode
 * @param {Object} params - Verification parameters
 * @returns {Promise<Object>} Verification result
 */
export const verifyByEmployeeCode = async ({
  employeeCode,
  firstName,
  lastName,
  employees
}) => {
  try {
    let employee = null;

    // Try offline lookup first if employees data provided
    if (employees && employees[employeeCode]) {
      employee = employees[employeeCode];
      showLog('✅ Found employee in offline data', { employeeCode, employee });
    } else {
      // Firestore lookup
      const employeeDoc = await checkCollection('data/company/employees', [
        ['employeeCode', '==', employeeCode]
      ]);
      
      if (employeeDoc && !employeeDoc.empty) {
        employee = employeeDoc.docs[0].data();
        employee._key = employeeDoc.docs[0].id;
        showLog('✅ Found employee in Firestore', { employeeCode, employee });
      }
    }

    if (!employee) {
      return createVerificationResult({
        success: false,
        confidence: CONFIDENCE_LEVELS.NO_MATCH,
        message: `ไม่พบพนักงานที่มีรหัส ${employeeCode}`,
        suggestions: [
          'ตรวจสอบรหัสพนักงานให้ถูกต้อง',
          'ลองใช้ชื่อ-นามสกุลแทนการใส่รหัสพนักงาน'
        ]
      });
    }

    // Validate employee status
    if (employee.status !== 'ปกติ') {
      return createVerificationResult({
        success: false,
        confidence: CONFIDENCE_LEVELS.CODE_MATCH,
        employee,
        message: `พนักงานรหัส ${employeeCode} มีสถานะ: ${employee.status}`,
        suggestions: ['ติดต่อฝ่ายบุคคลเพื่อตรวจสอบสถานะการทำงาน']
      });
    }

    // Cross-validate with provided names if available
    if (firstName || lastName) {
      const nameMatch = validateEmployeeName(employee, { firstName, lastName });
      
      if (!nameMatch.isMatch) {
        return createVerificationResult({
          success: false,
          confidence: CONFIDENCE_LEVELS.CODE_MATCH,
          employee,
          message: `รหัสพนักงาน ${employeeCode} พบแล้ว แต่ชื่อไม่ตรงกัน`,
          suggestions: [
            `ชื่อในระบบ: ${employee.firstName} ${employee.lastName}`,
            'ตรวจสอบการสะกดชื่อ-นามสกุล',
            'ติดต่อฝ่ายบุคคลหากข้อมูลไม่ถูกต้อง'
          ]
        });
      }

      // Perfect match: code + name
      return createVerificationResult({
        success: true,
        confidence: CONFIDENCE_LEVELS.EXACT_MATCH,
        employee,
        message: `ยืนยันตัวตนสำเร็จ: ${employee.firstName} ${employee.lastName} (${employeeCode})`,
        suggestions: []
      });
    }

    // Code match only (no name provided for validation)
    return createVerificationResult({
      success: true,
      confidence: CONFIDENCE_LEVELS.CODE_MATCH,
      employee,
      message: `พบพนักงานรหัส ${employeeCode}: ${employee.firstName} ${employee.lastName}`,
      suggestions: []
    });

  } catch (error) {
    console.error('Error in employeeCode verification:', error);
    throw error;
  }
};

/**
 * Verify employee by name (firstName + lastName)
 * @param {Object} params - Verification parameters
 * @returns {Promise<Object>} Verification result
 */
export const verifyByName = async ({
  firstName,
  lastName,
  employees,
  providedEmployeeCode = null
}) => {
  try {
    let matchingEmployees = [];

    // Build search criteria
    const wheres = [['firstName', '==', firstName]];
    if (lastName) {
      wheres.push(['lastName', '==', lastName]);
    }

    // Add status filter to only get active employees
    wheres.push(['status', '==', 'ปกติ']);

    // Try offline lookup first if employees data provided
    if (employees) {
      const employeesList = Object.keys(employees).map(k => ({
        ...employees[k],
        _key: k
      }));

      matchingEmployees = employeesList.filter(emp => {
        const firstNameMatch = emp.firstName === firstName;
        const lastNameMatch = !lastName || emp.lastName === lastName;
        const statusMatch = emp.status === 'ปกติ';
        
        return firstNameMatch && lastNameMatch && statusMatch;
      });

      showLog('🔍 Name search in offline data', {
        firstName,
        lastName,
        foundCount: matchingEmployees.length
      });
    } else {
      // Firestore lookup
      const employeeDocs = await checkCollection('data/company/employees', wheres);
      
      if (employeeDocs && !employeeDocs.empty) {
        matchingEmployees = employeeDocs.docs.map(doc => ({
          ...doc.data(),
          _key: doc.id
        }));
      }

      showLog('🔍 Name search in Firestore', {
        firstName,
        lastName,
        foundCount: matchingEmployees.length
      });
    }

    // Handle results
    if (matchingEmployees.length === 0) {
      return createVerificationResult({
        success: false,
        confidence: CONFIDENCE_LEVELS.NO_MATCH,
        message: `ไม่พบพนักงานชื่อ ${firstName}${lastName ? ` ${lastName}` : ''}`,
        suggestions: [
          'ตรวจสอบการสะกดชื่อ-นามสกุล',
          'ลองใส่เฉพาะชื่อจริง (ไม่ต้องใส่นามสกุล)',
          'ติดต่อฝ่ายบุคคลหากยังไม่สามารถเข้าสู่ระบบได้'
        ]
      });
    }

    if (matchingEmployees.length === 1) {
      const employee = matchingEmployees[0];
      
      // Cross-validate with provided employeeCode if available
      if (providedEmployeeCode && employee.employeeCode !== providedEmployeeCode) {
        return createVerificationResult({
          success: false,
          confidence: CONFIDENCE_LEVELS.NAME_MATCH,
          employee,
          message: `พบพนักงานชื่อ ${firstName}${lastName ? ` ${lastName}` : ''} แต่รหัสพนักงานไม่ตรงกัน`,
          suggestions: [
            `รหัสพนักงานในระบบ: ${employee.employeeCode}`,
            `รหัสที่ให้มา: ${providedEmployeeCode}`,
            'ตรวจสอบรหัสพนักงานให้ถูกต้อง'
          ]
        });
      }

      // Single match found
      return createVerificationResult({
        success: true,
        confidence: providedEmployeeCode === employee.employeeCode 
          ? CONFIDENCE_LEVELS.EXACT_MATCH 
          : CONFIDENCE_LEVELS.NAME_MATCH,
        employee,
        message: `พบพนักงาน: ${employee.firstName} ${employee.lastName} (${employee.employeeCode})`,
        suggestions: []
      });
    }

    // Multiple matches found
    return createVerificationResult({
      success: false,
      confidence: CONFIDENCE_LEVELS.MULTIPLE_MATCHES,
      employees: matchingEmployees,
      message: `พบพนักงานหลายคนที่มีชื่อ ${firstName}${lastName ? ` ${lastName}` : ''} (${matchingEmployees.length} คน)`,
      suggestions: [
        'กรุณาระบุรหัสพนักงานเพื่อระบุตัวตน',
        'ติดต่อฝ่ายบุคคลเพื่อขอรหัสพนักงาน',
        ...matchingEmployees.map(emp => 
          `- ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) - ${emp.position || 'ไม่ระบุตำแหน่ง'}`
        )
      ]
    });

  } catch (error) {
    console.error('Error in name verification:', error);
    throw error;
  }
};

/**
 * Validate employee name against provided names
 * @param {Object} employee - Employee record
 * @param {Object} names - Provided names { firstName, lastName }
 * @returns {Object} Validation result
 */
export const validateEmployeeName = (employee, { firstName, lastName }) => {
  if (!employee || !firstName) {
    return { isMatch: false, reason: 'Invalid input data' };
  }

  const empFirstName = employee.firstName?.trim().toLowerCase();
  const empLastName = employee.lastName?.trim().toLowerCase();
  const checkFirstName = firstName?.trim().toLowerCase();
  const checkLastName = lastName?.trim().toLowerCase();

  // Check first name (required)
  const firstNameMatch = empFirstName === checkFirstName;
  
  // Check last name (optional)
  let lastNameMatch = true;
  if (lastName && empLastName) {
    lastNameMatch = empLastName === checkLastName;
  }

  const isMatch = firstNameMatch && lastNameMatch;

  return {
    isMatch,
    firstNameMatch,
    lastNameMatch,
    reason: !firstNameMatch 
      ? 'First name mismatch' 
      : !lastNameMatch 
        ? 'Last name mismatch' 
        : 'Names match'
  };
};

/**
 * Get employee suggestions for similar names
 * @param {string} firstName - First name to search for
 * @param {string} lastName - Last name to search for
 * @param {Object} employees - Employee data
 * @returns {Array} Array of similar employees
 */
export const getEmployeeSuggestions = (firstName, lastName, employees) => {
  if (!employees || !firstName) return [];

  const employeesList = Object.keys(employees).map(k => ({
    ...employees[k],
    _key: k
  }));

  const searchName = firstName.toLowerCase();
  const suggestions = employeesList.filter(emp => {
    if (emp.status !== 'ปกติ') return false;
    
    const empFirstName = emp.firstName?.toLowerCase() || '';
    const empLastName = emp.lastName?.toLowerCase() || '';
    
    // Check for partial matches or similar names
    return empFirstName.includes(searchName) || 
           searchName.includes(empFirstName) ||
           (lastName && empLastName.includes(lastName.toLowerCase()));
  });

  return suggestions.slice(0, 5); // Limit to 5 suggestions
};

/**
 * Enhanced employee status check with detailed information
 * @param {Object} employee - Employee record
 * @returns {Object} Status information
 */
export const getEmployeeStatusInfo = (employee) => {
  if (!employee) {
    return {
      isActive: false,
      status: 'unknown',
      message: 'ไม่พบข้อมูลพนักงาน',
      canRegister: false
    };
  }

  const status = employee.status || 'ไม่ระบุ';
  const isActive = status === 'ปกติ';
  
  const statusInfo = {
    isActive,
    status,
    canRegister: isActive,
    message: isActive 
      ? 'พนักงานมีสถานะปกติ' 
      : `พนักงานมีสถานะ: ${status}`,
    details: {
      startDate: employee.startDate,
      endDate: employee.endDate,
      position: employee.position,
      affiliate: employee.affiliate,
      provinceId: employee.provinceId
    }
  };

  if (!isActive) {
    statusInfo.suggestions = [
      'ติดต่อฝ่ายบุคคลเพื่อตรวจสอบสถานะการทำงาน',
      'อาจจำเป็นต้องได้รับการอนุมัติพิเศษจากผู้จัดการ'
    ];
  }

  return statusInfo;
};

/**
 * Format employee information for display
 * @param {Object} employee - Employee record
 * @returns {Object} Formatted employee info
 */
export const formatEmployeeInfo = (employee) => {
  if (!employee) return null;

  return {
    employeeCode: employee.employeeCode,
    fullName: `${employee.firstName} ${employee.lastName || ''}`.trim(),
    displayName: employee.nickName 
      ? `${employee.firstName} (${employee.nickName})` 
      : employee.firstName,
    position: employee.position || 'ไม่ระบุตำแหน่ง',
    branch: employee.affiliate || 'ไม่ระบุสาขา',
    province: employee.provinceId || 'ไม่ระบุจังหวัด',
    status: employee.status || 'ไม่ระบุสถานะ',
    workSchedule: employee.workBegin && employee.workEnd 
      ? `${employee.workBegin} - ${employee.workEnd}`
      : 'ไม่ระบุเวลาทำงาน',
    startDate: employee.startDate,
    isActive: employee.status === 'ปกติ'
  };
}; 