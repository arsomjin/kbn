import React, { useState, useEffect } from 'react';
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

export default () => {
  const history = useHistory();
  const { menuVisible } = useSelector(state => state.unPersisted);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(null);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    let arr = getNavBarSearchData();
    // showLog({ nav_search_arr: arr });
    setAllData(arr);
  }, []);

  const _onSearch = debounce(ev => {
    const txt = ev.target.value;
    setSearchText(txt);
    _search(txt);
  }, 200);

  const _search = async (txt, iType) => {
    try {
      if (!txt) {
        return setData([]);
      }
      setLoading(true);
      // let arr = searchArr(allData, Numb(txt), ['title']);
      const arr = allData.filter(item =>
        ['title'].some(key => {
          let sTxt = item[key].toString().replace(/(\r\n|\n|\r|,| |-)/g, '');
          // showLog({ sTxt });
          return sTxt.toLowerCase().includes(txt.toLowerCase());
        })
      );
      setData(arr);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const _onClick = path => {
    setSearchText(null);
    setData([]);
    dispatch(toggleSidebar(!menuVisible));
    history.push(path);
  };

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
