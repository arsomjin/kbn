import React, { useCallback, useEffect, useState } from 'react';
import { Table, Card, Statistic } from 'antd';
import 'antd/dist/antd.css';
import numeral from 'numeral';
import { waitFor } from 'functions';
import { showLog } from 'functions';
import { useSelector } from 'react-redux';
import ExpandableTable from './ExpandableTable';
import { ArrowUpOutlined } from '@ant-design/icons';
import { sortArr } from 'functions';
import { arrayForEach } from 'functions';
import { Numb } from 'functions';

const DataTable = ({
  expenses,
  expenseNames,
  selectedDate,
  branchCode,
  isInput,
}) => {
  const { expenseCategories } = useSelector((state) => state.data);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateData = useCallback(async (arr) => {
    //  showLog('categories_3', arr);
    setLoading(true);
    setData(arr);
    await waitFor(400); // To fix table update issue.
    setLoading(false);
  }, []);

  const updateExpenseCategories = useCallback(
    async (expenseArr, catArr) => {
      //  showLog({ expenseArr, catArr });
      // let categories = JSON.parse(JSON.stringify(catArr));
      let categories = Object.keys(expenseCategories).map((k) => {
        return { ...expenseCategories[k], _key: k, key: k };
      });
      //  showLog('categories_1', categories);
      await arrayForEach(categories, (cat, n) => {
        categories[n].total = expenseArr
          .filter((l) => l.expenseCategoryId === cat._key)
          .reduce((sum, elem) => sum + Numb(elem?.total), 0);
      });
      //  showLog('categories_2', categories);
      categories = sortArr(categories, 'expenseCategoryId');
      updateData(categories);
    },
    [expenseCategories, updateData]
  );

  useEffect(() => {
    updateExpenseCategories(expenses, expenseCategories);
  }, [expenseCategories, expenses, updateExpenseCategories]);

  const _onChangeTotal = useCallback(
    (val) => {
      //  showLog('val', val);
      let newData = [...data];
      let nId = data.findIndex(
        (l) => l.expenseCategoryId === val.expenseCategoryId
      );
      if (nId > -1) {
        newData[nId].total = val.total;
        setData(newData);
      }
    },
    [data]
  );

  showLog('data', data);
  const dataSource = isInput ? data : data.filter((l) => Numb(l.total) > 0);

  const columns = [
    {
      title: 'รายการ',
      dataIndex: 'expenseCategoryName',
      key: 'expenseCategoryName',
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'total',
      key: 'total',
      render: (text) => (
        <h6 className={Number(text) > 0 ? 'text-primary' : 'text-light'}>
          {numeral(text).format('0,0.00')}
        </h6>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      expandable={{
        expandedRowRender: (record) => {
          //  showLog('record', record);
          return (
            <ExpandableTable
              originData={expenses.filter(
                (l) => l.expenseCategoryId === record._key
              )}
              record={record}
              // expenseNames={expenseNames.filter(
              //   (l) => l.expenseCategoryId === record.expenseCategoryId
              // )}
              onChangeTotal={_onChangeTotal}
              selectedDate={selectedDate}
              branchCode={branchCode}
              isInput={isInput}
            />
          );
        },
        rowExpandable: (record) => record.name !== 'Not Expandable',
      }}
      dataSource={dataSource}
      loading={loading}
      footer={() => {
        const total = data.reduce((sum, elem) => sum + Numb(elem?.total), 0);
        return total > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Card>
              <Statistic title="รวม" value={total} suffix="บาท" />
            </Card>
            {!isInput && (
              <Card>
                <Statistic
                  title="เปลี่ยนแปลง"
                  value={11.28}
                  precision={2}
                  // valueStyle={{ color: '#3f8600' }}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ArrowUpOutlined />}
                  suffix="%"
                />
              </Card>
            )}
          </div>
        ) : null;
      }}
    />
  );
};

export default DataTable;
