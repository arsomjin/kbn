import React, { useState, useContext, useEffect } from 'react';
import { expenseColumns, expandedRowRender, getExpenseRecordValues } from '../api';
import EditableCellTable from 'components/EditableCellTable';
import { tableScroll } from 'data/Constant';
import { TableSummary } from 'api/Table';
import { isMobile } from 'react-device-detect';
import { useHistory } from 'react-router';
import { showLog, showWarn } from 'functions';
import { FirebaseContext } from '../../../../../firebase';
import { useSelector } from 'react-redux';

export default ({ items, updating, changeDeposit }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const history = useHistory();
  const [data, setData] = useState(items);

  useEffect(() => {
    setData(items);
  }, [items]);

  const handleEdit = async record => {
    try {
      showLog({ record });
      if (record?.deleted) {
        return showLog(`${record.expenseItemId} has been deleted.`);
      }
      // Get order by record id.
      let order = await getExpenseRecordValues(record.expenseId);
      order.orderId = record.expenseId;
      //  showLog({ record, order });
      let editPath = '/account/expense-input';
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
    } catch (e) {
      showWarn(e);
    }
  };

  const onDeleteItem = async dKey => {
    try {
      let nData = [...data];
      const index = nData.findIndex(item => dKey === item.key);
      //  showLog({ dKey, dItem: nData[index] });
      if (nData[index]?.deleted) {
        return showLog(`${dKey} has been deleted.`);
      }
      api.updateItem({ deleted: true }, 'expenseItems', nData[index].expenseItemId);
      nData[index].deleted = true;
      setData(nData);
      //Add log.
      await api.addLog(
        {
          time: Date.now(),
          type: 'deleted',
          by: user.uid,
          docId: nData[index]?.expenseItemId,
          changes: [{ deleted: true }]
        },
        'accounts',
        'expenseItems',
        nData[index]?.expenseItemId
      );
    } catch (e) {
      showWarn(e);
    }
  };

  return (
    <div>
      <EditableCellTable
        dataSource={data.filter(l => !l.isChevrolet)}
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
      {data.filter(l => l.isChevrolet).length > 0 && (
        <div className="mt-2">
          <label className="text-primary">รายจ่าย เชฟโรเลต</label>
          <EditableCellTable
            dataSource={data.filter(l => l.isChevrolet)}
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
