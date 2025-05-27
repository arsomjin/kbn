import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PopoverExample({ style, title, detail, icon }) {
  const { t } = useTranslation();

  const defaultIcon = <QuestionCircleOutlined style={{ fontSize: 18 }} className="text-light" />;
  const displayIcon = icon || defaultIcon;

  const content = (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{title || t('common.titleHere')}</div>
      <div>{detail || t('common.defaultPopoverText')}</div>
    </div>
  );

  return (
    <div style={style}>
      <Popover content={content} placement="bottom" trigger="click">
        <Button
          type="text"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: 0,
            height: 'auto',
          }}
        >
          {displayIcon}
        </Button>
      </Popover>
    </div>
  );
}
