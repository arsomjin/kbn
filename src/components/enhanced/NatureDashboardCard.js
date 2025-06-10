import React from 'react';
import { Card, Statistic, Row, Col, Avatar } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  TrophyOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import { NATURE_COLORS } from '../theme/NatureThemeProvider';

/**
 * Enhanced Dashboard Card with Nature-Inspired Design
 * Features beautiful gradients, animations, and responsive design
 */

const NatureDashboardCard = ({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendValue,
  icon: IconComponent = DollarOutlined,
  type = 'primary', // 'primary', 'secondary', 'success', 'warning', 'info'
  loading = false,
  className = '',
  style = {},
  showTrend = true,
  animated = true,
  size = 'default', // 'small', 'default', 'large'
  ...props
}) => {
  // Color configurations for different card types
  const getCardConfig = (cardType) => {
    const configs = {
      primary: {
        gradient: `linear-gradient(135deg, ${NATURE_COLORS.primary} 0%, ${NATURE_COLORS.primaryLight} 100%)`,
        iconBg: NATURE_COLORS.primary,
        textColor: '#ffffff',
        shadowColor: 'rgba(45, 80, 22, 0.3)',
      },
      secondary: {
        gradient: `linear-gradient(135deg, ${NATURE_COLORS.secondary} 0%, ${NATURE_COLORS.secondaryLight} 100%)`,
        iconBg: NATURE_COLORS.secondary,
        textColor: '#ffffff',
        shadowColor: 'rgba(82, 196, 26, 0.3)',
      },
      success: {
        gradient: `linear-gradient(135deg, ${NATURE_COLORS.success} 0%, #22c55e 100%)`,
        iconBg: NATURE_COLORS.success,
        textColor: '#ffffff',
        shadowColor: 'rgba(22, 163, 74, 0.3)',
      },
      warning: {
        gradient: `linear-gradient(135deg, ${NATURE_COLORS.warning} 0%, #fbbf24 100%)`,
        iconBg: NATURE_COLORS.warning,
        textColor: '#ffffff',
        shadowColor: 'rgba(245, 158, 11, 0.3)',
      },
      info: {
        gradient: `linear-gradient(135deg, ${NATURE_COLORS.info} 0%, #38bdf8 100%)`,
        iconBg: NATURE_COLORS.info,
        textColor: '#ffffff',
        shadowColor: 'rgba(14, 165, 233, 0.3)',
      },
      earth: {
        gradient: `linear-gradient(135deg, ${NATURE_COLORS.earth} 0%, ${NATURE_COLORS.earthLight} 100%)`,
        iconBg: NATURE_COLORS.earth,
        textColor: '#ffffff',
        shadowColor: 'rgba(139, 69, 19, 0.3)',
      },
    };
    
    return configs[cardType] || configs.primary;
  };

  const cardConfig = getCardConfig(type);
  
  // Size configurations
  const getSizeConfig = (cardSize) => {
    const sizes = {
      small: {
        padding: '16px',
        iconSize: 32,
        titleSize: '14px',
        valueSize: '24px',
        minHeight: '120px',
      },
      default: {
        padding: '20px',
        iconSize: 40,
        titleSize: '16px',
        valueSize: '28px',
        minHeight: '140px',
      },
      large: {
        padding: '24px',
        iconSize: 48,
        titleSize: '18px',
        valueSize: '32px',
        minHeight: '160px',
      },
    };
    
    return sizes[cardSize] || sizes.default;
  };

  const sizeConfig = getSizeConfig(size);

  // Trend configuration
  const getTrendConfig = (trendType) => {
    if (trendType === 'up') {
      return {
        icon: <ArrowUpOutlined />,
        color: NATURE_COLORS.success,
        prefix: '+',
      };
    } else if (trendType === 'down') {
      return {
        icon: <ArrowDownOutlined />,
        color: NATURE_COLORS.error,
        prefix: '-',
      };
    }
    return null;
  };

  const trendConfig = getTrendConfig(trend);

  // Card styles
  const cardStyles = {
    background: cardConfig.gradient,
    border: 'none',
    borderRadius: '16px',
    boxShadow: `0 8px 24px ${cardConfig.shadowColor}`,
    overflow: 'hidden',
    position: 'relative',
    minHeight: sizeConfig.minHeight,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    ...style,
  };

  const cardBodyStyles = {
    padding: sizeConfig.padding,
    position: 'relative',
    zIndex: 2,
  };

  // Animated background pattern
  const backgroundPattern = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
    `,
    zIndex: 1,
  };

  const hoverStyles = animated ? {
    ':hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: `0 12px 32px ${cardConfig.shadowColor}`,
    }
  } : {};

  return (
    <Card
      className={`nature-dashboard-card ${animated ? 'nature-fade-in' : ''} ${className}`}
      style={cardStyles}
      bodyStyle={cardBodyStyles}
      loading={loading}
      hoverable={animated}
      {...props}
    >
      {/* Background Pattern */}
      <div style={backgroundPattern} />
      
      {/* Card Content */}
      <Row align="middle" justify="space-between" style={{ position: 'relative', zIndex: 2 }}>
        <Col flex="1">
          {/* Main Statistics */}
          <Statistic
            title={title}
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{
              color: cardConfig.textColor,
              fontSize: sizeConfig.valueSize,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
            titleStyle={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: sizeConfig.titleSize,
              fontWeight: 500,
              marginBottom: '8px',
            }}
          />
          
          {/* Trend Indicator */}
          {showTrend && trendConfig && trendValue && (
            <div style={{ 
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{ 
                color: trendConfig.color,
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 6px',
                borderRadius: '8px',
              }}>
                {trendConfig.icon}
                {trendConfig.prefix}{trendValue}%
              </span>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12px',
              }}>
                vs last period
              </span>
            </div>
          )}
        </Col>
        
        {/* Icon */}
        <Col>
          <Avatar
            size={sizeConfig.iconSize}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: cardConfig.textColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
            icon={<IconComponent style={{ fontSize: sizeConfig.iconSize * 0.6 }} />}
          />
        </Col>
      </Row>
    </Card>
  );
};

NatureDashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.number,
  icon: PropTypes.elementType,
  type: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'info', 'earth']),
  loading: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  showTrend: PropTypes.bool,
  animated: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
};

NatureDashboardCard.displayName = 'NatureDashboardCard';

// Export some common icon configurations
export const DashboardIcons = {
  Sales: ShoppingCartOutlined,
  Revenue: DollarOutlined,
  Users: TeamOutlined,
  Achievement: TrophyOutlined,
};

export default NatureDashboardCard; 