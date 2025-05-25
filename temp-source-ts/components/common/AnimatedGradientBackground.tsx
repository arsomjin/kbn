import React from 'react';
import { useTheme } from 'hooks/useTheme';
import '../../styles/AnimatedGradient.css';

interface AnimatedGradientBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

/**
 * A component that renders an animated gradient background
 *
 * @param {AnimatedGradientBackgroundProps} props - The component props
 * @returns {JSX.Element} The animated gradient background component
 */
const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({
  intensity = 'medium',
  className = ''
}) => {
  const { theme } = useTheme();

  // Determine opacity based on intensity
  const getIntensityClass = () => {
    switch (intensity) {
      case 'low':
        return 'opacity-25';
      case 'high':
        return 'opacity-75';
      case 'medium':
      default:
        return 'opacity-50';
    }
  };

  return (
    <div className={`animated-gradient-background ${theme} ${getIntensityClass()} ${className}`} aria-hidden='true' />
  );
};

export default AnimatedGradientBackground;
