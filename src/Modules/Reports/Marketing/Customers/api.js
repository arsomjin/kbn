import { distinctElement, showLog, sortArr, distinctArr } from 'functions';
import moment from 'moment';
import colors from 'utils/colors';
import { store } from 'App';
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
  moment().subtract(10, 'years').format('YYYY-MM-DD'),
  //   moment().startOf('week').format('YYYY-MM-DD'),
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
  let dArr = arr.filter(l => l.branch === branchCode);
  // Get range
  let smArr = [];
  let tsArr = dArr.map(l => {
    smArr.push({
      ...l,
      monthCreated: moment(l.created).format('YYYY-MM'),
      dateCreated: l.inputDate || moment(l.created).format('YYYY-MM-DD')
    });
    return l.created;
  });
  let maxTS = Math.max(...tsArr);
  let minTS = Math.min(...tsArr);
  const range = Math.abs(moment(maxTS).diff(moment(minTS), 'days'));
  // Get arr.
  let result = sortArr(
    distinctArr(smArr, range > 60 ? ['monthCreated'] : ['dateCreated'], ['counter']),
    range > 60 ? 'monthCreated' : 'dateCreated'
  );
  result = result.slice(0, 5);
  showLog({ dArr, smArr, range, result });
  return result;
};

export const _getSmallStatsData = ({ dArr, zone, branch, duration }) => {
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

  return smArr.map((sm, n) => {
    const smData = getSmallStatsArr(dArr, sm.branch);
    let percentage = '0.00';
    let increase = undefined;
    let decrease = undefined;
    let data = [];
    if (smData.length > 1) {
      percentage = ((smData[smData.length - 1].counter / smData[smData.length - 2].counter) * 100).toFixed(2);
      increase =
        smData[smData.length - 1].counter === smData[smData.length - 2].counter
          ? undefined
          : smData[smData.length - 1].counter > smData[smData.length - 2].counter;
      decrease = !increase;
      data = smData.map(l => l.counter);
    }
    let label = sm.branch && sm.branch !== 'ไม่ระบุ' ? branches[sm.branch].branchName : 'ไม่ระบุ';
    return {
      label,
      branch: label,
      branchCode: sm.branch ? sm.branch : 'ไม่ระบุ',
      value: sm.counter,
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
  showLog({ dArr });
  if (branch !== 'all') {
    dArr = dArr.filter(
      l =>
        l.branch === branch &&
        moment(l.inputDate).isSameOrAfter(duration[0]) &&
        moment(l.inputDate).isSameOrBefore(duration[1])
    );
  } else {
    dArr = dArr.filter(
      l => moment(l.inputDate).isSameOrAfter(duration[0]) && moment(l.inputDate).isSameOrBefore(duration[1])
    );
  }
  let plants = sortArr(distinctArr(dArr, ['plants'], ['counter']), '-counter');
  let hasMKTData = dArr.filter(l => l.career && l.plants);
  let whenToBuy = sortArr(distinctArr(dArr, ['whenToBuy'], ['counter']), '-counter').filter(l => l.whenToBuy);
  let ownedModel = sortArr(distinctArr(dArr, ['ownedModel'], ['counter']), '-counter').filter(l => l.ownedModel);
  let interestedModel = sortArr(distinctArr(dArr, ['interestedModel'], ['counter']), '-counter').filter(
    l => l.interestedModel
  );
  let totalInterestedModel = interestedModel.reduce((sum, elem) => sum + elem.counter, 0);
  interestedModel = interestedModel.map((it, n) => {
    let percentage = ((it.counter / totalInterestedModel) * 100).toFixed(2);
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
  // ).filter((l) => l.interestedModel);
  let referralData = sortArr(distinctArr(dArr, ['agent'], ['counter']), '-counter');
  let zone = sortArr(distinctArr(dArr, ['branch'], ['counter']), '-counter');
  const zoneSum = zone.reduce((sum, elem) => sum + elem.counter, 0);
  zone = zone.map(it => ({
    ...it,
    percentage: ((it.counter / zoneSum) * 100).toFixed(2)
  }));
  let monthsToBuy = _getMonthsToBuy(dArr);
  let customersByMonth = _getCustomersByMonths(dArr, monthsToBuy);
  let smallStatsData = _getSmallStatsData({ dArr, branch, duration, zone });
  let cmId = monthsToBuy.findIndex(l => l.name === moment().format('YYYY-MM'));
  let fmId = cmId > -1 ? (cmId - 3 > 0 ? cmId - 3 : 0) : 0;
  const sessionsData = {
    labels: monthsToBuy.slice(fmId, 12 + fmId).map(l => moment(l.name, 'YYYY-MM').format('MMM YY')),
    datasets: [
      {
        label: 'คาดว่าจะซื้อ',
        fill: 'start',
        data: monthsToBuy.slice(fmId, 12 + fmId).map(l => l.count),
        // data: [5, 5, 10, 30, 10, 42, 5, 15, 5],
        backgroundColor: colors.primary.toRGBA(0.1),
        borderColor: colors.primary.toRGBA(1),
        pointBackgroundColor: colors.white.toHex(),
        pointHoverBackgroundColor: colors.primary.toRGBA(1),
        borderWidth: 1.5
      },
      {
        label: 'ลูกค้าที่เก็บข้อมูล',
        fill: 'start',
        data: customersByMonth.slice(fmId, cmId + 1).map(l => l.count),
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

  return {
    plants,
    hasMKTData,
    whenToBuy,
    ownedModel,
    interestedModel,
    referralData,
    zone,
    monthsToBuy,
    sessionsData,
    customersByMonth,
    smallStatsData
  };
};
