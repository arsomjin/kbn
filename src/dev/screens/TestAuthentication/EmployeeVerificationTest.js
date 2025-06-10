import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Alert, 
  Typography, 
  Space, 
  Divider,
  Table,
  Tag,
  Descriptions,
  Row,
  Col
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  IdcardOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { 
  verifyEmployee, 
  CONFIDENCE_LEVELS,
  formatEmployeeInfo,
  getEmployeeStatusInfo,
  verifyByEmployeeCode,
  verifyByName,
  getEmployeeSuggestions
} from '../../../utils/employeeVerification';

const { Title, Text, Paragraph } = Typography;

const EmployeeVerificationTest = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  
  const { employees } = useSelector(state => state.data);

  const handleVerification = async (values) => {
    setLoading(true);
    setVerificationResult(null);
    setSuggestions([]);

    try {
      console.log('🔍 Testing employee verification with values:', values);

      const result = await verifyEmployee({
        employeeCode: values.employeeCode,
        firstName: values.firstName,
        lastName: values.lastName,
        employees: employees
      });

      console.log('📊 Verification result:', result);
      setVerificationResult(result);

      // Get suggestions if verification failed
      if (!result.success && values.firstName) {
        const suggestions = getEmployeeSuggestions(
          values.firstName, 
          values.lastName, 
          employees
        );
        setSuggestions(suggestions);
      }

    } catch (error) {
      console.error('❌ Verification error:', error);
      setVerificationResult({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบ: ' + error.message,
        confidence: CONFIDENCE_LEVELS.NO_MATCH
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestCodeOnly = async (values) => {
    if (!values.employeeCode) return;

    setLoading(true);
    try {
      const result = await verifyByEmployeeCode({
        employeeCode: values.employeeCode,
        firstName: values.firstName,
        lastName: values.lastName,
        employees: employees
      });
      setVerificationResult(result);
    } catch (error) {
      console.error('Error testing code verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNameOnly = async (values) => {
    if (!values.firstName) return;

    setLoading(true);
    try {
      const result = await verifyByName({
        firstName: values.firstName,
        lastName: values.lastName,
        employees: employees,
        providedEmployeeCode: values.employeeCode
      });
      setVerificationResult(result);
    } catch (error) {
      console.error('Error testing name verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case CONFIDENCE_LEVELS.EXACT_MATCH:
        return 'green';
      case CONFIDENCE_LEVELS.CODE_MATCH:
        return 'blue';
      case CONFIDENCE_LEVELS.NAME_MATCH:
        return 'orange';
      case CONFIDENCE_LEVELS.MULTIPLE_MATCHES:
        return 'purple';
      case CONFIDENCE_LEVELS.PARTIAL_MATCH:
        return 'yellow';
      default:
        return 'red';
    }
  };

  const getConfidenceText = (confidence) => {
    switch (confidence) {
      case CONFIDENCE_LEVELS.EXACT_MATCH:
        return 'สูงมาก (รหัส + ชื่อตรงกัน)';
      case CONFIDENCE_LEVELS.CODE_MATCH:
        return 'สูง (รหัสพนักงานตรงกัน)';
      case CONFIDENCE_LEVELS.NAME_MATCH:
        return 'ปานกลาง (ชื่อตรงกัน)';
      case CONFIDENCE_LEVELS.MULTIPLE_MATCHES:
        return 'พบหลายผล';
      case CONFIDENCE_LEVELS.PARTIAL_MATCH:
        return 'ตรงบางส่วน';
      default:
        return 'ไม่พบข้อมูล';
    }
  };

  // Sample employee data for testing
  const sampleEmployees = employees ? Object.keys(employees).slice(0, 5).map(key => ({
    employeeCode: key,
    ...employees[key]
  })) : [];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🧪 Employee Verification System Test</Title>
      <Paragraph>
        ทดสอบระบบตรวจสอบข้อมูลพนักงานแบบใหม่ที่รองรับการค้นหาด้วยรหัสพนักงานและชื่อ-นามสกุล
      </Paragraph>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="🔍 ทดสอบการตรวจสอบพนักงาน" style={{ marginBottom: 24 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleVerification}
            >
              <Form.Item
                name="employeeCode"
                label="รหัสพนักงาน (ทางเลือกที่ 1)"
              >
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="เช่น KBN50007"
                />
              </Form.Item>

              <Form.Item
                name="firstName"
                label="ชื่อ (ทางเลือกที่ 2 หรือสำหรับตรวจสอบ)"
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="เช่น เด็มใจ"
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                label="นามสกุล (เสริมการค้นหา)"
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="เช่น ทองคำนก"
                />
              </Form.Item>

              <Space>
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  htmlType="submit" 
                  loading={loading}
                >
                  ค้นหาแบบรวม
                </Button>
                <Button 
                  onClick={() => handleTestCodeOnly(form.getFieldsValue())}
                  loading={loading}
                >
                  ทดสอบรหัสเฉพาะ
                </Button>
                <Button 
                  onClick={() => handleTestNameOnly(form.getFieldsValue())}
                  loading={loading}
                >
                  ทดสอบชื่อเฉพาะ
                </Button>
              </Space>
            </Form>
          </Card>

          {/* Sample Data for Testing */}
          <Card title="📋 ตัวอย่างข้อมูลสำหรับทดสอบ" size="small">
            <Table
              dataSource={sampleEmployees}
              size="small"
              pagination={false}
              scroll={{ y: 200 }}
              columns={[
                {
                  title: 'รหัสพนักงาน',
                  dataIndex: 'employeeCode',
                  key: 'employeeCode',
                  width: 120
                },
                {
                  title: 'ชื่อ',
                  dataIndex: 'firstName',
                  key: 'firstName',
                  width: 80
                },
                {
                  title: 'นามสกุล',
                  dataIndex: 'lastName',
                  key: 'lastName',
                  width: 100
                },
                {
                  title: 'สาขา',
                  dataIndex: 'affiliate',
                  key: 'affiliate',
                  width: 80
                },
                {
                  title: 'สถานะ',
                  dataIndex: 'status',
                  key: 'status',
                  width: 60,
                  render: (status) => (
                    <Tag color={status === 'ปกติ' ? 'green' : 'red'}>
                      {status}
                    </Tag>
                  )
                }
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {/* Verification Results */}
          {verificationResult && (
            <Card 
              title={
                <Space>
                  {verificationResult.success ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  )}
                  ผลการตรวจสอบ
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Alert
                type={verificationResult.success ? 'success' : 'error'}
                message={verificationResult.message}
                style={{ marginBottom: 16 }}
              />

              <Descriptions column={1} size="small">
                <Descriptions.Item label="ระดับความมั่นใจ">
                  <Tag color={getConfidenceColor(verificationResult.confidence)}>
                    {getConfidenceText(verificationResult.confidence)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="เวลาตรวจสอบ">
                  {new Date(verificationResult.timestamp).toLocaleString('th-TH')}
                </Descriptions.Item>
              </Descriptions>

              {/* Employee Details */}
              {verificationResult.employee && (
                <>
                  <Divider>ข้อมูลพนักงาน</Divider>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="รหัสพนักงาน">
                      {verificationResult.employee.employeeCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="ชื่อ-นามสกุล">
                      {verificationResult.employee.firstName} {verificationResult.employee.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="ชื่อเล่น">
                      {verificationResult.employee.nickName || 'ไม่มี'}
                    </Descriptions.Item>
                    <Descriptions.Item label="ตำแหน่ง">
                      {verificationResult.employee.position || 'ไม่ระบุ'}
                    </Descriptions.Item>
                    <Descriptions.Item label="สาขา">
                      {verificationResult.employee.affiliate || 'ไม่ระบุ'}
                    </Descriptions.Item>
                    <Descriptions.Item label="จังหวัด">
                      {verificationResult.employee.provinceId || 'ไม่ระบุ'}
                    </Descriptions.Item>
                    <Descriptions.Item label="สถานะ">
                      <Tag color={verificationResult.employee.status === 'ปกติ' ? 'green' : 'red'}>
                        {verificationResult.employee.status || 'ไม่ระบุ'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="วันที่เริ่มงาน">
                      {verificationResult.employee.startDate || 'ไม่ระบุ'}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}

              {/* Multiple Matches */}
              {verificationResult.employees && verificationResult.employees.length > 0 && (
                <>
                  <Divider>พนักงานที่พบ ({verificationResult.employees.length} คน)</Divider>
                  <Table
                    dataSource={verificationResult.employees}
                    size="small"
                    pagination={false}
                    scroll={{ y: 200 }}
                    columns={[
                      {
                        title: 'รหัสพนักงาน',
                        dataIndex: 'employeeCode',
                        key: 'employeeCode'
                      },
                      {
                        title: 'ชื่อ-นามสกุล',
                        key: 'fullName',
                        render: (_, record) => `${record.firstName} ${record.lastName || ''}`
                      },
                      {
                        title: 'ตำแหน่ง',
                        dataIndex: 'position',
                        key: 'position'
                      },
                      {
                        title: 'สาขา',
                        dataIndex: 'affiliate',
                        key: 'affiliate'
                      }
                    ]}
                  />
                </>
              )}

              {/* Suggestions */}
              {verificationResult.suggestions && verificationResult.suggestions.length > 0 && (
                <>
                  <Divider>คำแนะนำ</Divider>
                  <ul>
                    {verificationResult.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          )}

          {/* Employee Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <Card title="💡 พนักงานที่อาจเกี่ยวข้อง" size="small">
              <Table
                dataSource={suggestions}
                size="small"
                pagination={false}
                columns={[
                  {
                    title: 'รหัสพนักงาน',
                    dataIndex: 'employeeCode',
                    key: 'employeeCode'
                  },
                  {
                    title: 'ชื่อ-นามสกุล',
                    key: 'fullName',
                    render: (_, record) => `${record.firstName} ${record.lastName || ''}`
                  },
                  {
                    title: 'สาขา',
                    dataIndex: 'affiliate',
                    key: 'affiliate'
                  },
                  {
                    title: 'การกระทำ',
                    key: 'action',
                    render: (_, record) => (
                      <Button
                        size="small"
                        onClick={() => {
                          form.setFieldsValue({
                            employeeCode: record.employeeCode,
                            firstName: record.firstName,
                            lastName: record.lastName
                          });
                        }}
                      >
                        เลือก
                      </Button>
                    )
                  }
                ]}
              />
            </Card>
          )}
        </Col>
      </Row>

      {/* Test Scenarios */}
      <Card title="🎯 สถานการณ์ทดสอบแนะนำ" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Card size="small" title="✅ กรณีสำเร็จ">
              <ul style={{ fontSize: '14px', margin: 0 }}>
                <li>ใส่รหัสพนักงานที่ถูกต้อง</li>
                <li>ใส่ชื่อ-นามสกุลที่ถูกต้อง</li>
                <li>ใส่ทั้งรหัสและชื่อที่ตรงกัน</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" title="⚠️ กรณีมีข้อมูลผิด">
              <ul style={{ fontSize: '14px', margin: 0 }}>
                <li>รหัสพนักงานผิด + ชื่อถูก</li>
                <li>รหัสพนักงานถูก + ชื่อผิด</li>
                <li>ชื่อเดียวกันหลายคน</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" title="❌ กรณีไม่พบข้อมูล">
              <ul style={{ fontSize: '14px', margin: 0 }}>
                <li>รหัสพนักงานที่ไม่มีในระบบ</li>
                <li>ชื่อที่สะกดผิด</li>
                <li>ข้อมูลว่างเปล่า</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EmployeeVerificationTest; 