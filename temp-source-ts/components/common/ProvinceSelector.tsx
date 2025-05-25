import React, { useMemo } from 'react';
import { Select, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { useProvinceContext } from 'hooks/useProvinceContext';

interface ProvinceSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (provinceId: string) => void;
  label?: string;
  required?: boolean;
  size?: 'large' | 'middle' | 'small';
  placeholder?: string;
  disabled?: boolean;
  allowedProvinces?: string[];
  showInactive?: boolean;
  showRegion?: boolean;
  error?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ProvinceSelector: React.FC<ProvinceSelectorProps> = ({
  value,
  onChange,
  onSelect,
  label = 'Province',
  required = false,
  size = 'middle',
  placeholder,
  disabled = false,
  allowedProvinces,
  showInactive = false,
  showRegion = false,
  error,
  className,
  style
}) => {
  const { t } = useTranslation(['provinces', 'common']);
  const { provinces, loading } = useProvinceContext();

  const filteredProvinces = useMemo(() => {
    let filtered = provinces;

    // Filter by allowed provinces if specified
    if (allowedProvinces?.length) {
      filtered = filtered.filter(p => allowedProvinces.includes(p.id));
    }

    // Group by region if enabled
    if (showRegion) {
      return filtered.sort((a, b) => {
        const regionA = (a as any).region || '';
        const regionB = (b as any).region || '';
        if (regionA === regionB) {
          return a.name.localeCompare(b.name);
        }
        return regionA.localeCompare(regionB);
      });
    }
    return filtered;
  }, [provinces, allowedProvinces, showRegion]);

  const handleChange = (selectedValue: string) => {
    onChange?.(selectedValue);
    onSelect?.(selectedValue);
  };

  const renderItem = (province: (typeof provinces)[0]) => {
    const content =
      showRegion && province.region ? (
        <div className='flex justify-between'>
          <span>{t(`${province.id}`, { defaultValue: province.name })}</span>
          <span className='text-gray-400'>{t(`regions.${province.region}`)}</span>
        </div>
      ) : (
        t(`${province.id}`, { defaultValue: province.name })
      );

    if (province.status === 'inactive') {
      return (
        <Tooltip title={t('provinces:status.inactive')}>
          <div className='text-gray-400'>{content}</div>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      placeholder={placeholder || t('provinces:selectProvince')}
      loading={loading}
      disabled={disabled}
      size={size}
      className={className}
      style={style}
      showSearch
      optionFilterProp='children'
      filterOption={(input, option) => {
        const val = option?.value?.toString().toLowerCase() || '';
        const label = option?.children?.toString().toLowerCase() || '';
        const searchStr = input.toLowerCase();
        return val.includes(searchStr) || label.includes(searchStr);
      }}
      status={error ? 'error' : undefined}
    >
      {filteredProvinces.map(province => (
        <Select.Option key={province.id} value={province.id} disabled={province.status === 'inactive' && !showInactive}>
          {renderItem(province)}
        </Select.Option>
      ))}
    </Select>
  );
};

export default ProvinceSelector;
