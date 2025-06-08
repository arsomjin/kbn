import { w, h } from 'api';
import moment from 'moment';
import { isMobile } from 'react-device-detect';

export const ExecMenu = [
  {
    title: 'Publish',
    key: '117',
    items: [
      {
        title: 'เผยแพร่',
        key: '118',
        // to: '/reports',
        htmlBefore: '<i class="material-icons" style="font-size:17px;">campaign</i>',
        htmlAfter: '',
        items: [
          {
            title: 'การแจ้งเตือน',
            key: '119',
            to: '/executive/send-notification'
          }
          // {
          //   title: 'ข่าวสาร',
          //   to: '/executive/send-information',
          // },
        ]
      }
    ]
  }
];

export const DevMenu = [
  {
    title: 'Developer',
    key: '121',
    items: [
      {
        title: 'พัฒนาระบบ',
        key: '122',
        // to: '/reports',
        htmlBefore: '<i class="material-icons" style="font-size:17px;">code</i>',
        htmlAfter: '',
        items: [
          {
            title: 'Test',
            key: '123',
            type: 'group',
            items: [
              {
                title: 'Import',
                key: '124',
                to: '/developer/test-import'
              },
              {
                title: 'Test',
                key: '1241',
                to: '/developer/test-general'
              },
              {
                title: 'Test multi province',
                key: '1242',
                to: '/developer/test-multi-province'
              },
              {
                title: 'Audit Trail Demo',
                key: '1243',
                to: '/developer/audit-trail-demo'
              }
            ]
          },
          {
            title: 'Template',
            key: '125',
            type: 'group',
            items: [
              {
                title: 'Page',
                key: '126',
                to: '/developer/template-page'
              },
              {
                title: 'Page with search header',
                key: '127',
                to: '/developer/template-page2'
              },
              {
                title: 'PDF Viewer',
                key: '128',
                to: '/developer/template-pdf-viewer'
              },
              {
                title: 'FormatContent',
                key: '129',
                to: '/developer/format-content'
              }
            ]
          },
          {
            title: 'Test Print',
            key: '132',
            type: 'group',
            items: [
              {
                title: 'Test Print',
                key: '132',
                to: '/developer/test-print'
              }
            ]
          },
          {
            title: 'Check',
            key: '130',
            type: 'group',
            items: [
              {
                title: 'Check data',
                key: '131',
                to: '/developer/update-data'
              }
            ]
          }
        ]
      }
    ]
  }
];

export const Markers = {
  stockImportVehicles: {
    warehouseChecked: null,
    warehouseCheckedDate: undefined,
    warehouseCheckedBy: null,
    seller: null,
    invoiceDate: undefined,
    warehouseReceiveDate: undefined,
    keywords: null
  },
  purchaseTransferPayment: {
    priceType: null,
    unitPrice: null,
    discount: null,
    total: null,
    accountChecked: null,
    accountCheckedDate: undefined,
    accountCheckedBy: null
  }
};

export const ServiceCategories = {
  periodicCheck: 'ตรวจเช็คตามระยะ',
  periodicCheck_KIS: 'ตรวจเช็คตามระยะ KIS',
  periodicCheck_Beyond: 'ตรวจเช็คตามระยะ Beyond',
  checkDrone: 'ตรวจเช็คบินอุ่นใจ',
  periodicService: 'เปลี่ยนถ่ายตามระยะ',
  generalRepair: 'ซ่อมทั่วไป',
  serviceCare: 'ซ่อม Service care',
  worthReassure: 'คุ้มอุ่นใจ',
  mobileService: 'Mobile Service',
  otherService: 'อื่นๆ'
};

export const IncomeDailyCategories = {
  vehicles: 'รถและอุปกรณ์',
  service: 'งานบริการ',
  parts: 'อะไหล่',
  other: 'อื่นๆ'
};

export const IncomeServiceCategories = {
  inside: 'ซ่อมในศูนย์',
  outsideCare: 'นอกพื้นที่ คุ้มค่า/แคร์',
  outside1512: 'นอกพื้นที่ 1-5-12/ตรวจเช็ค/เปลี่ยนถ่าย',
  repairDeposit: 'รับเงินมัดจำ งานซ่อม'
};

export const IncomePartCategories = {
  partSKC: 'หน้าร้าน อะไหล่ น้ำมัน SKC',
  partKBN: 'หน้าร้าน อะไหล่ KBN',
  wholeSale: 'ขายส่ง อะไหล่ให้ร้านค้า',
  partDeposit: 'รับเงินมัดจำ อะไหล่',
  partChange: 'รับเงินทอน แผนกอะไหล่'
};

export const IncomeSummaryCategories = {
  vehicles: 'vehicles',
  parts: 'parts',
  serviceInside: 'serviceInside',
  serviceOutside: 'serviceOutside',
  serviceOutsideMobileService: 'serviceOutsideMobileService',
  serviceOutside1512: 'serviceOutside_1_5_12',
  other: 'other'
};

export const IncomeType = {
  cash: 'เงินสด',
  down: 'เงินดาวน์',
  reservation: 'เงินจอง',
  baac: 'สกต./ธกส.',
  licensePlateFee: 'ค่าทะเบียน + พรบ',
  installment: 'ค่างวด SKL',
  kbnLeasing: 'โครงการร้าน',
  other: 'อื่นๆ'
};

