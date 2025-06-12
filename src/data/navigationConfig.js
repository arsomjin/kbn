// Enhanced Navigation configuration with RBAC integration
export const NAVIGATION_CONFIG = {
  dashboard: {
    title: 'Dashboard',
    icon: 'dashboard',
    permission: null, // Always visible
    to: '/overview',
    description: 'ภาพรวมระบบและสถิติสำคัญ'
  },

  accounting: {
    title: 'บัญชีและการเงิน',
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
            frequency: 'daily',
            priority: 'high'
          },
          {
            key: 'income-after-close',
            title: 'รับเงินหลังปิดบัญชีประจำวัน',
            to: '/account/income-after-close-account',
            permission: 'accounting.edit',
            description: 'รับเงินหลังปิดบัญชีประจำวัน'
          },
          {
            key: 'income-skl',
            title: 'รับเงิน - SKL',
            to: '/account/income-skl',
            permission: 'accounting.edit',
            description: 'บันทึกรับเงินค่าขายสินค้า SKL'
          },
          {
            key: 'income-personal-loan',
            title: 'รับเงิน - สินเชื่อส่วนบุคคล',
            to: '/account/income-personal-loan',
            permission: 'accounting.edit',
            description: 'บันทึกรับเงินสินเชื่อส่วนบุคคล'
          },
          {
            key: 'income-baac',
            title: 'รับเงิน - ธกส.',
            to: '/account/income-baac',
            permission: 'accounting.edit',
            description: 'บันทึกรับเงินผ่าน ธกส.'
          },
          {
            key: 'daily-bank-deposit',
            title: 'เงินฝากธนาคาร - ประจำวัน',
            to: '/account/daily-bank-deposit',
            permission: 'accounting.edit',
            description: 'บันทึกการฝากเงินธนาคารประจำวัน'
          },
          {
            key: 'executive-cash-deposit',
            title: 'ฝากส่งเงินสด ผู้บริหาร - ประจำวัน',
            to: '/account/daily-executive-cash-deposit',
            permission: 'accounting.edit',
            description: 'บันทึกฝากส่งเงินสดผู้บริหารประจำวัน'
          }
        ]
      },
      {
        key: 'expense-group',
        title: 'รายจ่าย',
        type: 'group',
        permission: 'accounting.view',
        items: [
          {
            key: 'expense-input',
            title: 'บันทึกรายจ่าย',
            to: '/account/expense-input',
            permission: 'accounting.edit',
            description: 'บันทึกรายจ่ายทั่วไป',
            frequency: 'daily'
          },
          {
            key: 'expense-transfer-cycle',
            title: 'บันทึกรอบการโอนเงิน',
            to: '/account/expense-transfer-cycle',
            permission: 'accounting.edit',
            description: 'บันทึกรอบการโอนเงิน'
          },
          {
            key: 'expense-referrer',
            title: 'ตรวจสอบค่าแนะนำ',
            to: '/account/expense-referrer',
            permission: 'accounting.view',
            description: 'ตรวจสอบค่าคอมมิชชั่นผู้แนะนำ'
          }
        ]
      },
      {
        key: 'price-group',
        title: 'บันทึกราคาสินค้า',
        type: 'group',
        permission: 'accounting.edit',
        items: [
          {
            key: 'price-vehicles',
            title: 'รถและอุปกรณ์',
            to: '/account/price-input',
            permission: 'accounting.edit',
            description: 'บันทึกราคาสินค้ารถและอุปกรณ์'
          },
          {
            key: 'price-parts',
            title: 'อะไหล่',
            to: '/account/price-input-parts',
            permission: 'accounting.edit',
            description: 'บันทึกราคาอะไหล่'
          },
          {
            key: 'price-input-edit',
            title: 'แก้ไขบันทึก',
            to: '/account/price-input-edit',
            permission: 'accounting.edit',
            description: 'แก้ไขบันทึกราคาสินค้า'
          }
        ]
      }
    ]
  },

  sales: {
    title: 'งานขาย',
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
            key: 'booking-create',
            title: 'บันทึกใบจอง',
            to: '/sale-booking',
            permission: 'sales.edit',
            description: 'สร้างใบจองใหม่',
            priority: 'high',
            frequency: 'daily'
          },
          {
            key: 'booking-assessment',
            title: 'ผลการประเมิน',
            to: '/sale-assessment',
            permission: 'sales.view',
            description: 'ดูผลการประเมินลูกค้า'
          },
          {
            key: 'booking-edit',
            title: 'แก้ไขใบจอง',
            to: '/sale-reservation-edit',
            permission: 'sales.edit',
            description: 'แก้ไขข้อมูลใบจอง'
          },
          {
            key: 'booking-cancel',
            title: 'ยกเลิกใบจอง',
            to: '/sale-reservation-cancellation',
            permission: 'sales.review',
            description: 'ยกเลิกใบจอง'
          }
        ]
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
            description: 'บันทึกการขายรถและอุปกรณ์'
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
                description: 'บันทึกการขายอะไหล่'
              },
              {
                key: 'sale-parts-skc',
                title: 'จากระบบ SKC',
                to: '/skc-sale-parts',
                permission: 'sales.edit',
                description: 'บันทึกการขายอะไหล่จากระบบ SKC'
              }
            ]
          },
          {
            key: 'sale-marketing',
            title: 'การตลาด',
            to: '/sale-marketing',
            permission: 'sales.view',
            description: 'กิจกรรมการตลาดและส่งเสริมการขาย'
          }
        ]
      }
    ]
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
        frequency: 'daily',
        priority: 'high'
      },
      {
        key: 'service-close',
        title: 'สรุปปิดงาน',
        to: '/service-close',
        permission: 'service.edit',
        description: 'สรุปและปิดงานบริการ'
      },
      {
        key: 'service-data-skc',
        title: 'จากระบบ SKC',
        to: '/service-data-skc',
        permission: 'service.view',
        description: 'ข้อมูลบริการจากระบบ SKC'
      },
      {
        key: 'service-gas',
        title: 'บันทึกค่าน้ำมัน',
        to: '/service-gas',
        permission: 'service.edit',
        description: 'บันทึกค่าน้ำมันงานบริการ'
      }
    ]
  },

  inventory: {
    title: 'คลังสินค้า',
    icon: 'database',
    permission: 'inventory.view',
    items: [
      {
        key: 'vehicles-equipment-group',
        title: 'รถและอุปกรณ์',
        type: 'group',
        permission: 'inventory.view',
        items: [
          {
            key: 'purchase-planning',
            title: 'การสั่งซื้อ',
            type: 'subMenu',
            permission: 'inventory.edit',
            items: [
              {
                key: 'purchase-plan',
                title: 'วางแผน',
                to: '/warehouse/purchase-plan',
                permission: 'inventory.edit',
                description: 'วางแผนการสั่งซื้อ'
              }
            ]
          },
          {
            key: 'goods-receiving',
            title: 'การรับสินค้า',
            type: 'subMenu',
            permission: 'inventory.edit',
            items: [
              {
                key: 'import-by-purchase',
                title: 'จากการซื้อสินค้า',
                to: '/warehouse/import-by-purchase',
                permission: 'inventory.edit',
                description: 'รับสินค้าจากการซื้อ'
              },
              {
                key: 'import-by-transfer',
                title: 'รับโอนสินค้า',
                to: '/warehouse/import-by-transfer',
                permission: 'inventory.edit',
                description: 'รับโอนสินค้าจากสาขาอื่น'
              },
              {
                key: 'other-import',
                title: 'รับจากอื่นๆ',
                to: '/warehouse/other-import',
                permission: 'inventory.edit',
                description: 'รับสินค้าจากแหล่งอื่น'
              }
            ]
          },
          {
            key: 'goods-dispatching',
            title: 'การจ่ายสินค้า',
            type: 'subMenu',
            permission: 'inventory.edit',
            items: [
              {
                key: 'export-by-sale',
                title: 'จากการขายสินค้า',
                to: '/warehouse/export-by-sale',
                permission: 'inventory.edit',
                description: 'จ่ายสินค้าจากการขาย'
              },
              {
                key: 'export-by-transfer',
                title: 'โอนสินค้าออก',
                to: '/warehouse/export-by-transfer',
                permission: 'inventory.edit',
                description: 'โอนสินค้าออกไปสาขาอื่น'
              },
              {
                key: 'other-export',
                title: 'อื่นๆ',
                to: '/warehouse/other-export',
                permission: 'inventory.edit',
                description: 'จ่ายสินค้าอื่นๆ'
              }
            ]
          }
        ]
      },
      {
        key: 'parts-oil-group',
        title: 'อะไหล่ น้ำมัน',
        type: 'group',
        permission: 'inventory.view',
        items: [
          {
            key: 'parts-receiving',
            title: 'การรับสินค้า',
            type: 'subMenu',
            permission: 'inventory.edit',
            items: [
              {
                key: 'import-parts',
                title: 'จากการซื้อสินค้า',
                to: '/warehouse/import-parts',
                permission: 'inventory.edit',
                description: 'รับอะไหล่จากการซื้อ'
              }
            ]
          }
        ]
      },
      {
        key: 'other-warehouse-group',
        title: 'อื่นๆ',
        type: 'group',
        permission: 'inventory.view',
        items: [
          {
            key: 'decal-record',
            title: 'บันทึกลอกลายรถ',
            to: '/warehouse/decal-record',
            permission: 'inventory.edit',
            description: 'บันทึกข้อมูลลอกลายรถ'
          },
          {
            key: 'decal-withdraw',
            title: 'เบิกลอกลายรถ',
            to: '/warehouse/decal-withdraw',
            permission: 'inventory.edit',
            description: 'เบิกลอกลายรถ'
          },
          {
            key: 'delivery-plan',
            title: 'แผนการส่งรถ',
            type: 'subMenu',
            permission: 'inventory.view',
            items: [
              {
                key: 'customer-delivery-plan',
                title: 'ส่งลูกค้า',
                to: '/warehouse/customer-deliver-plan',
                permission: 'inventory.view',
                description: 'แผนการส่งรถให้ลูกค้า'
              },
              {
                key: 'branch-delivery-plan',
                title: 'ส่งสาขา',
                to: '/warehouse/branch-deliver-plan',
                permission: 'inventory.view',
                description: 'แผนการส่งรถไปสาขา'
              }
            ]
          }
        ]
      }
    ]
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
        frequency: 'daily'
      },
      {
        key: 'edit-sale-order',
        title: 'แก้ไขใบสั่งขาย',
        to: '/edit-sale-order',
        permission: 'credit.edit',
        description: 'แก้ไขข้อมูลใบสั่งขาย'
      }
    ]
  },

  reports: {
    title: 'รายงาน',
    icon: 'bar-chart',
    permission: 'reports.view',
    items: [
      {
        key: 'accounting-reports',
        title: 'บัญชี',
        type: 'group',
        permission: 'accounting.view',
        items: [
          {
            key: 'income-expense-summary',
            title: 'สรุปรายรับ-รายจ่าย',
            to: '/reports/income-expense-summary',
            permission: 'accounting.view',
            description: 'รายงานสรุปรายรับและรายจ่าย'
          },
          {
            key: 'income-reports',
            title: 'รายรับ',
            permission: 'accounting.view',
            items: [
              {
                key: 'income-summary',
                title: 'สรุปรายรับ',
                to: '/reports/income-summary',
                permission: 'accounting.view',
                description: 'รายงานสรุปรายรับรายวัน/รายเดือน'
              },
              {
                key: 'daily-money-summary',
                title: 'สรุปส่งเงินประจำวัน',
                to: '/reports/daily-money-summary',
                permission: 'accounting.view',
                description: 'สรุปการส่งเงินประจำวัน'
              },
              {
                key: 'bank-deposit',
                title: 'เงินฝากธนาคาร',
                to: '/reports/bank-deposit',
                permission: 'accounting.view',
                description: 'รายงานการฝากเงินธนาคาร'
              },
              {
                key: 'income-parts-kbn',
                title: 'แยกขายอะไหล่ KBN',
                to: '/reports/income-parts-kbn',
                permission: 'accounting.view',
                description: 'รายงานรายรับจากการขายอะไหล่ KBN'
              },
              {
                key: 'income-personal-loan-report',
                title: 'รายรับ - สินเชื่อส่วนบุคคล',
                to: '/reports/income-personal-loan',
                permission: 'accounting.view',
                description: 'รายงานรายรับจากสินเชื่อส่วนบุคคล'
              },
              {
                key: 'income-parts-all',
                title: 'รายรับขายอะไหล่รวม',
                to: '/reports/income-parts-all',
                permission: 'accounting.view',
                description: 'รายงานรายรับจากการขายอะไหล่รวม'
              },
              {
                key: 'money-return',
                title: 'รับเงินคืน',
                to: '/reports/money-return',
                permission: 'accounting.view',
                description: 'รายงานการรับเงินคืน'
              },
              {
                key: 'income-others',
                title: 'รายรับอื่นๆ',
                to: '/reports/income-others',
                permission: 'accounting.view',
                description: 'รายงานรายรับอื่นๆ'
              },
              {
                key: 'tracktor-revenue',
                title: 'สรุปรายรับแทรกเตอร์ใหม่',
                to: '/reports/tracktor-revenue',
                permission: 'accounting.view',
                description: 'รายงานรายรับจากแทรกเตอร์ใหม่'
              }
            ]
          },
          {
            key: 'expense-reports',
            title: 'รายจ่าย',
            permission: 'accounting.view',
            items: [
              {
                key: 'expense-summary',
                title: 'สรุปรายจ่าย',
                to: '/reports/expense-summary',
                permission: 'accounting.view',
                description: 'รายงานสรุปรายจ่าย'
              }
            ]
          },
          {
            key: 'tax-reports',
            title: 'ภาษี',
            permission: 'accounting.view',
            items: [
              {
                key: 'tax-invoice-vehicles',
                title: 'ใบกำกับภาษีซื้อรถและอุปกรณ์ สำนักงานใหญ่',
                to: '/reports/account/tax-invoice-vehicles',
                permission: 'accounting.view',
                description: 'รายงานใบกำกับภาษีซื้อรถและอุปกรณ์'
              },
              {
                key: 'tax-invoice-parts',
                title: 'ใบกำกับภาษีซื้ออะไหล่ สำนักงานใหญ่',
                to: '/reports/account/tax-invoice-parts',
                permission: 'accounting.view',
                description: 'รายงานใบกำกับภาษีซื้ออะไหล่'
              }
            ]
          }
        ]
      },
      {
        key: 'sales-reports',
        title: 'งานขาย',
        type: 'group',
        permission: 'sales.view',
        items: [
          {
            key: 'booking-reports',
            title: 'งานรับจอง',
            permission: 'sales.view',
            items: [
              {
                key: 'sale-booking-analytics',
                title: 'ภาพรวมงานรับจอง',
                to: '/reports/sale-booking-analytics',
                permission: 'sales.view',
                description: 'ภาพรวมและวิเคราะห์งานรับจอง'
              },
              {
                key: 'sale-booking-summary',
                title: 'สรุปงานรับจอง',
                to: '/reports/sale-booking-summary',
                permission: 'sales.view',
                description: 'สรุปผลงานรับจอง'
              },
              {
                key: 'sale-assessment',
                title: 'ผลการประเมิน',
                to: '/reports/sale-assessment',
                permission: 'sales.view',
                description: 'รายงานผลการประเมิน'
              },
              {
                key: 'reservation-cancellation',
                title: 'ยกเลิกใบจอง',
                to: '/reports/reservation-cancellation',
                permission: 'sales.view',
                description: 'รายงานการยกเลิกใบจอง'
              },
              {
                key: 'all-reservation',
                title: 'ยอดจองคงเหลือ',
                to: '/reports/all-reservation',
                permission: 'sales.view',
                description: 'รายงานยอดจองคงเหลือ'
              }
            ]
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
                description: 'ภาพรวมและวิเคราะห์งานขาย'
              },
              {
                key: 'sale-summary',
                title: 'สรุปงานขาย',
                to: '/reports/sale-summary',
                permission: 'sales.view',
                description: 'สรุปผลงานขาย'
              }
            ]
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
                description: 'รายงานข้อมูลลูกค้า'
              },
              {
                key: 'marketing-channels',
                title: 'แหล่งที่มา',
                to: '/reports/mkt/marketing-channels',
                permission: 'sales.view',
                description: 'รายงานแหล่งที่มาของลูกค้า'
              }
            ]
          }
        ]
      },
      {
        key: 'service-reports',
        title: 'งานบริการ',
        type: 'group',
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
                description: 'รายงานการบันทึกงานบริการประจำวัน'
              },
              {
                key: 'service-daily-income',
                title: 'สรุปรายรับ',
                to: '/reports/service-daily/income',
                permission: 'service.view',
                description: 'รายงานสรุปรายรับจากงานบริการ'
              }
            ]
          },
          {
            key: 'service-customer',
            title: 'จำนวนลูกค้า',
            to: '/reports/service-customer',
            permission: 'service.view',
            description: 'รายงานจำนวนลูกค้าที่ใช้บริการ'
          },
          {
            key: 'service-type',
            title: 'สรุปประเภท',
            to: '/reports/service-type',
            permission: 'service.view',
            description: 'รายงานสรุปประเภทการบริการ'
          },
          {
            key: 'service-amount',
            title: 'สรุปยอด',
            to: '/reports/service-amount',
            permission: 'service.view',
            description: 'รายงานสรุปยอดการบริการ'
          },
          {
            key: 'service-mechanic',
            title: 'จัดอันดับช่าง',
            to: '/reports/service-mechanic',
            permission: 'service.view',
            description: 'รายงานจัดอันดับช่างซ่อม'
          }
        ]
      },
      {
        key: 'warehouse-reports',
        title: 'คลังสินค้า',
        type: 'group',
        permission: 'inventory.view',
        items: [
          {
            key: 'warehouse-vehicles-reports',
            title: 'รถและอุปกรณ์',
            permission: 'inventory.view',
            items: [
              {
                key: 'warehouse-vehicle-models',
                title: 'รายการสินค้า',
                to: '/reports/warehouse/vehicles/models',
                permission: 'inventory.view',
                description: 'รายงานรายการรถและอุปกรณ์'
              },
              {
                key: 'warehouse-vehicle-stocks',
                title: 'คลังสินค้า',
                to: '/reports/warehouse/vehicles/stocks',
                permission: 'inventory.view',
                description: 'รายงานสต็อกคลังสินค้า'
              },
              {
                key: 'warehouse-transfer-out',
                title: 'โอนย้าย(ออก)',
                to: '/reports/warehouse/vehicles/transferOut',
                permission: 'inventory.view',
                description: 'รายงานการโอนสินค้าออก'
              },
              {
                key: 'warehouse-transfer-in',
                title: 'รับโอน(เข้า)',
                to: '/reports/warehouse/vehicles/transferIn',
                permission: 'inventory.view',
                description: 'รายงานการรับโอนสินค้าเข้า'
              },
              {
                key: 'warehouse-decal',
                title: 'ทะเบียนคุมลอกลายรถ',
                to: '/reports/warehouse/decal',
                permission: 'inventory.view',
                description: 'รายงานทะเบียนคุมลอกลายรถ'
              },
              {
                key: 'customer-delivery-plan-report',
                title: 'แผนการส่งรถลูกค้า',
                to: '/reports/warehouse/vehicles/customerDeliveryPlan',
                permission: 'inventory.view',
                description: 'รายงานแผนการส่งรถให้ลูกค้า'
              },
              {
                key: 'branch-delivery-plan-report', 
                title: 'แผนการส่งรถสาขา',
                to: '/reports/warehouse/vehicles/branchDeliveryPlan',
                permission: 'inventory.view',
                description: 'รายงานแผนการส่งรถไปสาขา'
              }
            ]
          },
          {
            key: 'warehouse-giveaways',
            title: 'ของแถม',
            to: '/reports/warehouse/giveaways',
            permission: 'inventory.view',
            description: 'รายงานของแถม'
          }
        ]
      },
      {
        key: 'credit-reports',
        title: 'สินเชื่อ',
        type: 'group',
        permission: 'credit.view',
        items: [
          {
            key: 'credit-summary',
            title: 'สรุปยอดตัดขาย-รับเงิน',
            to: '/reports/credit/summary',
            permission: 'credit.view',
            description: 'รายงานสรุปยอดตัดขายและรับเงิน'
          },
          {
            key: 'credit-summary-daily',
            title: 'สรุปยอดประจำวัน (สินเชื่อ)',
            to: '/reports/credit/summary-daily',
            permission: 'credit.view',
            description: 'รายงานสรุปยอดสินเชื่อประจำวัน'
          }
        ]
      },
      {
        key: 'hr-reports',
        title: 'บุคคล',
        type: 'group',
        permission: 'hr.view',
        items: [
          {
            key: 'hr-attendance',
            title: 'สถิติการทำงาน',
            to: '/reports/hr/attendance',
            permission: 'hr.view',
            description: 'รายงานสถิติการทำงานของพนักงาน'
          },
          {
            key: 'hr-leaving',
            title: 'การลางาน',
            to: '/reports/hr/leaving',
            permission: 'hr.view',
            description: 'รายงานการลางานของพนักงาน'
          },
          {
            key: 'hr-attendance-summary',
            title: 'การลางานประจำปี',
            to: '/reports/hr/attendance-summary',
            permission: 'hr.view',
            description: 'รายงานสรุปการลางานประจำปี'
          }
        ]
      }
    ]
  },

  hr: {
    title: 'บุคคล',
    icon: 'team',
    permission: 'hr.view',
    items: [
      {
        key: 'work-recording',
        title: 'บันทึกการทำงาน',
        type: 'group',
        permission: 'hr.view',
        items: [
          {
            key: 'leave-record',
            title: 'การลางาน',
            to: '/hr/leave',
            permission: 'hr.edit',
            description: 'บันทึกการลางาน'
          },
          {
            key: 'attendance',
            title: 'เวลาเข้างาน',
            to: '/hr/attendance',
            permission: 'hr.view',
            description: 'บันทึกเวลาเข้างาน'
          }
        ]
      },
      {
        key: 'employee-list',
        title: 'รายชื่อพนักงาน',
        to: '/employees',
        permission: 'hr.view',
        description: 'รายชื่อพนักงานทั้งหมด'
      },
      {
        key: 'user-list',
        title: 'รายชื่อผู้ใช้งาน',
        to: '/users',
        permission: 'hr.view',
        description: 'รายชื่อผู้ใช้งานระบบ',
        priority: 'medium'
      }
    ]
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
        description: 'อนุมัติและปฏิเสธผู้ใช้งานใหม่'
      },
      {
        key: 'user-management',
        title: 'จัดการผู้ใช้งาน',
        to: '/admin/user-management',
        permission: 'users.manage',
        description: 'จัดการข้อมูลและสถานะผู้ใช้'
      },
      {
        key: 'permission-management',
        title: 'จัดการสิทธิ์',
        to: '/admin/permission-management',
        permission: 'admin.edit',
        description: 'กำหนดสิทธิ์การใช้งานระบบ'
      }
    ]
  },

  settings: {
    title: 'ตั้งค่าระบบ',
    icon: 'setting',
    permission: 'admin.view',
    items: [
      {
        key: 'general-settings',
        title: 'ทั่วไป',
        type: 'group',
        permission: 'admin.view',
        items: [
          {
            key: 'setting-branches',
            title: 'สาขา',
            to: '/setting-branches',
            permission: 'admin.edit',
            description: 'จัดการข้อมูลสาขา'
          },
          {
            key: 'setting-users',
            title: 'กลุ่มผู้ใช้งาน',
            to: '/setting-users',
            permission: 'admin.edit',
            description: 'จัดการกลุ่มผู้ใช้งาน'
          }
        ]
      },
      {
        key: 'warehouse-settings',
        title: 'คลังสินค้า',
        type: 'group',
        permission: 'admin.edit',
        items: [
          {
            key: 'setting-vehicles',
            title: 'รายการรถและอุปกรณ์',
            to: '/setting-vehicles',
            permission: 'admin.edit',
            description: 'จัดการรายการรถและอุปกรณ์'
          },
          {
            key: 'setting-parts',
            title: 'รายการอะไหล่',
            to: '/setting-parts',
            permission: 'admin.edit',
            description: 'จัดการรายการอะไหล่'
          }
        ]
      },
      {
        key: 'service-settings',
        title: 'การบริการ',
        type: 'group',
        permission: 'admin.edit',
        items: [
          {
            key: 'setting-services',
            title: 'รหัสบริการ',
            to: '/setting-services',
            permission: 'admin.edit',
            description: 'จัดการรหัสบริการ'
          }
        ]
      },
      {
        key: 'sales-settings',
        title: 'การขาย',
        type: 'group',
        permission: 'admin.edit',
        items: [
          {
            key: 'setting-promotions',
            title: 'โปรโมชั่น',
            to: '/setting-promotions',
            permission: 'admin.edit',
            description: 'จัดการโปรโมชั่น'
          }
        ]
      },
      {
        key: 'accounting-settings',
        title: 'บัญชี',
        type: 'group',
        permission: 'admin.edit',
        items: [
          {
            key: 'setting-expense-category',
            title: 'หมวดรายจ่าย',
            to: '/setting-expense-category',
            permission: 'admin.edit',
            description: 'จัดการหมวดรายจ่าย'
          },
          {
            key: 'setting-expense-subCategory',
            title: 'หมวดย่อย',
            to: '/setting-expense-subCategory',
            permission: 'admin.edit',
            description: 'จัดการหมวดย่อยรายจ่าย'
          },
          {
            key: 'setting-expense-name',
            title: 'ชื่อบัญชี',
            to: '/setting-expense-name',
            permission: 'admin.edit',
            description: 'จัดการชื่อบัญชีรายจ่าย'
          }
        ]
      }
    ]
  },

  // manual: {
  //   title: 'คู่มือการใช้งาน',
  //   icon: 'database',
  //   permission: null, // Everyone can access
  //   items: [
  //     {
  //       key: 'manual-account',
  //       title: 'บัญชี',
  //       to: '/user-manual/account',
  //       description: 'คู่มือการใช้งานระบบบัญชี'
  //     },
  //     {
  //       key: 'manual-sale',
  //       title: 'งานขาย',
  //       to: '/user-manual/sale',
  //       description: 'คู่มือการใช้งานระบบขาย'
  //     },
  //     {
  //       key: 'manual-service',
  //       title: 'งานบริการ',
  //       to: '/user-manual/service',
  //       description: 'คู่มือการใช้งานระบบบริการ'
  //     },
  //     {
  //       key: 'manual-warehouse',
  //       title: 'คลังสินค้า',
  //       to: '/user-manual/warehouse',
  //       description: 'คู่มือการใช้งานระบบคลังสินค้า'
  //     },
  //     {
  //       key: 'manual-credit',
  //       title: 'สินเชื่อ',
  //       to: '/user-manual/credit',
  //       description: 'คู่มือการใช้งานระบบสินเชื่อ'
  //     }
  //   ]
  // },

  executive: {
    title: 'เผยแพร่',
    icon: 'notification',
    permission: 'notifications.edit', // Permission for sending notifications - can be assigned to any user
    items: [
      {
        key: 'notifications',
        title: 'การแจ้งเตือน',
        to: '/executive/send-notification',
        description: 'ส่งการแจ้งเตือนไปยังผู้ใช้งาน',
        permission: 'notifications.edit',
        priority: 'high'
      }
    ]
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
        description: 'ข้อมูลเกี่ยวกับบริษัท'
      },
      {
        key: 'changelogs',
        title: 'บันทึกการเปลี่ยนแปลง',
        to: '/changelogs',
        description: 'ประวัติการอัพเดทระบบ'
      }
    ]
  },

  developer: {
    title: 'พัฒนาระบบ',
    icon: 'code',
    permission: null, // Special handling - only for isDev users
    isDeveloperOnly: true, // Special flag for developer menu
    items: [
      {
        key: 'clean-slate-rbac-group',
        title: 'Clean Slate RBAC',
        type: 'group',
        items: [
          {
            key: 'clean-slate-rbac-demo',
            title: 'Clean Slate RBAC Demo',
            to: '/dev/clean-slate-rbac-demo',
            description: 'ทดสอบระบบ Clean Slate RBAC ใหม่ - 4×3×6 Matrix',
            priority: 'critical'
          },
          {
            key: 'clean-slate-layout-demo',
            title: 'Layout with Enhanced ProvinceId',
            to: '/dev/clean-slate-layout-demo',
            description: 'ทดสอบ LayoutWithRBAC และ ProvinceId Injection',
            priority: 'high'
          },
          {
            key: 'clean-slate-permissions-demo',
            title: 'Permission System Demo',
            to: '/dev/clean-slate-permissions-demo',
            description: 'ทดสอบระบบ Permission แบบ department.action',
            priority: 'high'
          },
          {
            key: 'clean-slate-migration-demo',
            title: 'Migration Demo',
            to: '/dev/clean-slate-migration-demo',
            description: 'ทดสอบการ migrate จาก Legacy เป็น Clean Slate',
            priority: 'high'
          },
          {
            key: 'rbac-integration-tester',
            title: '🎯 RBAC Integration Tester',
            to: '/dev/rbac-integration-tester',
            description: 'ทดสอบการ integrate RBAC กับทุก component ในระบบ',
            priority: 'critical'
          }
        ]
      },
      {
        key: 'legacy-test-group',
        title: 'Legacy Tests (Deprecated)',
        type: 'group',
        items: [
          {
            key: 'test-access-control-legacy',
            title: '⚠️ Legacy Access Control',
            to: '/developer/test-access-control',
            description: '[DEPRECATED] ระบบหลายจังหวัดแบบเก่า - ใช้ Clean Slate แทน',
            priority: 'low',
            deprecated: true
          },
          {
            key: 'test-granular-roles-legacy',
            title: '⚠️ Legacy Granular Roles',
            to: '/dev/test-granular-roles',
            description: '[DEPRECATED] ระบบบทบาทแบบเก่า - ใช้ Clean Slate แทน',
            priority: 'low',
            deprecated: true
          }
        ]
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
            description: 'เทมเพลตหน้าเว็บ'
          },
          {
            key: 'template-page2',
            title: 'Page with search header',
            to: '/developer/template-page2',
            description: 'เทมเพลตหน้าเว็บพร้อมค้นหา'
          },
          {
            key: 'template-pdf',
            title: 'PDF Viewer',
            to: '/developer/template-pdf-viewer',
            description: 'เทมเพลตแสดง PDF'
          },
          {
            key: 'template-format',
            title: 'FormatContent',
            to: '/developer/format-content',
            description: 'เทมเพลตจัดรูปแบบเนื้อหา'
          }
        ]
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
            description: 'ทดสอบการพิมพ์'
          }
        ]
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
            description: 'ตรวจสอบและอัพเดทข้อมูล'
          }
        ]
      },
      {
        key: 'migration-group',
        title: 'Migration',
        type: 'group',
        items: [
          {
            key: 'urgent-rbac-migration',
            title: '🚨 URGENT RBAC Migration',
            to: '/developer/migration-tools',
            description: 'แก้ไขปัญหา Clean Slate RBAC ที่ขาดข้อมูล access structure - กด tab "URGENT RBAC Migration" เมื่อถึงหน้า Migration Tools',
            priority: 'critical',
            warning: 'Required for Clean Slate RBAC fixes',
            badge: 'URGENT',
            defaultTab: 'urgent-rbac'
          },
          {
            key: 'migration-tools',
            title: 'Migration Tools',
            to: '/developer/migration-tools',
            description: 'เครื่องมือสำหรับการ migrate ข้อมูลหลายจังหวัด',
            priority: 'high'
          },
          {
            key: 'phase3-migration',
            title: 'Phase 3 Migration',
            to: '/developer/phase3-migration',
            description: 'การ migrate ข้อมูล Phase 3',
            priority: 'high'
          }
        ]
      }
    ]
  }

};

// Helper function to get all navigation items in flat structure
export const getAllNavigationPaths = () => {
  const paths = [];
  
  Object.values(NAVIGATION_CONFIG).forEach(section => {
    if (section.items) {
      section.items.forEach(item => {
        if (item.to) {
          paths.push(item.to);
        }
        if (item.items) {
          item.items.forEach(subItem => {
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