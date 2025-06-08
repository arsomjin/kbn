import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Dropdown, Menu, Spin, Typography } from 'antd';
import { SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { getNavBarSearchData } from 'utils';
import { debounce } from 'lodash';
import { showWarn } from 'functions';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from 'redux/actions/unPersisted';

const { Text } = Typography;

const SidebarSearch = () => {
  const history = useHistory();
  const { menuVisible } = useSelector(state => state.unPersisted);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const dispatch = useDispatch();
  const isMountedRef = useRef(true);

  // Safe dispatch wrapper
  const safeDispatch = useCallback((action) => {
    if (isMountedRef.current) {
      dispatch(action);
    }
  }, [dispatch]);

  // Safe setState wrappers
  const safeSetLoading = useCallback((value) => {
    if (isMountedRef.current) {
      setLoading(value);
    }
  }, []);

  const safeSetData = useCallback((value) => {
    if (isMountedRef.current) {
      setData(value);
    }
  }, []);

  const safeSetAllData = useCallback((value) => {
    if (isMountedRef.current) {
      setAllData(value);
    }
  }, []);

  const safeSetSearchText = useCallback((value) => {
    if (isMountedRef.current) {
      setSearchText(value);
    }
  }, []);

  useEffect(() => {
    let arr = getNavBarSearchData();
    safeSetAllData(arr);

    return () => {
      isMountedRef.current = false;
    };
  }, [safeSetAllData]);

  const _search = useCallback(async (txt) => {
    try {
      if (!txt) {
        safeSetData([]);
        setDropdownVisible(false);
        return;
      }

      safeSetLoading(true);
      const arr = allData.filter(item =>
        ['title'].some(key => {
          let sTxt = item[key].toString().replace(/(\r\n|\n|\r|,| |-)/g, '');
          return sTxt.toLowerCase().includes(txt.toLowerCase());
        })
      );
      safeSetData(arr);
      setDropdownVisible(arr.length > 0);
      safeSetLoading(false);
    } catch (e) {
      showWarn(e);
      safeSetLoading(false);
      setDropdownVisible(false);
    }
  }, [allData, safeSetData, safeSetLoading]);

  const _onSearch = useCallback(debounce((value) => {
    safeSetSearchText(value);
    _search(value);
  }, 200), [_search, safeSetSearchText]);

  const _onClick = useCallback((path) => {
    safeSetSearchText('');
    safeSetData([]);
    setDropdownVisible(false);
    safeDispatch(toggleSidebar(false));
    history.push(path);
  }, [safeSetSearchText, safeSetData, safeDispatch, history]);

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
          cursor: 'pointer'
        }}
        onClick={() => _onClick(item.to)}
      >
        <ClockCircleOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
        <Text style={{ fontSize: '13px' }}>{item.title}</Text>
      </div>
    ),
    onClick: () => _onClick(item.to)
  }));

  if (loading && data.length === 0) {
    menuItems.push({
      key: 'loading',
      label: (
        <div style={{ textAlign: 'center', padding: '8px' }}>
          <Spin size="small" />
        </div>
      ),
      disabled: true
    });
  }

  const searchMenu = (
    <Menu 
      items={menuItems}
      style={{ maxHeight: '300px', overflowY: 'auto' }}
    />
  );

  return (
    <div 
      className="main-sidebar__search"
      style={{
        padding: '8px 12px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa',
        display: 'block'
      }}
    >
      <Dropdown
        overlay={searchMenu}
        open={dropdownVisible && (data.length > 0 || loading)}
        trigger={[]}
        placement="bottomLeft"
        overlayStyle={{ minWidth: '250px' }}
      >
        <Input
          placeholder="ค้นหาเมนู..."
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          value={searchText}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          size="small"
          allowClear
          style={{
            borderRadius: '6px',
            border: '1px solid #d9d9d9'
          }}
        />
      </Dropdown>

      <style>{`
        @media (min-width: 769px) {
          .main-sidebar__search {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

SidebarSearch.displayName = 'SidebarSearch';
export default SidebarSearch;
