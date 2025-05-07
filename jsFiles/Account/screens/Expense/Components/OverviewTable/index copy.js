import React, { useCallback, useEffect, useState } from 'react';
import { Table, Card, Statistic } from 'antd';
import 'antd/dist/antd.css';
import numeral from 'numeral';
import { waitFor } from 'functions';
import { useSelector } from 'react-redux';
import ExpandableTable from './ExpandableTable';
import { ArrowUpOutlined } from '@ant-design/icons';

const DataTable = ({
  expenseCategories,
  originData,
  expenseNames,
  selectedDate,
  branchCode,
  isInput,
}) => {
  const { branches } = useSelector((state) => state.data);
  const [data, setData] = useState(expenseCategories);
  const [loading, setLoading] = useState(false);

  const updateData = useCallback(async (arr) => {
    setLoading(true);
    setData(arr);
    await waitFor(400);
    setLoading(false);
  }, []);

  useEffect(() => {
    updateData(expenseCategories);
  }, [expenseCategories, updateData]);

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

  // showLog('data', data);
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
          return (
            <ExpandableTable
              originData={originData.filter(
                (l) => l.expenseCategoryId === record.expenseCategoryId
              )}
              record={record}
              expenseNames={expenseNames.filter(
                (l) => l.expenseCategoryId === record.expenseCategoryId
              )}
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
