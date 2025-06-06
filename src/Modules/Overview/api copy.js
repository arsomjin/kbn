import { checkCollection } from 'firebase/api';
import { distinctArr } from 'functions';
import { sortArr } from 'functions';
import moment from 'moment';
import numeral from 'numeral';
import { DATA_LENGTH, DefaultProps } from './initValues';

export const getOverviewDataFromRange = range =>
  new Promise(async (r, j) => {
    try {
      let smallStats = DefaultProps.smallStats.map(l => l);
      let sms1 = await getIncomeData(range, 'reports/sales/vehicles', 'date', 'amtFull', smallStats[0]);
      // smallStats[0] = await getSaleOverview(range, smallStats);
      let sms2 = await getIncomeData(range, 'reports/sales/parts', 'saleDate', 'netTotal', smallStats[1]);
      let sms3 = await getServiceOverview(range, smallStats[2]);
      smallStats[0] = { ...smallStats[0], ...sms1 };
      smallStats[1] = { ...smallStats[1], ...sms2 };
      smallStats[2] = { ...smallStats[2], ...sms3 };
      let bySections = DefaultProps.bySections.map(l => l);
      bySections[0] = await getSaleOverview(range, bySections);
      bySections[1] = await getPartOverview(range, bySections);
      bySections[2] = await getServiceOverview(range, bySections);
      let result = { smallStats };
      r(result);
    } catch (e) {
      j(e);
    }
  });

