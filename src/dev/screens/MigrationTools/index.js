import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Card, Button, Alert, Badge, Progress, Typography } from 'antd';
import { 
  DatabaseOutlined,
  UploadOutlined,
  RollbackOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { usePermissions } from 'hooks/usePermissions';
import { useGeographicData } from 'hooks/useGeographicData';
import { executePhase1Migration, validatePreProductionReadiness } from 'utils/migration/executeMigration';
import { getDatabaseInfo } from 'utils/environmentConfig';
import { executePhase1Rollback, verifyCurrentState } from 'utils/migration/rollbackUtility';

const { Title, Text } = Typography;

const MigrationTools = () => {
  const { user } = useSelector(state => state.auth);
  const { provinces } = useSelector(state => state.provinces);
  const { branches } = useSelector(state => state.data);
  
  const [migrationResult, setMigrationResult] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [dbInfo, setDbInfo] = useState(null);
  const [readinessCheck, setReadinessCheck] = useState(null);
  const [rollbackStatus, setRollbackStatus] = useState('idle');
  const [currentState, setCurrentState] = useState(null);
  
  const { 
    userAccessLevel,
    userProvinces,
    userBranches
  } = usePermissions();
  
  const { 
    userScope,
    accessibleProvinces,
    accessibleBranches,
    checkProvinceAccess,
    checkBranchAccess
  } = useGeographicData();

  useEffect(() => {
    // Get database info on component mount
    const info = getDatabaseInfo();
    setDbInfo(info);
    addLog(`Connected to: ${info.projectId} (${info.environment})`);
  }, []);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleRunReadinessCheck = async () => {
    try {
      addLog('🔍 Running pre-production readiness check...');
      const result = await validatePreProductionReadiness();
      setReadinessCheck(result);
      
      if (result.ready) {
        addLog('✅ System ready for production migration');
      } else {
        addLog('❌ System not ready for production migration');
        if (result.recommendations) {
          result.recommendations.forEach(rec => addLog(`   • ${rec}`));
        }
      }
    } catch (error) {
      addLog(`❌ Readiness check failed: ${error.message}`);
    }
  };

  const handleMigration = async () => {
    setMigrationStatus('running');
    setMigrationResult(null);
    addLog('🚀 Starting Phase 1 Migration...');

    try {
      if (dbInfo?.isProduction) {
        addLog('🔴 PRODUCTION DATABASE DETECTED - Extra confirmation required');
      }
      
      const result = await executePhase1Migration();
      setMigrationResult(result);
      setMigrationStatus('completed');
      addLog('✅ Migration completed successfully');
    } catch (error) {
      setMigrationResult({ success: false, error: error.message });
      setMigrationStatus('error');
      addLog(`❌ Migration failed: ${error.message}`);
    }
  };

  const handleRollback = async () => {
    setRollbackStatus('running');
    addLog('🚨 Starting Phase 1 Rollback...');

    try {
      if (dbInfo?.isProduction) {
        addLog('🔴 PRODUCTION ROLLBACK - Extra confirmation required');
      }
      
      const result = await executePhase1Rollback();
      setRollbackStatus('completed');
      addLog('✅ Rollback completed successfully');
      
      // Refresh current state after rollback
      handleVerifyState();
    } catch (error) {
      setRollbackStatus('error');
      addLog(`❌ Rollback failed: ${error.message}`);
    }
  };

  const handleVerifyState = async () => {
    try {
      addLog('🔍 Verifying current database state...');
      const state = await verifyCurrentState();
      setCurrentState(state);
      addLog('✅ State verification completed');
    } catch (error) {
      addLog(`❌ State verification failed: ${error.message}`);
    }
  };

  const getEnvironmentBadge = () => {
    if (!dbInfo) return null;
    
    const { environment, isProduction } = dbInfo;
    const color = isProduction ? '#ff4d4f' : environment === 'test' ? '#faad14' : '#d9d9d9';
    
    return (
      <Badge 
        count={environment.toUpperCase()} 
        style={{ 
          backgroundColor: color,
          marginLeft: '8px'
        }}
      />
    );
  };

  const getReadinessBadge = () => {
    if (!readinessCheck) return null;
    
    return (
      <Badge 
        count={readinessCheck.ready ? 'READY' : 'NOT READY'} 
        style={{ 
          backgroundColor: readinessCheck.ready ? '#52c41a' : '#ff4d4f',
          marginLeft: '8px'
        }}
      />
    );
  };

  // Test data structure alignment
  const testDataAlignment = () => {
    console.log('🧪 Testing Data Structure Alignment...');
    
    // Test 1: Province-Branch Relationship
    console.log('1️⃣ Testing Province-Branch Relationship:');
    Object.keys(branches).forEach(branchCode => {
      const branch = branches[branchCode];
      const province = provinces[branch.provinceId];
      
      console.log(`Branch ${branchCode}:`, {
        branchName: branch.branchName,
        provinceId: branch.provinceId,
        provinceFound: !!province,
        provinceName: province?.name
      });
    });

    // Test 2: User Geographic Access
    console.log('2️⃣ Testing User Geographic Access:');
    console.log('User Access Level:', userAccessLevel);
    console.log('User Provinces:', userProvinces);
    console.log('User Branches:', userBranches);
    console.log('User Scope:', userScope);

    // Test 3: Permission Checks
    console.log('3️⃣ Testing Permission Checks:');
    Object.keys(provinces).forEach(provinceKey => {
      const canAccess = checkProvinceAccess(provinceKey);
      console.log(`Province ${provinceKey}: ${canAccess ? '✅' : '❌'}`);
    });

    Object.keys(branches).slice(0, 5).forEach(branchCode => {
      const canAccess = checkBranchAccess(branchCode);
      console.log(`Branch ${branchCode}: ${canAccess ? '✅' : '❌'}`);
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>
          <DatabaseOutlined /> Migration Tools
        </Title>
        {getEnvironmentBadge()}
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={3}>🚀 Phase 1 Migration</Title>
            <Text>Test the multi-province functionality and data structure alignment.</Text>
          </Card>
        </Col>

        {/* Environment Status Card */}
        <Col span={24}>
          <Card title={<span><DatabaseOutlined /> Database Connection Status</span>}>
            {dbInfo && (
              <div>
                <p><strong>Project ID:</strong> {dbInfo.projectId}</p>
                <p><strong>Environment:</strong> {dbInfo.environment}</p>
                <p><strong>Is Production:</strong> {dbInfo.isProduction ? '🔴 YES' : '✅ NO'}</p>
                
                {dbInfo.isProduction && (
                  <Alert
                    message="⚠️ PRODUCTION DATABASE WARNING"
                    description="You are connected to the LIVE production database. All operations will affect real data."
                    type="warning"
                    showIcon
                  />
                )}
              </div>
            )}
          </Card>
        </Col>

        {/* Production Readiness Check Card */}
        <Col span={24}>
          <Card title={<span><CheckCircleOutlined /> Production Readiness Check</span>}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={5}>Production Readiness Check</Title>
              {getReadinessBadge()}
            </div>
            
            <Button 
              type="default" 
              icon={<CheckCircleOutlined />}
              onClick={handleRunReadinessCheck}
              style={{ marginBottom: '16px' }}
            >
              Run Readiness Check
            </Button>
            
            {readinessCheck && (
              <div>
                <Title level={6}>Checklist Status:</Title>
                <ul>
                  <li>Environment Config: {readinessCheck.checks.environmentConfig ? '✅' : '❌'}</li>
                  <li>Migration Data: {readinessCheck.checks.migrationData ? '✅' : '❌'}</li>
                  <li>Backup Verified: {readinessCheck.checks.backupVerified ? '✅' : '❌'}</li>
                  <li>Rollback Plan: {readinessCheck.checks.rollbackPlan ? '✅' : '❌'}</li>
                </ul>
                
                {!readinessCheck.ready && readinessCheck.recommendations && (
                  <Alert
                    message="Recommendations:"
                    description={
                      <ul style={{ marginBottom: 0 }}>
                        {readinessCheck.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    }
                    type="warning"
                  />
                )}
              </div>
            )}
          </Card>
        </Col>

        {/* Migration Execution Card */}
        <Col span={24}>
          <Card title={<span><UploadOutlined /> Phase 1 Migration Execution</span>}>
            <p>Execute migration to add Nakhon Sawan province with 3 branches</p>
            
            <div style={{ marginBottom: '16px' }}>
              <Button 
                type={dbInfo?.isProduction ? "danger" : "primary"}
                icon={<UploadOutlined />}
                onClick={handleMigration}
                disabled={migrationStatus === 'running'}
                style={{ marginRight: '8px' }}
              >
                {migrationStatus === 'running' ? 'Migrating...' : 
                 dbInfo?.isProduction ? '🔴 Execute Production Migration' : 'Execute Migration'}
              </Button>
              
              {migrationStatus === 'running' && (
                <Progress
                  percent={100}
                  status="active"
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>

            {migrationResult && (
              <Alert
                type={migrationResult.success ? 'success' : 'error'}
                message={migrationResult.success ? 'Migration Successful!' : 'Migration Failed'}
                description={migrationResult.success ? migrationResult.message : migrationResult.error}
                style={{ marginBottom: 16 }}
              />
            )}
          </Card>
        </Col>

        {/* Rollback & Verification Card */}
        <Col span={24}>
          <Card title={<span><RollbackOutlined /> Emergency Rollback & Verification</span>}>
            <p>Rollback Phase 1 migration or verify current database state</p>
            
            <div style={{ marginBottom: '16px' }}>
              <Button 
                danger
                icon={<RollbackOutlined />}
                onClick={handleRollback}
                disabled={rollbackStatus === 'running'}
                style={{ marginRight: 8 }}
              >
                {rollbackStatus === 'running' ? 'Rolling back...' : '🔄 Rollback Phase 1'}
              </Button>
              
              <Button 
                type="default"
                icon={<ExclamationCircleOutlined />}
                onClick={handleVerifyState}
                style={{ marginRight: 8 }}
              >
                🔍 Verify Current State
              </Button>
              
              {rollbackStatus === 'running' && (
                <Progress
                  percent={100}
                  status="active"
                  strokeColor="#ff7875"
                  style={{ marginTop: 8 }}
                />
              )}
            </div>

            {currentState && (
              <Alert
                type="info"
                message="📊 Current Database State"
                description={
                  <div>
                    <p><strong>Total Provinces:</strong> {currentState.analysis.totalProvinces}</p>
                    <p><strong>Total Branches:</strong> {currentState.analysis.totalBranches}</p>
                    <p><strong>Nakhon Ratchasima:</strong> {currentState.analysis.nakhonRatchasimaExists ? '✅' : '❌'}</p>
                    <p><strong>Nakhon Sawan:</strong> {currentState.analysis.nakhonSawanExists ? '✅' : '❌'}</p>
                    <p><strong>NSN Branches:</strong> {currentState.analysis.nsnBranches.length} ({currentState.analysis.nsnBranches.join(', ') || 'None'})</p>
                  </div>
                }
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Col>

        {/* Logs Card */}
        <Col span={24}>
          <Card title="📋 Migration Logs">
            <div 
              style={{ 
                height: '300px', 
                overflowY: 'auto', 
                backgroundColor: '#f8f9fa', 
                padding: '10px',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}
            >
              {logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  {log}
                </div>
              ))}
            </div>
            <Button 
              type="default" 
              icon={<ReloadOutlined />}
              size="small" 
              onClick={() => setLogs([])}
              style={{ marginTop: '8px' }}
            >
              Clear Logs
            </Button>
          </Card>
        </Col>

        {/* Data Structure Test */}
        <Col span={24}>
          <Card title="🔍 Data Structure Test" extra={
            <Button 
              icon={<CheckCircleOutlined />}
              onClick={testDataAlignment}
            >
              Run Tests (Check Console)
            </Button>
          }>
            <Row gutter={16}>
              <Col span={8}>
                <div>
                  <strong>Provinces ({Object.keys(provinces).length}):</strong>
                  <ul>
                    {Object.entries(provinces).map(([key, province]) => (
                      <li key={key}>
                        <code>{key}</code>: {province.name} ({province.code})
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <strong>Branches ({Object.keys(branches).length}):</strong>
                  <ul>
                    {Object.entries(branches).slice(0, 5).map(([code, branch]) => (
                      <li key={code}>
                        <code>{code}</code>: {branch.branchName}
                        <br />
                        <small>Province: <code>{branch.provinceId}</code></small>
                      </li>
                    ))}
                    {Object.keys(branches).length > 5 && (
                      <li><em>... and {Object.keys(branches).length - 5} more</em></li>
                    )}
                  </ul>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <strong>User Access:</strong>
                  <ul>
                    <li>Level: <code>{userAccessLevel}</code></li>
                    <li>Provinces: {userProvinces.length}</li>
                    <li>Branches: {userBranches.length}</li>
                  </ul>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Accessible Data Summary */}
        <Col span={24}>
          <Card title="📊 Accessible Data Summary">
            <Row gutter={16}>
              <Col span={12}>
                <Title level={4}>Accessible Provinces ({Object.keys(accessibleProvinces).length}):</Title>
                <ul>
                  {Object.entries(accessibleProvinces).map(([key, province]) => (
                    <li key={key}>
                      <code>{key}</code>: {province.name}
                    </li>
                  ))}
                </ul>
              </Col>
              <Col span={12}>
                <Title level={4}>Accessible Branches ({Object.keys(accessibleBranches).length}):</Title>
                <ul>
                  {Object.entries(accessibleBranches).slice(0, 10).map(([code, branch]) => (
                    <li key={code}>
                      <code>{code}</code>: {branch.branchName}
                    </li>
                  ))}
                  {Object.keys(accessibleBranches).length > 10 && (
                    <li><em>... and {Object.keys(accessibleBranches).length - 10} more</em></li>
                  )}
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Current User Information */}
        <Col span={24}>
          <Card title="👤 Current User Information">
            <Row gutter={16}>
              <Col span={12}>
                <Title level={4}>Basic Info:</Title>
                <ul>
                  <li>Display Name: {user?.displayName || 'N/A'}</li>
                  <li>Email: {user?.email || 'N/A'}</li>
                  <li>Access Level: {user?.accessLevel || 'N/A'}</li>
                </ul>
              </Col>
              <Col span={12}>
                <Title level={4}>Geographic Access:</Title>
                <ul>
                  <li>Allowed Provinces: {user?.allowedProvinces?.join(', ') || 'All'}</li>
                  <li>Allowed Branches: {user?.allowedBranches?.join(', ') || 'All'}</li>
                  <li>Home Province: {user?.homeProvince || 'N/A'}</li>
                  <li>Home Branch: {user?.homeBranch || 'N/A'}</li>
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MigrationTools; 