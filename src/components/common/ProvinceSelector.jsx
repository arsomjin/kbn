import React, { useMemo } from 'react';
import { Select, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const ProvinceSelector = ({
  value,
  onChange,
  onSelect,
  size = 'middle',
  placeholder,
  disabled = false,
  allowedProvinces,
  showInactive = false,
  showRegion = false,
  error,
  className,
  style,
}) => {
  const { t } = useTranslation(['provinces', 'common']);
  const provincesObj = useSelector((state) => state.data.provinces || {});
  const loading = false; // Set to true if you have province loading state

  // Convert object to array and filter
  const provinces = useMemo(() => {
    let arr = Object.entries(provincesObj)
      .map(([id, province]) => ({ id, ...province }))
      .filter((p) => p.name && (!p.deleted || showInactive));

    console.log('[ProvinceSelector] provinces', arr);

    if (allowedProvinces?.length) {
      arr = arr.filter((p) => allowedProvinces.includes(p.id));
    }

    if (!showInactive) {
      arr = arr.filter((p) => p.status !== 'inactive');
    }

    if (showRegion) {
      arr = arr.sort((a, b) => {
        const regionA = a.region || '';
        const regionB = b.region || '';
        if (regionA === regionB) {
          return a.name.localeCompare(b.name);
        }
        return regionA.localeCompare(regionB);
      });
    } else {
      arr = arr.sort((a, b) => a.name.localeCompare(b.name));
    }

    return arr;
  }, [provincesObj, allowedProvinces, showInactive, showRegion]);

  const handleChange = (selectedValue) => {
    onChange?.(selectedValue);
    onSelect?.(selectedValue);
  };

  const renderItem = (province) => {
    const content =
      showRegion && province.region ? (
        <div className="flex justify-between">
          <span>{t(`${province.id}`, { defaultValue: province.name })}</span>
          <span className="text-gray-400">{t(`regions.${province.region}`)}</span>
        </div>
      ) : (
        t(`${province.id}`, { defaultValue: province.name })
      );

    if (province.status === 'inactive') {
      return (
        <Tooltip title={t('provinces:status.inactive')}>
          <div className="text-gray-400">{content}</div>
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
      optionFilterProp="children"
      filterOption={(input, option) => {
        const val = option?.value?.toString().toLowerCase() || '';
        const label = option?.children?.toString().toLowerCase() || '';
        const searchStr = input.toLowerCase();
        return val.includes(searchStr) || label.includes(searchStr);
      }}
      status={error ? 'error' : undefined}
    >
      {provinces.map((province) => (
        <Select.Option
          key={province.id}
          value={province.id}
          disabled={province.status === 'inactive' && !showInactive}
        >
          {renderItem(province)}
        </Select.Option>
      ))}
    </Select>
  );
};

export default ProvinceSelector;
