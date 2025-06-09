import React, { useState, useCallback, useContext } from 'react';
import {
  Card,
  Button,
  Progress,
  Alert,
  Typography,
  Space,
  Row,
  Col,
  Steps,
  Table,
  Tag,
  Statistic,
  Modal,
  notification,
  Divider,
  Collapse,
  Checkbox,
  List
} from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  UndoOutlined,
  DatabaseOutlined,
  SelectOutlined,
  CloudServerOutlined,
  DeleteOutlined,
  ReloadOutlined,
  WarningOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import {
  executePhase3Migration,
  validatePhase3Migration,
  rollbackPhase3Migration,
  BRANCH_PROVINCE_MAP,
  COLLECTIONS_TO_MIGRATE
} from '../../utils/migration/phase3ProvinceIdMigration';
import { FirebaseContext } from '../../firebase';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const Phase3MigrationDashboard = () => {
  const { firestore } = useContext(FirebaseContext);
  const [migrationState, setMigrationState] = useState({
    status: 'ready', // ready, running, completed, error
    progress: 0,
    currentCollection: '',
    results: null,
    validation: null
  });
  
  const [showDetails, setShowDetails] = useState(false);

  // Sample data preview state
  const [sampleData, setSampleData] = useState({
    loading: false,
    collections: [],
    error: null
  });

  // Collection selection state
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [allCollections, setAllCollections] = useState([]);

  // Function management state
  const [functionState, setFunctionState] = useState({
    status: 'unknown', // unknown, checking, functions-active, functions-removed
    removingFunctions: false,
    deployingFunctions: false,
    removedFunctions: []
  });

  // Add after the existing state declarations
  const [isPaused, setIsPaused] = useState(false);
  const [rateLimitMode, setRateLimitMode] = useState('conservative'); // conservative, normal, aggressive

  // Initialize collections on mount
  React.useEffect(() => {
    setAllCollections(COLLECTIONS_TO_MIGRATE);
    
    // Log Sunday migration strategy
    console.info(`
🚀 PHASE 3 MIGRATION - SUNDAY STRATEGY 🚀

RECOMMENDED APPROACH: Functions-Free Migration

STEP 1: Remove Cloud Functions (5-10 min)
firebase functions:delete --force updateVehicleUnitPrice
firebase functions:delete --force onUpdateSaleVehicles  
firebase functions:delete --force updateBookingOrderChange
firebase functions:delete --force updateTransferChange
firebase functions:delete --force updateSaleOutChange
firebase functions:delete --force updateOtherVehicleOutChange
firebase functions:delete --force updateDeliveryPlanChange
firebase functions:delete --force updateHRLeave

STEP 2: Run Migration (30-120 min)
✅ Optimized settings: 500 docs/page, 200 docs/batch
✅ No function conflicts
✅ Faster processing
✅ Lower costs

STEP 3: Re-deploy Functions (10-15 min)
cd functions && firebase deploy --only functions

BENEFITS:
- Zero function execution conflicts
- 4x faster migration (larger batches)
- No function costs during migration
- Cleaner process
- Perfect for Sunday maintenance window

Migration is ready for functions-free environment!
    `);
  }, []);

  // Function Management Handlers
  const FUNCTIONS_TO_REMOVE = [
    'updateVehicleUnitPrice',
    'onUpdateSaleVehicles',
    'updateBookingOrderChange',
    'updateTransferChange',
    'updateSaleOutChange',
    'updateOtherVehicleOutChange',
    'updateDeliveryPlanChange',
    'updateHRLeave',
    'updateVehicleProductList',
    'updatePartProductList'
  ];

  const handleRemoveFunctions = useCallback(async () => {
    Modal.confirm({
      title: '🔥 Remove Cloud Functions',
      content: (
        <div>
          <Alert
            message="Sunday Migration Strategy"
            description="Remove onUpdate functions before migration to prevent conflicts and improve performance."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Paragraph>
            <strong>Functions to remove ({FUNCTIONS_TO_REMOVE.length}):</strong>
          </Paragraph>
          <List
            size="small"
            dataSource={FUNCTIONS_TO_REMOVE}
            renderItem={func => (
              <List.Item>
                <CloudServerOutlined style={{ color: '#ff4d4f' }} /> {func}
              </List.Item>
            )}
          />
          <Alert
            message="⚠️ Manual Process Required"
            description="This will show you the commands to run in your terminal. The functions must be removed manually via Firebase CLI."
            type="warning"
            showIcon
          />
        </div>
      ),
      icon: <DeleteOutlined />,
      okText: 'Show Commands',
      cancelText: 'Cancel',
      okType: 'danger',
      width: 600,
      onOk: () => {
        setFunctionState(prev => ({ ...prev, removingFunctions: true }));
        
        const commands = FUNCTIONS_TO_REMOVE.map(func => 
          `firebase functions:delete ${func}`
        ).join(' ');

        Modal.info({
          title: '💻 Terminal Commands',
          content: (
            <div>
              <Paragraph>
                <strong>Run this command in your terminal:</strong>
              </Paragraph>
              <Alert
                message={commands}
                type="info"
                style={{ 
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  marginBottom: 16
                }}
              />
              <Paragraph>
                <strong>Or run individually:</strong>
              </Paragraph>
              {FUNCTIONS_TO_REMOVE.map(func => (
                <div key={func} style={{ marginBottom: 4, fontFamily: 'monospace', fontSize: '12px' }}>
                  firebase functions:delete {func}
                </div>
              ))}
              <Alert
                message="💡 Tip"
                description="After running these commands, mark functions as removed below to enable the migration."
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            </div>
          ),
          width: 700,
          onOk: () => {
            setFunctionState(prev => ({ 
              ...prev, 
              removingFunctions: false,
              status: 'checking'
            }));
          }
        });
      }
    });
  }, []);

  const handleMarkFunctionsRemoved = useCallback(() => {
    setFunctionState(prev => ({ 
      ...prev, 
      status: 'functions-removed',
      removedFunctions: FUNCTIONS_TO_REMOVE
    }));
    
    notification.success({
      message: 'Functions Marked as Removed',
      description: 'Migration is now ready to run in functions-free environment.',
      duration: 5
    });
  }, []);

  const handleDeployFunctions = useCallback(async () => {
    Modal.confirm({
      title: '🚀 Re-deploy Cloud Functions',
      content: (
        <div>
          <Alert
            message="Post-Migration Deployment"
            description="Re-deploy all Cloud Functions after successful migration completion."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Paragraph>
            <strong>This will restore all removed functions plus any new ones.</strong>
          </Paragraph>
          <Alert
            message="⚠️ Manual Process Required"
            description="This will show you the command to run in your terminal. Functions must be deployed manually via Firebase CLI."
            type="warning"
            showIcon
          />
        </div>
      ),
      icon: <ReloadOutlined />,
      okText: 'Show Commands',
      cancelText: 'Cancel',
      okType: 'primary',
      onOk: () => {
        setFunctionState(prev => ({ ...prev, deployingFunctions: true }));
        
        Modal.info({
          title: '💻 Deployment Commands',
          content: (
            <div>
              <Paragraph>
                <strong>Run these commands in your terminal:</strong>
              </Paragraph>
              <Alert
                message="cd functions && firebase deploy --only functions"
                type="info"
                style={{ 
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  marginBottom: 16
                }}
              />
              <Alert
                message="💡 Tip"
                description="This will re-deploy all functions from your functions/ directory, restoring the removed ones and deploying any new changes."
                type="success"
                showIcon
              />
            </div>
          ),
          width: 600,
          onOk: () => {
            setFunctionState(prev => ({ 
              ...prev, 
              deployingFunctions: false,
              status: 'functions-active'
            }));
            
            notification.success({
              message: 'Functions Deployment Complete',
              description: 'All Cloud Functions have been restored.',
              duration: 5
            });
          }
        });
      }
    });
  }, []);

  // Execute migration
  const handleExecuteMigration = useCallback(async () => {
    // Check if any collections are selected
    if (selectedCollections.length === 0) {
      notification.warning({
        message: 'No Collections Selected',
        description: 'Please select at least one collection to migrate.'
      });
      return;
    }

    // Check function status for optimal performance
    if (functionState.status !== 'functions-removed') {
      Modal.confirm({
        title: '⚠️ Functions Still Active',
        content: (
          <div>
            <Alert
              message="Performance Warning"
              description="Cloud Functions are still active. Migration will work but may be slower and trigger unnecessary function executions."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Paragraph>
              <strong>Recommendations:</strong>
            </Paragraph>
            <ul>
              <li>Remove Cloud Functions first for optimal performance (Sunday Strategy)</li>
              <li>Or continue with current settings (may be slower)</li>
            </ul>
          </div>
        ),
        icon: <WarningOutlined />,
        okText: 'Continue Anyway',
        cancelText: 'Cancel and Remove Functions',
        onCancel: () => {
          // User wants to remove functions first
          return;
        },
        onOk: () => {
          // User wants to continue anyway
          proceedWithMigration();
        }
      });
      return;
    }

    proceedWithMigration();
  }, [selectedCollections, functionState.status]);

     const proceedWithMigration = useCallback(() => {
    Modal.confirm({
      title: '🚀 Execute Phase 3 Migration',
      content: (
        <div>
          <Paragraph>
            <strong>This migration will add provinceId to selected collections ({selectedCollections.length} of {allCollections.length}).</strong>
          </Paragraph>
          <Paragraph>
            Selected collections:
            <ul>
              {selectedCollections.map(name => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </Paragraph>
          {functionState.status === 'functions-removed' && (
            <Alert
              message="🚀 Optimized for Performance"
              description="Functions removed - migration will run at maximum speed with larger batch sizes."
              type="success"
              showIcon
              style={{ marginBottom: 12 }}
            />
          )}
          <Alert
            message="Production Ready"
            description="This migration is safe to run in production. It only adds new fields and doesn't modify existing data."
            type="info"
            showIcon
          />
        </div>
      ),
      icon: <DatabaseOutlined />,
      okText: 'Execute Migration',
      cancelText: 'Cancel',
      okType: 'primary',
      onOk: async () => {
        setMigrationState({
          status: 'running',
          progress: 0,
          currentCollection: '',
          results: null,
          validation: null
        });

        try {
          const results = await executePhase3Migration((progress) => {
            setMigrationState(prev => ({
              ...prev,
              progress: Math.round((progress.processed / progress.total) * 100),
              currentCollection: progress.currentCollection || prev.currentCollection
            }));
          }, selectedCollections);

          setMigrationState(prev => ({
            ...prev,
            status: 'completed',
            progress: 100,
            results
          }));

          notification.success({
            message: 'Migration Completed Successfully',
            description: `Migrated ${results.summary.totalMigrated} records across ${results.summary.successfulCollections} collections`,
            duration: 10
          });

        } catch (error) {
          setMigrationState(prev => ({
            ...prev,
            status: 'error',
            results: { error: error.message }
          }));

          notification.error({
            message: 'Migration Failed',
            description: error.message,
            duration: 10
          });
        }
      }
    });
  }, [selectedCollections, allCollections]);

  // Validate migration
  const handleValidateMigration = useCallback(async () => {
    setMigrationState(prev => ({ ...prev, status: 'validating' }));
    
    try {
      const validation = await validatePhase3Migration();
      setMigrationState(prev => ({
        ...prev,
        validation,
        status: prev.status === 'validating' ? 'completed' : prev.status
      }));
      
      notification.success({
        message: 'Validation Complete',
        description: `${validation.summary.documentsWithProvinceId} documents have provinceId`
      });
    } catch (error) {
      notification.error({
        message: 'Validation Failed',
        description: error.message
      });
    }
  }, []);

  // Rollback migration
  const handleRollbackMigration = useCallback(async () => {
    Modal.confirm({
      title: '⚠️ Rollback Phase 3 Migration',
      content: (
        <div>
          <Alert
            message="Warning: This will remove all provinceId fields added by Phase 3 migration"
            description="Only use this if you need to undo the migration. This will break automatic geographic filtering."
            type="warning"
            showIcon
          />
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      okText: 'Rollback Migration',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          const results = await rollbackPhase3Migration();
          notification.success({
            message: 'Migration Rolled Back',
            description: `Removed provinceId from ${results.summary.totalDocumentsRolledBack} documents`
          });
        } catch (error) {
          notification.error({
            message: 'Rollback Failed',
            description: error.message
          });
        }
      }
    });
  }, []);

  // Table columns for collection results
  const collectionColumns = [
    {
      title: 'Collection',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'status',
      render: (success) => (
        <Tag color={success ? 'green' : 'red'}>
          {success ? 'Success' : 'Failed'}
        </Tag>
      )
    },
    {
      title: 'Migrated',
      dataIndex: 'migrated',
      key: 'migrated',
      render: (count) => <Text type="success">{count}</Text>
    },
    {
      title: 'Skipped',
      dataIndex: 'skipped',
      key: 'skipped',
      render: (count) => <Text type="secondary">{count}</Text>
    },
    {
      title: 'Errors',
      dataIndex: 'errors',
      key: 'errors',
      render: (errors) => (
        <Text type={errors?.length > 0 ? 'danger' : 'secondary'}>
          {errors?.length || 0}
        </Text>
      )
    }
  ];

  // Removed unused validation columns and data since they're defined in MigrationResults component

  // Sample data preview function
  // Collection selection handlers
  const handleSelectAllCollections = () => {
    setSelectedCollections(allCollections.map(col => col.name));
  };

  const handleDeselectAllCollections = () => {
    setSelectedCollections([]);
  };

  // Preset selection handlers
  const handleSelectAccountingCollections = () => {
    const accountingCollections = allCollections
      .filter(col => col.name.toLowerCase().includes('income') || col.name.toLowerCase().includes('expense'))
      .map(col => col.name);
    setSelectedCollections(accountingCollections);
  };

  const handleSelectSalesCollections = () => {
    const salesCollections = allCollections
      .filter(col => col.name.toLowerCase().includes('sale') || col.name.toLowerCase().includes('booking'))
      .map(col => col.name);
    setSelectedCollections(salesCollections);
  };

  const handleSelectInventoryCollections = () => {
    const inventoryCollections = allCollections
      .filter(col => col.name.toLowerCase().includes('stock') || col.name.toLowerCase().includes('part'))
      .map(col => col.name);
    setSelectedCollections(inventoryCollections);
  };

  const handleCollectionToggle = (collectionName, checked) => {
    if (checked) {
      setSelectedCollections(prev => [...prev, collectionName]);
    } else {
      setSelectedCollections(prev => prev.filter(name => name !== collectionName));
    }
  };

  // Collection selector component
  const CollectionSelector = () => (
    <Card
      title={
        <Space>
          <SelectOutlined />
          <span>Select Collections to Migrate</span>
          <Tag color="blue">{selectedCollections.length} of {allCollections.length} selected</Tag>
        </Space>
      }
      style={{ marginBottom: 24 }}
      extra={
        <Space>
          <Button 
            size="small" 
            onClick={handleSelectAllCollections}
            disabled={selectedCollections.length === allCollections.length}
          >
            Select All
          </Button>
          <Button 
            size="small" 
            onClick={handleDeselectAllCollections}
            disabled={selectedCollections.length === 0}
          >
            Deselect All
          </Button>
        </Space>
      }
    >
      <Alert
        message="Migration Strategy"
        description="Select specific collections to migrate in smaller batches. This helps prevent browser crashes and allows you to monitor progress more effectively."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Alert
        message="🚀 Sunday Migration Strategy"
        description={
          <div>
            <p><strong>RECOMMENDED:</strong> For safest migration, remove all Cloud Functions before migration, then re-deploy after completion.</p>
            <p><strong>Steps:</strong> 1) Remove functions → 2) Run migration → 3) Re-deploy functions</p>
            <p><strong>Benefits:</strong> Faster migration, no function conflicts, lower costs, safer process</p>
            <p>Migration is optimized for functions-free environment (500 docs/page, 200 docs/batch)</p>
          </div>
        }
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ marginRight: 12 }}>Quick Select:</Text>
        <Space>
          <Button size="small" onClick={handleSelectAccountingCollections}>
            📊 Accounting ({allCollections.filter(col => col.name.toLowerCase().includes('income') || col.name.toLowerCase().includes('expense')).length})
          </Button>
          <Button size="small" onClick={handleSelectSalesCollections}>
            🚗 Sales ({allCollections.filter(col => col.name.toLowerCase().includes('sale') || col.name.toLowerCase().includes('booking')).length})
          </Button>
          <Button size="small" onClick={handleSelectInventoryCollections}>
            📦 Inventory ({allCollections.filter(col => col.name.toLowerCase().includes('stock') || col.name.toLowerCase().includes('part')).length})
          </Button>
        </Space>
      </div>
      
      <Row gutter={[16, 16]}>
        {allCollections.map((collection) => (
          <Col xs={24} sm={12} md={8} lg={6} key={collection.name}>
            <Card 
              size="small" 
              style={{ 
                border: selectedCollections.includes(collection.name) ? '2px solid #1890ff' : '1px solid #d9d9d9',
                backgroundColor: selectedCollections.includes(collection.name) ? '#f6ffed' : '#fff'
              }}
            >
              <Checkbox
                checked={selectedCollections.includes(collection.name)}
                onChange={(e) => handleCollectionToggle(collection.name, e.target.checked)}
                style={{ marginBottom: 8 }}
              >
                <Text strong>{collection.name}</Text>
              </Checkbox>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {collection.path}
                </Text>
              </div>
              <div style={{ marginTop: 4 }}>
                <Tag size="small" color="blue">
                  {collection.branchField || 'branchCode'}
                </Tag>
                {collection.fallbackBranchField && (
                  <Tag size="small" color="green">
                    fallback: {collection.fallbackBranchField}
                  </Tag>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      {selectedCollections.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6 }}>
          <Text strong>Selected Collections ({selectedCollections.length}):</Text>
          <div style={{ marginTop: 8 }}>
            {selectedCollections.map(name => (
              <Tag key={name} color="blue" style={{ margin: '2px' }}>
                {name}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Card>
  );

  // Function Management Component
  const FunctionManagement = () => {
    const getFunctionStatusColor = () => {
      switch (functionState.status) {
        case 'functions-active': return '#faad14'; // yellow
        case 'functions-removed': return '#52c41a'; // green
        case 'checking': return '#1890ff'; // blue
        default: return '#d9d9d9'; // gray
      }
    };

    const getFunctionStatusText = () => {
      switch (functionState.status) {
        case 'functions-active': return 'Functions Active (May Conflict)';
        case 'functions-removed': return 'Functions Removed (Ready for Migration)';
        case 'checking': return 'Checking Function Status...';
        default: return 'Function Status Unknown';
      }
    };

    const canRemoveFunctions = functionState.status !== 'functions-removed' && !functionState.removingFunctions;
    const canRunMigration = functionState.status === 'functions-removed';
    const canDeployFunctions = migrationState.status === 'completed' && functionState.status === 'functions-removed';

    return (
      <Card 
        title={
          <Space>
            <CloudServerOutlined />
            <span>☁️ Function Management (Sunday Strategy)</span>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        <Alert
          message="🚀 Sunday Migration Strategy: Functions-Free Environment"
          description="Remove conflicting Cloud Functions before migration for faster, cleaner processing. Re-deploy after completion."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Function Status */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Card size="small">
              <Statistic
                title="Function Status"
                value={getFunctionStatusText()}
                valueStyle={{ 
                  color: getFunctionStatusColor(),
                  fontSize: '14px'
                }}
                prefix={
                  functionState.status === 'functions-removed' ? 
                    <CheckCircleOutlined /> : 
                    <WarningOutlined />
                }
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small">
              <Statistic
                title="Functions to Remove"
                value={FUNCTIONS_TO_REMOVE.length}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ThunderboltOutlined />}
                suffix="onUpdate functions"
              />
            </Card>
          </Col>
        </Row>

        {/* Function Actions */}
        <Row gutter={16}>
          <Col span={8}>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemoveFunctions}
              disabled={!canRemoveFunctions}
              block
            >
              1. Remove Functions
            </Button>
          </Col>
          <Col span={8}>
            <Button
              type={canRunMigration ? "primary" : "default"}
              icon={<CheckCircleOutlined />}
              onClick={handleMarkFunctionsRemoved}
              disabled={functionState.status === 'functions-removed'}
              block
            >
              2. Mark as Removed
            </Button>
          </Col>
          <Col span={8}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleDeployFunctions}
              disabled={!canDeployFunctions}
              block
            >
              3. Re-deploy Functions
            </Button>
          </Col>
        </Row>

        {/* Function List */}
        {functionState.status === 'functions-removed' && (
          <Collapse style={{ marginTop: 16 }}>
            <Collapse.Panel 
              header={`✅ Removed Functions (${functionState.removedFunctions.length})`}
              key="removed-functions"
            >
              <List
                size="small"
                dataSource={functionState.removedFunctions}
                renderItem={func => (
                  <List.Item>
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text delete style={{ color: '#8c8c8c' }}>{func}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Collapse.Panel>
          </Collapse>
        )}

        {/* Performance Benefits */}
        {functionState.status === 'functions-removed' && (
          <Alert
            message="🚀 Performance Optimized"
            description="Migration will run 4x faster with 500 docs/page and 200 docs/batch in functions-free environment."
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    );
  };

  const previewSampleData = async () => {
    setSampleData({ loading: true, collections: [], error: null });
    
    try {
      const sampleCollections = [
        { path: 'sections/account/incomes', name: 'Account Incomes', limit: 3 },
        { path: 'sections/account/expenses', name: 'Account Expenses', limit: 2 },
        { path: 'sections/sales/vehicles', name: 'Vehicle Sales', limit: 3 },
        { path: 'sections/sales/bookings', name: 'Sales Bookings', limit: 2 },
        { path: 'sections/stocks/vehicles', name: 'Vehicle Inventory', limit: 2 }
      ];

      const results = [];

      for (const collection of sampleCollections) {
        try {
          const snapshot = await firestore
            .collection(collection.path)
            .limit(collection.limit)
            .get();

          const documents = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            const branchCode = data.branchCode || data.branch || 'unknown';
            const currentProvinceId = data.provinceId || null;
            
            // Calculate what provinceId should be
            const newProvinceId = BRANCH_PROVINCE_MAP[branchCode] || 'unknown-province';
            
            documents.push({
              id: doc.id,
              currentData: {
                branchCode,
                provinceId: currentProvinceId,
                sampleFields: {
                  ...(data.customerName && { customerName: data.customerName }),
                  ...(data.vehicleModel && { vehicleModel: data.vehicleModel }),
                  ...(data.incomeNo && { incomeNo: data.incomeNo }),
                  ...(data.expenseNo && { expenseNo: data.expenseNo }),
                  ...(data.bookingNo && { bookingNo: data.bookingNo }),
                  ...(data.saleNo && { saleNo: data.saleNo }),
                  ...(data.created && { created: new Date(data.created).toLocaleDateString('th-TH') })
                }
              },
              afterMigration: {
                branchCode,
                provinceId: newProvinceId,
                willUpdate: !currentProvinceId || currentProvinceId !== newProvinceId
              }
            });
          });

          results.push({
            ...collection,
            documents,
            totalDocs: snapshot.size,
            hasData: snapshot.size > 0
          });
        } catch (error) {
          results.push({
            ...collection,
            documents: [],
            totalDocs: 0,
            hasData: false,
            error: error.message
          });
        }
      }

      setSampleData({ loading: false, collections: results, error: null });
    } catch (error) {
      setSampleData({ loading: false, collections: [], error: error.message });
    }
  };

  const SampleDataPreview = () => (
    <Card
      title={
        <Space>
          <EyeOutlined />
          <span>Sample Data Preview</span>
        </Space>
      }
      style={{ marginBottom: 24 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="Preview Current Data"
          description="Review sample documents from key collections to verify branch-to-province mapping before running migration."
          type="info"
          showIcon
        />
        
        <Button 
          type="primary" 
          onClick={previewSampleData}
          loading={sampleData.loading}
          icon={<DatabaseOutlined />}
        >
          Load Sample Data
        </Button>

        {sampleData.error && (
          <Alert message="Error loading sample data" description={sampleData.error} type="error" />
        )}

        {sampleData.collections.length > 0 && (
          <Collapse ghost>
            {sampleData.collections.map((collection, index) => (
              <Collapse.Panel 
                header={
                  <Space>
                    <span>{collection.name}</span>
                    <Tag color={collection.hasData ? 'green' : 'orange'}>
                      {collection.hasData ? `${collection.totalDocs} documents` : 'No data'}
                    </Tag>
                    {collection.error && <Tag color="red">Error</Tag>}
                  </Space>
                }
                key={index}
              >
                {collection.error ? (
                  <Alert message={collection.error} type="error" />
                ) : collection.hasData ? (
                  <Table
                    dataSource={collection.documents}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      {
                        title: 'Document ID',
                        dataIndex: 'id',
                        key: 'id',
                        width: 200,
                        render: (text) => <code style={{ fontSize: '12px' }}>{text.substring(0, 12)}...</code>
                      },
                      {
                        title: 'Current Branch',
                        key: 'currentBranch',
                        render: (_, record) => (
                          <Tag color="blue">{record.currentData.branchCode}</Tag>
                        )
                      },
                      {
                        title: 'Current ProvinceId',
                        key: 'currentProvince',
                        render: (_, record) => (
                          record.currentData.provinceId ? 
                            <Tag color="green">{record.currentData.provinceId}</Tag> :
                            <Tag color="orange">Not Set</Tag>
                        )
                      },
                      {
                        title: 'After Migration',
                        key: 'afterMigration',
                        render: (_, record) => (
                          <Space>
                            <Tag color="cyan">{record.afterMigration.provinceId}</Tag>
                            {record.afterMigration.willUpdate && (
                              <Tag color="gold">Will Update</Tag>
                            )}
                          </Space>
                        )
                      },
                      {
                        title: 'Sample Data',
                        key: 'sampleData',
                        render: (_, record) => (
                          <div style={{ fontSize: '12px', maxWidth: '200px' }}>
                            {Object.entries(record.currentData.sampleFields).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {String(value).substring(0, 30)}
                                {String(value).length > 30 && '...'}
                              </div>
                            ))}
                          </div>
                        )
                      }
                    ]}
                  />
                ) : (
                  <Alert message="No documents found in this collection" type="info" />
                )}
              </Collapse.Panel>
            ))}
          </Collapse>
        )}

        {sampleData.collections.length > 0 && (
          <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Typography.Title level={5} style={{ color: '#52c41a', margin: 0 }}>
              Branch to Province Mapping
            </Typography.Title>
            <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Typography.Text strong>Nakhon Ratchasima:</Typography.Text>
                <br />
                <Space wrap size="small">
                  {['0450', '0451', '0452', '0453', '0454', '0455', '0456', '1004', '0500'].map(branch => (
                    <Tag key={branch} color="green" size="small">{branch}</Tag>
                  ))}
                </Space>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Nakhon Sawan:</Typography.Text>
                <br />
                <Space wrap size="small">
                  {['NSN001', 'NSN002', 'NSN003'].map(branch => (
                    <Tag key={branch} color="blue" size="small">{branch}</Tag>
                  ))}
                </Space>
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    </Card>
  );

  // Migration Status Component
  const MigrationStatus = () => (
    <Card title="📋 Migration Progress">
      <Steps
        current={
          migrationState.status === 'ready' ? 0 :
          migrationState.status === 'running' ? 1 :
          migrationState.status === 'completed' ? 2 :
          migrationState.status === 'error' ? 1 : 0
        }
        status={migrationState.status === 'error' ? 'error' : 'process'}
      >
        <Step title="Ready" description="Migration prepared" />
        <Step 
          title="Migrating" 
          description={migrationState.currentCollection || 'Processing collections'}
        />
        <Step title="Complete" description="Migration finished" />
      </Steps>

      {migrationState.status === 'running' && (
        <div style={{ marginTop: '24px' }}>
          <Progress 
            percent={migrationState.progress} 
            status="active"
            format={(percent) => `${percent}% - ${migrationState.currentCollection}`}
          />
        </div>
      )}

      <Row gutter={24} style={{ marginTop: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Migration Status"
              value={
                migrationState.status === 'ready' ? 'Ready' :
                migrationState.status === 'running' ? 'Running' :
                migrationState.status === 'completed' ? 'Completed' :
                migrationState.status === 'error' ? 'Error' : 'Unknown'
              }
              prefix={
                migrationState.status === 'completed' ? <CheckCircleOutlined /> :
                migrationState.status === 'error' ? <ExclamationCircleOutlined /> :
                <DatabaseOutlined />
              }
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Records Migrated"
              value={migrationState.results?.summary?.totalMigrated || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Collections Processed"
              value={migrationState.results?.summary?.successfulCollections || 0}
              suffix={`/ ${migrationState.results?.summary?.totalCollections || 0}`}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );

  // Migration Controls Component
  const MigrationControls = () => (
    <Card title="🎛️ Migration Controls">
      {selectedCollections.length === 0 && (
        <Alert
          message="No Collections Selected"
          description="Please select at least one collection to migrate before executing the migration."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Space size="large">
        <Button 
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleExecuteMigration}
          disabled={migrationState.status === 'running' || selectedCollections.length === 0}
          size="large"
        >
          Execute Phase 3 Migration ({selectedCollections.length} collections)
        </Button>

        <Button
          icon={<EyeOutlined />}
          onClick={handleValidateMigration}
          disabled={migrationState.status === 'running'}
        >
          Validate Migration
        </Button>
        
        <Button
          icon={<UndoOutlined />}
          onClick={handleRollbackMigration}
          disabled={migrationState.status === 'running'}
          danger
        >
          Rollback Migration
        </Button>
        
        <Button
          onClick={() => setShowDetails(!showDetails)}
          disabled={!migrationState.results && !migrationState.validation}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>
      </Space>
    </Card>
  );

  // Migration Results Component
  const MigrationResults = () => {
    // Table columns for collection results
    const collectionColumns = [
      {
        title: 'Collection',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Text strong>{text}</Text>
      },
      {
        title: 'Status',
        dataIndex: 'success',
        key: 'status',
        render: (success) => (
          <Tag color={success ? 'green' : 'red'}>
            {success ? 'Success' : 'Failed'}
          </Tag>
        )
      },
      {
        title: 'Migrated',
        dataIndex: 'migrated',
        key: 'migrated',
        render: (count) => <Text type="success">{count}</Text>
      },
      {
        title: 'Skipped',
        dataIndex: 'skipped',
        key: 'skipped',
        render: (count) => <Text type="secondary">{count}</Text>
      },
      {
        title: 'Errors',
        dataIndex: 'errors',
        key: 'errors',
        render: (errors) => (
          <Text type={errors?.length > 0 ? 'danger' : 'secondary'}>
            {errors?.length || 0}
          </Text>
        )
      }
    ];

    // Prepare table data
    const collectionData = migrationState.results?.collections 
      ? Object.entries(migrationState.results.collections).map(([name, data]) => ({
          key: name,
          name,
          ...data
        }))
      : [];

    return (
      <div>
        {/* Results Details */}
        {showDetails && migrationState.results && (
          <Card title="📊 Migration Results" style={{ marginBottom: '24px' }}>
            <Table
              columns={collectionColumns}
              dataSource={collectionData}
              pagination={false}
              size="small"
            />
          </Card>
        )}

        {/* Error Details */}
        {migrationState.status === 'error' && migrationState.results?.error && (
          <Card title="❌ Error Details" style={{ marginBottom: '24px' }}>
            <Alert
              message="Migration Error"
              description={migrationState.results.error}
              type="error"
              showIcon
            />
          </Card>
        )}
      </div>
    );
  };

  // Add pause/resume handlers
  const handlePauseMigration = () => {
    setIsPaused(true);
    notification.info({
      message: 'Migration Paused',
      description: 'Migration will pause after current batch completes.'
    });
  };

  const handleResumeMigration = () => {
    setIsPaused(false);
    notification.success({
      message: 'Migration Resumed',
      description: 'Migration will continue from where it left off.'
    });
  };

  // Add rate limit settings
  const getRateLimitSettings = () => {
    switch (rateLimitMode) {
      case 'conservative':
        return {
          pageSize: 25,
          batchSize: 5,
          delayBetweenBatches: 3000,
          delayBetweenPages: 5000
        };
      case 'normal':
        return {
          pageSize: 50,
          batchSize: 10,
          delayBetweenBatches: 2000,
          delayBetweenPages: 3000
        };
      case 'aggressive':
        return {
          pageSize: 100,
          batchSize: 25,
          delayBetweenBatches: 1000,
          delayBetweenPages: 1000
        };
      default:
        return {
          pageSize: 50,
          batchSize: 10,
          delayBetweenBatches: 2000,
          delayBetweenPages: 3000
        };
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Typography.Title level={2}>
        <DatabaseOutlined /> Phase 3 Migration Dashboard
      </Typography.Title>
      <Typography.Paragraph>
        Add <code>provinceId</code> to all existing documents based on their <code>branchCode</code>.
        This migration will enable proper geographic filtering in the RBAC system.
      </Typography.Paragraph>

      {/* Collection Selection */}
      <CollectionSelector />

      {/* Function Management */}
      <FunctionManagement />

      {/* Sample Data Preview Section */}
      <SampleDataPreview />

      <Divider />

      {/* Migration Status */}
      <MigrationStatus />

      <Divider />

      {/* Migration Controls */}
      <MigrationControls />

      {/* Results */}
      {migrationState.results && Object.keys(migrationState.results).length > 0 && (
        <>
          <Divider />
          <MigrationResults />
        </>
      )}
    </div>
  );
};

export default Phase3MigrationDashboard; 