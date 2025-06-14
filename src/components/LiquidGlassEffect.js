import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import '../styles/liquid-glass-effects.css';

const LiquidGlassEffect = ({ 
  intensity = 'medium', // 'low', 'medium', 'high'
  enabled = true,
  adaptivePerformance = true // NEW: Auto-adjust based on device capabilities
}) => {
  const [orbs, setOrbs] = useState([]);
  const [performanceMode, setPerformanceMode] = useState('auto');
  const [deviceCapability, setDeviceCapability] = useState('high');

  // 🚀 PERFORMANCE MONITORING SYSTEM
  const detectDeviceCapability = useCallback(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndMobile = isMobile && (
      navigator.hardwareConcurrency <= 4 || 
      navigator.deviceMemory <= 4 ||
      window.screen.width <= 768
    );
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) return 'minimal';
    if (isLowEndMobile) return 'low';
    if (isMobile) return 'medium';
    return 'high';
  }, []);

  // 🎯 ADAPTIVE PERFORMANCE CONFIGURATION
  const getOptimalConfig = useMemo(() => {
    const configs = {
      minimal: { large: 0, medium: 1, small: 1, tiny: 0 }, // Reduced motion users
      low: { large: 1, medium: 1, small: 2, tiny: 1 },     // Low-end devices (5 total)
      medium: { large: 2, medium: 3, small: 4, tiny: 3 },  // Current medium (12 total)
      high: { large: 3, medium: 4, small: 6, tiny: 5 }     // High-end devices (18 total)
    };

    if (adaptivePerformance) {
      return configs[deviceCapability] || configs.medium;
    }

    // Manual intensity settings
    const intensityConfigs = {
      low: configs.low,
      medium: configs.medium,
      high: configs.high
    };

    return intensityConfigs[intensity] || intensityConfigs.medium;
  }, [intensity, adaptivePerformance, deviceCapability]);

  // 📊 PERFORMANCE METRICS LOGGING (Development only)
  const logPerformanceMetrics = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const totalOrbs = Object.values(getOptimalConfig).reduce((sum, count) => sum + count, 0);
      console.log('🌊 Liquid Glass Performance Metrics:', {
        deviceCapability,
        totalOrbs,
        adaptivePerformance,
        userIntensity: intensity,
        effectiveConfig: getOptimalConfig,
        browserSupport: {
          backdropFilter: CSS.supports('backdrop-filter', 'blur(1px)'),
          hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
          deviceMemory: navigator.deviceMemory || 'unknown'
        }
      });
    }
  }, [deviceCapability, getOptimalConfig, adaptivePerformance, intensity]);

  // Additional CSS animations for convex mirror effects
  const additionalStyles = `
  @keyframes convexSweep {
    0% { 
      transform: translateX(-200px) translateY(0) scale(0.8) rotate(0deg);
      opacity: 0;
      filter: blur(15px) contrast(1.2) brightness(1.2);
    }
    10% { 
      transform: translateX(10vw) translateY(-10vh) scale(1.2) rotate(45deg);
      opacity: 0.8;
      filter: blur(8px) contrast(1.6) brightness(1.5);
    }
    30% { 
      transform: translateX(40vw) translateY(5vh) scale(1.4) rotate(120deg);
      opacity: 1;
      filter: blur(4px) contrast(1.8) brightness(1.7);
    }
    50% { 
      transform: translateX(60vw) translateY(-5vh) scale(1.6) rotate(180deg);
      opacity: 0.9;
      filter: blur(2px) contrast(2.0) brightness(1.9);
    }
    70% { 
      transform: translateX(80vw) translateY(10vh) scale(1.2) rotate(270deg);
      opacity: 0.7;
      filter: blur(6px) contrast(1.4) brightness(1.4);
    }
    90% { 
      transform: translateX(100vw) translateY(5vh) scale(0.9) rotate(350deg);
      opacity: 0.3;
      filter: blur(12px) contrast(1.1) brightness(1.1);
    }
    100% { 
      transform: translateX(120vw) translateY(0) scale(0.6) rotate(360deg);
      opacity: 0;
      filter: blur(20px) contrast(1.0) brightness(1.0);
    }
  }
  
  @keyframes convexFlow {
    0% { 
      transform: translateX(150px) translateY(0) scale(0.7) rotate(0deg);
      opacity: 0;
      filter: blur(12px) contrast(1.3) brightness(1.3);
    }
    15% { 
      transform: translateX(70vw) translateY(-15vh) scale(1.1) rotate(-60deg);
      opacity: 0.7;
      filter: blur(6px) contrast(1.5) brightness(1.4);
    }
    35% { 
      transform: translateX(40vw) translateY(10vh) scale(1.3) rotate(-150deg);
      opacity: 1;
      filter: blur(3px) contrast(1.7) brightness(1.6);
    }
    55% { 
      transform: translateX(20vw) translateY(-8vh) scale(1.1) rotate(-240deg);
      opacity: 0.8;
      filter: blur(5px) contrast(1.4) brightness(1.3);
    }
    75% { 
      transform: translateX(5vw) translateY(12vh) scale(0.8) rotate(-320deg);
      opacity: 0.5;
      filter: blur(9px) contrast(1.2) brightness(1.1);
    }
    100% { 
      transform: translateX(-80px) translateY(0) scale(0.5) rotate(-360deg);
      opacity: 0;
      filter: blur(16px) contrast(1.0) brightness(1.0);
    }
  }
  `;

  // 🔧 DEVICE CAPABILITY DETECTION
  useEffect(() => {
    if (adaptivePerformance) {
      const capability = detectDeviceCapability();
      setDeviceCapability(capability);
      logPerformanceMetrics();
    }
  }, [adaptivePerformance, detectDeviceCapability, logPerformanceMetrics]);

  // Inject additional styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = additionalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [additionalStyles]);

  useEffect(() => {
    if (!enabled) return;

    // Use adaptive configuration instead of fixed orbCounts
    const config = getOptimalConfig;
    const newOrbs = [];

    // Create different sized orbs with unique delays
    Object.entries(config).forEach(([size, count]) => {
      for (let i = 0; i < count; i++) {
        newOrbs.push({
          id: `${size}-${i}`,
          size,
          delay: Math.random() * 10, // Random delay 0-10 seconds
          startPosition: {
            x: Math.random() * 100, // Random starting position
            y: Math.random() * 100
          }
        });
      }
    });

    setOrbs(newOrbs);
    
    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      logPerformanceMetrics();
    }
  }, [intensity, enabled, getOptimalConfig, logPerformanceMetrics]);

  if (!enabled) return null;

  // 🎯 PERFORMANCE-AWARE RENDERING
  const shouldRenderConvexMirrors = deviceCapability !== 'minimal' && deviceCapability !== 'low';

  return (
    <div className="liquid-glass-container">
      {/* Liquid Glass Distortion Overlay - Only on capable devices */}
      {deviceCapability !== 'minimal' && (
        <div className="liquid-glass-distortion" />
      )}
      
      {/* Flowing Liquid Glass Orbs */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`liquid-glass-orb liquid-glass-${orb.size}`}
          style={{
            animationDelay: `${orb.delay}s`,
            left: `${orb.startPosition.x}%`,
            top: `${orb.startPosition.y}%`,
          }}
        />
      ))}
      
      {/* Additional Convex Mirror Effects - Only for high-performance devices */}
      {shouldRenderConvexMirrors && <ConvexMirrorEffects />}
    </div>
  );
};