export const AllIncomeType = {
  cash: 'เงินสด',
  down: 'เงินดาวน์',
  reservation: 'เงินจอง',
  baac: 'สกต./ธกส.',
  licensePlateFee: 'ค่าทะเบียน + พรบ',
  installment: 'ค่างวด SKL',
  kbnLeasing: 'โครงการร้าน',
  inside: 'ซ่อมในศูนย์',
  outsideCare: 'นอกพื้นที่ คุ้มค่า/แคร์',
  outside1512: 'นอกพื้นที่ 1-5-12/ตรวจเช็ค/เปลี่ยนถ่าย',
  repairDeposit: 'รับเงินมัดจำ งานซ่อม',
  partSKC: 'หน้าร้าน อะไหล่ น้ำมัน SKC',
  partKBN: 'หน้าร้าน อะไหล่ KBN',
  wholeSale: 'ขายส่ง อะไหล่ให้ร้านค้า',
  partDeposit: 'รับเงินมัดจำ อะไหล่',
  partChange: 'รับเงินทอน แผนกอะไหล่',
  other: 'อื่นๆ'
};

export const ExpenseType = {
  dailyChange: 'เงินทอนประจำวันสาขา',
  headOfficeTransfer: 'เงินโอนสำนักงานใหญ่',
  executive: 'ผู้บริหาร'
  // purchaseTransfer: 'เงินโอนค่าซื้อสินค้า',
};

export const SaleType = {
  cash: 'เงินสด',
  // down: 'เงินดาวน์',
  // reservation: 'เงินจอง',
  baac: 'สกต./ธกส.',
  // licensePlateFee: 'ค่าทะเบียน + พรบ',
  sklLeasing: 'เช่าซื้อ SKL',
  kbnLeasing: 'โครงการร้าน',
  govProj: 'โครงการของภาครัฐ',
  personalLoan: 'สินเชื่อส่วนบุคคล'
  // other: 'อื่นๆ',
};

export const MapVehicleStatus = {
  cash: 'sold',
  reservation: 'reserved',
  baac: 'baac',
  sklLeasing: 'skl',
  kbnLeasing: 'kbnLeasing'
};

export const SettingItems = {
  province: 'จังหวัด',
  branch: 'สาขา',
  vehicles: 'รถ',
  parts: 'อะไหล่',
  warehouse: 'คลังสินค้า',
  location: 'สถานที่',
  userGroup: 'กลุ่มผู้ใช้งาน',
  permission: 'สิทธิ์การเข้าถึง',
  account: 'บัญชี',
  promotions: 'โปรโมชั่น',
  migration: 'การย้ายข้อมูล',
  system: 'การตั้งค่าระบบ'
};

export const UserManualItems = {
  account: 'บัญชี',
  sale: 'งานขาย',
  service: 'งานบริการ',
  warehouse: 'คลังสินค้า',
  credit: 'สินเชื่อ'
};

export const VehicleItemType = {
  vehicle: 'รถใหม่',
  secondHandVehicle: 'รถมือสอง',
  equipment: 'อุปกรณ์ใหม่',
  secondHandEquipment: 'อุปกรณ์มือสอง'
};

export const OrderVehicleItemType = {
  harvester: 'รถเกี่ยวนวดข้าว',
  excavator: 'รถขุด',
  tractor: 'รถแทรคเตอร์',
  tractorSecondhand: 'รถแทรคเตอร์มือสอง',
  harvesterSecondhand: 'รถเกี่ยวนวดข้าวมือสอง'
};

export const OrderEquipmentItemType = {
  harvester: 'อุปกรณ์ต่อพ่วงรถเกี่ยวนวดข้าว',
  excavator: 'อุปกรณ์ต่อพ่วงรถขุด',
  tractor: 'อุปกรณ์ต่อพ่วงรถแทรคเตอร์',
  tractorSecondhand: 'อุปกรณ์ต่อพ่วงรถแทรคเตอร์มือสอง',
  harvesterSecondhand: 'อุปกรณ์ต่อพ่วงรถเกี่ยวนวดข้าวมือสอง'
};

export const VehicleModel = {
  KX91_3SX_AC_KIS: 'KX91-3SX AC KIS',
  U_U35_KIS: 'U35 KIS',
  L5018DT: 'L5018DT',
  DC70G_Plus_Canin: 'DC70G Plus Canin'
};

export const StatusMap = {
  pending: 'pending',
  reviewed: 'reviewed',
  approved: 'approved',
  rejected: 'rejected',
  canceled: 'canceled'
};

export const StatusMapToClass = {
  pending: 'text-warning',
  reviewed: 'text-primary',
  approved: 'text-success',
  rejected: 'text-danger',
  canceled: 'text-secondary'
};

export const StatusMapToStep = {
  pending: 1,
  reviewed: 2,
  approved: 3,
  rejected: 4,
  canceled: 5
};

export const StatusMapToThai = {
  pending: 'รอตรวจสอบ',
  reviewed: 'รออนุมัติ',
  approved: 'อนุมัติ',
  rejected: 'rejected',
  canceled: 'ยกเลิก'
};

export const StatusMapBadgeType = {
  approved: 'success',
  pending: 'warning',
  review: 'primary',
  rejected: 'danger',
  canceled: 'light'
};

export const NotificationStatus = {
  info: 'ปกติ',
  warning: 'ย้ำเตือน',
  error: 'เร่งด่วน',
  success: 'สำเร็จ'
};

export const DateRange = {
  today: 'วันนี้',
  thisWeek: 'สัปดาห์นี้',
  thisMonth: 'เดือนนี้',
  sevenDays: '7 วันที่ผ่านมา',
  thirtyDays: '30 วันที่ผ่านมา',
  threeMonth: '3 เดือนที่ผ่านมา',
  custom: 'กำหนดเอง'
};

export const DateRangeWithAll = {
  today: 'วันนี้',
  thisWeek: 'สัปดาห์นี้',
  thisMonth: 'เดือนนี้',
  sevenDays: '7 วันที่ผ่านมา',
  thirtyDays: '30 วันที่ผ่านมา',
  threeMonth: '3 เดือนที่ผ่านมา',
  all: 'ทั้งหมด',
  custom: 'กำหนดเอง'
};

