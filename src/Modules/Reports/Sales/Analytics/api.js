import { getMonths } from 'functions';
import { getDates } from 'functions';
import { distinctElement, showLog, sortArr, distinctArr } from 'functions';
import { store } from 'App';
import moment from 'moment';
import colors from 'utils/colors';
import { Numb } from 'functions';

const pieColors = ['primary', 'success', 'salmon', 'warning'];

export const initSessionsData = {
  labels: ['09:00 PM', '10:00 PM', '11:00 PM', '12:00 PM', '13:00 PM', '14:00 PM', '15:00 PM', '16:00 PM', '17:00 PM'],
  datasets: [
    {
      label: 'Today',
      fill: 'start',
      data: [5, 5, 10, 30, 10, 42, 5, 15, 5],
      backgroundColor: colors.primary.toRGBA(0.1),
      borderColor: colors.primary.toRGBA(1),
      pointBackgroundColor: colors.white.toHex(),
      pointHoverBackgroundColor: colors.primary.toRGBA(1),
      borderWidth: 1.5
    },
    {
      label: 'Yesterday',
      fill: 'start',
      data: ['', 23, 5, 10, 5, 5, 30, 2, 10],
      backgroundColor: colors.salmon.toRGBA(0.1),
      borderColor: colors.salmon.toRGBA(1),
      pointBackgroundColor: colors.white.toHex(),
      pointHoverBackgroundColor: colors.salmon.toRGBA(1),
      borderDash: [5, 5],
      borderWidth: 1.5,
      pointRadius: 0,
      pointBorderColor: colors.salmon.toRGBA(1)
    }
  ]
};

export const initDuration = [
  // moment().subtract(10, 'years').format('YYYY-MM-DD'),
  moment().startOf('week').format('YYYY-MM-DD'),
  moment().format('YYYY-MM-DD')
];

export const _getMonthsToBuy = arr => {
  let mtb = [];
  arr.map(it => {
    if (it.whenToBuyRange) {
      mtb = [...mtb, ...it.whenToBuyRange.months];
    }
    return it;
  });
  let result = distinctElement(mtb);
  return result;
};

export const _getCustomersByMonths = (arr, mtb) => {
  let cbm = [];
  arr.map(it => {
    if (it.created) {
      cbm = [...cbm, moment(it.created).format('YYYY-MM')];
    }
    return it;
  });
  showLog({ cbm });
  let cArr = distinctElement(cbm);
  let result = mtb.map((it, n) => {
    let cId = cArr.findIndex(l => l.name === it.name);
    return {
      name: it.name,
      count: cId > -1 ? cArr[cId].count : 0
    };
  });
  return result;
};

const getSmallStatsArr = (arr, branchCode) => {
  if (arr.length === 0) {
    return [];
  }
  let dArr = arr.filter(l => l.branchCode === branchCode);
  // Get range
  let smArr = [];
  let tsArr = dArr.map(l => {
    smArr.push({
      ...l,
      monthCreated: moment(l.created).format('YYYY-MM'),
      dateCreated: l.date || moment(l.created).format('YYYY-MM-DD')
    });
    return l.created;
  });
  let maxTS = Math.max(...tsArr);
  let minTS = Math.min(...tsArr);
  const range = Math.abs(moment(maxTS).diff(moment(minTS), 'days'));
  // Get arr.
  let result = sortArr(
    distinctArr(smArr, range > 60 ? ['monthCreated'] : ['dateCreated'], ['qty']),
    range > 60 ? 'monthCreated' : 'dateCreated'
  );
  result = result.slice(0, 5);
  showLog({ dArr, smArr, range, result });
  return result;
};

