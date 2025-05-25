import { UserRole } from '../constants/roles';
import { PERMISSIONS } from '../constants/Permissions';
import { useTranslation } from 'react-i18next';

// Latest menu key = 285

export function useSidebarNavItems() {
  const { t } = useTranslation();

  return [
    {
      title: 'Dashboard',
      items: [
        {
          title: 'หน้าแรก',
          to: '/overview',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">&#xE917;</i>',
          htmlAfter: '',
          key: '1'
        }
      ],
      key: '2'
    },
    {
      title: 'Account',
      key: '3',
      items: [
        {
          title: 'บัญชี',
          key: '4',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">vertical_split</i>',
          open: false,
          items: [
            {
              title: 'รายรับ',
              key: '5',
              type: 'group',
              items: [
                {
                  title: 'รับเงินประจำวัน',
                  key: '6',
                  to: '/account/income-daily',
                  permission: PERMISSIONS.VIEW_INCOME
                },
                {
                  title: 'รับเงินหลังปิดบัญชีประจำวัน',
                  key: '7',
                  to: '/account/income-after-close-account',
                  permission: PERMISSIONS.VIEW_INCOME
                },
                {
                  title: 'รับเงิน - SKL',
                  key: '8',
                  to: '/account/income-skl',
                  permission: PERMISSIONS.VIEW_INCOME
                },
                {
                  title: 'รับเงิน - สินเชื่อส่วนบุคคล',
                  key: '284',
                  to: '/account/income-personal-loan',
                  permission: PERMISSIONS.VIEW_INCOME
                },
                {
                  title: 'รับเงิน - ธกส.',
                  key: '9',
                  to: '/account/income-baac',
                  permission: PERMISSIONS.VIEW_INCOME
                },
                {
                  title: 'เงินฝากธนาคาร - ประจำวัน',
                  key: '182',
                  to: '/account/daily-bank-deposit',
                  permission: PERMISSIONS.VIEW_INCOME
                }
              ]
            },
            {
              title: 'รายจ่าย',
              key: '19',
              type: 'group',
              items: [
                {
                  title: 'บันทึกรายจ่าย',
                  key: '21',
                  to: '/account/expense-input'
                },
                {
                  title: 'บันทึกรอบการโอนเงิน',
                  key: '205',
                  to: '/account/expense-transfer-cycle'
                },
                {
                  title: 'ตรวจสอบค่าแนะนำ',
                  key: '260',
                  to: '/account/expense-referrer'
                }
              ]
            },
            {
              title: 'บันทึกราคาสินค้า',
              key: '203',
              type: 'group',
              items: [
                {
                  title: 'รถและอุปกรณ์',
                  key: '204',
                  to: '/account/price-input'
                },
                {
                  title: 'อะไหล่',
                  key: '222',
                  to: '/account/price-input-parts'
                },
                {
                  title: 'แก้ไขบันทึก',
                  key: '250',
                  to: '/account/price-input-edit'
                }
              ]
            }
          ],
          permCat: 'permCat002'
        }
      ]
    },
    {
      title: 'Sales',
      key: '22',
      items: [
        {
          title: 'งานขาย',
          key: '23',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">loyalty</i>',
          open: false,
          items: [
            {
              title: 'งานรับจอง',
              key: '24',
              type: 'group',
              items: [
                {
                  title: 'บันทึกใบจอง',
                  key: '25',
                  to: '/sale-booking'
                },
                {
                  title: 'ผลการประเมิน',
                  key: '201',
                  to: '/sale-assessment'
                },
                {
                  title: 'แก้ไขใบจอง',
                  key: '270',
                  to: '/sale-reservation-edit'
                },
                {
                  title: 'ยกเลิกใบจอง',
                  key: '240',
                  to: '/sale-reservation-cancellation'
                }
              ]
            },
            {
              title: 'งานขาย',
              key: '26',
              type: 'group',
              items: [
                {
                  title: 'รถและอุปกรณ์',
                  key: '27',
                  to: '/sale-machines'
                },
                {
                  title: 'อะไหล่',
                  key: '28',
                  items: [
                    {
                      title: 'บันทึกข้อมูล',
                      key: '224',
                      to: '/sale-parts'
                    },
                    {
                      title: 'จากระบบ SKC',
                      key: '223',
                      to: '/skc-sale-parts'
                    }
                  ]
                },
                {
                  title: 'การตลาด',
                  key: '29',
                  to: '/sale-marketing'
                }
              ]
            }
          ],
          permCat: 'permCat003'
        }
      ]
    },
    {
      title: 'Services',
      key: '30',
      items: [
        {
          title: 'งานบริการ',
          key: '31',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">store_mall_directory</i>',
          open: false,
          items: [
            {
              title: 'แจ้งบริการ/ประเมินราคา',
              key: '32',
              to: '/service-order'
            },
            {
              title: 'สรุปปิดงาน',
              key: '226',
              to: '/service-close'
            },
            {
              title: 'จากระบบ SKC',
              key: '33',
              to: '/service-data-skc'
            },
            {
              title: 'บันทึกค่าน้ำมัน',
              key: '34',
              to: '/service-gas'
            }
          ],
          permCat: 'permCat003'
        }
      ]
    },
    {
      title: 'Warehouse',
      key: '35',
      items: [
        {
          title: 'คลังสินค้า',
          key: '36',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">home_work</i>',
          open: false,
          items: [
            {
              title: 'รถและอุปกรณ์',
              key: '37',
              type: 'group',
              items: [
                {
                  title: 'การสั่งซื้อ',
                  key: '38',
                  type: 'subMenu',
                  items: [
                    {
                      title: 'วางแผน',
                      key: '39',
                      to: '/warehouse/purchase-plan'
                    }
                  ]
                },
                {
                  title: 'การรับสินค้า',
                  key: '41',
                  type: 'subMenu',
                  items: [
                    {
                      title: 'จากการซื้อสินค้า',
                      key: '42',
                      to: '/warehouse/import-by-purchase'
                    },
                    {
                      title: 'รับโอนสินค้า',
                      key: '43',
                      to: '/warehouse/import-by-transfer'
                    },
                    {
                      title: 'รับจากอื่นๆ',
                      key: '44',
                      to: '/warehouse/other-import'
                    }
                  ]
                },
                {
                  title: 'การจ่ายสินค้า',
                  key: '45',
                  type: 'subMenu',
                  items: [
                    {
                      title: 'จากการขายสินค้า',
                      key: '46',
                      to: '/warehouse/export-by-sale'
                    },
                    {
                      title: 'โอนสินค้าออก',
                      key: '47',
                      to: '/warehouse/export-by-transfer'
                    },
                    {
                      title: 'อื่นๆ',
                      key: '48',
                      to: '/warehouse/other-export'
                    }
                  ]
                }
              ]
            },
            {
              title: 'อะไหล่ น้ำมัน',
              key: '49',
              type: 'group',
              items: [
                {
                  title: 'การรับสินค้า',
                  key: '50',
                  type: 'subMenu',
                  items: [
                    {
                      title: 'จากการซื้อสินค้า',
                      key: '51',
                      to: '/warehouse/import-parts'
                    }
                  ]
                }
              ]
            },
            {
              title: 'อื่นๆ',
              key: '54',
              type: 'group',
              items: [
                {
                  title: 'บันทึกลอกลายรถ',
                  key: '55',
                  to: '/warehouse/decal-record'
                },
                {
                  title: 'เบิกลอกลายรถ',
                  key: '221',
                  to: '/warehouse/decal-withdraw'
                },
                {
                  title: 'แผนการส่งรถ',
                  key: '56',
                  items: [
                    {
                      title: 'ส่งลูกค้า',
                      key: '57',
                      to: '/warehouse/customer-deliver-plan'
                    },
                    {
                      title: 'ส่งสาขา',
                      key: '58',
                      to: '/warehouse/branch-deliver-plan'
                    }
                  ]
                }
              ]
            }
          ],
          permCat: 'permCat004'
        }
      ]
    },
    {
      title: 'Credit',
      key: '60',
      items: [
        {
          title: 'สินเชื่อ',
          key: '61',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">attach_money</i>',
          open: false,
          items: [
            {
              title: 'บันทึกข้อมูล',
              key: '62',
              to: '/credit/input-data'
            },
            {
              title: 'แก้ไขใบสั่งขาย',
              key: '272',
              to: '/edit-sale-order'
            }
          ]
        }
      ],
      permCat: 'permCat005'
    },
    {
      title: 'Users',
      key: '89',
      items: [
        {
          title: 'บุคคล',
          key: '90',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">people</i>',
          htmlAfter: '',
          permCat: 'permCat007',
          items: [
            {
              title: 'บันทึกการทำงาน',
              items: [
                {
                  title: 'การลางาน',
                  to: '/hr/leave',
                  key: 255
                },
                {
                  title: 'เวลาเข้างาน',
                  to: '/hr/attendance',
                  key: 256
                }
              ]
            },
            {
              title: 'รายชื่อพนักงาน',
              to: '/employees',
              key: 241
            },
            {
              title: 'รายชื่อผู้ใช้งาน',
              to: '/users',
              key: 242
            }
          ]
        }
      ]
    },
    {
      title: 'Reports',
      key: '76',
      items: [
        {
          title: 'รายงาน',
          key: '77',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">assessment</i>',
          htmlAfter: '',
          items: [
            {
              title: 'บัญชี',
              key: '78',
              type: 'group',
              items: [
                {
                  title: 'สรุปรายรับ-รายจ่าย',
                  key: '80',
                  to: '/reports/income-expense-summary',
                  permission: 'permission801'
                },
                {
                  title: 'รายรับ',
                  key: '81',
                  items: [
                    {
                      title: 'สรุปรายรับ',
                      key: '261',
                      to: '/reports/income-summary'
                    },
                    {
                      title: 'สรุปส่งเงินประจำวัน',
                      key: '262',
                      to: '/reports/daily-money-summary'
                    },
                    {
                      title: 'เงินฝากธนาคาร',
                      key: '263',
                      to: '/reports/bank-deposit'
                    },
                    {
                      title: 'แยกขายอะไหล่ KBN',
                      key: '264',
                      to: '/reports/income-parts-kbn'
                    },
                    {
                      title: 'รายรับ - สินเชื่อส่วนบุคคล',
                      key: '285',
                      to: '/reports/income-personal-loan'
                    },
                    {
                      title: 'รายรับขายอะไหล่รวม',
                      key: '265',
                      to: '/reports/income-parts-all'
                    },
                    {
                      title: 'รับเงินคืน',
                      key: '266',
                      to: '/reports/money-return'
                    },
                    {
                      title: 'รายรับอื่นๆ',
                      key: '267',
                      to: '/reports/income-others'
                    },
                    {
                      title: 'สรุปรายรับแทรกเตอร์ใหม่',
                      key: '268',
                      to: '/reports/tracktor-revenue'
                    }
                  ]
                },
                {
                  title: 'รายจ่าย',
                  key: '82',
                  items: [
                    {
                      title: 'สรุปรายจ่าย',
                      key: '269',
                      to: '/reports/expense-summary'
                    }
                  ]
                },
                {
                  title: 'ภาษี',
                  key: '274',
                  items: [
                    {
                      title: 'ใบกำกับภาษีซื้อรถและอุปกรณ์ สำนักงานใหญ่',
                      key: '276',
                      to: '/reports/account/tax-invoice-vehicles'
                    },
                    {
                      title: 'ใบกำกับภาษีซื้ออะไหล่ สำนักงานใหญ่',
                      key: '275',
                      to: '/reports/account/tax-invoice-parts'
                    }
                  ]
                }
              ]
            },
            {
              title: 'งานขาย',
              key: '83',
              type: 'group',
              items: [
                {
                  title: 'งานรับจอง',
                  key: '253',
                  permission: 'permission802',
                  items: [
                    {
                      title: 'ภาพรวมงานรับจอง',
                      key: '84',
                      to: '/reports/sale-booking-analytics',
                      permission: 'permission802'
                    },
                    {
                      title: 'สรุปงานรับจอง',
                      key: '244',
                      to: '/reports/sale-booking-summary',
                      permission: 'permission802'
                    },
                    {
                      title: 'ผลการประเมิน',
                      key: '210',
                      to: '/reports/sale-assessment',
                      permission: 'permission802'
                    },
                    {
                      title: 'ยกเลิกใบจอง',
                      key: '251',
                      to: '/reports/reservation-cancellation',
                      permission: 'permission802'
                    },
                    {
                      title: 'ยอดจองคงเหลือ',
                      key: '252',
                      to: '/reports/all-reservation',
                      permission: 'permission802'
                    }
                  ]
                },
                {
                  title: 'งานขาย',
                  key: '254',
                  permission: 'permission802',
                  items: [
                    {
                      title: 'ภาพรวมงานขาย',
                      key: '85',
                      to: '/reports/sale-analytics',
                      permission: 'permission802'
                    },
                    {
                      title: 'สรุปงานขาย',
                      key: '245',
                      to: '/reports/sale-summary',
                      permission: 'permission802'
                    }
                  ]
                },
                {
                  title: 'การตลาด',
                  key: '87',
                  permission: 'permission802',
                  items: [
                    {
                      title: 'ลูกค้า',
                      key: '88',
                      to: '/reports/mkt/customers',
                      permission: 'permission802'
                    },
                    {
                      title: 'แหล่งที่มา',
                      key: '211',
                      to: '/reports/mkt/marketing-channels',
                      permission: 'permission802'
                    }
                  ]
                }
              ]
            },
            {
              title: 'งานบริการ',
              key: '229',
              type: 'group',
              items: [
                {
                  title: 'ประจำวัน',
                  key: '230',
                  permission: 'permission803',
                  items: [
                    {
                      title: 'การบันทึกงานบริการ',
                      key: '236',
                      to: '/reports/service-daily/list',
                      permission: 'permission803'
                    },
                    {
                      title: 'สรุปรายรับ',
                      key: '237',
                      to: '/reports/service-daily/income',
                      permission: 'permission803'
                    }
                  ]
                },
                {
                  title: 'จำนวนลูกค้า',
                  key: '231',
                  to: '/reports/service-customer',
                  permission: 'permission803'
                },
                {
                  title: 'สรุปประเภท',
                  key: '232',
                  to: '/reports/service-type',
                  permission: 'permission803'
                },
                {
                  title: 'สรุปยอด',
                  key: '234',
                  to: '/reports/service-amount',
                  permission: 'permission803'
                },
                {
                  title: 'จัดอันดับช่าง',
                  key: '235',
                  to: '/reports/service-mechanic',
                  permission: 'permission803'
                }
              ]
            },
            {
              title: 'คลังสินค้า',
              key: '52',
              type: 'group',
              items: [
                {
                  title: 'รถและอุปกรณ์',
                  key: '213',
                  permission: 'permission804',
                  items: [
                    {
                      title: 'รายการสินค้า',
                      key: '212',
                      to: '/reports/warehouse/vehicles/models',
                      permission: 'permission804'
                    },
                    {
                      title: 'คลังสินค้า',
                      key: '215',
                      to: '/reports/warehouse/vehicles/stocks',
                      permission: 'permission804'
                    },
                    {
                      title: 'โอนย้าย(ออก)',
                      key: '216',
                      to: '/reports/warehouse/vehicles/transferOut',
                      permission: 'permission804'
                    },
                    {
                      title: 'รับโอน(เข้า)',
                      key: '217',
                      to: '/reports/warehouse/vehicles/transferIn',
                      permission: 'permission804'
                    },
                    {
                      title: 'ทะเบียนคุมลอกลายรถ',
                      key: '218',
                      to: '/reports/warehouse/decal',
                      permission: 'permission804'
                    },
                    {
                      title: 'แผนการส่งรถลูกค้า',
                      key: '219',
                      to: '/reports/warehouse/vehicles/customerDeliveryPlan',
                      permission: 'permission804'
                    },
                    {
                      title: 'แผนการส่งรถสาขา',
                      key: '220',
                      to: '/reports/warehouse/vehicles/branchDeliveryPlan',
                      permission: 'permission804'
                    }
                  ]
                },
                {
                  title: 'ของแถม',
                  key: '53',
                  to: '/reports/warehouse/giveaways',
                  permission: 'permission804'
                }
              ]
            },
            {
              title: 'สินเชื่อ',
              key: '238',
              type: 'group',
              items: [
                {
                  title: 'สรุปยอดตัดขาย-รับเงิน',
                  key: '239',
                  to: '/reports/credit/summary',
                  permission: 'permission805'
                },
                {
                  title: 'สรุปยอดประจำวัน (สินเชื่อ)',
                  key: '271',
                  to: '/reports/credit/summary-daily',
                  permission: 'permission805'
                }
              ]
            },
            {
              title: 'บุคคล',
              key: '257',
              type: 'group',
              items: [
                {
                  title: 'สถิติการทำงาน',
                  key: '258',
                  to: '/reports/hr/attendance',
                  permission: 'permission806'
                },
                {
                  title: 'การลางาน',
                  key: '273',
                  to: '/reports/hr/leaving',
                  permission: 'permission806'
                },
                {
                  title: 'การลางานประจำปี',
                  key: '259',
                  to: '/reports/hr/attendance-summary',
                  permission: 'permission806'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Settings',
      key: '95',
      items: [
        {
          title: 'การตั้งค่า',
          key: '96',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">settings</i>',
          open: false,
          items: [
            {
              title: 'สาขา',
              key: '97',
              to: '/admin/settings/branches',
              allowedRoles: [UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]
            },
            {
              title: 'ผู้ใช้งาน',
              key: '98',
              to: '/admin/settings/users',
              allowedRoles: [UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]
            },
            {
              title: 'ยานพาหนะ',
              key: '99',
              to: '/admin/settings/vehicles',
              allowedRoles: [UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]
            },
            {
              title: 'อะไหล่',
              key: '100',
              to: '/admin/settings/parts',
              allowedRoles: [UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]
            },
            {
              title: 'บริการ',
              key: '101',
              to: '/admin/settings/services',
              allowedRoles: [UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]
            },
            {
              title: 'โปรโมชั่น',
              key: '102',
              to: '/admin/settings/promotions',
              allowedRoles: [UserRole.EXECUTIVE, UserRole.SUPER_ADMIN, UserRole.DEVELOPER]
            }
          ]
        }
      ]
    },
    {
      title: 'User Manual',
      key: '106',
      items: [
        {
          title: 'คู่มือการใช้งาน',
          key: '107',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">auto_stories</i>',
          htmlAfter: '',
          items: [
            {
              title: 'บัญชี',
              key: '108',
              to: '/user-manual/account'
            },
            {
              title: 'งานขาย',
              key: '109',
              to: '/user-manual/sale'
            },
            {
              title: 'งานบริการ',
              key: '110',
              to: '/user-manual/service'
            },
            {
              title: 'คลังสินค้า',
              key: '111',
              to: '/user-manual/warehouse'
            },
            {
              title: 'สินเชื่อ',
              key: '112',
              to: '/user-manual/credit'
            }
          ]
        }
      ]
    },
    {
      title: 'About',
      key: '113',
      items: [
        {
          title: 'เกี่ยวกับ',
          key: '114',
          htmlBefore: '<i class="material-icons" style="font-size:17px;">fact_check</i>',
          htmlAfter: '',
          items: [
            {
              title: t('System Overview') || 'System Overview',
              key: 'system-overview',
              to: '/about/system-overview'
            },
            {
              title: 'เกี่ยวกับเรา',
              key: '115',
              to: '/about'
            },
            {
              title: 'บันทึกการเปลี่ยนแปลง',
              key: '116',
              to: '/changelogs'
            }
          ]
        }
      ]
    }
  ];
}

export default useSidebarNavItems;