export const ExpectToBuy = {
  thisWeek: 'สัปดาห์นี้',
  thisMonth: 'เดือนนี้',
  threeMonth: 'ภายใน 3 เดือน',
  thisYear: 'ปีนี้',
  nextYear: 'ปีหน้า',
  longTime: 'อีกนาน'
};

export const Sources = {
  fanPage: 'Facebook แฟนเพจ',
  knockDoor: 'Knock door',
  storeFront: 'จากหน้าร้าน',
  referrer: 'มีคนแนะนำ'
};

export const Plants = {
  rice: 'ข้าว',
  cassava: 'มันสำปะหลัง',
  cane: 'อ้อย',
  corn: 'ข้าวโพด',
  nut: 'ถั่ว',
  sapodilla: 'ละมุด',
  marigold: 'ดาวเรือง'
};

export const OrderSteps = ['สร้างรายการ', 'ตรวจสอบ', 'อนุมัติ'];

export const AccountSteps = ['บันทึกรายการ', 'ตรวจสอบ', 'อนุมัติ'];

export const ReportSteps = ['ตรวจสอบ', 'อนุมัติ'];

export const CommonSteps = ['บันทึกรายการ', 'ตรวจสอบ', 'อนุมัติ'];

export const VehicleFieldnameMap = {
  รหัสสินค้า: 'productCode',
  ชื่อสินค้า: 'name'
};

export const CustomerGrades = {
  APlus: 'A+',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D'
};

export const ProductType = ['รถ', 'อุปกรณ์'];
export const VehicleType = [
  'รถแทรกเตอร์',
  'รถแทรกเตอร์-ยี่ห้ออื่น',
  'รถเกี่ยวนวดข้าว',
  'รถเกี่ยว-ยี่ห้ออื่น',
  'รถขุด',
  'รถขุด-ยี่ห้ออื่น',
  'รถดำนา',
  'รถหยอดข้าว',
  'รถปลูกผัก',
  // 'โดรน',
  'โดรนการเกษตร',
  'อะไหล่โดรน',
  'อุปกรณ์',
  'เครื่องยนต์',
  'ของแถม'
];

export const WVehicleType = [
  'รถแทรกเตอร์',
  'รถแทรกเตอร์-ยี่ห้ออื่น',
  'รถเกี่ยวนวดข้าว',
  'รถเกี่ยว-ยี่ห้ออื่น',
  'รถขุด',
  'รถขุด-ยี่ห้ออื่น',
  'รถดำนา',
  'รถหยอดข้าว',
  'รถปลูกผัก',
  // 'โดรน',
  'โดรนการเกษตร',
  'อุปกรณ์',
  'เครื่องยนต์',
  'ของแถม'
];

export const VehicleGroup = {
  tracktor: {
    name: 'รถแทรกเตอร์',
    keyword: 'แทรกเตอร์'
  },
  harvester: {
    name: 'รถเกี่ยวนวดข้าว',
    keyword: 'รถเกี่ยว'
  },
  excavator: {
    name: 'รถขุด',
    keyword: 'รถขุด'
  },
  ricePlanter: {
    name: 'รถดำนา',
    keyword: 'รถดำ'
  },
  drone: {
    name: 'โดรนการเกษตร',
    keyword: 'โดรน'
  }
};

export const ThaiBanks = {
  kbank: {
    name: 'กสิกรไทย',
    bankId: 'kbank'
  },
  bbl: {
    name: 'กรุงเทพ',
    bankId: 'bbl'
  },
  scb: {
    name: 'ไทยพาณิชย์',
    bankId: 'scb'
  },
  ktb: {
    name: 'กรุงไทย',
    bankId: 'ktb'
  },
  bay: {
    name: 'กรุงศรี',
    bankId: 'bay'
  },
  tmb: {
    name: 'ทหารไทย',
    bankId: 'tmb'
  }
};

export const Seller = {
  store: 'ร้านค้าอื่นๆ',
  representativeShop: 'ร้านค้าตัวแทนคูโบต้า',
  siamKubota: 'สยามคูโบต้าคอร์ปอเรชั่น'
};

export const BankAccountType = {
  saving: {
    type: 'ออมทรัพย์'
  },
  current: {
    type: 'ฝากประจำ'
  }
};

export const PriceType = {
  noVat: 'ไม่มี VAT',
  separateVat: 'แยก VAT',
  includeVat: 'รวม VAT'
};

export const WitholdingTax = {
  0: 'ไม่หัก ณ ที่จ่าย',
  1: 'หัก ณ ที่จ่าย 1%',
  2: 'หัก ณ ที่จ่าย 2%',
  3: 'หัก ณ ที่จ่าย 3%',
  5: 'หัก ณ ที่จ่าย 5%'
};

export const WitholdingTaxDoc = {
  1: 'ภงด. 1',
  3: 'ภงด. 3',
  53: 'ภงด. 53'
};

export const StoreLocation = {
  NV01: 'รถใหม่-สนญ',
  NI01: 'อุปกรณ์-สนญ',
  NS01: 'อะไหล่-สนญ',
  NV02: 'รถใหม่-บัวใหญ่',
  NI02: 'อุปกรณ์-บัวใหญ่',
  NS02: 'อะไหล่-บัวใหญ่',
  NV03: 'รถใหม่-จักราช',
  NI03: 'อุปกรณ์-จักราช',
  NS03: 'อะไหล่-จักราช',
  NV04: 'รถใหม่-สีดา',
  NI04: 'อุปกรณ์-สีดา',
  NS04: 'อะไหล่-สีดา',
  NV05: 'รถใหม่-โคกกรวด',
  NI05: 'อุปกรณ์-โคกกรวด',
  NS05: 'อะไหล่-โคกกรวด',
  NV06: 'รถใหม่-หนองบุญมาก',
  NI06: 'อุปกรณ์-หนองบุญมาก',
  NS06: 'อะไหล่-หนองบุญมาก',
  NV07: 'รถใหม่-ขามสะแกแสง',
  NI07: 'อุปกรณ์-ขามสะแกแสง',
  NS07: 'อะไหล่-ขามสะแกแสง'
};

