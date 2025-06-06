import React, { useContext, useEffect, useState } from 'react';
import { columns, expandedRowRender, getExpenseRecordValues, getIncomeRecordValues } from '../api';
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
import { formatBankAccNo } from 'utils';
import { showAlert } from 'functions';

const getBankTransferArr = (arr, banks) => {
  let btArr = (arr || []).filter(l => !l.deleted).map((bk, n) => ({ bank: bk.selfBank, amount: bk.amount }));
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
  return bankTransferArr;
};

const getBankDepositArr = (arr, banks) => {
  let btArr = (arr || []).filter(l => !l.deleted).map((bk, n) => ({ bank: bk.selfBankId, amount: bk.total }));
  btArr = distinctArr(btArr, ['bank'], ['amount']);
  let bankDepositArr = btArr.map(it => ({
    item: `เงินฝากเข้า ${
      banks[it.bank]?.bankName ? `ธ.${banks[it.bank].bankName}` : ''
    } ${formatBankAccNo(banks[it.bank]?.accNo) || ''}`,
    value: it.amount,
    qty: 1
  }));
  bankDepositArr = distinctArr(bankDepositArr, ['item'], ['value', 'qty']).map(l => ({
    item: `${l.item} ${!!l.qty ? `(${l.qty} รายการ)` : ''}`,
    value: l.value
  }));
  return bankDepositArr;
};

