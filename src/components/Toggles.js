import React from 'react';
import { Radio } from 'antd';

export default ({ buttons, buttonWidth, dynamicWidth, ...props }) => (
  <Radio.Group buttonStyle="solid" {...props}>
    {Array.from(new Array(buttons.length), (_, i) => (
      <Radio.Button
        key={i}
        style={{
          ...(!dynamicWidth && { width: buttonWidth || 80 }),
          textAlign: 'center',
          ...buttons[i].style
        }}
        value={buttons[i].value}
      >
        {buttons[i].label}
      </Radio.Button>
    ))}
  </Radio.Group>
);