export const StoreVehicleLocation = {
  NV01: 'รถใหม่-สนญ',
  NI01: 'อุปกรณ์-สนญ',
  NV02: 'รถใหม่-บัวใหญ่',
  NI02: 'อุปกรณ์-บัวใหญ่',
  NV03: 'รถใหม่-จักราช',
  NI03: 'อุปกรณ์-จักราช',
  NV04: 'รถใหม่-สีดา',
  NI04: 'อุปกรณ์-สีดา',
  NV05: 'รถใหม่-โคกกรวด',
  NI05: 'อุปกรณ์-โคกกรวด',
  NV06: 'รถใหม่-หนองบุญมาก',
  NI06: 'อุปกรณ์-หนองบุญมาก',
  NV07: 'รถใหม่-ขามสะแกแสง',
  NI07: 'อุปกรณ์-ขามสะแกแสง',
  UV01: 'รถมือสอง-สนญ',
  UI01: 'อุปกรณ์มือสอง-สนญ',
  UV02: 'รถมือสอง-บัวใหญ่',
  UI02: 'อุปกรณ์มือสอง-บัวใหญ่',
  UV03: 'รถมือสอง-จักราช',
  UI03: 'อุปกรณ์มือสอง-จักราช',
  UV04: 'รถมือสอง-สีดา',
  UI04: 'อุปกรณ์มือสอง-สีดา',
  UV05: 'รถมือสอง-โคกกรวด',
  UI05: 'อุปกรณ์มือสอง-โคกกรวด',
  UV06: 'รถมือสอง-หนองบุญมาก',
  UI06: 'อุปกรณ์มือสอง-หนองบุญมาก',
  UV07: 'รถมือสอง-ขามสะแกแสง',
  UI07: 'อุปกรณ์มือสอง-ขามสะแกแสง'
};

export const StorePartLocation = {
  NS01: 'อะไหล่-สนญ',
  NS02: 'อะไหล่-บัวใหญ่',
  NS03: 'อะไหล่-จักราช',
  NS04: 'อะไหล่-สีดา',
  NS05: 'อะไหล่-โคกกรวด',
  NS06: 'อะไหล่-หนองบุญมาก',
  NS07: 'อะไหล่-ขามสะแกแสง'
};

export const DataInputType = {
  importFromFile: 'นำเข้า Excel',
  manualInput: 'คีย์รายการ'
};

export const tableScroll = { x: w(100), y: h(40) };

export const TAB_WIDTH = isMobile ? w(94) : 860;
export const TAB_HEIGHT = 580;

export const formItemClass = 'mb-3';

export const PaymentType = {
  cash: 'เงินสด',
  transfer: 'เงินโอน',
  pLoan: 'สินเชื่อส่วนบุคคล'
};

export const PaymentMethod = {
  accNum: 'กดเลขบัญชี',
  qrCode: 'สแกน QR Code'
};

export const BuyType = {
  cash: 'เงินสด',
  leasing: 'เช่าซื้อ',
  baac: 'ธกส.'
};

export const OldBranchMap = {
  1001: '0450',
  1002: '0454',
  1003: '0455',
  1004: '0452',
  1005: '0453',
  1006: '0456',
  1007: '0451'
};

export const TransferType = {
  saleOut: 'ตัดขาย',
  transfer: 'โอนย้าย',
  import: 'รับเข้า',
  export: 'จ่ายออก',
  reserve: 'จอง',
  turnOver: 'ตีเทิร์น',
  importOther: 'รับเข้า (อื่นๆ)'
};

export const TransferInType = {
  transfer: 'โอนย้าย',
  skc: 'รับจาก SKC'
};

export const DeliveryType = {
  customerDelivery: 'ส่งลูกค้า',
  branchDelivery: 'ส่งสาขา'
};

export const OtherVehicleImportType = {
  turnOver: 'รถตีเทิร์น',
  seize: 'รถยึด',
  auction: 'รถประมูล',
  wreck: 'ซากรถ'
};

export const OtherVehicleExportType = {
  secondHand: 'รถมือสอง',
  wreck: 'ซากรถ'
};

export const paymentInputColumns = [
  {
    name: 'type',
    placeholder: 'วิธีชำระเงิน',
    required: true
  },
  {
    name: 'amount',
    placeholder: 'จำนวนเงิน',
    number: true,
    required: true,
    align: 'right'
  },
  {
    name: 'bank',
    placeholder: 'ธนาคาร'
  },
  {
    name: 'person',
    placeholder: 'ผู้ฝากเงิน'
  }
];

export const arrayInputColumns = [
  {
    name: 'name',
    placeholder: 'รายการ',
    flex: 2,
    required: true
  },
  {
    name: 'total',
    placeholder: 'จำนวนเงิน',
    number: true,
    required: true,
    align: 'right'
  }
];

export const peripheralInputColumns = [
  {
    name: 'name',
    placeholder: 'รายการ',
    flex: 2,
    required: true
  },
  {
    name: 'peripheralNo',
    placeholder: 'เลขอุปกรณ์',
    flex: 1.5,
    required: true
  },
  {
    name: 'unit',
    placeholder: 'หน่วย',
    align: 'right'
  },
  {
    name: 'qty',
    placeholder: 'จำนวน',
    number: true,
    align: 'center'
  },
  {
    name: 'unitPrice',
    placeholder: 'ราคาต่อหน่วย',
    number: true,
    align: 'right'
  },
  {
    name: 'total',
    placeholder: 'รวม',
    number: true,
    align: 'right'
  }
];

