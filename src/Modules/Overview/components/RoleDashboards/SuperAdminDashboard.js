/**
 * Super Admin Dashboard - System-wide Overview
 * Full access to all provinces, branches, and system metrics
 */

import React, { useState } from 'react';
import { Select, Statistic, Alert, Table, Progress, Tag, Row, Col, Card, Badge } from 'antd';
import { 
  GlobalOutlined, 
  BankOutlined, 
  UserOutlined, 
  BarChartOutlined,
  SettingOutlined,
  DashboardOutlined,
  TrophyOutlined,
  StarOutlined,
  TeamOutlined
} from '@ant-design/icons';

import PageTitle from 'components/common/PageTitle';
import { ProvinceSelector, GeographicBranchSelector } from 'components';
import { usePermissions } from 'hooks/usePermissions';
import { useSelector } from 'react-redux';
import { isMobile } from 'react-device-detect';
import './dashboard-styles.css';

const { Option } = Select;

const SuperAdminDashboard = () => {
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  
  const { accessibleProvinces, accessibleBranches } = usePermissions();
  const { branches, provinces } = useSelector(state => ({ 
    branches: state.data.branches || {},
    provinces: state.provinces.provinces || {}
  }));

  // Enhanced system metrics data
  const systemMetrics = {
    totalProvinces: accessibleProvinces.length,
    totalBranches: accessibleBranches.length,
    activeUsers: 156,
    systemHealth: 98.5,
    todayTransactions: 1247,
    monthlyRevenue: 15420000,
    systemUptime: 99.8,
    totalCustomers: 8540
  };

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'user_login',
      message: 'ผู้ใช้ใหม่เข้าสู่ระบบ',
      province: 'นครสวรรค์',
      branch: 'NSN001',
      time: '10 นาทีที่แล้ว',
      status: 'success'
    },
    {
      id: 2,
      type: 'system_alert',
      message: 'การเชื่อมต่อฐานข้อมูลช้า',
      province: 'นครราชสีมา',
      branch: '0450',
      time: '25 นาทีที่แล้ว',
      status: 'warning'
    },
    {
      id: 3,
      type: 'data_sync',
      message: 'ซิงค์ข้อมูลสำเร็จ',
      province: 'นครสวรรค์',
      branch: 'NSN002',
      time: '1 ชั่วโมงที่แล้ว',
      status: 'success'
    }
  ];

  const activityColumns = [
    {
      title: 'กิจกรรม',
      dataIndex: 'message',
      key: 'message',
      width: 200,
    },
    {
      title: 'จังหวัด',
      dataIndex: 'province',
      key: 'province',
      width: 120,
    },
    {
      title: 'สาขา',
      dataIndex: 'branch',
      key: 'branch',
      width: 100,
    },
    {
      title: 'เวลา',
      dataIndex: 'time',
      key: 'time',
      width: 120,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : status === 'warning' ? 'orange' : 'red'}>
          {status === 'success' ? 'สำเร็จ' : status === 'warning' ? 'แจ้งเตือน' : 'ข้อผิดพลาด'}
        </Tag>
      )
    }
  ];

  return (
    <div className="main-content-container px-4" style={{ width: '100%', padding: '0 16px' }}>
      {/* Page Header */}
      <Row className="page-header py-4" gutter={0}>
        <Col span={24}>
          <PageTitle 
            title="🚀 ภาพรวมระบบ" 
            subtitle="Super Admin Dashboard" 
            className="text-sm-left mb-3" 
          />
        </Col>
      </Row>

      {/* Geographic Controls */}
      <Row className="mb-4" gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <div style={{ marginBottom: '8px' }}>
            <label>จังหวัด:</label>
          </div>
          <ProvinceSelector
            value={selectedProvince}
            onChange={setSelectedProvince}
            placeholder="เลือกจังหวัด"
            showAll={true}
            allText="ทั้งหมด"
            respectRBAC={false}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <div style={{ marginBottom: '8px' }}>
            <label>สาขา:</label>
          </div>
          <GeographicBranchSelector
            value={selectedBranch}
            onChange={setSelectedBranch}
            province={selectedProvince === 'all' ? null : selectedProvince}
            placeholder="เลือกสาขา"
            showAll={true}
            allText="ทั้งหมด"
            respectRBAC={false}
            style={{ width: '100%' }}
          />
        </Col>
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

      {/* Enhanced System Metrics with Beautiful Gradient Cards */}
      <Row gutter={[16, 16]} className="mb-4 dashboard-metrics-row">
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-dark-blue card-1 text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>จังหวัดทั้งหมด</span>}
              value={systemMetrics.totalProvinces}
              prefix={<GlobalOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-pink card-2 text-center" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>สาขาทั้งหมด</span>}
              value={systemMetrics.totalBranches}
              prefix={<BankOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-blue card-3 text-center" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>ผู้ใช้งานออนไลน์</span>}
              value={systemMetrics.activeUsers}
              prefix={<UserOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-orange card-4 text-center" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>สุขภาพระบบ</span>}
              value={systemMetrics.systemHealth}
              precision={1}
              suffix="%"
              prefix={<DashboardOutlined style={{ color: 'white' }} className="interactive-icon" />}
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
              title={<span style={{ fontSize: '16px' }}>รายรับรายเดือน</span>}
              value={systemMetrics.monthlyRevenue}
              precision={0}
              suffix=" ฿"
              prefix={<BarChartOutlined className="interactive-icon" />}
              valueStyle={{ color: '#52c41a' }}
              className="metric-number"
            />
            <div className="mt-2">
              <small className="text-muted">
                เพิ่มขึ้น 15.2% จากเดือนที่แล้ว
              </small>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-6 text-center">
            <Statistic
              title={<span style={{ fontSize: '16px' }}>อัพไทม์ระบบ</span>}
              value={systemMetrics.systemUptime}
              precision={1}
              suffix="%"
              prefix={<StarOutlined className="interactive-icon" />}
              valueStyle={{ color: '#eb2f96' }}
              className="metric-number"
            />
            <div className="mt-2">
              <Tag color="green" className="status-tag-excellent">เสถียร</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-7 text-center">
            <Statistic
              title={<span style={{ fontSize: '16px' }}>ลูกค้าทั้งหมด</span>}
              value={systemMetrics.totalCustomers}
              suffix=" ราย"
              prefix={<TeamOutlined className="interactive-icon" />}
              valueStyle={{ color: '#722ed1' }}
              className="metric-number"
            />
            <div className="mt-2">
              <small className="text-muted">
                จากทุกสาขา ทุกจังหวัด
              </small>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-8 text-center">
            <Statistic
              title={<span style={{ fontSize: '16px' }}>ธุรกรรมวันนี้</span>}
              value={systemMetrics.todayTransactions}
              prefix={<TrophyOutlined className="interactive-icon" />}
              valueStyle={{ color: '#fa8c16' }}
              className="metric-number"
            />
            <div className="mt-2">
              <Tag color="blue" className="status-tag-good">ปกติ</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* System Health Progress */}
      <Row className="mb-4" gutter={[16, 16]}>
        <Col xs={24}>
          <Alert
            className="enhanced-alert"
            message={
              <div className="d-flex justify-content-between align-items-center">
                <span className="font-weight-bold">
                  <span role="img" aria-label="system">🖥️</span> สถานะระบบโดยรวม
                </span>
                <div className="d-flex align-items-center">
                  <SettingOutlined 
                    className="interactive-icon"
                    style={{ cursor: 'pointer', marginLeft: 8 }}
                    onClick={() => console.log('System Settings')}
                  />
                </div>
              </div>
            }
            description={
              <div className="pt-3">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={16}>
                    <Progress 
                      percent={systemMetrics.systemHealth}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      strokeWidth={15}
                      format={percent => `${percent}%`}
                      className="enhanced-progress"
                    />
                    <div className="mt-2 d-flex justify-content-between">
                      <small>ปัจจุบัน: <strong>{systemMetrics.systemHealth}%</strong></small>
                      <small>เป้าหมาย: <strong>99.0%</strong></small>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div className="text-center">
                      <div className="mb-2">
                        <Badge 
                          count="ดีเยี่ยม"
                          className="enhanced-badge notification"
                          style={{ 
                            backgroundColor: '#52c41a', 
                            fontSize: '16px',
                            padding: '0 12px',
                            height: 'auto',
                            lineHeight: '22px'
                          }}
                        />
                      </div>
                      <small className="text-muted">
                        ระบบทำงานเสถียร<br/>
                        อัพไทม์ 99.8%
                      </small>
                    </div>
                  </Col>
                </Row>
              </div>
            }
            type="success"
            showIcon
          />
        </Col>
      </Row>

      {/* Recent Activities Table */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="enhanced-card fade-in-up" style={{ padding: isMobile ? '0px' : '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="font-weight-bold">
                <span role="img" aria-label="activity">📊</span> กิจกรรมล่าสุด
              </h4>
              <a href="/admin/activities" className="btn btn-outline-primary animated-button">
                <BarChartOutlined /> ดูทั้งหมด
              </a>
            </div>
            <div className="table-overflow-wrapper">
              <Table
                columns={activityColumns}
                dataSource={recentActivities}
                pagination={false}
                size="middle"
                rowKey="id"
                scroll={{ x: 800 }}
                className="enhanced-table"
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboard; 