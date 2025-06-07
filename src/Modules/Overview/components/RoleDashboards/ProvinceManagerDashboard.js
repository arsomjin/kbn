/**
 * Province Manager Dashboard - Province-level Overview
 * Access to assigned province data and branch management
 */

import React, { useState } from 'react';
import { Select, Statistic, Table, Progress, Tag, Tabs, Alert, Tooltip, Badge, Row, Col, Card } from 'antd';
import { 
  BankOutlined, 
  UserOutlined, 
  BarChartOutlined,
  TrophyOutlined,
  TeamOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  StarOutlined,
  EyeOutlined,
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';
import PropTypes from 'prop-types';

import PageTitle from 'components/common/PageTitle';
import { GeographicBranchSelector } from 'components';
import { usePermissions } from 'hooks/usePermissions';
import './dashboard-styles.css';
import { isMobile } from 'react-device-detect';

const { Option } = Select;
const { TabPane } = Tabs;

const ProvinceManagerDashboard = ({ viewingContext }) => {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  
  const { 
    accessibleProvinces, 
    accessibleBranches, 
    homeLocation 
  } = usePermissions();
  
  // Get province - prioritize viewingContext, then user's home province, then first accessible
  const currentProvince = viewingContext?.province || 
    homeLocation.province || 
    (accessibleProvinces.length > 0 ? accessibleProvinces[0].key : null);
  
  // Get province display name
  const provinceDisplayName = accessibleProvinces.find(p => p.key === currentProvince)?.name || currentProvince;

  // Enhanced province metrics with trends
  const provinceMetrics = {
    totalBranches: accessibleBranches.length,
    totalReservations: 156, // Changed from totalBranches concept to total reservations
    activeStaff: 45,
    monthlyTarget: 5000000,
    monthlyActual: 4250000,
    customerSatisfaction: 94.2,
    topPerformingBranch: 'สาขานครสวรรค์', // Show real name instead of code
    monthlyGrowth: 12.5, // % growth from last month
    avgOrderValue: 125000,
    totalCustomers: 234,
    newCustomers: 28
  };

  // Enhanced branch performance data with more metrics
  const branchPerformance = [
    {
      id: 1,
      branchCode: 'NSN001',
      branchName: 'สาขานครสวรรค์',
      sales: 1850000,
      target: 1500000,
      achievement: 123.3,
      staff: 15,
      customers: 89,
      avgOrder: 140000,
      growth: 18.5,
      rating: 4.8,
      status: 'excellent',
      trend: 'up'
    },
    {
      id: 2,
      branchCode: 'NSN002',
      branchName: 'ตาคลี',
      sales: 1200000,
      target: 1500000,
      achievement: 80.0,
      staff: 12,
      customers: 67,
      avgOrder: 125000,
      growth: 8.2,
      rating: 4.5,
      status: 'good',
      trend: 'up'
    },
    {
      id: 3,
      branchCode: 'NSN003',
      branchName: 'หนองบัว',
      sales: 1200000,
      target: 1500000,
      achievement: 80.0,
      staff: 10,
      customers: 78,
      avgOrder: 115000,
      growth: -2.1,
      rating: 4.2,
      status: 'needs_improvement',
      trend: 'down'
    }
  ];

  // Mock staff overview
  const staffOverview = [
    {
      id: 1,
      name: 'นายสมชาย ใจดี',
      position: 'ผู้จัดการสาขา',
      branch: 'สาขานครสวรรค์',
      performance: 'ดีเยี่ยม',
      status: 'active'
    },
    {
      id: 2,
      name: 'นางสมใส รักงาน',
      position: 'พนักงานขาย',
      branch: 'สาขานครสวรรค์',
      performance: 'ดี',
      status: 'active'
    },
    {
      id: 3,
      name: 'นายประสบ ความสำเร็จ',
      position: 'ผู้จัดการสาขา',
      branch: 'ตาคลี',
      performance: 'ปานกลาง',
      status: 'active'
    }
  ];

  // Enhanced table columns with more interactive elements
  const branchColumns = [
    {
      title: 'สาขา',
      dataIndex: 'branchName',
      key: 'branchName',
      width: 60,
      render: (text, record) => (
        <div className="d-flex align-items-center">
          <div className="mr-2">
            {record.trend === 'up' ? (
              <RiseOutlined style={{ color: '#52c41a', fontSize: 16 }} />
            ) : (
              <FallOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
            )}
          </div>
          <div>
            <div className="font-weight-bold">{record.branchCode}</div>
            <small className="text-muted">{text}</small>
            <div className="mt-1">
              {[...Array(Math.floor(record.rating))].map((_, i) => (
                <StarOutlined key={i} style={{ color: '#faad14', fontSize: 12 }} />
              ))}
              <small className="ml-1 text-muted">({record.rating})</small>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'ยอดขาย / เป้าหมาย',
      key: 'salesTarget',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <div>
          <div className="font-weight-bold text-success">
            {record.sales.toLocaleString()} ฿
          </div>
          <small className="text-muted">จาก {record.target.toLocaleString()} ฿</small>
          <div className="mt-1">
            <Badge 
              count={`${record.growth > 0 ? '+' : ''}${record.growth}%`}
              style={{ 
                backgroundColor: record.growth > 0 ? '#52c41a' : '#ff4d4f',
                fontSize: '11px'
              }}
            />
          </div>
        </div>
      )
    },
    {
      title: 'ผลงาน',
      dataIndex: 'achievement',
      key: 'achievement',
      width: 80,
      render: (value, record) => (
        <div>
          <Progress 
            percent={Math.min(value, 100)} 
            size="small" 
            status={value >= 100 ? 'success' : value >= 80 ? 'normal' : 'exception'}
            strokeColor={value >= 100 ? '#52c41a' : value >= 80 ? '#1890ff' : '#faad14'}
          />
          <div className="mt-1 d-flex justify-content-between align-items-center">
            <small className="font-weight-bold">{value}%</small>
            {value >= 100 && <TrophyOutlined style={{ color: '#faad14' }} />}
          </div>
        </div>
      )
    },
    {
      title: 'ทีมงาน',
      key: 'team',
      width: 80,
      render: (_, record) => (
        <div className="text-center">
          <div>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <span className="ml-1 font-weight-bold">{record.staff}</span>
          </div>
          <small className="text-muted">พนักงาน</small>
        </div>
      )
    },
    {
      title: 'ลูกค้า',
      dataIndex: 'customers',
      key: 'customers',
      width: 80,
      render: (value, record) => (
        <div className="text-center">
          <div className="font-weight-bold">{value}</div>
          <small className="text-muted">ราย</small>
          <div className="mt-1">
            <small style={{ color: '#722ed1' }}>
              ฿{(record.avgOrder / 1000).toFixed(0)}K avg
            </small>
          </div>
        </div>
      )
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status, record) => {
        const config = {
          excellent: { color: 'green', text: 'ดีเยี่ยม', icon: <TrophyOutlined /> },
          good: { color: 'blue', text: 'ดี', icon: <RiseOutlined /> },
          needs_improvement: { color: 'orange', text: 'ต้องปรับปรุง', icon: <FallOutlined /> }
        };
        return (
          <div className="text-center">
            <Tag color={config[status]?.color} className={`mb-1 ${config[status]?.color === 'green' ? 'status-tag-excellent' : config[status]?.color === 'blue' ? 'status-tag-good' : 'status-tag-warning'}`}>
              {config[status]?.icon} {config[status]?.text}
            </Tag>
            <div>
              <Tooltip title="ดูรายละเอียด">
                <EyeOutlined 
                  className="interactive-icon"
                  style={{ color: '#1890ff', cursor: 'pointer', marginRight: 8 }} 
                  onClick={() => console.log('View details:', record.branchCode)}
                />
              </Tooltip>
              <Tooltip title="จัดการสาขา">
                <EditOutlined 
                  className="interactive-icon"
                  style={{ color: '#52c41a', cursor: 'pointer' }}
                  onClick={() => console.log('Manage branch:', record.branchCode)}
                />
              </Tooltip>
            </div>
          </div>
        );
      }
    }
  ];

  const staffColumns = [
    {
      title: 'ชื่อ-สกุล',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'ตำแหน่ง',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'สาขา',
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: 'ผลงาน',
      dataIndex: 'performance',
      key: 'performance',
      render: (performance) => {
        const color = performance === 'ดีเยี่ยม' ? 'green' : 
                     performance === 'ดี' ? 'blue' : 'orange';
        return <Tag color={color}>{performance}</Tag>;
      }
    }
  ];

  return (
    <div className="main-content-container px-4" style={{ width: '100%', padding: '0 16px' }}>
      {/* Page Header */}
      <Row className="page-header py-4" gutter={0}>
        <Col span={24}>
          <PageTitle 
            title={`🏢 ภาพรวมจังหวัด${provinceDisplayName ? `: ${provinceDisplayName}` : ''}`}
            subtitle="Province Manager Dashboard" 
            className="text-sm-left mb-3" 
          />
        </Col>
      </Row>

      {/* Controls */}
      <Row className="mb-4" gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <div style={{ marginBottom: '8px' }}>
            <label>สาขา:</label>
          </div>
          <GeographicBranchSelector
            value={selectedBranch}
            onChange={setSelectedBranch}
            province={currentProvince}
            placeholder="เลือกสาขา"
            showAll={true}
            allText="ทั้งหมด"
            respectRBAC={true}
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
            <Option value="quarter">ไตรมาสนี้</Option>
          </Select>
        </Col>
      </Row>

      {/* Enhanced Province Metrics */}
      <Row gutter={[16, 16]} className="mb-4 dashboard-metrics-row">
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-dark-blue card-1 text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>ยอดจองทั้งหมด</span>}
              value={provinceMetrics.totalReservations}
              prefix={<BankOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2rem' }}
              className="metric-number"
            />
            <div className="mt-2">
              <small style={{ color: 'rgba(255,255,255,0.8)' }}>
                ยอดจองรถและโดรน
              </small>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-pink card-2 text-center" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>พนักงานทั้งหมด</span>}
              value={provinceMetrics.activeStaff}
              prefix={<TeamOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2rem' }}
              className="metric-number"
            />
            <div className="mt-2">
              <Badge count={`+${provinceMetrics.newCustomers}`} className="enhanced-badge notification" style={{ backgroundColor: '#52c41a' }}>
                <small style={{ color: 'rgba(255,255,255,0.8)' }}>
                  คน (ลูกค้าใหม่เดือนนี้)
                </small>
              </Badge>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-blue card-3 text-center" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>ยอดขายเดือนนี้</span>}
              value={provinceMetrics.monthlyActual}
              precision={0}
              suffix="฿"
              prefix={<DollarOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '1.8rem' }}
              className="metric-number"
            />
            <div className="mt-2 d-flex justify-content-center align-items-center">
              <RiseOutlined style={{ color: '#52c41a', marginRight: 4 }} className="interactive-icon" />
              <small style={{ color: 'rgba(255,255,255,0.8)' }}>
                +{provinceMetrics.monthlyGrowth}% จากเดือนที่แล้ว
              </small>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-orange card-4 text-center" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>เป้าหมายเดือนนี้</span>}
              value={provinceMetrics.monthlyTarget}
              precision={0}
              suffix="฿"
              valueStyle={{ color: 'white', fontSize: '1.8rem' }}
              className="metric-number"
            />
            <div className="mt-2">
              <Progress 
                percent={Math.round((provinceMetrics.monthlyActual / provinceMetrics.monthlyTarget) * 100)}
                size="small"
                strokeColor="white"
                trailColor="rgba(255,255,255,0.3)"
                showInfo={false}
                className="enhanced-progress"
              />
              <small style={{ color: 'rgba(255,255,255,0.8)' }}>
                เหลือ {(provinceMetrics.monthlyTarget - provinceMetrics.monthlyActual).toLocaleString()} ฿
              </small>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics Row */}
      <Row gutter={[16, 16]} className="mb-4 dashboard-metrics-row">
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-5 text-center">
          <Statistic
              title={<span style={{ fontSize: '16px' }}>ความพึงพอใจลูกค้า</span>}
              value={provinceMetrics.customerSatisfaction}
              suffix="%"
              prefix={<StarOutlined className="interactive-icon" />}
              valueStyle={{ color: '#eb2f96' }}
              className="metric-number"
            />
            <div className="mt-2">
              <Progress 
                percent={provinceMetrics.customerSatisfaction} 
                size="small" 
                strokeColor="#eb2f96"
                showInfo={false}
                className="enhanced-progress"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-6 text-center">
          <Statistic
              title={<span style={{ fontSize: '16px' }}>สาขาที่ดีที่สุด</span>}
              value={provinceMetrics.topPerformingBranch}
              prefix={<TrophyOutlined className="interactive-icon" />}
              valueStyle={{ color: '#fa8c16' }}
              className="metric-number"
            />
            <div className="mt-2">
                <Tag color="gold" className="status-tag-excellent"><span role="img" aria-label="trophy">🏆</span> ผู้นำ</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-7 text-center">
          <Statistic
              title={<span style={{ fontSize: '16px' }}>ลูกค้าทั้งหมด</span>}
              value={provinceMetrics.totalCustomers}
              suffix="ราย"
              prefix={<UserOutlined className="interactive-icon" />}
              valueStyle={{ color: '#722ed1' }}
              className="metric-number"
            />
            <div className="mt-2">
              <small className="text-muted">
                ค่าเฉลี่ยต่อออเดอร์: {provinceMetrics.avgOrderValue.toLocaleString()}฿
              </small>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="enhanced-card card-8 text-center">
          <Statistic
              title={<span style={{ fontSize: '16px' }}>การเจริญเติบโต</span>}
              value={provinceMetrics.monthlyGrowth}
              suffix="%"
              prefix={<BarChartOutlined className="interactive-icon" />}
              valueStyle={{ color: '#52c41a' }}
              className="metric-number"
            />
            <div className="mt-2">
              <Tag color="green" className="status-tag-excellent">เติบโตดี</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Achievement Progress with Alerts */}
      <Row className="mb-4" gutter={[16, 16]}>
        <Col xs={24}>
          <Alert
            className="enhanced-alert"
            message={
              <div className="d-flex justify-content-between align-items-center">
                <span className="font-weight-bold">
                  <span role="img" aria-label="target">🎯</span> ความคืบหน้าเป้าหมายจังหวัด {provinceDisplayName ? provinceDisplayName : ''}
                </span>
                <div className="d-flex align-items-center">
                  <SettingOutlined 
                    className="interactive-icon"
                    style={{ cursor: 'pointer', marginLeft: 8 }}
                    onClick={() => console.log('Settings')}
                  />
                </div>
              </div>
            }
            description={
                              <div className="pt-3">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                      <Progress 
                        percent={Math.round((provinceMetrics.monthlyActual / provinceMetrics.monthlyTarget) * 100)}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        strokeWidth={15}
                        format={percent => `${percent}%`}
                        className="enhanced-progress"
                      />
                      <div className="mt-2 d-flex justify-content-between">
                        <small>ยอดขาย: <strong>{provinceMetrics.monthlyActual.toLocaleString()}฿</strong></small>
                        <small>เป้าหมาย: <strong>{provinceMetrics.monthlyTarget.toLocaleString()}฿</strong></small>
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div className="text-center">
                        <div className="mb-2">
                          <Badge 
                            count={`${Math.round((provinceMetrics.monthlyActual / provinceMetrics.monthlyTarget) * 100)}%`}
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
                          เหลือ <strong>{(provinceMetrics.monthlyTarget - provinceMetrics.monthlyActual).toLocaleString()}฿</strong>
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

      {/* Tabs for detailed data */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="enhanced-card fade-in-up" style={{ padding: isMobile ? '0px' : '16px' }}>
            <Tabs defaultActiveKey="branches" className="enhanced-tabs" >
              <TabPane tab={<span><span role="img" aria-label="office">🏢</span> ผลงานสาขา</span>} key="branches">
                <div className="mb-3">
                                      <Alert
                      message={<span><span role="img" aria-label="bulb">💡</span> เคล็ดลับ</span>}
                      description={
                        <span>
                          คลิกที่ไอคอน <span role="img" aria-label="eye">👁️</span> เพื่อดูรายละเอียดสาขา หรือ <span role="img" aria-label="edit">✏️</span> เพื่อจัดการสาขา
                        </span>
                      }
                      type="info"
                      showIcon
                      closable
                    />
                </div>
                <div className="table-overflow-wrapper">
                  <Table
                    columns={branchColumns}
                    dataSource={branchPerformance}
                    pagination={false}
                    size="middle"
                    rowKey="id"
                    scroll={{ x: 1400 }}
                    className="enhanced-table"
                  />
                </div>
              </TabPane>
              <TabPane tab={<span><span role="img" aria-label="people">👥</span> ภาพรวมพนักงาน</span>} key="staff">
                <Table
                  columns={staffColumns}
                  dataSource={staffOverview}
                  pagination={{ pageSize: 10 }}
                  size="small"
                  rowKey="id"
                />
              </TabPane>
              <TabPane tab={<span><span role="img" aria-label="chart">📊</span> รายงานเพิ่มเติม</span>} key="reports">
                <div className="text-center py-5">
                  <h5>รายงานรายละเอียด</h5>
                  <p>เลือกรายงานที่ต้องการดู</p>
                  <div className="d-flex justify-content-center">
                    <a href="/reports/province" className="btn btn-outline-primary mr-2 animated-button">
                      <BarChartOutlined /> รายงานยอดขาย
                    </a>
                    <a href="/reports/staff" className="btn btn-outline-success mr-2 animated-button">
                      <UserOutlined /> รายงานบัญชี
                    </a>
                    <a href="/reports/customers" className="btn btn-outline-info animated-button">
                      📋 รายงานลูกค้า
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

ProvinceManagerDashboard.propTypes = {
  viewingContext: PropTypes.shape({
    province: PropTypes.string,
    branch: PropTypes.string,
    role: PropTypes.string,
    originalRole: PropTypes.string,
    isViewingAsOther: PropTypes.bool
  })
};

ProvinceManagerDashboard.defaultProps = {
  viewingContext: null
};

export default ProvinceManagerDashboard; 