export const giveAwayInputColumns = [
  {
    name: 'name',
    placeholder: 'รายการ',
    flex: 2,
    required: true
  },
  {
    name: 'unit',
    placeholder: 'หน่วย',
    align: 'right'
  },
  {
    name: 'qty',
    placeholder: 'จำนวน',
    number: true,
    align: 'center'
  },
  {
    name: 'unitPrice',
    placeholder: 'ราคาต่อหน่วย',
    number: true,
    align: 'right'
  },
  {
    name: 'total',
    placeholder: 'รวม',
    number: true,
    align: 'right'
  }
];

export const giveAwayInputColumnsHidePrice = [
  {
    name: 'name',
    placeholder: 'รายการ',
    flex: 2,
    required: true
  },
  {
    name: 'unit',
    placeholder: 'หน่วย',
    align: 'right'
  },
  {
    name: 'qty',
    placeholder: 'จำนวน',
    number: true,
    align: 'center'
  }
];

export const initDuration = [
  // moment().subtract(10, 'years').format('YYYY-MM-DD'),
  moment().startOf('week').format('YYYY-MM-DD'),
  moment().format('YYYY-MM-DD')
];

export const MKT_Channels = {
  '07RDEm8lMCAZv9FyypKI': {
    name: 'หน้าร้าน/Walk in',
    dataSourceId: '07RDEm8lMCAZv9FyypKI'
  },
  JZhgNJlsh2KZXfqoQAZr: {
    name: 'เพจ FB/ไลน์',
    dataSourceId: 'JZhgNJlsh2KZXfqoQAZr'
  },
  I3AdKzHEo0oUCrcnUBEz: {
    name: 'Knock door',
    dataSourceId: 'I3AdKzHEo0oUCrcnUBEz'
  },
  '6d4K1yUGHfDYowqcsECX': {
    name: 'นายหน้า/ลูกค้าเก่าแนะนำ',
    dataSourceId: '6d4K1yUGHfDYowqcsECX'
  },
  lNPkhoRWSsWGnQP0tKzU: {
    name: 'งานสาธิต',
    dataSourceId: 'lNPkhoRWSsWGnQP0tKzU'
  }
};

