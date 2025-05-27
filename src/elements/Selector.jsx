import { Select, Typography } from 'antd';
import React, { Fragment, memo, useCallback } from 'react';

const Selector = memo((props) => {
  const { children, onChange, initialWords, error, ...mProps } = props;
  // showLog('select_remaining_props', mProps);

  const styles = {
    errorTxt: {
      color: '#f50057',
      margin: 5,
      fontSize: '14px',
    },
  };

  const _onChange = useCallback(
    (value) => {
      // For Ant Design Select, we need to create a synthetic event
      const syntheticEvent = {
        target: { value },
      };
      onChange && onChange(syntheticEvent);
    },
    [onChange],
  );

  // Convert children options to Ant Design format
  const options = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === 'option') {
      return {
        value: child.props.value,
        label: child.props.children,
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <Fragment>
      <Select
        onChange={_onChange}
        placeholder={initialWords}
        status={error ? 'error' : ''}
        options={options}
        {...mProps}
      />
      {!!error && (
        <Typography.Text type="danger" style={styles.errorTxt}>
          {error}
        </Typography.Text>
      )}
    </Fragment>
  );
});

export default Selector;
