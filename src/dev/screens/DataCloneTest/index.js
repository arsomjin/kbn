import React, { useState, useContext } from 'react';
import { Card, Button, Typography, Space, Alert, Divider } from 'antd';
import {
  RocketOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { FirebaseContext } from '../../../firebase';
import { useSelector } from 'react-redux';
import { createKeywords } from 'utils';
import { uniq } from 'lodash';

const { Title, Text, Paragraph } = Typography;

const DataCloneTest = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState(['Ready to clone data...']);
  const [clonedCount, setClonedCount] = useState(0);

  const { firestore } = useContext(FirebaseContext);
  const { user } = useSelector((state) => state.auth);

  const addLog = (message) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
    console.log(message);
  };

  // 🔧 ENHANCED: Update keywords for transformed customer names
  const updateDocumentKeywords = (document, newCustomerName, newDocumentId) => {
    try {
      // Create new keywords for the updated customer name and document ID
      const customerKeywords = createKeywords(newCustomerName.toLowerCase());
      const documentIdKeywords = newDocumentId
        ? createKeywords(newDocumentId.toLowerCase())
        : [];

      // Preserve existing keywords (excluding old customer name keywords)
      const existingKeywords = document.keywords || [];

      // Combine all keywords and remove duplicates
      const updatedKeywords = uniq([
        ...existingKeywords,
        ...customerKeywords,
        ...documentIdKeywords,
      ]);

      return {
        ...document,
        customerName: newCustomerName,
        keywords: updatedKeywords,
      };
    } catch (error) {
      console.warn('Keywords update error:', error);
      return {
        ...document,
        customerName: newCustomerName,
      };
    }
  };

  const cloneData = async () => {
    if (!firestore) {
      addLog('❌ Firebase not available!');
      return;
    }

    setLoading(true);
    addLog('🚀 Starting data cloning for Nakhon Sawan...');

    // Simple mappings
    const branchMap = {
      '0450': 'NSN001',
      '0451': 'NSN002',
      '0452': 'NSN003',
      '0453': 'NSN001',
      '0454': 'NSN002',
      '0455': 'NSN003',
    };

    const customers = [
      'นายสมชาย นครสวรรค์',
      'นางมาลี ตาคลี',
      'บริษัท เกษตรสีเขียว จำกัด',
      'นายประยุทธ หนองบัว',
    ];

    try {
      // 1. Clone accounting documents
      addLog('📊 Fetching accounting documents...');
      const accountingDocs = await firestore
        .collection('sections')
        .doc('account')
        .collection('incomes')
        .where('incomeCategory', '==', 'daily')
        .limit(20)
        .get();

      addLog(`Found ${accountingDocs.size} accounting documents`);

      const batch1 = firestore.batch();
      let count1 = 0;

      accountingDocs.forEach((doc) => {
        const data = doc.data();
        const newBranch = branchMap[data.branchCode] || 'NSN001';
        const newId = `ACC-NSN-${Date.now()}-${count1}`;
        const newCustomerName = customers[count1 % customers.length];

        // 🔧 ENHANCED: Use keywords updating function for proper search functionality
        const baseData = {
          ...data,
          incomeId: newId,
          incomeCategory: 'daily',
          incomeSubCategory: data.incomeSubCategory || 'vehicles',
          incomeType: data.incomeType || 'cash',
          provinceId: 'nakhon-sawan',
          province: 'นครสวรรค์',
          branchCode: newBranch,
          branch: newBranch,
          date: new Date().toISOString().split('T')[0],
          created: Date.now(),
          createdBy: user?.uid || 'test-user',
          _cloned: true,
        };

        // Update keywords for proper search functionality
        const newData = updateDocumentKeywords(
          baseData,
          newCustomerName,
          newId
        );

        const newRef = firestore
          .collection('sections')
          .doc('account')
          .collection('incomes')
          .doc(newId);
        batch1.set(newRef, newData);
        count1++;
      });

      await batch1.commit();
      addLog(`✅ Cloned ${count1} accounting documents`);

      // 2. Clone sale documents
      addLog('🛒 Fetching sale documents...');
      const saleDocs = await firestore
        .collection('sections')
        .doc('sales')
        .collection('vehicles')
        .where('status', '==', 'approved')
        .limit(15)
        .get();

      addLog(`Found ${saleDocs.size} sale documents`);

      const batch2 = firestore.batch();
      let count2 = 0;

      saleDocs.forEach((doc) => {
        const data = doc.data();
        const newBranch = branchMap[data.branchCode] || 'NSN001';
        const newId = `SO-NSN-${Date.now()}-${count2}`;
        const newCustomerName = customers[count2 % customers.length];

        // 🔧 ENHANCED: Use keywords updating function for proper search functionality
        const baseData = {
          ...data,
          saleId: newId,
          saleNo: newId,
          saleCategory: 'daily',
          saleSubCategory: data.saleSubCategory || 'vehicles',
          saleType: data.saleType || 'cash',
          provinceId: 'nakhon-sawan',
          province: 'นครสวรรค์',
          branchCode: newBranch,
          branch: newBranch,
          date: new Date().toISOString().split('T')[0],
          created: Date.now(),
          createdBy: user?.uid || 'test-user',
          _cloned: true,
        };

        // Update keywords for proper search functionality
        const newData = updateDocumentKeywords(
          baseData,
          newCustomerName,
          newId
        );

        const newRef = firestore
          .collection('sections')
          .doc('sales')
          .collection('vehicles')
          .doc(newId);
        batch2.set(newRef, newData);
        count2++;
      });

      await batch2.commit();
      addLog(`✅ Cloned ${count2} sale documents`);

      const totalCloned = count1 + count2;
      setClonedCount(totalCloned);
      addLog(`\n🎉 SUCCESS! Created ${totalCloned} documents for Nakhon Sawan`);
      addLog('🔍 Test searches: ACC-NSN, SO-NSN, สมชาย, มาลี');
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
      console.error('Clone error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupData = async () => {
    if (!firestore) {
      addLog('❌ Firebase not available!');
      return;
    }

    setLoading(true);
    addLog('🧹 Cleaning up cloned data...');

    try {
      const [accDocs, saleDocs] = await Promise.all([
        firestore
          .collection('sections')
          .doc('account')
          .collection('incomes')
          .where('_cloned', '==', true)
          .get(),
        firestore
          .collection('sections')
          .doc('sales')
          .collection('vehicles')
          .where('_cloned', '==', true)
          .get(),
      ]);

      const batch = firestore.batch();
      accDocs.forEach((doc) => batch.delete(doc.ref));
      saleDocs.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();

      const totalCleaned = accDocs.size + saleDocs.size;
      addLog(`✅ Cleaned up ${totalCleaned} cloned documents`);
      setClonedCount(0);
    } catch (error) {
      addLog(`❌ Cleanup error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>🎯 KBN Data Cloning Test</Title>

        <Alert
          message='Data Cloning for Nakhon Sawan Province'
          description='This tool clones existing Nakhon Ratchasima data and transforms it for Nakhon Sawan testing.'
          type='info'
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Space size='large' style={{ marginBottom: '24px' }}>
          <Button
            type='primary'
            icon={<RocketOutlined />}
            loading={loading}
            onClick={cloneData}
            size='large'
          >
            Clone Data (20+15 docs)
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            loading={loading}
            onClick={cleanupData}
            size='large'
          >
            Cleanup Cloned Data
          </Button>
        </Space>

        {clonedCount > 0 && (
          <Alert
            message={`${clonedCount} documents cloned successfully!`}
            description='Test the dual-search system with: ACC-NSN, SO-NSN, สมชาย, มาลี'
            type='success'
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Divider />

        <Title level={4}>📋 Activity Log</Title>
        <div
          style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {log}
            </div>
          ))}
        </div>

        <Divider />

        <Title level={4}>🔍 Test Instructions</Title>
        <Paragraph>
          <Text strong>After cloning data:</Text>
          <ol>
            <li>Go to Income Daily page</li>
            <li>
              Test search with: <Text code>ACC-NSN</Text>,{' '}
              <Text code>SO-NSN</Text>
            </li>
            <li>
              Test customer search: <Text code>สมชาย</Text>,{' '}
              <Text code>มาลี</Text>
            </li>
            <li>
              Verify dual-search works for both accounting and sale documents
            </li>
          </ol>
        </Paragraph>

        <Alert
          message='Branch Mapping'
          description='0450→NSN001, 0451→NSN002, 0452→NSN003 (Nakhon Sawan branches)'
          type='info'
        />
      </Card>
    </div>
  );
};

export default DataCloneTest;
