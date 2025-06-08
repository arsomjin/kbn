// utils/expenseUtils.js (suggested file name)

import { arrayForEach, distinctArr, Numb, getDates, insertArr, sortArr, showLog } from 'functions';
import dayjs from 'dayjs';
import numeral from 'numeral';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { ExpenseReportTitle } from '../Constant';
import { PopUp } from 'elements';
import { getBranchName } from 'Modules/Utils';

// Remove unused imports: daysInMonth, uniq, ExpenseReportHeader, getSearchData, checkCollection, Tag, render, ExpenseType

// Create a list of titles based on ExpenseReportTitle.
export const titles = Object.keys(ExpenseReportTitle).map(key => ExpenseReportTitle[key]);

/**
 * Returns column definitions for a table based on a date range.
 */
export const getColumnsFromRange = range => {
  if (!range) {
    return [];
  }

  const dateColumns = getDates(range[0], range[1], 'YYYY-MM-DD').map(dateStr => ({
    title: dayjs(dateStr, 'YYYY-MM-DD') // use consistent date format
      .add(543, 'year')
      .locale('th')
      .format('D MMM YY'),
    dataIndex: `D${dateStr}`,
    width: 120,
    align: 'center',
    render: (text, record) => {
      if (record?.otherBranchPay && text) {
        return (
          <PopUp
            label={numeral(text).format('0,0.00')}
            title={<div className="text-center text-primary">{record.expenseTitle}</div>}
            content={<div>{`${getBranchName(record.branchCode)} จ่ายให้ ${numeral(text).format('0,0.00')} บาท`}</div>}
          />
        );
      }
      return (
        <div className={record.isSection ? 'text-primary' : undefined}>
          {text ? numeral(text).format('0,0.00') : null}
        </div>
      );
    }
  }));

  return [
    {
      title: 'รายการ',
      dataIndex: 'expenseTitle',
      width: isMobile ? 180 : 240,
      fixed: 'left',
      render: (text, record) => <div className={record.isSection ? 'text-primary' : undefined}>{text}</div>
    },
    {
      title: 'ประเภท',
      dataIndex: 'expenseType',
      width: 100,
      align: 'center',
      render: (text, record) => {
        let label = null;
        if (text && !record.isSection && record.total) {
          label = record.otherBranchPay ? 'สาขาอื่นจ่าย' : text === 'dailyChange' ? 'เงินสด' : 'เงินโอน';
        }
        return <div>{label}</div>;
      }
    },
    {
      title: 'วันที่',
      children: dateColumns
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

/**
 * Returns an array of keys for the expense summary based on a date range.
 */
export const expenseSummarySumKeys = range => {
  if (!range) {
    return [];
  }
  const dateKeys = getDates(range[0], range[1], 'YYYY-MM-DD').map(dateStr => `D${dateStr}`);
  return [...dateKeys, 'total'];
};

/**
 * Creates initial data structure for expense entries based on a range, titles, and headers.
 */
export const createInitData = async (range, expenseTitles, expenseHeaders) => {
  if (!range) return [];
  const mKeys = {};
  getDates(range[0], range[1], 'YYYY-MM-DD').forEach(dateStr => {
    mKeys[`D${dateStr}`] = null;
  });
  const arr = [];
  await arrayForEach(Object.keys(expenseHeaders), async section => {
    await arrayForEach(Object.keys(expenseHeaders[section]), async key => {
      arr.push({
        expenseTitle: expenseHeaders[section][key],
        iTitle: key,
        isSection: false,
        payToOtherBranch: false,
        otherBranchPay: false,
        expenseType: 'dailyChange',
        section,
        ...mKeys
      });
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
  });
  return arr;
};

/**
 * Formats expense summary data.
 */
export const formatExpenseSummary = async (allArr, range, dbValues, branchCode) => {
  if (!Array.isArray(allArr) || !allArr) {
    return [];
  }
  const { categories: expenseCategories, names: expenseAccountNames } = dbValues;
  showLog({ expenseCategories, expenseAccountNames });
  let dataArr = [];

  // Process each expense entry.
  allArr
    .filter(l => !l.deleted)
    .forEach(item => {
      if (item.items) {
        const items = item.items.map(expenseItem => {
          let otherBranchPay = false;
          let payToOtherBranch = false;
          if (typeof expenseItem.payToBranch !== 'undefined') {
            otherBranchPay = branchCode !== item.branchCode && branchCode === expenseItem.payToBranch;
            payToOtherBranch = branchCode !== expenseItem.payToBranch && item.branchCode === branchCode;
          }
          const netTotal =
            Numb(expenseItem.total) +
            (expenseItem.priceType === 'separateVat' ? Numb(expenseItem.VAT) : 0) -
            Numb(expenseItem.whTax);
          return {
            ...expenseItem,
            date: item.date,
            branchCode: item.branchCode,
            expenseId: item.expenseId,
            otherBranchPay,
            payToOtherBranch,
            payToBranch: expenseItem.payToBranch || item.branchCode,
            netTotal
          };
        });
        dataArr = dataArr.concat(items);
      }
    });

  const expenseArr = dataArr.filter(expenseItem => expenseItem.payToBranch === branchCode);

  // Build category mappings.
  const categories = {};
  Object.keys(expenseCategories).forEach(key => {
    categories[key] = expenseCategories[key].expenseCategoryName;
  });
  const categoryName = {};
  const accountNamesArr = Object.values(expenseAccountNames);
  Object.keys(expenseCategories).forEach(key => {
    accountNamesArr
      .filter(item => item.expenseCategoryId === key)
      .forEach(item => {
        if (expenseAccountNames[item.expenseNameId]) {
          categoryName[key] = {
            ...(categoryName[key] || {}),
            [item.expenseNameId]: expenseAccountNames[item.expenseNameId]?.expenseName
          };
        }
      });
  });

  try {
    let initData = await createInitData(range, categories, categoryName);
    const sumKeys = expenseSummarySumKeys(range);
    const mappedArr = expenseArr
      .filter(expenseItem => !expenseItem.deleted)
      .map(expenseItem => {
        let expenseTitle = 'n/a';
        const amount = Numb(expenseItem.netTotal);
        const D = expenseItem.date;
        if (['dailyChange', 'headOfficeTransfer', 'executive'].includes(expenseItem.expenseType)) {
          if (categoryName[expenseItem.expenseCategoryId]) {
            expenseTitle =
              categoryName[expenseItem.expenseCategoryId][expenseItem.expenseAccountNameId] ||
              categories[expenseItem.expenseCategoryId] ||
              'n/a';
          }
        }
        return {
          ...expenseItem,
          expenseTitle,
          [`D${D}`]: amount,
          count: 1
        };
      });

    const distinctExpenses = distinctArr(
      mappedArr,
      ['expenseItemId', 'payToOtherBranch', 'otherBranchPay', 'expenseType'],
      sumKeys
    );
    const formattedArr = distinctExpenses.map(expenseItem => {
      const mKeys = {};
      getDates(range[0], range[1], 'YYYY-MM-DD').forEach(dateStr => {
        mKeys[`D${dateStr}`] = expenseItem[`D${dateStr}`];
      });
      return {
        expenseType: expenseItem.expenseType,
        expenseTitle: expenseItem.expenseTitle,
        expenseName: expenseItem.expenseName,
        expenseAccountNameId: expenseItem.expenseAccountNameId,
        payToOtherBranch: expenseItem.payToOtherBranch,
        otherBranchPay: expenseItem.otherBranchPay,
        branchCode: expenseItem.branchCode,
        count: expenseItem.count,
        ...mKeys
      };
    });

    // Merge formatted amounts into the initial data.
    formattedArr.forEach(item => {
      const index = initData.findIndex(
        data => data.expenseTitle === item.expenseTitle && data.iTitle === item.expenseAccountNameId
      );
      if (index > -1) {
        if (
          initData[index].otherBranchPay === item.otherBranchPay &&
          initData[index].payToOtherBranch === item.payToOtherBranch &&
          initData[index].expenseType === item.expenseType
        ) {
          Object.keys(initData[index]).forEach(key => {
            if (key.startsWith('D') && key.length <= 11) {
              initData[index][key] = Numb(initData[index][key]) + Numb(item[key]);
            }
          });
          initData[index].expenseType = item.expenseType;
        } else {
          const nKeys = {};
          getDates(range[0], range[1], 'YYYY-MM-DD').forEach(dateStr => {
            nKeys[`D${dateStr}`] = item[`D${dateStr}`];
          });
          initData = insertArr([...initData], index, [
            {
              ...initData[index],
              otherBranchPay: item.otherBranchPay,
              payToOtherBranch: item.payToOtherBranch,
              expenseType: item.expenseType,
              branchCode: item.branchCode,
              ...nKeys
            }
          ]);
        }
      }
    });

    const originalData = [...initData];
    initData = initData.map((data, id) => {
      let total = 0;
      if (data.isSection) {
        const sectionSums = {};
        const sectionItems = originalData.filter(item => item.section === data.iTitle);
        getDates(range[0], range[1], 'YYYY-MM-DD').forEach(dateStr => {
          sectionSums[`D${dateStr}`] = sectionItems.reduce((sum, elem) => sum + Numb(elem[`D${dateStr}`]), 0);
        });
        data = { ...data, ...sectionSums };
      }
      Object.keys(data).forEach(key => {
        if (key.startsWith('D') && key.length <= 11) {
          total += Numb(data[key]);
        }
      });
      return { ...data, id, key: id, total };
    });
    showLog({ initData, mappedArr, distinctExpenses, formattedArr, allArr });
    return { result: initData, data: formattedArr };
  } catch (error) {
    throw error;
  }
};

/**
 * Formats category data by sorting and removing temporary keys.
 */
export const formatCategories = snap => {
  const arr = Object.keys(snap).map(key => ({ ...snap[key], _key: key }));
  const sortedArr = sortArr(arr, 'expenseCategoryNumber');
  const categories = {};
  sortedArr.forEach(item => {
    const { _key, ...rest } = item;
    categories[_key] = rest;
  });
  showLog({ arr, sortedArr, categories });
  return categories;
};

/**
 * Backup function for formatting categories.
 */
export const formatCategories_bak = snap => {
  const categories1 = {};
  const categories2 = {};
  Object.keys(snap).forEach(key => {
    if (key.startsWith('expense')) {
      categories1[key] = snap[key];
    } else {
      categories2[key] = snap[key];
    }
  });
  return { ...categories1, ...categories2 };
};
