import React from 'react';
import { distinctArr, showLog, Numb, getDates } from 'functions';
import moment from 'moment-timezone';
import numeral from 'numeral';
import { isMobile } from 'react-device-detect';
import { IncomeReportHeader, IncomeReportTitle } from '../Constant';

// Generate an array of titles from the IncomeReportTitle constant.
export const titles = Object.keys(IncomeReportTitle).map(k => IncomeReportTitle[k]);

/**
 * Generates table columns based on a date range.
 * Each column for a date is built using a formatted date string.
 */
export const getColumns = range => {
  if (!range) return [];
  const mIdx = getDates(range[0], range[1], 'YYYY-MM-DD').map(it => ({
    title: moment(it, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY'),
    dataIndex: `D${it}`,
    width: 120,
    align: 'center',
    render: (text, record) => (
      <div
        {...(titles.includes(record.incomeTitle) && {
          className: 'text-primary'
        })}
      >
        {text ? numeral(text).format('0,0.00') : null}
      </div>
    )
  }));

  return [
    {
      title: 'ประเภท',
      dataIndex: 'incomeTitle',
      width: isMobile ? 160 : 220,
      render: text => <div {...(titles.includes(text) && { className: 'text-primary' })}>{text}</div>,
      fixed: 'left'
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

/**
 * Similar to getColumns but builds the date columns using a forEach loop.
 */
export const getColumnsFromRange = range => {
  if (!range) return [];
  const mIdx = [];
  const dates = getDates(range[0], range[1], 'YYYY-MM-DD');
  dates.forEach(it => {
    mIdx.push({
      title: moment(it, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY'),
      dataIndex: `D${it}`,
      width: 120,
      align: 'center',
      render: (text, record) => (
        <div
          {...(titles.includes(record.incomeTitle) && {
            className: 'text-primary'
          })}
        >
          {text ? numeral(text).format('0,0.00') : null}
        </div>
      )
    });
  });

  return [
    {
      title: 'ประเภท',
      dataIndex: 'incomeTitle',
      width: isMobile ? 160 : 220,
      render: text => <div {...(titles.includes(text) && { className: 'text-primary' })}>{text}</div>,
      fixed: 'left'
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

/**
 * Generates an array of dates (as strings) between the start and end dates.
 * Note: Assumes both dates are within the same month.
 */
export const getDatesFromRange = range => {
  if (!range) return [];
  const dates = [];
  const mth = moment(range[0], 'YYYY-MM-DD').format('YYYY-MM');
  const startI = moment(range[0], 'YYYY-MM-DD').format('D');
  const endI = moment(range[1], 'YYYY-MM-DD').format('D');
  for (let i = Numb(startI) - 1; i < Numb(endI); i++) {
    dates.push(moment(`${mth}-${i + 1}`, 'YYYY-MM-DD').format('YYYY-MM-DD'));
  }
  return dates;
};

/**
 * Generates an array of keys for summing income data.
 */
export const incomeSummarySumKeys = range => {
  if (!range) return [];
  const iKeys = getDates(range[0], range[1], 'YYYY-MM-DD').map(it => `D${it}`);
  return [...iKeys, 'count', 'total'];
};

/**
 * Creates initial data structure for income summary.
 * Each row is pre-populated with a set of keys (one for each date) initialized to null.
 */
export const createInitData = range => {
  if (!range) return [];
  const mKeys = {};
  getDates(range[0], range[1], 'YYYY-MM-DD').forEach(it => {
    mKeys[`D${it}`] = null;
  });
  const arr = [];

  Object.keys(IncomeReportHeader).forEach(headerKey => {
    Object.keys(IncomeReportHeader[headerKey]).forEach(k => {
      arr.push({
        incomeTitle: IncomeReportHeader[headerKey][k],
        iTitle: k,
        isSection: false,
        section: headerKey,
        ...mKeys
      });
    });
    arr.push({
      incomeTitle: IncomeReportTitle[headerKey],
      iTitle: headerKey,
      isSection: true,
      ...mKeys
    });
  });
  showLog({ arr });
  return arr;
};

/**
 * Formats and aggregates raw income data into a summary based on the provided date range.
 * This function builds a complete data structure by merging raw data with initial rows,
 * applying custom logic (including extra rows for certain income types),
 * and calculating totals.
 */
export const formatIncomeSummary = async (dataArr, range) => {
  if (!Array.isArray(dataArr) || dataArr.length === 0) {
    return [];
  }

  try {
    // Build initial data rows with keys for each date
    const initData = createInitData(range).map((it, id) => ({
      ...it,
      id,
      key: id
    }));
    const sumKeys = incomeSummarySumKeys(range);
    const extraArr = [];

    // Process each raw data item to determine its income title and amount
    const arr = dataArr.map(it => {
      let incomeTitle = 'n/a';
      const amount = Numb(it.total);
      const D = it.date;

      // Determine income title based on sub-category and type
      switch (it.incomeSubCategory) {
        case 'vehicle':
        case 'vehicles':
          switch (it.incomeType) {
            case 'cash':
              incomeTitle = 'รายรับซื้อสด';
              break;
            case 'reservation':
              incomeTitle = 'รายรับเงินมัดจำ / จอง';
              break;
            case 'down':
              incomeTitle = 'รายรับเงินวางดาวน์';
              break;
            case 'baac':
              incomeTitle = 'รายรับ สกต./ธกส.';
              break;
            case 'licensePlateFee':
              incomeTitle = 'รายรับค่าทะเบียน / พรบ.';
              break;
            case 'kbnLeasing':
              incomeTitle = 'รายรับค่างวด';
              break;
            case 'other':
              incomeTitle = 'รายรับอื่นๆ';
              break;
            default:
              break;
          }
          break;

        case 'parts':
          switch (it.incomeType) {
            case 'partSKC':
              incomeTitle = 'รายรับขายอะไหล่ / น้ำมัน SKC';
              break;
            case 'partKBN': {
              const { amtBattery, amtIntake, amtGPS, amtTyre } = it;
              if (amtBattery) {
                extraArr.push({
                  incomeTitle: 'รายรับขายแบตเตอรี่ KBN',
                  [`D${D}`]: amtBattery
                });
              }
              if (amtIntake) {
                extraArr.push({
                  incomeTitle: 'รายรับขายท่อไอเสีย KBN',
                  [`D${D}`]: amtIntake
                });
              }
              if (amtGPS) {
                extraArr.push({
                  incomeTitle: 'รายรับขาย GPS - KBN',
                  [`D${D}`]: amtGPS
                });
              }
              if (amtTyre) {
                extraArr.push({
                  incomeTitle: 'รายรับขายยาง - KBN',
                  [`D${D}`]: amtTyre
                });
              }
              break;
            }
            case 'wholeSale':
              incomeTitle = 'รายรับอะไหล่ขายส่ง';
              break;
            case 'partDeposit':
              incomeTitle = 'รายรับเงินมัดจำ - อะไหล่';
              break;
            default:
              break;
          }
          break;

        case 'service':
          switch (it.incomeType) {
            case 'inside': {
              const { amtParts, amtOil, amtWage, amtOther, amtDistance, amtBlackGlue } = it;
              if (amtParts) {
                extraArr.push({
                  incomeTitle: 'ค่าอะไหล่ - ซ่อมในศูนย์',
                  [`D${D}`]: amtParts
                });
              }
              if (amtOil) {
                extraArr.push({
                  incomeTitle: 'ค่าน้ำมัน - ซ่อมในศูนย์',
                  [`D${D}`]: amtOil
                });
              }
              if (amtWage) {
                extraArr.push({
                  incomeTitle: 'ค่าแรง - ซ่อมในศูนย์',
                  [`D${D}`]: amtWage
                });
              }
              if (amtDistance) {
                extraArr.push({
                  incomeTitle: 'ค่าระยะทาง - ซ่อมในศูนย์',
                  [`D${D}`]: amtDistance
                });
              }
              if (amtBlackGlue) {
                extraArr.push({
                  incomeTitle: 'ค่าประเก็นกาว - ซ่อมในศูนย์',
                  [`D${D}`]: amtBlackGlue
                });
              }
              if (amtOther) {
                extraArr.push({
                  incomeTitle: 'ค่าอื่นๆ - ซ่อมในศูนย์',
                  [`D${D}`]: amtOther
                });
              }
              if (it.deductDeposit) {
                extraArr.push({
                  incomeTitle: 'หัก มัดจำ - ซ่อมในศูนย์',
                  [`D${D}`]: it.deductDeposit
                });
              }
              break;
            }
            case 'outsideCare':
              if (it.amtParts) {
                extraArr.push({
                  incomeTitle: 'ค่าอะไหล่ - นอกพื้นที่',
                  [`D${D}`]: it.amtParts
                });
              }
              if (it.amtOil) {
                extraArr.push({
                  incomeTitle: 'ค่าน้ำมัน - นอกพื้นที่',
                  [`D${D}`]: it.amtOil
                });
              }
              if (it.amtWage) {
                extraArr.push({
                  incomeTitle: 'ค่าแรง - นอกพื้นที่',
                  [`D${D}`]: it.amtWage
                });
              }
              if (it.amtDistance) {
                extraArr.push({
                  incomeTitle: 'ค่าระยะทาง - นอกพื้นที่',
                  [`D${D}`]: it.amtDistance
                });
              }
              if (it.amtBlackGlue) {
                extraArr.push({
                  incomeTitle: 'ค่าประเก็นกาว - นอกพื้นที่',
                  [`D${D}`]: it.amtBlackGlue
                });
              }
              if (it.amtOther) {
                extraArr.push({
                  incomeTitle: 'ค่าอื่นๆ - นอกพื้นที่',
                  [`D${D}`]: it.amtOther
                });
              }
              if (it.deductDeposit) {
                extraArr.push({
                  incomeTitle: 'หัก มัดจำ - นอกพื้นที่',
                  [`D${D}`]: it.deductDeposit
                });
              }
              break;
            case 'outside1512':
              if (it.amtParts) {
                extraArr.push({
                  incomeTitle: 'ค่าอะไหล่ - 1-5-12',
                  [`D${D}`]: it.amtParts
                });
              }
              if (it.amtOil) {
                extraArr.push({
                  incomeTitle: 'ค่าน้ำมัน - 1-5-12',
                  [`D${D}`]: it.amtOil
                });
              }
              if (it.amtWage) {
                extraArr.push({
                  incomeTitle: 'ค่าแรง - 1-5-12',
                  [`D${D}`]: it.amtWage
                });
              }
              if (it.amtDistance) {
                extraArr.push({
                  incomeTitle: 'ค่าระยะทาง - 1-5-12',
                  [`D${D}`]: it.amtDistance
                });
              }
              if (it.amtBlackGlue) {
                extraArr.push({
                  incomeTitle: 'ค่าประเก็นกาว - 1-5-12',
                  [`D${D}`]: it.amtBlackGlue
                });
              }
              if (it.amtOther) {
                extraArr.push({
                  incomeTitle: 'ค่าอื่นๆ - 1-5-12',
                  [`D${D}`]: it.amtOther
                });
              }
              break;
            case 'repairDeposit':
              incomeTitle = 'รายรับเงินมัดจำ / จอง';
              break;
            default:
              break;
          }
          break;

        case 'other':
          incomeTitle = 'รายรับอื่นๆ';
          break;

        default:
          break;
      }
      return {
        ...it,
        incomeTitle,
        [`D${D}`]: amount,
        count: 1
      };
    });

    // Combine the main and extra rows, then deduplicate by incomeTitle
    const combinedArr = [...arr, ...extraArr];
    const dArr = distinctArr(combinedArr, ['incomeTitle'], sumKeys);

    // Rebuild each row to ensure all date keys exist
    const fArr = dArr.map(it => {
      const mKeys = {};
      getDates(range[0], range[1], 'YYYY-MM-DD').forEach(n => {
        mKeys[`D${n}`] = it[`D${n}`] || null;
      });
      return {
        incomeTitle: it.incomeTitle,
        count: it.count,
        ...mKeys
      };
    });

    // Merge the formatted rows into the initial data based on incomeTitle
    fArr.forEach(item => {
      const idx = initData.findIndex(l => l.incomeTitle === item.incomeTitle);
      if (idx > -1) {
        initData[idx] = { ...initData[idx], ...item };
      }
    });

    const rData = [...initData];

    // Calculate totals for each row; if a row is a section, aggregate its child rows
    const finalData = initData.map(it => {
      let total = 0;
      if (it.isSection) {
        const sKeys = {};
        const sectionArr = rData.filter(l => l.section === it.iTitle);
        showLog({ sectionArr });
        getDates(range[0], range[1], 'YYYY-MM-DD').forEach(n => {
          sKeys[`D${n}`] = sectionArr
            .filter(l => !l.incomeTitle.startsWith('หัก มัดจำ'))
            .reduce((sum, elem) => sum + Numb(elem[`D${n}`]), 0);
          if (sectionArr.filter(l => l.incomeTitle.startsWith('หัก มัดจำ')).length > 0) {
            // Deduct deposit.
            sKeys[`D${n}`] =
              sKeys[`D${n}`] -
              sectionArr
                .filter(l => l.incomeTitle.startsWith('หัก มัดจำ'))
                .reduce((sum, elem) => sum + Numb(elem[`D${n}`]), 0);
          }
        });
        it = { ...it, ...sKeys };
      }
      Object.keys(it).forEach(k => {
        if (!['incomeTitle', 'iTitle', 'id', 'key', 'count', 'isSection', 'section'].includes(k)) {
          total += Numb(it[k]);
        }
      });
      return {
        ...it,
        total
      };
    });

    showLog({ combinedArr, dArr, fArr, initData, finalData });
    return finalData;
  } catch (e) {
    throw e;
  }
};
