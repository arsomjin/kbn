import { IncomeType } from './Constant';

// { incomeType: '', vehicleItemType: '', model: '', detail: '', qty: 1, total: '' },
export default () => [
  {
    incomeVehicleId: 'vh-inv001',
    incomeType: IncomeType.down,
    vehicleItemType: 'รถขุด',
    productId: 'vh1000001',
    detail: '',
    qty: 1,
    total: '1250000',
    status: 'Complete'
  },
  {
    incomeVehicleItemId: 2,
    incomeVehicleId: '',
    incomeType: IncomeType.cash,
    vehicleItemType: 'รถเกี่ยวนวดข้าว',
    productId: 'vh1000011',
    detail: '',
    qty: 1,
    total: '1125000',
    status: 'Complete'
  },
  {
    incomeVehicleItemId: 3,
    incomeVehicleId: '',
    incomeType: IncomeType.down,
    vehicleItemType: 'รถแทรคเตอร์',
    productId: 'vh1000031',
    detail: '',
    qty: 1,
    total: '425000',
    status: 'Complete'
  },
  {
    incomeVehicleItemId: 4,
    incomeVehicleId: '',
    incomeType: IncomeType.cash,
    vehicleItemType: 'รถขุด',
    productId: 'vh1000041',
    detail: '',
    qty: 1,
    total: '825000',
    status: 'Complete'
  },
  {
    incomeVehicleItemId: 5,
    incomeVehicleId: '',
    incomeType: IncomeType.down,
    vehicleItemType: 'รดแทรคเตอร์มือสอง',
    productId: 'vh1000071',
    detail: '',
    qty: 1,
    total: '325000',
    status: 'Complete'
  }
];
