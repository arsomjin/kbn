// Enhanced Navigation configuration with RBAC integration
export const NAVIGATION_CONFIG = {
  dashboard: {
    title: 'ภาพรวม',
    icon: 'dashboard',
    permission: null, // Everyone can access dashboard
    items: [
      {
        key: 'overview',
        title: 'หน้าแรก',
        to: '/overview',
        description: 'ภาพรวมการทำงานของระบบ',
      },
    ],
  },

  accounting: {
    title: 'บัญชี',
    icon: 'calculator',
    permission: 'accounting.view',
    items: [
      {
        key: 'income-group',
        title: 'รายรับ',
        type: 'group',
        permission: 'accounting.view',
        items: [
          {
            key: 'income-daily',
            title: 'รับเงินประจำวัน',
            to: '/account/income-daily',
            permission: 'accounting.edit',
            description: 'บันทึกรายรับประจำวัน',
          },
          {
            key: 'income-after-close',
            title: 'รับเงินหลังปิดบัญชีประจำวัน',
            to: '/account/income-after-close-account',
            permission: 'accounting.edit',
            description: 'บันทึกรายรับหลังปิดบัญชี',
          },
          {
            key: 'income-skl',
            title: 'รับเงิน - SKL',
            to: '/account/income-skl',
            permission: 'accounting.edit',
            description: 'บันทึกรายรับจากสินเชื่อ SKL',
          },
          {
            key: 'income-personal-loan',
            title: 'รับเงิน - สินเชื่อส่วนบุคคล',
            to: '/account/income-personal-loan',
            permission: 'accounting.edit',
            description: 'บันทึกรายรับจากสินเชื่อส่วนบุคคล',
          },
          {
            key: 'income-baac',
            title: 'รับเงิน - ธกส.',
            to: '/account/income-baac',
            permission: 'accounting.edit',
            description: 'บันทึกรายรับจากธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร',
          },
          {
            key: 'daily-bank-deposit',
            title: 'เงินฝากธนาคาร - ประจำวัน',
            to: '/account/daily-bank-deposit',
            permission: 'accounting.edit',
            description: 'บันทึกการฝากเงินธนาคารประจำวัน',
          },
        ],
      },
      {
        key: 'expense-group',
        title: 'รายจ่าย',
        type: 'group',
        permission: 'accounting.view',
        items: [
          {
            key: 'expense-daily',
            title: 'จ่ายเงินประจำวัน',
            to: '/account/expense-daily',
            permission: 'accounting.edit',
            description: 'บันทึกรายจ่ายประจำวัน',
          },
          {
            key: 'expense-after-close',
            title: 'จ่ายเงินหลังปิดบัญชีประจำวัน',
            to: '/account/expense-after-close-account',
            permission: 'accounting.edit',
            description: 'บันทึกรายจ่ายหลังปิดบัญชี',
          },
          {
            key: 'expense-skl',
            title: 'จ่ายเงิน - SKL',
            to: '/account/expense-skl',
            permission: 'accounting.edit',
            description: 'บันทึกรายจ่ายสินเชื่อ SKL',
          },
          {
            key: 'expense-baac',
            title: 'จ่ายเงิน - ธกส.',
            to: '/account/expense-baac',
            permission: 'accounting.edit',
            description: 'บันทึกรายจ่ายธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร',
          },
        ],
      },
      {
        key: 'transfer-group',
        title: 'โอนเงิน',
        type: 'group',
        permission: 'accounting.view',
        items: [
          {
            key: 'transfer-daily',
            title: 'โอนเงินประจำวัน',
            to: '/account/transfer-daily',
            permission: 'accounting.edit',
            description: 'บันทึกการโอนเงินประจำวัน',
          },
          {
            key: 'transfer-after-close',
            title: 'โอนเงินหลังปิดบัญชีประจำวัน',
            to: '/account/transfer-after-close-account',
            permission: 'accounting.edit',
            description: 'บันทึกการโอนเงินหลังปิดบัญชี',
          },
        ],
      },
      {
        key: 'close-group',
        title: 'ปิดบัญชี',
        type: 'group',
        permission: 'accounting.view',
        items: [
          {
            key: 'close-daily',
            title: 'ปิดบัญชีประจำวัน',
            to: '/account/close-daily',
            permission: 'accounting.close',
            description: 'ปิดบัญชีประจำวัน',
          },
        ],
      },
    ],
  },

  sales: {
    title: 'การขาย',
    icon: 'shopping-cart',
    permission: 'sales.view',
    items: [
      {
        key: 'booking-group',
        title: 'งานรับจอง',
        type: 'group',
        permission: 'sales.view',
        items: [
          {
            key: 'booking-vehicles',
            title: 'รับจองรถและอุปกรณ์',
            to: '/sale-booking',
            permission: 'sales.edit',
            description: 'รับจองการขายรถและอุปกรณ์',
          },
          {
            key: 'booking-edit',
            title: 'แก้ไขใบจอง',
            to: '/sale-booking-edit',
            permission: 'sales.edit',
            description: 'แก้ไขข้อมูลใบจอง',
          },
          {
            key: 'booking-cancel',
            title: 'ยกเลิกใบจอง',
            to: '/sale-booking-cancel',
            permission: 'sales.edit',
            description: 'ยกเลิกใบจอง',
          },
        ],
      },
      {
        key: 'sales-group',
        title: 'งานขาย',
        type: 'group',
        permission: 'sales.view',
        items: [
          {
            key: 'sale-vehicles',
            title: 'รถและอุปกรณ์',
            to: '/sale-machines',
            permission: 'sales.edit',
            description: 'บันทึกการขายรถและอุปกรณ์',
          },
          {
            key: 'sale-parts',
            title: 'อะไหล่',
            permission: 'sales.edit',
            type: 'subMenu',
            items: [
              {
                key: 'sale-parts-input',
                title: 'บันทึกข้อมูล',
                to: '/sale-parts',
                permission: 'sales.edit',
                description: 'บันทึกการขายอะไหล่',
              },
              {
                key: 'sale-parts-skc',
                title: 'จากระบบ SKC',
                to: '/skc-sale-parts',
                permission: 'sales.edit',
                description: 'บันทึกการขายอะไหล่จากระบบ SKC',
              },
            ],
          },
          {
            key: 'sale-marketing',
            title: 'การตลาด',
            to: '/sale-marketing',
            permission: 'sales.view',
            description: 'กิจกรรมการตลาดและส่งเสริมการขาย',
          },
        ],
      },
    ],
  },

  service: {
    title: 'งานบริการ',
    icon: 'tool',
    permission: 'service.view',
    items: [
      {
        key: 'service-input-group',
        title: 'บันทึกงานบริการ',
        type: 'group',
        permission: 'service.view',
        items: [
          {
            key: 'service-input',
            title: 'นอกพื้นที่',
            to: '/service-input',
            permission: 'service.edit',
            description: 'บันทึกงานบริการนอกพื้นที่',
          },
          {
            key: 'service-skc',
            title: 'ในศูนย์',
            to: '/service-data-skc',
            permission: 'service.edit',
            description: 'บันทึกงานบริการในศูนย์',
          },
        ],
      },
      {
        key: 'service-close-group',
        title: 'ปิดงานบริการ',
        type: 'group',
        permission: 'service.view',
        items: [
          {
            key: 'service-close',
            title: 'ปิดงานบริการ',
            to: '/service-close',
            permission: 'service.close',
            description: 'ปิดงานบริการที่เสร็จสิ้น',
          },
        ],
      },
    ],
  },

  warehouse: {
    title: 'คลังสินค้า',
    icon: 'database',
    permission: 'inventory.view',
    items: [
      {
        key: 'vehicles-group',
        title: 'รถและอุปกรณ์',
        type: 'group',
        permission: 'inventory.view',
        items: [
          {
            key: 'purchase-planning',
            title: 'วางแผนการสั่งซื้อ',
            to: '/warehouse/purchase-plan',
            permission: 'inventory.edit',
            description: 'วางแผนการสั่งซื้อรถและอุปกรณ์',
          },
          {
            key: 'import-by-purchase',
            title: 'รับสินค้าจากการซื้อ',
            to: '/warehouse/import-by-purchase',
            permission: 'inventory.edit',
            description: 'บันทึกการรับสินค้าจากการซื้อ',
          },
          {
            key: 'import-by-transfer',
            title: 'รับโอนสินค้า',
            to: '/warehouse/import-by-transfer',
            permission: 'inventory.edit',
            description: 'บันทึกการรับโอนสินค้า',
          },
          {
            key: 'other-import',
            title: 'รับจากอื่นๆ',
            to: '/warehouse/other-import',
            permission: 'inventory.edit',
            description: 'บันทึกการรับสินค้าจากแหล่งอื่น',
          },
          {
            key: 'transfer-out',
            title: 'โอนย้ายสินค้า',
            to: '/warehouse/transfer-out',
            permission: 'inventory.edit',
            description: 'บันทึกการโอนย้ายสินค้า',
          },
          {
            key: 'other-export',
            title: 'ส่งออกอื่นๆ',
            to: '/warehouse/other-export',
            permission: 'inventory.edit',
            description: 'บันทึกการส่งออกสินค้าอื่นๆ',
          },
        ],
      },
      {
        key: 'parts-group',
        title: 'อะไหล่',
        type: 'group',
        permission: 'inventory.view',
        items: [
          {
            key: 'parts-import-purchase',
            title: 'รับสินค้าจากการซื้อ',
            to: '/warehouse/parts/import-by-purchase',
            permission: 'inventory.edit',
            description: 'บันทึกการรับอะไหล่จากการซื้อ',
          },
          {
            key: 'parts-import-transfer',
            title: 'รับโอนสินค้า',
            to: '/warehouse/parts/import-by-transfer',
            permission: 'inventory.edit',
            description: 'บันทึกการรับโอนอะไหล่',
          },
          {
            key: 'parts-other-import',
            title: 'รับจากอื่นๆ',
            to: '/warehouse/parts/other-import',
            permission: 'inventory.edit',
            description: 'บันทึกการรับอะไหล่จากแหล่งอื่น',
          },
          {
            key: 'parts-transfer-out',
            title: 'โอนย้ายสินค้า',
            to: '/warehouse/parts/transfer-out',
            permission: 'inventory.edit',
            description: 'บันทึกการโอนย้ายอะไหล่',
          },
          {
            key: 'parts-other-export',
            title: 'ส่งออกอื่นๆ',
            to: '/warehouse/parts/other-export',
            permission: 'inventory.edit',
            description: 'บันทึกการส่งออกอะไหล่อื่นๆ',
          },
        ],
      },
    ],
  },

  credit: {
    title: 'สินเชื่อ',
    icon: 'dollar',
    permission: 'credit.view',
    items: [
      {
        key: 'credit-skl',
        title: 'สินเชื่อ SKL',
        to: '/credit-skl',
        permission: 'credit.edit',
        description: 'จัดการสินเชื่อ SKL',
      },
      {
        key: 'credit-kbn',
        title: 'สินเชื่อโครงการร้าน',
        to: '/credit-kbn',
        permission: 'credit.edit',
        description: 'จัดการสินเชื่อโครงการร้าน',
      },
      {
        key: 'credit-baac',
        title: 'สินเชื่อ ธกส',
        to: '/credit-baa',
        permission: 'credit.edit',
        description: 'จัดการสินเชื่อธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร',
      },
    ],
  },

  hr: {
    title: 'บุคลากร',
    icon: 'team',
    permission: 'hr.view',
    items: [
      {
        key: 'attendance',
        title: 'การเข้างาน',
        to: '/hr/attendance',
        permission: 'hr.view',
        description: 'บันทึกและติดตามการเข้างาน',
      },
      {
        key: 'leave-management',
        title: 'การลางาน',
        to: '/hr/leave',
        permission: 'hr.edit',
        description: 'จัดการการลางานของพนักงาน',
      },
    ],
  },

  reports: {
    title: 'รายงาน',
    icon: 'bar-chart',
    permission: 'reports.view',
    items: [
      {
        key: 'income-reports',
        title: 'รายรับ',
        permission: 'reports.view',
        items: [
          {
            key: 'income-summary',
            title: 'สรุปรายรับ',
            to: '/reports/income-summary',
            permission: 'reports.view',
            description: 'รายงานสรุปรายรับ',
          },
          {
            key: 'daily-money-summary',
            title: 'สรุปส่งเงินประจำวัน',
            to: '/reports/daily-money-summary',
            permission: 'reports.view',
            description: 'รายงานสรุปการส่งเงินประจำวัน',
          },
          {
            key: 'bank-deposit',
            title: 'เงินฝากธนาคาร',
            to: '/reports/bank-deposit',
            permission: 'reports.view',
            description: 'รายงานเงินฝากธนาคาร',
          },
          {
            key: 'income-parts-kbn',
            title: 'แยกขายอะไหล่ KBN',
            to: '/reports/income-parts-kbn',
            permission: 'reports.view',
            description: 'รายงานรายรับจากการขายอะไหล่ KBN',
          },
          {
            key: 'reports-income-personal-loan',
            title: 'รายรับ - สินเชื่อส่วนบุคคล',
            to: '/reports/income-personal-loan',
            permission: 'reports.view',
            description: 'รายงานรายรับจากสินเชื่อส่วนบุคคล',
          },
          {
            key: 'income-parts-all',
            title: 'รายรับขายอะไหล่รวม',
            to: '/reports/income-parts-all',
            permission: 'reports.view',
            description: 'รายงานรายรับจากการขายอะไหล่ทั้งหมด',
          },
          {
            key: 'money-return',
            title: 'รับเงินคืน',
            to: '/reports/money-return',
            permission: 'reports.view',
            description: 'รายงานการรับเงินคืน',
          },
          {
            key: 'income-others',
            title: 'รายรับอื่นๆ',
            to: '/reports/income-others',
            permission: 'reports.view',
            description: 'รายงานรายรับอื่นๆ',
          },
        ],
      },
      {
        key: 'expense-reports',
        title: 'รายจ่าย',
        permission: 'reports.view',
        items: [
          {
            key: 'expense-summary',
            title: 'สรุปรายจ่าย',
            to: '/reports/expense-summary',
            permission: 'reports.view',
            description: 'รายงานสรุปรายจ่าย',
          },
          {
            key: 'reports-expense-category',
            title: 'แยกตามหมวด',
            to: '/reports/expense-category',
            permission: 'reports.view',
            description: 'รายงานรายจ่ายแยกตามหมวด',
          },
          {
            key: 'expense-others',
            title: 'รายจ่ายอื่นๆ',
            to: '/reports/expense-others',
            permission: 'reports.view',
            description: 'รายงานรายจ่ายอื่นๆ',
          },
        ],
      },
      {
        key: 'booking-reports',
        title: 'งานรับจอง',
        permission: 'sales.view',
        items: [
          {
            key: 'booking-analytics',
            title: 'ภาพรวมงานรับจอง',
            to: '/reports/sale-booking-analytics',
            permission: 'sales.view',
            description: 'ภาพรวมและวิเคราะห์งานรับจอง',
          },
          {
            key: 'booking-summary',
            title: 'สรุปงานรับจอง',
            to: '/reports/sale-booking-summary',
            permission: 'sales.view',
            description: 'สรุปผลงานรับจอง',
          },
          {
            key: 'sale-assessment',
            title: 'ผลการประเมิน',
            to: '/reports/sale-assessment',
            permission: 'sales.view',
            description: 'รายงานผลการประเมิน',
          },
          {
            key: 'reservation-cancellation',
            title: 'ยกเลิกใบจอง',
            to: '/reports/reservation-cancellation',
            permission: 'sales.view',
            description: 'รายงานการยกเลิกใบจอง',
          },
          {
            key: 'all-reservation',
            title: 'ยอดจองคงเหลือ',
            to: '/reports/all-reservation',
            permission: 'sales.view',
            description: 'รายงานยอดจองคงเหลือ',
          },
        ],
      },
      {
        key: 'sales-work-reports',
        title: 'งานขาย',
        permission: 'sales.view',
        items: [
          {
            key: 'sale-analytics',
            title: 'ภาพรวมงานขาย',
            to: '/reports/sale-analytics',
            permission: 'sales.view',
            description: 'ภาพรวมและวิเคราะห์งานขาย',
          },
          {
            key: 'sale-summary',
            title: 'สรุปงานขาย',
            to: '/reports/sale-summary',
            permission: 'sales.view',
            description: 'สรุปผลงานขาย',
          },
        ],
      },
      {
        key: 'marketing-reports',
        title: 'การตลาด',
        permission: 'sales.view',
        items: [
          {
            key: 'mkt-customers',
            title: 'ลูกค้า',
            to: '/reports/mkt/customers',
            permission: 'sales.view',
            description: 'รายงานข้อมูลลูกค้า',
          },
          {
            key: 'marketing-channels',
            title: 'แหล่งที่มา',
            to: '/reports/mkt/marketing-channels',
            permission: 'sales.view',
            description: 'รายงานแหล่งที่มาของลูกค้า',
          },
        ],
      },
      {
        key: 'service-reports',
        title: 'งานบริการ',
        permission: 'service.view',
        items: [
          {
            key: 'service-daily-reports',
            title: 'ประจำวัน',
            permission: 'service.view',
            items: [
              {
                key: 'service-daily-list',
                title: 'การบันทึกงานบริการ',
                to: '/reports/service-daily/list',
                permission: 'service.view',
                description: 'รายงานการบันทึกงานบริการประจำวัน',
              },
              {
                key: 'service-daily-income',
                title: 'สรุปรายรับ',
                to: '/reports/service-daily/income',
                permission: 'service.view',
                description: 'รายงานสรุปรายรับจากงานบริการประจำวัน',
              },
            ],
          },
          {
            key: 'service-customer',
            title: 'จำนวนลูกค้า',
            to: '/reports/service-customer',
            permission: 'service.view',
            description: 'รายงานจำนวนลูกค้าที่ใช้บริการ',
          },
          {
            key: 'service-type',
            title: 'สรุปประเภท',
            to: '/reports/service-type',
            permission: 'service.view',
            description: 'รายงานสรุปประเภทงานบริการ',
          },
          {
            key: 'service-amount',
            title: 'สรุปยอด',
            to: '/reports/service-amount',
            permission: 'service.view',
            description: 'รายงานสรุปยอดงานบริการ',
          },
          {
            key: 'service-mechanic',
            title: 'จัดอันดับช่าง',
            to: '/reports/service-mechanic',
            permission: 'service.view',
            description: 'รายงานการจัดอันดับช่าง',
          },
        ],
      },
      {
        key: 'warehouse-reports',
        title: 'คลังสินค้า',
        permission: 'inventory.view',
        items: [
          {
            key: 'vehicles-reports',
            title: 'รถและอุปกรณ์',
            permission: 'inventory.view',
            items: [
              {
                key: 'vehicle-models',
                title: 'รายการสินค้า',
                to: '/reports/warehouse/vehicles/models',
                permission: 'inventory.view',
                description: 'รายงานรายการรถและอุปกรณ์',
              },
              {
                key: 'vehicle-stocks',
                title: 'คลังสินค้า',
                to: '/reports/warehouse/vehicles/stocks',
                permission: 'inventory.view',
                description: 'รายงานสต็อกรถและอุปกรณ์',
              },
              {
                key: 'reports-transfer-out',
                title: 'โอนย้าย(ออก)',
                to: '/reports/warehouse/vehicles/transferOut',
                permission: 'inventory.view',
                description: 'รายงานการโอนย้ายสินค้าออก',
              },
              {
                key: 'transfer-in',
                title: 'รับโอน(เข้า)',
                to: '/reports/warehouse/vehicles/transferIn',
                permission: 'inventory.view',
                description: 'รายงานการรับโอนสินค้าเข้า',
              },
              {
                key: 'decal-registry',
                title: 'ทะเบียนคุมลอกลายรถ',
                to: '/reports/warehouse/decal',
                permission: 'inventory.view',
                description: 'รายงานทะเบียนคุมลอกลายรถ',
              },
              {
                key: 'customer-delivery-plan',
                title: 'แผนการส่งรถลูกค้า',
                to: '/reports/warehouse/vehicles/customerDeliveryPlan',
                permission: 'inventory.view',
                description: 'รายงานแผนการส่งรถให้ลูกค้า',
              },
              {
                key: 'branch-delivery-plan',
                title: 'แผนการส่งรถสาขา',
                to: '/reports/warehouse/vehicles/branchDeliveryPlan',
                permission: 'inventory.view',
                description: 'รายงานแผนการส่งรถให้สาขา',
              },
            ],
          },
          {
            key: 'giveaways',
            title: 'ของแถม',
            to: '/reports/warehouse/giveaways',
            permission: 'inventory.view',
            description: 'รายงานของแถม',
          },
        ],
      },
      {
        key: 'credit-reports',
        title: 'สินเชื่อ',
        permission: 'credit.view',
        items: [
          {
            key: 'credit-summary',
            title: 'สรุปยอดตัดขาย-รับเงิน',
            to: '/reports/credit/summary',
            permission: 'credit.view',
            description: 'รายงานสรุปยอดตัดขายและรับเงิน',
          },
          {
            key: 'credit-summary-daily',
            title: 'สรุปยอดประจำวัน (สินเชื่อ)',
            to: '/reports/credit/summary-daily',
            permission: 'credit.view',
            description: 'รายงานสรุปยอดสินเชื่อประจำวัน',
          },
        ],
      },
      {
        key: 'hr-reports',
        title: 'บุคคล',
        permission: 'hr.view',
        items: [
          {
            key: 'hr-attendance',
            title: 'สถิติการทำงาน',
            to: '/reports/hr/attendance',
            permission: 'hr.view',
            description: 'รายงานสถิติการทำงาน',
          },
          {
            key: 'hr-leaving',
            title: 'การลางาน',
            to: '/reports/hr/leaving',
            permission: 'hr.view',
            description: 'รายงานการลางาน',
          },
          {
            key: 'hr-attendance-summary',
            title: 'การลางานประจำปี',
            to: '/reports/hr/attendance-summary',
            permission: 'hr.view',
            description: 'รายงานการลางานประจำปี',
          },
        ],
      },
    ],
  },

  settings: {
    title: 'ตั้งค่า',
    icon: 'setting',
    permission: 'settings.view',
    items: [
      {
        key: 'general-settings',
        title: 'ทั่วไป',
        type: 'group',
        permission: 'settings.view',
        items: [
          {
            key: 'branches',
            title: 'สาขา',
            to: '/setting-branches',
            permission: 'settings.edit',
            description: 'จัดการข้อมูลสาขา',
          },
          {
            key: 'users',
            title: 'กลุ่มผู้ใช้งาน',
            to: '/setting-users',
            permission: 'settings.edit',
            description: 'จัดการกลุ่มผู้ใช้งาน',
          },
          {
            key: 'vehicles',
            title: 'เกี่ยวกับรถและอุปกรณ์',
            to: '/setting-vehicles',
            permission: 'settings.edit',
            description: 'จัดการข้อมูลรถและอุปกรณ์',
          },
          {
            key: 'promotions',
            title: 'โปรโมชั่น',
            to: '/setting-promotions',
            permission: 'settings.edit',
            description: 'จัดการโปรโมชั่น',
          },
        ],
      },
      {
        key: 'accounting-settings',
        title: 'บัญชี',
        type: 'group',
        permission: 'settings.view',
        items: [
          {
            key: 'expense-category',
            title: 'หมวดรายจ่าย',
            to: '/setting-expense-category',
            permission: 'settings.edit',
            description: 'จัดการหมวดรายจ่าย',
          },
          {
            key: 'expense-subcategory',
            title: 'หมวดย่อย',
            to: '/setting-expense-subCategory',
            permission: 'settings.edit',
            description: 'จัดการหมวดย่อยรายจ่าย',
          },
          {
            key: 'expense-name',
            title: 'ชื่อบัญชี',
            to: '/setting-expense-name',
            permission: 'settings.edit',
            description: 'จัดการชื่อบัญชี',
          },
        ],
      },
    ],
  },

  manual: {
    title: 'คู่มือการใช้งาน',
    icon: 'home',
    permission: null, // Everyone can access
    items: [
      {
        key: 'manual-accounting',
        title: 'บัญชี',
        to: '/user-manual/account',
        description: 'คู่มือการใช้งานระบบบัญชี',
      },
      {
        key: 'manual-sales',
        title: 'งานขาย',
        to: '/user-manual/sale',
        description: 'คู่มือการใช้งานระบบขาย',
      },
      {
        key: 'manual-service',
        title: 'งานบริการ',
        to: '/user-manual/service',
        description: 'คู่มือการใช้งานระบบบริการ',
      },
      {
        key: 'manual-warehouse',
        title: 'คลังสินค้า',
        to: '/user-manual/warehouse',
        description: 'คู่มือการใช้งานระบบคลังสินค้า',
      },
      {
        key: 'manual-credit',
        title: 'สินเชื่อ',
        to: '/user-manual/credit',
        description: 'คู่มือการใช้งานระบบสินเชื่อ',
      },
    ],
  },

  admin: {
    title: 'จัดการระบบ',
    icon: 'setting',
    permission: 'admin.view',
    items: [
      {
        key: 'user-approval',
        title: 'อนุมัติผู้ใช้งาน',
        to: '/admin/user-approval',
        permission: 'admin.approve',
        description: 'อนุมัติและปฏิเสธผู้ใช้งานใหม่',
      },
      {
        key: 'user-management',
        title: 'จัดการผู้ใช้งาน',
        to: '/admin/user-management',
        permission: 'users.manage',
        description: 'จัดการข้อมูลและสถานะผู้ใช้',
      },
      {
        key: 'permission-management',
        title: 'จัดการสิทธิ์',
        to: '/admin/permission-management',
        permission: 'admin.edit',
        description: 'กำหนดสิทธิ์การใช้งานระบบ',
      },
      {
        key: 'live-deployment',
        title: '🚀 Live Deployment Control',
        to: '/admin/live-deployment',
        permission: 'admin.deploy',
        description: 'Mission-Critical Production Deployment Panel',
        badge: 'CRITICAL',
      },
    ],
  },

  executive: {
    title: 'ผู้บริหาร',
    icon: 'crown',
    permission: 'admin.executive',
    items: [
      {
        key: 'executive-briefing',
        title: 'การบรรยายสรุปสำหรับผู้บริหาร',
        to: '/executive/briefing',
        permission: 'admin.executive',
        description: 'ภาพรวมเชิงกลยุทธ์และข้อได้เปรียบในการแข่งขันของระบบ KBN',
        badge: 'STRATEGIC',
      },
      {
        key: 'system-configuration',
        title: 'การตั้งค่าระบบ',
        to: '/executive/system-configuration',
        permission: 'admin.system',
        description:
          'การจัดการระบบระดับผู้บริหารสำหรับจังหวัด สาขา และการตั้งค่าเชิงกลยุทธ์',
        badge: 'ENTERPRISE',
      },
    ],
  },

  about: {
    title: 'เกี่ยวกับ',
    icon: 'home',
    permission: null, // Everyone can access
    items: [
      {
        key: 'about-us',
        title: 'เกี่ยวกับเรา',
        to: '/about',
        description: 'ข้อมูลเกี่ยวกับบริษัท',
      },
      {
        key: 'changelogs',
        title: 'บันทึกการเปลี่ยนแปลง',
        to: '/changelogs',
        description: 'ประวัติการอัพเดทระบบ',
      },
    ],
  },

  developer: {
    title: 'พัฒนาระบบ',
    icon: 'code',
    permission: null, // Special handling - only for isDev users
    isDeveloperOnly: true, // Special flag for developer menu
    items: [
      {
        key: 'clean-slate-rbac-group',
        title: 'CLEAN SLATE RBAC',
        type: 'group',
        items: [
          {
            key: 'clean-slate-permissions-demo',
            title: 'Permission System Demo',
            to: '/dev/clean-slate-permissions-demo',
            description: 'ทดสอบระบบ Permission แบบ department.action',
            priority: 'high',
          },
        ],
      },
      {
        key: 'ui-design-group',
        title: 'UI/UX Design',
        type: 'group',
        items: [
          {
            key: 'glassmorphism-showcase',
            title: '🎨 Glassmorphism Showcase',
            to: '/developer/glassmorphism-showcase',
            description:
              'Apple Liquid Glass design system demo with dark mode support',
            priority: 'high',
            badge: 'NEW',
          },
        ],
      },
      {
        key: 'template-group',
        title: 'Template',
        type: 'group',
        items: [
          {
            key: 'template-page',
            title: 'Page',
            to: '/developer/template-page',
            description: 'เทมเพลตหน้าเว็บ',
          },
          {
            key: 'template-page2',
            title: 'Page with search header',
            to: '/developer/template-page2',
            description: 'เทมเพลตหน้าเว็บพร้อมค้นหา',
          },
          {
            key: 'template-pdf',
            title: 'PDF Viewer',
            to: '/developer/template-pdf-viewer',
            description: 'เทมเพลตแสดง PDF',
          },
          {
            key: 'template-format',
            title: 'FormatContent',
            to: '/developer/format-content',
            description: 'เทมเพลตจัดรูปแบบเนื้อหา',
          },
        ],
      },
      {
        key: 'print-group',
        title: 'Test Print',
        type: 'group',
        items: [
          {
            key: 'test-print',
            title: 'Test Print',
            to: '/developer/test-print',
            description: 'ทดสอบการพิมพ์',
          },
        ],
      },
      {
        key: 'check-group',
        title: 'Check',
        type: 'group',
        items: [
          {
            key: 'check-data',
            title: 'Check data',
            to: '/developer/update-data',
            description: 'ตรวจสอบและอัพเดทข้อมูล',
          },
        ],
      },
      {
        key: 'live-deployment-group',
        title: 'LIVE DEPLOYMENT',
        type: 'group',
        items: [
          {
            key: 'live-deployment-control',
            title: '🚀 Live Deployment Control',
            to: '/admin/live-deployment',
            description:
              'Mission-Critical Production Deployment Panel - Complete automated deployment system with backup and rollback capabilities',
            priority: 'critical',
            warning: 'PRODUCTION DEPLOYMENT ONLY',
            badge: 'CRITICAL',
            permission: 'admin.deploy',
          },
        ],
      },
    ],
  },
};

// Helper function to get all navigation items in flat structure
export const getAllNavigationPaths = () => {
  const paths = [];

  Object.values(NAVIGATION_CONFIG).forEach((section) => {
    if (section.items) {
      section.items.forEach((item) => {
        if (item.to) {
          paths.push(item.to);
        }
        if (item.items) {
          item.items.forEach((subItem) => {
            if (subItem.to) {
              paths.push(subItem.to);
            }
          });
        }
      });
    }
  });

  return paths;
};

// Helper function to find navigation item by path
export const findNavigationItemByPath = (path) => {
  for (const section of Object.values(NAVIGATION_CONFIG)) {
    if (section.items) {
      for (const item of section.items) {
        if (item.to === path) {
          return { section, item };
        }
        if (item.items) {
          for (const subItem of item.items) {
            if (subItem.to === path) {
              return { section, item, subItem };
            }
          }
        }
      }
    }
  }
  return null;
};