export const _getSmallStatsData = ({ dArr, branch, duration, zone }) => {
  // {
  //     label: 'Users',
  //     value: '2,390',
  //     percentage: '12.4%',
  //     increase: true,
  //     chartLabels: [null, null, null, null, null],
  //     decrease: false,
  //     datasets: [
  //       {
  //         label: 'Today',
  //         fill: 'start',
  //         borderWidth: 1.5,
  //         backgroundColor: colors.primary.toRGBA(0.1),
  //         borderColor: colors.primary.toRGBA(),
  //         data: [9, 3, 3, 9, 9],
  //       },
  //     ],
  //   }
  let smArr = zone.slice(0, 4);
  const { branches } = store.getState().data;
  showLog({ dArr, branch, duration, zone });
  return smArr.map((sm, n) => {
    const smData = getSmallStatsArr(dArr, sm.branchCode);
    let percentage = '0.00';
    let increase = undefined;
    let decrease = undefined;
    let data = [];
    if (smData.length > 1) {
      percentage = ((smData[smData.length - 1].qty / smData[smData.length - 2].qty) * 100).toFixed(2);
      increase =
        smData[smData.length - 1].qty === smData[smData.length - 2].qty
          ? undefined
          : smData[smData.length - 1].qty > smData[smData.length - 2].qty;
      decrease = !increase;
      data = smData.map(l => l.qty);
    }

    return {
      label: sm.branchCode ? branches[sm.branchCode].branchName : 'ไม่ระบุ',
      value: sm.qty,
      percentage,
      increase,
      chartLabels: Array.from(new Array(data.length), (_, i) => null),
      decrease,
      datasets: [
        {
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: colors[pieColors[n]].toRGBA(0.1),
          borderColor: colors[pieColors[n]].toRGBA(),
          data
        }
      ],
      variantation: '2'
    };
  });
};

