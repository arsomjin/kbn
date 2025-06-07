/**
 * Staff Dashboard - Department-specific Overview
 * Role-specific tasks and department-focused information
 */

import React from 'react';
import { Statistic, Table, Progress, Tag, Tabs, List, Badge, Row, Col, Card, Alert } from 'antd';
import { 
  UserOutlined, 
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ToolOutlined,
  AuditOutlined,
  DollarOutlined,
  TrophyOutlined,
  StarOutlined,
  TeamOutlined,
  BarChartOutlined
} from '@ant-design/icons';

import PageTitle from 'components/common/PageTitle';
import { usePermissions } from 'hooks/usePermissions';
import { isMobile } from 'react-device-detect';
import './dashboard-styles.css';

const { TabPane } = Tabs;

const StaffDashboard = () => {
  const { userRole, homeLocation, hasPermission } = usePermissions();
  
  // Determine department based on role and permissions
  const getDepartment = () => {
    if (!userRole) return 'general';
    const role = String(userRole).toLowerCase();
    if (role.includes('sales') || hasPermission('sales.edit')) return 'sales';
    if (role.includes('accounting') || hasPermission('accounting.edit')) return 'accounting';
    if (role.includes('service') || hasPermission('service.edit')) return 'service';
    if (role.includes('inventory') || hasPermission('inventory.edit')) return 'inventory';
    return 'general';
  };

  const department = getDepartment();
  const userBranch = homeLocation?.branch || 'N/A';

  // Department-specific configurations
  const departmentConfig = {
    sales: {
      title: '💼 ภาพรวมฝ่ายขาย',
      icon: <ShoppingCartOutlined />,
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      tasks: [
        { id: 1, task: 'ติดตามลูกค้าใหม่ 5 ราย', deadline: 'วันนี้', priority: 'high', status: 'pending' },
        { id: 2, task: 'เสนอราคารถแทรกเตอร์ให้ลูกค้า', deadline: 'พรุ่งนี้', priority: 'medium', status: 'in_progress' },
        { id: 3, task: 'จัดส่งเอกสารขาย', deadline: 'วันนี้', priority: 'high', status: 'completed' },
        { id: 4, task: 'ประชุมทีมขาย', deadline: '2 วัน', priority: 'low', status: 'pending' }
      ],
      metrics: {
        monthlyTarget: 500000,
        monthlyActual: 380000,
        customersContacted: 25,
        quotationsSent: 8
      }
    },
    accounting: {
      title: '📊 ภาพรวมฝ่ายบัญชี',
      icon: <AuditOutlined />,
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      tasks: [
        { id: 1, task: 'ตรวจสอบใบเสร็จรับเงิน', deadline: 'วันนี้', priority: 'high', status: 'pending' },
        { id: 2, task: 'จัดทำรายงานการเงิน', deadline: 'พรุ่งนี้', priority: 'medium', status: 'in_progress' },
        { id: 3, task: 'ปรับปรุงบัญชีลูกหนี้', deadline: 'วันนี้', priority: 'high', status: 'completed' },
        { id: 4, task: 'เตรียมเอกสารตรวจสอบ', deadline: '3 วัน', priority: 'medium', status: 'pending' }
      ],
      metrics: {
        invoicesProcessed: 45,
        paymentsReceived: 32,
        pendingApprovals: 7,
        monthlyClosing: 85
      }
    },
    service: {
      title: '🔧 ภาพรวมฝ่ายบริการ',
      icon: <ToolOutlined />,
      color: '#faad14',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      tasks: [
        { id: 1, task: 'ซ่อมแซมรถแทรกเตอร์ลูกค้า A', deadline: 'วันนี้', priority: 'high', status: 'in_progress' },
        { id: 2, task: 'ตรวจเช็คระบบไฮดรอลิก', deadline: 'พรุ่งนี้', priority: 'medium', status: 'pending' },
        { id: 3, task: 'จัดส่งอะไหล่ให้ลูกค้า', deadline: 'วันนี้', priority: 'high', status: 'completed' },
        { id: 4, task: 'อบรมการใช้งานเครื่องจักร', deadline: '5 วัน', priority: 'low', status: 'pending' }
      ],
      metrics: {
        jobsCompleted: 12,
        jobsInProgress: 5,
        customerSatisfaction: 96.5,
        partsSold: 28
      }
    },
    inventory: {
      title: '📦 ภาพรวมฝ่ายคลังสินค้า',
      icon: <FileTextOutlined />,
      color: '#722ed1',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      tasks: [
        { id: 1, task: 'ตรวจนับสต๊อกอะไหล่', deadline: 'วันนี้', priority: 'high', status: 'pending' },
        { id: 2, task: 'จัดเตรียมสินค้าส่งลูกค้า', deadline: 'พรุ่งนี้', priority: 'medium', status: 'in_progress' },
        { id: 3, task: 'อัพเดทข้อมูลในระบบ', deadline: 'วันนี้', priority: 'medium', status: 'completed' },
        { id: 4, task: 'ประชุมวางแผนจัดซื้อ', deadline: '2 วัน', priority: 'low', status: 'pending' }
      ],
      metrics: {
        itemsManaged: 1250,
        stockTurns: 8.5,
        lowStockItems: 15,
        ordersProcessed: 38
      }
    },
    general: {
      title: '📋 ภาพรวมงานทั่วไป',
      icon: <UserOutlined />,
      color: '#eb2f96',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      tasks: [
        { id: 1, task: 'อ่านอีเมลและตอบกลับ', deadline: 'วันนี้', priority: 'medium', status: 'pending' },
        { id: 2, task: 'เข้าร่วมประชุมทีม', deadline: 'พรุ่งนี้', priority: 'high', status: 'pending' },
        { id: 3, task: 'อัพเดทรายงานความคืบหน้า', deadline: 'วันนี้', priority: 'medium', status: 'completed' },
        { id: 4, task: 'ตรวจสอบแจ้งเตือนระบบ', deadline: 'วันนี้', priority: 'low', status: 'pending' }
      ],
      metrics: {
        tasksCompleted: 1,
        meetingsAttended: 12,
        reportsSubmitted: 8,
        efficiency: 87.5
      }
    }
  };

  const config = departmentConfig[department];
  
  // Calculate personal metrics
  const personalMetrics = {
    todayTasks: config.tasks.filter(t => t.deadline === 'วันนี้').length,
    completedTasks: config.tasks.filter(t => t.status === 'completed').length,
    pendingTasks: config.tasks.filter(t => t.status === 'pending').length,
    inProgressTasks: config.tasks.filter(t => t.status === 'in_progress').length
  };

  const taskColumns = [
    {
      title: 'งาน',
      dataIndex: 'task',
      key: 'task',
      width: 250,
    },
    {
      title: 'กำหนดส่ง',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
    },
    {
      title: 'ความสำคัญ',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority) => {
        const colors = { high: 'red', medium: 'orange', low: 'blue' };
        const texts = { high: 'สูง', medium: 'ปานกลาง', low: 'ต่ำ' };
        return <Tag color={colors[priority]}>{texts[priority]}</Tag>;
      }
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

  return (
    <div className="main-content-container px-4" style={{ width: '100%', padding: '0 16px' }}>
      {/* Page Header */}
      <Row className="page-header py-4" gutter={0}>
        <Col span={24}>
          <PageTitle 
            title={`${config.title} - สาขา: ${userBranch}`}
            subtitle={`${userRole || 'Staff'} Dashboard`}
            className="text-sm-left mb-3" 
          />
        </Col>
      </Row>

      {/* Enhanced Personal Task Metrics with Beautiful Gradient Cards */}
      <Row gutter={[16, 16]} className="mb-4 dashboard-metrics-row">
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card card-1 text-center" style={{ background: config.gradient, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>งานวันนี้</span>}
              value={personalMetrics.todayTasks}
              prefix={<ClockCircleOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-pink card-2 text-center" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>งานเสร็จแล้ว</span>}
              value={personalMetrics.completedTasks}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-blue card-3 text-center" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>งานค้างคิว</span>}
              value={personalMetrics.pendingTasks}
              prefix={<FileTextOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card className="gradient-card-orange card-4 text-center" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'white', fontSize: '18px' }}>กำลังทำ</span>}
              value={personalMetrics.inProgressTasks}
              prefix={<BarChartOutlined style={{ color: 'white' }} className="interactive-icon" />}
              valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}
              className="metric-number"
            />
          </Card>
        </Col>
      </Row>

      {/* Department-specific Secondary Metrics */}
      <Row gutter={[16, 16]} className="mb-4 dashboard-metrics-row">
        {department === 'sales' && (
          <>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-5 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>เป้าหมายขาย</span>}
                  value={config.metrics.monthlyTarget}
                  precision={0}
                  suffix=" ฿"
                  prefix={<DollarOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#1890ff' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-6 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>ยอดขายจริง</span>}
                  value={config.metrics.monthlyActual}
                  precision={0}
                  suffix=" ฿"
                  prefix={<TrophyOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#52c41a' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-7 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>ลูกค้าติดต่อ</span>}
                  value={config.metrics.customersContacted}
                  suffix=" ราย"
                  prefix={<TeamOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#722ed1' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-8 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>ใบเสนอราคา</span>}
                  value={config.metrics.quotationsSent}
                  suffix=" ฉบับ"
                  prefix={<FileTextOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#fa8c16' }}
                  className="metric-number"
                />
              </Card>
            </Col>
          </>
        )}
        
        {department === 'accounting' && (
          <>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-5 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>ใบแจ้งหนี้ประมวลผล</span>}
                  value={config.metrics.invoicesProcessed}
                  suffix=" ใบ"
                  prefix={<FileTextOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#52c41a' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-6 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>การชำระเงิน</span>}
                  value={config.metrics.paymentsReceived}
                  suffix=" รายการ"
                  prefix={<DollarOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#1890ff' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-7 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>รออนุมัติ</span>}
                  value={config.metrics.pendingApprovals}
                  suffix=" รายการ"
                  prefix={<ClockCircleOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#fa8c16' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-8 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>ปิดบัญชีรายเดือน</span>}
                  value={config.metrics.monthlyClosing}
                  suffix="%"
                  prefix={<CheckCircleOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#52c41a' }}
                  className="metric-number"
                />
              </Card>
            </Col>
          </>
        )}

        {department === 'service' && (
          <>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-5 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>งานซ่อมเสร็จ</span>}
                  value={config.metrics.jobsCompleted}
                  suffix=" งาน"
                  prefix={<CheckCircleOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#52c41a' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-6 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>งานอยู่ระหว่างดำเนินการ</span>}
                  value={config.metrics.jobsInProgress}
                  suffix=" งาน"
                  prefix={<ToolOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#1890ff' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-7 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>ความพึงพอใจ</span>}
                  value={config.metrics.customerSatisfaction}
                  precision={1}
                  suffix="%"
                  prefix={<StarOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#eb2f96' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-8 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>อะไหล่ขาย</span>}
                  value={config.metrics.partsSold}
                  suffix=" ชิ้น"
                  prefix={<FileTextOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#fa8c16' }}
                  className="metric-number"
                />
              </Card>
            </Col>
          </>
        )}

        {department === 'inventory' && (
          <>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-5 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>รายการสินค้า</span>}
                  value={config.metrics.itemsManaged}
                  suffix=" รายการ"
                  prefix={<FileTextOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#722ed1' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-6 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>หมุนเวียนสต๊อก</span>}
                  value={config.metrics.stockTurns}
                  precision={1}
                  suffix=" ครั้ง"
                  prefix={<BarChartOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#52c41a' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-7 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>สินค้าเหลือน้อย</span>}
                  value={config.metrics.lowStockItems}
                  suffix=" รายการ"
                  prefix={<ClockCircleOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#fa8c16' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-8 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>ออเดอร์ประมวลผล</span>}
                  value={config.metrics.ordersProcessed}
                  suffix=" รายการ"
                  prefix={<CheckCircleOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#1890ff' }}
                  className="metric-number"
                />
              </Card>
            </Col>
          </>
        )}

        {department === 'general' && (
          <>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-5 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>งานเสร็จแล้ว</span>}
                  value={config.metrics.tasksCompleted}
                  suffix=" งาน"
                  prefix={<CheckCircleOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#52c41a' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-6 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>ประชุมเข้าร่วม</span>}
                  value={config.metrics.meetingsAttended}
                  suffix=" ครั้ง"
                  prefix={<TeamOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#1890ff' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-7 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>รายงานส่ง</span>}
                  value={config.metrics.reportsSubmitted}
                  suffix=" ฉบับ"
                  prefix={<FileTextOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#722ed1' }}
                  className="metric-number"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Card className="enhanced-card card-8 text-center">
                <Statistic
                  title={<span style={{ fontSize: '16px' }}>ประสิทธิภาพ</span>}
                  value={config.metrics.efficiency}
                  precision={1}
                  suffix="%"
                  prefix={<TrophyOutlined className="interactive-icon" />}
                  valueStyle={{ color: '#fa8c16' }}
                  className="metric-number"
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Progress Alert */}
      <Row className="mb-4" gutter={[16, 16]}>
        <Col xs={24}>
          <Alert
            className="enhanced-alert"
            message={
              <div className="d-flex justify-content-between align-items-center">
                <span className="font-weight-bold">
                  <span role="img" aria-label="target">📋</span> ความคืบหน้างานส่วนตัว
                </span>
              </div>
            }
            description={
              <div className="pt-3">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={16}>
                    <Progress 
                      percent={Math.round((personalMetrics.completedTasks / (personalMetrics.completedTasks + personalMetrics.pendingTasks + personalMetrics.inProgressTasks)) * 100)}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      strokeWidth={15}
                      format={percent => `${percent}%`}
                      className="enhanced-progress"
                    />
                    <div className="mt-2 d-flex justify-content-between">
                      <small>เสร็จแล้ว: <strong>{personalMetrics.completedTasks}</strong></small>
                      <small>ทั้งหมด: <strong>{personalMetrics.completedTasks + personalMetrics.pendingTasks + personalMetrics.inProgressTasks}</strong></small>
                    </div>
                  </Col>
                  <Col xs={24} md={8}>
                    <div className="text-center">
                      <div className="mb-2">
                        <Badge 
                          count={`${Math.round((personalMetrics.completedTasks / (personalMetrics.completedTasks + personalMetrics.pendingTasks + personalMetrics.inProgressTasks)) * 100)}%`}
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
                        เหลือ <strong>{personalMetrics.pendingTasks + personalMetrics.inProgressTasks}</strong> งาน<br/>
                        ที่ต้องทำให้เสร็จ
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
            <Tabs defaultActiveKey="tasks" className="enhanced-tabs">
              <TabPane tab={<span><span role="img" aria-label="task">📋</span> งานของฉัน</span>} key="tasks">
                <div className="table-overflow-wrapper">
                  <Table
                    columns={taskColumns}
                    dataSource={config.tasks}
                    pagination={false}
                    size="middle"
                    rowKey="id"
                    scroll={{ x: 800 }}
                    className="enhanced-table"
                  />
                </div>
              </TabPane>
              <TabPane tab={<span><span role="img" aria-label="performance">📊</span> ประสิทธิภาพ</span>} key="performance">
                <div className="text-center py-5">
                  <h5>รายงานประสิทธิภาพงาน</h5>
                  <p>แสดงผลงานและความคืบหน้าของคุณ</p>
                  <Row gutter={[16, 16]} className="mt-4">
                    <Col xs={24} md={12}>
                      <div className="text-center">
                        <h6>ความสำเร็จในการทำงาน</h6>
                        <Progress 
                          type="circle" 
                          percent={Math.round((personalMetrics.completedTasks / config.tasks.length) * 100)}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                          className="enhanced-progress"
                        />
                      </div>
                    </Col>
                    <Col xs={24} md={12}>
                      <div className="text-center">
                        <h6>งานที่ต้องติดตาม</h6>
                        <List
                          size="small"
                          dataSource={config.tasks.filter(task => task.status === 'pending')}
                          renderItem={task => (
                            <List.Item>
                              <Badge status="warning" text={task.task} />
                            </List.Item>
                          )}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              </TabPane>
              <TabPane tab={<span><span role="img" aria-label="help">❓</span> ความช่วยเหลือ</span>} key="help">
                <div className="text-center py-5">
                  <h5>ความช่วยเหลือและแนวทาง</h5>
                  <p>คู่มือการใช้งานและติดต่อฝ่ายสนับสนุน</p>
                  <div className="d-flex justify-content-center">
                    <a href="/help/manual" className="btn btn-outline-primary mr-2 animated-button">
                      📖 คู่มือการใช้งาน
                    </a>
                    <a href="/help/contact" className="btn btn-outline-success mr-2 animated-button">
                      📞 ติดต่อฝ่ายสนับสนุน
                    </a>
                    <a href="/help/training" className="btn btn-outline-info animated-button">
                      🎓 วิดีโอฝึกอบรม
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

export default StaffDashboard; 