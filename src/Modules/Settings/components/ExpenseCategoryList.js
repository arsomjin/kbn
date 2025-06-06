import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, CardHeader } from 'shards-react';
import { Input } from 'antd';
import { debounce } from 'lodash';
import { useSelector } from 'react-redux';

import SettingExpenseCategory from './SettingExpenseCategory';
import EditableCellTable from 'components/EditableCellTable';
import { h } from 'api';
import { checkDoc, getCollection } from 'firebase/api';
import { showWarn, formatValuesBeforeLoad, load, searchArr } from 'functions';
import { AddButton } from 'elements';
import { isMobile } from 'react-device-detect';
import { sortArr } from 'functions';
import { showLog } from 'functions';

const { Search } = Input;

const ExpenseCategoryList = () => {
  // State variables
  const { user } = useSelector(state => state.auth);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch expense categories from the collection
  const fetchCategories = async () => {
    try {
      const doc = await getCollection('data/account/expenseCategory', [['deleted', '==', false]]);
      const dataArray = Object.values(doc).map(item => item);
      let sortedArr = sortArr(dataArray, 'expenseCategoryNumber').map((item, index) => ({
        ...item,
        id: index,
        key: index
      }));
      showLog({ sortedArr });
      setCategories(sortedArr);
      setAllCategories(sortedArr);
    } catch (error) {
      showWarn(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Select a category for viewing/editing
  const handleSelectCategory = async item => {
    try {
      load(true);
      const doc = await checkDoc('data', `account/expenseCategory/${item.expenseCategoryId}`);
      if (doc) {
        const formattedData = formatValuesBeforeLoad(doc.data());
        setSelectedCategory(formattedData);
        setIsDetailVisible(true);
      }
      load(false);
    } catch (error) {
      showWarn(error);
      load(false);
    }
  };

  // Prepare to add a new category
  const handleAddCategory = useCallback(() => {
    setSelectedCategory({
      expenseCategoryId: null,
      expenseCategoryName: null
    });
    setIsDetailVisible(true);
  }, []);

  // Search functionality (debounced)
  const performSearch = useCallback(
    async searchText => {
      try {
        if (!searchText) {
          setLoading(false);
          return setCategories(allCategories);
        }
        setLoading(true);
        const filtered = searchArr(allCategories, searchText, ['expenseCategoryName', 'expenseCategoryId']);
        setCategories(
          filtered.map((item, index) => ({
            ...item,
            id: index,
            key: index,
            deleted: false
          }))
        );
        setLoading(false);
      } catch (error) {
        showWarn(error);
        setLoading(false);
      }
    },
    [allCategories]
  );

  const handleSearch = useMemo(
    () =>
      debounce(e => {
        performSearch(e.target.value);
      }, 200),
    [performSearch]
  );

  // Cleanup the debounced function on unmount
  useEffect(() => {
    return () => {
      handleSearch.cancel();
    };
  }, [handleSearch]);

  // Placeholder for delete functionality if needed
  const handleDeleteCategory = async () => {
    // Delete functionality goes here
  };

  // Memoized table columns definition
  const columns = useMemo(
    () => [
      {
        title: '#',
        dataIndex: 'id',
        align: 'center'
      },
      {
        title: 'รหัสหมวดรายจ่าย',
        dataIndex: 'expenseCategoryNumber',
        ellipsis: true,
        width: 100,
        render: text => <div>{text}</div>
      },
      {
        title: 'ชื่อหมวดรายจ่าย',
        dataIndex: 'expenseCategoryName',
        ellipsis: true,
        width: 240
      }
    ],
    []
  );

  return (
    <Container fluid className="my-3">
      <CardHeader>
        <Row form style={{ alignItems: 'center' }}>
          {user.isDev && (
            <Col md="1" className={isMobile ? 'mb-3' : ''}>
              <AddButton onClick={handleAddCategory} />
            </Col>
          )}
          <Col md="7">
            <Search placeholder="พิมพ์เพื่อค้นหา รหัส / หมวดรายจ่าย" onChange={handleSearch} enterButton allowClear />
          </Col>
        </Row>
      </CardHeader>
      <div className="px-0">
        <EditableCellTable
          dataSource={categories}
          columns={columns}
          hasEdit={user.isDev}
          handleEdit={record => !record?.deleted && handleSelectCategory(record)}
          loading={loading}
          pagination={{ showSizeChanger: true, pageSize: 100 }}
          scroll={{ y: h(70) }}
        />
      </div>
      <SettingExpenseCategory
        initDoc={selectedCategory}
        visible={isDetailVisible}
        onCancel={needUpdate => {
          setIsDetailVisible(false);
          if (needUpdate) fetchCategories();
        }}
        onDelete={handleDeleteCategory}
      />
    </Container>
  );
};

export default ExpenseCategoryList;