export const ProductNames = [
  'แทรกเตอร์ B2440S-B พร้อมหลังคา',
  'แทรกเตอร์ B2140S-B Narrow',
  'แทรกเตอร์ B2140S-B Narrow +SG270',
  'ผานพรวน DH246F-Heavy Plus',
  'แทรกเตอร์ L5018SP + ใบมีด FD186F + FG186',
  'รถเกี่ยวนวดข้าว DC70G Plus Cabin',
  'จอบหมุน RX165E',
  'จอบหมุน RX183F',
  'แทรกเตอร์ L4018SP + ใบมีด FD164E + FG186',
  'แทรกเตอร์ L5018SP + ใบมีด FD186F',
  'แทรกเตอร์ L4018SP + ใบมีด FD164E',
  'เครื่องปลูกมันสำปะหลังติดถังปุ๋ย CP100F',
  'รถขุด+KIS U55-6',
  'จอบหมุน RX85B2',
  'รถขุด + KIS KX033-4 ตู้แอร์',
  'ผานพรวน DH225E-Heavy Plus',
  'แทรกเตอร์ L3218SP + ใบมีด FD144D',
  'แทรกเตอร์ L4018SP พร้อมหลังคา',
  'แทรกเตอร์ L5018SP VT + FD186F+FG186F',
  'แทรกเตอร์ L5018SP + ใบมีด SD182+FG182',
  'แทรกเตอร์ B2740S-B โครงกันอ้อย SG270',
  'ผานบุกเบิก DP224F-Heavy Plus2',
  'ผานบุกเบิก DP224E-Heavy Plus2',
  'หัวเจาะไฮดรอลิก รุ่น EHB03',
  'เครื่องปลูกอ้อย SP420 ใหม่- L47/L50/MU55',
  'แทรกเตอร์ B2440S-B โครงกันอ้อย SG270',
  'จอบหมุน RX220GA',
  'ผานบุกเบิก DP224E-Heavy Plus',
  'แทรกเตอร์ M6040-B + ใบมีด FD202H',
  'จอบหมุน RX220H',
  'รถขุด + KIS KX033-4',
  'โดรน K-D1 package A(2 battery)',
  'รถเกี่ยวนวดข้าว DC-70G Plus',
  'เครื่องฝังปุ๋ย SF940',
  'ชุดโครงกันอ้อย SG270',
  'รถเกี่ยวนวดข้าว + KIS DC-105X Cabin',
  'เครื่องหว่านปุ๋ย FS200',
  'แทรกเตอร์ L3218SP พร้อมหลังคา',
  'เครื่องหยอดเมล็ดเอนกประสงค์ MS360-8 แถว',
  'เครื่องไถระเบิดดินดาน SS3-3 ขา',
  'เครื่องพ่น BS350',
  'ผานพรวน DH246HW',
  'ชุดเก็บเกี่ยวข้าวโพด CK70&70G',
  'เครื่องอัดฟาง HB135',
  'แทรกเตอร์ L5018SP+FL588 เกษตรการ์ด',
  'ผานบุกเบิก DP264L',
  'ผานพรวน DH268N',
  'โดรน K-D1 package B(6 battery)',
  'แทรกเตอร์ M9540-B เฮฟวี่ + ใบมีด FD210L',
  'ใบมีดดันหน้า FD186F',
  'แทรกเตอร์ MU4902-B + ใบมีด FD190',
  'ผานพรวน DH267L',
  'ชุดเก็บเกี่ยวข้าวโพด CK93',
  'เครื่องตัดหญ้า SX135',
  'ผานพรวน DH226E-Heavy Plus',
  'เครื่องตัดหญ้า SX145',
  'ผานพรวน  DH205A',
  'รถเกี่ยวนวดข้าว DC-105X',
  'เครื่องฝังปุ๋ย SF440 Pro',
  'รถเกี่ยวนวดข้าว+KIS DC-93G',
  'แทรกเตอร์ L5018SP พร้อมหลังคา',
  'ผานบุกเบิก DP283N',
  'รถขุด + KIS U36-6',
  'ผานบุกเบิก DP224F-Heavy Plus',
  'แทรกเตอร์ M108S-B + ใบมีด FD240NT',
  'แทรกเตอร์ L4018SP + FL508 เกษตรการ์ด',
  'แทรกเตอร์ L4018SP + ใบมีด SD162 + FG182',
  'เครื่องไถระเบิดดินดาน SS5-5 ขา',
  'แทรกเตอร์ M7040-B + ใบมีด FD206J',
  'รถเกี่ยวนวดข้าว DC-105X cabin',
  'ชุดบุ้งกี๋ FL588 L5018 เกษตรการ์ด',
  'รถตักล้อยาง R430M',
  'แทรกเตอร์ L5018SP + ใบมีด SD182',
  'ผานพรวน DH247H',
  'ชุดหัวบิดฝักข้าวโพด CH70',
  'รถขุด + KIS KX080-3 (ตู้แอร์)',
  'แทรกเตอร์ B2740S-B + ใบมีด SD132',
  'จอบหมุน RX80A2',
  'แทรกเตอร์ L5018SP+SGB470+FD186F+FG186F',
  'แทรกเตอร์ M6240SUH-B + ใบมีด FD202HS',
  'ผานบุกเบิก DP184A',
  'แทรกเตอร์ L5018SP VT + ชุดคีบอ้อย SGB470',
  'เครื่องเจาะหลุม DR550 - L36/L47',
  'เครื่องตัดต้นมันสำปะหลัง CSC100 -L40/L50',
  'ผานบุกเบิก DP203B',
  'แทรกเตอร์ L3218SP + ใบมีด SD142',
  'แทรกเตอร์ L5018SP + ชุดคีบอ้อย SGB470',
  'แทรกเตอร์ L5018SPVT+SGB470+FD186F+FG186F',
  'ผานพรวน DH225E-Pro',
  'ผานบุกเบิก DP223C-Heavy Plus',
  'ผานพรวน DH225C- Heavy',
  'แทรกเตอร์ B2140S-B + ใบมีด SD132',
  'แทรกเตอร์ L5018SP VT พร้อมหลังคา',
  'รถขุด+KIS U55-6 (ตู้แอร์)',
  'แทรกเตอร์ MU4902-B พร้อมหลังคา',
  'เหล็กถ่วงล้อหลัง MU-Series (แบบ 2 ก้อน)',
  'ชุดบุ้งกี๋ FL508 L4018 เกษตรการ์ด',
  'แทรกเตอร์ B2140S-B โครงกันอ้อย SG270',
  'ชุดเหล็กถ่วงล้อหลัง M',
  'แทรกเตอร์ B2440S-B SG270S +SD132',
  'แทรกเตอร์ B2740S-B พร้อมหลังคา',
  'เครื่องสางใบอ้อยพร้อมการ์ด SLR110H+SFG',
  'เหล็กถ่วงล้อหลัง L4018VT แบบ 2 ก้อน',
  'ผานพรวน DH245-6F - Heavy Plus',
  'จอบหมุน-ดินแห้ง RZ180',
  'ผานพรวน DH266JW',
  'แทรกเตอร์ L4018SP VT + ใบมีด FD164E + FG',
  'เครื่องปลูกมันสำปะหลังตราช้าง รุ่น CP100',
  'เครื่องปลูกอ้อยแบบท่อน SBP100',
  'ชุดเหล็กถ่วงหน้า M-Series (1ชุด / 6ก้อน)',
  'เหล็กถ่วงตัวแม่  M5/M9',
  'แทรกเตอร์ MU5702-B + ใบมีด FD203G',
  'โดรนการเกษตร DJI รุ่นAGRAS T20(B 4 bat.)',
  'แทรกเตอร์ B2440S-B + ใบมีด SD132',
  'ใบมีดดันหน้า FD164E',
  'แทรกเตอร์ M8540-B + ใบมีด FD210L',
  'แทรกเตอร์ L4018SP+ FL508 มาตรฐาน',
  'ผานพรวน DH205B',
  'แทรกเตอร์ L5018SP VT+FL588 เกษตรการ์ด',
  'แทรกเตอร์ M135X พร้อมหลังคา',
  'ใบมีดดันหน้า FD245',
  'รถขุด KX033-4 ตู้แอร์'
];

export const droneNames = [
  'โดรน K-D1 package A(2 battery)',
  'โดรน K-D1 package B(6 battery)',
  'โดรนการเกษตร DJI รุ่นAGRAS T20(B 4 bat.)'
];

