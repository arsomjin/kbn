import React from 'react';
import { distinctArr } from 'functions';
import { getModelFromName } from 'Modules/Utils';
import numeral from 'numeral';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'เลขที่ใบขาย',
    dataIndex: 'saleNo',
    align: 'center'
  },
  {
    title: 'วันที่ออกรถ',
    dataIndex: 'date',
    align: 'center'
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer'
  },
  {
    title: 'รุ่นรถ',
    dataIndex: 'model',
    width: 220,
    align: 'center'
  }
  // {
  //   title: 'รุ่นรถ',
  //   dataIndex: 'productCode',
  // },
];

export const formatGiveawaysData = dataArr =>
  new Promise(async (r, j) => {
    try {
      // Get vehicleId.
      let allGiveaways = [];
      let gColumns = [];
      let sKeys = [];
      let nData = dataArr.map((it, id) => {
        const { saleId, saleNo, date, customerId, items } = it;
        let productCode = '';
        let model = '';
        if (it?.giveaways && it.giveaways.length > 0) {
          it.giveaways.map(ga => {
            allGiveaways.push({ ...ga, saleId, total: ga.total || 1 });
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
      let dGiveaways = distinctArr(allGiveaways, ['name']).map(gn => gn.name);
      gColumns = dGiveaways.map((ga, n) => {
        sKeys.push(ga);
        return {
          dataIndex: ga,
          title: ga,
          key: n,
          width: 100,
          align: 'center',
          render: text => <div className="text-right">{text ? numeral(text).format('0,0') : '-'}</div>
        };
      });
      nData = nData.map(md => {
        let gaArr = allGiveaways.filter(l => l.saleId === md.saleId);
        if (gaArr.length > 1) {
          gaArr.map(gi => {
            md[gi.name] = gi.total;
            return gi;
          });
        }
        return md;
      });
      let mData = (nData || []).map((it, i) => ({
        ...it,
        id: i,
        key: i
      }));
      // showLog({ mData, allGiveaways, gColumns, sKeys });
      r({ mData, allGiveaways, gColumns, sKeys });
    } catch (e) {
      j(e);
    }
  });
