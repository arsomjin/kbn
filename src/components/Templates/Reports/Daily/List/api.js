import React from 'react';
import { distinctArr } from 'functions';
import { getModelFromName } from 'Modules/Utils';
import numeral from 'numeral';
import { Numb } from 'functions';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่ปิดงาน',
    dataIndex: 'recordedDate',
    align: 'center'
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer'
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
        align: 'center'
      },
      {
        title: 'คืน',
        dataIndex: 'returnTotal',
        width: 80,
        align: 'center'
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
        align: 'center'
      },
      {
        title: 'ค่าขนส่ง',
        dataIndex: 'amtFreight',
        width: 80,
        align: 'center'
      },
      {
        title: 'อื่นๆ',
        dataIndex: 'amtOther',
        width: 80,
        align: 'center'
      },
      {
        title: 'ค่าอะไหล่',
        children: [
          {
            title: 'ยอดเต็ม',
            width: 80,
            align: 'center',
            render: (text, record) => <div>{Number(record.amtPart) + Numb(record.discountPart)}</div>
          },
          {
            title: 'ส่วนลด',
            dataIndex: 'discountPart',
            width: 80,
            align: 'center'
          },
          {
            title: 'คงเหลือ',
            dataIndex: 'amtPart',
            width: 80,
            align: 'center'
          }
        ]
      },
      {
        title: 'ค่าน้ำมัน',
        children: [
          {
            title: 'ยอดเต็ม',
            width: 80,
            align: 'center',
            render: (text, record) => <div>{Number(record.amtOil) + Numb(record.discountOil)}</div>
          },
          {
            title: 'ส่วนลด',
            dataIndex: 'discountOil',
            width: 80,
            align: 'center'
          },
          {
            title: 'คงเหลือ',
            dataIndex: 'amtOil',
            width: 80,
            align: 'center'
          }
        ]
      }
    ]
  },
  {
    title: 'ยอดรวม',
    width: 80,
    align: 'center',
    render: (text, record) => <div className="text-danger">{Number(record.amtOil) + Numb(record.amtPart)}</div>
  }
];

export const formatServicesData = dataArr =>
  new Promise(async (r, j) => {
    try {
      // Get vehicleId.
      let allServices = [];
      let gColumns = [];
      let sKeys = [];
      let nData = dataArr.map((it, id) => {
        const { saleId, saleNo, date, customerId, items } = it;
        let productCode = '';
        let model = '';
        if (it?.giveaways && it.giveaways.length > 0) {
          it.giveaways.map(ga => {
            allServices.push({ ...ga, saleId, total: ga.total || 1 });
            return ga;
          });
        }
        (items || []).map(vi => {
          if (vi?.productCode) {
            productCode = `${productCode}${productCode ? ',' : ''}${vi.productCode}`;
          }
          if (vi?.productName) {
            model = getModelFromName(vi?.productName);
          }
          return vi;
        });
        return {
          saleId,
          date,
          customerId,
          saleNo,
          productCode,
          model,
          id,
          customer: `${it.prefix}${it.firstName} ${it.lastName || ''}`.trim()
        };
      });
      // Get giveaways data.
      // Create table data and columns.
      let dServices = distinctArr(allServices, ['name']).map(gn => gn.name);
      gColumns = dServices.map((ga, n) => {
        sKeys.push(ga);
        return {
          dataIndex: ga,
          title: ga,
          key: n,
          width: 80,
          align: 'center',
          align: 'center',
          render: text => <div className="text-right">{text ? numeral(text).format('0,0') : '-'}</div>
        };
      });
      nData = nData.map(md => {
        let gaArr = allServices.filter(l => l.saleId === md.saleId);
        if (gaArr.length > 1) {
          gaArr.map(gi => {
            md[gi.name] = gi.total;
            return gi;
          });
        }
        return md;
      });
      // showLog({ nData });
      let mData = (nData || []).map((it, i) => ({
        ...it,
        id: i,
        key: i
      }));
      // showLog({ mData, allServices, gColumns, sKeys });
      r({ mData, allServices, gColumns, sKeys });
    } catch (e) {
      j(e);
    }
  });
