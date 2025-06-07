import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Card, CardHeader, CardBody, Button, Col } from 'shards-react';
import { Switch, Typography, Divider, Space, InputNumber, Alert, notification } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setNetworkStatusConfig } from 'redux/actions/global';
import MainContainer from './MainContainer';
import { showSuccess } from 'functions';

const { Title, Text, Paragraph } = Typography;

const SystemSettings = ({ toggleMain, hideMain }) => {
  const { user } = useSelector(state => state.auth);
  const { networkStatus } = useSelector(state => state.global);
  const dispatch = useDispatch();
  
  const [localConfig, setLocalConfig] = useState(networkStatus);
  const [hasChanges, setHasChanges] = useState(false);

  // Permission check - only developers or system admins can access
  const hasPermission = user.isDev || (user.permissions && user.permissions.permission601);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    setHasChanges(JSON.stringify(newConfig) !== JSON.stringify(networkStatus));
  };

  const handleSave = () => {
    dispatch(setNetworkStatusConfig(localConfig));
    setHasChanges(false);
    
    notification.success({
      message: 'บันทึกการตั้งค่าสำเร็จ',
      description: 'การตั้งค่าระบบได้รับการอัปเดตแล้ว',
      placement: 'topRight',
    });
  };

  const handleReset = () => {
    setLocalConfig(networkStatus);
    setHasChanges(false);
  };

  const handleResetToDefault = () => {
    const defaultConfig = {
      enabled: true,
      detailedStatus: true,
      showRetryButton: true,
      autoRetry: true,
      enableQualityCheck: true,
      showWhenOnline: false,
      retryInterval: 5000
    };
    setLocalConfig(defaultConfig);
    setHasChanges(JSON.stringify(defaultConfig) !== JSON.stringify(networkStatus));
  };

  if (!hasPermission) {
    return (
      <MainContainer>
        <Alert
          message="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการเข้าถึงการตั้งค่าระบบ กรุณาติดต่อผู้ดูแลระบบ"
          type="warning"
          showIcon
        />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <Card small className="mb-4">
        <CardHeader className="border-bottom">
          <Row style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <h6 className="m-0 mr-3 ml-3">การตั้งค่าระบบ</h6>
            {hasChanges && (
              <Space>
                <Button size="sm" theme="secondary" onClick={handleReset}>
                  ยกเลิก
                </Button>
                <Button size="sm" theme="primary" onClick={handleSave}>
                  บันทึก
                </Button>
              </Space>
            )}
          </Row>
        </CardHeader>

        <CardBody className="p-4">
          {/* Network Status Settings */}
          <div className="mb-4">
            <Title level={4}>การตั้งค่าสถานะเครือข่าย</Title>
            <Paragraph type="secondary">
              กำหนดค่าการแสดงสถานะการเชื่อมต่ออินเทอร์เน็ตและการจัดการเมื่อเชื่อมต่อขาดหาย
            </Paragraph>

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>เปิดใช้งานระบบตรวจสอบเครือข่าย</Text>
                    <br />
                    <Switch
                      checked={localConfig.enabled}
                      onChange={(checked) => handleConfigChange('enabled', checked)}
                    />
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      เปิด/ปิดการแสดงสถานะการเชื่อมต่อเครือข่าย
                    </Text>
                  </div>

                  <Divider />

                  <div>
                    <Text strong>แสดงข้อมูลรายละเอียด</Text>
                    <br />
                    <Switch
                      checked={localConfig.detailedStatus}
                      onChange={(checked) => handleConfigChange('detailedStatus', checked)}
                      disabled={!localConfig.enabled}
                    />
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      แสดงคุณภาพการเชื่อมต่อ, ความเร็ว, และรายละเอียดเพิ่มเติม
                    </Text>
                  </div>

                  <div>
                    <Text strong>ปุ่มลองใหม่</Text>
                    <br />
                    <Switch
                      checked={localConfig.showRetryButton}
                      onChange={(checked) => handleConfigChange('showRetryButton', checked)}
                      disabled={!localConfig.enabled}
                    />
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      แสดงปุ่มสำหรับลองเชื่อมต่อใหม่ด้วยตนเอง
                    </Text>
                  </div>

                  <div>
                    <Text strong>ลองเชื่อมต่อใหม่อัตโนมัติ</Text>
                    <br />
                    <Switch
                      checked={localConfig.autoRetry}
                      onChange={(checked) => handleConfigChange('autoRetry', checked)}
                      disabled={!localConfig.enabled}
                    />
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      ระบบจะพยายามเชื่อมต่อใหม่โดยอัตโนมัติเมื่อเชื่อมต่อขาดหาย
                    </Text>
                  </div>
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>ตรวจสอบคุณภาพการเชื่อมต่อ</Text>
                    <br />
                    <Switch
                      checked={localConfig.enableQualityCheck}
                      onChange={(checked) => handleConfigChange('enableQualityCheck', checked)}
                      disabled={!localConfig.enabled}
                    />
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      วัดความเร็วและคุณภาพของการเชื่อมต่ออินเทอร์เน็ต
                    </Text>
                  </div>

                  <div>
                    <Text strong>แสดงเมื่อเชื่อมต่อแล้ว</Text>
                    <br />
                    <Switch
                      checked={localConfig.showWhenOnline}
                      onChange={(checked) => handleConfigChange('showWhenOnline', checked)}
                      disabled={!localConfig.enabled}
                    />
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      แสดงสถานะแม้เมื่อเชื่อมต่ออินเทอร์เน็ตปกติ
                    </Text>
                  </div>

                  <div>
                    <Text strong>ช่วงเวลาลองใหม่ (มิลลิวินาที)</Text>
                    <br />
                    <InputNumber
                      min={1000}
                      max={30000}
                      step={1000}
                      value={localConfig.retryInterval}
                      onChange={(value) => handleConfigChange('retryInterval', value)}
                      disabled={!localConfig.enabled || !localConfig.autoRetry}
                      style={{ width: '100%' }}
                    />
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      ระยะเวลาระหว่างการลองเชื่อมต่อใหม่อัตโนมัติ (แนะนำ: 5000ms)
                    </Text>
                  </div>
                </Space>
              </Col>
            </Row>

            <Divider />

            <Space>
              <Button 
                theme="outline-secondary" 
                size="sm" 
                onClick={handleResetToDefault}
              >
                คืนค่าเริ่มต้น
              </Button>
              
              {hasChanges && (
                <>
                  <Button 
                    theme="outline-primary" 
                    size="sm" 
                    onClick={handleReset}
                  >
                    ยกเลิกการเปลี่ยนแปลง
                  </Button>
                  <Button 
                    theme="primary" 
                    size="sm" 
                    onClick={handleSave}
                  >
                    บันทึกการตั้งค่า
                  </Button>
                </>
              )}
            </Space>
          </div>

          {/* Preview Section */}
          {localConfig.enabled && (
            <div className="mt-4">
              <Alert
                message="ตัวอย่างการแสดงผล"
                description={
                  <div>
                    <p>เมื่อการตั้งค่าที่คุณเลือกถูกใช้งาน ระบบจะแสดง:</p>
                    <ul>
                      <li>สถานะการเชื่อมต่อ: {localConfig.detailedStatus ? 'รายละเอียดเต็ม' : 'พื้นฐาน'}</li>
                      <li>ปุ่มลองใหม่: {localConfig.showRetryButton ? 'แสดง' : 'ซ่อน'}</li>
                      <li>ลองเชื่อมต่อใหม่อัตโนมัติ: {localConfig.autoRetry ? `ทุก ${localConfig.retryInterval/1000} วินาที` : 'ปิดใช้งาน'}</li>
                      <li>ตรวจสอบคุณภาพ: {localConfig.enableQualityCheck ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</li>
                      <li>แสดงเมื่อออนไลน์: {localConfig.showWhenOnline ? 'แสดง' : 'ซ่อน'}</li>
                    </ul>
                  </div>
                }
                type="info"
                showIcon
              />
            </div>
          )}

          {!localConfig.enabled && (
            <div className="mt-4">
              <Alert
                message="ระบบตรวจสอบเครือข่ายถูกปิดใช้งาน"
                description="ระบบจะใช้การแสดงสถานะเครือข่ายแบบพื้นฐานเท่านั้น"
                type="warning"
                showIcon
              />
            </div>
          )}
        </CardBody>
      </Card>
    </MainContainer>
  );
};

SystemSettings.propTypes = {
  toggleMain: PropTypes.func,
  hideMain: PropTypes.bool,
};

export default SystemSettings; 