import React, { forwardRef } from 'react';
import { Slide } from 'react-awesome-reveal';
import { Button, Row } from 'antd';

const OverlaySlideComponent = forwardRef((props) => {
  const { children, open, onBack, direction, duration, backButtonOnTop, style, ...mProps } = props;

  if (!open) {
    return null;
  }

  return (
    <Slide
      duration={duration || 500}
      direction={direction || 'right'}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        // backgroundColor: theme.colors.surface,
        ...style,
      }}
      {...mProps}
    >
      <div>
        {typeof backButtonOnTop !== 'undefined' && backButtonOnTop && (
          <Row justify="start" style={{ marginBottom: 16 }}>
            <Button onClick={onBack} className="mr-3">
              กลับ
            </Button>
          </Row>
        )}
        {children}
        {typeof backButtonOnTop !== 'undefined' && !backButtonOnTop && (
          <Row justify="start" style={{ marginTop: 16 }}>
            <Button onClick={onBack} className="mr-3">
              กลับ
            </Button>
          </Row>
        )}
      </div>
    </Slide>
  );
});

export default OverlaySlideComponent;
