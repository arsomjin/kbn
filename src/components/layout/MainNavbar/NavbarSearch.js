import React, { useEffect, useState, useCallback } from 'react';
import { Input, Dropdown, Menu, Spin, Typography, Empty } from 'antd';
import { SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { showWarn } from 'functions';
import { debounce } from 'lodash';
import { getNavBarSearchData } from 'utils';
import { useHistory } from 'react-router-dom';

const { Text } = Typography;

const NavbarSearch = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const arr = getNavBarSearchData();
    setAllData(arr);
  }, []);

  const _search = useCallback(
    async (txt) => {
      try {
        if (!txt) {
          setData([]);
          setDropdownVisible(false);
          return;
        }

        setLoading(true);
        const arr = allData.filter((item) =>
          ['title'].some((key) => {
            const sTxt = item[key]
              .toString()
              .replace(/(\r\n|\n|\r|,| |-)/g, '');
            return sTxt.toLowerCase().includes(txt.toLowerCase());
          })
        );

        setData(arr);
        setDropdownVisible(arr.length > 0);
        setLoading(false);
      } catch (e) {
        showWarn(e);
        setLoading(false);
        setDropdownVisible(false);
      }
    },
    [allData]
  );

  const _onSearch = useCallback(
    debounce((value) => {
      setSearchText(value);
      _search(value);
    }, 200),
    [_search]
  );

  const _onClick = useCallback(
    (path) => {
      setSearchText('');
      setData([]);
      setDropdownVisible(false);
      history.push(path);
    },
    [history]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    _onSearch(value);
  };

  const handleInputFocus = () => {
    if (searchText && data.length > 0) {
      setDropdownVisible(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for menu item clicks
    setTimeout(() => {
      setDropdownVisible(false);
    }, 200);
  };

  // Create menu items for dropdown
  const menuItems = data.map((item, index) => ({
    key: index,
    label: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 0',
          cursor: 'pointer',
        }}
        onClick={() => _onClick(item.to)}
      >
        <ClockCircleOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
        <Text style={{ fontSize: '13px' }}>{item.title}</Text>
      </div>
    ),
    onClick: () => _onClick(item.to),
  }));

  if (loading && data.length === 0) {
    menuItems.push({
      key: 'loading',
      label: (
        <div style={{ textAlign: 'center', padding: '8px' }}>
          <Spin size='small' />
        </div>
      ),
      disabled: true,
    });
  }

  if (searchText && data.length === 0 && !loading) {
    menuItems.push({
      key: 'empty',
      label: (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`ไม่พบผลลัพธ์สำหรับ "${searchText}"`}
          style={{ margin: '12px 0' }}
        />
      ),
      disabled: true,
    });
  }

  const searchMenu = (
    <Menu
      items={menuItems}
      style={{
        maxHeight: '300px',
        overflowY: 'auto',
        minWidth: '280px',
      }}
    />
  );

  return (
    <div
      className='main-navbar__search w-100 d-none d-md-flex d-lg-flex'
      style={{ marginLeft: '12px' }}
    >
      <Dropdown
        overlay={searchMenu}
        open={
          dropdownVisible &&
          (data.length > 0 || loading || (searchText && !loading))
        }
        trigger={[]}
        placement='bottomLeft'
        overlayStyle={{
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Input
          placeholder='ค้นหาเมนู...'
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          value={searchText}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          size='middle'
          allowClear={false}
          style={{
            width: '280px',
            borderRadius: '6px',
            border: '1px solid #d9d9d9',
          }}
        />
      </Dropdown>
    </div>
  );
};

export default NavbarSearch;
