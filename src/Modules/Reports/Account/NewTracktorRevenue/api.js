import React from 'react';
import { arrayForEach } from 'functions';
import numeral from 'numeral';
import { distinctArr } from 'functions';
import { getSearchData } from 'firebase/api';
import { FilterSnap } from 'data/Constant';
import { AllIncomeType } from 'data/Constant';
import { getModelFromName } from 'Modules/Utils';
import { dateToThai } from 'functions';
import { Numb } from 'functions';
import { getDoc } from 'firebase/api';
import { isMobile } from 'react-device-detect';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center',
    fixed: 'left',
    width: 20
  },
  {
    title: 'วันที่',
    dataIndex: 'date',
    align: 'center',
    render: text => <div className="text-primary">{dateToThai(text)}</div>,
    width: 100,
    ...(!isMobile && { fixed: 'left' })
  },
  {
    title: 'ชื่อ-นามสกุล ลูกค้า',
    dataIndex: 'customer',
    align: 'center',
    ...(!isMobile && { fixed: 'left' }),
    width: 220
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center',
    ...FilterSnap.branch,
    width: 120
  },
  {
    title: 'วดป. ลูกค้าออกรถ',
    dataIndex: 'purchaseDate',
    align: 'center',
    width: 100,
    render: text => <div>{!!text ? dateToThai(text) : ''}</div>
  },
  {
    title: 'รุ่นรถ',
    dataIndex: 'model',
    align: 'center',
    width: 280,
    ellipsis: true
  },
  {
    title: 'รายการ',
    dataIndex: 'item',
    width: 120,
    align: 'center'
  },
  {
    title: 'เลขที่บิล',
    dataIndex: 'billNo',
    align: 'center',
    width: 100
  },
  {
    title: 'รับเงินสุทธิ / วิธีการรับเงิน',
    children: [
      {
        title: <div className="text-center">รับเงินสุทธิ</div>,
        dataIndex: 'total',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: 'วิธีการรับเงิน',
        children: [
          {
            title: <div className="text-center">เงินสดประจำวัน</div>,
            dataIndex: 'cash',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          },
          {
            title: 'เงินฝากธนาคาร',
            children: [
              {
                title: <div className="text-center">จำนวนเงิน</div>,
                dataIndex: 'transferAmount',
                width: 120,
                align: 'right',
                render: text => {
                  return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
                }
              },
              {
                title: <div className="text-center">ธนาคาร</div>,
                dataIndex: 'bankName',
                width: 120,
                align: 'center'
              },
              {
                title: <div className="text-center">เลขที่บัญชี</div>,
                dataIndex: 'bankAcc',
                width: 140,
                align: 'center'
              },
              {
                title: <div className="text-center">ชื่อบัญชี</div>,
                dataIndex: 'accName',
                width: 220
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'รายการรับเงิน',
    children: [
      {
        title: <div className="text-center">รายได้ - ขายสินค้า</div>,
        children: [
          {
            title: <div className="text-center">สินค้าใหม่ - เงินสด</div>,
            dataIndex: 'new_cash',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          },
          {
            title: <div className="text-center">มือสอง / ขายตามสภาพ - เงินสด</div>,
            dataIndex: 'used_cash',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          },
          {
            title: <div className="text-center">ขายสินค้าผ่าน ธกส.</div>,
            dataIndex: 'baac_sale',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          }
        ]
      },
      {
        title: <div className="text-center">รายรับ - เงินจอง/มัดจำ</div>,
        dataIndex: 'amtReservation',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: <div className="text-center">รายรับ - เงินดาวน์เต็ม</div>,
        dataIndex: 'income_down',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: <div className="text-center">รายรับ - เงินงวดล่วงหน้าลิสซิ่ง</div>,
        dataIndex: 'amtSKLInstallment',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: <div className="text-center">รายรับ - ปิดงวดรถคันเก่า (นำมาตีเทิร์น)</div>,
        // dataIndex: 'amtTurnOverDifRefund',
        width: 120,
        align: 'right'
        // render: (text) => {
        //   return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        // },
      },
      {
        title: <div className="text-center">รายรับ - โครงการร้าน</div>,
        children: [
          {
            title: <div className="text-center">เงินดาวน์ - โครงการร้าน</div>,
            dataIndex: 'owe_kbn_down',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          },
          {
            title: <div className="text-center">ค่างวด - โครงการร้าน (ลูกหนี้โครงการร้าน)</div>,
            dataIndex: 'owe_kbn_installment',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          },
          {
            title: <div className="text-center">ค่าปรับล่าช้า</div>,
            dataIndex: 'owe_kbn_fines',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          }
        ]
      },
      {
        title: <div className="text-center">รายรับ - อื่นๆ</div>,
        children: [
          {
            title: <div className="text-center">รายรับ - ทำทะเบียน/พรบ.</div>,
            dataIndex: 'amtPlateAndInsurance',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          },
          {
            title: <div className="text-center">รายรับ - ภาษีทอง</div>,
            width: 120,
            align: 'right'
            // render: (text) => {
            //   return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            // },
          },
          {
            title: <div className="text-center">รายรับ อื่นๆ - เงินเกิน (กำไร)</div>,
            dataIndex: 'amtOther',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          }
        ]
      }
    ]
  },
  {
    title: 'รายการหักเงิน',
    children: [
      {
        title: <div className="text-center">ราคา - รถคันเก่าตีเทิร์น</div>,
        dataIndex: 'amtTurnOverVehicle',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: <div className="text-center">ส่วนลด ส่งเสริมการขาย (รายจ่าย)</div>,
        children: [
          {
            title: <div className="text-center">ส่วนลด KBN</div>,
            dataIndex: 'amtKBN',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          },
          {
            title: <div className="text-center">ส่วนลด SKC/SKL</div>,
            dataIndex: 'amtSKC',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          },
          {
            title: <div className="text-center">ส่วนลด ลูกค้าเก่า</div>,
            dataIndex: 'amtOldCustomer',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          },
          {
            title: <div className="text-center">ส่วนลด อื่นๆ (SKC)</div>,
            // dataIndex: 'deductOther',
            width: 120,
            align: 'right'
            // render: (text) => {
            //   return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            // },
          },
          {
            title: <div className="text-center">ส่วนลด แลกเปลี่ยนสินค้ามือสอง (MAX)</div>,
            dataIndex: 'amtMAX',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          }
        ]
      },
      {
        title: <div className="text-center">เงินจอง/มัดจำ</div>,
        dataIndex: 'income_reserve',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: <div className="text-center">ค่าแนะนำ</div>,
        dataIndex: 'amtRefer',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: <div className="text-center">ภาษีหัก ณ ที่จ่าย</div>,
        dataIndex: 'amtReferWHTax',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      },
      {
        title: <div className="text-center">รายการหัก อื่นๆ</div>,
        dataIndex: 'deductOther',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      }
    ]
  },
  {
    title: 'ลูกหนี้ ธกส. สกต.',
    dataIndex: 'amtBaacDebtor',
    width: 120,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'รายการค้างรับ',
    children: [
      {
        title: <div className="text-center">ค้างโครงการร้าน</div>,
        children: [
          {
            title: <div className="text-center">ค้างเงินดาวน์</div>,
            dataIndex: 'owe_kbn_down',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          },
          {
            title: <div className="text-center">ค้างค่างวด โครงการร้าน</div>,
            dataIndex: 'owe_kbn_installment',
            width: 120,
            align: 'right',
            render: text => {
              return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
            }
          }
        ]
      },
      {
        title: <div className="text-center">ค้างจ่ายค่าแนะนำ</div>,
        width: 120,
        align: 'right'
        // render: (text) => {
        //   return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        // },
      },
      {
        title: <div className="text-center">ค้างจ่ายคืนเงินส่วนต่างลูกค้า ตีเทิร์น/คืนเงินลูกค้า</div>,
        dataIndex: 'amtTurnOverDifRefund',
        width: 120,
        align: 'right',
        render: text => {
          return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        }
      }
    ]
  },
  {
    title: 'ผลทดสอบ',
    children: [
      {
        title: <div className="text-center">เดบิต รับเงิน-หักรายจ่าย</div>,
        width: 120,
        align: 'right'
        // render: (text) => {
        //   return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        // },
      },
      {
        title: <div className="text-center">เครดิต รายรับเงินสุทธิ</div>,
        width: 120,
        align: 'right'
        // render: (text) => {
        //   return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        // },
      },
      {
        title: <div className="text-center">สรุปผล เดบิต = เครดิต</div>,
        width: 120,
        align: 'right'
        // render: (text) => {
        //   return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
        // },
      }
    ]
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
    width: 120
  },
  {
    title: 'ค่าทำทะเบียน',
    dataIndex: 'registration_fee',
    width: 120,
    align: 'right',
    render: text => {
      return !text ? null : <div>{numeral(text).format('0,0.00')}</div>;
    }
  },
  {
    title: 'วันที่ส่งรถ',
    dataIndex: 'deliverDate',
    width: 120,
    align: 'center',
    render: text => <div>{!!text ? dateToThai(text) : ''}</div>
  }
];

const eStyle = {
  fill: { patternType: 'solid', fgColor: { rgb: 'FFCCEEFF' } },
  font: { bold: true }
};

const eColumns1 = columns.slice(0, 8).map(cl => ({
  title: cl.title,
  dataIndex: cl.dataIndex,
  width: { wpx: cl.width },
  style: eStyle
}));

const eColumns2 = [
  {
    title: 'รับเงินสุทธิ',
    dataIndex: 'total',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'เงินสดประจำวัน',
    dataIndex: 'cash',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'เงินฝากธนาคาร',
    dataIndex: 'transferAmount',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ธนาคาร',
    dataIndex: 'bankName',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'เลขที่บัญชี',
    dataIndex: 'bankAcc',
    width: { wpx: 140 },
    style: eStyle
  },
  {
    title: 'ชื่อบัญชี',
    dataIndex: 'accName',
    width: { wpx: 220 },
    style: eStyle
  },
  {
    title: 'สินค้าใหม่ - เงินสด',
    dataIndex: 'new_cash',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'มือสอง / ขายตามสภาพ - เงินสด',
    dataIndex: 'used_cash',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ขายสินค้าผ่าน ธกส.',
    dataIndex: 'baac_sale',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'รายรับ - เงินจอง/มัดจำ',
    dataIndex: 'amtReservation',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'รายรับ - เงินดาวน์เต็ม',
    dataIndex: 'income_down',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'รายรับ - เงินงวดล่วงหน้าลิสซิ่ง',
    dataIndex: 'amtSKLInstallment',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'เงินดาวน์ - โครงการร้าน',
    dataIndex: 'owe_kbn_down',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ค่างวด - โครงการร้าน (ลูกหนี้โครงการร้าน)',
    dataIndex: 'owe_kbn_installment',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ค่าปรับล่าช้า',
    dataIndex: 'owe_kbn_fines',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'รายรับ - ทำทะเบียน/พรบ.',
    dataIndex: 'amtPlateAndInsurance',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'รายรับ อื่นๆ - เงินเกิน (กำไร)',
    dataIndex: 'amtOther',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ราคา - รถคันเก่าตีเทิร์น',
    dataIndex: 'amtTurnOverVehicle',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ส่วนลด KBN',
    dataIndex: 'amtKBN',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ส่วนลด SKC/SKL',
    dataIndex: 'amtSKC',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ส่วนลด ลูกค้าเก่า',
    dataIndex: 'amtOldCustomer',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ส่วนลด แลกเปลี่ยนสินค้ามือสอง (MAX)',
    dataIndex: 'amtMAX',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'เงินจอง/มัดจำ',
    dataIndex: 'income_reserve',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ค่าแนะนำ',
    dataIndex: 'amtRefer',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ภาษีหัก ณ ที่จ่าย',
    dataIndex: 'amtReferWHTax',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'รายการหัก อื่นๆ',
    dataIndex: 'deductOther',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ลูกหนี้ ธกส. สกต.',
    dataIndex: 'amtBaacDebtor',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ค้างเงินดาวน์',
    dataIndex: 'owe_kbn_down',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ค้างค่างวด โครงการร้าน',
    dataIndex: 'owe_kbn_installment',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ค้างจ่ายคืนเงินส่วนต่างลูกค้า ตีเทิร์น/คืนเงินลูกค้า',
    dataIndex: 'amtTurnOverDifRefund',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'ค่าทำทะเบียน',
    dataIndex: 'registration_fee',
    width: { wpx: 120 },
    style: eStyle
  },
  {
    title: 'วันที่ส่งรถ',
    dataIndex: 'deliverDate',
    width: { wpx: 120 },
    style: eStyle
  }
];

export const eColumns = [...eColumns1, ...eColumns2];

export const formatIncomeSummary = ({ date, banks }) =>
  new Promise(async (r, j) => {
    try {
      let sArr = await getSearchData(
        'sections/account/incomes',
        {
          startDate: date[0],
          endDate: date[1],
          incomeCategory: 'daily',
          incomeSubCategory: 'vehicles'
        },
        undefined,
        { date: 'docDate' }
      );

      let arr = [];

      await arrayForEach(
        sArr.filter(l => !l.deleted),
        async it => {
          let btArr = !!it.payments ? it.payments.filter(l => !l.deleted && l.paymentType === 'transfer') : [];
          let transferAmount = btArr.reduce((sum, elem) => sum + Numb(elem?.amount || 0), 0);
          let cash = Numb(it.total) - transferAmount;
          let bankTransfer = distinctArr(btArr, ['selfBank'], ['amount']);
          let bankName = [];
          let bankAcc = [];
          let accName = [];
          bankTransfer.map(bk => {
            if (banks[bk.selfBank]) {
              bankName.push(banks[bk.selfBank].bankName);
              bankAcc.push(banks[bk.selfBank].accNo);
              accName.push(banks[bk.selfBank].name);
            }
            return bk;
          });

          let tSnap = {
            income_reserve: null,
            income_down: null,
            amtSKLInstallment: null,
            amtPlateAndInsurance: null,
            amtBaac: null,
            new_cash: null,
            amtBaacDebtor: null,
            amtTurnOver: null,
            amtTurnOverVehicle: null,
            amtTurnOverDifRefund: null,
            amtKBN: null,
            amtSKC: null,
            amtMAX: null,
            amtOldCustomer: null,
            deductOther: null,
            owe_kbn_down: null,
            owe_kbn_installment: null,
            owe_kbn_equipment: null,
            owe_kbn_borrow: null,
            owe_kbn_fines: null,
            amtRefer: null,
            amtReferWHTax: null,
            amtReservation: null
          };

          let refDoc = it?.refDoc && it.refDoc?.doc ? it.refDoc.doc : {};
          let model = '';
          let new_cash = 0;
          let used_cash = 0;
          let baac_sale = 0;
          refDoc.items &&
            refDoc.items.map((itm, i) => {
              model = `${model} ${itm.productName ? getModelFromName(itm.productName) : ''}`;
              if (itm.vehicleType === 'อุปกรณ์') {
                if (it.incomeType === 'baac') {
                  baac_sale += Numb(itm.total);
                } else {
                  if (itm.productCode.startsWith('2-')) {
                    used_cash += Numb(itm.total);
                  } else {
                    new_cash += Numb(itm.total);
                  }
                }
              }
              return itm;
            });

          let commonSnap = {
            date: refDoc?.date || it.date,
            docDate: it.docDate,
            purchaseDate: !['reservation', 'installment', 'licensePlateFee', 'other'].includes(it.incomeType)
              ? it.docDate
              : undefined,
            customer: `${it.prefix}${it.firstName} ${it.lastName || ''}`.trim(),
            branchCode: it.branchCode,
            item: AllIncomeType[it.incomeType],
            model,
            deliverDate: refDoc?.deliverDate || undefined,
            billNo: it.incomeType === 'reservation' ? refDoc?.bookNo || null : refDoc?.saleNo || null,
            total: it.total,
            cash,
            transferAmount,
            bankName,
            accName,
            bankAcc
          };

          let amtKBN = refDoc?.amtKBN || null;
          let amtSKC = refDoc?.amtSKC || null;
          let amtMAX = refDoc?.amtMAX || null;
          let amtOldCustomer = refDoc?.amtOldCustomer || null;
          let deductOther = it?.deductOther || null;
          let amt_discount = Numb(amtKBN) + Numb(amtSKC) + Numb(amtOldCustomer) + Numb(deductOther) + Numb(amtMAX);
          switch (it.incomeType) {
            case 'reservation':
              arr.push({
                ...commonSnap,
                ...tSnap,
                income_reserve: it.incomeType === 'reservation' ? it.total : null
              });
              break;
            case 'installment':
              arr.push({
                ...commonSnap,
                ...tSnap,
                amtSKLInstallment: it.amtSKLInstallment
              });
              break;
            case 'licensePlateFee':
              arr.push({
                ...commonSnap,
                ...tSnap,
                amtPlateAndInsurance: it.amtPlateAndInsurance,
                deductOther: it.deductOther
              });
              break;
            case 'other':
              model = '';
              if (!!it.amtOthers && Array.isArray(it.amtOthers)) {
                it.amtOthers.map(oth => {
                  model = `${model} ${oth.name} `;
                  return oth;
                });
              } else if (!!it.deductOthers && Array.isArray(it.deductOthers)) {
                it.deductOthers.map(oth => {
                  model = `${model} ${oth.name} `;
                  return oth;
                });
              }
              model = model.trim();
              arr.push({
                ...commonSnap,
                ...tSnap,
                amtOther: it.amtOther,
                deductOther: it.deductOther,
                model
              });
              break;
            case 'down':
            case 'cash':
            case 'baac':
            case 'kbnLeasing':
              let credit = await getDoc('sections', `credits/credits/${it.saleId}`);
              let amtRefer = 0;
              let amtReferWHTax = 0;
              if (!!credit) {
                amtRefer =
                  credit?.referringDetails && credit.referringDetails?.total ? credit.referringDetails.total : null;
                amtReferWHTax =
                  credit?.referringDetails && credit.referringDetails?.whTax ? refDoc.referringDetails.whTax : null;
              }
              arr.push({
                ...commonSnap,
                income_down:
                  it.incomeType !== 'cash' ? Numb(it.total) + amt_discount + Numb(refDoc?.amtReservation || 0) : null,
                amtSKLInstallment: it.amtSKLInstallment,
                amtPlateAndInsurance: it.amtPlateAndInsurance,
                amtBaacDebtor: it.amtBaacDebtor,
                amtTurnOver: refDoc?.amtTurnOver || null,
                amtTurnOverVehicle: refDoc?.amtTurnOverVehicle || null,
                amtTurnOverDifRefund: refDoc?.amtTurnOverDifRefund || null,
                amtReservation: refDoc?.amtReservation || null,
                amtKBN,
                amtSKC,
                amtMAX,
                amtOldCustomer,
                deductOther,
                owe_kbn_down: refDoc?.oweKBNLeasings && refDoc.oweKBNLeasings?.Down ? refDoc.oweKBNLeasings.Down : null,
                owe_kbn_installment:
                  refDoc?.oweKBNLeasings && refDoc.oweKBNLeasings?.Installment
                    ? refDoc.oweKBNLeasings.Installment
                    : null,
                owe_kbn_equipment:
                  refDoc?.oweKBNLeasings && refDoc.oweKBNLeasings?.Equipment ? refDoc.oweKBNLeasings.Equipment : null,
                owe_kbn_borrow:
                  refDoc?.oweKBNLeasings && refDoc.oweKBNLeasings?.Borrow ? refDoc.oweKBNLeasings.Borrow : null,
                owe_kbn_fines:
                  refDoc?.oweKBNLeasings && refDoc.oweKBNLeasings?.overdueFines
                    ? refDoc.oweKBNLeasings.overdueFines
                    : null,
                amtRefer,
                amtReferWHTax,
                remark: it.remark,
                amtBaac: it.incomeType === 'baac' ? Numb(it.total) : null,
                new_cash,
                used_cash,
                baac_sale
              });
              break;

            default:
              arr.push({
                ...commonSnap,
                ...tSnap
              });
              break;
          }
        }
      );

      r(arr.filter(l => !l.deleted).map((it, id) => ({ ...it, id: id + 1, key: id })));
    } catch (e) {
      j(e);
    }
  });

export const SumKeys_NewTractorRevenue = [
  'total',
  'cash',
  'transferAmount',
  'new_cash',
  'used_cash',
  'baac_sale',
  'amtReservation',
  'income_down',
  'amtSKLInstallment',
  // 'amtTurnOverDifRefund',
  'owe_kbn_down',
  'owe_kbn_installment',
  'owe_kbn_fines',
  'amtPlateAndInsurance',
  // '',
  'amtOther',
  'amtTurnOverVehicle',
  'amtKBN',
  'amtSKC',
  'amtOldCustomer',
  // 'deductOther',
  'amtMAX',
  'income_reserve',
  'amtRefer',
  'amtReferWHTax',
  'deductOther',
  'amtBaacDebtor',
  'owe_kbn_down',
  'owe_kbn_installment',
  // '',
  'amtTurnOverDifRefund',
  // '',
  // '',
  // '',
  'registration_fee'
];
