import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import { isMobile } from 'react-device-detect';

import { expenseColumns, expandedRowRender, getExpenseRecordValues } from '../api';
import EditableCellTable from 'components/EditableCellTable';
import { tableScroll } from 'data/Constant';
import { TableSummary } from 'api/Table';
import { showLog, showWarn } from 'functions';
import { FirebaseContext } from '../../../../../firebase';

const ExpenseTable = ({ items, updating, changeDeposit }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const history = useHistory();

  const [data, setData] = useState(items);

  // Update local data when items prop changes
  useEffect(() => {
    setData(items);
  }, [items]);

  // Handles editing of a record
  const handleEdit = async record => {
    try {
      showLog({ record });
      if (record?.deleted) {
        return showLog(`${record.expenseItemId} has been deleted.`);
      }
      const order = await getExpenseRecordValues(record.expenseId);
      showLog({ order });
      order.orderId = record.expenseId;
      const editPath = '/account/expense-input';
      history.push(editPath, {
        params: {
          order,
          expenseType: order.expenseType,
          onBack: {
            path: '/reports/income-expense-summary',
            branchCode: order.branchCode,
            date: order.date
          }
        }
      });
    } catch (error) {
      showWarn(error);
    }
  };

  // Handles deletion of a record
  const onDeleteItem = async dKey => {
    try {
      const newData = [...data];
      const index = newData.findIndex(item => dKey === item.key);
      if (newData[index]?.deleted) {
        return showLog(`${dKey} has been deleted.`);
      }
      await api.updateItem({ deleted: true }, 'expenseItems', newData[index].expenseItemId);
      newData[index].deleted = true;
      setData(newData);
      await api.addLog(
        {
          time: Date.now(),
          type: 'deleted',
          by: user.uid,
          docId: newData[index]?.expenseItemId,
          changes: [{ deleted: true }]
        },
        'accounts',
        'expenseItems',
        newData[index]?.expenseItemId
      );
    } catch (error) {
      showWarn(error);
    }
  };

  const nonChevroletData = data.filter(l => !l.isChevrolet);
  const chevroletData = data.filter(l => l.isChevrolet);

  return (
    <div>
      <EditableCellTable
        dataSource={nonChevroletData}
        columns={expenseColumns}
        loading={updating}
        {...(!isMobile && { scroll: { ...tableScroll, x: 840 } })}
        pagination={false}
        size="small"
        expandable={{
          expandedRowRender,
          rowExpandable: record => record.details || record.remark
        }}
        summary={pageData => <TableSummary pageData={pageData} dataLength={expenseColumns.length} startAt={5} />}
        hasEdit
        handleEdit={handleEdit}
        onDelete={onDeleteItem}
      />
      {chevroletData.length > 0 && (
        <div className="mt-2">
          <label className="text-primary">รายจ่าย เชฟโรเลต</label>
          <EditableCellTable
            dataSource={chevroletData}
            columns={expenseColumns}
            loading={updating}
            {...(!isMobile && { scroll: { ...tableScroll, x: 840 } })}
            pagination={false}
            size="small"
            expandable={{
              expandedRowRender,
              rowExpandable: record => record.details || record.remark
            }}
            summary={pageData => <TableSummary pageData={pageData} dataLength={expenseColumns.length} startAt={5} />}
            hasEdit
            handleEdit={handleEdit}
            onDelete={onDeleteItem}
          />
        </div>
      )}
    </div>
  );
};

export default ExpenseTable;