export const VehicleNames = [
  'แทรกเตอร์ B2440S-B พร้อมหลังคา',
  'แทรกเตอร์ B2140S-B Narrow',
  'แทรกเตอร์ B2140S-B Narrow +SG270',
  'แทรกเตอร์ L5018SP + ใบมีด FD186F + FG186',
  'รถเกี่ยวนวดข้าว DC70G Plus Cabin',
  'แทรกเตอร์ L4018SP + ใบมีด FD164E + FG186',
  'แทรกเตอร์ L5018SP + ใบมีด FD186F',
  'แทรกเตอร์ L4018SP + ใบมีด FD164E',
  'รถขุด+KIS U55-6',
  'รถขุด + KIS KX033-4 ตู้แอร์',
  'แทรกเตอร์ L3218SP + ใบมีด FD144D',
  'แทรกเตอร์ L4018SP พร้อมหลังคา',
  'แทรกเตอร์ L5018SP VT + FD186F+FG186F',
  'แทรกเตอร์ L5018SP + ใบมีด SD182+FG182',
  'แทรกเตอร์ B2740S-B โครงกันอ้อย SG270',
  'แทรกเตอร์ B2440S-B โครงกันอ้อย SG270',
  'แทรกเตอร์ M6040-B + ใบมีด FD202H',
  'รถขุด + KIS KX033-4',
  'รถเกี่ยวนวดข้าว DC-70G Plus',
  'รถเกี่ยวนวดข้าว + KIS DC-105X Cabin',
  'แทรกเตอร์ L3218SP พร้อมหลังคา',
  'แทรกเตอร์ L5018SP+FL588 เกษตรการ์ด',
  'แทรกเตอร์ M9540-B เฮฟวี่ + ใบมีด FD210L',
  'แทรกเตอร์ MU4902-B + ใบมีด FD190',
  'รถเกี่ยวนวดข้าว DC-105X',
  'รถเกี่ยวนวดข้าว+KIS DC-93G',
  'แทรกเตอร์ L5018SP พร้อมหลังคา',
  'รถขุด + KIS U36-6',
  'แทรกเตอร์ M108S-B + ใบมีด FD240NT',
  'แทรกเตอร์ L4018SP + FL508 เกษตรการ์ด',
  'แทรกเตอร์ L4018SP + ใบมีด SD162 + FG182',
  'แทรกเตอร์ M7040-B + ใบมีด FD206J',
  'รถเกี่ยวนวดข้าว DC-105X cabin',
  'รถตักล้อยาง R430M',
  'แทรกเตอร์ L5018SP + ใบมีด SD182',
  'รถขุด + KIS KX080-3 (ตู้แอร์)',
  'แทรกเตอร์ B2740S-B + ใบมีด SD132',
  'แทรกเตอร์ L5018SP+SGB470+FD186F+FG186F',
  'แทรกเตอร์ M6240SUH-B + ใบมีด FD202HS',
  'แทรกเตอร์ L5018SP VT + ชุดคีบอ้อย SGB470',
  'แทรกเตอร์ L3218SP + ใบมีด SD142',
  'แทรกเตอร์ L5018SP + ชุดคีบอ้อย SGB470',
  'แทรกเตอร์ L5018SPVT+SGB470+FD186F+FG186F',
  'แทรกเตอร์ B2140S-B + ใบมีด SD132',
  'แทรกเตอร์ L5018SP VT พร้อมหลังคา',
  'รถขุด+KIS U55-6 (ตู้แอร์)',
  'แทรกเตอร์ MU4902-B พร้อมหลังคา',
  'แทรกเตอร์ B2140S-B โครงกันอ้อย SG270',
  'แทรกเตอร์ B2440S-B SG270S +SD132',
  'แทรกเตอร์ B2740S-B พร้อมหลังคา',
  'แทรกเตอร์ L4018SP VT + ใบมีด FD164E + FG',
  'แทรกเตอร์ MU5702-B + ใบมีด FD203G',
  'แทรกเตอร์ B2440S-B + ใบมีด SD132',
  'แทรกเตอร์ M8540-B + ใบมีด FD210L',
  'แทรกเตอร์ L4018SP+ FL508 มาตรฐาน',
  'แทรกเตอร์ L5018SP VT+FL588 เกษตรการ์ด',
  'แทรกเตอร์ M135X พร้อมหลังคา',
  'รถขุด KX033-4 ตู้แอร์'
];
export const EquipmentNames = [
  'ผานพรวน DH246F-Heavy Plus',
  'จอบหมุน RX165E',
  'จอบหมุน RX183F',
  'เครื่องปลูกมันสำปะหลังติดถังปุ๋ย CP100F',
  'จอบหมุน RX85B2',
  'ผานพรวน DH225E-Heavy Plus',
  'ผานบุกเบิก DP224F-Heavy Plus2',
  'ผานบุกเบิก DP224E-Heavy Plus2',
  'หัวเจาะไฮดรอลิก รุ่น EHB03',
  'เครื่องปลูกอ้อย SP420 ใหม่- L47/L50/MU55',
  'จอบหมุน RX220GA',
  'ผานบุกเบิก DP224E-Heavy Plus',
  'จอบหมุน RX220H',
  'เครื่องฝังปุ๋ย SF940',
  'ชุดโครงกันอ้อย SG270',
  'เครื่องหว่านปุ๋ย FS200',
  'เครื่องหยอดเมล็ดเอนกประสงค์ MS360-8 แถว',
  'เครื่องไถระเบิดดินดาน SS3-3 ขา',
  'เครื่องพ่น BS350',
  'ผานพรวน DH246HW',
  'ชุดเก็บเกี่ยวข้าวโพด CK70&70G',
  'เครื่องอัดฟาง HB135',
  'ผานบุกเบิก DP264L',
  'ผานพรวน DH268N',
  'ใบมีดดันหน้า FD186F',
  'ผานพรวน DH267L',
  'ชุดเก็บเกี่ยวข้าวโพด CK93',
  'เครื่องตัดหญ้า SX135',
  'ผานพรวน DH226E-Heavy Plus',
  'เครื่องตัดหญ้า SX145',
  'ผานพรวน  DH205A',
  'เครื่องฝังปุ๋ย SF440 Pro',
  'ผานบุกเบิก DP283N',
  'ผานบุกเบิก DP224F-Heavy Plus',
  'เครื่องไถระเบิดดินดาน SS5-5 ขา',
  'ชุดบุ้งกี๋ FL588 L5018 เกษตรการ์ด',
  'ผานพรวน DH247H',
  'ชุดหัวบิดฝักข้าวโพด CH70',
  'จอบหมุน RX80A2',
  'ผานบุกเบิก DP184A',
  'เครื่องเจาะหลุม DR550 - L36/L47',
  'เครื่องตัดต้นมันสำปะหลัง CSC100 -L40/L50',
  'ผานบุกเบิก DP203B',
  'ผานพรวน DH225E-Pro',
  'ผานบุกเบิก DP223C-Heavy Plus',
  'ผานพรวน DH225C- Heavy',
  'เหล็กถ่วงล้อหลัง MU-Series (แบบ 2 ก้อน)',
  'ชุดบุ้งกี๋ FL508 L4018 เกษตรการ์ด',
  'ชุดเหล็กถ่วงล้อหลัง M',
  'เครื่องสางใบอ้อยพร้อมการ์ด SLR110H+SFG',
  'เหล็กถ่วงล้อหลัง L4018VT แบบ 2 ก้อน',
  'ผานพรวน DH245-6F - Heavy Plus',
  'จอบหมุน-ดินแห้ง RZ180',
  'ผานพรวน DH266JW',
  'เครื่องปลูกมันสำปะหลังตราช้าง รุ่น CP100',
  'เครื่องปลูกอ้อยแบบท่อน SBP100',
  'ชุดเหล็กถ่วงหน้า M-Series (1ชุด / 6ก้อน)',
  'เหล็กถ่วงตัวแม่  M5/M9',
  'ใบมีดดันหน้า FD164E',
  'ผานพรวน DH205B',
  'ใบมีดดันหน้า FD245'
];

