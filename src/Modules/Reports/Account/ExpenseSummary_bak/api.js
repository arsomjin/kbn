import { arrayForEach } from 'functions';
import { distinctArr } from 'functions';
import { showLog } from 'functions';
import moment from 'moment-timezone';
import numeral from 'numeral';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { ExpenseReportTitle } from '../Constant';
import { Numb } from 'functions';
import { PopUp } from 'elements';
import { getBranchName } from 'Modules/Utils';
import { insertArr } from 'functions';
import { getDates } from 'functions';
import { sortArr } from 'functions';

export const titles = Object.keys(ExpenseReportTitle).map(k => ExpenseReportTitle[k]);

export const getColumnsFromRange = range => {
  if (!range) {
    // showLog({ no_columns_month: mth });
    return [];
  }
  let mIdx = getDates(range[0], range[1], 'YYYY-MM-DD').map(it => ({
    title: moment(it, 'YYYY-MM-D').add(543, 'year').locale('th').format('D MMM YY'),
    dataIndex: `D${it}`,
    width: 120,
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

export const expenseSummarySumKeys = range => {
  if (!range) {
    // showLog({ no_keys_month: mth });
    return [];
  }
  let iKeys = getDates(range[0], range[1], 'YYYY-MM-DD').map(it => `D${it}`);
  return [...iKeys, 'total'];
};

export const createInitData = (range, expenseTitles, expenseHeaders) =>
  new Promise(async (r, j) => {
    try {
      if (!range) {
        // showLog({ no_init_month: mth });
        return r([]);
      }
      let mKeys = {};
      getDates(range[0], range[1], 'YYYY-MM-DD').map(it => {
        mKeys[`D${it}`] = null;
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

export const formatExpenseSummary = (allArr, range, dbValues, branchCode) =>
  new Promise(async (r, j) => {
    if (!Array.isArray(allArr) || !allArr) {
      return r([]);
    }
    const { categories: expenseCategories, names: expenseAccountNames } = dbValues;
    showLog({ expenseCategories, expenseAccountNames });
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
      let initData = await createInitData(range, categories, categoryName);
      let sumKeys = expenseSummarySumKeys(range);
      let arr = expenseArr
        .filter(l => !l.deleted)
        .map(it => {
          let expenseTitle = 'n/a';
          let amount = Numb(it.netTotal);
          let D = it.date;
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
        getDates(range[0], range[1], 'YYYY-MM-DD').map(n => {
          mKeys[`D${n}`] = it[`D${n}`];
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
              if (k.startsWith('D') && k.length <= 11) {
                initData[idx][k] = Numb(initData[idx][k]) + Numb(item[k]);
              }
              return k;
            });
            initData[idx].expenseType = item.expenseType;
          } else {
            let nKeys = {};
            getDates(range[0], range[1], 'YYYY-MM-DD').map(n => {
              nKeys[`D${n}`] = item[`D${n}`];
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
          getDates(range[0], range[1], 'YYYY-MM-DD').map(n => {
            sKeys[`D${n}`] = sectionArr.reduce((sum, elem) => sum + Numb(elem[`D${n}`]), 0);
            return n;
          });
          it = {
            ...it,
            ...sKeys
          };
        }
        Object.keys(it).map(k => {
          if (k.startsWith('D') && k.length <= 11) {
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
      showLog({ initData, fArr, allArr });
      r({ result: initData, data: fArr });
    } catch (e) {
      j(e);
    }
  });

export const formatCategories = snap => {
  let categories = {};
  let arr = Object.keys(snap).map(k => ({ ...snap[k], _key: k }));
  let sArr = sortArr(arr, 'expenseCategoryNumber');
  sArr.map(it => {
    let cIt = { ...it };
    delete cIt._key;
    categories[it._key] = cIt;
  });
  showLog({ arr, sArr, categories });
  return categories;
};

export const formatCategories_bak = snap => {
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
