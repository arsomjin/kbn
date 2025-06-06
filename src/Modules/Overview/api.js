import { checkCollection } from 'firebase/api';
import { distinctArr } from 'functions';
import { sortArr } from 'functions';
import { Numb } from 'functions';
import { showLog } from 'functions';
import moment from 'moment';
import numeral from 'numeral';
import { DATA_LENGTH, DefaultProps } from './initValues';

export const getOverviewDataFromRange = range =>
  new Promise(async (r, j) => {
    try {
      let smallStats = DefaultProps.smallStats.map(l => l);
      smallStats[0] = await getSaleOverview(range, smallStats);
      smallStats[1] = await getPartOverview(range, smallStats);
      smallStats[2] = await getServiceOverview(range, smallStats);
      //  showLog({ smallStats });
      let bySections = DefaultProps.bySections;
      bySections.datasets[0].data = [Numb(smallStats[0].value), Numb(smallStats[1].value), Numb(smallStats[2].value)];
      let result = { smallStats, bySections };
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
        ],
        ['date', '<', '2555-01-01']
      ]);
      if (snap) {
        snap.forEach(doc => {
          if (doc.data()?.date && !doc.data().date.startsWith('Invalid')) {
            let item = {
              date: doc.data().date,
              week: moment(doc.data().date, 'YYYY-MM-DD').week(),
              month: moment(doc.data().date, 'YYYY-MM-DD').format('MMM YYYY'),
              quarter: moment(doc.data().date, 'YYYY-MM-DD').format('Q, YYYY'),
              year: moment(doc.data().date, 'YYYY-MM-DD').year(),
              saleNo: doc.data().saleNo,
              amtFull: doc.data().amtFull
            };
            // showLog(item);
            arr.push(item);
          }
        });
        arr = distinctArr(arr, [sort], ['amtFull']);
        sales = sortArr(arr, sort).map(l => ({
          [sort]: l[sort],
          amtFull: l.amtFull
        }));
        showLog({ range, result, arr, sales });
        sales = sales.slice(-7);
        // sublabel, increase, percentage, value
        switch (range) {
          case 'day':
            sublabel = moment(sales[sales.length - 1].date, 'YYYY-MM-DD').format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${sales[sales.length - 1][sort]}`;
            break;
          case 'month':
            sublabel = `เดือน ${sales[sales.length - 1][sort]}`;
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
            sublabel = `${moment().subtract(DATA_LENGTH, range).format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${moment().subtract(DATA_LENGTH, range).format('Q, YYYY')}`;
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
        ],
        ['saleDate', '<', '2555-01-01']
      ]);
      if (snap) {
        snap.forEach(doc => {
          // showLog({ saleDate: doc.data()?.saleDate });
          if (doc.data()?.saleDate && !doc.data().saleDate.startsWith('Invalid')) {
            let item = {
              date: doc.data().saleDate,
              week: moment(doc.data().saleDate, 'YYYY-MM-DD').week(),
              month: moment(doc.data().saleDate, 'YYYY-MM-DD').format('MMM YYYY'),
              quarter: moment(doc.data().saleDate, 'YYYY-MM-DD').format('Q, YYYY'),
              year: moment(doc.data().saleDate, 'YYYY-MM-DD').year(),
              saleNo: doc.data().saleNo,
              netTotal: doc.data().netTotal
            };
            // showLog(item);
            arr.push(item);
          }
        });
        arr = distinctArr(arr, [sort], ['netTotal']);
        sales = sortArr(arr, sort).map(l => ({
          [sort]: l[sort],
          netTotal: l.netTotal
        }));
        sales = sales.slice(-7);
        // sublabel, increase, percentage, value
        // showLog({ sales });
        switch (range) {
          case 'day':
            sublabel = moment(sales[sales.length - 1].date, 'YYYY-MM-DD').format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${sales[sales.length - 1][sort]}`;
            break;
          case 'month':
            sublabel = `เดือน ${sales[sales.length - 1][sort]}`;
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
            sublabel = `เดือน ${moment().subtract(DATA_LENGTH, range).format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${moment().subtract(DATA_LENGTH, range).format('Q, YYYY')}`;
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
        ],
        ['docDate', '<', '2555-01-01']
      ]);
      if (snap) {
        snap.forEach(doc => {
          let item = {
            date: doc.data().docDate,
            week: moment(doc.data().docDate, 'YYYY-MM-DD').week(),
            month: moment(doc.data().docDate, 'YYYY-MM-DD').format('MMM YYYY'),
            quarter: moment(doc.data().docDate, 'YYYY-MM-DD').format('Q, YYYY'),
            year: moment(doc.data().docDate, 'YYYY-MM-DD').year(),
            saleNo: doc.data().saleNo,
            netPrice: doc.data().netPrice
          };
          // showLog(item);
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
            sublabel = moment(sales[sales.length - 1].date, 'YYYY-MM-DD').format('ll');
            break;
          case 'week':
            sublabel = `สัปดาห์ที่ ${sales[sales.length - 1][sort]}`;
            break;
          case 'month':
            sublabel = `เดือน ${sales[sales.length - 1][sort]}`;
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
            sublabel = `เดือน ${moment().subtract(DATA_LENGTH, range).format('MMM YYYY')}`;
            break;
          case 'quarter':
            sublabel = `ไตรมาส ${moment().subtract(DATA_LENGTH, range).format('Q, YYYY')}`;
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