export const getChartData = ({ dArr, branch, duration }) => {
  showLog({ dArr, branch, duration });
  if (branch !== 'all') {
    dArr = dArr.filter(
      l =>
        l.branchCode === branch &&
        moment(l.date, 'YYYY-MM-DD').isSameOrAfter(moment(duration[0], 'YYYY-MM-DD')) &&
        moment(l.date, 'YYYY-MM-DD').isSameOrBefore(moment(duration[1], 'YYYY-MM-DD'))
    );
  } else {
    dArr = dArr.filter(
      l =>
        moment(l.date, 'YYYY-MM-DD').isSameOrAfter(moment(duration[0], 'YYYY-MM-DD')) &&
        moment(l.date, 'YYYY-MM-DD').isSameOrBefore(moment(duration[1], 'YYYY-MM-DD'))
    );
  }
  let saleItems = [];
  dArr = dArr.map(l => {
    if (l.items) {
      let mItems = l.items.map(it => ({
        ...it,
        salesPerson: l.salesPerson,
        date: it.saleDate,
        month: moment(it.saleDate, 'YYYY-MM-DD').format('MMM YYYY')
      }));
      saleItems = saleItems.concat(mItems);
    }
    return {
      ...l,
      qty: 1,
      month: moment(l.date, 'YYYY-MM-DD').format('MMM YYYY')
    };
  });

  // saleModels
  let saleModels = sortArr(
    distinctArr(saleItems, ['productCode'], ['qty']).map(l => ({
      productCode: l.productCode,
      productName: l.productName,
      isEquipment: l.isEquipment || !(l?.vehicleType && l.vehicleType.startsWith('รถ')),
      vehicleType:
        typeof l.vehicleType !== 'undefined'
          ? l.vehicleType === '0'
            ? 'รถแทรคเตอร์'
            : l.vehicleType
          : l?.productType || 'อุปกรณ์ต่อพ่วง',
      qty: l.qty
    })),
    '-qty'
  ).filter(l => l.productCode);
  let totalSaleModels = saleModels.reduce((sum, elem) => sum + elem.qty, 0);
  saleModels = saleModels.map((it, n) => {
    let percentage = ((it.qty / totalSaleModels) * 100).toFixed(2);
    return {
      ...it,
      percentage,
      pieData: {
        datasets: [
          {
            hoverBorderColor: '#fff',
            data: [percentage, 100 - Numb(percentage)],
            backgroundColor: [colors[pieColors[n % 4]].toRGBA(0.9), colors.athensGray.toRGBA(0.8)]
          }
        ],
        labels: ['Label 1', 'Label 2']
      }
    };
  });

  // saleType
  let saleType = sortArr(
    distinctArr(dArr, ['saleType'], ['qty']).map(l => ({
      saleType: l.saleType,
      qty: l.qty
    })),
    '-qty'
  ).filter(l => l.saleType);
  let totalSaleTypes = saleType.reduce((sum, elem) => sum + elem.qty, 0);
  saleType = saleType.map(st => ({
    ...st,
    percentage: ((st.qty / totalSaleTypes) * 100).toFixed(2)
  }));

  // vehicleType
  let vehicleType = saleItems.map(l => ({
    vehicleType:
      typeof l.vehicleType !== 'undefined'
        ? l.vehicleType === '0'
          ? 'รถแทรคเตอร์'
          : l.vehicleType
        : l?.productType || 'อุปกรณ์ต่อพ่วง',
    qty: l.qty
  }));
  vehicleType = sortArr(distinctArr(vehicleType, ['vehicleType'], ['qty']), '-qty').filter(l => l.vehicleType);
  let totalVehicleTypes = vehicleType.reduce((sum, elem) => sum + elem.qty, 0);
  vehicleType = vehicleType.map(st => ({
    ...st,
    percentage: ((st.qty / totalVehicleTypes) * 100).toFixed(2)
  }));

  // salesPerson
  let salesPerson = [];
  saleItems.map(si => {
    if (si.salesPerson) {
      let sales = si.salesPerson;
      let salesPersonArr = Array.isArray(si.salesPerson) ? si.salesPerson : si.salesPerson.split(',');
      sales = salesPersonArr.map(sp => ({
        title: sp,
        value: si.qty,
        productCode: si.productCode,
        productName: si.productName,
        vehicleType:
          typeof si.vehicleType !== 'undefined'
            ? si.vehicleType === '0'
              ? 'รถแทรคเตอร์'
              : si.vehicleType
            : si?.productType || 'อุปกรณ์ต่อพ่วง'
      }));
      salesPerson = salesPerson.concat(sales);
    }
    return si;
  });
  salesPerson = sortArr(
    distinctArr(
      salesPerson.filter(l => l?.vehicleType && l.vehicleType.startsWith('รถ')),
      ['title'],
      ['value']
    ),
    '-value'
  );

  // zone
  let zone = sortArr(distinctArr(dArr, ['branchCode'], ['qty']), '-qty');
  const zoneSum = zone.reduce((sum, elem) => sum + elem.qty, 0);
  zone = zone.map(it => ({
    ...it,
    percentage: ((it.qty / zoneSum) * 100).toFixed(2)
  }));

  // sessionsData
  let dateLabels = getDates(duration[0], duration[1], 'YYYY-MM-DD').slice(-66);
  let monthLabels = getMonths(duration[0], duration[1], 'YYYY-MM-DD', 'MMM YYYY').slice(-12);
  let dateSesstions = sortArr(
    distinctArr(
      saleItems.filter(l => l?.vehicleType && l.vehicleType.startsWith('รถ')),
      ['date'],
      ['qty']
    ).map(l => ({
      date: l.date,
      qty: l.qty
    })),
    'date'
  );
  let monthSesstions = sortArr(
    distinctArr(
      saleItems.filter(l => l?.vehicleType && l.vehicleType.startsWith('รถ')),
      ['month'],
      ['qty']
    ).map(l => ({
      month: l.month,
      qty: l.qty
    })),
    'month'
  );
  let sessionData = [];
  if (dateLabels.length > 60) {
    sessionData = monthLabels.map(ml => {
      let mId = monthSesstions.findIndex(mt => mt.month === ml);
      return { label: ml, value: mId > -1 ? monthSesstions[mId].qty : 0 };
    });
  } else {
    sessionData = dateLabels.map(ml => {
      let mId = dateSesstions.findIndex(mt => mt.date === ml);
      return {
        label: moment(ml, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        value: mId > -1 ? dateSesstions[mId].qty : 0
      };
    });
  }
  const sessionsData = {
    labels: sessionData.map(l => l.label),
    datasets: [
      {
        label: 'ยอดขาย (คัน)',
        fill: 'start',
        data: sessionData.map(l => l.value),
        backgroundColor: colors.primary.toRGBA(0.1),
        borderColor: colors.primary.toRGBA(1),
        pointBackgroundColor: colors.white.toHex(),
        pointHoverBackgroundColor: colors.primary.toRGBA(1),
        borderWidth: 1.5
      }
    ]
  };

  // smallStatsData
  let smallStatsData = _getSmallStatsData({
    dArr,
    branch,
    duration,
    zone
  });

  return {
    saleArr: dArr,
    saleModels,
    salesPerson,
    vehicleType,
    saleType,
    zone,
    sessionsData,
    smallStatsData,
    saleItems
  };
};
