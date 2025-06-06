import { daysInMonth } from 'functions';
import { arrayForEach } from 'functions';
import { distinctArr } from 'functions';
import moment from 'moment-timezone';
import numeral from 'numeral';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { ExpenseReportTitle } from '../Constant';
import { Numb } from 'functions';
import { PopUp } from 'elements';
import { getBranchName } from 'Modules/Utils';
import { insertArr } from 'functions';

export const titles = Object.keys(ExpenseReportTitle).map(k => ExpenseReportTitle[k]);

export const getColumns = (mth, data) => {
  if (!mth) {
    // showLog({ no_columns_month: mth });
    return [];
  }
  let mIdx = [...Array(daysInMonth(mth)).keys()].map(it => ({
    title: moment(`${mth}-${it + 1}`, 'YYYY-MM-D')
      .add(543, 'year')
      .locale('th')
      .format('D MMM YY'),
    dataIndex: `D${it + 1}`,
    width: 100,
    align: 'center',
    render: (text, record) => {
      if (record?.otherBranchPay && !!text) {
        return (
          <PopUp
            label={!!text ? numeral(text).format('0,0.00') : null}
            title={<div className="text-center text-primary">{record.expenseTitle}</div>}
            content={<div>{`${getBranchName(record.branchCode)} จ่ายให้ ${numeral(text).format('0,0.00')} บาท`}</div>}
          />
        );
      } else {
        return (
          <div
            {...(record.isSection && {
              className: 'text-primary'
            })}
          >
            {!!text ? numeral(text).format('0,0.00') : null}
          </div>
        );
      }
    }
  }));
  return [
    {
      title: 'รายการ',
      dataIndex: 'expenseTitle',
      width: isMobile ? 180 : 240,
      render: (text, _) => (
        <div
          {...(_.isSection && {
            className: 'text-primary'
          })}
        >
          {text}
        </div>
      ),
      fixed: 'left'
    },
    {
      title: 'ประเภท',
      dataIndex: 'expenseType',
      width: 100,
      align: 'center',
      render: (text, _) => {
        let label = null;
        if (!!text && !_.isSection && !!_.total) {
          if (_.otherBranchPay) {
            label = 'สาขาอื่นจ่าย';
          } else {
            label = text === 'dailyChange' ? 'เงินสด' : 'เงินโอน';
          }
        }
        return <div>{label}</div>;
      }
    },
    {
      title: 'วันที่',
      children: mIdx
    },
    {
      title: 'รวม',
      dataIndex: 'total',
      width: 140,
      align: 'right',
      render: text => <div className="text-primary">{numeral(text).format('0,0.00')}</div>
    }
  ];
};

export const expenseSummarySumKeys = mth => {
  if (!mth) {
    // showLog({ no_keys_month: mth });
    return [];
  }
  let iKeys = [...Array(daysInMonth(mth)).keys()].map(it => `D${it + 1}`);
  return [...iKeys, 'total'];
};

export const createInitData = (mth, expenseTitles, expenseHeaders) =>
  new Promise(async (r, j) => {
    try {
      if (!mth) {
        // showLog({ no_init_month: mth });
        return r([]);
      }
      let mKeys = {};
      [...Array(daysInMonth(mth)).keys()].map(it => {
        mKeys[`D${it + 1}`] = null;
        return it;
      });
      let arr = [];

      await arrayForEach(Object.keys(expenseHeaders), async section => {
        // showLog({ section });
        await arrayForEach(Object.keys(expenseHeaders[section]), async k => {
          arr.push({
            expenseTitle: expenseHeaders[section][k],
            iTitle: k,
            isSection: false,
            payToOtherBranch: false,
            otherBranchPay: false,
            expenseType: 'dailyChange',
            section: section,
            ...mKeys
          });
          // showLog({ k, expenseTitle: expenseHeaders[section][k] });
          return k;
        });
        arr.push({
          expenseTitle: expenseTitles[section],
          iTitle: section,
          isSection: true,
          payToOtherBranch: false,
          otherBranchPay: false,
          expenseType: 'dailyChange',
          ...mKeys
        });
        // showLog({ expenseTitle: expenseTitles[section] });
        return section;
      });
      r(arr);
    } catch (e) {
      j(e);
    }
  });

