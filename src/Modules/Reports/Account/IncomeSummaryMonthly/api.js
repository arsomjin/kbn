import { daysInMonth } from 'functions';
import { distinctArr } from 'functions';
import { showLog } from 'functions';
import dayjs from 'dayjs';
import numeral from 'numeral';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { IncomeReportHeader, IncomeReportTitle } from '../Constant';
import { Numb } from 'functions';

export const titles = Object.keys(IncomeReportTitle).map(k => IncomeReportTitle[k]);

// Test commit.

export const getColumns = mth => {
  if (!mth) {
    // showLog({ no_columns_month: mth });
    return [];
  }
  let mIdx = [...Array(daysInMonth(mth)).keys()].map(it => ({
    title: dayjs(`${mth}-${it + 1}`, 'YYYY-MM-D')
      .add(543, 'year')
      .locale('th')
      .format('D MMM YY'),
    dataIndex: `D${it + 1}`,
    width: 120,
    align: 'center',
    render: (text, record) => (
      <div
        {...(titles.includes(record.incomeTitle) && {
          className: 'text-primary'
        })}
      >
        {!!text ? numeral(text).format('0,0.00') : null}
      </div>
    )
  }));
  return [
    {
      title: 'ประเภท',
      dataIndex: 'incomeTitle',
      width: isMobile ? 160 : 220,
      render: text => (
        <div
          {...(titles.includes(text) && {
            className: 'text-primary'
          })}
        >
          {text}
        </div>
      ),
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

export const incomeSummarySumKeys = mth => {
  if (!mth) {
    // showLog({ no_keys_month: mth });
    return [];
  }
  let iKeys = [...Array(daysInMonth(mth)).keys()].map(it => `D${it + 1}`);
  return [...iKeys, 'total'];
};

export const createInitData = mth => {
  if (!mth) {
    // showLog({ no_init_month: mth });
    return [];
  }
  let mKeys = {};
  [...Array(daysInMonth(mth)).keys()].map(it => {
    mKeys[`D${it + 1}`] = null;
    return it;
  });
  let arr = [];
  Object.keys(IncomeReportHeader).map(headers => {
    Object.keys(IncomeReportHeader[headers]).map(k => {
      arr.push({
        incomeTitle: IncomeReportHeader[headers][k],
        iTitle: k,
        isSection: false,
        section: headers,
        ...mKeys
      });
    });
    arr.push({
      incomeTitle: IncomeReportTitle[headers],
      iTitle: headers,
      isSection: true,
      ...mKeys
    });
    return headers;
  });
  let result = [];
  showLog({ arr, result });
  return arr;
};

export const formatIncomeSummary = (dataArr, mth) =>
  new Promise(async (r, j) => {
    if (!Array.isArray(dataArr) || (!!dataArr && dataArr.length === 0)) {
      return r([]);
    }
    let distinctType = distinctArr(dataArr, ['incomeType', 'incomeCategory', 'incomeSubCategory']).map(it => ({
      incomeType: it.incomeType,
      incomeCategory: it.incomeCategory,
      incomeSubCategory: it.incomeSubCategory
    }));
    try {
      let initData = createInitData(mth).map((it, id) => ({
        ...it,
        id,
        key: id
      }));
      let sumKeys = incomeSummarySumKeys(mth);
      let extraArr = [];
      let arr = dataArr.map(it => {
        let incomeTitle = 'n/a';
        let amount = Numb(it.total);
        let D = dayjs(it.date, 'YYYY-MM-DD').format('D');
        // cash: 'เงินสด',
        // down: 'เงินดาวน์',
        // reservation: 'เงินจอง',
        // baac: 'สกต./ธกส.',
        // licensePlateFee: 'ค่าทะเบียน + พรบ',
        // installment: 'ค่างวด SKL',
        // kbnLeasing: 'โครงการร้าน',
        // inside: 'ซ่อมในศูนย์',
        // outsideCare: 'นอกพื้นที่ คุ้มค่า/แคร์',
        // outside1512: 'นอกพื้นที่ 1-5-12/ตรวจเช็ค/เปลี่ยนถ่าย',
        // repairDeposit: 'รับเงินมัดจำ งานซ่อม',
        // partSKC: 'หน้าร้าน อะไหล่ น้ำมัน SKC',
        // partKBN: 'หน้าร้าน อะไหล่ KBN',
        // wholeSale: 'ขายส่ง อะไหล่ให้ร้านค้า',
        // partDeposit: 'รับเงินมัดจำ อะไหล่',
        // partChange: 'รับเงินทอน แผนกอะไหล่',
        // other: 'อื่นๆ',
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
              case 'partKBN':
                // battery: 'รายรับขายแบตเตอรี่ KBN',
                // intake: 'รายรับขายท่อไอเสีย KBN',
                // gps: 'รายรับขาย GPS - KBN',
                // tyre: 'รายรับขายยาง - KBN',
                const { amtBattery, amtIntake, amtGPS, amtTyre } = it;
                !!amtBattery &&
                  extraArr.push({
                    incomeTitle: 'รายรับขายแบตเตอรี่ KBN',
                    [`D${D}`]: amtBattery
                  });
                !!amtIntake &&
                  extraArr.push({
                    incomeTitle: 'รายรับขายท่อไอเสีย KBN',
                    [`D${D}`]: amtIntake
                  });
                !!amtGPS &&
                  extraArr.push({
                    incomeTitle: 'รายรับขาย GPS - KBN',
                    [`D${D}`]: amtGPS
                  });
                !!amtTyre &&
                  extraArr.push({
                    incomeTitle: 'รายรับขายยาง - KBN',
                    [`D${D}`]: amtTyre
                  });
                break;
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
              case 'inside':
                // serviceInsidePart: 'ค่าอะไหล่ - ซ่อมในศูนย์',
                // serviceInsideOil: 'ค่าน้ำมัน - ซ่อมในศูนย์',
                // serviceInsideWage: 'ค่าแรง - ซ่อมในศูนย์',
                // serviceInsideDistance: 'ค่าระยะทาง - ซ่อมในศูนย์',
                // serviceInsideLathe: 'ค่าโรงกลึง - ซ่อมในศูนย์',
                // serviceInsideGasket: 'ค่าประเก็นกาว - ซ่อมในศูนย์',
                // serviceInsideOther: 'ค่าอื่นๆ - ซ่อมในศูนย์',
                const { amtParts, amtOil, amtWage, amtOther, amtDistance, amtBlackGlue } = it;
                !!amtParts &&
                  extraArr.push({
                    incomeTitle: 'ค่าอะไหล่ - ซ่อมในศูนย์',
                    [`D${D}`]: amtParts
                  });
                !!amtOil &&
                  extraArr.push({
                    incomeTitle: 'ค่าน้ำมัน - ซ่อมในศูนย์',
                    [`D${D}`]: amtOil
                  });
                !!amtWage &&
                  extraArr.push({
                    incomeTitle: 'ค่าแรง - ซ่อมในศูนย์',
                    [`D${D}`]: amtWage
                  });
                !!amtDistance &&
                  extraArr.push({
                    incomeTitle: 'ค่าระยะทาง - ซ่อมในศูนย์',
                    [`D${D}`]: amtDistance
                  });
                !!amtBlackGlue &&
                  extraArr.push({
                    incomeTitle: 'ค่าประเก็นกาว - ซ่อมในศูนย์',
                    [`D${D}`]: amtBlackGlue
                  });
                !!amtOther &&
                  extraArr.push({
                    incomeTitle: 'ค่าอื่นๆ - ซ่อมในศูนย์',
                    [`D${D}`]: amtOther
                  });
                break;
              case 'outsideCare':
                // serviceOutsidePart: 'ค่าอะไหล่ - ซ่อมในศูนย์',
                // serviceOutsideOil: 'ค่าน้ำมัน - ซ่อมในศูนย์',
                // serviceOutsideWage: 'ค่าแรง - ซ่อมในศูนย์',
                // serviceOutsideDistance: 'ค่าระยะทาง - ซ่อมในศูนย์',
                // serviceOutsideLathe: 'ค่าโรงกลึง - ซ่อมในศูนย์',
                // serviceOutsideGasket: 'ค่าประเก็นกาว - ซ่อมในศูนย์',
                // serviceOutsideOther: 'ค่าอื่นๆ - ซ่อมในศูนย์',
                !!it.amtParts &&
                  extraArr.push({
                    incomeTitle: 'ค่าอะไหล่ - นอกพื้นที่',
                    [`D${D}`]: it.amtParts
                  });
                !!it.amtOil &&
                  extraArr.push({
                    incomeTitle: 'ค่าน้ำมัน - นอกพื้นที่',
                    [`D${D}`]: it.amtOil
                  });
                !!it.amtWage &&
                  extraArr.push({
                    incomeTitle: 'ค่าแรง - นอกพื้นที่',
                    [`D${D}`]: it.amtWage
                  });
                !!it.amtDistance &&
                  extraArr.push({
                    incomeTitle: 'ค่าระยะทาง - นอกพื้นที่',
                    [`D${D}`]: it.amtDistance
                  });
                !!it.amtBlackGlue &&
                  extraArr.push({
                    incomeTitle: 'ค่าประเก็นกาว - นอกพื้นที่',
                    [`D${D}`]: it.amtBlackGlue
                  });
                !!it.amtOther &&
                  extraArr.push({
                    incomeTitle: 'ค่าอื่นๆ - นอกพื้นที่',
                    [`D${D}`]: it.amtOther
                  });
                break;
              case 'outside1512':
                // serviceOutside1512Part: 'ค่าอะไหล่ - ซ่อมในศูนย์',
                // serviceOutside1512Oil: 'ค่าน้ำมัน - ซ่อมในศูนย์',
                // serviceOutside1512Wage: 'ค่าแรง - ซ่อมในศูนย์',
                // serviceOutside1512Distance: 'ค่าระยะทาง - ซ่อมในศูนย์',
                // serviceOutside1512Lathe: 'ค่าโรงกลึง - ซ่อมในศูนย์',
                // serviceOutside1512Gasket: 'ค่าประเก็นกาว - ซ่อมในศูนย์',
                // serviceOutside1512Other: 'ค่าอื่นๆ - ซ่อมในศูนย์',
                !!it.amtParts &&
                  extraArr.push({
                    incomeTitle: 'ค่าอะไหล่ - 1-5-12',
                    [`D${D}`]: it.amtParts
                  });
                !!it.amtOil &&
                  extraArr.push({
                    incomeTitle: 'ค่าน้ำมัน - 1-5-12',
                    [`D${D}`]: it.amtOil
                  });
                !!it.amtWage &&
                  extraArr.push({
                    incomeTitle: 'ค่าแรง - 1-5-12',
                    [`D${D}`]: it.amtWage
                  });
                !!it.amtDistance &&
                  extraArr.push({
                    incomeTitle: 'ค่าระยะทาง - 1-5-12',
                    [`D${D}`]: it.amtDistance
                  });
                !!it.amtBlackGlue &&
                  extraArr.push({
                    incomeTitle: 'ค่าประเก็นกาว - 1-5-12',
                    [`D${D}`]: it.amtBlackGlue
                  });
                !!it.amtOther &&
                  extraArr.push({
                    incomeTitle: 'ค่าอื่นๆ - 1-5-12',
                    [`D${D}`]: it.amtOther
                  });
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
      arr = [...arr, ...extraArr];
      let dArr = distinctArr(arr, ['incomeTitle'], sumKeys);
      let fArr = dArr.map((it, id) => {
        let mKeys = {};
        [...Array(daysInMonth(mth)).keys()].map(n => {
          mKeys[`D${n + 1}`] = it[`D${n + 1}`] || null;
          return it;
        });
        return {
          incomeTitle: it.incomeTitle,
          count: it.count,
          ...mKeys
        };
      });
      // fArr = distinctArr(fArr, ['incomeTitle'], sumKeys);
      fArr.map(item => {
        let idx = initData.findIndex(l => l.incomeTitle === item.incomeTitle);
        if (idx > -1) {
          initData[idx] = { ...initData[idx], ...item };
        }
        return item;
      });
      let rData = [...initData];
      initData = initData.map(it => {
        let total = 0;
        if (!!it.isSection) {
          let sKeys = {};
          let sectionArr = rData.filter(l => l.section === it.iTitle);
          [...Array(daysInMonth(mth)).keys()].map(n => {
            sKeys[`D${n + 1}`] = sectionArr.reduce((sum, elem) => sum + Numb(elem[`D${n + 1}`]), 0);
            return it;
          });
          it = { ...it, ...sKeys };
        }
        Object.keys(it).map(k => {
          if (!['incomeTitle', 'iTitle', 'id', 'key', 'count', 'isSection', 'section'].includes(k)) {
            total += Numb(it[k]);
          }
          return k;
        });
        return {
          ...it,
          total
        };
      });
      r(initData);
    } catch (e) {
      j(e);
    }
  });
