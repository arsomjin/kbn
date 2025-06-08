/**
 * Executive Dashboard
 * Clean, special, modern design for executive-level users with full system access
 */

import React, { useState } from 'react';
import { Row, Col, Card, Progress, Badge, Table, Tabs, Alert, Statistic } from 'antd';
import {
  DollarOutlined,
  TrophyOutlined,
  TeamOutlined,
  RiseOutlined,
  BarChartOutlined,
  GlobalOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  BankOutlined,
  LineChartOutlined,
  PercentageOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

const ExecutiveDashboard = () => {
  const [activeTab, setActiveTab] = useState('1');

  // Executive-level data
  const executiveMetrics = {
    totalRevenue: 45680000,
    netProfit: 12340000,
    marketShare: 34.5,
    customerSatisfaction: 96,
    operationalEfficiency: 89,
    teamPerformance: 94,
    strategicGoals: 78,
    riskScore: 12
  };

  const executiveAlerts = [
    { level: 'success', message: 'เป้าหมายรายได้ไตรมาส 4 เกินเป้า 12%' },
    { level: 'warning', message: 'การขยายตลาดนครสวรรค์เป็นไปตามกำหนด' },
    { level: 'info', message: 'โครงการเชิงกลยุทธ์ 3 โครงการรอการทบทวน' }
  ];

  const executiveActivities = [
    { key: '1', time: '09:00', activity: 'ประชุมคณะกรรมการ - ทบทวนการเงินไตรมาส 4', status: 'เสร็จสิ้น', priority: 'สูง' },
    { key: '2', time: '11:30', activity: 'ประชุมวางแผนเชิงกลยุทธ์', status: 'กำลังดำเนินการ', priority: 'สูง' },
    { key: '3', time: '14:00', activity: 'ทบทวนการวิเคราะห์ตลาด', status: 'กำหนดการ', priority: 'ปานกลาง' },
    { key: '4', time: '16:00', activity: 'ประชุมซิงค์ทีมผู้บริหาร', status: 'กำหนดการ', priority: 'สูง' },
    { key: '5', time: '17:30', activity: 'โทรประชุมนักลงทุน', status: 'กำหนดการ', priority: 'ปานกลาง' }
  ];

  const keyInsights = [
    { title: 'ผลการดำเนินงานภูมิภาค', value: 'นครราชสีมานำโดยห่าง 23%', trend: 'up' },
    { title: 'การได้ลูกค้าใหม่', value: 'ลูกค้าใหม่ 1,247 รายในไตรมาสนี้', trend: 'up' },
    { title: 'ต้นทุนการดำเนินงาน', value: 'ลดลง 8.5% เมื่อเทียบกับปีก่อน', trend: 'down' },
    { title: 'ประสิทธิภาพทีม', value: 'เพิ่มขึ้น 15% ด้วยกระบวนการใหม่', trend: 'up' }
  ];

  const columns = [
    {
      title: 'เวลา',
      dataIndex: 'time',
      key: 'time',
      width: 80
    },
    {
      title: 'กิจกรรมผู้บริหาร',
      dataIndex: 'activity',
      key: 'activity'
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'เสร็จสิ้น' ? 'success' : 
                     status === 'กำลังดำเนินการ' ? 'processing' : 'default';
        return <Badge status={color} text={status} />;
      }
    },
    {
      title: 'ลำดับความสำคัญ',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const color = priority === 'สูง' ? 'red' : 
                     priority === 'ปานกลาง' ? 'orange' : 'blue';
        return <Badge color={color} text={priority} />;
      }
    }
  ];

  return (
    <div className="main-content-container px-4" style={{ width: '100%', padding: '0 16px' }}>
      {/* Executive Header */}
      <Row className="page-header py-4" gutter={0}>
        <Col span={24}>
          <div className="page-title mb-0" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CrownOutlined style={{ fontSize: '28px', color: '#722ed1' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>
                Executive Command Center
              </h1>
              <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>
                Strategic oversight and business intelligence
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Executive Alerts */}
      <Row className="mb-4">
        <Col span={24}>
          {executiveAlerts.map((alert, index) => (
            <Alert
              key={index}
              message={alert.message}
              type={alert.level}
              showIcon
              className="mb-2"
              style={{ 
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          ))}
        </Col>
      </Row>

      {/* Key Performance Indicators */}
      <Row gutter={[24, 24]} className="mb-4">
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card className="gradient-card-executive-purple h-100">
            <div className="text-center text-white">
              <DollarOutlined style={{ fontSize: '3rem', marginBottom: '16px' }} />
              <Statistic
                title={<span style={{ color: 'white', fontSize: '1.1rem' }}>รายได้รวม</span>}
                value={executiveMetrics.totalRevenue}
                prefix="฿"
                valueStyle={{ color: 'white', fontSize: '2.2rem', fontWeight: 'bold' }}
                formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card className="gradient-card-executive-gold h-100">
            <div className="text-center text-white">
              <TrophyOutlined style={{ fontSize: '3rem', marginBottom: '16px' }} />
              <Statistic
                title={<span style={{ color: 'white', fontSize: '1.1rem' }}>กำไรสุทธิ</span>}
                value={executiveMetrics.netProfit}
                prefix="฿"
                valueStyle={{ color: 'white', fontSize: '2.2rem', fontWeight: 'bold' }}
                formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card className="gradient-card-executive-green h-100">
            <div className="text-center text-white">
              <PercentageOutlined style={{ fontSize: '3rem', marginBottom: '16px' }} />
              <Statistic
                title={<span style={{ color: 'white', fontSize: '1.1rem' }}>เพิ่มขึ้น</span>}
                value={executiveMetrics.marketShare}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '2.2rem', fontWeight: 'bold' }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Strategic Performance Metrics */}
      <Row gutter={[24, 24]} className="mb-4">
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="executive-metric-card h-100">
            <div className="text-center">
              <RiseOutlined style={{ fontSize: '2.5rem', color: '#52c41a', marginBottom: '12px' }} />
              <Statistic
                title="ความพึงพอใจลูกค้า"
                value={executiveMetrics.customerSatisfaction}
                suffix="%"
                valueStyle={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a1a' }}
              />
              <Progress 
                percent={executiveMetrics.customerSatisfaction} 
                strokeColor="#52c41a" 
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="executive-metric-card h-100">
            <div className="text-center">
              <ThunderboltOutlined style={{ fontSize: '2.5rem', color: '#1890ff', marginBottom: '12px' }} />
              <Statistic
                title="ประสิทธิภาพการดำเนินงาน"
                value={executiveMetrics.operationalEfficiency}
                suffix="%"
                valueStyle={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a1a' }}
              />
              <Progress 
                percent={executiveMetrics.operationalEfficiency} 
                strokeColor="#1890ff" 
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="executive-metric-card h-100">
            <div className="text-center">
              <TeamOutlined style={{ fontSize: '2.5rem', color: '#fa8c16', marginBottom: '12px' }} />
              <Statistic
                title="ประสิทธิภาพทีม"
                value={executiveMetrics.teamPerformance}
                suffix="%"
                valueStyle={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a1a' }}
              />
              <Progress 
                percent={executiveMetrics.teamPerformance} 
                strokeColor="#fa8c16" 
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="executive-metric-card h-100">
            <div className="text-center">
              <GlobalOutlined style={{ fontSize: '2.5rem', color: '#722ed1', marginBottom: '12px' }} />
              <Statistic
                title="เป้าหมายเชิงกลยุทธ์"
                value={executiveMetrics.strategicGoals}
                suffix="%"
                valueStyle={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a1a' }}
              />
              <Progress 
                percent={executiveMetrics.strategicGoals} 
                strokeColor="#722ed1" 
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Executive Intelligence Tabs */}
      <Row className="mb-4">
        <Col span={24}>
          <Card className="executive-intelligence-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              size="large"
              style={{ minHeight: '400px' }}
            >
              <TabPane 
                tab={
                  <span>
                    <BarChartOutlined />
                    กำหนดการวันนี้
                  </span>
                } 
                key="1"
              >
                <div style={{ minHeight: '350px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#1a1a1a', fontSize: '1.3rem' }}>
                     กำหนดการและกิจกรรมผู้บริหาร
                   </h3>
                  <div className="executive-table-container">
                    <Table 
                      columns={columns} 
                      dataSource={executiveActivities} 
                      pagination={false}
                      size="large"
                      scroll={{ x: 600 }}
                      style={{ 
                        background: 'white',
                        borderRadius: '12px',
                        minWidth: '600px'
                      }}
                    />
                  </div>
                </div>
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <LineChartOutlined />
                    ข้อมูลเชิงลึกสำคัญ
                  </span>
                } 
                key="2"
              >
                <div style={{ minHeight: '350px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#1a1a1a', fontSize: '1.3rem' }}>
                    ข้อมูลเชิงลึกเชิงกลยุทธ์ทางธุรกิจ
                  </h3>
                  <Row gutter={[16, 16]}>
                    {keyInsights.map((insight, index) => (
                      <Col xs={24} sm={12} md={12} lg={12} xl={12} key={index}>
                        <Card className="insight-card" style={{ borderRadius: '12px', height: '120px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                                {insight.title}
                              </div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a1a' }}>
                                {insight.value}
                              </div>
                            </div>
                            <div style={{ fontSize: '1.5rem', color: insight.trend === 'up' ? '#52c41a' : '#ff4d4f' }}>
                              {insight.trend === 'up' ? '↗️' : '↘️'}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </TabPane>

              <TabPane 
                tab={
                  <span>
                    <BankOutlined />
                    รายงานผู้บริหาร
                  </span>
                } 
                key="3"
              >
                <div style={{ minHeight: '350px', textAlign: 'center', paddingTop: '100px' }}>
                  <GlobalOutlined style={{ fontSize: '4rem', color: '#d9d9d9', marginBottom: '20px' }} />
                  <h3 style={{ color: '#666' }}>ศูนย์รายงานผู้บริหาร</h3>
                  <p style={{ color: '#999' }}>
                    ระบบข่าวกรองทางธุรกิจและรายงานผู้บริหารที่ครอบคลุมจะพร้อมใช้งานที่นี่
                  </p>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ExecutiveDashboard; 