export const formatExpenseSummary = (allArr, mth, dbValues, branchCode) =>
  new Promise(async (r, j) => {
    if (!Array.isArray(allArr) || !allArr) {
      return r([]);
    }
    const { categories: expenseCategories, names: expenseAccountNames } = dbValues;
    let dataArr = [];
    // Create items data array.
    allArr
      // .filter((l) => l.expenseType === 'dailyChange')
      .map(it => {
        if (!!it.items) {
          let items = it.items.map(l => {
            let otherBranchPay = false;
            let payToOtherBranch = false;
            if (typeof l.payToBranch !== 'undefined') {
              otherBranchPay = branchCode !== it.branchCode && branchCode === l.payToBranch;
              payToOtherBranch = branchCode !== l.payToBranch && it.branchCode === branchCode;
            }
            let netTotal = Numb(l.total) + (l.priceType === 'separateVat' ? Numb(l.VAT) : 0) - Numb(l.whTax);
            return {
              ...l,
              date: it.date,
              branchCode: it.branchCode,
              expenseId: it.expenseId,
              otherBranchPay,
              payToOtherBranch,
              payToBranch: l.payToBranch || it.branchCode,
              netTotal
            };
          });
          dataArr = dataArr.concat(items);
        }
        return it;
      });

    let expenseArr = dataArr.filter(l => l.payToBranch === branchCode);

    let categories = {};
    // Create categories
    Object.keys(expenseCategories).map(k => {
      categories[k] = expenseCategories[k].expenseCategoryName;
      return k;
    });
    let categoryName = {};
    let arrCategoryName = Object.keys(expenseAccountNames).map(k => expenseAccountNames[k]);
    Object.keys(expenseCategories).map(k => {
      arrCategoryName
        .filter(l => l.expenseCategoryId === k)
        .map(cIt => {
          if (!!expenseAccountNames[cIt.expenseNameId]) {
            let nIt = {
              [cIt.expenseNameId]: expenseAccountNames[cIt.expenseNameId]?.expenseName
            };
            categoryName[k] = { ...(categoryName[k] || {}), ...nIt };
          }
          return cIt;
        });
      return k;
    });
    try {
      // Create initial data.
      let initData = await createInitData(mth, categories, categoryName);
      let sumKeys = expenseSummarySumKeys(mth);
      let arr = expenseArr
        .filter(l => !l.deleted)
        .map(it => {
          let expenseTitle = 'n/a';
          let amount = Numb(it.netTotal);
          let D = moment(it.date, 'YYYY-MM-DD').format('D');
          if (['dailyChange', 'headOfficeTransfer', 'executive'].includes(it.expenseType)) {
            if (!!categoryName[it.expenseCategoryId]) {
              expenseTitle =
                categoryName[it.expenseCategoryId][it.expenseAccountNameId] ||
                categories[it.expenseCategoryId] ||
                'n/a';
            }
          }
          return {
            ...it,
            expenseTitle,
            [`D${D}`]: amount,
            count: 1
          };
        });
      let dArr = distinctArr(
        arr,
        ['expenseItemId', 'payToOtherBranch', 'otherBranchPay', 'expenseType'],
        // ['expenseTitle', 'payToOtherBranch', 'otherBranchPay'],
        sumKeys
      );
      let fArr = dArr.map((it, id) => {
        let mKeys = {};
        [...Array(daysInMonth(mth)).keys()].map(n => {
          mKeys[`D${n + 1}`] = it[`D${n + 1}`];
          // mKeys[`D${n + 1}`] = it[`D${n + 1}`] || null;
          return n;
        });
        // showLog({ mKeys });
        return {
          expenseType: it.expenseType,
          expenseTitle: it.expenseTitle,
          expenseName: it.expenseName,
          expenseAccountNameId: it.expenseAccountNameId,
          payToOtherBranch: it.payToOtherBranch,
          otherBranchPay: it.otherBranchPay,
          branchCode: it.branchCode,
          count: it.count,
          ...mKeys
        };
      });
      // fArr = distinctArr(fArr, ['expenseTitle'], sumKeys);
      fArr.map(item => {
        let idx = initData.findIndex(
          l => l.expenseTitle === item.expenseTitle && l.iTitle === item.expenseAccountNameId
        );
        if (idx > -1) {
          if (
            initData[idx].otherBranchPay === item.otherBranchPay &&
            initData[idx].payToOtherBranch === item.payToOtherBranch &&
            initData[idx].expenseType === item.expenseType
          ) {
            Object.keys(initData[idx]).map(k => {
              if (k.startsWith('D') && k.length <= 3) {
                initData[idx][k] = Numb(initData[idx][k]) + Numb(item[k]);
              }
              return k;
            });
            initData[idx].expenseType = item.expenseType;
          } else {
            let nKeys = {};
            [...Array(daysInMonth(mth)).keys()].map(n => {
              nKeys[`D${n + 1}`] = item[`D${n + 1}`];
              return n;
            });
            let cData = [...initData];
            initData = insertArr(cData, idx, [
              {
                ...initData[idx],
                otherBranchPay: item.otherBranchPay,
                payToOtherBranch: item.payToOtherBranch,
                expenseType: item.expenseType,
                branchCode: item.branchCode,
                ...nKeys
              }
            ]);
          }
          // initData[idx] = { ...initData[idx], ...item };
        }
        return item;
      });
      let rData = [...initData];
      initData = initData.map((it, id) => {
        let total = 0;
        if (!!it.isSection) {
          let sKeys = {};
          let sectionArr = rData.filter(l => l.section === it.iTitle);
          [...Array(daysInMonth(mth)).keys()].map(n => {
            sKeys[`D${n + 1}`] = sectionArr.reduce((sum, elem) => sum + Numb(elem[`D${n + 1}`]), 0);
            return n;
          });
          it = {
            ...it,
            ...sKeys
          };
        }
        Object.keys(it).map(k => {
          if (k.startsWith('D') && k.length <= 3) {
            total += Numb(it[k]);
          }
          return k;
        });
        return {
          ...it,
          id,
          key: id,
          total
        };
      });
      r({ result: initData, data: fArr });
    } catch (e) {
      j(e);
    }
  });

export const formatCategories = snap => {
  const categories1 = {};
  const categories2 = {};
  Object.keys(snap).map(k => {
    if (k.startsWith('expense')) {
      categories1[k] = snap[k];
    } else {
      categories2[k] = snap[k];
    }
    return k;
  });
  return { ...categories1, ...categories2 };
};
