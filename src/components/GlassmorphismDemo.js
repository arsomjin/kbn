import React, { useState } from 'react';
import { Card, Button, Input, Table, Modal, Space, Typography, Row, Col, Divider } from 'antd';
import { 
  StarOutlined, 
  HeartOutlined, 
  ThunderboltOutlined,
  CrownOutlined,
  FireOutlined,
  RocketOutlined
} from '@ant-design/icons';
import '../styles/glassmorphism-system.css';

const { Title, Text, Paragraph } = Typography;

const GlassmorphismDemo = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Sample data for glass table
  const tableData = [
    {
      key: '1',
      name: 'Glass Card Design',
      status: 'Active',
      rating: 5,
      description: 'Beautiful glassmorphism card with hover effects'
    },
    {
      key: '2',
      name: 'Liquid Glass Button',
      status: 'Premium',
      rating: 5,
      description: 'Interactive button with shimmer animation'
    },
    {
      key: '3',
      name: 'Frosted Input Field',
      status: 'Active',
      rating: 4,
      description: 'Elegant input with glass background'
    }
  ];

  const tableColumns = [
    {
      title: 'Component',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong style={{ color: '#2d5016' }}>{text}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`glass-card ${status === 'Premium' ? 'glass-warning' : 'glass-success'}`} 
              style={{ padding: '4px 12px', display: 'inline-block', fontSize: '12px' }}>
          {status}
        </span>
      )
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          {[...Array(rating)].map((_, i) => (
            <StarOutlined key={i} style={{ color: '#faad14' }} />
          ))}
        </Space>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Glass Elements */}
      <div className="glass-floating-element large" style={{ top: '10%', right: '10%' }} />
      <div className="glass-floating-element medium" style={{ top: '60%', left: '5%' }} />
      <div className="glass-floating-element small" style={{ top: '30%', left: '80%' }} />
      <div className="glass-floating-element medium" style={{ bottom: '20%', right: '20%' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div className="glass-card" style={{ padding: '40px', marginBottom: '40px', textAlign: 'center' }}>
          <Title level={1} style={{ color: '#2d5016', marginBottom: '16px' }}>
            <CrownOutlined style={{ marginRight: '12px', color: '#faad14' }} />
            KBN Glassmorphism Design System
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#595959', marginBottom: '24px' }}>
            Inspired by Apple's Liquid Glass design language - Making complex systems feel effortlessly beautiful
          </Paragraph>
          <Space size="large">
            <div className="glass-button" onClick={() => setModalVisible(true)}>
              <RocketOutlined style={{ marginRight: '8px' }} />
              Launch Demo Modal
            </div>
            <div className="glass-button glass-success" style={{ color: '#389e0d' }}>
              <FireOutlined style={{ marginRight: '8px' }} />
              Explore Components
            </div>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          
          {/* Glass Cards Section */}
          <Col xs={24} lg={12}>
            <div className="glass-card" style={{ padding: '32px', height: '100%' }}>
              <Title level={3} style={{ color: '#2d5016', marginBottom: '24px' }}>
                <StarOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                Glass Card Variants
              </Title>
              
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className="glass-card glass-shimmer" style={{ padding: '20px' }}>
                  <Text strong>Default Glass Card</Text>
                  <br />
                  <Text type="secondary">With subtle shimmer animation</Text>
                </div>
                
                <div className="glass-card glass-success" style={{ padding: '20px' }}>
                  <Text strong style={{ color: '#389e0d' }}>Success Glass Card</Text>
                  <br />
                  <Text type="secondary">Perfect for positive feedback</Text>
                </div>
                
                <div className="glass-card glass-warning" style={{ padding: '20px' }}>
                  <Text strong style={{ color: '#d48806' }}>Warning Glass Card</Text>
                  <br />
                  <Text type="secondary">Attention-grabbing design</Text>
                </div>
                
                <div className="glass-card glass-error" style={{ padding: '20px' }}>
                  <Text strong style={{ color: '#cf1322' }}>Error Glass Card</Text>
                  <br />
                  <Text type="secondary">Clear error communication</Text>
                </div>
              </Space>
            </div>
          </Col>

          {/* Interactive Elements */}
          <Col xs={24} lg={12}>
            <div className="glass-card" style={{ padding: '32px', height: '100%' }}>
              <Title level={3} style={{ color: '#2d5016', marginBottom: '24px' }}>
                <ThunderboltOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                Interactive Glass Elements
              </Title>
              
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>Glass Input Field</Text>
                  <input 
                    className="glass-input"
                    placeholder="Type something magical..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '12px' }}>Glass Buttons</Text>
                  <Space wrap>
                    <div className="glass-button">
                      <HeartOutlined style={{ marginRight: '6px' }} />
                      Primary
                    </div>
                    <div className="glass-button glass-success" style={{ color: '#389e0d' }}>
                      Success
                    </div>
                    <div className="glass-button glass-warning" style={{ color: '#d48806' }}>
                      Warning
                    </div>
                    <div className="glass-button glass-error" style={{ color: '#cf1322' }}>
                      Danger
                    </div>
                  </Space>
                </div>
                
                <div>
                  <Text strong style={{ display: 'block', marginBottom: '12px' }}>Blur Variations</Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="glass-card glass-blur-subtle" style={{ padding: '12px' }}>
                      <Text>Subtle Blur (8px)</Text>
                    </div>
                    <div className="glass-card glass-blur-medium" style={{ padding: '12px' }}>
                      <Text>Medium Blur (16px)</Text>
                    </div>
                    <div className="glass-card glass-blur-strong" style={{ padding: '12px' }}>
                      <Text>Strong Blur (24px)</Text>
                    </div>
                  </Space>
                </div>
              </Space>
            </div>
          </Col>

          {/* Glass Table */}
          <Col xs={24}>
            <div className="glass-card" style={{ padding: '32px' }}>
              <Title level={3} style={{ color: '#2d5016', marginBottom: '24px' }}>
                Glass Data Table
              </Title>
              <div className="glass-table">
                <Table 
                  dataSource={tableData}
                  columns={tableColumns}
                  pagination={false}
                  style={{ background: 'transparent' }}
                />
              </div>
            </div>
          </Col>

          {/* Implementation Guide */}
          <Col xs={24}>
            <div className="glass-card" style={{ padding: '32px' }}>
              <Title level={3} style={{ color: '#2d5016', marginBottom: '24px' }}>
                🚀 Implementation Guide
              </Title>
              
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <div className="glass-card glass-info" style={{ padding: '20px', height: '100%' }}>
                    <Title level={4} style={{ color: '#1890ff' }}>1. Import CSS</Title>
                    <Text code>import '../styles/glassmorphism-system.css'</Text>
                  </div>
                </Col>
                
                <Col xs={24} md={8}>
                  <div className="glass-card glass-success" style={{ padding: '20px', height: '100%' }}>
                    <Title level={4} style={{ color: '#389e0d' }}>2. Apply Classes</Title>
                    <Text code>className="glass-card"</Text>
                  </div>
                </Col>
                
                <Col xs={24} md={8}>
                  <div className="glass-card glass-warning" style={{ padding: '20px', height: '100%' }}>
                    <Title level={4} style={{ color: '#d48806' }}>3. Customize</Title>
                    <Text code>glass-card glass-success</Text>
                  </div>
                </Col>
              </Row>
              
              <Divider />
              
              <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
                <strong>Available Classes:</strong> glass-card, glass-button, glass-input, glass-table, glass-modal, 
                glass-navbar, glass-sidebar, glass-success, glass-warning, glass-error, glass-info, 
                glass-blur-subtle, glass-blur-medium, glass-blur-strong, glass-shimmer
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>

      {/* Glass Modal */}
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        className="glass-modal"
        style={{ top: '10%' }}
      >
        <div style={{ padding: '20px' }}>
          <Title level={2} style={{ color: '#2d5016', textAlign: 'center', marginBottom: '24px' }}>
            <CrownOutlined style={{ marginRight: '12px', color: '#faad14' }} />
            Glass Modal Demo
          </Title>
          
          <Paragraph style={{ fontSize: '16px', textAlign: 'center', marginBottom: '32px' }}>
            This modal demonstrates the extreme blur effect with beautiful glass styling.
            Perfect for important dialogs and focused interactions.
          </Paragraph>
          
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <input 
              className="glass-input"
              placeholder="Glass input inside modal..."
            />
            
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <div className="glass-button glass-success" onClick={() => setModalVisible(false)}>
                <StarOutlined style={{ marginRight: '6px' }} />
                Awesome!
              </div>
              <div className="glass-button" onClick={() => setModalVisible(false)}>
                Close
              </div>
            </Space>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default GlassmorphismDemo; 