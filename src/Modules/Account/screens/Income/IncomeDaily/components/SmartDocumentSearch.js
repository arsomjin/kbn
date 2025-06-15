// Smart Document Search with Geographic Filtering

import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
  Card,
  Input,
  Table,
  Button,
  Space,
  Alert,
  Typography,
  Row,
  Col,
  Tag,
  Tooltip,
  Select,
  Tabs,
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import { usePermissions } from '../../../../../../hooks/usePermissions';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { FirebaseContext } from '../../../../../../firebase';
import { searchAccountingDocuments, searchSaleDocuments } from '../api';
// 🔧 ENHANCED: Import branch and date formatting utilities
import {
  getBranchName,
  getBranchDetails,
} from '../../../../../../utils/mappings';
import { IncomeDailyCategories } from '../../../../../../data/Constant';

const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// 🚀 DEBUG: Enhanced logging utility
const debugLog = (component, action, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 [${component}] ${action}`);
    console.log('📊 Data:', data);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};

// 🔧 ENHANCED: Utility functions for data formatting
const formatDateSafely = (dateValue) => {
  if (!dateValue) return 'ไม่ระบุวันที่';

  try {
    if (dayjs.isDayjs(dateValue)) {
      return dateValue.format('DD/MM/YYYY');
    }

    const parsed = dayjs(dateValue);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : 'ไม่ระบุวันที่';
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'ไม่ระบุวันที่';
  }
};

const formatBranchDisplay = (branchCode, showCode = true) => {
  if (!branchCode) return 'ไม่ระบุสาขา';

  try {
    const branchDetails = getBranchDetails(branchCode);
    if (branchDetails) {
      return showCode
        ? `${branchDetails.branchName} (${branchCode})`
        : branchDetails.branchName;
    }

    const branchName = getBranchName(branchCode);
    if (branchName && branchName !== 'ไม่ระบุ') {
      return showCode ? `${branchName} (${branchCode})` : branchName;
    }

    return branchCode;
  } catch (error) {
    console.warn('Branch formatting error:', error);
    return branchCode;
  }
};

// 🔧 ENHANCED: Category mapping for filtering
const getCategoryFromType = (category) => {
  const categoryMap = {
    vehicles: 'vehicles',
    service: 'service',
    parts: 'parts',
    other: 'other',
  };
  return categoryMap[category] || null;
};

const SmartDocumentSearch = ({
  onDocumentSelect,
  onSaleDocumentSelect,
  category,
  onCategoryChange,
  documentType = 'accounting', // 'accounting' or 'sale'
  placeholder = 'ค้นหาเอกสาร',
  showCreateButton = true,
  onCreateNew,
  enableDebugMode = process.env.NODE_ENV === 'development',
  title = 'เอกสาร', // Display title for the search
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountingResults, setAccountingResults] = useState([]);
  const [saleResults, setSaleResults] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('accounting');

  // Firebase and RBAC context
  const { firestore } = useContext(FirebaseContext);
  const { hasPermission, userRBAC, getGeographicContext } = usePermissions();
  const { user } = useSelector((state) => state.auth);

  // 🚀 DEBUG: Component initialization
  useEffect(() => {
    debugLog('SmartDocumentSearch', 'Component Initialized', {
      documentType,
      category,
      user: user?.displayName || user?.uid,
      permissions: {
        view: hasPermission('accounting.view'),
        edit: hasPermission('accounting.edit'),
      },
      geographicFilters: getGeographicContext(),
    });
  }, [category]);

  // 🚀 ENHANCED: Search documents with category filtering
  const performSearch = useCallback(
    async (term) => {
      if (!term || term.length < 2) {
        setAccountingResults([]);
        setSaleResults([]);
        return;
      }

      setLoading(true);
      debugLog('SmartDocumentSearch', 'Search Started', {
        searchTerm: term,
        category,
        documentType,
        geographicFilters: getGeographicContext(),
        userRBAC: {
          authority: userRBAC?.authority,
          geographic: userRBAC?.geographic,
          allowedProvinces: userRBAC?.allowedProvinces,
          allowedBranches: userRBAC?.allowedBranches,
          isDev: userRBAC?.isDev,
        },
      });

      try {
        // 🔧 ENHANCED: Pass category for filtering
        const searchOptions = {
          category: getCategoryFromType(category),
          userRBAC,
          firestore,
        };

        // Search both accounting and sale documents with category filtering
        const [accountingDocs, saleDocs] = await Promise.all([
          searchAccountingDocuments(
            term,
            searchOptions.userRBAC,
            searchOptions.firestore,
            searchOptions.category
          ),
          searchSaleDocuments(
            term,
            searchOptions.userRBAC,
            searchOptions.firestore,
            searchOptions.category
          ),
        ]);

        // 🔧 ENHANCED: Client-side filtering by category if needed
        let filteredAccountingDocs = accountingDocs;
        let filteredSaleDocs = saleDocs;

        if (category && getCategoryFromType(category)) {
          const targetCategory = getCategoryFromType(category);

          filteredAccountingDocs = accountingDocs.filter(
            (doc) => doc.incomeSubCategory === targetCategory
          );

          // For sale documents, we might need different filtering logic
          // depending on how sale documents relate to income categories
          filteredSaleDocs = saleDocs.filter((doc) => {
            // Add logic here if sale documents have category fields
            return true; // For now, show all sale documents
          });
        }

        setAccountingResults(filteredAccountingDocs);
        setSaleResults(filteredSaleDocs);

        debugLog('SmartDocumentSearch', 'Search Completed', {
          searchTerm: term,
          category,
          accountingResults: filteredAccountingDocs.length,
          saleResults: filteredSaleDocs.length,
          originalAccountingResults: accountingDocs.length,
          originalSaleResults: saleDocs.length,
        });
      } catch (error) {
        debugLog('SmartDocumentSearch', 'Search Error', {
          error: error.message,
          documentType,
          category,
        });
        setAccountingResults([]);
        setSaleResults([]);
      } finally {
        setLoading(false);
      }
    },
    [documentType, category, userRBAC, firestore, getGeographicContext]
  );

  // 🔧 ENHANCED: Re-search when category changes
  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2) {
      performSearch(searchTerm);
    }
  }, [category, performSearch]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchTerm(value);
    performSearch(value);
  };

  // Handle accounting document selection
  const handleAccountingDocumentSelect = (document) => {
    setSelectedDocument(document);
    debugLog('SmartDocumentSearch', 'Accounting Document Selected', {
      documentId: document.id,
      incomeId: document.incomeId,
      customerName: document.customerName,
      category: document.incomeSubCategory,
    });

    if (onDocumentSelect) {
      onDocumentSelect(document);
    }
  };

  // Handle sale document selection
  const handleSaleDocumentSelect = (document) => {
    setSelectedDocument(document);
    debugLog('SmartDocumentSearch', 'Sale Document Selected', {
      documentId: document.id,
      saleOrderNumber: document.saleOrderNumber,
      customerName: document.customerName,
      documentType: document.documentType, // 'booking' or 'sale'
    });

    if (onSaleDocumentSelect) {
      onSaleDocumentSelect(document);
    }
  };

  // Handle create new document
  const handleCreateNew = () => {
    debugLog('SmartDocumentSearch', 'Create New Document', {
      documentType,
      category,
    });
    if (onCreateNew) {
      onCreateNew();
    }
  };

  // Table columns configuration for accounting documents
  const accountingColumns = [
    {
      title: 'หมายเลขเอกสาร',
      dataIndex: 'incomeId',
      key: 'incomeId',
      render: (text, record) => (
        <Space>
          <FileTextOutlined style={{ color: '#52c41a' }} />
          <Text strong>{text}</Text>
          {record.status === 'approved' && <Tag color='green'>อนุมัติแล้ว</Tag>}
          {record.status === 'pending' && <Tag color='orange'>รอดำเนินการ</Tag>}
          {record.status === 'draft' && <Tag color='blue'>ร่าง</Tag>}
          {record.status === 'review' && <Tag color='purple'>ตรวจสอบ</Tag>}
          {record.incomeSubCategory && (
            <Tag color='cyan'>
              {IncomeDailyCategories[record.incomeSubCategory] ||
                record.incomeSubCategory}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'ลูกค้า',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <Space direction='vertical' size='small'>
          <Space>
            <UserOutlined style={{ color: '#52c41a' }} />
            <Text>{text}</Text>
          </Space>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            รหัส: {record.customerId}
          </Text>
        </Space>
      ),
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          ฿{amount?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'วันที่',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#faad14' }} />
          <Text>{formatDateSafely(date)}</Text>
        </Space>
      ),
    },
    {
      title: 'สาขา',
      dataIndex: 'branchCode',
      key: 'branchCode',
      render: (branchCode) => (
        <Space>
          <BankOutlined style={{ color: '#722ed1' }} />
          <Text>{formatBranchDisplay(branchCode)}</Text>
        </Space>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <Button
          type='primary'
          size='small'
          onClick={() => handleAccountingDocumentSelect(record)}
          disabled={!hasPermission('accounting.edit')}
        >
          เลือก
        </Button>
      ),
    },
  ];

  // Table columns configuration for sale documents
  const saleColumns = [
    {
      title: 'หมายเลขเอกสาร',
      dataIndex: 'saleOrderNumber',
      key: 'saleOrderNumber',
      render: (text, record) => (
        <Space>
          {record.documentType === 'booking' ? (
            <BranchesOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ShoppingCartOutlined style={{ color: '#1890ff' }} />
          )}
          <Text strong>{text}</Text>
          {record.status === 'approved' && <Tag color='green'>อนุมัติแล้ว</Tag>}
          {record.status === 'pending' && <Tag color='orange'>รอดำเนินการ</Tag>}
          {record.status === 'draft' && <Tag color='blue'>ร่าง</Tag>}
          {record.status === 'review' && <Tag color='purple'>ตรวจสอบ</Tag>}
          {record.status === 'sold' && <Tag color='green'>ขายแล้ว</Tag>}
          {record.documentType === 'booking' && <Tag color='cyan'>ใบจอง</Tag>}
          {record.documentType === 'sale' && <Tag color='blue'>ใบขาย</Tag>}
          {record.referenceSaleOrder && record.referenceSaleOrder !== text && (
            <Tag color='geekblue'>อ้างอิง: {record.referenceSaleOrder}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'ลูกค้า',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <Space direction='vertical' size='small'>
          <Space>
            <UserOutlined style={{ color: '#52c41a' }} />
            <Text>{text}</Text>
          </Space>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            รหัส: {record.customerId}
          </Text>
          {record.vehicleModel && record.vehicleModel !== 'ไม่ระบุ' && (
            <Text type='secondary' style={{ fontSize: '12px' }}>
              รถ: {record.vehicleModel}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#1890ff' }}>
          ฿{amount?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'วันที่',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#faad14' }} />
          <Text>{formatDateSafely(date)}</Text>
        </Space>
      ),
    },
    {
      title: 'สาขา',
      dataIndex: 'branchCode',
      key: 'branchCode',
      render: (branchCode) => (
        <Space>
          <BankOutlined style={{ color: '#722ed1' }} />
          <Text>{formatBranchDisplay(branchCode)}</Text>
        </Space>
      ),
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <Button
          type='default'
          size='small'
          onClick={() => handleSaleDocumentSelect(record)}
          disabled={!hasPermission('accounting.edit')}
        >
          {record.documentType === 'booking'
            ? 'นำข้อมูลจากใบจองมาสร้างเอกสารบัญชี'
            : 'นำข้อมูลจากใบขายมาสร้างเอกสารบัญชี'}
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <SearchOutlined style={{ color: '#1890ff' }} />
          <Text strong>ค้นหาเอกสาร</Text>
          {category && (
            <Tag color='blue'>
              {IncomeDailyCategories[category] || category}
            </Tag>
          )}
          {enableDebugMode && <Tag color='orange'>DEBUG MODE</Tag>}
        </Space>
      }
      style={{ marginBottom: '16px' }}
    >
      {/* Category Selection */}
      {onCategoryChange && (
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={24}>
            <Text strong>ประเภทการรับเงิน:</Text>
            <Select
              placeholder='เลือกประเภทการรับเงิน'
              onChange={onCategoryChange}
              value={category}
              style={{ width: '100%', marginTop: '8px' }}
              size='large'
            >
              {Object.keys(IncomeDailyCategories).map((type, i) => (
                <Option key={i} value={type}>
                  {IncomeDailyCategories[type]}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      )}

      {/* Search Input */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col flex='auto'>
          <Search
            placeholder={`${placeholder} (หมายเลขเอกสาร, ชื่อลูกค้า, หรือรหัสลูกค้า)`}
            allowClear
            enterButton='ค้นหา'
            size='large'
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
            loading={loading}
          />
        </Col>
        {showCreateButton && (
          <Col>
            <Button
              type='dashed'
              size='large'
              icon={<FileTextOutlined />}
              onClick={handleCreateNew}
              disabled={!hasPermission('accounting.edit')}
            >
              สร้างใหม่
            </Button>
          </Col>
        )}
      </Row>

      {/* Search Results */}
      {searchTerm && (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <Space>
                <FileTextOutlined />
                เอกสารบัญชี ({accountingResults.length})
                {category && (
                  <Tag size='small' color='blue'>
                    {IncomeDailyCategories[category]}
                  </Tag>
                )}
              </Space>
            }
            key='accounting'
          >
            {accountingResults.length > 0 ? (
              <Table
                columns={accountingColumns}
                dataSource={accountingResults}
                rowKey='id'
                size='small'
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: false,
                }}
                loading={loading}
                onRow={(record) => ({
                  onDoubleClick: () => handleAccountingDocumentSelect(record),
                  style: {
                    cursor: 'pointer',
                    backgroundColor:
                      selectedDocument?.id === record.id
                        ? '#e6f7ff'
                        : undefined,
                  },
                })}
              />
            ) : (
              <Alert
                message='ไม่พบข้อมูล'
                description={
                  <div>
                    <p>
                      ไม่พบเอกสารบัญชีที่ตรงกับคำค้นหา &ldquo;{searchTerm}
                      &rdquo;
                    </p>
                    {category && (
                      <p>ในประเภท: {IncomeDailyCategories[category]}</p>
                    )}
                    <p>
                      <strong>เคล็ดลับการค้นหา:</strong>
                    </p>
                    <ul>
                      <li>
                        ลองค้นหาด้วยหมายเลขเอกสาร เช่น &ldquo;INC001&rdquo;
                      </li>
                      <li>ลองค้นหาด้วยชื่อลูกค้า เช่น &ldquo;สมชาย&rdquo;</li>
                      <li>ลองค้นหาด้วยรหัสลูกค้า</li>
                      <li>ตรวจสอบว่าเลือกประเภทการรับเงินถูกต้อง</li>
                    </ul>
                  </div>
                }
                type='info'
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
          </TabPane>
          <TabPane
            tab={
              <Space>
                <ShoppingCartOutlined />
                เอกสารขาย ({saleResults.length})
                {saleResults.filter((r) => r.documentType === 'booking')
                  .length > 0 && (
                  <Tag size='small' color='green'>
                    จอง:{' '}
                    {
                      saleResults.filter((r) => r.documentType === 'booking')
                        .length
                    }
                  </Tag>
                )}
                {saleResults.filter((r) => r.documentType === 'sale').length >
                  0 && (
                  <Tag size='small' color='blue'>
                    ขาย:{' '}
                    {
                      saleResults.filter((r) => r.documentType === 'sale')
                        .length
                    }
                  </Tag>
                )}
              </Space>
            }
            key='sale'
          >
            {saleResults.length > 0 ? (
              <Table
                columns={saleColumns}
                dataSource={saleResults}
                rowKey='id'
                size='small'
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: false,
                }}
                loading={loading}
                onRow={(record) => ({
                  onDoubleClick: () => handleSaleDocumentSelect(record),
                  style: {
                    cursor: 'pointer',
                    backgroundColor:
                      selectedDocument?.id === record.id
                        ? '#e6f7ff'
                        : undefined,
                  },
                })}
              />
            ) : (
              <Alert
                message='ไม่พบข้อมูล'
                description={
                  <div>
                    <p>
                      ไม่พบเอกสารขาย/จองที่ตรงกับคำค้นหา &ldquo;{searchTerm}
                      &rdquo;
                    </p>
                    <p>
                      <strong>เคล็ดลับการค้นหา:</strong>
                    </p>
                    <ul>
                      <li>
                        ลองค้นหาด้วยหมายเลขใบจอง เช่น &ldquo;BOOK-VEH-001&rdquo;
                      </li>
                      <li>
                        ลองค้นหาด้วยหมายเลขใบขาย เช่น &ldquo;SALE-001&rdquo;
                      </li>
                      <li>ลองค้นหาด้วยชื่อลูกค้า เช่น &ldquo;สมชาย&rdquo;</li>
                      <li>ลองค้นหาด้วยรหัสลูกค้า</li>
                      <li>ระบบจะค้นหาทั้งใบจองและใบขาย</li>
                      <li>
                        ตรวจสอบว่าคุณมีสิทธิ์เข้าถึงข้อมูลของสาขา/จังหวัดนั้น
                      </li>
                    </ul>
                    <p>
                      <Text type='secondary'>
                        💡 เอกสารจากใบจองและใบขายสามารถนำมาสร้างเอกสารบัญชีได้
                      </Text>
                    </p>
                  </div>
                }
                type='info'
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
          </TabPane>
        </Tabs>
      )}

      {/* Instructions */}
      {!searchTerm && (
        <Alert
          message='วิธีการใช้งาน'
          description={
            <div>
              <p>
                • พิมพ์หมายเลขเอกสาร หรือชื่อลูกค้าเพื่อค้นหา (อย่างน้อย 2
                ตัวอักษร)
              </p>
              <p>• ดับเบิลคลิกที่รายการเพื่อเลือก</p>
              <p>• ระบบจะแสดงเฉพาะข้อมูลที่คุณมีสิทธิ์เข้าถึง</p>
              <p>• เลือกใบสั่งขายเพื่อนำข้อมูลมาสร้างเอกสารบัญชีใหม่</p>
              {category && (
                <p>
                  • กำลังค้นหาในประเภท:{' '}
                  <strong>{IncomeDailyCategories[category]}</strong>
                </p>
              )}
            </div>
          }
          type='info'
          showIcon
        />
      )}

      {/* Debug Information */}
      {enableDebugMode && (
        <Alert
          message='🔧 Debug Information'
          description={
            <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              <div>Document Type: {documentType}</div>
              <div>
                Category: {category} ({IncomeDailyCategories[category] || 'N/A'}
                )
              </div>
              <div>Search Term: &quot;{searchTerm}&quot;</div>
              <div>Accounting Results: {accountingResults.length}</div>
              <div>Sale Results: {saleResults.length}</div>
              <div>User: {user?.displayName || 'Not Available'}</div>
              <div>
                Permissions: View(
                {hasPermission('accounting.view') ? '✅' : '❌'}) | Edit(
                {hasPermission('accounting.edit') ? '✅' : '❌'})
              </div>
              <div>
                Geographic Filters: {JSON.stringify(getGeographicContext())}
              </div>
              {selectedDocument && (
                <div>
                  Selected:{' '}
                  {selectedDocument.saleOrderNumber ||
                    selectedDocument.incomeId}
                </div>
              )}
            </div>
          }
          type='warning'
          style={{ marginTop: '16px' }}
        />
      )}
    </Card>
  );
};

SmartDocumentSearch.propTypes = {
  onDocumentSelect: PropTypes.func.isRequired,
  onSaleDocumentSelect: PropTypes.func,
  category: PropTypes.string,
  onCategoryChange: PropTypes.func,
  documentType: PropTypes.string,
  placeholder: PropTypes.string,
  showCreateButton: PropTypes.bool,
  onCreateNew: PropTypes.func,
  enableDebugMode: PropTypes.bool,
  title: PropTypes.string,
};

export default SmartDocumentSearch;
