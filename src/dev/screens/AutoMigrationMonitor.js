import React, { useState, useCallback, useContext } from 'react';
import {
  Card,
  Button,
  Alert,
  Typography,
  Space,
  Row,
  Col,
  Table,
  Tag,
  Statistic,
  Progress,
  notification,
  Divider
} from 'antd';
import {
  CloudServerOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { FirebaseContext } from '../../firebase';

const { Title, Text, Paragraph } = Typography;

const AutoMigrationMonitor = () => {
  const { functions } = useContext(FirebaseContext);
  const [migrationStatus, setMigrationStatus] = useState({
    loading: false,
    data: null,
    error: null,
    lastChecked: null
  });

  // Check auto-migration status
  const checkStatus = useCallback(async () => {
    setMigrationStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const checkAutoMigrationStatus = functions.httpsCallable('checkAutoMigrationStatus');
      const result = await checkAutoMigrationStatus();
      
      setMigrationStatus({
        loading: false,
        data: result.data,
        error: null,
        lastChecked: new Date()
      });
      
      notification.success({
        message: 'Status Updated',
        description: 'Auto-migration status refreshed successfully'
      });
      
    } catch (error) {
      setMigrationStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      
      notification.error({
        message: 'Status Check Failed',
        description: error.message
      });
    }
  }, [functions]);

  // Calculate overall progress
  const getOverallProgress = () => {
    if (!migrationStatus.data?.collections) return 0;
    
    const collections = Object.values(migrationStatus.data.collections);
    const validCollections = collections.filter(col => !col.error);
    
    if (validCollections.length === 0) return 0;
    
    const totalProgress = validCollections.reduce((sum, col) => sum + (col.migrationProgress || 0), 0);
    return Math.round(totalProgress / validCollections.length);
  };

  // Table columns for collection status
  const columns = [
    {
      title: 'Collection',
      dataIndex: 'path',
      key: 'path',
      render: (text) => <Text code>{text.replace('sections/', '')}</Text>
    },
    {
      title: 'Total Docs',
      dataIndex: 'total',
      key: 'total',
      render: (count) => <Text strong>{count}</Text>
    },
    {
      title: 'Migrated',
      dataIndex: 'migrated',
      key: 'migrated',
      render: (count) => <Text type="success">{count}</Text>
    },
    {
      title: 'Auto-Migrated',
      dataIndex: 'autoMigrated',
      key: 'autoMigrated',
      render: (count) => (
        <Tag color={count > 0 ? 'green' : 'default'}>
          {count}
        </Tag>
      )
    },
    {
      title: 'Progress',
      dataIndex: 'migrationProgress',
      key: 'progress',
      render: (progress) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.error) {
          return <Tag color="red">Error</Tag>;
        }
        if (record.migrationProgress === 100) {
          return <Tag color="green">Complete</Tag>;
        }
        if (record.autoMigrated > 0) {
          return <Tag color="blue">Auto-Migrating</Tag>;
        }
        return <Tag color="orange">Pending</Tag>;
      }
    }
  ];

  // Prepare table data
  const tableData = migrationStatus.data?.collections 
    ? Object.entries(migrationStatus.data.collections).map(([path, data]) => ({
        key: path,
        path,
        ...data
      }))
    : [];

  const overallProgress = getOverallProgress();
  const completedCollections = tableData.filter(col => col.migrationProgress === 100).length;
  const totalAutoMigrated = tableData.reduce((sum, col) => sum + (col.autoMigrated || 0), 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Typography.Title level={2}>
        <CloudServerOutlined /> Auto-Migration Monitor
      </Typography.Title>
      <Typography.Paragraph>
        Monitor the automatic provinceId migration happening in real-time as users work with the system.
        Cloud Functions automatically add provinceId to new/updated documents.
      </Typography.Paragraph>

      {/* Status Alert */}
      <Alert
        message="🚀 Live Auto-Migration Active"
        description="Cloud Functions are automatically adding provinceId to documents as they're created or updated. No downtime required!"
        type="success"
        showIcon
        style={{ marginBottom: '24px' }}
        action={
          <Button size="small" onClick={checkStatus} loading={migrationStatus.loading}>
            Refresh Status
          </Button>
        }
      />

      {/* Overall Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Overall Progress"
              value={overallProgress}
              suffix="%"
              valueStyle={{ color: overallProgress === 100 ? '#3f8600' : '#1890ff' }}
              prefix={overallProgress === 100 ? <CheckCircleOutlined /> : <ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Collections Complete"
              value={completedCollections}
              suffix={`/ ${tableData.length}`}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Auto-Migrated Docs"
              value={totalAutoMigrated}
              valueStyle={{ color: '#722ed1' }}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Last Checked"
              value={migrationStatus.lastChecked ? 
                migrationStatus.lastChecked.toLocaleTimeString() : 'Never'
              }
              valueStyle={{ fontSize: '14px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Control Panel */}
      <Card title="🎛️ Control Panel" style={{ marginBottom: '24px' }}>
        <Space size="large">
          <Button 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={checkStatus}
            loading={migrationStatus.loading}
            size="large"
          >
            Refresh Status
          </Button>
          
          <Alert
            message="Auto-Migration Process"
            description="Functions automatically trigger when documents are created/updated. Check status periodically to monitor progress."
            type="info"
            showIcon
            style={{ flex: 1 }}
          />
        </Space>
      </Card>

      {/* Collection Status Table */}
      {migrationStatus.data && (
        <Card title="📊 Collection Status">
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            size="small"
            loading={migrationStatus.loading}
          />
          
          {migrationStatus.error && (
            <Alert
              message="Status Check Error"
              description={migrationStatus.error}
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      )}

      {/* Instructions */}
      <Divider />
      <Card title="📋 How Auto-Migration Works">
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Title level={4}>🔥 Automatic Process</Typography.Title>
            <ul>
              <li><strong>Real-time</strong>: Functions trigger on document writes</li>
              <li><strong>Smart detection</strong>: Only adds provinceId if missing</li>
              <li><strong>Branch mapping</strong>: Uses existing branchCode → provinceId</li>
              <li><strong>No conflicts</strong>: Prevents infinite loops</li>
              <li><strong>Tracking</strong>: Marks documents with _autoMigrated flag</li>
            </ul>
          </Col>
          <Col span={12}>
            <Typography.Title level={4}>⚡ Benefits</Typography.Title>
            <ul>
              <li><strong>Zero downtime</strong>: Migration happens during normal operations</li>
              <li><strong>Gradual transition</strong>: Handles version gaps seamlessly</li>
              <li><strong>Production safe</strong>: Only adds fields, never modifies existing</li>
              <li><strong>Automatic cleanup</strong>: Functions can be removed when complete</li>
              <li><strong>Monitoring</strong>: Real-time progress tracking</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AutoMigrationMonitor; 