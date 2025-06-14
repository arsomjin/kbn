import React from 'react';
import DigitalUserManual from './DigitalUserManual';

/**
 * Wrapper component that adds digital user manual to any screen
 * Usage: <ScreenWithManual screenType="signup">Your Screen Content</ScreenWithManual>
 */
const ScreenWithManual = ({ 
  children, 
  screenType = 'general',
  showManualOnFirstVisit = true 
}) => {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Original screen content */}
      {children}
      
      {/* Digital User Manual */}
      <DigitalUserManual 
        screenType={screenType}
        autoShow={showManualOnFirstVisit}
      />
    </div>
  );
};

export default ScreenWithManual; 