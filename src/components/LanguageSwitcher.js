import React from 'react';
import { Select, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useNamespacedTranslation } from 'translations/i18n-enterprise';

const { Option } = Select;

const LanguageSwitcher = ({ 
  size = 'default', 
  showIcon = true, 
  style = {},
  placement = 'bottomRight'
}) => {
  const { i18n, nt } = useNamespacedTranslation('common');

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('kbn-language', language);
  };

  const languages = [
    {
      code: 'th',
      name: nt('language.thai', 'common'),
      flag: '🇹🇭'
    },
    {
      code: 'en', 
      name: nt('language.english', 'common'),
      flag: '🇺🇸'
    }
  ];

  return (
    <Select
      value={i18n.language}
      onChange={handleLanguageChange}
      size={size}
      style={{ 
        minWidth: 120,
        ...style 
      }}
      placement={placement}
      suffixIcon={showIcon ? <GlobalOutlined /> : null}
      optionLabelProp="label"
    >
      {languages.map(lang => (
        <Option 
          key={lang.code} 
          value={lang.code}
          label={
            <Space>
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </Space>
          }
        >
          <Space>
            <span style={{ fontSize: '16px' }}>{lang.flag}</span>
            <span>{lang.name}</span>
          </Space>
        </Option>
      ))}
    </Select>
  );
};

export default LanguageSwitcher; 