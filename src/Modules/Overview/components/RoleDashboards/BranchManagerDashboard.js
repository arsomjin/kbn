/**
 * Branch Manager Dashboard - Branch-level Overview
 * Focus on single branch operations and staff management
 */

import React, { useState } from 'react';
import { Select, Statistic, Table, Progress, Tag, Tabs, Calendar, Badge, Row, Col, Card, Alert } from 'antd';
import { 
  UserOutlined, 
  BarChartOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  StarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

import PageTitle from 'components/common/PageTitle';
import { usePermissions } from 'hooks/usePermissions';
import { isMobile } from 'react-device-detect';
import './dashboard-styles.css';

const { Option } = Select;
const { TabPane } = Tabs;

const BranchManagerDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  const { homeLocation, accessibleBranches } = usePermissions();
  
  // Helper function to get branch name from branch code
  const getBranchName = (branchCode) => {
    if (!branchCode) return 'N/A';
    const branch = accessibleBranches.find(b => b.branchCode === branchCode);
    return branch?.branchName || branchCode; // Fallback to code if name not found
  };
  
  // Get user's branch code
  const userBranchCode = homeLocation.branch || 
    (accessibleBranches.length > 0 ? accessibleBranches[0].branchCode : 'N/A');
  
  // Get the display name for the branch
  const userBranchName = getBranchName(userBranchCode);

  // Enhanced branch metrics
  const branchMetrics = {
    todaySales: 85000,
    monthlyTarget: 1500000,
    monthlyActual: 1250000,
    totalStaff: 12,
    presentStaff: 10,
    pendingTasks: 5,
    completedToday: 8,
    customerSatisfaction: 92.5,
    weeklyGrowth: 8.3
  };

  // Mock today's activities
  const todayActivities = [
    {
      id: 1,
      time: '09:00',
      activity: 'เปิดร้าน',
      staff: 'นายสมชาย ใจดี',
      status: 'completed'
    },
    {
      id: 2,
      time: '10:30',
      activity: 'ขายรถแทรกเตอร์ Kubota M7040',
      staff: 'นางสมใส รักงาน',
      status: 'completed'
    },
    {
      id: 3,
      time: '14:00',
      activity: 'ประชุมทีมขาย',
      staff: 'ทีมขายทั้งหมด',
      status: 'in_progress'
    },
    {
      id: 4,
      time: '16:00',
      activity: 'รายงานยอดขายประจำวัน',
      staff: 'นายสมชาย ใจดี',
      status: 'pending'
    }
  ];

  // Mock staff performance
  const staffPerformance = [
    {
      id: 1,
      name: 'นางสมใส รักงาน',
      position: 'พนักงานขาย',
      salesTarget: 300000,
      salesActual: 380000,
      achievement: 126.7,
      tasks: 8,
      completed: 7,
      status: 'present'
    },
    {
      id: 2,
      name: 'นายสมศักดิ์ ทำงาน',
      position: 'พนักงานบัญชี',
      salesTarget: 0,
      salesActual: 0,
      achievement: 0,
      tasks: 5,
      completed: 5,
      status: 'present'
    },
    {
      id: 3,
      name: 'นางสาวสมหวัง ก้าวหน้า',
      position: 'พนักงานบริการ',
      salesTarget: 0,
      salesActual: 0,
      achievement: 0,
      tasks: 6,
      completed: 4,
      status: 'absent'
    }
  ];

  const activityColumns = [
    {
      title: 'เวลา',
      dataIndex: 'time',
      key: 'time',
      width: 80
    },
    {
      title: 'กิจกรรม',
      dataIndex: 'activity',
      key: 'activity',
      width: 200,
    },
    {
      title: 'ผู้รับผิดชอบ',
      dataIndex: 'staff',
      key: 'staff',
      width: 150,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const config = {
          completed: { color: 'green', text: 'เสร็จแล้ว' },
          in_progress: { color: 'blue', text: 'กำลังทำ' },
          pending: { color: 'orange', text: 'รอดำเนินการ' }
        };
        return (
          <Tag color={config[status]?.color}>
            {config[status]?.text}
          </Tag>
        );
      }
    }
  ];

  const staffColumns = [
    {
      title: 'ชื่อ-สกุล',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: 'ตำแหน่ง',
      dataIndex: 'position',
      key: 'position',
      width: 120,
    },
    {
      title: 'เป้าขาย',
      dataIndex: 'salesTarget',
      key: 'salesTarget',
      width: 100,
      render: (value) => value > 0 ? `${value.toLocaleString()} ฿` : '-'
    },
    {
      title: 'ยอดขายจริง',
      dataIndex: 'salesActual',
      key: 'salesActual',
      width: 120,
      render: (value) => value > 0 ? `${value.toLocaleString()} ฿` : '-'
    },
    {
      title: 'งานวันนี้',
      key: 'tasks',
      width: 120,
      render: (_, record) => (
        <div>
          <Progress 
            percent={Math.round((record.completed / record.tasks) * 100)}
            size="small"
            format={() => `${record.completed}/${record.tasks}`}
            className="enhanced-progress"
          />
        </div>
      )
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'present' ? 'green' : 'red'}>
          {status === 'present' ? 'มาทำงาน' : 'ขาดงาน'}
        </Tag>
      )
    }
  ];

  // Calendar event data
  const getCalendarData = (value) => {
    const events = [
      { date: '2024-01-15', type: 'success', content: 'ยอดขายดี' },
      { date: '2024-01-20', type: 'warning', content: 'ประชุมทีม' },
    ];
    // Implementation would go here
    return [];
  };

  return (
    <div className="main-content-container px-4" style={{ width: '100%', padding: '0 16px' }}>
      {/* Page Header */}
      <Row className="page-header py-4" gutter={0}>
        <Col span={24}>
          <PageTitle 
            title={`🏢 ภาพรวมสาขา: ${userBranchName}`}
            subtitle="Branch Manager Dashboard" 
            className="text-sm-left mb-3" 
          />
        </Col>
      </Row>

      {/* Time Range Selector */}
      <Row className="mb-4" gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <div style={{ marginBottom: '8px' }}>
            <label>ช่วงเวลา:</label>
          </div>
          <Select 
            value={timeRange} 
            onChange={setTimeRange}
            style={{ width: '100%' }}
          >
            <Option value="day">วันนี้</Option>
            <Option value="week">สัปดาห์นี้</Option>
            <Option value="month">เดือนนี้</Option>
            <Option value="year">ปีนี้</Option>
          </Select>
        </Col>
      </Row>

      {/* Enhanced Branch Metrics with Beautiful Gradient Cards */}
      <Row gutter={[16, 16]} className="mb-4 dashboard-metrics-row">
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-dark-blue card-1 text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>ยอดขายวันนี้</span>}
              value={branchMetrics.todaySales}
              precision={0}
              suffix=" ฿"
              prefix={<DollarOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-pink card-2 text-center" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>พนักงานเข้างาน</span>}
              value={branchMetrics.presentStaff}
              suffix={`/${branchMetrics.totalStaff}`}
              prefix={<TeamOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-blue card-3 text-center" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>เป้าหมายเดือนนี้</span>}
              value={branchMetrics.monthlyTarget}
              precision={0}
              suffix=" ฿"
              prefix={<BarChartOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-orange card-4 text-center" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>ยอดขายเดือนนี้</span>}
              value={branchMetrics.monthlyActual}
              precision={0}
              suffix=" ฿"
              prefix={<ShoppingCartOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics Row */}
      <Row gutter={[16, 16]} className="mb-4 dashboard-metrics-row">
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-5 text-center">
            <Statistic
              title={<span style={{ fontSize: '16px' }}>งานที่เสร็จวันนี้</span>}
              value={branchMetrics.completedToday}
              suffix={`/${branchMetrics.completedToday + branchMetrics.pendingTasks}`}
              prefix={<CheckCircleOutlined className="interactive-icon" />}
              valueStyle={{ color: '#52c41a' }}
              className="metric-number"
            />
            <div className="mt-2">
              <Progress 
                percent={Math.round((branchMetrics.completedToday / (branchMetrics.completedToday + branchMetrics.pendingTasks)) * 100)}
                size="small" 
                strokeColor="#52c41a"
                showInfo={false}
                className="enhanced-progress"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-6 text-center">
            <Statistic
              title={<span style={{ fontSize: '16px' }}>ความพึงพอใจลูกค้า</span>}
              value={branchMetrics.customerSatisfaction}
              precision={1}
              suffix="%"
              prefix={<StarOutlined className="interactive-icon" />}
              valueStyle={{ color: '#eb2f96' }}
              className="metric-number"
            />
            <div className="mt-2">
              <Tag color="green" className="status-tag-excellent">ดีเยี่ยม</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-7 text-center">
            <Statistic
              title={<span style={{ fontSize: '16px' }}>การเติบโตรายสัปดาห์</span>}
              value={branchMetrics.weeklyGrowth}
              precision={1}
              suffix="%"
              prefix={<TrophyOutlined className="interactive-icon" />}
              valueStyle={{ color: '#722ed1' }}
              className="metric-number"
            />
            <div className="mt-2">
              <small className="text-muted">
                เพิ่มขึ้นจากสัปดาห์ที่แล้ว
              </small>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-8 text-center">
            <Statistic
              title={<span style={{ fontSize: '16px' }}>งานค้างคิว</span>}
              value={branchMetrics.pendingTasks}
              prefix={<ClockCircleOutlined className="interactive-icon" />}
              valueStyle={{ color: '#fa8c16' }}
              className="metric-number"
            />
            <div className="mt-2">
              <Tag color="orange" className="status-tag-warning">ต้องติดตาม</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Progress Alert */}
      <Row className="mb-4" gutter={[16, 16]}>
        <Col xs={24}>
          <Alert
            className="enhanced-alert"
            message={
              <div className="d-flex justify-content-between align-items-center">
                <span className="font-weight-bold">
                  <span role="img" aria-label="target">🎯</span> ความคืบหน้าเป้าหมายสาขา
                </span>
              </div>
            }
            description={
              <div className="pt-3">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={16}>
                    <Progress 
                      percent={Math.round((branchMetrics.monthlyActual / branchMetrics.monthlyTarget) * 100)}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      strokeWidth={15}
                      format={percent => `${percent}%`}
                      className="enhanced-progress"
                    />
                    <div className="mt-2 d-flex justify-content-between">
                      <small>ยอดขาย: <strong>{branchMetrics.monthlyActual.toLocaleString()}฿</strong></small>
                      <small>เป้าหมาย: <strong>{branchMetrics.monthlyTarget.toLocaleString()}฿</strong></small>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div className="text-center">
                      <div className="mb-2">
                        <Badge 
                          count={`${Math.round((branchMetrics.monthlyActual / branchMetrics.monthlyTarget) * 100)}%`}
                          className="enhanced-badge notification"
                          style={{ 
                            backgroundColor: '#1890ff', 
                            fontSize: '16px',
                            padding: '0 12px',
                            height: 'auto',
                            lineHeight: '22px'
                          }}
                        />
                      </div>
                      <small className="text-muted">
                        เหลือ <strong>{(branchMetrics.monthlyTarget - branchMetrics.monthlyActual).toLocaleString()}฿</strong>
                        <br/>
                        จากเป้าหมาย
                      </small>
                    </div>
                  </Col>
                </Row>
              </div>
            }
            type="info"
            showIcon
          />
        </Col>
      </Row>

      {/* Enhanced Tabs */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="enhanced-card fade-in-up" style={{ padding: isMobile ? '0px' : '16px' }}>
            <Tabs defaultActiveKey="activities" className="enhanced-tabs">
              <TabPane tab={<span><span role="img" aria-label="activity">📋</span> กิจกรรมวันนี้</span>} key="activities">
                <div className="table-overflow-wrapper">
                  <Table
                    columns={activityColumns}
                    dataSource={todayActivities}
                    pagination={false}
                    size="middle"
                    rowKey="id"
                    scroll={{ x: 800 }}
                    className="enhanced-table"
                  />
                </div>
              </TabPane>
              <TabPane tab={<span><span role="img" aria-label="people">👥</span> ประสิทธิภาพพนักงาน</span>} key="staff">
                <div className="table-overflow-wrapper">
                  <Table
                    columns={staffColumns}
                    dataSource={staffPerformance}
                    pagination={false}
                    size="middle"
                    rowKey="id"
                    scroll={{ x: 900 }}
                    className="enhanced-table"
                  />
                </div>
              </TabPane>
              <TabPane tab={<span><span role="img" aria-label="calendar">📅</span> ปฏิทินงาน</span>} key="calendar">
                <div className="text-center py-5">
                  <h5>ปฏิทินกิจกรรมสาขา</h5>
                  <p>แสดงกิจกรรมและการนัดหมายประจำเดือน</p>
                  <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Calendar 
                      dateCellRender={getCalendarData}
                      className="enhanced-calendar"
                    />
                  </div>
                </div>
              </TabPane>
              <TabPane tab={<span><span role="img" aria-label="chart">📊</span> รายงาน</span>} key="reports">
                <div className="text-center py-5">
                  <h5>รายงานสาขา</h5>
                  <p>เลือกรายงานที่ต้องการดู</p>
                  <div className="d-flex justify-content-center">
                    <a href="/reports/branch" className="btn btn-outline-primary mr-2 animated-button">
                      <BarChartOutlined /> รายงานยอดขาย
                    </a>
                    <a href="/reports/staff" className="btn btn-outline-success mr-2 animated-button">
                      <UserOutlined /> รายงานพนักงาน
                    </a>
                    <a href="/reports/performance" className="btn btn-outline-info animated-button">
                      📈 รายงานประสิทธิภาพ
                    </a>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BranchManagerDashboard; 