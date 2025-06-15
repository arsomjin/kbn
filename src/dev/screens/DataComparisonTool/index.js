// 🚀 DATA COMPARISON & TESTING TOOL
// Comprehensive tool for validating form integrations across 80+ components

import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
  Card,
  Button,
  Select,
  Table,
  Tabs,
  Alert,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Divider,
  Input,
  Form,
  Switch,
  Tooltip,
  Modal,
  Spin,
  Progress,
  notification,
  Statistic,
  Descriptions,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  SwapOutlined,
  ReloadOutlined,
  SaveOutlined,
  DiffOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  BugOutlined,
  RocketOutlined,
  DatabaseOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { FirebaseContext } from '../../../firebase';
import { usePermissions } from '../../../hooks/usePermissions';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { getBranchName, getProvinceName } from '../../../utils/mappings';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// 🔧 CONFIGURATION: Available collections and their schemas
const AVAILABLE_COLLECTIONS = {
  // Accounting Collections
  'income-daily': {
    name: 'รายรับประจำวัน',
    category: 'accounting',
    fields: [
      'incomeId',
      'customerName',
      'amount',
      'date',
      'provinceId',
      'branchCode',
      'category',
      'description',
    ],
    keyField: 'incomeId',
    searchFields: ['incomeId', 'customerName'],
    requiredFields: [
      'incomeId',
      'customerName',
      'amount',
      'provinceId',
      'branchCode',
    ],
  },
  'expense-daily': {
    name: 'รายจ่ายประจำวัน',
    category: 'accounting',
    fields: [
      'expenseId',
      'description',
      'amount',
      'date',
      'provinceId',
      'branchCode',
      'category',
    ],
    keyField: 'expenseId',
    searchFields: ['expenseId', 'description'],
    requiredFields: [
      'expenseId',
      'description',
      'amount',
      'provinceId',
      'branchCode',
    ],
  },

  // Sales Collections
  'sale-orders': {
    name: 'ใบสั่งขาย',
    category: 'sales',
    fields: [
      'saleOrderNumber',
      'customerName',
      'totalAmount',
      'date',
      'provinceId',
      'branchCode',
      'status',
    ],
    keyField: 'saleOrderNumber',
    searchFields: ['saleOrderNumber', 'customerName'],
    requiredFields: [
      'saleOrderNumber',
      'customerName',
      'totalAmount',
      'provinceId',
      'branchCode',
    ],
  },
  bookings: {
    name: 'การจอง',
    category: 'sales',
    fields: [
      'bookingId',
      'customerName',
      'vehicleModel',
      'date',
      'provinceId',
      'branchCode',
      'status',
    ],
    keyField: 'bookingId',
    searchFields: ['bookingId', 'customerName'],
    requiredFields: [
      'bookingId',
      'customerName',
      'vehicleModel',
      'provinceId',
      'branchCode',
    ],
  },

  // Service Collections
  'service-orders': {
    name: 'ใบสั่งซ่อม',
    category: 'service',
    fields: [
      'serviceOrderNumber',
      'customerName',
      'vehicleNumber',
      'date',
      'provinceId',
      'branchCode',
      'status',
    ],
    keyField: 'serviceOrderNumber',
    searchFields: ['serviceOrderNumber', 'customerName', 'vehicleNumber'],
    requiredFields: [
      'serviceOrderNumber',
      'customerName',
      'vehicleNumber',
      'provinceId',
      'branchCode',
    ],
  },

  // Inventory Collections
  'parts-inventory': {
    name: 'คลังอะไหล่',
    category: 'inventory',
    fields: ['partNumber', 'partName', 'quantity', 'provinceId', 'branchCode'],
    keyField: 'partNumber',
    searchFields: ['partNumber', 'partName'],
  },
  'vehicles-inventory': {
    name: 'คลังรถ',
    category: 'inventory',
    fields: ['chassisNumber', 'model', 'color', 'provinceId', 'branchCode'],
    keyField: 'chassisNumber',
    searchFields: ['chassisNumber', 'model'],
  },
};

