/**
 * 🏆 EXECUTIVE BRIEFING SYSTEM
 * Strategic overview of KBN's competitive advantages and system capabilities
 * For C-level executives and strategic decision makers
 */

import React, { useState } from 'react';
import { useNamespacedTranslation } from 'translations/i18n-fixed';
import LanguageSwitcher from 'components/LanguageSwitcher';
import {
  Card,
  Row,
  Col,
  Statistic,
  Timeline,
  Alert,
  Tabs,
  Typography,
  Space,
  Tag,
  Badge,
  List,
  Avatar
} from 'antd';
import {
  TrophyOutlined,
  RocketOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  DollarOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  StarOutlined,
  FireOutlined,
  BulbOutlined
} from '@ant-design/icons';
import LayoutWithRBAC from 'components/layout/LayoutWithRBAC';
import ScreenWithManual from 'components/ScreenWithManual';
import { usePermissions } from 'hooks/usePermissions';
import { useResponsive } from 'hooks/useResponsive';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ExecutiveBriefing = () => {
  const { isMobile } = useResponsive();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useNamespacedTranslation('executive');

  // Get translated data from translation files
  const competitiveAdvantages = t('overview.competitiveAdvantages', { returnObjects: true }) || [];
  const roadmapPhases = t('roadmap.roadmapPhases', { returnObjects: true }) || [];
  const systemCapabilities = t('capabilities.systemCapabilities', { returnObjects: true }) || [];

  // Helper function to add icons and colors to competitive advantages
  const getCompetitiveAdvantagesWithIcons = () => {
    const iconMap = [
      { icon: <GlobalOutlined />, color: '#52c41a' },
      { icon: <SecurityScanOutlined />, color: '#1890ff' },
      { icon: <CrownOutlined />, color: '#722ed1' },
      { icon: <BarChartOutlined />, color: '#fa8c16' },
      { icon: <ThunderboltOutlined />, color: '#eb2f96' }
    ];
    
    return competitiveAdvantages.map((advantage, index) => ({
      ...advantage,
      icon: iconMap[index]?.icon || <StarOutlined />,
      color: iconMap[index]?.color || '#1890ff'
    }));
  };

  // Helper function to add icons and colors to system capabilities
  const getSystemCapabilitiesWithIcons = () => {
    const iconMap = [
      { icon: <SafetyCertificateOutlined />, color: '#52c41a' },
      { icon: <RocketOutlined />, color: '#1890ff' },
      { icon: <BarChartOutlined />, color: '#fa8c16' },
      { icon: <StarOutlined />, color: '#722ed1' }
    ];
    
    return systemCapabilities.map((capability, index) => ({
      ...capability,
      icon: iconMap[index]?.icon || <StarOutlined />,
      color: iconMap[index]?.color || '#1890ff'
    }));
  };

  // Strategic metrics and competitive advantages
  const strategicMetrics = {
    securityLevel: 98,
    scalabilityScore: 95,
    competitiveAdvantage: 92,
    businessValue: 89,
    futureReadiness: 96
  };

  const renderOverviewTab = () => (
    <div>
      {/* Executive Summary */}
      <Card 
        title={
          <Space>
            <CrownOutlined style={{ color: '#faad14' }} />
            <span>{t('overview.title')}</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Alert
          message={t('briefing.overview.alert.message')}
          description={t('briefing.overview.alert.description')}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('overview.securityLevel.title')}
              value={strategicMetrics.securityLevel}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<SecurityScanOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('overview.scalabilityScore.title')}
              value={strategicMetrics.scalabilityScore}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<GlobalOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('overview.competitiveAdvantage.title')}
              value={strategicMetrics.competitiveAdvantage}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
              prefix={<TrophyOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Competitive Advantages */}
      <Card 
        title={
          <Space>
            <CrownOutlined style={{ color: '#722ed1' }} />
            <span>{t('overview.competitiveAdvantagesTitle')}</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <List
          dataSource={getCompetitiveAdvantagesWithIcons()}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={item.icon} 
                    style={{ backgroundColor: item.color }}
                  />
                }
                title={
                  <Space>
                    <span>{item.title}</span>
                    <Tag color={item.impact === 'Critical' ? 'red' : item.impact === 'High' ? 'orange' : 'blue'}>
                      {item.impact} Impact
                    </Tag>
                    <Tag color="purple">{item.uniqueness}</Tag>
                  </Space>
                }
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Strategic Value Proposition */}
      <Card 
        title={
          <Space>
            <BulbOutlined style={{ color: '#faad14' }} />
            <span>{t('overview.strategicValueProposition.title')}</span>
          </Space>
        }
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card size="small" title={t('overview.strategicValueProposition.businessProtection.title')}>
              <ul>
                <li><strong>{t('overview.strategicValueProposition.enterpriseSecurity.title')}:</strong> {t('overview.strategicValueProposition.enterpriseSecurity.description')}</li>
                <li><strong>{t('overview.strategicValueProposition.regulatoryCompliance.title')}:</strong> {t('overview.strategicValueProposition.regulatoryCompliance.description')}</li>
                <li><strong>{t('overview.strategicValueProposition.dataProtection.title')}:</strong> {t('overview.strategicValueProposition.dataProtection.description')}</li>
                <li><strong>{t('overview.strategicValueProposition.riskMitigation.title')}:</strong> {t('overview.strategicValueProposition.riskMitigation.description')}</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title={t('overview.strategicValueProposition.growthEnablement.title')}>
              <ul>
                <li><strong>{t('overview.strategicValueProposition.unlimitedExpansion.title')}:</strong> {t('overview.strategicValueProposition.unlimitedExpansion.description')}</li>
                <li><strong>{t('overview.strategicValueProposition.operationalEfficiency.title')}:</strong> {t('overview.strategicValueProposition.operationalEfficiency.description')}</li>
                <li><strong>{t('overview.strategicValueProposition.decisionIntelligence.title')}:</strong> {t('overview.strategicValueProposition.decisionIntelligence.description')}</li>
                <li><strong>{t('overview.strategicValueProposition.marketLeadership.title')}:</strong> {t('overview.strategicValueProposition.marketLeadership.description')}</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const renderCapabilitiesTab = () => (
    <div>
      <Alert
        message={t('capabilities.alert.message')}
        description={t('capabilities.alert.description')}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        {getSystemCapabilitiesWithIcons().map((category, index) => (
          <Col xs={24} lg={12} key={index}>
            <Card
              title={
                <Space>
                  {React.cloneElement(category.icon, { style: { color: category.color } })}
                  <span>{category.category}</span>
                </Space>
              }
              style={{ height: '100%' }}
            >
              <List
                size="small"
                dataSource={category.capabilities}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      <Badge status="success" />
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  const renderRoadmapTab = () => (
    <div>
      <Alert
        message={t('roadmap.alert.message')}
        description={t('roadmap.alert.description')}
        type="success"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Timeline mode="left">
        {roadmapPhases.map((phase, index) => (
          <Timeline.Item
            key={index}
            color={phase.status === 'completed' ? 'green' : phase.status === 'in-progress' ? 'blue' : 'gray'}
            dot={
              phase.status === 'completed' ? <TrophyOutlined /> :
              phase.status === 'in-progress' ? <RocketOutlined /> : <StarOutlined />
            }
          >
            <Card size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Title level={4} style={{ margin: 0 }}>{phase.phase}</Title>
                  <Tag color={
                    phase.status === 'completed' ? 'success' :
                    phase.status === 'in-progress' ? 'processing' : 'default'
                  }>
                    {phase.status === 'completed' ? '✅ Completed' :
                     phase.status === 'in-progress' ? '🔄 In Progress' : '📋 Planned'}
                  </Tag>
                </Space>
                <Text type="secondary">{phase.description}</Text>
                <List
                  size="small"
                  dataSource={phase.achievements}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        <Badge status={phase.status === 'completed' ? 'success' : 'processing'} />
                        <Text>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
                <Alert
                  message={phase.businessValue}
                  type={phase.status === 'completed' ? 'success' : 'info'}
                  showIcon
                  size="small"
                />
              </Space>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );

  const renderROITab = () => (
    <div>
      <Alert
        message={t('roi.alert.message')}
        description={t('roi.alert.description')}
        type="success"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title={t('roi.operationalEfficiencyGain.title')}
              value={50}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<ThunderboltOutlined />}
            />
            <Text type="secondary">{t('roi.operationalEfficiencyGain.description')}</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title={t('roi.securityRiskReduction.title')}
              value={85}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<SecurityScanOutlined />}
            />
            <Text type="secondary">{t('roi.securityRiskReduction.description')}</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title={t('roi.expansionCostSavings.title')}
              value={70}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
              prefix={<GlobalOutlined />}
            />
            <Text type="secondary">{t('roi.expansionCostSavings.description')}</Text>
          </Card>
        </Col>
      </Row>

      <Card title={t('roi.businessImpactMetrics.title')} style={{ marginTop: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={5}>{t('roi.operationalBenefits.title')}</Title>
            <ul>
              <li><strong>{t('roi.operationalBenefits.reduction.title')}:</strong> {t('roi.operationalBenefits.reduction.description')}</li>
              <li><strong>{t('roi.operationalBenefits.faster.title')}:</strong> {t('roi.operationalBenefits.faster.description')}</li>
              <li><strong>{t('roi.operationalBenefits.improvement.title')}:</strong> {t('roi.operationalBenefits.improvement.description')}</li>
              <li><strong>{t('roi.operationalBenefits.increase.title')}:</strong> {t('roi.operationalBenefits.increase.description')}</li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <Title level={5}>{t('roi.riskMitigation.title')}</Title>
            <ul>
              <li><strong>{t('roi.riskMitigation.unauthorizedAccess.title')}:</strong> {t('roi.riskMitigation.unauthorizedAccess.description')}</li>
              <li><strong>{t('roi.riskMitigation.auditCompliance.title')}:</strong> {t('roi.riskMitigation.auditCompliance.description')}</li>
              <li><strong>{t('roi.riskMitigation.securityUpdates.title')}:</strong> {t('roi.riskMitigation.securityUpdates.description')}</li>
              <li><strong>{t('roi.riskMitigation.regulatoryCompliance.title')}:</strong> {t('roi.riskMitigation.regulatoryCompliance.description')}</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );

  return (
    <ScreenWithManual 
      screenType="executive-briefing"
      showManualOnFirstVisit={true}
    >
      <LayoutWithRBAC 
        permission="admin.executive" 
        title="Executive Briefing"
        requireBranchSelection={false}
        showAuditTrail={false}
        showStepper={false}
      >
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
          <Card 
            title={
              <Space>
                <CrownOutlined style={{ color: '#faad14', fontSize: '24px' }} />
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                                     {t('briefing.title')}
                </Title>
              </Space>
            }
            extra={
              <Space>
                <LanguageSwitcher size="small" />
                <Tag color="gold" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  <FireOutlined /> {t('tag')}
                </Tag>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Paragraph style={{ fontSize: '16px', marginBottom: 0 }}>
              {t('description')}
            </Paragraph>
          </Card>

          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size={isMobile ? 'small' : 'default'}
            tabPosition={isMobile ? 'top' : 'top'}
          >
            <TabPane 
              tab={
                <Space>
                  <TrophyOutlined />
                  <span>{t('overview.title')}</span>
                </Space>
              } 
              key="overview"
            >
              {renderOverviewTab()}
            </TabPane>

            <TabPane 
              tab={
                <Space>
                  <RocketOutlined />
                  <span>{t('capabilities.title')}</span>
                </Space>
              } 
              key="capabilities"
            >
              {renderCapabilitiesTab()}
            </TabPane>

            <TabPane 
              tab={
                <Space>
                  <GlobalOutlined />
                  <span>{t('roadmap.title')}</span>
                </Space>
              } 
              key="roadmap"
            >
              {renderRoadmapTab()}
            </TabPane>

            <TabPane 
              tab={
                <Space>
                  <DollarOutlined />
                  <span>{t('roi.title')}</span>
                </Space>
              } 
              key="roi"
            >
              {renderROITab()}
            </TabPane>
          </Tabs>
        </div>
      </LayoutWithRBAC>
    </ScreenWithManual>
  );
};

export default ExecutiveBriefing; 