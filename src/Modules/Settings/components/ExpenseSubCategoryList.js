import React, { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, CardHeader } from 'shards-react';

import SettingExpenseSubCategory from './SettingExpenseSubCategory';
import { debounce } from 'lodash';
import { Input } from 'antd';

import { showWarn } from 'functions';
import EditableCellTable from 'components/EditableCellTable';
import { h } from 'api';
import { checkDoc } from 'firebase/api';
import { formatValuesBeforeLoad } from 'functions';
import { load } from 'functions';
import { AddButton } from 'elements';
import { isMobile } from 'react-device-detect';
import { getCollection } from 'firebase/api';
import { searchArr } from 'functions';
const { Search } = Input;

const ExpenseSubCategoryList = () => {
  const [showExpenseSubCategoryDetail, setShowExpenseSubCategoryDetail] = useState(false);
  const [selectedExpenseSubCategory, setSelectedExpenseSubCategory] = useState({});
  const [dArray, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);

  const _getData = async () => {
    try {
      let doc = await getCollection('data/account/expenseSubCategory');
      let arr = Object.keys(doc)
        .map(k => doc[k])
        .map((l, i) => ({
          ...l,
          id: i,
          key: i
        }));
      setData(arr);
      setAllData(arr);
    } catch (e) {
      showWarn(e);
    }
  };

  useEffect(() => {
    _getData();
  }, []);

  const _onSelect = async item => {
    try {
      load(true);
      const doc = await checkDoc('data', `account/expenseSubCategory/${item.expenseSubCategoryId}`);
      if (doc) {
        let loadData = formatValuesBeforeLoad(doc.data());
        setSelectedExpenseSubCategory(loadData);
        setShowExpenseSubCategoryDetail(true);
      }
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _add = useCallback(() => {
    setSelectedExpenseSubCategory({
      expenseCategoryId: null,
      expenseSubCategoryId: null,
      expenseSubCategoryName: null
    });
    setShowExpenseSubCategoryDetail(true);
  }, []);

  const _onSearch = debounce(ev => {
    const txt = ev.target.value;
    _search(txt);
  }, 200);

  const _search = async txt => {
    try {
      if (!txt) {
        setLoading(false);
        return setData(allData);
      }
      // let arr = searchArr(dataRef.current, txt, ['expenseSubCategoryId', 'name']);
      setLoading(true);
      const dataArr = searchArr(allData, txt, ['expenseSubCategoryName', 'expenseSubCategoryId']);

      setLoading(false);
      setData(
        dataArr.map((l, i) => ({
          ...l,
          id: i,
          key: i
        }))
      );
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  return (
    <Container fluid className="my-3">
      {/* Default Light Table */}
      <CardHeader>
        <Row form style={{ alignItems: 'center' }}>
          <Col md="1" className={isMobile ? 'mb-3' : ''}>
            <AddButton onClick={_add} />
          </Col>
          <Col md="7">
            <Search
              placeholder="พิมพ์เพื่อค้นหา รหัส / หมวดย่อยรายจ่าย"
              // onSearch={debounceSearch}
              onChange={e => _onSearch(e)}
              enterButton
              allowClear
            />
          </Col>
        </Row>
      </CardHeader>
      <div className="px-0">
        <EditableCellTable
          dataSource={dArray}
          columns={[
            {
              title: '#',
              dataIndex: 'id',
              align: 'center'
            },
            {
              title: 'รหัสหมวดย่อย รายจ่าย',
              ellipsis: true,
              dataIndex: 'expenseSubCategoryId',
              width: 120
            },
            {
              title: 'ชื่อหมวดย่อย รายจ่าย',
              dataIndex: 'expenseSubCategoryName',
              ellipsis: true,
              width: 240
            },
            {
              title: 'รหัสหมวดรายจ่าย',
              ellipsis: true,
              dataIndex: 'expenseCategoryId',
              render: txt => <div>{txt}</div>,
              width: 120
            }
          ]}
          // onRow={(record, rowIndex) => {
          //   return {
          //     onClick: () => !record?.deleted && _onSelect(record),
          //   };
          // }}
          hasEdit
          handleEdit={record => !record?.deleted && _onSelect(record)}
          loading={loading}
          pagination={{ showSizeChanger: true, pageSize: 100 }}
          scroll={{ y: h(70) }}
        />
      </div>
      <SettingExpenseSubCategory
        initDoc={selectedExpenseSubCategory}
        visible={showExpenseSubCategoryDetail}
        onCancel={needUpdate => {
          setShowExpenseSubCategoryDetail(false);
          needUpdate && _getData();
        }}
      />
    </Container>
  );
};

export default ExpenseSubCategoryList;