// 🔧 UTILITY: Deep comparison function
const deepCompare = (obj1, obj2, path = '') => {
  const differences = [];

  const compare = (a, b, currentPath) => {
    if (a === b) return;

    if (typeof a !== typeof b) {
      differences.push({
        path: currentPath,
        type: 'type_change',
        original: a,
        modified: b,
        originalType: typeof a,
        modifiedType: typeof b,
      });
      return;
    }

    if (a === null || b === null) {
      differences.push({
        path: currentPath,
        type: 'null_change',
        original: a,
        modified: b,
      });
      return;
    }

    if (typeof a === 'object' && !Array.isArray(a)) {
      const allKeys = new Set([
        ...Object.keys(a || {}),
        ...Object.keys(b || {}),
      ]);

      for (const key of allKeys) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;

        if (!(key in (a || {}))) {
          differences.push({
            path: newPath,
            type: 'added',
            original: undefined,
            modified: b[key],
          });
        } else if (!(key in (b || {}))) {
          differences.push({
            path: newPath,
            type: 'removed',
            original: a[key],
            modified: undefined,
          });
        } else {
          compare(a[key], b[key], newPath);
        }
      }
    } else {
      differences.push({
        path: currentPath,
        type: 'value_change',
        original: a,
        modified: b,
      });
    }
  };

  compare(obj1, obj2, path);
  return differences;
};

// 🔧 UTILITY: Format value for display
const formatValue = (value, field) => {
  if (value === null || value === undefined) return 'ไม่ระบุ';

  // Date formatting
  if (
    field?.includes('date') ||
    field?.includes('Date') ||
    dayjs.isDayjs(value)
  ) {
    try {
      return dayjs(value).format('DD/MM/YYYY HH:mm');
    } catch {
      return value;
    }
  }

  // Geographic formatting
  if (field === 'provinceId') {
    return `${getProvinceName(value)} (${value})`;
  }

  if (field === 'branchCode') {
    return `${getBranchName(value)} (${value})`;
  }

  // Number formatting
  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  return String(value);
};

