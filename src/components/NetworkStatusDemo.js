import React, { useState } from 'react';
import { Card, CardBody, Button, Row, Col } from 'shards-react';
import { Switch, Space, Typography, Divider, Alert, Tabs } from 'antd';
import NetworkStatusIndicator from 'elements/NetworkStatusIndicator';
import NoWifi from 'elements/NoWifi';
import { useNetworkStatus } from 'hooks/useNetworkStatus';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const NetworkStatusDemo = () => {
  const [showEnhanced, setShowEnhanced] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [detailedStatus, setDetailedStatus] = useState(true);
  const [showRetryButton, setShowRetryButton] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);
  const [showWhenOnline, setShowWhenOnline] = useState(false);
  const [enableQualityCheck, setEnableQualityCheck] = useState(true);

  const {
    connectionStatus,
    connectionQuality,
    isOnline,
    isOffline,
    isReconnecting,
    isUnstable,
    connectionLatency,
    downlinkSpeed,
    effectiveType,
    retryCount,
    isRetrying,
    getQualityText,
    getStatusText,
    retryConnection
  } = useNetworkStatus();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Network Status Components Demo</Title>
      
      <Alert
        message="Enhanced Network Monitoring"
        description="This demo showcases the improved network status components with real-time connection monitoring, quality detection, and automatic retry mechanisms."
        type="info"
        showIcon
        style={{ marginBottom: '20px' }}
      />

      <Tabs defaultActiveKey="1">
        <TabPane tab="Live Demo" key="1">
          <Row gutter={[20, 20]}>
            {/* Configuration Panel */}
            <Col xs={24} md={8}>
              <Card>
                <CardBody>
                  <Title level={4}>Configuration</Title>
                  
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Component Visibility</Text>
                      <br />
                      <Switch
                        checked={showEnhanced}
                        onChange={setShowEnhanced}
                        style={{ marginRight: '8px' }}
                      />
                      <Text>Enhanced Component</Text>
                      <br />
                      <Switch
                        checked={showOriginal}
                        onChange={setShowOriginal}
                        style={{ marginRight: '8px' }}
                      />
                      <Text>Original Component</Text>
                    </div>

                    <Divider />

                    <div>
                      <Text strong>Features</Text>
                      <br />
                      <Switch
                        checked={detailedStatus}
                        onChange={setDetailedStatus}
                        style={{ marginRight: '8px' }}
                      />
                      <Text>Detailed Status</Text>
                      <br />
                      <Switch
                        checked={showRetryButton}
                        onChange={setShowRetryButton}
                        style={{ marginRight: '8px' }}
                      />
                      <Text>Retry Button</Text>
                      <br />
                      <Switch
                        checked={autoRetry}
                        onChange={setAutoRetry}
                        style={{ marginRight: '8px' }}
                      />
                      <Text>Auto Retry</Text>
                      <br />
                      <Switch
                        checked={showWhenOnline}
                        onChange={setShowWhenOnline}
                        style={{ marginRight: '8px' }}
                      />
                      <Text>Show When Online</Text>
                      <br />
                      <Switch
                        checked={enableQualityCheck}
                        onChange={setEnableQualityCheck}
                        style={{ marginRight: '8px' }}
                      />
                      <Text>Quality Check</Text>
                    </div>

                    <Divider />

                    <div>
                      <Text strong>Manual Actions</Text>
                      <br />
                      <Button
                        size="sm"
                        theme="primary"
                        onClick={retryConnection}
                        disabled={isRetrying}
                        style={{ marginTop: '8px' }}
                      >
                        {isRetrying ? 'Retrying...' : 'Test Retry'}
                      </Button>
                    </div>
                  </Space>
                </CardBody>
              </Card>
            </Col>

            {/* Status Information */}
            <Col xs={24} md={16}>
              <Card>
                <CardBody>
                  <Title level={4}>Current Network Status</Title>
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong>Connection Status:</Text>
                        <br />
                        <Text>{getStatusText()}</Text>
                      </div>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong>Connection Quality:</Text>
                        <br />
                        <Text>{getQualityText()}</Text>
                      </div>
                    </Col>

                    {connectionLatency && (
                      <Col xs={24} sm={12}>
                        <div>
                          <Text strong>Latency:</Text>
                          <br />
                          <Text>{Math.round(connectionLatency)}ms</Text>
                        </div>
                      </Col>
                    )}

                    {downlinkSpeed && (
                      <Col xs={24} sm={12}>
                        <div>
                          <Text strong>Download Speed:</Text>
                          <br />
                          <Text>{downlinkSpeed}Mbps</Text>
                        </div>
                      </Col>
                    )}

                    {effectiveType && (
                      <Col xs={24} sm={12}>
                        <div>
                          <Text strong>Connection Type:</Text>
                          <br />
                          <Text>{effectiveType.toUpperCase()}</Text>
                        </div>
                      </Col>
                    )}

                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong>Retry Count:</Text>
                        <br />
                        <Text>{retryCount}</Text>
                      </div>
                    </Col>
                  </Row>

                  <Divider />

                  <Title level={5}>Status Indicators</Title>
                  <Space>
                    <Text type={isOnline ? 'success' : 'secondary'}>
                      Online: {isOnline ? '✅' : '❌'}
                    </Text>
                    <Text type={isOffline ? 'danger' : 'secondary'}>
                      Offline: {isOffline ? '❌' : '✅'}
                    </Text>
                    <Text type={isReconnecting ? 'warning' : 'secondary'}>
                      Reconnecting: {isReconnecting ? '🔄' : '✅'}
                    </Text>
                    <Text type={isUnstable ? 'warning' : 'secondary'}>
                      Unstable: {isUnstable ? '⚠️' : '✅'}
                    </Text>
                  </Space>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Features Comparison" key="2">
          <Row gutter={[20, 20]}>
            <Col xs={24} md={12}>
              <Card>
                <CardBody>
                  <Title level={4}>🔥 Enhanced Version</Title>
                  <ul>
                    <li><strong>Multi-state Detection:</strong> Online, Offline, Reconnecting, Unstable</li>
                    <li><strong>Connection Quality:</strong> Excellent, Good, Fair, Poor based on latency</li>
                    <li><strong>Real-time Metrics:</strong> Latency, download speed, connection type</li>
                    <li><strong>Auto Retry Mechanism:</strong> Configurable retry intervals</li>
                    <li><strong>Manual Retry:</strong> User-triggered connection attempts</li>
                    <li><strong>Progress Tracking:</strong> Visual retry progress indicator</li>
                    <li><strong>Success Notifications:</strong> Toast messages for reconnection</li>
                    <li><strong>Responsive Design:</strong> Mobile-optimized layout</li>
                    <li><strong>Accessibility:</strong> Reduced motion and high contrast support</li>
                    <li><strong>Advanced Animations:</strong> Quality-based visual feedback</li>
                  </ul>
                </CardBody>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card>
                <CardBody>
                  <Title level={4}>📱 Original Version</Title>
                  <ul>
                    <li><strong>Basic States:</strong> Online/Offline only</li>
                    <li><strong>Simple Animation:</strong> Opacity-based pulsing</li>
                    <li><strong>Fixed Positioning:</strong> Limited responsive design</li>
                    <li><strong>No Retry Mechanism:</strong> Passive monitoring only</li>
                    <li><strong>Basic Visual:</strong> Icon and text only</li>
                    <li><strong>No Quality Check:</strong> Boolean online status</li>
                    <li><strong>No User Interaction:</strong> Display-only component</li>
                    <li><strong>Limited Information:</strong> Minimal status details</li>
                  </ul>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Usage Examples" key="3">
          <Card>
            <CardBody>
              <Title level={4}>Implementation Examples</Title>
              
              <Paragraph>
                <Title level={5}>1. Basic Usage</Title>
                <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`import NetworkStatusIndicator from 'elements/NetworkStatusIndicator';

// Basic implementation
<NetworkStatusIndicator />

// With custom configuration
<NetworkStatusIndicator
  detailedStatus={true}
  showRetryButton={true}
  autoRetry={true}
  retryInterval={5000}
/>`}
                </pre>
              </Paragraph>

              <Paragraph>
                <Title level={5}>2. Using the Custom Hook</Title>
                <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`import { useNetworkStatus } from 'hooks/useNetworkStatus';

const MyComponent = () => {
  const {
    isOnline,
    connectionQuality,
    connectionLatency,
    retryConnection,
    getStatusText
  } = useNetworkStatus();

  return (
    <div>
      <p>Status: {getStatusText()}</p>
      <p>Quality: {connectionQuality}</p>
      {connectionLatency && <p>Ping: {connectionLatency}ms</p>}
      <button onClick={retryConnection}>Retry</button>
    </div>
  );
};`}
                </pre>
              </Paragraph>

              <Paragraph>
                <Title level={5}>3. Advanced Configuration</Title>
                <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`<NetworkStatusIndicator
  position="absolute"
  showWhenOnline={true}
  autoHideDelay={5000}
  enableQualityCheck={true}
  onlineMessage="เชื่อมต่อสำเร็จแล้ว"
  offlineMessage="การเชื่อมต่อขัดข้อง"
/>`}
                </pre>
              </Paragraph>
            </CardBody>
          </Card>
        </TabPane>
      </Tabs>

      {/* Live Components */}
      {showEnhanced && (
        <NetworkStatusIndicator
          detailedStatus={detailedStatus}
          showRetryButton={showRetryButton}
          autoRetry={autoRetry}
          showWhenOnline={showWhenOnline}
          enableQualityCheck={enableQualityCheck}
          position="fixed"
        />
      )}

      {showOriginal && (
        <NoWifi />
      )}
    </div>
  );
};

export default NetworkStatusDemo; 