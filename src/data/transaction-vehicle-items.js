import { OrderEquipmentItemType, OrderVehicleItemType, VehicleItemType } from './Constant';
export default () => [
  {
    id: 1,
    incomeVehicleItemId: 'INV-VHITEM001',
    incomeVehicleId: 'INV-VH001',
    itemCategory: OrderVehicleItemType.harvester,
    vehicleItemType: VehicleItemType.vehicle,
    productId: 'W953Y-00211',
    productNo: 'KBH80100CLTB11426',
    detail: '',
    qty: 1,
    total: 1110000,
    status: 'Complete'
  },
  {
    id: 2,
    incomeVehicleItemId: 'INV-VHITEM002',
    incomeVehicleId: 'INV-VH001',
    itemCategory: OrderEquipmentItemType.harvester,
    vehicleItemType: VehicleItemType.equipment,
    productId: 'W9537-00001',
    productNo: 'CK70-2438',
    detail: '',
    qty: 1,
    total: 39900,
    status: 'Complete'
  },
  {
    id: 3,
    incomeVehicleItemId: 'INV-VHITEM003',
    incomeVehicleId: 'INV-VH001',
    itemCategory: OrderVehicleItemType.tractorSecondhand,
    vehicleItemType: VehicleItemType.secondHandVehicle,
    productId: 'W9500-45006',
    productNo: 'L4018',
    detail: '',
    qty: 1,
    total: 420000,
    status: 'Complete'
  },
  {
    id: 4,
    incomeVehicleItemId: 'INV-VHITEM004',
    incomeVehicleId: 'INV-VH002',
    itemCategory: OrderVehicleItemType.tractor,
    vehicleItemType: VehicleItemType.vehicle,
    productId: 'W955J-00020',
    productNo: 'L5018DT153278',
    detail: '',
    qty: 1,
    total: 744000,
    status: 'Complete'
  },
  {
    id: 5,
    incomeVehicleItemId: 'INV-VHITEM005',
    incomeVehicleId: 'INV-VH002',
    itemCategory: OrderVehicleItemType.harvester,
    vehicleItemType: VehicleItemType.vehicle,
    productId: 'W953Y-00211',
    productNo: 'KBH80100JLTB11425',
    detail: '',
    qty: 1,
    total: 1030000,
    status: 'Complete'
  }
];
