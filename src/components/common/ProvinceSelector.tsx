import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

// Province keys with both English and Thai reference values
const provinces = [
  'Nakhon Ratchasima',
  'Nakhon Sawan',
  'Bangkok',
  'Amnat Charoen',
  'Ang Thong',
  'Bueng Kan',
  'Buriram',
  'Chachoengsao',
  'Chai Nat',
  'Chaiyaphum',
  'Chanthaburi',
  'Chiang Mai',
  'Chiang Rai',
  'Chonburi',
  'Chumphon',
  'Kalasin',
  'Kamphaeng Phet',
  'Kanchanaburi',
  'Khon Kaen',
  'Krabi',
  'Lampang',
  'Lamphun',
  'Loei',
  'Lopburi',
  'Mae Hong Son',
  'Maha Sarakham',
  'Mukdahan',
  'Nakhon Nayok',
  'Nakhon Pathom',
  'Nakhon Phanom',
  'Nakhon Si Thammarat',
  'Nan',
  'Narathiwat',
  'Nong Bua Lamphu',
  'Nong Khai',
  'Nonthaburi',
  'Pathum Thani',
  'Pattani',
  'Phang Nga',
  'Phatthalung',
  'Phayao',
  'Phetchabun',
  'Phetchaburi',
  'Phichit',
  'Phitsanulok',
  'Phra Nakhon Si Ayutthaya',
  'Phrae',
  'Phuket',
  'Prachinburi',
  'Prachuap Khiri Khan',
  'Ranong',
  'Ratchaburi',
  'Rayong',
  'Roi Et',
  'Sa Kaeo',
  'Sakon Nakhon',
  'Samut Prakan',
  'Samut Sakhon',
  'Samut Songkhram',
  'Saraburi',
  'Satun',
  'Sing Buri',
  'Sisaket',
  'Songkhla',
  'Sukhothai',
  'Suphan Buri',
  'Surat Thani',
  'Surin',
  'Tak',
  'Trang',
  'Trat',
  'Ubon Ratchathani',
  'Udon Thani',
  'Uthai Thani',
  'Uttaradit',
  'Yala',
  'Yasothon'
];

interface ProvinceSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  size?: 'large' | 'middle' | 'small';
  placeholder?: string;
  disabled?: boolean;
}

const ProvinceSelector: React.FC<ProvinceSelectorProps> = ({
  value,
  onChange,
  label = 'Province',
  required = false,
  size = 'large',
  placeholder = 'Select province',
  disabled = false
}) => {
  const { t } = useTranslation();
  
  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder={t('provinces.selectProvince', placeholder)}
      disabled={disabled}
      optionFilterProp="children"
      filterOption={(input, option) => {
        const optionText = typeof option?.children === 'string' ? option.children : '';
        return optionText.toLowerCase().includes(input.toLowerCase());
      }}
      style={{ width: '100%' }}
      size={size}
    >
      {provinces.map(province => (
        <Select.Option key={province} value={province}>
          {t(`provinces.${province.toLowerCase().replace(/\s+/g, '_')}`)}
        </Select.Option>
      ))}
    </Select>
  );
};

export default ProvinceSelector;