// Special convex mirror effects that create light refraction
const ConvexMirrorEffects = () => {
  return (
    <>
      {/* Large sweeping convex mirror */}
      <div 
        className="liquid-glass-orb liquid-glass-large"
        style={{
          position: 'absolute',
          left: '-200px',
          top: '30%',
          background: `
            radial-gradient(circle at 25% 25%, 
              rgba(255, 255, 255, 0.95) 0%, 
              rgba(255, 255, 255, 0.7) 10%, 
              rgba(255, 255, 255, 0.4) 30%, 
              rgba(255, 255, 255, 0.2) 50%, 
              transparent 70%
            )
          `,
          backdropFilter: 'blur(12px) contrast(1.5) brightness(1.4) saturate(1.6)',
          animation: 'convexSweep 40s linear infinite',
          boxShadow: `
            inset 30px -30px 60px rgba(255, 255, 255, 0.4),
            inset -30px 30px 60px rgba(255, 255, 255, 0.2),
            0 30px 60px rgba(255, 255, 255, 0.15),
            0 60px 120px rgba(0, 0, 0, 0.1)
          `
        }}
      />
      
      {/* Medium flowing convex mirror */}
      <div 
        className="liquid-glass-orb liquid-glass-medium"
        style={{
          position: 'absolute',
          right: '-150px',
          top: '60%',
          background: `
            radial-gradient(circle at 35% 20%, 
              rgba(255, 255, 255, 0.9) 0%, 
              rgba(255, 255, 255, 0.6) 15%, 
              rgba(255, 255, 255, 0.3) 40%, 
              transparent 65%
            )
          `,
          backdropFilter: 'blur(10px) contrast(1.4) brightness(1.3) saturate(1.5)',
          animation: 'convexFlow 35s ease-in-out infinite reverse',
          boxShadow: `
            inset 20px -20px 40px rgba(255, 255, 255, 0.35),
            inset -20px 20px 40px rgba(255, 255, 255, 0.15),
            0 20px 40px rgba(255, 255, 255, 0.12)
          `
        }}
      />
    </>
  );
};

LiquidGlassEffect.propTypes = {
  intensity: PropTypes.oneOf(['low', 'medium', 'high']),
  enabled: PropTypes.bool,
  adaptivePerformance: PropTypes.bool
};

export default LiquidGlassEffect; 