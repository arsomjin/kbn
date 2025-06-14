import React from 'react';
import PropTypes from 'prop-types';

/**
 * GlassWrapper - A utility component to easily apply glassmorphism to any content
 * 
 * Usage Examples:
 * <GlassWrapper>Your content here</GlassWrapper>
 * <GlassWrapper variant="success">Success content</GlassWrapper>
 * <GlassWrapper blur="strong" rounded="large">Custom glass</GlassWrapper>
 * <GlassWrapper as="button" onClick={handleClick}>Glass Button</GlassWrapper>
 */
const GlassWrapper = ({
  children,
  variant = 'default',
  blur = 'medium',
  rounded = 'default',
  compact = false,
  shimmer = false,
  floating = false,
  as: Component = 'div',
  className = '',
  style = {},
  ...props
}) => {
  // Build glass classes
  const glassClasses = [
    'glass-card',
    variant !== 'default' && `glass-${variant}`,
    blur !== 'medium' && `glass-blur-${blur}`,
    rounded !== 'default' && `glass-rounded-${rounded}`,
    compact && 'glass-compact',
    shimmer && 'glass-shimmer',
    floating && 'glass-floating-element',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component
      className={glassClasses}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

GlassWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info']),
  blur: PropTypes.oneOf(['subtle', 'medium', 'strong', 'extreme']),
  rounded: PropTypes.oneOf(['default', 'small', 'large', 'full']),
  compact: PropTypes.bool,
  shimmer: PropTypes.bool,
  floating: PropTypes.bool,
  as: PropTypes.elementType,
  className: PropTypes.string,
  style: PropTypes.object
};

export default GlassWrapper;

// Export convenience components
export const GlassCard = (props) => <GlassWrapper {...props} />;
export const GlassButton = (props) => <GlassWrapper as="button" className="glass-button" {...props} />;
export const GlassInput = (props) => <GlassWrapper as="input" className="glass-input" {...props} />;

// Export utility functions
export const glassify = (className = '', variant = 'default', options = {}) => {
  const { blur = 'medium', rounded = 'default', compact = false, shimmer = false } = options;
  
  return [
    className,
    'glass-card',
    variant !== 'default' && `glass-${variant}`,
    blur !== 'medium' && `glass-blur-${blur}`,
    rounded !== 'default' && `glass-rounded-${rounded}`,
    compact && 'glass-compact',
    shimmer && 'glass-shimmer'
  ].filter(Boolean).join(' ');
};

export const glassStyles = {
  card: 'glass-card',
  button: 'glass-button',
  input: 'glass-input',
  table: 'glass-table',
  success: 'glass-success',
  warning: 'glass-warning',
  error: 'glass-error',
  info: 'glass-info',
  shimmer: 'glass-shimmer',
  compact: 'glass-compact',
  blurSubtle: 'glass-blur-subtle',
  blurMedium: 'glass-blur-medium',
  blurStrong: 'glass-blur-strong',
  blurExtreme: 'glass-blur-extreme'
}; 