export const VehicleNameKeywords = ['แทรกเตอร์', 'รถเกี่ยว', 'รถขุด', 'รถตัก', 'โดรน'];
export const AccountNameKeywords = [
  'เงินเดือน',
  'ประกัน',
  'ภาษี',
  'บริการ',
  'สังคม',
  'บัญชี',
  'บำรุง',
  'รักษา',
  'รถ',
  'น้ำมัน',
  'ขนส่ง',
  'ขาย',
  'รับรอง',
  'ลูกค้า',
  'เบี้ยเลี้ยง',
  'วัสดุ',
  'สิ้นเปลือง',
  'รปภ',
  'ตรวจสภาพ',
  'ต่อ',
  'ตรอ',
  'แม่บ้าน',
  'ช่าง',
  'อะไหล่',
  'ภงด',
  'ป้าย',
  'โรงเรือน',
  'ซ่อม',
  'ประมูล',
  'แทรกเตอร์',
  'สำนักงาน',
  'สาขา',
  'กระบะ',
  'โฟลค',
  'เครื่อง',
  'ตัดหญ้า',
  'ทาสี',
  'ไฟฟ้า',
  'ประปา',
  'โทรศัพท์',
  'น้ำ',
  'ถ่าย',
  'ป้าย',
  'รูป',
  'รายปี',
  'สมาชิก',
  'ตู้แดง',
  'พรบ',
  'สำนักงาน',
  'ค่า',
  'ใช้จ่าย',
  'เบ็ดเตล็ด',
  'GPS',
  'KADS',
  'เช่า',
  'โฆษณา',
  'สปอต',
  'สปอร์ต',
  'พนักงาน',
  'ขยะ',
  'ซ่อม',
  'ล้าง',
  'ไหว้',
  'ศาล',
  'ทำบุญ',
  'ทะเบียน',
  'ประชา',
  'สัมพันธ',
  'ธุรก',
  'ใช้งาน',
  'ป้าย'
];

export const ServiceNameKeywords = [
  'ตรวจ',
  'เช็ค',
  'คุ้ม',
  'อุ่นใจ',
  'ครั้ง',
  'บริการ',
  'ค่าแรง',
  'อื่นๆ',
  'แคร์',
  'นอก',
  'พื้นที่',
  'ใน',
  'ศูนย์',
  'ฟรี',
  'ไม่มี',
  'น้ำมัน',
  'เครื่อง',
  'ช่าง',
  'อะไหล่',
  'mobile',
  'service',
  'care'
];

export const FilterSnap = {
  branch: {
    filters: [
      {
        text: 'สำนักงานใหญ่',
        value: '0450'
      },
      {
        text: 'บัวใหญ่',
        value: '0451'
      },
      {
        text: 'จักราช',
        value: '0452'
      },
      {
        text: 'สีดา',
        value: '0453'
      },
      {
        text: 'โคกกรวด',
        value: '0454'
      },
      {
        text: 'หนองบุญมาก',
        value: '0455'
      },
      {
        text: 'ขามสะแกแสง',
        value: '0456'
      }
    ],
    onFilter: (value, record) => record.branchCode === value
  },
  status: {
    filters: [
      {
        text: 'ขาย',
        value: 'ขาย'
      },
      {
        text: 'โอนย้าย',
        value: 'โอนย้าย'
      },
      {
        text: 'จอง',
        value: 'จอง'
      },
      {
        text: 'จ่ายออก',
        value: 'จ่ายออก'
      }
    ],
    onFilter: (value, record) => record.status === value
  }
};

export const ExtraPositions = ['ธุรการการตลาด', 'ผู้จัดการสาขา', 'พนักงานส่งเสริมการเกษตร', 'พนักงานดูแลฟาร์ม'];
