import React, { useState, useContext } from 'react';
import { Card, Button, notification, Space, Typography, Alert } from 'antd';
import { FirebaseContext } from '../../firebase';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const TestDataGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  const generateTestData = async () => {
    setLoading(true);
    try {
      // Sample vehicle sales data with provinceId
      const testSales = [
        {
          saleNo: 'TEST-001',
          customerName: 'นายทดสอบ ระบบ',
          customerPhone: '081-234-5678',
          vehicleModel: 'L4508',
          salePrice: 450000,
          provinceId: 'nakhon-ratchasima',
          branchCode: '0450',
          recordedProvince: 'nakhon-ratchasima',
          recordedBranch: '0450',
          created: Date.now(),
          createdBy: user.uid,
          status: 'completed'
        },
        {
          saleNo: 'TEST-002', 
          customerName: 'นางสาวทดสอบ การค้นหา',
          customerPhone: '082-345-6789',
          vehicleModel: 'M7040',
          salePrice: 780000,
          provinceId: 'nakhon-ratchasima',
          branchCode: '0451',  // Updated to real branch code
          recordedProvince: 'nakhon-ratchasima',
          recordedBranch: '0451',
          created: Date.now(),
          createdBy: user.uid,
          status: 'completed'
        },
        {
          saleNo: 'TEST-003',
          customerName: 'นายทดสอบ สาขา 0452',
          customerPhone: '084-567-8901',
          vehicleModel: 'L5018',
          salePrice: 520000,
          provinceId: 'nakhon-ratchasima', 
          branchCode: '0452',  // Additional real branch
          recordedProvince: 'nakhon-ratchasima',
          recordedBranch: '0452',
          created: Date.now(),
          createdBy: user.uid,
          status: 'completed'
        },
        {
          saleNo: 'TEST-NSN-001',
          customerName: 'นายนครสวรรค์ ทดสอบ',
          customerPhone: '083-456-7890', 
          vehicleModel: 'L3408',
          salePrice: 320000,
          provinceId: 'nakhon-sawan',
          branchCode: 'NSN001',
          recordedProvince: 'nakhon-sawan',
          recordedBranch: 'NSN001',
          created: Date.now(),
          createdBy: user.uid,
          status: 'completed'
        },
        {
          saleNo: 'TEST-NSN-002',
          customerName: 'นางสาวนครสวรรค์ ทดสอบ',
          customerPhone: '085-678-9012',
          vehicleModel: 'M6040',
          salePrice: 680000,
          provinceId: 'nakhon-sawan',
          branchCode: 'NSN002',  // Additional NSN branch
          recordedProvince: 'nakhon-sawan',
          recordedBranch: 'NSN002',
          created: Date.now(),
          createdBy: user.uid,
          status: 'completed'
        }
      ];

      // Add to Firebase
      for (const sale of testSales) {
        await firestore
          .collection('sections')
          .doc('sales')
          .collection('vehicles')
          .doc(sale.saleNo)
          .set(sale);
      }

      notification.success({
        message: 'เพิ่มข้อมูลทดสอบสำเร็จ',
        description: `เพิ่มข้อมูลการขาย ${testSales.length} รายการ พร้อม provinceId สำหรับทดสอบระบบ`
      });

    } catch (error) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title level={3}>🧪 เครื่องมือสร้างข้อมูลทดสอบ</Title>
      
      <Alert
        message="ทดสอบ Automatic ProvinceId Injection"
        description="เครื่องมือนี้จะสร้างข้อมูลตัวอย่างที่มี provinceId เพื่อทดสอบระบบการกรองข้อมูลตามจังหวัดอัตโนมัติ"
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>
          <strong>ข้อมูลทดสอบที่จะสร้าง (ใช้ branch code จริง):</strong>
        </Text>
        <ul>
          <li>TEST-001 → สาขา 0450 (nakhon-ratchasima)</li>
          <li>TEST-002 → สาขา 0451 (nakhon-ratchasima)</li>
          <li>TEST-003 → สาขา 0452 (nakhon-ratchasima)</li>
          <li>TEST-NSN-001 → สาขา NSN001 (nakhon-sawan)</li>
          <li>TEST-NSN-002 → สาขา NSN002 (nakhon-sawan)</li>
        </ul>

        <Button 
          type="primary" 
          onClick={generateTestData}
          loading={loading}
          size="large"
        >
          สร้างข้อมูลทดสอบ
        </Button>

        <Alert
          message="หลังจากสร้างข้อมูลแล้ว"
          description="ไปที่หน้า IncomeDaily → ค้นหาด้วยชื่อ 'ทดสอบ' หรือ 'TEST' จะเห็นเฉพาะข้อมูลที่อยู่ในจังหวัดเดียวกัน"
          type="success"
          showIcon
        />
      </Space>
    </Card>
  );
};

export default TestDataGenerator; 