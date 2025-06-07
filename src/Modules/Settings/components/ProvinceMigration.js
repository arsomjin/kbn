import React, { useState, useContext } from 'react';
import { Card, CardHeader, CardBody, Button, Alert, Progress } from 'shards-react';
import { FirebaseContext } from '../../../firebase';
import { showSuccess, showWarn } from 'functions';

const INITIAL_PROVINCES = [
  {
    provinceCode: 'NMA',
    provinceName: 'นครราชสีมา',
    provinceNameEn: 'Nakhon Ratchasima',
    region: 'อีสาน',
    isActive: true,
    manager: null,
    branches: ['0450'], // Existing main branch
    createdAt: Date.now(),
    updatedAt: Date.now(),
    remark: 'จังหวัดหลัก - ดำเนินการมาแล้ว'
  },
  {
    provinceCode: 'NSN',
    provinceName: 'นครสวรรค์',
    provinceNameEn: 'Nakhon Sawan',
    region: 'กลาง',
    isActive: true,
    manager: null,
    branches: [], // Will be populated when branches are created
    createdAt: Date.now(),
    updatedAt: Date.now(),
    remark: 'จังหวัดใหม่ - ขยายในเฟส 1'
  }
];

const NAKHON_SAWAN_BRANCHES = [
  {
    branchCode: 'NSN001',
    branchName: 'สาขานครสวรรค์ 1',
    provinceCode: 'นครสวรรค์',
    region: 'กลาง',
    locationId: null,
    warehouseId: null,
    isActive: true,
    manager: null,
    queue: 1,
    remark: 'สาขาแรกในนครสวรรค์'
  },
  {
    branchCode: 'NSN002',
    branchName: 'สาขานครสวรรค์ 2',
    provinceCode: 'นครสวรรค์',
    region: 'กลาง',
    locationId: null,
    warehouseId: null,
    isActive: true,
    manager: null,
    queue: 2,
    remark: 'สาขาที่สองในนครสวรรค์'
  },
  {
    branchCode: 'NSN003',
    branchName: 'สาขานครสวรรค์ 3',
    provinceCode: 'นครสวรรค์',
    region: 'กลาง',
    locationId: null,
    warehouseId: null,
    isActive: true,
    manager: null,
    queue: 3,
    remark: 'สาขาที่สามในนครสวรรค์'
  }
];

