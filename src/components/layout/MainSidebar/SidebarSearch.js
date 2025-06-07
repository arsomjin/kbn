import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Spin } from 'antd';
import { useHistory } from 'react-router-dom';
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  Form,
  FormInput,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'shards-react';
import { getNavBarSearchData } from 'utils';
import { debounce } from 'lodash';
import { showWarn } from 'functions';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from 'redux/actions/unPersisted';

const SidebarSearch = () => {
  const history = useHistory();
  const { menuVisible } = useSelector(state => state.unPersisted);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(null);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);

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
    // showLog({ nav_search_arr: arr });
    safeSetAllData(arr);

    return () => {
      isMountedRef.current = false;
    };
  }, [safeSetAllData]);

  const _search = useCallback(async (txt, iType) => {
    try {
      if (!txt) {
        return safeSetData([]);
      }
      safeSetLoading(true);
      // let arr = searchArr(allData, Numb(txt), ['title']);
      const arr = allData.filter(item =>
        ['title'].some(key => {
          let sTxt = item[key].toString().replace(/(\r\n|\n|\r|,| |-)/g, '');
          // showLog({ sTxt });
          return sTxt.toLowerCase().includes(txt.toLowerCase());
        })
      );
      safeSetData(arr);
      safeSetLoading(false);
    } catch (e) {
      showWarn(e);
      safeSetLoading(false);
    }
  }, [allData, safeSetData, safeSetLoading]);

  const _onSearch = useCallback(debounce(ev => {
    const txt = ev.target.value;
    safeSetSearchText(txt);
    _search(txt);
  }, 200), [_search, safeSetSearchText]);

  const _onClick = useCallback((path) => {
    safeSetSearchText(null);
    safeSetData([]);
    safeDispatch(toggleSidebar(!menuVisible));
    history.push(path);
  }, [safeSetSearchText, safeSetData, safeDispatch, menuVisible, history]);

  return (
    <>
      <Form
        className="main-sidebar__search w-100 border-right d-sm-flex d-md-none d-lg-none"
        style={{ display: 'flex', minHeight: '45px' }}
      >
        <InputGroup seamless className="ml-3">
          <InputGroupAddon type="prepend">
            <InputGroupText>
              <i className="material-icons">search</i>
            </InputGroupText>
            <FormInput className="navbar-search" placeholder="ค้นหา..." aria-label="Search" onChange={_onSearch} />
          </InputGroupAddon>
        </InputGroup>
      </Form>
      <div>
        <Collapse tag={DropdownMenu} small open={!!searchText && data.length > 0}>
          {data.map((it, i) => (
            <DropdownItem key={i} onClick={() => _onClick(it.to)}>
              <i className="material-icons mr-1">schedule</i> {it.title}
            </DropdownItem>
          ))}
          {loading && (
            <DropdownItem key="load">
              <Spin size="small" />
            </DropdownItem>
          )}
        </Collapse>
      </div>
    </>
  );
};

SidebarSearch.displayName = 'SidebarSearch';
export default SidebarSearch;
