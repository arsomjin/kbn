import React, { useContext, useEffect, useState } from 'react';
import { columns, expandedRowRender } from '../api';
import EditableCellTable from 'components/EditableCellTable';
import { tableScroll } from 'data/Constant';
import { TableSummary } from 'api/Table';
import { isMobile } from 'react-device-detect';
import { PageSummary } from 'api';
import { useSelector } from 'react-redux';
import { Numb } from 'functions';
import { showLog, showWarn } from 'functions';
import { useHistory } from 'react-router';
import { FirebaseContext } from '../../../../../firebase';
import { Row, Col } from 'shards-react';
import { distinctArr } from 'functions';
import { getIncomeRecordValues } from 'Modules/Reports/Account/IncomeExpenseSummary/api';
import { formatBankAccNo } from 'utils';

export default ({ items, updating, expenses, bankTransfer, dailyParts }) => {
  const { api } = useContext(FirebaseContext);
  const history = useHistory();
  const { banks } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);

  const [data, setData] = useState(items);
  const [expenseData, setExpenseData] = useState(expenses);
  const [cState, setCState] = useState({
    incomeData: [],
    sumData: []
  });

  useEffect(() => {
    let btArr = (bankTransfer || []).filter(l => !l.deleted).map((bk, n) => ({ bank: bk.selfBank, amount: bk.amount }));
    btArr = distinctArr(btArr, ['bank'], ['amount']);
    let bankTransferArr = btArr.map(it => ({
      item: `ลูกค้าโอน ${
        banks[it.bank]?.bankName ? `ธ.${banks[it.bank].bankName}` : ''
      } ${formatBankAccNo(banks[it.bank]?.accNo) || ''}`,
      value: it.amount,
      qty: 1
    }));
    bankTransferArr = distinctArr(bankTransferArr, ['item'], ['value', 'qty']).map(l => ({
      item: `${l.item} ${!!l.qty ? `(${l.qty} รายการ)` : ''}`,
      value: l.value
    }));
    const dailyChange = data
      .filter(l => !l.deleted && l.item.includes('เงินทอน'))
      .reduce((sum, elem) => sum + Numb(elem.total), 0);

    const dailyNetIncome = data.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem.total), 0);
    const totalBankTransfer = bankTransferArr.reduce((sum, elem) => sum + Numb(elem.value), 0);
    const incomeData = [
      {
        item: 'เงินทอนประจำวัน',
        value: dailyChange
      },
      {
        item: 'รายรับประจำวัน',
        value: dailyNetIncome - dailyChange
      },
      {
        item: 'คงเหลือ รายรับสุทธิในวัน',
        value: dailyNetIncome
      }
    ];

    const sumData = [
      {
        item: 'รายรับสุทธิในวัน',
        value: dailyNetIncome,
        text: 'primary'
      },
      ...bankTransferArr,
      {
        item: 'คงเหลือส่งเงินสดสิ้นวัน',
        value: dailyNetIncome - totalBankTransfer,
        text: 'primary'
      }
    ];

    setCState({ incomeData, sumData });
  }, [bankTransfer, banks, data]);

  useEffect(() => {
    setData(items);
    setExpenseData(expenses);
  }, [items, expenses]);

  const handleEdit = async record => {
    try {
      // Get order by record id.
      // showLog({ record });
      const isFromIncome = !record?.expenseId;

      if (record?.deleted) {
        return showLog(`${isFromIncome ? record.incomeId : record.expenseId} has been deleted.`);
      }
      let order = await getIncomeRecordValues(record.incomeId);
      order.orderId = record.incomeId;
      let editPath = '/account/income-daily';
      history.push(editPath, {
        params: {
          order,
          onBack: {
            path: '/reports/income-parts',
            branchCode: order.branchCode,
            date: order.date
          },
          category: order.incomeSubCategory
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
      // showLog({ dKey, dItem: nData[index] });
      if (nData[index]?.deleted) {
        return showLog(`${dKey} has been deleted.`);
      }
      api.updateItem({ deleted: true }, 'sections/account/incomes', nData[index].incomeId);
      nData[index].deleted = true;
      setData(nData);
      //Add log.
      await api.addLog(
        {
          time: Date.now(),
          type: 'deleted',
          by: user.uid,
          docId: nData[index]?.incomeId,
          changes: [{ deleted: true }]
        },
        'accounts',
        'sections/account/incomes',
        nData[index]?.incomeId
      );
    } catch (e) {
      showWarn(e);
    }
  };

  showLog({
    deleted: data.filter(l => l.deleted),
    unDeleted: data.filter(l => !l.deleted),
    totalSum: data.reduce((sum, elem) => sum + Numb(elem.total), 0),
    deletedSum: data.filter(l => l.deleted).reduce((sum, elem) => sum + Numb(elem.total), 0),
    unDeletedSum: data.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem.total), 0)
  });

  return (
    <div>
      <EditableCellTable
        dataSource={data}
        columns={columns}
        loading={updating}
        {...(!isMobile && { scroll: { ...tableScroll, x: 840 } })}
        pagination={false}
        size="small"
        expandable={{
          expandedRowRender,
          rowExpandable: record => record.details || record.remark
        }}
        summary={pageData => {
          // showLog({ pageData });
          return <TableSummary pageData={pageData} dataLength={columns.length} startAt={5} />;
        }}
        hasEdit
        handleEdit={handleEdit}
        onDelete={onDeleteItem}
      />
      {data.length > 0 && (
        <Row>
          <Col>
            <PageSummary
              title="ยอดรายรับเงินประจำวัน"
              data={cState.incomeData}
              // alignLeft
            />
          </Col>
          <Col>
            <PageSummary title="สรุปรายการโอนเงินเข้าบัญชี" data={cState.sumData} />
          </Col>
        </Row>
      )}
    </div>
  );
};
