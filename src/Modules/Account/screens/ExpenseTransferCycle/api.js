import { checkCollection } from 'firebase/api';
import { showWarn } from 'functions';
import moment from 'moment';

export const InitValues = {
  date: moment().format('YYYY-MM-DD'),
  category: 'all'
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่',
    dataIndex: 'date'
  },
  {
    title: 'ชื่อบัญชี',
    dataIndex: 'receiver'
  },
  {
    title: 'รายการจ่าย',
    dataIndex: 'expenseName'
  },
  {
    title: 'เลขที่บัญชี',
    dataIndex: 'accNo'
  },
  {
    title: 'ธนาคาร',
    dataIndex: 'bank'
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total'
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark'
  }
];

export const getHQTransferData = date =>
  new Promise(async (r, j) => {
    try {
      let arr = [];
      const snap = await checkCollection('sections/account/expenseItems', [
        ['expenseType', '==', 'headOfficeTransfer'],
        ['date', '==', date]
        //   ['transferCompleted', '==', false],
      ]);
      if (snap) {
        snap.forEach(doc => {
          arr.push({
            ...doc.data(),
            _key: doc.id,
            id: arr.length,
            key: arr.length,
            remark: doc.data().transferCompleted ? 'บันทึกแล้ว' : null,
            expenseType: 'headOfficeTransfer'
          });
        });
        arr = arr.filter(l => !l.deleted).map((it, id) => ({ ...it, id, key: id }));
      }
      r(arr);
    } catch (e) {
      showWarn(e);
      j(e);
    }
  });

export const getPurchaseTransferData = date =>
  new Promise(async (r, j) => {
    try {
      let arr = [];
      const snap = await checkCollection('sections/account/expenses', [
        ['expenseType', '==', 'purchaseTransfer'],
        ['dueDate', '==', date]
        //   ['transferCompleted', '==', false],
      ]);
      if (snap) {
        snap.forEach(doc => {
          arr.push({
            ...doc.data(),
            _key: doc.id,
            id: arr.length,
            key: arr.length,
            beforeTotal: doc.data().total,
            total: doc.data().billTotal,
            date: doc.data().dueDate,
            expenseName: `เลขที่ใบรับสินค้า ${doc.data().receiveNo}`,
            remark: doc.data().transferCompleted ? 'บันทึกแล้ว' : null,
            expenseType: 'purchaseTransfer'
          });
        });
        arr = arr.filter(l => !l.deleted).map((it, id) => ({ ...it, id, key: id }));
      }
      r(arr);
    } catch (e) {
      showWarn(e);
      j(e);
    }
  });

export const getReferringData = date =>
  new Promise(async (r, j) => {
    try {
      let arr = [];
      const snap = await checkCollection('sections/credits/credits', [
        ['amtReferrer', '>', 0],
        ['sendTransferDate', '==', date]
      ]);
      if (snap) {
        snap.forEach(doc => {
          let data = doc.data();
          arr.push({
            ...doc.data(),
            _key: doc.id,
            id: arr.length,
            key: arr.length,
            date: data.referringDetails.forHQ.sendTransferDate,
            total: data.referringDetails.forHQ.amtTransfer,
            expenseName: `ค่าแนะนำ ${data.referrer.prefix}${data.referrer.firstName} ${data.referrer.lastName}`,
            remark: doc.data().transferCompleted ? 'บันทึกแล้ว' : null,
            bank: data.referringDetails.bank,
            receiver: data.referringDetails.bankName,
            accNo: data.referringDetails.bankAcc,
            expenseType: 'referring'
          });
        });
        arr = arr.filter(l => !l.deleted).map((it, id) => ({ ...it, id, key: id }));
      }
      r(arr);
    } catch (e) {
      showWarn(e);
      j(e);
    }
  });

export const getTransferCycleData = ({ date, category }) =>
  new Promise(async (r, j) => {
    try {
      let arr = [];
      let dArr1 = [];
      let dArr2 = [];
      let dArr3 = [];
      switch (category) {
        case 'hqTransfer':
          dArr1 = await getHQTransferData(date);
          arr = dArr1.filter(l => !l.deleted).map((it, id) => ({ ...it, id, key: id }));
          break;
        case 'purchaseTransfer':
          dArr2 = await getPurchaseTransferData(date);
          break;
        case 'referralFee':
          dArr3 = await getReferringData(date);
          arr = dArr3.filter(l => !l.deleted).map((it, id) => ({ ...it, id, key: id }));
          break;
        case 'all':
          dArr1 = await getHQTransferData(date);
          dArr2 = await getPurchaseTransferData(date);
          dArr3 = await getReferringData(date);
          arr = dArr1
            .concat(dArr2)
            .concat(dArr3)
            .filter(l => !l.deleted)
            .map((it, id) => ({ ...it, id, key: id }));
          break;
        default:
          break;
      }
      r(arr);
    } catch (e) {
      showWarn(e);
      j(e);
    }
  });
