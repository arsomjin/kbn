import { Spin, Modal } from 'antd';
import React, { useState, forwardRef, useEffect, memo } from 'react';
import { styles } from 'styles';

const Load = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(props.loading || false);

  useEffect(() => {
    setLoading(props.loading || false);
  }, [props.loading]);

  if (!loading) {
    return null;
  }

  return (
    <Modal open={props.loading} centered footer={null} closable={false}>
      <div style={styles.centered}>
        <Spin />
        {props?.text && (
          <div className="text-muted" style={{ marginLeft: -30 }}>
            {props.text || 'กรุณารอสักครู่...'}
          </div>
        )}
        {/* <img
          alt="loading"
          src={require('images/loadingDot.gif')}
          style={styles.iconImage}
        /> */}
      </div>
    </Modal>
  );
});

export default memo(Load);