export const getIncomeData = (range, collection, dateName, valueName, result) =>
  new Promise(async (r, j) => {
    try {
      let arr = [];
      let sales = [];
      let sublabel = 'วันนี้';
      let increase = true;
      let percentage = '0.00%';
      let value = '0.00';
      let sort = 'date';
      switch (range) {
        case 'day':
          sort = 'date';
          break;
        default:
          sort = range;
          break;
      }
      const snap = await checkCollection(collection, [
        [
          dateName,
          '>=',
          moment()
            .subtract(DATA_LENGTH, range === 'quarter' ? 'Q' : range)
            .format('YYYY-MM-DD')
        ]
      ]);
      if (snap) {
        snap.forEach(doc => {
          let item = {
            date: doc.data()[dateName],
            week: moment(doc.data()[dateName], 'YYYY-MM-DD').week(),
            month: moment(doc.data()[dateName], 'YYYY-MM-DD').month(),
            quarter: moment(doc.data()[dateName], 'YYYY-MM-DD').quarter(),
            year: moment(doc.data()[dateName], 'YYYY-MM-DD').year(),
            saleNo: doc.data().saleNo,
            [valueName]: doc.data()[valueName]
          };
          //  showLog(item);
          arr.push(item);
        });
        arr = distinctArr(arr, [sort], [valueName]);
        sales = sortArr(arr, sort).map(l => ({
          [sort]: l[sort],
          [valueName]: l[valueName]
        }));
        sales = sales.slice(-7);
        // sublabel, increase, percentage, value
        switch (range) {
          case 'day':
            sublabel = moment(sales[sales.length - 1].date).format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${sales[sales.length - 1][sort]}`;
            break;
          case 'month':
            sublabel = `เดือน ${moment()
              .month(sales[sales.length - 1][sort])
              .format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${sales[sales.length - 1][sort]}`;
            break;
          case 'year':
            sublabel = `ปี ${sales[sales.length - 1][sort]}`;
            break;

          default:
            break;
        }
        if (sales.length > 1) {
          increase = sales[sales.length - 1][valueName] > sales[sales.length - 2][valueName];
          percentage = numeral(
            (sales[sales.length - 1][valueName] - sales[sales.length - 2][valueName]) /
              sales[sales.length - 1][valueName]
          ).format('0.00%');
          value = numeral(sales[sales.length - 1][valueName]).format('0,0');
        } else {
          value = numeral(sales[0][valueName]).format('0,0');
        }
        result = {
          ...result,
          sublabel,
          value,
          percentage,
          increase,
          datasets: [
            {
              ...result.datasets[0],
              data: sales.map(l => l[valueName])
            }
          ]
        };
      } else {
        switch (range) {
          case 'day':
            sublabel = moment().subtract(DATA_LENGTH, range).format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${moment().subtract(DATA_LENGTH, range).week()}`;
            break;
          case 'month':
            sublabel = `เดือน ${moment()
              .month(moment().subtract(DATA_LENGTH, range).format('MMM yy'))
              .format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${moment().subtract(DATA_LENGTH, range).quarter()}`;
            break;
          case 'year':
            sublabel = `ปี ${moment().subtract(DATA_LENGTH, range).year()}`;
            break;

          default:
            break;
        }
        result = {
          ...result,
          sublabel,
          value: '0.00',
          percentage: '0.00%',
          increase: true
        };
      }
      r(result);
    } catch (e) {
      j(e);
    }
  });

export const getSaleOverview = (range, result) =>
  new Promise(async (r, j) => {
    try {
      let arr = [];
      let sales = [];
      let sublabel = 'วันนี้';
      let increase = true;
      let percentage = '0.00%';
      let value = '0.00';
      let sort = 'date';
      switch (range) {
        case 'day':
          sort = 'date';
          break;
        default:
          sort = range;
          break;
      }
      const snap = await checkCollection('reports/sales/vehicles', [
        [
          'date',
          '>=',
          moment()
            .subtract(DATA_LENGTH, range === 'quarter' ? 'Q' : range)
            .format('YYYY-MM-DD')
        ]
      ]);
      if (snap) {
        snap.forEach(doc => {
          let item = {
            date: doc.data().date,
            week: moment(doc.data().date, 'YYYY-MM-DD').week(),
            month: moment(doc.data().date, 'YYYY-MM-DD').month(),
            quarter: moment(doc.data().date, 'YYYY-MM-DD').quarter(),
            year: moment(doc.data().date, 'YYYY-MM-DD').year(),
            saleNo: doc.data().saleNo,
            amtFull: doc.data().amtFull
          };
          //  showLog(item);
          arr.push(item);
        });
        arr = distinctArr(arr, [sort], ['amtFull']);
        sales = sortArr(arr, sort).map(l => ({
          [sort]: l[sort],
          amtFull: l.amtFull
        }));
        sales = sales.slice(-7);
        // sublabel, increase, percentage, value
        switch (range) {
          case 'day':
            sublabel = moment(sales[sales.length - 1].date).format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${sales[sales.length - 1][sort]}`;
            break;
          case 'month':
            sublabel = `เดือน ${moment()
              .month(sales[sales.length - 1][sort])
              .format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${sales[sales.length - 1][sort]}`;
            break;
          case 'year':
            sublabel = `ปี ${sales[sales.length - 1][sort]}`;
            break;

          default:
            break;
        }
        if (sales.length > 1) {
          increase = sales[sales.length - 1].amtFull > sales[sales.length - 2].amtFull;
          percentage = numeral(
            (sales[sales.length - 1].amtFull - sales[sales.length - 2].amtFull) / sales[sales.length - 1].amtFull
          ).format('0.00%');
          value = numeral(sales[sales.length - 1].amtFull).format('0,0');
        } else {
          value = numeral(sales[0].amtFull).format('0,0');
        }
        result[0] = {
          ...result[0],
          sublabel,
          value,
          percentage,
          increase,
          datasets: [
            {
              ...result[0].datasets[0],
              data: sales.map(l => l.amtFull)
            }
          ]
        };
      } else {
        switch (range) {
          case 'day':
            sublabel = moment().subtract(DATA_LENGTH, range).format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${moment().subtract(DATA_LENGTH, range).week()}`;
            break;
          case 'month':
            sublabel = `เดือน ${moment()
              .month(moment().subtract(DATA_LENGTH, range).format('MMM yy'))
              .format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${moment().subtract(DATA_LENGTH, range).quarter()}`;
            break;
          case 'year':
            sublabel = `ปี ${moment().subtract(DATA_LENGTH, range).year()}`;
            break;

          default:
            break;
        }
        result[0] = {
          ...result[0],
          sublabel,
          value: '0.00',
          percentage: '0.00%',
          increase: true
        };
      }
      r(result[0]);
    } catch (e) {
      j(e);
    }
  });

export const getPartOverview = (range, result) =>
  new Promise(async (r, j) => {
    try {
      let arr = [];
      let sales = [];
      let sublabel = 'วันนี้';
      let increase = true;
      let percentage = '0.00%';
      let value = '0.00';
      let sort = 'date';
      switch (range) {
        case 'day':
          sort = 'date';
          break;
        default:
          sort = range;
          break;
      }
      const snap = await checkCollection('reports/sales/parts', [
        [
          'saleDate',
          '>=',
          moment()
            .subtract(DATA_LENGTH, range === 'quarter' ? 'Q' : range)
            .format('YYYY-MM-DD')
        ]
      ]);
      if (snap) {
        snap.forEach(doc => {
          let item = {
            date: doc.data().saleDate,
            week: moment(doc.data().saleDate, 'YYYY-MM-DD').week(),
            month: moment(doc.data().saleDate, 'YYYY-MM-DD').month(),
            quarter: moment(doc.data().saleDate, 'YYYY-MM-DD').quarter(),
            year: moment(doc.data().saleDate, 'YYYY-MM-DD').year(),
            saleNo: doc.data().saleNo,
            netTotal: doc.data().netTotal
          };
          //  showLog(item);
          arr.push(item);
        });
        arr = distinctArr(arr, [sort], ['netTotal']);
        sales = sortArr(arr, sort).map(l => ({
          [sort]: l[sort],
          netTotal: l.netTotal
        }));
        sales = sales.slice(-7);
        // sublabel, increase, percentage, value
        switch (range) {
          case 'day':
            sublabel = moment(sales[sales.length - 1].saleDate).format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${sales[sales.length - 1][sort]}`;
            break;
          case 'month':
            sublabel = `เดือน ${moment()
              .month(sales[sales.length - 1][sort])
              .format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${sales[sales.length - 1][sort]}`;
            break;
          case 'year':
            sublabel = `ปี ${sales[sales.length - 1][sort]}`;
            break;

          default:
            break;
        }
        if (sales.length > 1) {
          increase = sales[sales.length - 1].netTotal > sales[sales.length - 2].netTotal;
          percentage = numeral(
            (sales[sales.length - 1].netTotal - sales[sales.length - 2].netTotal) / sales[sales.length - 1].netTotal
          ).format('0.00%');
          value = numeral(sales[sales.length - 1].netTotal).format('0,0');
        } else {
          value = numeral(sales[0].netTotal).format('0,0');
        }
        result[1] = {
          ...result[1],
          sublabel,
          value,
          percentage,
          increase,
          datasets: [
            {
              ...result[1].datasets[0],
              data: sales.map(l => l.netTotal)
            }
          ]
        };
      } else {
        switch (range) {
          case 'day':
            sublabel = moment().subtract(DATA_LENGTH, range).format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${moment().subtract(DATA_LENGTH, range).week()}`;
            break;
          case 'month':
            sublabel = `เดือน ${moment()
              .month(moment().subtract(DATA_LENGTH, range).format('MMM yy'))
              .format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${moment().subtract(DATA_LENGTH, range).quarter()}`;
            break;
          case 'year':
            sublabel = `ปี ${moment().subtract(DATA_LENGTH, range).year()}`;
            break;

          default:
            break;
        }
        result[1] = {
          ...result[1],
          sublabel,
          value: '0.00',
          percentage: '0.00%',
          increase: true
        };
      }
      r(result[1]);
    } catch (e) {
      j(e);
    }
  });

export const getServiceOverview = (range, result) =>
  new Promise(async (r, j) => {
    try {
      let arr = [];
      let sales = [];
      let sublabel = 'วันนี้';
      let increase = true;
      let percentage = '0.00%';
      let value = '0.00';
      let sort = 'date';
      switch (range) {
        case 'day':
          sort = 'date';
          break;
        default:
          sort = range;
          break;
      }
      const snap = await checkCollection('reports/services/all', [
        [
          'docDate',
          '>=',
          moment()
            .subtract(DATA_LENGTH, range === 'quarter' ? 'Q' : range)
            .format('YYYY-MM-DD')
        ]
      ]);
      if (snap) {
        snap.forEach(doc => {
          let item = {
            date: doc.data().docDate,
            week: moment(doc.data().docDate, 'YYYY-MM-DD').week(),
            month: moment(doc.data().docDate, 'YYYY-MM-DD').month(),
            quarter: moment(doc.data().docDate, 'YYYY-MM-DD').quarter(),
            year: moment(doc.data().docDate, 'YYYY-MM-DD').year(),
            saleNo: doc.data().saleNo,
            netPrice: doc.data().netPrice
          };
          //  showLog(item);
          arr.push(item);
        });
        arr = distinctArr(arr, [sort], ['netPrice']);
        sales = sortArr(arr, sort).map(l => ({
          [sort]: l[sort],
          netPrice: l.netPrice
        }));
        sales = sales.slice(-7);
        // sublabel, increase, percentage, value
        switch (range) {
          case 'day':
            sublabel = moment(sales[sales.length - 1].docDate).format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${sales[sales.length - 1][sort]}`;
            break;
          case 'month':
            sublabel = `เดือน ${moment()
              .month(sales[sales.length - 1][sort])
              .format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${sales[sales.length - 1][sort]}`;
            break;
          case 'year':
            sublabel = `ปี ${sales[sales.length - 1][sort]}`;
            break;

          default:
            break;
        }
        if (sales.length > 1) {
          increase = sales[sales.length - 1].netPrice > sales[sales.length - 2].netPrice;
          percentage = numeral(
            (sales[sales.length - 1].netPrice - sales[sales.length - 2].netPrice) / sales[sales.length - 1].netPrice
          ).format('0.00%');
          value = numeral(sales[sales.length - 1].netPrice).format('0,0');
        } else {
          value = numeral(sales[0].netPrice).format('0,0');
        }
        result[2] = {
          ...result[2],
          sublabel,
          value,
          percentage,
          increase,
          datasets: [
            {
              ...result[2].datasets[0],
              data: sales.map(l => l.netPrice)
            }
          ]
        };
      } else {
        switch (range) {
          case 'day':
            sublabel = moment().subtract(DATA_LENGTH, range).format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${moment().subtract(DATA_LENGTH, range).week()}`;
            break;
          case 'month':
            sublabel = `เดือน ${moment()
              .month(moment().subtract(DATA_LENGTH, range).format('MMM yy'))
              .format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${moment().subtract(DATA_LENGTH, range).quarter()}`;
            break;
          case 'year':
            sublabel = `ปี ${moment().subtract(DATA_LENGTH, range).year()}`;
            break;

          default:
            break;
        }
        result[2] = {
          ...result[2],
          sublabel,
          value: '0.00',
          percentage: '0.00%',
          increase: true
        };
      }
      r(result[2]);
    } catch (e) {
      j(e);
    }
  });
