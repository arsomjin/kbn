import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Card, Button, Alert, Badge, Progress, Typography, Tabs, Divider } from 'antd';
import { 
  DatabaseOutlined,
  UploadOutlined,
  RollbackOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  UserOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import { usePermissions } from 'hooks/usePermissions';
import { executePhase1Migration, validatePreProductionReadiness } from 'utils/migration/executeMigration';
import { getDatabaseInfo } from 'utils/environmentConfig';
import { executePhase1Rollback, verifyCurrentState } from 'utils/migration/rollbackUtility';
import { executeUrgentCleanSlateMigration } from 'utils/urgent-rbac-migration';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MigrationTools = () => {
  const { user } = useSelector(state => state.auth);
  const { provinces } = useSelector(state => state.provinces);
  const { branches } = useSelector(state => state.data);
  
  // Legacy migration states
  const [migrationResult, setMigrationResult] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState('idle');
  const [rollbackStatus, setRollbackStatus] = useState('idle');
  const [currentState, setCurrentState] = useState(null);
  const [readinessCheck, setReadinessCheck] = useState(null);
  
  // RBAC migration states
  const [rbacMigrationResult, setRbacMigrationResult] = useState(null);
  const [rbacMigrationStatus, setRbacMigrationStatus] = useState('idle');
  const [rbacMigrationLogs, setRbacMigrationLogs] = useState([]);
  
  const [logs, setLogs] = useState([]);
  const [dbInfo, setDbInfo] = useState(null);
  
  // Clean Slate RBAC - NEW hooks usage
  const { 
    hasPermission, 
    userRBAC, 
    accessibleProvinces: cleanSlateProvinces, 
    accessibleBranches: cleanSlateBranches,
    canAccessProvince,
    canAccessBranch
  } = usePermissions();

  useEffect(() => {
    // Get database info on component mount
    const info = getDatabaseInfo();
    setDbInfo(info);
    addLog(`Connected to: ${info.projectId} (${info.environment})`);
    
    // Check if user has Clean Slate structure
    if (user) {
      if (user.access && user.access.authority) {
        addLog(`✅ User has Clean Slate RBAC structure`);
        addLog(`Authority: ${user.access.authority}, Geographic: ${user.access.geographic?.scope}`);
      } else {
        addLog(`⚠️ User missing Clean Slate RBAC structure - URGENT migration needed!`);
      }
    }
  }, [user]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const addRbacLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setRbacMigrationLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // URGENT RBAC MIGRATION FUNCTIONS
  const handleUrgentRbacMigration = async (dryRun = false) => {
    setRbacMigrationStatus(dryRun ? 'testing' : 'running');
    setRbacMigrationResult(null);
    setRbacMigrationLogs([]);
    
    addRbacLog(`🚨 Starting ${dryRun ? 'TEST' : 'LIVE'} RBAC Migration...`);

    try {
      if (dbInfo?.isProduction && !dryRun) {
        addRbacLog('🔴 PRODUCTION DATABASE - LIVE MIGRATION STARTING');
      }
      
      const result = await executeUrgentCleanSlateMigration({ 
        dryRun, 
        logProgress: true 
      });
      
      setRbacMigrationResult(result);
      setRbacMigrationStatus('completed');
      
      addRbacLog(`✅ RBAC Migration ${dryRun ? 'test' : 'execution'} completed!`);
      addRbacLog(`📊 Results: ${result.migrated} migrated, ${result.alreadyCleanSlate} already Clean Slate`);
      
      if (result.errors.length > 0) {
        addRbacLog(`❌ ${result.errors.length} users failed migration`);
        result.errors.forEach(error => {
          addRbacLog(`   • ${error.email}: ${error.error}`);
        });
      }
      
    } catch (error) {
      setRbacMigrationResult({ success: false, error: error.message });
      setRbacMigrationStatus('error');
      addRbacLog(`❌ RBAC Migration failed: ${error.message}`);
    }
  };

  const handleTestRbacMigration = () => handleUrgentRbacMigration(true);
  const handleExecuteRbacMigration = () => handleUrgentRbacMigration(false);

  // LEGACY MIGRATION FUNCTIONS (unchanged)
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
      
      await executePhase1Rollback();
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

  // Clean Slate RBAC Testing
  const testCleanSlateRbac = () => {
    console.log('🧪 Testing Clean Slate RBAC System...');
    
    // Test 1: User RBAC Structure
    console.log('1️⃣ Clean Slate User RBAC:');
    console.log('User RBAC:', userRBAC);
    console.log('Has access structure:', !!user?.access);
    console.log('Authority:', user?.access?.authority);
    console.log('Geographic scope:', user?.access?.geographic?.scope);
    console.log('Departments:', user?.access?.departments);

    // Test 2: Permission Checking
    console.log('2️⃣ Clean Slate Permission Checks:');
    const testPermissions = [
      'accounting.view',
      'sales.edit', 
      'service.approve',
      'inventory.manage',
      'hr.view'
    ];
    
    testPermissions.forEach(permission => {
      const hasAccess = hasPermission(permission);
      console.log(`Permission ${permission}: ${hasAccess ? '✅' : '❌'}`);
    });

    // Test 3: Geographic Access
    console.log('3️⃣ Clean Slate Geographic Access:');
    console.log('Accessible Provinces:', cleanSlateProvinces);
    console.log('Accessible Branches:', cleanSlateBranches);
    
    Object.keys(provinces).forEach(provinceKey => {
      const canAccess = canAccessProvince(provinceKey);
      console.log(`Province ${provinceKey}: ${canAccess ? '✅' : '❌'}`);
    });

    Object.keys(branches).slice(0, 5).forEach(branchCode => {
      const canAccess = canAccessBranch(branchCode);
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

      <Tabs defaultActiveKey="urgent-rbac" type="card">
        {/* URGENT RBAC MIGRATION TAB */}
        <TabPane 
          tab={
            <span>
              <ThunderboltOutlined />
              🚨 URGENT RBAC Migration
            </span>
          } 
          key="urgent-rbac"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Alert
                message="🚨 URGENT: Clean Slate RBAC Migration Required"
                description="Users are missing Clean Slate access structure. This migration fixes 'permissions.some is not a function' errors and ensures proper RBAC functionality."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            </Col>

            {/* User Status Check */}
            <Col span={24}>
              <Card title={<span><UserOutlined /> Current User RBAC Status</span>}>
                {user?.access ? (
                  <Alert
                    type="success"
                    message="✅ User has Clean Slate RBAC structure"
                    description={
                      <div>
                        <p><strong>Authority:</strong> {user.access.authority}</p>
                        <p><strong>Geographic Scope:</strong> {user.access.geographic?.scope}</p>
                        <p><strong>Departments:</strong> {user.access.departments?.join(', ')}</p>
                      </div>
                    }
                  />
                ) : (
                  <Alert
                    type="error"
                    message="❌ User missing Clean Slate RBAC structure"
                    description="This user needs urgent migration to Clean Slate format"
                  />
                )}
              </Card>
            </Col>

            {/* RBAC Migration Execution */}
            <Col span={24}>
              <Card title={<span><SecurityScanOutlined /> RBAC Migration Execution</span>}>
                <p>Fix all users with missing Clean Slate access structure</p>
                
                <div style={{ marginBottom: '16px' }}>
                  <Button 
                    type="default"
                    icon={<CheckCircleOutlined />}
                    onClick={handleTestRbacMigration}
                    disabled={rbacMigrationStatus === 'testing' || rbacMigrationStatus === 'running'}
                    style={{ marginRight: '8px' }}
                  >
                    {rbacMigrationStatus === 'testing' ? 'Testing...' : '🧪 Test Migration (Dry Run)'}
                  </Button>
                  
                  <Button 
                    type={dbInfo?.isProduction ? "danger" : "primary"}
                    icon={<ThunderboltOutlined />}
                    onClick={handleExecuteRbacMigration}
                    disabled={rbacMigrationStatus === 'running' || rbacMigrationStatus === 'testing'}
                  >
                    {rbacMigrationStatus === 'running' ? 'Migrating...' : 
                     dbInfo?.isProduction ? '🔴 Execute Production Migration' : '⚡ Execute RBAC Migration'}
                  </Button>
                  
                  {(rbacMigrationStatus === 'running' || rbacMigrationStatus === 'testing') && (
                    <Progress
                      percent={100}
                      status="active"
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </div>

                {rbacMigrationResult && (
                  <div style={{ marginBottom: 16 }}>
                    <Alert
                      type={rbacMigrationResult.success !== false ? 'success' : 'error'}
                      message={rbacMigrationResult.success !== false ? 'RBAC Migration Successful!' : 'RBAC Migration Failed'}
                      description={
                        rbacMigrationResult.success !== false ? (
                          <div>
                            <p>📊 <strong>Total Users:</strong> {rbacMigrationResult.totalUsers}</p>
                            <p>✅ <strong>Successfully Migrated:</strong> {rbacMigrationResult.migrated}</p>
                            <p>📌 <strong>Already Clean Slate:</strong> {rbacMigrationResult.alreadyCleanSlate}</p>
                            <p>⚠️ <strong>Skipped (incomplete data):</strong> {rbacMigrationResult.skipped || 0}</p>
                            <p>❌ <strong>Failed:</strong> {rbacMigrationResult.failed}</p>
                          </div>
                        ) : rbacMigrationResult.error
                      }
                      style={{ marginBottom: 8 }}
                    />
                    
                    {/* Warnings for incomplete data */}
                    {rbacMigrationResult.warnings && rbacMigrationResult.warnings.length > 0 && (
                      <Alert
                        type="warning"
                        message={`⚠️ ${rbacMigrationResult.warnings.length} users migrated with fallback data`}
                        description={
                          <div>
                            <p>These users had missing email or displayName and were migrated with generated fallbacks:</p>
                            <ul style={{ marginBottom: 0 }}>
                              {rbacMigrationResult.warnings.slice(0, 5).map((warning, index) => (
                                <li key={index}>
                                  <strong>{warning.displayName}</strong>: {warning.reason}
                                </li>
                              ))}
                              {rbacMigrationResult.warnings.length > 5 && (
                                <li><em>... and {rbacMigrationResult.warnings.length - 5} more</em></li>
                              )}
                            </ul>
                          </div>
                        }
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>
                )}
              </Card>
            </Col>

            {/* RBAC Migration Logs */}
            <Col span={24}>
              <Card title="📋 RBAC Migration Logs">
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
                  {rbacMigrationLogs.length === 0 ? (
                    <Text type="secondary">No RBAC migration logs yet. Run a test or execute migration to see logs here.</Text>
                  ) : (
                    rbacMigrationLogs.map((log, index) => (
                      <div key={index} style={{ marginBottom: '4px' }}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
                <Button 
                  type="default" 
                  icon={<ReloadOutlined />}
                  size="small" 
                  onClick={() => setRbacMigrationLogs([])}
                  style={{ marginTop: '8px' }}
                >
                  Clear RBAC Logs
                </Button>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* MULTI-PROVINCE MIGRATION TAB */}
        <TabPane 
          tab={
            <span>
              <UploadOutlined />
              Multi-Province Migration
            </span>
          } 
          key="multi-province"
        >
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
                    <p><strong>Is Production:</strong> {dbInfo.isProduction ? '🔴' : '✅'} {dbInfo.isProduction ? 'YES' : 'NO'}</p>
                    
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

            {/* Legacy Logs Card */}
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
          </Row>
        </TabPane>

        {/* TESTING TAB */}
        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              RBAC Testing
            </span>
          } 
          key="testing"
        >
          <Row gutter={[16, 16]}>
            {/* Data Structure Test */}
            <Col span={24}>
              <Card title="🔍 Clean Slate RBAC Test" extra={
                <Button 
                  icon={<CheckCircleOutlined />}
                  onClick={testCleanSlateRbac}
                >
                  Run Clean Slate Tests (Check Console)
                </Button>
              }>
                <Row gutter={16}>
                  <Col span={8}>
                    <div>
                      <strong>Clean Slate Provinces ({cleanSlateProvinces.length}):</strong>
                      <ul>
                        {cleanSlateProvinces.map((province) => (
                          <li key={province}>
                            <code>{province}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <strong>Clean Slate Branches ({cleanSlateBranches.length}):</strong>
                      <ul>
                        {cleanSlateBranches.slice(0, 5).map((branch) => (
                          <li key={branch}>
                            <code>{branch}</code>
                          </li>
                        ))}
                        {cleanSlateBranches.length > 5 && (
                          <li><em>... and {cleanSlateBranches.length - 5} more</em></li>
                        )}
                      </ul>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <strong>Clean Slate User Access:</strong>
                      <ul>
                        <li>Authority: <code>{userRBAC?.authority || 'N/A'}</code></li>
                        <li>Geographic: <code>{userRBAC?.geographic?.scope || 'N/A'}</code></li>
                        <li>Departments: <code>{userRBAC?.departments?.join(', ') || 'N/A'}</code></li>
                        <li>Is Active: <code>{userRBAC?.isActive ? 'Yes' : 'No'}</code></li>
                      </ul>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Current User Information */}
            <Col span={24}>
              <Card title="👤 Current User Information (Clean Slate)">
                <Row gutter={16}>
                  <Col span={12}>
                    <Title level={4}>Basic Info:</Title>
                    <ul>
                      <li>Display Name: {user?.displayName || 'N/A'}</li>
                      <li>Email: {user?.email || 'N/A'}</li>
                      <li>Has Clean Slate: {user?.access ? '✅ Yes' : '❌ No'}</li>
                    </ul>
                  </Col>
                  <Col span={12}>
                    <Title level={4}>Clean Slate Access:</Title>
                    <ul>
                      <li>Authority: {user?.access?.authority || 'N/A'}</li>
                      <li>Geographic Scope: {user?.access?.geographic?.scope || 'N/A'}</li>
                      <li>Departments: {user?.access?.departments?.join(', ') || 'N/A'}</li>
                      <li>Version: {user?.access?.version || 'N/A'}</li>
                    </ul>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MigrationTools; 