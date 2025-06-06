import React from 'react';
import { arrayForEach } from 'functions';
import numeral from 'numeral';
import moment from 'moment';
import { getDoc } from 'firebase/api';

export const columns = [
  // {
  //   title: '#',
  //   dataIndex: 'id',
  //   align: 'center',
  // },
  {
    title: 'วันที่',
    dataIndex: 'date',
    align: 'center',
    render: text => <div>{moment(text, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY')}</div>,
    width: 100,
    fixed: 'left'
  },
  {
    title: 'ผู้นำฝาก',
    children: [
      {
        title: <div className="text-center">ชื่อ - นามสกุล</div>,
        dataIndex: 'transferBy',
        width: 180
      },
      {
        title: '',
        dataIndex: 'depositorType',
        align: 'center',
        width: 100
      }
    ]
  },
  {
    title: 'รายการ',
    dataIndex: 'incomeTitle',
    width: 240
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    width: 120,
    align: 'center'
  },
  {
    title: 'ชื่อบัญชี / ธนาคาร / เลขที่บัญชี',
    dataIndex: 'selfBank',
    width: 220,
    align: 'center'
  },
  {
    title: 'จำนวนเงินที่โอน',
    dataIndex: 'amount',
    width: 120,
    align: 'center'
  },
  {
    title: 'โอนเข้าบัญชี',
    children: [
      {
        title: <div className="text-center">อาซ๊อ</div>,
        dataIndex: 'aso_acc',
        width: 120,
        align: 'center',
        render: text => (
          <div className={!text && text !== 0 ? 'transparent' : ''}>
            {text || text === 0 ? numeral(text).format('0,0.00') : '-'}
          </div>
        )
      },
      {
        title: <div className="text-center">บริษัท</div>,
        dataIndex: 'company_acc',
        width: 120,
        align: 'center',
        render: text => (
          <div className={!text && text !== 0 ? 'transparent' : ''}>
            {text || text === 0 ? numeral(text).format('0,0.00') : '-'}
          </div>
        )
      },
      {
        title: <div className="text-center">คุณเบนซ์</div>,
        dataIndex: 'k_benz_acc',
        width: 120,
        align: 'center',
        render: text => (
          <div className={!text && text !== 0 ? 'transparent' : ''}>
            {text || text === 0 ? numeral(text).format('0,0.00') : '-'}
          </div>
        )
      }
    ]
  }
];

export const formatIncomeSummary = (dataArr, banks, employees, customers) =>
  new Promise(async (r, j) => {
    if (!Array.isArray(dataArr) || (!!dataArr && dataArr.length === 0)) {
      return r([]);
    }
    try {
      let arr = [];
      dataArr
        .filter(l => !l.deleted)
        .map(it => {
          let incomeTitle = 'n/a';
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
                  const { amtBattery, amtIntake, amtGPS, amtTyre } = it;
                  if (!!amtBattery) {
                    incomeTitle = 'รายรับขายแบตเตอรี่ KBN';
                  } else if (!!amtIntake) {
                    incomeTitle = 'รายรับขายท่อไอเสีย KBN';
                  } else if (!!amtGPS) {
                    incomeTitle = 'รายรับขาย GPS KBN';
                  } else if (!!amtTyre) {
                    incomeTitle = 'รายรับขายยาง KBN';
                  } else {
                    incomeTitle = 'รายรับขายอะไหล่ / น้ำมัน KBN';
                  }
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
                  const { amtParts, amtOil, amtWage, amtOther, amtDistance, amtBlackGlue } = it;
                  if (!!amtParts) {
                    incomeTitle = 'ค่าอะไหล่ - ซ่อมในศูนย์';
                  } else if (!!amtOil) {
                    incomeTitle = 'ค่าน้ำมัน - ซ่อมในศูนย์';
                  } else if (!!amtWage) {
                    incomeTitle = 'ค่าแรง - ซ่อมในศูนย์';
                  } else if (!!amtOther) {
                    incomeTitle = 'ค่าอื่นๆ - ซ่อมในศูนย์';
                  } else if (!!amtDistance) {
                    incomeTitle = 'ค่าระยะทาง - ซ่อมในศูนย์';
                  } else if (!!amtBlackGlue) {
                    incomeTitle = 'ค่าประเก็นกาว - ซ่อมในศูนย์';
                  } else {
                    incomeTitle = 'รายรับงานบริการ - ซ่อมในศูนย์';
                  }
                  break;
                case 'outsideCare':
                  if (!!it.amtParts) {
                    incomeTitle = 'ค่าอะไหล่ - นอกพื้นที่';
                  } else if (!!it.amtOil) {
                    incomeTitle = 'ค่าน้ำมัน - นอกพื้นที่';
                  } else if (!!it.amtWage) {
                    incomeTitle = 'ค่าแรง - นอกพื้นที่';
                  } else if (!!it.amtOther) {
                    incomeTitle = 'ค่าอื่นๆ - นอกพื้นที่';
                  } else if (!!it.amtDistance) {
                    incomeTitle = 'ค่าระยะทาง - นอกพื้นที่';
                  } else if (!!it.amtBlackGlue) {
                    incomeTitle = 'ค่าประเก็นกาว - นอกพื้นที่';
                  } else {
                    incomeTitle = 'รายรับงานบริการ - นอกพื้นที่';
                  }
                  break;
                case 'outside1512':
                  if (!!it.amtParts) {
                    incomeTitle = 'ค่าอะไหล่ - 1-5-12';
                  } else if (!!it.amtOil) {
                    incomeTitle = 'ค่าน้ำมัน - 1-5-12';
                  } else if (!!it.amtWage) {
                    incomeTitle = 'ค่าแรง - 1-5-12';
                  } else if (!!it.amtOther) {
                    incomeTitle = 'ค่าอื่นๆ - 1-5-12';
                  } else if (!!it.amtDistance) {
                    incomeTitle = 'ค่าระยะทาง - 1-5-12';
                  } else if (!!it.amtBlackGlue) {
                    incomeTitle = 'ค่าประเก็นกาว - 1-5-12';
                  } else {
                    incomeTitle = 'รายรับงานบริการ - 1-5-12';
                  }
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
          // date, depositor, depositorType, incomeTitle, branch, bank, total, aso_acc, company_acc, k_benz_acc
          const { date, payments, branchCode } = it;
          // if (incomeTitle === 'n/a') {
          //   showLog({ anomaly: it });
          // }
          payments.map(pm => {
            const { amount, customer, customerName, selfBank, person, personName } = pm;
            let name = banks[selfBank] ? banks[selfBank].name : undefined;
            let aso_acc = null;
            let company_acc = null;
            let k_benz_acc = null;
            let transferBy = null;
            // if (!customer) {
            //   showWarn({ pm });
            // }
            if (name) {
              if (name.search('ศักดา') > -1) {
                k_benz_acc = amount;
              } else {
                company_acc = amount;
              }
            } else {
              company_acc = amount;
            }
            if (!!person) {
              if (!!personName) {
                transferBy = personName;
              } else {
                transferBy = employees[person]
                  ? `${employees[person].firstName}${
                      employees[person].nickName ? `(${employees[person].nickName})` : ''
                    }`
                  : person || '-';
              }
            }
            if (!!customer) {
              if (customerName) {
                transferBy = customerName;
              } else {
                transferBy = customers[customer]
                  ? `${customers[customer].firstName}${
                      customers[customer].nickName ? `(${customers[customer].nickName})` : ''
                    }`
                  : customer || '-';
              }
            }

            arr.push({
              date,
              amount,
              branchCode,
              selfBank,
              incomeTitle,
              count: 1,
              aso_acc,
              company_acc,
              k_benz_acc,
              transferBy,
              depositorType: !!person && employees[person] ? 'พนักงาน' : 'ลูกค้า',
              customer,
              customerName
            });
            return pm;
          });
          return it;
        });
      let result = [];
      await arrayForEach(arr, async itm => {
        let customer = itm.customer;
        let transferBy = itm.transferBy;
        if (!!customer) {
          if (itm.customerName) {
            transferBy = itm.customerName;
          } else {
            let cus = await getDoc('data', `sales/customers/${itm.customer}`);
            if (cus) {
              transferBy = `${cus.prefix || ''}${cus.firstName} ${cus.lastName || ''}`.trim();
            }
          }
        }
        result.push({
          ...itm,
          id: result.length,
          key: result.length,
          transferBy
        });
      });
      r(result);
    } catch (e) {
      j(e);
    }
  });
