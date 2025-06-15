import React, { useState } from 'react';
import { Space, Card, Row, Col, Typography, Divider } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import SearchInput from './SearchInput';

const { Title, Paragraph, Text } = Typography;

const SearchInputExamples = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchValue2, setSearchValue2] = useState('');
  const [searchValue3, setSearchValue3] = useState('');

  const handleSearch = (value) => {
    console.log('Search value:', value);
  };

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleChange2 = (e) => {
    setSearchValue2(e.target.value);
  };

  const handleChange3 = (e) => {
    setSearchValue3(e.target.value);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>SearchInput Component Examples</Title>
      <Paragraph>
        A customizable search input component with no grey border on focus and
        multiple variants.
      </Paragraph>

      <Divider />

      {/* Basic Usage */}
      <Card title='Basic Usage' style={{ marginBottom: '24px' }}>
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <div>
            <Text strong>Default Search Input</Text>
            <SearchInput
              placeholder='ค้นหาชื่อหรืออีเมล'
              value={searchValue}
              onChange={handleChange}
              onSearch={handleSearch}
              allowClear
            />
          </div>

          <div>
            <Text strong>Small Size</Text>
            <SearchInput size='small' placeholder='ค้นหาขนาดเล็ก' allowClear />
          </div>

          <div>
            <Text strong>Large Size</Text>
            <SearchInput size='large' placeholder='ค้นหาขนาดใหญ่' allowClear />
          </div>

          <div>
            <Text strong>With Enter Button</Text>
            <SearchInput
              placeholder='กดปุ่มเพื่อค้นหา'
              enterButton='ค้นหา'
              onSearch={handleSearch}
            />
          </div>

          <div>
            <Text strong>With Icon Enter Button</Text>
            <SearchInput
              placeholder='กดไอคอนเพื่อค้นหา'
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </div>
        </Space>
      </Card>

      {/* Variants */}
      <Card title='Variants' style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Space direction='vertical' style={{ width: '100%' }}>
              <Text strong>Outlined (Default)</Text>
              <SearchInput
                variant='outlined'
                placeholder='Outlined variant'
                value={searchValue}
                onChange={handleChange}
                allowClear
              />
            </Space>
          </Col>
          <Col span={8}>
            <Space direction='vertical' style={{ width: '100%' }}>
              <Text strong>Borderless</Text>
              <SearchInput
                variant='borderless'
                placeholder='Borderless variant'
                value={searchValue2}
                onChange={handleChange2}
                allowClear
              />
            </Space>
          </Col>
          <Col span={8}>
            <Space direction='vertical' style={{ width: '100%' }}>
              <Text strong>Filled</Text>
              <SearchInput
                variant='filled'
                placeholder='Filled variant'
                value={searchValue3}
                onChange={handleChange3}
                allowClear
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* With Icons */}
      <Card title='With Icons' style={{ marginBottom: '24px' }}>
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <div>
            <Text strong>With Prefix Icon</Text>
            <SearchInput
              prefix={<UserOutlined />}
              placeholder='ค้นหาผู้ใช้'
              allowClear
            />
          </div>

          <div>
            <Text strong>With Suffix Icon</Text>
            <SearchInput
              suffix={<SearchOutlined />}
              placeholder='ค้นหาข้อมูล'
              allowClear
            />
          </div>
        </Space>
      </Card>

      {/* States */}
      <Card title='States' style={{ marginBottom: '24px' }}>
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <div>
            <Text strong>Loading State</Text>
            <SearchInput loading placeholder='กำลังโหลด...' allowClear />
          </div>

          <div>
            <Text strong>Disabled State</Text>
            <SearchInput
              disabled
              placeholder='ไม่สามารถใช้งานได้'
              value='ข้อความที่ไม่สามารถแก้ไขได้'
            />
          </div>

          <div>
            <Text strong>With Max Length</Text>
            <SearchInput
              maxLength={20}
              placeholder='สูงสุด 20 ตัวอักษร'
              showCount
              allowClear
            />
          </div>
        </Space>
      </Card>

      {/* Responsive Example */}
      <Card title='Responsive Usage' style={{ marginBottom: '24px' }}>
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <SearchInput
              size='small'
              placeholder='Mobile friendly'
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <SearchInput placeholder='Tablet friendly' allowClear />
          </Col>
          <Col xs={24} sm={24} md={8} lg={12}>
            <SearchInput
              size='large'
              placeholder='Desktop friendly'
              enterButton='ค้นหา'
              onSearch={handleSearch}
            />
          </Col>
        </Row>
      </Card>

      {/* Usage Code */}
      <Card title='Usage Code' style={{ marginBottom: '24px' }}>
        <pre
          style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '6px',
          }}
        >
          {`// Basic usage
import { SearchInput } from 'elements';

// In your component
<SearchInput
  placeholder="ค้นหาชื่อหรืออีเมล"
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
  onSearch={handleSearch}
  size="default"
  allowClear
  variant="outlined"
/>

// With different variants
<SearchInput variant="borderless" placeholder="No border" />
<SearchInput variant="filled" placeholder="Filled background" />
<SearchInput variant="outlined" placeholder="Default outlined" />

// With enter button
<SearchInput
  enterButton="Search"
  onSearch={handleSearch}
  placeholder="Press button to search"
/>

// Responsive usage
<SearchInput
  size={isMobile ? 'small' : 'default'}
  placeholder="Responsive search"
  allowClear
/>`}
        </pre>
      </Card>
    </div>
  );
};

export default SearchInputExamples;
