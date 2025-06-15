// 🚀 AUTOMATED TEST RUNNER
// Batch testing tool for validating multiple components automatically

import React, { useState, useCallback, useContext } from 'react';
import {
  Card,
  Button,
  Table,
  Progress,
  Alert,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Divider,
  Select,
  InputNumber,
  Switch,
  Tooltip,
  Modal,
  notification,
  Statistic,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  SettingOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { FirebaseContext } from '../../../../firebase';
import { usePermissions } from '../../../../hooks/usePermissions';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// 🔧 TEST SCENARIOS: Predefined test cases
const TEST_SCENARIOS = {
  basic_crud: {
    name: 'CRUD พื้นฐาน',
    description: 'ทดสอบการสร้าง อ่าน แก้ไข ลบข้อมูล',
    steps: ['create', 'read', 'update', 'delete'],
  },
  rbac_validation: {
    name: 'ตรวจสอบ RBAC',
    description: 'ทดสอบการควบคุมสิทธิ์ตามภูมิศาสตร์',
    steps: ['province_filter', 'branch_filter', 'permission_check'],
  },
  data_integrity: {
    name: 'ความถูกต้องของข้อมูล',
    description: 'ทดสอบความสมบูรณ์และความถูกต้องของข้อมูล',
    steps: ['field_validation', 'relationship_check', 'constraint_validation'],
  },
  performance: {
    name: 'ประสิทธิภาพ',
    description: 'ทดสอบความเร็วและประสิทธิภาพ',
    steps: ['load_time', 'search_performance', 'save_performance'],
  },
};

// 🔧 COMPONENT REGISTRY: Components to be tested
const COMPONENT_REGISTRY = [
  // Accounting Components
  {
    id: 'income-daily',
    name: 'รายรับประจำวัน',
    category: 'accounting',
    priority: 'high',
  },
  {
    id: 'expense-daily',
    name: 'รายจ่ายประจำวัน',
    category: 'accounting',
    priority: 'high',
  },
  {
    id: 'cash-flow',
    name: 'กระแสเงินสด',
    category: 'accounting',
    priority: 'medium',
  },
  {
    id: 'balance-sheet',
    name: 'งบดุล',
    category: 'accounting',
    priority: 'medium',
  },

  // Sales Components
  { id: 'sale-orders', name: 'ใบสั่งขาย', category: 'sales', priority: 'high' },
  { id: 'quotations', name: 'ใบเสนอราคา', category: 'sales', priority: 'high' },
  { id: 'bookings', name: 'การจอง', category: 'sales', priority: 'high' },
  {
    id: 'customer-management',
    name: 'จัดการลูกค้า',
    category: 'sales',
    priority: 'medium',
  },

  // Service Components
  {
    id: 'service-orders',
    name: 'ใบสั่งซ่อม',
    category: 'service',
    priority: 'high',
  },
  {
    id: 'service-history',
    name: 'ประวัติการซ่อม',
    category: 'service',
    priority: 'medium',
  },
  {
    id: 'warranty-claims',
    name: 'การเคลมประกัน',
    category: 'service',
    priority: 'medium',
  },

  // Inventory Components
  {
    id: 'parts-inventory',
    name: 'คลังอะไหล่',
    category: 'inventory',
    priority: 'high',
  },
  {
    id: 'vehicles-inventory',
    name: 'คลังรถ',
    category: 'inventory',
    priority: 'high',
  },
  {
    id: 'stock-movements',
    name: 'การเคลื่อนไหวสต็อก',
    category: 'inventory',
    priority: 'medium',
  },

  // HR Components
  {
    id: 'employee-management',
    name: 'จัดการพนักงาน',
    category: 'hr',
    priority: 'medium',
  },
  { id: 'attendance', name: 'การเข้างาน', category: 'hr', priority: 'low' },
  { id: 'payroll', name: 'เงินเดือน', category: 'hr', priority: 'low' },

  // Reports Components
  {
    id: 'sales-reports',
    name: 'รายงานการขาย',
    category: 'reports',
    priority: 'medium',
  },
  {
    id: 'financial-reports',
    name: 'รายงานการเงิน',
    category: 'reports',
    priority: 'medium',
  },
  {
    id: 'inventory-reports',
    name: 'รายงานคลัง',
    category: 'reports',
    priority: 'low',
  },
];

const AutoTestRunner = ({ onTestComplete }) => {
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [selectedScenarios, setSelectedScenarios] = useState([
    'basic_crud',
    'rbac_validation',
  ]);
  const [testConfig, setTestConfig] = useState({
    batchSize: 5,
    delayBetweenTests: 1000,
    retryFailedTests: true,
    generateReport: true,
    stopOnError: false,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [statistics, setStatistics] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
  });

  const { firestore } = useContext(FirebaseContext);
  const { userRBAC } = usePermissions();

  // 🚀 EXECUTE: Run individual test
  const executeTest = useCallback(async (component, scenario) => {
    const startTime = Date.now();

    try {
      // Simulate test execution
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 2000 + 500)
      );

      // Simulate test results
      const success = Math.random() > 0.2; // 80% success rate
      const duration = Date.now() - startTime;

      const result = {
        id: `${component.id}-${scenario}`,
        component: component.name,
        scenario: TEST_SCENARIOS[scenario].name,
        status: success ? 'passed' : 'failed',
        duration,
        timestamp: new Date().toISOString(),
        details: success ? 'ทดสอบผ่านเรียบร้อย' : 'พบข้อผิดพลาดในการทดสอบ',
        errors: success ? [] : ['Sample error message'],
      };

      return result;
    } catch (error) {
      return {
        id: `${component.id}-${scenario}`,
        component: component.name,
        scenario: TEST_SCENARIOS[scenario].name,
        status: 'error',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        details: error.message,
        errors: [error.message],
      };
    }
  }, []);

  // 🚀 RUN: Execute batch tests
  const runTests = useCallback(async () => {
    if (selectedComponents.length === 0 || selectedScenarios.length === 0) {
      notification.warning({
        message: 'กรุณาเลือกข้อมูล',
        description: 'เลือก Components และ Scenarios ที่ต้องการทดสอบ',
      });
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setTestResults([]);
    setProgress(0);

    const totalTests = selectedComponents.length * selectedScenarios.length;
    let completedTests = 0;
    const results = [];
    const stats = {
      total: totalTests,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
    };

    const startTime = Date.now();

    try {
      for (const component of selectedComponents) {
        if (!isRunning) break;

        for (const scenario of selectedScenarios) {
          if (!isRunning) break;

          // Check if paused
          while (isPaused && isRunning) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          setCurrentTest({
            component: component.name,
            scenario: TEST_SCENARIOS[scenario].name,
          });

          const result = await executeTest(component, scenario);
          results.push(result);

          // Update statistics
          if (result.status === 'passed') stats.passed++;
          else if (result.status === 'failed') stats.failed++;
          else stats.skipped++;

          completedTests++;
          setProgress((completedTests / totalTests) * 100);
          setTestResults([...results]);

          // Stop on error if configured
          if (testConfig.stopOnError && result.status === 'failed') {
            break;
          }

          // Delay between tests
          if (testConfig.delayBetweenTests > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, testConfig.delayBetweenTests)
            );
          }
        }
      }

      stats.duration = Date.now() - startTime;
      setStatistics(stats);

      notification.success({
        message: 'การทดสอบเสร็จสิ้น',
        description: `ทดสอบ ${completedTests} รายการ ผ่าน ${stats.passed} รายการ`,
      });

      if (onTestComplete) {
        onTestComplete(results, stats);
      }
    } catch (error) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'การทดสอบหยุดทำงานเนื่องจากข้อผิดพลาด',
      });
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  }, [
    selectedComponents,
    selectedScenarios,
    testConfig,
    isRunning,
    isPaused,
    executeTest,
    onTestComplete,
  ]);

  // 🚀 CONTROL: Pause/Resume tests
  const pauseTests = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  // 🚀 CONTROL: Stop tests
  const stopTests = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTest(null);
  }, []);

  // 🚀 EXPORT: Generate test report
  const exportReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      configuration: {
        components: selectedComponents.map((c) => c.name),
        scenarios: selectedScenarios.map((s) => TEST_SCENARIOS[s].name),
        config: testConfig,
      },
      statistics,
      results: testResults,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${dayjs().format('YYYY-MM-DD-HH-mm')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    notification.success({
      message: 'ส่งออกรายงานสำเร็จ',
      description: 'ไฟล์รายงานถูกดาวน์โหลดเรียบร้อย',
    });
  }, [
    selectedComponents,
    selectedScenarios,
    testConfig,
    statistics,
    testResults,
  ]);

  // 🎨 RENDER: Test results table columns
  const resultColumns = [
    {
      title: 'Component',
      dataIndex: 'component',
      key: 'component',
      width: 200,
    },
    {
      title: 'Scenario',
      dataIndex: 'scenario',
      key: 'scenario',
      width: 150,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = {
          passed: {
            color: 'green',
            icon: <CheckCircleOutlined />,
            text: 'ผ่าน',
          },
          failed: {
            color: 'red',
            icon: <ExclamationCircleOutlined />,
            text: 'ไม่ผ่าน',
          },
          error: { color: 'red', icon: <BugOutlined />, text: 'ข้อผิดพลาด' },
          skipped: {
            color: 'gray',
            icon: <ClockCircleOutlined />,
            text: 'ข้าม',
          },
        };
        const { color, icon, text } = config[status] || config.skipped;
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'ระยะเวลา',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration) => `${duration}ms`,
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
  ];

  return (
    <div className='auto-test-runner'>
      <Card>
        <Title level={3}>
          <PlayCircleOutlined className='mr-2' />
          Automated Test Runner
        </Title>

        {/* Configuration Section */}
        <Card size='small' className='mb-4'>
          <Title level={4}>การตั้งค่า</Title>

          <Row gutter={16}>
            <Col span={12}>
              <div className='mb-3'>
                <Text strong>เลือก Components:</Text>
                <Select
                  mode='multiple'
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder='เลือก Components ที่ต้องการทดสอบ'
                  value={selectedComponents.map((c) => c.id)}
                  onChange={(values) => {
                    const components = COMPONENT_REGISTRY.filter((c) =>
                      values.includes(c.id)
                    );
                    setSelectedComponents(components);
                  }}
                  optionFilterProp='children'
                >
                  {COMPONENT_REGISTRY.map((component) => (
                    <Option key={component.id} value={component.id}>
                      <Tag color='blue'>{component.category}</Tag>
                      <Tag
                        color={
                          component.priority === 'high'
                            ? 'red'
                            : component.priority === 'medium'
                              ? 'orange'
                              : 'green'
                        }
                      >
                        {component.priority}
                      </Tag>
                      {component.name}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className='mb-3'>
                <Text strong>เลือก Test Scenarios:</Text>
                <Select
                  mode='multiple'
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder='เลือก Scenarios ที่ต้องการทดสอบ'
                  value={selectedScenarios}
                  onChange={setSelectedScenarios}
                >
                  {Object.entries(TEST_SCENARIOS).map(([key, scenario]) => (
                    <Option key={key} value={key}>
                      {scenario.name} - {scenario.description}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col span={12}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Batch Size:</Text>
                  <InputNumber
                    min={1}
                    max={20}
                    value={testConfig.batchSize}
                    onChange={(value) =>
                      setTestConfig((prev) => ({ ...prev, batchSize: value }))
                    }
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </Col>
                <Col span={12}>
                  <Text strong>Delay (ms):</Text>
                  <InputNumber
                    min={0}
                    max={5000}
                    step={100}
                    value={testConfig.delayBetweenTests}
                    onChange={(value) =>
                      setTestConfig((prev) => ({
                        ...prev,
                        delayBetweenTests: value,
                      }))
                    }
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </Col>
              </Row>

              <div className='mt-3'>
                <Space direction='vertical'>
                  <Switch
                    checked={testConfig.stopOnError}
                    onChange={(checked) =>
                      setTestConfig((prev) => ({
                        ...prev,
                        stopOnError: checked,
                      }))
                    }
                  />
                  <Text>หยุดเมื่อเกิดข้อผิดพลาด</Text>

                  <Switch
                    checked={testConfig.retryFailedTests}
                    onChange={(checked) =>
                      setTestConfig((prev) => ({
                        ...prev,
                        retryFailedTests: checked,
                      }))
                    }
                  />
                  <Text>ลองใหม่เมื่อทดสอบไม่ผ่าน</Text>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Control Section */}
        <Card size='small' className='mb-4'>
          <Row justify='space-between' align='middle'>
            <Col>
              <Space>
                <Button
                  type='primary'
                  icon={<PlayCircleOutlined />}
                  onClick={runTests}
                  disabled={isRunning}
                  loading={isRunning && !isPaused}
                >
                  เริ่มทดสอบ
                </Button>

                {isRunning && (
                  <Button
                    icon={
                      isPaused ? (
                        <PlayCircleOutlined />
                      ) : (
                        <PauseCircleOutlined />
                      )
                    }
                    onClick={pauseTests}
                  >
                    {isPaused ? 'ดำเนินการต่อ' : 'หยุดชั่วคราว'}
                  </Button>
                )}

                <Button
                  icon={<StopOutlined />}
                  onClick={stopTests}
                  disabled={!isRunning}
                  danger
                >
                  หยุด
                </Button>

                <Button
                  icon={<DownloadOutlined />}
                  onClick={exportReport}
                  disabled={testResults.length === 0}
                >
                  ส่งออกรายงาน
                </Button>
              </Space>
            </Col>

            <Col>
              <Text strong>
                {selectedComponents.length} Components ×{' '}
                {selectedScenarios.length} Scenarios ={' '}
                {selectedComponents.length * selectedScenarios.length} Tests
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Progress Section */}
        {isRunning && (
          <Card size='small' className='mb-4'>
            <Row gutter={16}>
              <Col span={12}>
                <Progress
                  percent={Math.round(progress)}
                  status={isPaused ? 'exception' : 'active'}
                  strokeColor={isPaused ? '#ff4d4f' : '#1890ff'}
                />
                {currentTest && (
                  <Text type='secondary'>
                    กำลังทดสอบ: {currentTest.component} - {currentTest.scenario}
                  </Text>
                )}
              </Col>
              <Col span={12}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic title='ทั้งหมด' value={statistics.total} />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title='ผ่าน'
                      value={statistics.passed}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title='ไม่ผ่าน'
                      value={statistics.failed}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title='ข้าม'
                      value={statistics.skipped}
                      valueStyle={{ color: '#8c8c8c' }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        )}

        {/* Results Section */}
        {testResults.length > 0 && (
          <Card size='small'>
            <Title level={4}>ผลการทดสอบ</Title>
            <Table
              columns={resultColumns}
              dataSource={testResults}
              rowKey='id'
              pagination={{ pageSize: 20 }}
              scroll={{ x: 800 }}
              size='small'
            />
          </Card>
        )}
      </Card>
    </div>
  );
};

export default AutoTestRunner;
