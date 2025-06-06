import { OrderEquipmentItemType, OrderVehicleItemType } from './Constant';

export const VehicleCategoies = () => [
  {
    vehicleCategoryId: 'vh001',
    vehicleCategoryName: 'รถเกี่ยวแทรคเตอร์',
    type: OrderVehicleItemType.tractor,
    description: ''
  },
  {
    vehicleCategoryId: 'vh002',
    vehicleCategoryName: 'รถเกี่ยวนวดข้าว',
    type: OrderVehicleItemType.harvester,
    description: ''
  }
];

export const Vehicles = () => [
  {
    productCode: 'W955J-00020',
    vehicleNo: 'L5018DT153278',
    vehicleName: 'L5018',
    description: '',
    standardCost: 639929.5,
    listPrice: 744000,
    vehicleCategoryId: 'vh001'
  },
  {
    productCode: 'W953Y-00211',
    vehicleNo: 'KBH80100JLTB11425',
    vehicleName: 'DC-70G PLUS',
    description: '',
    standardCost: 1054000,
    listPrice: 1110000,
    vehicleCategoryId: 'vh002'
  }
];
export const EquipmentCategoies = () => [
  {
    equipmentCategoryId: 'eq001',
    equipmentCategoryName: 'อุปกรณ์ต่อพ่วงรถเกี่ยวแทรคเตอร์',
    type: OrderEquipmentItemType.tractor,
    description: ''
  },
  {
    equipmentCategoryId: 'eq002',
    equipmentCategoryName: 'อุปกรณ์ต่อพ่วงรถเกี่ยวนวดข้าว',
    type: OrderEquipmentItemType.harvester,
    description: ''
  }
];

export const Equipments = () => [
  {
    equipmentId: 'W9537-00021',
    equipmentNo: 'BJ70-2438',
    equipmentName: 'ใบดันการ์ด',
    description: '',
    standardCost: 45000,
    listPrice: 51000,
    equipmentCategoryId: 'eq001'
  },
  {
    equipmentId: 'W9537-00001',
    equipmentNo: 'CK70-2438',
    equipmentName: 'ชุดเก็บเกี่ยวข้าวโพด CK70&70G',
    description: '',
    standardCost: 33551,
    listPrice: 39900,
    equipmentCategoryId: 'eq002'
  }
];
