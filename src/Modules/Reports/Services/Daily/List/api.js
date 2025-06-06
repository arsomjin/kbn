import React from 'react';
import numeral from 'numeral';
import { Numb } from 'functions';
import { isMobile } from 'react-device-detect';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center',
    ...(!isMobile && { fixed: 'left' })
  },
  {
    title: 'วันที่ปิดงาน',
    dataIndex: 'recordedDate',
    align: 'center',
    ...(!isMobile && { fixed: 'left' })
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer',
    ...(!isMobile && { fixed: 'left' })
  },
  {
    title: 'เลขที่ใบแจ้งบริการ',
    dataIndex: 'serviceNo',
    align: 'center',
    width: 140
  },
  {
    title: 'ลักษณะงานที่ทำ',
    dataIndex: 'cause',
    width: 240
  },
  {
    title: 'รุ่น',
    dataIndex: 'model',
    width: 120,
    align: 'center'
  },
  {
    title: 'รายการ',
    children: [
      {
        title: 'เบิก',
        dataIndex: 'advance',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'คืน',
        dataIndex: 'returnTotal',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ตรวจเช็คตามระยะ',
    children: [
      {
        title: 'ค่าแรง',
        dataIndex: 'amtWage',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าขนส่ง',
        dataIndex: 'amtFreight',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'อื่นๆ',
        dataIndex: 'amtOther',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าอะไหล่',
        children: [
          {
            title: 'ยอดเต็ม',
            dataIndex: 'totalPart',
            width: 80,
            align: 'center',
            render: text => <div>{numeral(text).format('0,0.00')}</div>
          },
          {
            title: 'ส่วนลด',
            dataIndex: 'discountPart',
            width: 80,
            align: 'center',
            render: text => <div>{numeral(text).format('0,0.00')}</div>
          },
          {
            title: 'คงเหลือ',
            dataIndex: 'amtPart',
            width: 80,
            align: 'center',
            render: text => <div>{numeral(text).format('0,0.00')}</div>
          }
        ]
      },
      {
        title: 'ค่าน้ำมัน',
        children: [
          {
            title: 'ยอดเต็ม',
            dataIndex: 'totalOil',
            width: 80,
            align: 'center',
            render: text => <div>{numeral(text).format('0,0.00')}</div>
          },
          {
            title: 'ส่วนลด',
            dataIndex: 'discountOil',
            width: 80,
            align: 'center',
            render: text => <div>{numeral(text).format('0,0.00')}</div>
          },
          {
            title: 'คงเหลือ',
            dataIndex: 'amtOil',
            width: 80,
            align: 'center',
            render: text => <div>{numeral(text).format('0,0.00')}</div>
          }
        ]
      }
    ]
  },
  {
    title: 'ยอดรวม',
    width: 80,
    align: 'center',
    render: (text, record) => (
      <div className="text-danger">{numeral(Number(record.amtOil) + Numb(record.amtPart)).format('0,0.00')}</div>
    )
  },
  {
    title: 'น้ำมันเครื่อง',
    children: [
      {
        title: 'CF4 6 ลิตร',
        dataIndex: 'CF4_6',
        width: 80,
        align: 'center'
      },
      {
        title: 'CF4 3 ลิตร',
        dataIndex: 'CF4_3',
        width: 80,
        align: 'center'
      },
      {
        title: 'UDT 18 ลิตร',
        dataIndex: 'UDT_18',
        width: 80,
        align: 'center'
      },
      {
        title: 'UDT 6 ลิตร',
        dataIndex: 'UDT_6',
        width: 80,
        align: 'center'
      }
    ]
  },
  {
    title: 'คูปองส่วนลด',
    children: [
      {
        title: '5%',
        dataIndex: 'dis5',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: '10%',
        dataIndex: 'dis10',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: '15%',
        dataIndex: 'dis15',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: '20%',
        dataIndex: 'dis20',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: '30%',
        dataIndex: 'dis30',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: '100%',
        dataIndex: 'dis100',
        width: 80,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'เปรียบเทียบยอดเงิน',
    children: [
      {
        title: 'KADS',
        // dataIndex: 'cash',
        width: 80,
        align: 'center',
        render: text => <div className="text-danger">n/a</div>
      },
      {
        title: 'ปิด',
        dataIndex: 'totalClose',
        width: 80,
        align: 'center',
        render: text => <div className="text-danger">{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'การรับเงิน',
    children: [
      {
        title: 'เงินสด',
        dataIndex: 'cash',
        width: 80,
        align: 'center',
        render: text => <div className="text-danger">{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'เงินโอน',
        dataIndex: 'moneyTransfer',
        width: 80,
        align: 'center',
        render: text => <div className="text-danger">{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ช่างบริการ',
    dataIndex: 'technicianId',
    align: 'center',
    width: 180
  },
  {
    title: 'ทะเบียน',
    dataIndex: 'vehicleRegNumber',
    align: 'center',
    width: 120
  },
  {
    title: 'สถานที่บริการ',
    children: [
      {
        title: 'ตำบล',
        width: 120,
        align: 'center',
        render: (text, record) => <div>{!!record?.serviceAddress ? record.serviceAddress.tambol : null}</div>
      },
      {
        title: 'อำเภอ',
        width: 120,
        align: 'center',
        render: (text, record) => <div>{!!record?.serviceAddress ? record.serviceAddress.amphoe : null}</div>
      },
      {
        title: 'จังหวัด',
        width: 120,
        align: 'center',
        render: (text, record) => <div>{!!record?.serviceAddress ? record.serviceAddress.province : null}</div>
      }
    ]
  }
];

export const serviceDailySumKeys = [
  'advance',
  'returnTotal',
  'amtWage',
  'amtFreight',
  'amtOther',
  'totalPart',
  'discountPart',
  'amtPart',
  'totalOil',
  'discountOil',
  'amtOil',
  'total',
  'CF4_6',
  'CF4_3',
  'UDT_18',
  'UDT_6',
  'dis5',
  'dis10',
  'dis15',
  'dis20',
  'dis30',
  'dis100',
  'kads',
  'totalClose',
  'cash',
  'moneyTransfer'
];

export const formatServiceDailyList = dataArr =>
  new Promise(async (r, j) => {
    if (!Array.isArray(dataArr) || (!!dataArr && dataArr.length === 0)) {
      r([]);
    }
    try {
      let result = dataArr.map(it => {
        let dis5 = it.discountCouponPercent === 5 ? 1 : null;
        let dis10 = it.discountCouponPercent === 10 ? 1 : null;
        let dis15 = it.discountCouponPercent === 15 ? 1 : null;
        let dis20 = it.discountCouponPercent === 20 ? 1 : null;
        let dis30 = it.discountCouponPercent === 30 ? 1 : null;
        let dis100 = it.discountCouponPercent === 100 ? 1 : null;

        let totalPart = Numb(it.amtPart) + Numb(it.discountPart);
        let totalOil = Numb(it.amtOil) + Numb(it.discountOil);
        let totalClose = it.total;

        // TODO: Match total from KADS. { kads }
        return {
          ...it,
          dis5,
          dis10,
          dis15,
          dis20,
          dis30,
          dis100,
          totalPart,
          totalOil,
          totalClose
        };
      });
      r(result);
    } catch (e) {
      j(e);
    }
  });