export default ({
  changeDeposit,
  items,
  updating,
  expenses,
  bankTransfer,
  bankDeposit,
  duringDayMoney,
  afterDailyClosed,
  afterAccountClosed,
  searchValues
}) => {
  const { api } = useContext(FirebaseContext);
  const history = useHistory();
  const { banks, users, employees } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);

  const [data, setData] = useState(items);
  const [expenseData, setExpenseData] = useState(expenses);
  const [cState, setCState] = useState({
    incomeData: [],
    sumData: []
  });

  useEffect(() => {
    let bankTransferArr = getBankTransferArr(bankTransfer, banks);
    let bankDepositArr = getBankDepositArr(bankDeposit, banks);

    let afterDailyClosedArr = (afterDailyClosed || [])
      .filter(l => !l.deleted)
      .map((bk, n) => {
        return {
          item: `หัก (รับเงินหลังปิดบัญชี) ${bk.item}`,
          value: bk.total
        };
      });

    let afterAccountClosedArr = (afterAccountClosed || [])
      .filter(l => !l.deleted)
      .map((bk, n) => {
        return {
          item: `บวก (รับเงินหลังปิดบัญชี) ${bk.item}`,
          value: bk.total,
          deleted: bk.deleted
        };
      });

    const dailyChange = data
      .filter(l => !l.deleted && l.item.includes('เงินทอน'))
      .reduce((sum, elem) => sum + Numb(elem.total), 0);
    const totalIncome = data.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem.total), 0);
    const totalExpense = expenseData
      .filter(l => !l.deleted && !l.isChevrolet)
      .reduce((sum, elem) => sum + Numb(elem.total), 0);
    const totalChevrolet = expenseData
      .filter(l => !l.deleted && l.isChevrolet)
      .reduce((sum, elem) => sum + Numb(elem.total), 0);
    const dailyNetIncome = totalIncome - totalExpense - totalChevrolet;
    const netTotal =
      Numb(dailyNetIncome) +
      afterAccountClosedArr.reduce((sum, elem) => sum + Numb(elem.value), 0) -
      afterDailyClosedArr.reduce((sum, elem) => sum + Numb(elem.value), 0) -
      bankTransferArr.reduce((sum, elem) => sum + Numb(elem.value), 0) -
      bankDepositArr.reduce((sum, elem) => sum + Numb(elem.value), 0) -
      duringDayMoney.reduce((sum, elem) => sum + Numb(elem.value), 0);
    const dailyRemainingCash = netTotal - afterAccountClosedArr.reduce((sum, elem) => sum + Numb(elem.value), 0);
    const incomeData = [
      {
        item: 'เงินทอนประจำวัน',
        value: dailyChange
      },
      {
        item: 'รายรับประจำวัน',
        value: totalIncome - dailyChange
      },
      {
        item: 'รวมรายรับสุทธิก่อนหักค่าใช้จ่าย',
        value: totalIncome,
        text: 'primary'
      },
      {
        item: 'ค่าใช้จ่าย',
        value: totalExpense
      },
      {
        item: 'เชฟโรเลต เบิกเงิน',
        value: totalChevrolet
      },
      {
        item: 'คงเหลือ รายรับสุทธิในวัน',
        value: totalIncome - totalExpense - totalChevrolet
      }
    ];

    const sumData = [
      {
        item: 'รายรับสุทธิในวัน',
        value: totalIncome - totalExpense - totalChevrolet,
        text: 'primary'
      },
      ...bankTransferArr,
      ...bankDepositArr,
      ...duringDayMoney,
      ...afterDailyClosedArr,
      {
        item: 'คงเหลือเงินสดสิ้นวัน',
        value: dailyRemainingCash,
        text: 'primary'
      },
      ...afterAccountClosedArr,
      {
        item: 'คงเหลือส่งเงินสดสิ้นวัน',
        value: netTotal,
        text: 'primary'
      }
    ];
    showLog({ incomeData, sumData });
    setCState({ incomeData, sumData });
  }, [afterAccountClosed, afterDailyClosed, bankDeposit, bankTransfer, banks, data, duringDayMoney, expenseData]);

  useEffect(() => {
    setData(items);
    setExpenseData(expenses);
  }, [items, expenses]);

  const handleEdit = async record => {
    try {
      // Get order by record id.
      const isFromIncome = !record?.expenseId;

      if (record?.deleted) {
        return showLog(`${isFromIncome ? record.incomeId : record.expenseId} has been deleted.`);
      }
      if (!isFromIncome) {
        return handleExpenseEdit(record);
      }
      let order = await getIncomeRecordValues(record.incomeId);
      order.orderId = record.incomeId;
      // showLog({ record, order });
      let editPath =
        order?.incomeCategory === 'afterAccountClosed'
          ? '/account/income-after-close-account'
          : '/account/income-daily';
      history.push(editPath, {
        params: {
          order,
          onBack: {
            path: '/reports/income-expense-summary',
            branchCode: order.branchCode,
            date: order?.incomeCategory === 'afterAccountClosed' ? order.incomeDate : order.date
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
      if (nData[index]?.item && nData[index].item === 'รับเงินทอน') {
        return showAlert(
          'ไม่สามารถลบรายการ รับเงินทอน ได้',
          'สามารถแก้ไขรายการได้ที่เมนู การรับเงินทอนประจำวัน',
          'warning'
        );
      }
      const isFromIncome = !nData[index]?.expenseId;
      api.updateItem(
        { deleted: true },
        isFromIncome ? 'sections/account/incomes' : 'sections/account/expenses',
        isFromIncome ? nData[index].incomeId : nData[index].expenseId
      );
      nData[index].deleted = true;
      setData(nData);
      //Add log.
      await api.addLog(
        {
          time: Date.now(),
          type: 'deleted',
          by: user.uid,
          docId: isFromIncome ? nData[index]?.incomeId : nData[index]?.expenseId,
          changes: [{ deleted: true }]
        },
        'accounts',
        isFromIncome ? 'sections/account/incomes' : 'sections/account/expenses',
        isFromIncome ? nData[index]?.incomeId : nData[index]?.expenseId
      );
    } catch (e) {
      showWarn(e);
    }
  };

  const handleExpenseEdit = async record => {
    try {
      // Get order by record id.
      let order = await getExpenseRecordValues(record.expenseId);
      order.orderId = record.expenseId;
      // showLog({ record, order });
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
          expandedRowRender: record => expandedRowRender(record, users, employees),
          rowExpandable: record => !!record.details || !!record.remark || !!record.changeDeposit
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
              // title={`ยอดรายรับเงิน ${getBranchName(
              //   searchValues.branchCode
              // )} วันที่ ${moment(searchValues.date, 'YYYY-MM-DD')
              //   .add(543, 'year')
              //   .locale('th')
              //   .format('D MMMM YYYY')}`}
              data={cState.incomeData}
              // alignLeft
            />
          </Col>
          <Col>
            <PageSummary
              title="สรุปรายการส่งเงินสดในวัน"
              // title={`สรุปรายการส่งเงินสด ${getBranchName(
              //   searchValues.branchCode
              // )} วันที่ ${moment(searchValues.date, 'YYYY-MM-DD')
              //   .add(543, 'year')
              //   .locale('th')
              //   .format('D MMMM YYYY')}`}
              data={cState.sumData}
            />
          </Col>
        </Row>
      )}
    </div>
  );
};
