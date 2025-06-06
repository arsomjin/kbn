export const InitBySectionData = {
  datasets: [
    {
      hoverBorderColor: '#ffffff',
      data: [68.3, 24.2, 7.5],
      backgroundColor: ['rgba(0,123,255,0.9)', 'rgba(0,123,255,0.5)', 'rgba(0,123,255,0.3)']
    }
  ],
  labels: ['รถและอุปกรณ์', 'อะไหล่', 'บริการ']
};

export const DefaultProps = {
  smallStats: [
    {
      label: 'งานขายรถ',
      value: '0.00',
      sublabel: null,
      percentage: '0.00%',
      increase: true,
      chartLabels: [null, null, null, null, null, null, null],
      datasets: [
        {
          label: 'วันนี้',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(0, 184, 216, 0.1)',
          borderColor: 'rgb(0, 184, 216)',
          data: [1, 2, 1, 3, 5, 4, 7]
        }
      ]
    },
    {
      label: 'งานขายอะไหล่',
      sublabel: null,
      value: '0.00',
      percentage: '0.00',
      increase: true,
      chartLabels: [null, null, null, null, null, null, null],
      datasets: [
        {
          label: 'วันนี้',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(23,198,113,0.1)',
          borderColor: 'rgb(23,198,113)',
          data: [1, 2, 3, 3, 3, 4, 4]
        }
      ]
    },
    {
      label: 'งานบริการ',
      sublabel: null,
      value: '0.00',
      percentage: '0.00%',
      increase: false,
      decrease: true,
      chartLabels: [null, null, null, null, null, null, null],
      datasets: [
        {
          label: 'วันนี้',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(255,180,0,0.1)',
          borderColor: 'rgb(255,180,0)',
          data: [2, 3, 3, 3, 4, 3, 3]
        }
      ]
    },
    {
      label: 'สินเชื่อ KBN',
      sublabel: null,
      value: '0.00',
      percentage: '0.00%',
      increase: false,
      decrease: true,
      chartLabels: [null, null, null, null, null, null, null],
      datasets: [
        {
          label: 'วันนี้',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(255,65,105,0.1)',
          borderColor: 'rgb(255,65,105)',
          data: [1, 7, 1, 3, 1, 4, 8]
        }
      ]
    },
    {
      label: 'คลังสินค้า',
      sublabel: null,
      value: '0.00',
      percentage: '0.00%',
      increase: false,
      decrease: true,
      chartLabels: [null, null, null, null, null, null, null],
      datasets: [
        {
          label: 'วันนี้',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgb(0,123,255,0.1)',
          borderColor: 'rgb(0,123,255)',
          data: [3, 2, 3, 2, 4, 5, 4]
        }
      ]
    }
  ],
  bySections: InitBySectionData
};

export const RANGES = {
  day: 'วัน',
  week: 'สัปดาห์',
  month: 'เดือน',
  quarter: 'ไตรมาส',
  year: 'ปี'
};
export const DATA_LENGTH = 10;

export const InitialData = {
  day: {
    ...DefaultProps,
    updated: false
  },
  week: {
    ...DefaultProps,
    updated: false
  },
  month: {
    ...DefaultProps,
    updated: false
  },
  quarter: {
    ...DefaultProps,
    updated: false
  },
  year: {
    ...DefaultProps,
    updated: false
  }
};
