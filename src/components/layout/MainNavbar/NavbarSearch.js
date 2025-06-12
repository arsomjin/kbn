import React, { useEffect, useState } from 'react';
import { showWarn } from 'functions';
import { debounce } from 'lodash';
import {
  Form,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  FormInput,
  Collapse,
  DropdownItem,
  DropdownMenu,
  NavItem
} from 'shards-react';
import { getNavBarSearchData } from 'utils';
import { useHistory } from 'react-router-dom';
import { Spin } from 'antd';

export default () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(null);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);

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
      return setData([])  // TODO: Enhance new search across all modules.
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
      // showLog({ allData, arr, rTxt: Numb(txt) });
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
    history.push(path);
  };

  return (
    <>
      <Form className="main-navbar__search w-100 d-none d-md-flex d-lg-flex">
        <InputGroup seamless className="ml-3">
          <InputGroupAddon type="prepend">
            <InputGroupText>
              <i className="material-icons">search</i>
            </InputGroupText>
          </InputGroupAddon>
          <FormInput className="navbar-search" placeholder="ค้นหา..." onChange={_onSearch} />
        </InputGroup>
      </Form>
      <NavItem>
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
      </NavItem>
    </>
  );
};
