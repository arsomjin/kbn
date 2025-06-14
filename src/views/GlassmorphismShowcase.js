import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Table, Modal, Switch, Space, Typography, Row, Col, Divider, Tag, Alert } from 'antd';
import { 
  SunOutlined, 
  MoonOutlined, 
  BgColorsOutlined, 
  ExperimentOutlined,
  CarOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  StarOutlined,
  FireOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const GlassmorphismShowcase = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentBackground, setCurrentBackground] = useState('rice-fields');
  const [showModal, setShowModal] = useState(false);
  const [showTractorAnimation, setShowTractorAnimation] = useState(false);
  const [showRiceWave, setShowRiceWave] = useState(false);

  // IMMEDIATE GLASSMORPHISM ACTIVATION - Apply Kubota background on mount
  useEffect(() => {
    // Force apply the Kubota rice fields background immediately
    document.body.style.background = `
      linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%), 
      url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%2387CEEB;stop-opacity:1" /><stop offset="100%" style="stop-color:%23E0F6FF;stop-opacity:1" /></linearGradient><linearGradient id="field" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%234CAF50;stop-opacity:1" /><stop offset="100%" style="stop-color:%238BC34A;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="400" fill="url(%23sky)"/><rect y="400" width="1200" height="400" fill="url(%23field)"/><rect x="100" y="350" width="80" height="30" fill="%23FF6B35" rx="5"/><rect x="120" y="330" width="40" height="20" fill="%23333" rx="3"/><circle cx="110" cy="390" r="15" fill="%23333"/><circle cx="170" cy="390" r="15" fill="%23333"/><rect x="300" y="450" width="600" height="100" fill="%2366BB6A" opacity="0.8"/><rect x="350" y="500" width="500" height="50" fill="%234CAF50" opacity="0.6"/></svg>')
    `;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
    
    // Ensure all layout containers are transparent
    const layouts = document.querySelectorAll('.ant-layout, .ant-layout-content, #root');
    layouts.forEach(el => {
      if (el) el.style.background = 'transparent';
    });

    // Cleanup function to restore original background when component unmounts
    return () => {
      // Don't restore - let the glassmorphism stay active!
    };
  }, []);

  // Sample data for the glass table
  const tableData = [
    {
      key: '1',
      province: 'นครราชสีมา',
      tractors: 1250,
      harvesters: 340,
      status: 'เปิดใช้งาน',
      efficiency: '95%'
    },
    {
      key: '2',
      province: 'อุบลราชธานี',
      tractors: 890,
      harvesters: 220,
      status: 'เปิดใช้งาน',
      efficiency: '92%'
    },
    {
      key: '3',
      province: 'ขอนแก่น',
      tractors: 1100,
      harvesters: 280,
      status: 'บำรุงรักษา',
      efficiency: '88%'
    },
    {
      key: '4',
      province: 'สุรินทร์',
      tractors: 750,
      harvesters: 180,
      status: 'เปิดใช้งาน',
      efficiency: '94%'
    }
  ];

  const tableColumns = [
    {
      title: 'จังหวัด',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: 'แทรกเตอร์',
      dataIndex: 'tractors',
      key: 'tractors',
      render: (value) => <Text strong>{value.toLocaleString()}</Text>
    },
    {
      title: 'รถเกี่ยว',
      dataIndex: 'harvesters',
      key: 'harvesters',
      render: (value) => <Text strong>{value.toLocaleString()}</Text>
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'เปิดใช้งาน' ? 'green' : 'orange'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'ประสิทธิภาพ',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (value) => (
        <Text type={parseInt(value) > 90 ? 'success' : 'warning'}>
          {value}
        </Text>
      )
    }
  ];

  // Theme toggle function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
  };

  // Background change function
  const changeBackground = (bgType) => {
    setCurrentBackground(bgType);
    const body = document.body;
    
    // Remove existing background classes
    body.classList.remove('kubota-sunset-bg', 'kubota-modern-bg', 'kubota-bg-rotator');
    
    // Apply new background
    switch(bgType) {
      case 'sunset-farm':
        body.classList.add('kubota-sunset-bg');
        break;
      case 'modern-farm':
        body.classList.add('kubota-modern-bg');
        break;
      case 'rotating':
        body.classList.add('kubota-bg-rotator');
        break;
      default:
        // Default rice fields background is applied via CSS
        break;
    }
  };

  // Special effects
  const toggleTractorAnimation = () => {
    setShowTractorAnimation(!showTractorAnimation);
    if (!showTractorAnimation) {
      const tractor = document.createElement('div');
      tractor.className = 'kubota-tractor-animation';
      tractor.id = 'kubota-tractor';
      document.body.appendChild(tractor);
    } else {
      const tractor = document.getElementById('kubota-tractor');
      if (tractor) tractor.remove();
    }
  };

  const toggleRiceWave = () => {
    setShowRiceWave(!showRiceWave);
    if (!showRiceWave) {
      const wave = document.createElement('div');
      wave.className = 'kubota-rice-wave';
      wave.id = 'kubota-wave';
      document.body.appendChild(wave);
    } else {
      const wave = document.getElementById('kubota-wave');
      if (wave) wave.remove();
    }
  };

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div style={{ padding: '24px', minHeight: '100vh', position: 'relative' }}>
      {/* Floating glass elements for ambiance */}
      <div className="glass-floating-element"></div>
      <div className="glass-floating-element"></div>
      <div className="glass-floating-element"></div>

      {/* Header Section */}
      <Card className="glass-card glass-shimmer" style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={1} style={{ margin: 0, background: 'linear-gradient(135deg, #ff6f00, #4caf50)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🎨 Kubota Thailand Glassmorphism Showcase
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', opacity: 0.8 }}>
              Experience Apple's Liquid Glass design with authentic Thai agricultural backgrounds
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Button 
                className="glass-button glass-kubota-orange"
                icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                size="large"
              >
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Background Controls */}
      <Card className="glass-card glass-kubota-green" style={{ marginBottom: '24px' }}>
        <Title level={3}>
          <EnvironmentOutlined /> Kubota Thailand Backgrounds
        </Title>
        <Paragraph>
                     Choose from authentic Thai agricultural landscapes inspired by Kubota&apos;s farming heritage
        </Paragraph>
        
        <Space wrap size="large">
          <Button 
            className={`glass-button ${currentBackground === 'rice-fields' ? 'glass-success' : ''}`}
            onClick={() => changeBackground('rice-fields')}
            icon={<EnvironmentOutlined />}
          >
            Rice Fields (Default)
          </Button>
          <Button 
            className={`glass-button ${currentBackground === 'sunset-farm' ? 'glass-warning' : ''}`}
            onClick={() => changeBackground('sunset-farm')}
            icon={<SunOutlined />}
          >
            Sunset Farm
          </Button>
          <Button 
            className={`glass-button ${currentBackground === 'modern-farm' ? 'glass-info' : ''}`}
            onClick={() => changeBackground('modern-farm')}
            icon={<ThunderboltOutlined />}
          >
            Modern Farm
          </Button>
          <Button 
            className={`glass-button ${currentBackground === 'rotating' ? 'glass-kubota-blue' : ''}`}
            onClick={() => changeBackground('rotating')}
            icon={<BgColorsOutlined />}
          >
            Auto Rotate
          </Button>
        </Space>
      </Card>

      {/* Special Effects Controls */}
      <Card className="glass-card glass-kubota-blue" style={{ marginBottom: '24px' }}>
        <Title level={3}>
          <ExperimentOutlined /> Special Kubota Effects
        </Title>
        <Space wrap size="large">
          <div>
            <Text strong>Tractor Animation: </Text>
            <Switch 
              checked={showTractorAnimation}
              onChange={toggleTractorAnimation}
              checkedChildren={<CarOutlined />}
              unCheckedChildren={<CarOutlined />}
            />
          </div>
          <div>
            <Text strong>Rice Wave Effect: </Text>
            <Switch 
              checked={showRiceWave}
              onChange={toggleRiceWave}
              checkedChildren="🌾"
              unCheckedChildren="🌾"
            />
          </div>
        </Space>
      </Card>

      {/* Glass Components Demo */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card className="glass-card" title="Glass Components Demo">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              
              {/* Buttons */}
              <div>
                <Title level={4}>Glass Buttons</Title>
                <Space wrap>
                  <Button className="glass-button">Default Glass</Button>
                  <Button className="glass-button glass-success">Success</Button>
                  <Button className="glass-button glass-warning">Warning</Button>
                  <Button className="glass-button glass-error">Error</Button>
                  <Button className="glass-button glass-kubota-orange">Kubota Orange</Button>
                </Space>
              </div>

              {/* Inputs */}
              <div>
                <Title level={4}>Glass Inputs</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input 
                    className="glass-input" 
                    placeholder="Enter your farm location..."
                    prefix={<EnvironmentOutlined />}
                  />
                  <Input 
                    className="glass-input glass-success" 
                    placeholder="Tractor model number..."
                    prefix={<CarOutlined />}
                  />
                </Space>
              </div>

              {/* Status Cards */}
              <div>
                <Title level={4}>Status Cards</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card className="glass-card glass-success glass-compact">
                      <Text strong>Active Tractors</Text>
                      <br />
                      <Title level={2} style={{ margin: 0, color: '#4caf50' }}>1,250</Title>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card className="glass-card glass-warning glass-compact">
                      <Text strong>Maintenance</Text>
                      <br />
                      <Title level={2} style={{ margin: 0, color: '#ff9800' }}>45</Title>
                    </Card>
                  </Col>
                </Row>
              </div>

            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="glass-card" title="Interactive Demo">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              
              {/* Modal Demo */}
              <div>
                <Title level={4}>Glass Modal</Title>
                <Button 
                  className="glass-button glass-info" 
                  onClick={() => setShowModal(true)}
                  icon={<StarOutlined />}
                >
                  Open Glass Modal
                </Button>
              </div>

              {/* Blur Variations */}
              <div>
                <Title level={4}>Blur Variations</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card className="glass-card glass-blur-subtle glass-compact">
                    <Text>Subtle Blur (8px)</Text>
                  </Card>
                  <Card className="glass-card glass-blur-medium glass-compact">
                    <Text>Medium Blur (16px)</Text>
                  </Card>
                  <Card className="glass-card glass-blur-strong glass-compact">
                    <Text>Strong Blur (24px)</Text>
                  </Card>
                </Space>
              </div>

              {/* Brand Colors */}
              <div>
                <Title level={4}>Kubota Brand Colors</Title>
                <Space wrap>
                  <Tag className="glass-kubota-orange" style={{ padding: '8px 16px' }}>
                    Kubota Orange
                  </Tag>
                  <Tag className="glass-kubota-green" style={{ padding: '8px 16px' }}>
                    Kubota Green
                  </Tag>
                  <Tag className="glass-kubota-blue" style={{ padding: '8px 16px' }}>
                    Kubota Blue
                  </Tag>
                </Space>
              </div>

            </Space>
          </Card>
        </Col>
      </Row>

      {/* Data Table */}
      <Card className="glass-card" style={{ marginTop: '24px' }}>
        <Title level={3}>
          <CarOutlined /> Kubota Fleet Management - Glass Table
        </Title>
        <Table 
          className="glass-table"
          dataSource={tableData}
          columns={tableColumns}
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Implementation Guide */}
      <Card className="glass-card glass-shimmer" style={{ marginTop: '24px' }}>
        <Title level={3}>
          <FireOutlined /> Quick Implementation Guide
        </Title>
        
        <Alert
          message="Your Glassmorphism Dream is Now Reality! ✨"
          description="Apply these classes to any component for instant Apple Liquid Glass effects with Kubota Thailand theming."
          type="success"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Title level={4}>Basic Usage</Title>
            <pre style={{ 
              background: 'rgba(0,0,0,0.1)', 
              padding: '16px', 
              borderRadius: '8px',
              overflow: 'auto'
            }}>
{`// Basic glass card
<div className="glass-card">
  Your content here
</div>

// Glass button with Kubota orange
<button className="glass-button glass-kubota-orange">
  Click me
</button>

// Glass input
<input className="glass-input" 
       placeholder="Type here..." />

// Success status card
<div className="glass-card glass-success">
  Success message
</div>`}
            </pre>
          </Col>
          
          <Col xs={24} lg={12}>
            <Title level={4}>Background Controls</Title>
            <pre style={{ 
              background: 'rgba(0,0,0,0.1)', 
              padding: '16px', 
              borderRadius: '8px',
              overflow: 'auto'
            }}>
{`// Change to sunset farm background
document.body.classList.add('kubota-sunset-bg');

// Change to modern farm background  
document.body.classList.add('kubota-modern-bg');

// Enable auto-rotating backgrounds
document.body.classList.add('kubota-bg-rotator');

// Add special effects
<div className="kubota-tractor-animation"></div>
<div className="kubota-rice-wave"></div>`}
            </pre>
          </Col>
        </Row>

        <Divider />
        
        <Space wrap>
          <Tag color="green">✅ Production Ready</Tag>
          <Tag color="blue">🎨 Apple Liquid Glass</Tag>
          <Tag color="orange">🚜 Kubota Thailand Themed</Tag>
          <Tag color="purple">🌙 Dark Mode Support</Tag>
          <Tag color="cyan">📱 Mobile Responsive</Tag>
          <Tag color="gold">⚡ Hardware Accelerated</Tag>
        </Space>
      </Card>

      {/* Glass Modal */}
      <Modal
        title="🎨 Kubota Thailand Glass Modal"
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="cancel" className="glass-button" onClick={() => setShowModal(false)}>
            Cancel
          </Button>,
          <Button key="ok" className="glass-button glass-kubota-orange" onClick={() => setShowModal(false)}>
            <HeartOutlined /> Love It!
          </Button>
        ]}
        className="glass-modal"
        style={{ top: 50 }}
      >
        <div className="glass-card glass-kubota-green" style={{ margin: '16px 0' }}>
          <Title level={4}>🌾 Welcome to the Future of Agriculture!</Title>
          <Paragraph>
                         Your glassmorphism system now features authentic Kubota Thailand agricultural backgrounds 
             that make your glass effects truly shine. From rice fields to sunset farms, 
             experience the beauty of Thai agriculture through Apple&apos;s Liquid Glass design language.
          </Paragraph>
          
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input 
              className="glass-input" 
              placeholder="Enter your feedback..."
              prefix={<StarOutlined />}
            />
            <Button className="glass-button glass-success" block>
              Submit Feedback
            </Button>
          </Space>
        </div>
      </Modal>

      {/* Footer */}
      <Card className="glass-card glass-kubota-orange" style={{ marginTop: '24px', textAlign: 'center' }}>
        <Title level={4}>
          🚜 Powered by Kubota Thailand & Apple's Liquid Glass Design
        </Title>
        <Paragraph style={{ margin: 0 }}>
          Stop dreaming and start building with production-ready glassmorphism! 
          Your agricultural management system just got a lot more beautiful. ✨
        </Paragraph>
      </Card>
    </div>
  );
};

export default GlassmorphismShowcase;