const ProvinceMigration = () => {
  const { api } = useContext(FirebaseContext);
  const [migrationStatus, setMigrationStatus] = useState('ready'); // ready, running, completed, error
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [migrationResults, setMigrationResults] = useState([]);

  const updateProgress = (step, progressValue) => {
    setCurrentStep(step);
    setProgress(progressValue);
  };

  const addResult = (message, type = 'info') => {
    setMigrationResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runMigration = async () => {
    try {
      setMigrationStatus('running');
      setProgress(0);
      setMigrationResults([]);

      addResult('เริ่มต้นการย้ายข้อมูลจังหวัด...', 'info');

      // Step 1: Create Provinces
      updateProgress('สร้างข้อมูลจังหวัด...', 20);
      for (const province of INITIAL_PROVINCES) {
        await api.setProvince(province);
        addResult(`สร้างจังหวัด: ${province.provinceName}`, 'success');
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      }

      // Step 2: Update existing Nakhon Ratchasima branch
      updateProgress('อัปเดตสาขานครราชสีมา...', 40);
      try {
        // Get current branch data and update with province info
        await api.setBranch({
          branchCode: '0450',
          provinceCode: 'นครราชสีมา',
          region: 'อีสาน'
        });
        addResult('อัปเดตสาขานครราชสีมาแล้ว', 'success');
      } catch (e) {
        addResult('ไม่สามารถอัปเดตสาขานครราชสีมาได้: ' + e.message, 'warning');
      }

      // Step 3: Create Nakhon Sawan branches
      updateProgress('สร้างสาขานครสวรรค์...', 60);
      for (const branch of NAKHON_SAWAN_BRANCHES) {
        await api.setBranch(branch);
        addResult(`สร้างสาขา: ${branch.branchName}`, 'success');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Step 4: Update Nakhon Sawan province with branch list
      updateProgress('อัปเดตรายการสาขาในจังหวัด...', 80);
      const nsnBranchCodes = NAKHON_SAWAN_BRANCHES.map(b => b.branchCode);
      const updatedNsnProvince = {
        ...INITIAL_PROVINCES[1],
        branches: nsnBranchCodes,
        updatedAt: Date.now()
      };
      await api.setProvince(updatedNsnProvince);
      addResult('อัปเดตรายการสาขาในนครสวรรค์แล้ว', 'success');

      // Step 5: Refresh data
      updateProgress('รีเฟรชข้อมูล...', 100);
      api.getProvinces();
      api.getBranches();
      
      setMigrationStatus('completed');
      addResult('การย้ายข้อมูลเสร็จสมบูรณ์!', 'success');
      showSuccess(null, 'การย้ายข้อมูลจังหวัดเสร็จสมบูรณ์');

    } catch (error) {
      setMigrationStatus('error');
      addResult('เกิดข้อผิดพลาด: ' + error.message, 'error');
      showWarn('เกิดข้อผิดพลาดในการย้ายข้อมูล: ' + error.message);
    }
  };

  const resetMigration = () => {
    setMigrationStatus('ready');
    setProgress(0);
    setCurrentStep('');
    setMigrationResults([]);
  };

  return (
    <Card>
      <CardHeader>
        <h6 className="m-0">การย้ายข้อมูลจังหวัด - เฟส 1</h6>
      </CardHeader>
      <CardBody>
        <div className="mb-3">
          <p>
            การย้ายข้อมูลนี้จะสร้างโครงสร้างจังหวัดและสาขาใหม่สำหรับการขยายไปยังนครสวรรค์
          </p>
          <ul>
            <li>สร้างข้อมูลจังหวัด: นครราชสีมา และ นครสวรรค์</li>
            <li>อัปเดตสาขาเดิมให้เชื่อมโยงกับจังหวัด</li>
            <li>สร้างสาขาใหม่ 3 สาขาในนครสวรรค์ (NSN001, NSN002, NSN003)</li>
          </ul>
        </div>

        {migrationStatus === 'running' && (
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small>{currentStep}</small>
              <small>{progress}%</small>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="mb-3">
          {migrationStatus === 'ready' && (
            <Button theme="success" onClick={runMigration}>
              เริ่มการย้ายข้อมูล
            </Button>
          )}
          
          {migrationStatus === 'running' && (
            <Button disabled>
              กำลังดำเนินการ...
            </Button>
          )}
          
          {(migrationStatus === 'completed' || migrationStatus === 'error') && (
            <Button theme="outline-secondary" onClick={resetMigration}>
              รีเซ็ต
            </Button>
          )}
        </div>

        {migrationResults.length > 0 && (
          <div className="migration-log" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <h6>ผลการดำเนินการ:</h6>
            {migrationResults.map((result, index) => (
              <Alert 
                key={index} 
                theme={
                  result.type === 'success' ? 'success' :
                  result.type === 'warning' ? 'warning' :
                  result.type === 'error' ? 'danger' : 'info'
                }
                className="py-2 px-3 mb-2"
              >
                <small>
                  <strong>{result.timestamp}</strong> - {result.message}
                </small>
              </Alert>
            ))}
          </div>
        )}

        {migrationStatus === 'completed' && (
          <Alert theme="success" className="mt-3">
            <strong>สำเร็จ!</strong> การย้ายข้อมูลจังหวัดเสร็จสมบูรณ์ 
            ตอนนี้ระบบพร้อมสำหรับการขยายไปยังหลายจังหวัดแล้ว
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};

export default ProvinceMigration; 