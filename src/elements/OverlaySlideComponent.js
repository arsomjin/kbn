import React, { forwardRef } from 'react';
import { Slide } from 'react-awesome-reveal';
import { Button, Row } from 'shards-react';

const OverlaySlideComponent = forwardRef((props, ref) => {
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
        ...style
      }}
      {...mProps}
    >
      <div>
        {typeof backButtonOnTop !== 'undefined' && backButtonOnTop && (
          <Row style={{ justifyContent: 'flex-start' }} form>
            <Button onClick={onBack} className="btn-white mr-3">
              กลับ
            </Button>
          </Row>
        )}
        {children}
        {typeof backButtonOnTop !== 'undefined' && !backButtonOnTop && (
          <Row style={{ justifyContent: 'flex-start' }} form>
            <Button onClick={onBack} className="btn-white mr-3">
              กลับ
            </Button>
          </Row>
        )}
      </div>
    </Slide>
  );
});

export default OverlaySlideComponent;