const DataComparisonTool = () => {
  const [selectedCollection, setSelectedCollection] = useState('income-daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [modifiedData, setModifiedData] = useState(null);
  const [differences, setDifferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('search');

  // Firebase and RBAC context
  const { firestore } = useContext(FirebaseContext);
  const { hasPermission, userRBAC } = usePermissions();
  const { user } = useSelector((state) => state.auth);

  // 🚀 SEARCH: Fetch data from selected collection
  const searchData = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);

    try {
      const collection = AVAILABLE_COLLECTIONS[selectedCollection];
      const collectionRef = firestore.collection(selectedCollection);

      // Build search query
      let query = collectionRef.limit(50);

      // Apply geographic filtering based on RBAC
      if (userRBAC?.allowedProvinces?.length > 0) {
        query = query.where('provinceId', 'in', userRBAC.allowedProvinces);
      }

      const snapshot = await query.get();
      const results = [];

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };

        // Client-side search filtering
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = collection.searchFields.some((field) =>
          data[field]?.toString().toLowerCase().includes(searchLower)
        );

        if (matchesSearch) {
          results.push(data);
        }
      });

      setSearchResults(results);

      notification.success({
        message: 'ค้นหาสำเร็จ',
        description: `พบข้อมูล ${results.length} รายการ`,
      });
    } catch (error) {
      console.error('Search error:', error);
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถค้นหาข้อมูลได้',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCollection, searchTerm, firestore, userRBAC]);

  // 🚀 LOAD: Load selected record into form
  const loadRecordToForm = useCallback(
    (record) => {
      setSelectedRecord(record);
      setOriginalData({ ...record });
      setModifiedData(null);
      setDifferences([]);

      // Load data into form
      form.setFieldsValue(record);

      // Switch to form tab
      setActiveTab('form');

      notification.info({
        message: 'โหลดข้อมูลสำเร็จ',
        description: `โหลดข้อมูล ${record[AVAILABLE_COLLECTIONS[selectedCollection].keyField]} เรียบร้อย`,
      });
    },
    [selectedCollection, form]
  );

  // 🚀 COMPARE: Compare form data with original
  const compareData = useCallback(() => {
    if (!originalData) {
      notification.warning({
        message: 'ไม่มีข้อมูลต้นฉบับ',
        description: 'กรุณาเลือกข้อมูลที่ต้องการเปรียบเทียบก่อน',
      });
      return;
    }

    setComparing(true);

    try {
      const formData = form.getFieldsValue();
      setModifiedData({ ...formData });

      // Perform deep comparison
      const diffs = deepCompare(originalData, formData);
      setDifferences(diffs);

      // Generate test results
      const results = {
        id: `test-${Date.now()}`,
        timestamp: new Date().toISOString(),
        collection: selectedCollection,
        recordId: originalData.id,
        totalChanges: diffs.length,
        changes: diffs,
        status: diffs.length === 0 ? 'identical' : 'modified',
        originalData: { ...originalData },
        modifiedData: { ...formData },
      };

      setTestResults((prev) => [results, ...prev.slice(0, 9)]); // Keep last 10 results

      // Switch to comparison tab
      setActiveTab('comparison');

      notification.success({
        message: 'เปรียบเทียบสำเร็จ',
        description: `พบความแตกต่าง ${diffs.length} จุด`,
      });
    } catch (error) {
      console.error('Comparison error:', error);
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเปรียบเทียบข้อมูลได้',
      });
    } finally {
      setComparing(false);
    }
  }, [originalData, form, selectedCollection]);

  // 🚀 SAVE: Simulate save operation (for testing)
  const simulateSave = useCallback(async () => {
    if (!modifiedData) {
      notification.warning({
        message: 'ไม่มีข้อมูลที่แก้ไข',
        description: 'กรุณาแก้ไขข้อมูลและเปรียบเทียบก่อน',
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      notification.success({
        message: 'จำลองการบันทึกสำเร็จ',
        description: 'ข้อมูลถูกบันทึกเรียบร้อย (จำลอง)',
      });
    } catch (error) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกข้อมูลได้',
      });
    } finally {
      setLoading(false);
    }
  }, [modifiedData]);

  // 🚀 EXPORT: Export test results
  const exportResults = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      collection: selectedCollection,
      testResults,
      summary: {
        totalTests: testResults.length,
        identicalTests: testResults.filter((r) => r.status === 'identical')
          .length,
        modifiedTests: testResults.filter((r) => r.status === 'modified')
          .length,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-comparison-${selectedCollection}-${dayjs().format('YYYY-MM-DD-HH-mm')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    notification.success({
      message: 'ส่งออกสำเร็จ',
      description: 'ไฟล์ผลการทดสอบถูกดาวน์โหลดเรียบร้อย',
    });
  }, [selectedCollection, testResults]);

  // 🎨 RENDER: Search results table columns
  const searchColumns = [
    {
      title: 'รหัส',
      dataIndex: AVAILABLE_COLLECTIONS[selectedCollection]?.keyField,
      key: 'key',
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'ข้อมูลหลัก',
      key: 'main',
      render: (_, record) => {
        const collection = AVAILABLE_COLLECTIONS[selectedCollection];
        const mainField =
          collection.searchFields[1] || collection.searchFields[0];
        return <Text>{record[mainField]}</Text>;
      },
    },
    {
      title: 'จังหวัด',
      dataIndex: 'provinceId',
      key: 'province',
      width: 120,
      render: (provinceId) => (
        <Tag color='blue'>{getProvinceName(provinceId)}</Tag>
      ),
    },
    {
      title: 'สาขา',
      dataIndex: 'branchCode',
      key: 'branch',
      width: 120,
      render: (branchCode) => (
        <Tag color='green'>{getBranchName(branchCode)}</Tag>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          type='primary'
          size='small'
          icon={<UploadOutlined />}
          onClick={() => loadRecordToForm(record)}
        >
          โหลด
        </Button>
      ),
    },
  ];

  // 🎨 RENDER: Differences table columns
  const diffColumns = [
    {
      title: 'ฟิลด์',
      dataIndex: 'path',
      key: 'path',
      width: 150,
      render: (path) => <Text code>{path}</Text>,
    },
    {
      title: 'ประเภท',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeConfig = {
          value_change: { color: 'orange', text: 'แก้ไขค่า' },
          added: { color: 'green', text: 'เพิ่ม' },
          removed: { color: 'red', text: 'ลบ' },
          type_change: { color: 'purple', text: 'เปลี่ยนประเภท' },
          null_change: { color: 'gray', text: 'เปลี่ยน null' },
        };
        const config = typeConfig[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'ค่าเดิม',
      dataIndex: 'original',
      key: 'original',
      render: (value, record) => (
        <Text type='secondary'>{formatValue(value, record.path)}</Text>
      ),
    },
    {
      title: 'ค่าใหม่',
      dataIndex: 'modified',
      key: 'modified',
      render: (value, record) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatValue(value, record.path)}
        </Text>
      ),
    },
  ];

  return (
    <div className='data-comparison-tool'>
      <Card>
        <div className='mb-4'>
          <Title level={2}>
            <RocketOutlined className='mr-2' />
            Data Comparison & Testing Tool
          </Title>
          <Paragraph>
            เครื่องมือสำหรับทดสอบและเปรียบเทียบข้อมูลในระบบ RBAC ใหม่
            ช่วยให้การทดสอบ 80+ components เป็นไปอย่างมีประสิทธิภาพ
          </Paragraph>

          {/* Quick Stats */}
          <Row gutter={16} className='mb-4'>
            <Col span={6}>
              <Statistic
                title='Collections Available'
                value={Object.keys(AVAILABLE_COLLECTIONS).length}
                prefix={<DatabaseOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title='Test Results'
                value={testResults.length}
                prefix={<FileTextOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title='Current User'
                value={user?.displayName || 'Unknown'}
                prefix={<InfoCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Button
                type='primary'
                icon={<DownloadOutlined />}
                onClick={exportResults}
                disabled={testResults.length === 0}
                block
              >
                Export Results
              </Button>
            </Col>
          </Row>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} type='card'>
          {/* 🔍 SEARCH TAB */}
          <TabPane
            tab={
              <span>
                <SearchOutlined />
                ค้นหาข้อมูล
              </span>
            }
            key='search'
          >
            <Row gutter={16} className='mb-4'>
              <Col span={8}>
                <Select
                  value={selectedCollection}
                  onChange={setSelectedCollection}
                  style={{ width: '100%' }}
                  placeholder='เลือก Collection'
                >
                  {Object.entries(AVAILABLE_COLLECTIONS).map(
                    ([key, config]) => (
                      <Option key={key} value={key}>
                        <Tag color='blue'>{config.category}</Tag>
                        {config.name}
                      </Option>
                    )
                  )}
                </Select>
              </Col>
              <Col span={12}>
                <Input.Search
                  placeholder='ค้นหาข้อมูล...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onSearch={searchData}
                  loading={loading}
                />
              </Col>
              <Col span={4}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={searchData}
                  loading={loading}
                  block
                >
                  ค้นหา
                </Button>
              </Col>
            </Row>

            <Table
              columns={searchColumns}
              dataSource={searchResults}
              rowKey='id'
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </TabPane>

          {/* 📝 FORM TAB */}
          <TabPane
            tab={
              <span>
                <BugOutlined />
                แก้ไขข้อมูล
              </span>
            }
            key='form'
          >
            {selectedRecord ? (
              <div>
                <Alert
                  message={`กำลังแก้ไข: ${selectedRecord[AVAILABLE_COLLECTIONS[selectedCollection]?.keyField]}`}
                  type='info'
                  showIcon
                  className='mb-4'
                />

                <Form form={form} layout='vertical' onFinish={simulateSave}>
                  <Row gutter={16}>
                    {AVAILABLE_COLLECTIONS[selectedCollection]?.fields.map(
                      (field) => (
                        <Col span={12} key={field}>
                          <Form.Item
                            name={field}
                            label={field}
                            rules={
                              AVAILABLE_COLLECTIONS[
                                selectedCollection
                              ]?.requiredFields.includes(field)
                                ? [
                                    {
                                      required: true,
                                      message: `กรุณากรอก ${field}`,
                                    },
                                  ]
                                : []
                            }
                          >
                            {field === 'provinceId' ? (
                              <Select placeholder='เลือกจังหวัด'>
                                <Option value='nakhon-ratchasima'>
                                  นครราชสีมา
                                </Option>
                                <Option value='nakhon-sawan'>นครสวรรค์</Option>
                              </Select>
                            ) : field === 'branchCode' ? (
                              <Select placeholder='เลือกสาขา'>
                                <Option value='0450'>สำนักงานใหญ่</Option>
                                <Option value='NMA002'>สาขาโชคชัย</Option>
                                <Option value='NMA003'>สาขาปากช่อง</Option>
                                <Option value='NSN001'>สาขานครสวรรค์</Option>
                                <Option value='NSN002'>สาขาตาคลี</Option>
                                <Option value='NSN003'>สาขาบรรพตพิสัย</Option>
                              </Select>
                            ) : field.includes('date') ? (
                              <Input type='datetime-local' />
                            ) : field.includes('amount') ||
                              field.includes('Amount') ? (
                              <Input
                                type='number'
                                placeholder={`กรอก ${field}`}
                              />
                            ) : (
                              <Input placeholder={`กรอก ${field}`} />
                            )}
                          </Form.Item>
                        </Col>
                      )
                    )}
                  </Row>

                  <Space>
                    <Button
                      type='primary'
                      icon={<SwapOutlined />}
                      onClick={compareData}
                      loading={comparing}
                    >
                      เปรียบเทียบ
                    </Button>
                    <Button
                      icon={<SaveOutlined />}
                      onClick={simulateSave}
                      loading={loading}
                      disabled={!modifiedData}
                    >
                      จำลองบันทึก
                    </Button>
                  </Space>
                </Form>
              </div>
            ) : (
              <Alert
                message='ไม่มีข้อมูลที่เลือก'
                description="กรุณาเลือกข้อมูลจากแท็บ 'ค้นหาข้อมูล' ก่อน"
                type='warning'
                showIcon
              />
            )}
          </TabPane>

          {/* 🔍 COMPARISON TAB */}
          <TabPane
            tab={
              <span>
                <DiffOutlined />
                ผลการเปรียบเทียบ
              </span>
            }
            key='comparison'
          >
            {differences.length > 0 ? (
              <div>
                <Alert
                  message={`พบความแตกต่าง ${differences.length} จุด`}
                  type={differences.length === 0 ? 'success' : 'warning'}
                  showIcon
                  className='mb-4'
                />

                <Table
                  columns={diffColumns}
                  dataSource={differences}
                  rowKey={(record, index) => `${record.path}-${index}`}
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 800 }}
                />
              </div>
            ) : (
              <Alert
                message='ยังไม่มีการเปรียบเทียบ'
                description="กรุณาแก้ไขข้อมูลและกดปุ่ม 'เปรียบเทียบ' ในแท็บ 'แก้ไขข้อมูล'"
                type='info'
                showIcon
              />
            )}
          </TabPane>

          {/* 📊 RESULTS TAB */}
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                ประวัติการทดสอบ
              </span>
            }
            key='results'
          >
            {testResults.length > 0 ? (
              <div>
                <div className='mb-4'>
                  <Text strong>
                    ประวัติการทดสอบ ({testResults.length} ครั้ง)
                  </Text>
                </div>

                {testResults.map((result, index) => (
                  <Card key={result.id} size='small' className='mb-2'>
                    <Row justify='space-between' align='middle'>
                      <Col>
                        <Space>
                          <Badge
                            status={
                              result.status === 'identical'
                                ? 'success'
                                : 'warning'
                            }
                            text={
                              result.status === 'identical'
                                ? 'เหมือนกัน'
                                : 'มีการเปลี่ยนแปลง'
                            }
                          />
                          <Text strong>
                            {AVAILABLE_COLLECTIONS[result.collection]?.name}
                          </Text>
                          <Text>ID: {result.recordId}</Text>
                        </Space>
                      </Col>
                      <Col>
                        <Space>
                          <Text type='secondary'>
                            {dayjs(result.timestamp).format('DD/MM/YYYY HH:mm')}
                          </Text>
                          <Tag>{result.totalChanges} การเปลี่ยนแปลง</Tag>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert
                message='ยังไม่มีประวัติการทดสอบ'
                description='เริ่มทดสอบโดยการค้นหา โหลด แก้ไข และเปรียบเทียบข้อมูล'
                type='info'
                showIcon
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DataComparisonTool;
