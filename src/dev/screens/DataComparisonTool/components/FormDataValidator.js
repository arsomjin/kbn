// 🚀 FORM DATA VALIDATOR
// Advanced validation tool for form data integrity and business rules

import React, { useState, useCallback, useContext } from 'react';
import {
  Card,
  Button,
  Table,
  Alert,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Input,
  Form,
  Select,
  Switch,
  Tooltip,
  Modal,
  notification,
  Collapse,
  Descriptions,
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BugOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ShieldCheckOutlined,
  DatabaseOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { FirebaseContext } from '../../../../firebase';
import { usePermissions } from '../../../../hooks/usePermissions';
import { getBranchName, getProvinceName } from '../../../../utils/mappings';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

// 🔧 VALIDATION RULES: Comprehensive validation schema
const VALIDATION_RULES = {
  // Required Fields
  required: {
    name: 'ฟิลด์จำเป็น',
    description: 'ตรวจสอบฟิลด์ที่จำเป็นต้องมีค่า',
    severity: 'error',
    validate: (value, field) => {
      if (value === null || value === undefined || value === '') {
        return { valid: false, message: `${field} เป็นฟิลด์จำเป็น` };
      }
      return { valid: true };
    },
  },

  // Data Types
  string: {
    name: 'ข้อความ',
    description: 'ตรวจสอบประเภทข้อมูลเป็นข้อความ',
    severity: 'error',
    validate: (value, field) => {
      if (value !== null && value !== undefined && typeof value !== 'string') {
        return { valid: false, message: `${field} ต้องเป็นข้อความ` };
      }
      return { valid: true };
    },
  },

  number: {
    name: 'ตัวเลข',
    description: 'ตรวจสอบประเภทข้อมูลเป็นตัวเลข',
    severity: 'error',
    validate: (value, field) => {
      if (
        value !== null &&
        value !== undefined &&
        (isNaN(value) || typeof value !== 'number')
      ) {
        return { valid: false, message: `${field} ต้องเป็นตัวเลข` };
      }
      return { valid: true };
    },
  },

  // Geographic Validation
  provinceId: {
    name: 'รหัสจังหวัด',
    description: 'ตรวจสอบรหัสจังหวัดที่ถูกต้อง',
    severity: 'error',
    validate: (value, field) => {
      const validProvinces = ['nakhon-ratchasima', 'nakhon-sawan'];
      if (value && !validProvinces.includes(value)) {
        return { valid: false, message: `${field} ไม่ถูกต้อง: ${value}` };
      }
      return { valid: true };
    },
  },

  branchCode: {
    name: 'รหัสสาขา',
    description: 'ตรวจสอบรหัสสาขาที่ถูกต้อง',
    severity: 'error',
    validate: (value, field) => {
      const validBranches = [
        '0450',
        'NMA002',
        'NMA003',
        'NSN001',
        'NSN002',
        'NSN003',
      ];
      if (value && !validBranches.includes(value)) {
        return { valid: false, message: `${field} ไม่ถูกต้อง: ${value}` };
      }
      return { valid: true };
    },
  },

  // Business Rules
  positiveAmount: {
    name: 'จำนวนเงินบวก',
    description: 'ตรวจสอบจำนวนเงินต้องเป็นค่าบวก',
    severity: 'warning',
    validate: (value, field) => {
      if (field.includes('amount') || field.includes('Amount')) {
        if (value !== null && value !== undefined && value <= 0) {
          return { valid: false, message: `${field} ต้องมีค่ามากกว่า 0` };
        }
      }
      return { valid: true };
    },
  },

  dateFormat: {
    name: 'รูปแบบวันที่',
    description: 'ตรวจสอบรูปแบบวันที่ที่ถูกต้อง',
    severity: 'warning',
    validate: (value, field) => {
      if (field.includes('date') || field.includes('Date')) {
        if (value && !dayjs(value).isValid()) {
          return { valid: false, message: `${field} รูปแบบวันที่ไม่ถูกต้อง` };
        }
      }
      return { valid: true };
    },
  },

  // RBAC Validation
  rbacCompliance: {
    name: 'การปฏิบัติตาม RBAC',
    description: 'ตรวจสอบการปฏิบัติตามกฎ RBAC',
    severity: 'error',
    validate: (value, field, data, userRBAC) => {
      if (field === 'provinceId' && userRBAC?.allowedProvinces?.length > 0) {
        if (value && !userRBAC.allowedProvinces.includes(value)) {
          return {
            valid: false,
            message: `ไม่มีสิทธิ์เข้าถึงจังหวัด: ${getProvinceName(value)}`,
          };
        }
      }
      return { valid: true };
    },
  },

  // Data Consistency
  consistency: {
    name: 'ความสอดคล้องของข้อมูล',
    description: 'ตรวจสอบความสอดคล้องระหว่างฟิลด์',
    severity: 'warning',
    validate: (value, field, data) => {
      // Check province-branch consistency
      if (field === 'branchCode' && data.provinceId) {
        const provinceBranches = {
          'nakhon-ratchasima': ['0450', 'NMA002', 'NMA003'],
          'nakhon-sawan': ['NSN001', 'NSN002', 'NSN003'],
        };

        const allowedBranches = provinceBranches[data.provinceId] || [];
        if (value && !allowedBranches.includes(value)) {
          return {
            valid: false,
            message: `สาขา ${getBranchName(value)} ไม่อยู่ในจังหวัด ${getProvinceName(data.provinceId)}`,
          };
        }
      }
      return { valid: true };
    },
  },
};

// 🔧 FIELD SCHEMAS: Define validation rules for different field types
const FIELD_SCHEMAS = {
  'income-daily': {
    incomeId: ['required', 'string'],
    customerName: ['required', 'string'],
    amount: ['required', 'number', 'positiveAmount'],
    date: ['required', 'dateFormat'],
    provinceId: ['required', 'provinceId', 'rbacCompliance'],
    branchCode: ['required', 'branchCode', 'consistency'],
  },
  'expense-daily': {
    expenseId: ['required', 'string'],
    description: ['required', 'string'],
    amount: ['required', 'number', 'positiveAmount'],
    date: ['required', 'dateFormat'],
    provinceId: ['required', 'provinceId', 'rbacCompliance'],
    branchCode: ['required', 'branchCode', 'consistency'],
  },
  'sale-orders': {
    saleOrderNumber: ['required', 'string'],
    customerName: ['required', 'string'],
    totalAmount: ['required', 'number', 'positiveAmount'],
    date: ['required', 'dateFormat'],
    provinceId: ['required', 'provinceId', 'rbacCompliance'],
    branchCode: ['required', 'branchCode', 'consistency'],
  },
};

const FormDataValidator = ({ data, schema, onValidationComplete }) => {
  const [validationResults, setValidationResults] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [customRules, setCustomRules] = useState('');
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    passed: 0,
    warnings: 0,
    errors: 0,
  });

  const { userRBAC } = usePermissions();

  // 🚀 VALIDATE: Execute comprehensive validation
  const validateData = useCallback(async () => {
    if (!data || Object.keys(data).length === 0) {
      notification.warning({
        message: 'ไม่มีข้อมูลที่ต้องการตรวจสอบ',
        description: 'กรุณาโหลดข้อมูลก่อนทำการตรวจสอบ',
      });
      return;
    }

    setIsValidating(true);

    try {
      const results = [];
      const fieldSchema = FIELD_SCHEMAS[schema] || {};
      let totalChecks = 0;
      let passedChecks = 0;
      let warningChecks = 0;
      let errorChecks = 0;

      // Validate each field
      for (const [field, value] of Object.entries(data)) {
        const rules = fieldSchema[field] || [];

        for (const ruleName of rules) {
          const rule = VALIDATION_RULES[ruleName];
          if (!rule) continue;

          totalChecks++;

          const result = rule.validate(value, field, data, userRBAC);

          if (!result.valid) {
            const validationResult = {
              id: `${field}-${ruleName}`,
              field,
              rule: rule.name,
              severity: rule.severity,
              message: result.message,
              value,
              description: rule.description,
              timestamp: new Date().toISOString(),
            };

            results.push(validationResult);

            if (rule.severity === 'error') errorChecks++;
            else if (rule.severity === 'warning') warningChecks++;
          } else {
            passedChecks++;
          }
        }
      }

      // Custom validation rules
      if (customRules.trim()) {
        try {
          const customRuleFunction = new Function(
            'data',
            'userRBAC',
            customRules
          );
          const customResult = customRuleFunction(data, userRBAC);

          if (customResult && !customResult.valid) {
            results.push({
              id: 'custom-rule',
              field: 'custom',
              rule: 'กฎกำหนดเอง',
              severity: 'warning',
              message: customResult.message || 'กฎกำหนดเองไม่ผ่าน',
              value: 'N/A',
              description: 'กฎที่กำหนดโดยผู้ใช้',
              timestamp: new Date().toISOString(),
            });
            warningChecks++;
          } else {
            passedChecks++;
          }
          totalChecks++;
        } catch (error) {
          results.push({
            id: 'custom-rule-error',
            field: 'custom',
            rule: 'ข้อผิดพลาดกฎกำหนดเอง',
            severity: 'error',
            message: `ข้อผิดพลาดในกฎกำหนดเอง: ${error.message}`,
            value: 'N/A',
            description: 'ข้อผิดพลาดในการประมวลผลกฎกำหนดเอง',
            timestamp: new Date().toISOString(),
          });
          errorChecks++;
          totalChecks++;
        }
      }

      setValidationResults(results);
      setValidationSummary({
        total: totalChecks,
        passed: passedChecks,
        warnings: warningChecks,
        errors: errorChecks,
      });

      if (onValidationComplete) {
        onValidationComplete(results, {
          total: totalChecks,
          passed: passedChecks,
          warnings: warningChecks,
          errors: errorChecks,
        });
      }

      notification.success({
        message: 'ตรวจสอบข้อมูลเสร็จสิ้น',
        description: `ตรวจสอบ ${totalChecks} รายการ พบปัญหา ${results.length} รายการ`,
      });
    } catch (error) {
      console.error('Validation error:', error);
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถตรวจสอบข้อมูลได้',
      });
    } finally {
      setIsValidating(false);
    }
  }, [data, schema, customRules, userRBAC, onValidationComplete]);

  // 🎨 FILTER: Filter results by severity
  const filteredResults = validationResults.filter((result) => {
    if (selectedSeverity === 'all') return true;
    return result.severity === selectedSeverity;
  });

  // 🎨 RENDER: Validation results table columns
  const resultColumns = [
    {
      title: 'ฟิลด์',
      dataIndex: 'field',
      key: 'field',
      width: 120,
      render: (field) => <Text code>{field}</Text>,
    },
    {
      title: 'กฎ',
      dataIndex: 'rule',
      key: 'rule',
      width: 150,
    },
    {
      title: 'ระดับ',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => {
        const config = {
          error: {
            color: 'red',
            icon: <ExclamationCircleOutlined />,
            text: 'ข้อผิดพลาด',
          },
          warning: {
            color: 'orange',
            icon: <WarningOutlined />,
            text: 'คำเตือน',
          },
          info: { color: 'blue', icon: <InfoCircleOutlined />, text: 'ข้อมูล' },
        };
        const { color, icon, text } = config[severity] || config.info;
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'ข้อความ',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'ค่า',
      dataIndex: 'value',
      key: 'value',
      width: 150,
      render: (value) => (
        <Text type='secondary' ellipsis>
          {value === null || value === undefined ? 'ไม่ระบุ' : String(value)}
        </Text>
      ),
    },
  ];

  return (
    <div className='form-data-validator'>
      <Card>
        <Title level={3}>
          <ShieldCheckOutlined className='mr-2' />
          Form Data Validator
        </Title>

        {/* Control Section */}
        <Card size='small' className='mb-4'>
          <Row gutter={16} align='middle'>
            <Col span={8}>
              <Button
                type='primary'
                icon={<CheckCircleOutlined />}
                onClick={validateData}
                loading={isValidating}
                block
              >
                ตรวจสอบข้อมูล
              </Button>
            </Col>

            <Col span={8}>
              <Select
                value={selectedSeverity}
                onChange={setSelectedSeverity}
                style={{ width: '100%' }}
                placeholder='กรองตามระดับ'
              >
                <Option value='all'>ทั้งหมด</Option>
                <Option value='error'>ข้อผิดพลาด</Option>
                <Option value='warning'>คำเตือน</Option>
                <Option value='info'>ข้อมูล</Option>
              </Select>
            </Col>

            <Col span={8}>
              <Switch
                checked={showDetails}
                onChange={setShowDetails}
                checkedChildren='แสดงรายละเอียด'
                unCheckedChildren='ซ่อนรายละเอียด'
              />
            </Col>
          </Row>
        </Card>

        {/* Summary Section */}
        {validationResults.length > 0 && (
          <Card size='small' className='mb-4'>
            <Row gutter={16}>
              <Col span={6}>
                <div className='text-center'>
                  <div className='text-2xl font-bold'>
                    {validationSummary.total}
                  </div>
                  <div className='text-gray-500'>ตรวจสอบทั้งหมด</div>
                </div>
              </Col>
              <Col span={6}>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {validationSummary.passed}
                  </div>
                  <div className='text-gray-500'>ผ่าน</div>
                </div>
              </Col>
              <Col span={6}>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-orange-600'>
                    {validationSummary.warnings}
                  </div>
                  <div className='text-gray-500'>คำเตือน</div>
                </div>
              </Col>
              <Col span={6}>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-red-600'>
                    {validationSummary.errors}
                  </div>
                  <div className='text-gray-500'>ข้อผิดพลาด</div>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Custom Rules Section */}
        <Collapse className='mb-4'>
          <Panel header='กฎกำหนดเอง (JavaScript)' key='custom-rules'>
            <Paragraph>
              เขียนกฎการตรวจสอบแบบกำหนดเอง โดยใช้ JavaScript:
            </Paragraph>
            <TextArea
              rows={6}
              value={customRules}
              onChange={(e) => setCustomRules(e.target.value)}
              placeholder={`// ตัวอย่าง: ตรวจสอบว่าจำนวนเงินไม่เกิน 1,000,000
if (data.amount && data.amount > 1000000) {
  return { valid: false, message: 'จำนวนเงินเกินขีดจำกัด' };
}
return { valid: true };`}
            />
          </Panel>
        </Collapse>

        {/* Results Section */}
        {filteredResults.length > 0 ? (
          <Card size='small'>
            <Title level={4}>
              ผลการตรวจสอบ ({filteredResults.length} รายการ)
            </Title>

            <Table
              columns={resultColumns}
              dataSource={filteredResults}
              rowKey='id'
              pagination={{ pageSize: 20 }}
              scroll={{ x: 800 }}
              size='small'
              expandable={
                showDetails
                  ? {
                      expandedRowRender: (record) => (
                        <Descriptions size='small' column={1}>
                          <Descriptions.Item label='คำอธิบาย'>
                            {record.description}
                          </Descriptions.Item>
                          <Descriptions.Item label='เวลา'>
                            {new Date(record.timestamp).toLocaleString('th-TH')}
                          </Descriptions.Item>
                        </Descriptions>
                      ),
                    }
                  : undefined
              }
            />
          </Card>
        ) : validationResults.length === 0 ? (
          <Alert
            message='ยังไม่มีการตรวจสอบ'
            description="กรุณากดปุ่ม 'ตรวจสอบข้อมูล' เพื่อเริ่มการตรวจสอบ"
            type='info'
            showIcon
          />
        ) : (
          <Alert
            message='ไม่พบปัญหา'
            description='ข้อมูลผ่านการตรวจสอบทั้งหมด'
            type='success'
            showIcon
          />
        )}
      </Card>
    </div>
  );
};

export default FormDataValidator;
