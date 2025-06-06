import React from 'react';
import { distinctArr } from 'functions';
import numeral from 'numeral';
import moment from 'moment-timezone';
import { VehicleGroup } from 'data/Constant';

export const columns = [
  {
    title: 'เดือน',
    dataIndex: 'month',
    width: 120,
    render: text => <div className="text-primary">{moment(text, 'M').local().format('MMMM')}</div>,
    align: 'center',
    fixed: 'left'
  },
  {
    title: 'ตรวจเช็คครั้งที่ 1-9',
    children: [
      {
        title: 'แผน',
        dataIndex: 'periodic_check_plan',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'จำนวนคัน',
        dataIndex: 'periodic_check_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'periodic_check_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'periodic_check_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'periodic_check_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ตรวจเช็คตามระยะ KIS',
    children: [
      {
        title: 'แผน',
        dataIndex: 'periodic_check_kis_plan',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'จำนวนคัน',
        dataIndex: 'periodic_check_kis_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'periodic_check_kis_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'periodic_check_kis_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'periodic_check_kis_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ตรวจเช็คตามระยะ Beyond',
    children: [
      {
        title: 'แผน',
        dataIndex: 'periodic_check_beyond_plan',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'จำนวนคัน',
        dataIndex: 'periodic_check_beyond_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'periodic_check_beyond_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'periodic_check_beyond_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'periodic_check_beyond_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'เปลี่ยนถ่ายตามระยะ',
    children: [
      {
        title: 'จำนวนคัน',
        dataIndex: 'periodic_service_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'periodic_service_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'periodic_service_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'periodic_service_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ารถ',
        dataIndex: 'periodic_service_freight',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ตรวจเช็คบินอุ่นใจ',
    children: [
      {
        title: 'จำนวน',
        dataIndex: 'check_drone_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'check_drone_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'check_drone_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'check_drone_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ารถ',
        dataIndex: 'check_drone_freight',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ซ่อมทั่วไป (หมดประกัน)',
    children: [
      {
        title: 'จำนวนคัน',
        dataIndex: 'outwarranty_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'outwarranty_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'outwarranty_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'outwarranty_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ารถ',
        dataIndex: 'outwarranty_freight',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ากาว',
        dataIndex: 'outwarranty_glue',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ซ่อมทั่วไป (ในประกัน)',
    children: [
      {
        title: 'จำนวนคัน',
        dataIndex: 'inwarranty_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'inwarranty_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'inwarranty_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ซ่อม Service Care รถแทรกเตอร์',
    children: [
      {
        title: 'จำนวนคัน',
        dataIndex: 'serviceCare_tracktor_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'serviceCare_tracktor_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'serviceCare_tracktor_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'serviceCare_tracktor_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ารถ',
        dataIndex: 'serviceCare_tracktor_freight',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ากาว',
        dataIndex: 'serviceCare_tracktor_glue',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ซ่อม Service Care รถเกี่ยว',
    children: [
      {
        title: 'จำนวนคัน',
        dataIndex: 'serviceCare_harvester_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'serviceCare_harvester_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'serviceCare_harvester_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'serviceCare_harvester_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ารถ',
        dataIndex: 'serviceCare_harvester_freight',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ากาว',
        dataIndex: 'serviceCare_harvester_glue',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ซ่อม Service Care รถขุด',
    children: [
      {
        title: 'จำนวนคัน',
        dataIndex: 'serviceCare_excavator_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'serviceCare_excavator_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'serviceCare_excavator_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'serviceCare_excavator_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ารถ',
        dataIndex: 'serviceCare_excavator_freight',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ากาว',
        dataIndex: 'serviceCare_excavator_glue',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'ซ่อม Service Care รถดำนา',
    children: [
      {
        title: 'จำนวนคัน',
        dataIndex: 'serviceCare_ricePlanter_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'serviceCare_ricePlanter_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'serviceCare_ricePlanter_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'serviceCare_ricePlanter_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ารถ',
        dataIndex: 'serviceCare_ricePlanter_freight',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ากาว',
        dataIndex: 'serviceCare_ricePlanter_glue',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  },
  {
    title: 'อื่นๆ',
    children: [
      {
        title: 'จำนวน',
        dataIndex: 'otherService_count',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0')}</div>
      },
      {
        title: 'อะไหล่',
        dataIndex: 'otherService_part',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'น้ำมัน',
        dataIndex: 'otherService_oil',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่าแรง',
        dataIndex: 'otherService_wage',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ารถ',
        dataIndex: 'otherService_freight',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      },
      {
        title: 'ค่ากาว',
        dataIndex: 'otherService_glue',
        width: 90,
        align: 'center',
        render: text => <div>{numeral(text).format('0,0.00')}</div>
      }
    ]
  }
];

export const serviceTypeSumKeys = () => {
  return sum_fields;
};

const sum_fields = [
  'periodic_check_plan',
  'periodic_check_count',
  'periodic_check_part',
  'periodic_check_oil',
  'periodic_check_wage',
  'periodic_check_kis_count',
  'periodic_check_kis_part',
  'periodic_check_kis_oil',
  'periodic_check_kis_wage',
  'periodic_check_kis_plan',
  'periodic_check_beyond_count',
  'periodic_check_beyond_part',
  'periodic_check_beyond_oil',
  'periodic_check_beyond_wage',
  'periodic_check_beyond_plan',
  'periodic_service_count',
  'periodic_service_part',
  'periodic_service_oil',
  'periodic_service_wage',
  'periodic_service_freight',
  'check_drone_count',
  'check_drone_part',
  'check_drone_oil',
  'check_drone_wage',
  'check_drone_freight',
  'check_drone_glue',
  'inwarranty_count',
  'inwarranty_part',
  'inwarranty_oil',
  'outwarranty_count',
  'outwarranty_part',
  'outwarranty_oil',
  'outwarranty_wage',
  'outwarranty_freight',
  'outwarranty_glue',
  'serviceCare_tracktor_count',
  'serviceCare_tracktor_part',
  'serviceCare_tracktor_oil',
  'serviceCare_tracktor_wage',
  'serviceCare_tracktor_freight',
  'serviceCare_tracktor_glue',
  'serviceCare_harvester_count',
  'serviceCare_harvester_part',
  'serviceCare_harvester_oil',
  'serviceCare_harvester_wage',
  'serviceCare_harvester_freight',
  'serviceCare_harvester_glue',
  'serviceCare_excavator_count',
  'serviceCare_excavator_part',
  'serviceCare_excavator_oil',
  'serviceCare_excavator_wage',
  'serviceCare_excavator_freight',
  'serviceCare_excavator_glue',
  'serviceCare_ricePlanter_count',
  'serviceCare_ricePlanter_part',
  'serviceCare_ricePlanter_oil',
  'serviceCare_ricePlanter_wage',
  'serviceCare_ricePlanter_freight',
  'otherService_glue',
  'otherService_count',
  'otherService_part',
  'otherService_oil',
  'otherService_wage',
  'otherService_freight',
  'otherService_glue'
];

const initSnap = () => {
  let iSnap = {};
  sum_fields.map(fld => {
    iSnap[fld] = null;
    return fld;
  });
  return iSnap;
};

export const formatServiceType = dataArr =>
  new Promise(async (r, j) => {
    if (!Array.isArray(dataArr) || (!!dataArr && dataArr.length === 0)) {
      r([]);
    }
    try {
      let snap = {};
      [...Array(12).keys()].map(num => {
        snap[num + 1] = {
          month: `${num + 1}`,
          ...initSnap()
        };
        return num;
      });
      let arr = dataArr.map(it => {
        let periodic_check_plan = null;
        let periodic_check_count = null;
        let periodic_check_part = null;
        let periodic_check_oil = null;
        let periodic_check_wage = null;
        let periodic_service_count = null;
        let periodic_service_part = null;
        let periodic_service_oil = null;
        let periodic_service_wage = null;
        let periodic_service_freight = null;
        let periodic_check_kis_count = null;
        let periodic_check_kis_part = null;
        let periodic_check_kis_oil = null;
        let periodic_check_kis_wage = null;
        let periodic_check_kis_plan = null;
        let periodic_check_beyond_count = null;
        let periodic_check_beyond_part = null;
        let periodic_check_beyond_oil = null;
        let periodic_check_beyond_wage = null;
        let periodic_check_beyond_plan = null;
        let check_drone_count = null;
        let check_drone_part = null;
        let check_drone_oil = null;
        let check_drone_wage = null;
        let check_drone_freight = null;
        let inwarranty_count = null;
        let inwarranty_part = null;
        let inwarranty_oil = null;
        let outwarranty_count = null;
        let outwarranty_part = null;
        let outwarranty_oil = null;
        let outwarranty_wage = null;
        let outwarranty_freight = null;
        let outwarranty_glue = null;
        let serviceCare_tracktor_count = null;
        let serviceCare_tracktor_part = null;
        let serviceCare_tracktor_oil = null;
        let serviceCare_tracktor_wage = null;
        let serviceCare_tracktor_freight = null;
        let serviceCare_tracktor_glue = null;
        let serviceCare_harvester_count = null;
        let serviceCare_harvester_part = null;
        let serviceCare_harvester_oil = null;
        let serviceCare_harvester_wage = null;
        let serviceCare_harvester_freight = null;
        let serviceCare_harvester_glue = null;
        let serviceCare_excavator_count = null;
        let serviceCare_excavator_part = null;
        let serviceCare_excavator_oil = null;
        let serviceCare_excavator_wage = null;
        let serviceCare_excavator_freight = null;
        let serviceCare_excavator_glue = null;
        let serviceCare_ricePlanter_count = null;
        let serviceCare_ricePlanter_part = null;
        let serviceCare_ricePlanter_oil = null;
        let serviceCare_ricePlanter_wage = null;
        let serviceCare_ricePlanter_freight = null;
        let serviceCare_ricePlanter_glue = null;
        let otherService_count = null;
        let otherService_part = null;
        let otherService_oil = null;
        let otherService_wage = null;
        let otherService_freight = null;
        let otherService_glue = null;
        let vGroup = 'n/a';
        let serviceTitle = 'n/a';
        let month = moment(it.recordedDate, 'YYYY-MM-DD').format('M');
        if (it.vehicleType.search(VehicleGroup.tracktor.keyword) > -1) {
          vGroup = 'tracktor';
        } else if (it.vehicleType.search(VehicleGroup.harvester.keyword) > -1) {
          vGroup = 'harvester';
        } else if (it.vehicleType.search(VehicleGroup.excavator.keyword) > -1) {
          vGroup = 'excavator';
        } else if (it.vehicleType.search(VehicleGroup.ricePlanter.keyword) > -1) {
          vGroup = 'ricePlanter';
        }
        switch (it.serviceType) {
          case 'periodicCheck':
            serviceTitle = 'periodicCheck';
            break;
          case 'periodicCheck_KIS':
            serviceTitle = 'periodicCheck_KIS';
            break;
          case 'periodicCheck_Beyond':
            serviceTitle = 'periodicCheck_Beyond';
            break;
          case 'checkDrone':
            serviceTitle = 'checkDrone';
            break;
          case 'periodicService':
            serviceTitle = 'periodicService';
            break;
          case 'generalRepair':
            serviceTitle = it.warrantyStatus === 'ในประกัน' ? 'inWarranty' : 'outWarranty';
            break;
          case 'serviceCare':
            serviceTitle = `serviceCare_${vGroup}`;
            break;
          case 'worthReassure':
            serviceTitle = 'worthReassure';
            break;
          case 'mobileService':
            serviceTitle = 'mobileService';
            break;
          case 'otherService':
            serviceTitle = 'otherService';
            break;

          default:
            break;
        }
        switch (serviceTitle) {
          case 'periodicCheck':
            periodic_check_plan = 'n/a';
            periodic_check_count = 1;
            periodic_check_part = it.amtPart;
            periodic_check_oil = it.amtOil;
            periodic_check_wage = it.amtWage;
            break;
          case 'periodicCheck_KIS':
            periodic_check_kis_plan = 'n/a';
            periodic_check_kis_count = 1;
            periodic_check_kis_part = it.amtPart;
            periodic_check_kis_oil = it.amtOil;
            periodic_check_kis_wage = it.amtWage;
            break;
          case 'periodicCheck_Beyond':
            periodic_check_beyond_plan = 'n/a';
            periodic_check_beyond_count = 1;
            periodic_check_beyond_part = it.amtPart;
            periodic_check_beyond_oil = it.amtOil;
            periodic_check_beyond_wage = it.amtWage;
            break;
          case 'checkDrone':
            check_drone_count = 1;
            check_drone_part = it.amtPart;
            check_drone_oil = it.amtOil;
            check_drone_wage = it.amtWage;
            check_drone_freight = it.amtFreight;
            break;
          case 'periodicService':
            periodic_service_count = 1;
            periodic_service_part = it.amtPart;
            periodic_service_oil = it.amtOil;
            periodic_service_wage = it.amtWage;
            periodic_service_freight = it.amtFreight;

            break;
          case 'inWarranty':
            inwarranty_count = 1;
            inwarranty_part = it.amtPart;
            inwarranty_oil = it.amtOil;

            break;
          case 'outWarranty':
            outwarranty_count = 1;
            outwarranty_part = it.amtPart;
            outwarranty_oil = it.amtOil;
            outwarranty_wage = it.amtWage;
            outwarranty_freight = it.amtFreight;
            outwarranty_glue = it.amtBlackGlue;
            break;
          case 'serviceCare_tracktor':
            serviceCare_tracktor_count = 1;
            serviceCare_tracktor_part = it.amtPart;
            serviceCare_tracktor_oil = it.amtOil;
            serviceCare_tracktor_wage = it.amtWage;
            serviceCare_tracktor_freight = it.amtFreight;
            serviceCare_tracktor_glue = it.amtBlackGlue;
            break;
          case 'serviceCare_harvester':
            serviceCare_harvester_count = 1;
            serviceCare_harvester_part = it.amtPart;
            serviceCare_harvester_oil = it.amtOil;
            serviceCare_harvester_wage = it.amtWage;
            serviceCare_harvester_freight = it.amtFreight;
            serviceCare_harvester_glue = it.amtBlackGlue;
            break;
          case 'serviceCare_excavator':
            serviceCare_excavator_count = 1;
            serviceCare_excavator_part = it.amtPart;
            serviceCare_excavator_oil = it.amtOil;
            serviceCare_excavator_wage = it.amtWage;
            serviceCare_excavator_freight = it.amtFreight;
            serviceCare_excavator_glue = it.amtBlackGlue;
            break;
          case 'serviceCare_ricePlanter':
            serviceCare_ricePlanter_count = 1;
            serviceCare_ricePlanter_part = it.amtPart;
            serviceCare_ricePlanter_oil = it.amtOil;
            serviceCare_ricePlanter_wage = it.amtWage;
            serviceCare_ricePlanter_freight = it.amtFreight;
            serviceCare_ricePlanter_glue = it.amtBlackGlue;

            break;
          case 'worthReassure':
            break;
          case 'mobileService':
            break;
          case 'otherService':
            otherService_count = 1;
            otherService_part = it.amtPart;
            otherService_oil = it.amtOil;
            otherService_wage = it.amtWage;
            otherService_freight = it.amtFreight;
            otherService_glue = it.amtBlackGlue;

            break;

          default:
            break;
        }

        return {
          // ...it,
          month,
          // serviceTitle,
          periodic_check_plan,
          periodic_check_count,
          periodic_check_part,
          periodic_check_oil,
          periodic_check_wage,
          periodic_check_kis_count,
          periodic_check_kis_part,
          periodic_check_kis_oil,
          periodic_check_kis_wage,
          periodic_check_kis_plan,
          periodic_check_beyond_count,
          periodic_check_beyond_part,
          periodic_check_beyond_oil,
          periodic_check_beyond_wage,
          periodic_check_beyond_plan,
          check_drone_count,
          check_drone_part,
          check_drone_oil,
          check_drone_wage,
          check_drone_freight,
          periodic_service_count,
          periodic_service_part,
          periodic_service_oil,
          periodic_service_wage,
          periodic_service_freight,
          inwarranty_count,
          inwarranty_part,
          inwarranty_oil,
          outwarranty_count,
          outwarranty_part,
          outwarranty_oil,
          outwarranty_wage,
          outwarranty_freight,
          outwarranty_glue,
          serviceCare_tracktor_count,
          serviceCare_tracktor_part,
          serviceCare_tracktor_oil,
          serviceCare_tracktor_wage,
          serviceCare_tracktor_freight,
          serviceCare_tracktor_glue,
          serviceCare_harvester_count,
          serviceCare_harvester_part,
          serviceCare_harvester_oil,
          serviceCare_harvester_wage,
          serviceCare_harvester_freight,
          serviceCare_harvester_glue,
          serviceCare_excavator_count,
          serviceCare_excavator_part,
          serviceCare_excavator_oil,
          serviceCare_excavator_wage,
          serviceCare_excavator_freight,
          serviceCare_excavator_glue,
          serviceCare_ricePlanter_count,
          serviceCare_ricePlanter_part,
          serviceCare_ricePlanter_oil,
          serviceCare_ricePlanter_wage,
          serviceCare_ricePlanter_freight,
          serviceCare_ricePlanter_glue,
          otherService_count,
          otherService_part,
          otherService_oil,
          otherService_wage,
          otherService_freight,
          otherService_glue
        };
      });
      let dArr = distinctArr(arr, ['month'], sum_fields);
      let fArr = Object.keys(snap).map(k => {
        let mSnap = dArr.find(l => l.month === k);
        // delete mSnap.serviceTitle;
        return { ...snap[k], ...mSnap };
      });
      let result = fArr.map((it, id) => ({ ...it, id, key: id }));
      r(result);
    } catch (e) {
      j(e);
    }
  });
