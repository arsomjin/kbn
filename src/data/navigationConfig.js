// Enhanced Navigation configuration with RBAC integration
// COMPLETE MIGRATION from sidebar-nav-items.js to new RBAC structure
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
          {
            key: 'daily-executive-cash-deposit',
            title: 'ฝากส่งเงินสด ผู้บริหาร - ประจำวัน',
            to: '/account/daily-executive-cash-deposit',
            permission: 'accounting.edit',
            description: 'ฝากส่งเงินสด ผู้บริหาร - ประจำวัน',
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
            title: 'บันทึกรายจ่าย',
            to: '/account/expense-input',
            permission: 'accounting.edit',
            description: 'บันทึกรายจ่ายประจำวัน',
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
            key: 'transfer-cycle',
            title: 'บันทึกรอบการโอนเงิน',
            to: '/account/expense-transfer-cycle',
            permission: 'accounting.edit',
            description: 'บันทึกรอบการโอนเงิน',
          },
        ],
      },
      {
        key: 'check-group',
        title: 'ตรวจสอบ',
        type: 'group',
        permission: 'accounting.view',
        items: [
          {
            key: 'expense-referrer',
            title: 'ตรวจสอบค่าแนะนำ',
            to: '/account/expense-referrer',
            permission: 'accounting.edit',
            description: 'ตรวจสอบค่าแนะนำ',
          },
        ],
      },
      {
        key: 'input-price-group',
        title: 'บันทึกราคาสินค้า',
        type: 'group',
        permission: 'accounting.view',
        items: [
          {
            key: 'price-input',
            title: 'รถและอุปกรณ์',
            to: '/account/price-input',
            permission: 'accounting.edit',
            description: 'บันทึกราคาสินค้า รถและอุปกรณ์',
          },
          {
            key: 'price-input-parts',
            title: 'อะไหล่',
            to: '/account/price-input-parts',
            permission: 'accounting.edit',
            description: 'บันทึกราคาสินค้า อะไหล่',
          },
          {
            key: 'price-input-edit',
            title: 'แก้ไขบันทึก',
            to: '/account/price-input-edit',
            permission: 'accounting.edit',
            description: 'บันทึกราคาสินค้า แก้ไขบันทึก',
          },
        ],
      },
      {
        key: 'reports-group',
        title: 'รายงาน',
        type: 'group',
        permission: 'accounting.view',
        items: [
          {
            key: 'accounting-reports',
            title: 'รายงานบัญชี',
            to: '/account/reports',
            permission: 'accounting.view',
            description: 'ดูรายงานบัญชีและการเงิน',
          },
          {
            key: 'daily-summary',
            title: 'สรุปรายวัน',
            to: '/account/daily-summary',
            permission: 'accounting.view',
            description: 'สรุปรายรับ-รายจ่ายประจำวัน',
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
            key: 'sale-assessment',
            title: 'ผลการประเมิน',
            to: '/sale-assessment',
            permission: 'sales.view',
            description: 'ดูผลการประเมิน',
          },
          {
            key: 'sale-reservation-edit',
            title: 'แก้ไขใบจอง',
            to: '/sale-reservation-edit',
            permission: 'sales.edit',
            description: 'แก้ไขใบจอง',
          },
          {
            key: 'sale-reservation-cancellation',
            title: 'ยกเลิกใบจอง',
            to: '/sale-reservation-cancellation',
            permission: 'sales.edit',
            description: 'ยกเลิกใบจอง',
          },
        ],
      },
      {
        key: 'sales-overview-group',
        title: 'ภาพรวมการขาย',
        type: 'group',
        permission: 'sales.view',
        items: [
          {
            key: 'sales-dashboard',
            title: 'แดชบอร์ดการขาย',
            to: '/sales/dashboard',
            permission: 'sales.view',
            description: 'ภาพรวมและสถิติการขาย',
          },
          {
            key: 'sales-performance',
            title: 'ผลการขาย',
            to: '/sales/performance',
            permission: 'sales.view',
            description: 'ดูผลการขายและเป้าหมาย',
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
        key: 'service-order',
        title: 'แจ้งบริการ/ประเมินราคา',
        to: '/service-order',
        permission: 'service.edit',
        description: 'แจ้งบริการและประเมินราคา',
      },
      {
        key: 'service-close',
        title: 'สรุปปิดงาน',
        to: '/service-close',
        permission: 'service.close',
        description: 'สรุปปิดงานบริการ',
      },
      {
        key: 'service-skc',
        title: 'จากระบบ SKC',
        to: '/service-data-skc',
        permission: 'service.edit',
        description: 'บันทึกงานบริการจากระบบ SKC',
      },
      {
        key: 'service-gas',
        title: 'บันทึกค่าน้ำมัน',
        to: '/service-gas',
        permission: 'service.edit',
        description: 'บันทึกค่าน้ำมันสำหรับงานบริการ',
      },
    ],
  },

  warehouse: {
    title: 'คลังสินค้า',
    icon: 'database',
    permission: 'inventory.view',
    items: [
      {
        key: 'inventory-overview-group',
        title: 'ภาพรวมคลังสินค้า',
        type: 'group',
        permission: 'inventory.view',
        items: [
          {
            key: 'inventory-dashboard',
            title: 'แดชบอร์ดคลังสินค้า',
            to: '/warehouse/dashboard',
            permission: 'inventory.view',
            description: 'ภาพรวมและสถิติคลังสินค้า',
          },
          {
            key: 'stock-levels',
            title: 'ระดับสต็อก',
            to: '/warehouse/stock-levels',
            permission: 'inventory.view',
            description: 'ดูระดับสต็อกสินค้าทั้งหมด',
          },
        ],
      },
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
            key: 'export-by-sale',
            title: 'จากการขายสินค้า',
            to: '/warehouse/export-by-sale',
            permission: 'inventory.edit',
            description: 'บันทึกการส่งออกจากการขาย',
          },
          {
            key: 'export-by-transfer',
            title: 'โอนสินค้าออก',
            to: '/warehouse/export-by-transfer',
            permission: 'inventory.edit',
            description: 'บันทึกการโอนสินค้าออก',
          },
          {
            key: 'other-export',
            title: 'อื่นๆ',
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
            key: 'import-parts',
            title: 'จากการซื้อสินค้า',
            to: '/warehouse/import-parts',
            permission: 'inventory.edit',
            description: 'บันทึกการรับอะไหล่จากการซื้อ',
          },
        ],
      },
      {
        key: 'other-group',
        title: 'อื่นๆ',
        type: 'group',
        permission: 'inventory.view',
        items: [
          {
            key: 'decal-record',
            title: 'บันทึกลอกลายรถ',
            to: '/warehouse/decal-record',
            permission: 'inventory.edit',
            description: 'บันทึกลอกลายรถ',
          },
          {
            key: 'decal-withdraw',
            title: 'เบิกลอกลายรถ',
            to: '/warehouse/decal-withdraw',
            permission: 'inventory.edit',
            description: 'เบิกลอกลายรถ',
          },
          {
            key: 'delivery-plans',
            title: 'แผนการส่งรถ',
            items: [
              {
                key: 'customer-deliver-plan',
                title: 'ส่งลูกค้า',
                to: '/warehouse/customer-deliver-plan',
                permission: 'inventory.edit',
                description: 'แผนการส่งรถลูกค้า',
              },
              {
                key: 'branch-deliver-plan',
                title: 'ส่งสาขา',
                to: '/warehouse/branch-deliver-plan',
                permission: 'inventory.edit',
                description: 'แผนการส่งรถสาขา',
              },
            ],
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
        key: 'credit-input-data',
        title: 'บันทึกข้อมูล',
        to: '/credit/input-data',
        permission: 'credit.edit',
        description: 'บันทึกข้อมูลสินเชื่อ',
      },
      {
        key: 'edit-sale-order',
        title: 'แก้ไขใบสั่งขาย',
        to: '/edit-sale-order',
        permission: 'credit.edit',
        description: 'แก้ไขใบสั่งขาย',
      },
    ],
  },

  hr: {
    title: 'บุคลากร',
    icon: 'team',
    permission: 'hr.view',
    items: [
      {
        key: 'work-records-group',
        title: 'บันทึกการทำงาน',
        type: 'group',
        permission: 'hr.view',
        items: [
          {
            key: 'leave',
            title: 'การลางาน',
            to: '/hr/leave',
            permission: 'hr.edit',
            description: 'บันทึกการลางาน',
          },
          {
            key: 'attendance',
            title: 'เวลาเข้างาน',
            to: '/hr/attendance',
            permission: 'hr.view',
            description: 'บันทึกเวลาเข้างาน',
          },
        ],
      },
      {
        key: 'employees',
        title: 'รายชื่อพนักงาน',
        to: '/employees',
        permission: 'hr.view',
        description: 'ดูรายชื่อพนักงาน',
      },
      {
        key: 'users',
        title: 'รายชื่อผู้ใช้งาน',
        to: '/users',
        permission: 'admin.view',
        description: 'ดูรายชื่อผู้ใช้งาน',
      },
    ],
  },

  reports: {
    title: 'รายงาน',
    icon: 'bar-chart',
    permission: 'reports.view',
    items: [
      {
        key: 'accounting-reports-group',
        title: 'บัญชี',
        type: 'group',
        permission: 'reports.view',
        items: [
          {
            key: 'income-expense-summary',
            title: 'สรุปรายรับ-รายจ่าย',
            to: '/reports/income-expense-summary',
            permission: 'reports.view',
            description: 'รายงานสรุปรายรับและรายจ่าย',
          },
          {
            key: 'income-reports',
            title: 'รายรับ',
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
              {
                key: 'tracktor-revenue',
                title: 'สรุปรายรับแทรกเตอร์ใหม่',
                to: '/reports/tracktor-revenue',
                permission: 'reports.view',
                description: 'รายงานสรุปรายรับแทรกเตอร์ใหม่',
              },
            ],
          },
          {
            key: 'expense-reports',
            title: 'รายจ่าย',
            items: [
              {
                key: 'expense-summary',
                title: 'สรุปรายจ่าย',
                to: '/reports/expense-summary',
                permission: 'reports.view',
                description: 'รายงานสรุปรายจ่าย',
              },
            ],
          },
          {
            key: 'tax-reports',
            title: 'ภาษี',
            items: [
              {
                key: 'tax-invoice-vehicles',
                title: 'ใบกำกับภาษีซื้อรถและอุปกรณ์ สำนักงานใหญ่',
                to: '/reports/account/tax-invoice-vehicles',
                permission: 'reports.view',
                description: 'ใบกำกับภาษีซื้อรถและอุปกรณ์',
              },
              {
                key: 'tax-invoice-parts',
                title: 'ใบกำกับภาษีซื้ออะไหล่ สำนักงานใหญ่',
                to: '/reports/account/tax-invoice-parts',
                permission: 'reports.view',
                description: 'ใบกำกับภาษีซื้ออะไหล่',
              },
            ],
          },
        ],
      },
      {
        key: 'sales-reports-group',
        title: 'งานขาย',
        type: 'group',
        permission: 'sales.view',
        items: [
          {
            key: 'booking-reports',
            title: 'งานรับจอง',
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
    ],
  },

  settings: {
    title: 'ตั้งค่า',
    icon: 'setting',
    permission: 'settings.view',
    items: [
      {
        key: 'settings-overview-group',
        title: 'ภาพรวมการตั้งค่า',
        type: 'group',
        permission: 'settings.view',
        items: [
          {
            key: 'settings-dashboard',
            title: 'แดชบอร์ดการตั้งค่า',
            to: '/settings/dashboard',
            permission: 'settings.view',
            description: 'ภาพรวมการตั้งค่าระบบ',
          },
          {
            key: 'system-info',
            title: 'ข้อมูลระบบ',
            to: '/settings/system-info',
            permission: 'settings.view',
            description: 'ดูข้อมูลและสถานะระบบ',
          },
        ],
      },
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
            key: 'parts',
            title: 'รายการอะไหล่',
            to: '/setting-parts',
            permission: 'settings.edit',
            description: 'จัดการรายการอะไหล่',
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
        key: 'service-settings',
        title: 'การบริการ',
        type: 'group',
        permission: 'settings.view',
        items: [
          {
            key: 'services',
            title: 'รหัสบริการ',
            to: '/setting-services',
            permission: 'settings.edit',
            description: 'จัดการรหัสบริการ',
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

  admin: {
    title: 'จัดการระบบ',
    icon: 'setting',
    permission: 'admin.view',
    authorities: ['ADMIN', 'MANAGER', 'LEAD'], // Allow hierarchical access to admin section
    items: [
      {
        key: 'user-approval',
        title: 'อนุมัติผู้ใช้งาน',
        to: '/admin/user-approval',
        permission: 'admin.approve',
        description: 'อนุมัติและปฏิเสธผู้ใช้งานใหม่ (ADMIN, MANAGER, LEAD)',
        authorities: ['ADMIN', 'MANAGER', 'LEAD'], // Level 4, 3, 2 - Add hierarchical access
      },
      {
        key: 'user-management',
        title: 'จัดการผู้ใช้งาน',
        to: '/admin/user-management',
        permission: ['users.manage', 'team.manage'], // Allow team management permissions
        description: 'จัดการข้อมูลและสถานะผู้ใช้ (ADMIN, MANAGER, LEAD)',
        authorities: ['ADMIN', 'MANAGER', 'LEAD'], // Level 4, 3, 2
      },
      {
        key: 'permission-management',
        title: 'จัดการสิทธิ์',
        to: '/admin/permission-management',
        permission: ['admin.edit', 'users.manage', 'team.manage'], // Multiple permission options
        description: 'กำหนดสิทธิ์การใช้งานระบบ (ADMIN, MANAGER, LEAD)',
        authorities: ['ADMIN', 'MANAGER', 'LEAD'], // Level 4, 3, 2
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
