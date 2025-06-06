export default function () {
  return [
    {
      title: 'Overview',
      items: [
        {
          title: 'ภาพรวม',
          to: '/overview',
          htmlBefore: '<i class="material-icons">&#xE917;</i>',
          htmlAfter: '',
          permCat: 'permCat001'
        }
        // {
        //   title: 'Online Store',
        //   to: '/ecommerce',
        //   htmlBefore: '<i class="material-icons">&#xE8D1;</i>',
        //   htmlAfter: '',
        // },
        // {
        //   title: 'Personal Blog',
        //   to: '/blog-overview',
        //   htmlBefore: '<i class="material-icons">edit</i>',
        //   htmlAfter: '',
        // },
      ]
    },
    {
      title: 'Account',
      items: [
        {
          title: 'บัญชี',
          htmlBefore: '<i class="material-icons">vertical_split</i>',
          open: false,
          items: [
            {
              title: 'ภาพรวม',
              to: '/reports/account-overview'
            },
            {
              title: 'รายรับ - ภาพรวม',
              to: '/account/income-overview'
            },
            {
              title: 'รายรับ - บันทึกข้อมูล',
              to: '/account/income-input'
            },
            {
              title: 'รายจ่าย - ภาพรวม',
              to: '/account/expense-overview'
            },
            {
              title: 'รายจ่าย - บันทึกข้อมูล',
              to: '/account/expense-input'
            }
          ],
          permCat: 'permCat002'
        }
      ]
    },
    {
      title: 'Sales',
      items: [
        {
          title: 'งานขาย',
          htmlBefore: '<i class="material-icons">store_mall_directory</i>',
          open: false,
          items: [
            {
              title: 'รถและอุปกรณ์',
              to: '/sale-machines'
            },
            {
              title: 'อะไหล่',
              to: '/sale-parts'
            },
            {
              title: 'การตลาด',
              to: '/sale-marketing'
            }
          ],
          permCat: 'permCat003'
        }
      ]
    },
    {
      title: 'Services',
      items: [
        {
          title: 'งานบริการ',
          htmlBefore: '<i class="material-icons">store_mall_directory</i>',
          open: false,
          items: [
            {
              title: 'นอกพื้นที่',
              to: '/service-input'
            },
            {
              title: 'ในศูนย์',
              to: '/service-data-skc'
            }
          ],
          permCat: 'permCat003'
        }
      ]
    },
    {
      title: 'Warehouse',
      items: [
        {
          title: 'คลังสินค้า',
          htmlBefore: '<i class="material-icons">home_work</i>',
          open: false,
          items: [
            {
              title: 'รถและอุปกรณ์',
              to: '/warehouse/vehicles'
            },
            {
              title: 'อะไหล่',
              to: '/warehouse/parts'
            },
            {
              title: 'นำเข้าข้อมูล',
              to: '/warehouse/stock-import'
            }
          ],
          permCat: 'permCat004'
        }
      ]
    },
    {
      title: 'Credit',
      items: [
        {
          title: 'สินเชื่อ',
          htmlBefore: '<i class="material-icons">business_center</i>',
          open: false,
          items: [
            {
              title: 'สินเชื่อ SKL',
              to: '/credit-skl'
            },
            {
              title: 'สินเชื่อโครงการร้าน',
              to: '/credit-kbn'
            },
            {
              title: 'สินเชื่อ ธกส',
              to: '/credit-baa'
            }
          ],
          permCat: 'permCat004'
        }
      ]
    },
    {
      title: 'Users',
      items: [
        {
          title: 'ผู้ใช้งาน',
          to: '/users',
          htmlBefore: '<i class="material-icons">people</i>',
          htmlAfter: '',
          permCat: 'permCat007'
        }
      ]
    },
    {
      title: 'Data',
      items: [
        {
          title: 'ข้อมูล',
          htmlBefore: '<i className="material-icons">&#xE24D;</i>',
          open: false,
          items: [
            {
              title: 'นำเข้าข้อมูล',
              to: '/data-import'
            },
            {
              title: 'ส่งออกข้อมูล',
              to: '/data-export'
            }
          ],
          permCat: 'permCat004'
        }
      ]
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'การตั้งค่า',
          htmlBefore: '<i class="material-icons">settings</i>',
          open: false,
          items: [
            {
              title: 'สาขา',
              to: '/setting-branches'
            },
            {
              title: 'กลุ่มผู้ใช้งาน',
              to: '/setting-users'
            },
            // {
            //   title: 'บัญชี',
            //   to: '/setting-account',
            // },
            {
              title: 'เกี่ยวกับรถและอุปกรณ์',
              to: '/setting-vehicles'
            },
            {
              title: 'โปรโมชั่น',
              to: '/setting-promotions'
            }
          ],
          permCat: 'permCat006'
        }
      ]
    },
    {
      title: 'About',
      items: [
        {
          title: 'เกี่ยวกับ',
          htmlBefore: '<i class="material-icons">fact_check</i>',
          htmlAfter: '',
          items: [
            {
              title: 'เกี่ยวกับเรา',
              to: '/about'
            },
            {
              title: 'บันทึกการเปลี่ยนแปลง',
              to: '/changelogs'
            }
          ]
        }
      ]
    }
    // {
    //   title: 'Templates',
    //   items: [
    //     {
    //       title: 'User Account',
    //       htmlBefore: '<i class="material-icons">&#xE7FD;</i>',
    //       open: false,
    //       items: [
    //         {
    //           title: 'User Profile',
    //           to: '/user-profile',
    //         },
    //         {
    //           title: 'User Profile Lite',
    //           to: '/user-profile-lite',
    //         },
    //         {
    //           title: 'Edit User Profile',
    //           to: '/edit-user-profile',
    //         },
    //         {
    //           title: 'Login',
    //           to: '/login',
    //         },
    //         {
    //           title: 'Register',
    //           to: '/register',
    //         },
    //         {
    //           title: 'Change Password',
    //           to: '/change-password',
    //         },
    //         {
    //           title: 'Forgot Password',
    //           to: '/forgot-password',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'File Managers',
    //       htmlBefore: '<i class="material-icons">&#xE2C7;</i>',
    //       open: false,
    //       items: [
    //         {
    //           title: 'Files - List View',
    //           to: '/file-manager-list',
    //         },
    //         {
    //           title: 'Files - Cards View',
    //           to: '/file-manager-cards',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Transaction History',
    //       htmlBefore: '<i class="material-icons">&#xE889;</i>',
    //       to: '/transaction-history',
    //     },
    //     {
    //       title: 'Calendar',
    //       htmlBefore: '<i class="material-icons">calendar_today</i>',
    //       to: '/calendar',
    //     },
    //     {
    //       title: 'Add New Post',
    //       htmlBefore: '<i class="material-icons">note_add</i>',
    //       to: '/add-new-post',
    //     },
    //     {
    //       title: 'Errors',
    //       htmlBefore: '<i class="material-icons">error</i>',
    //       to: '/errors',
    //     },
    //   ],
    // },
    // {
    //   title: 'Components',
    //   items: [
    //     {
    //       title: 'Overview',
    //       htmlBefore: '<i class="material-icons">view_module</i>',
    //       to: '/components-overview',
    //     },
    //     {
    //       title: 'Tables',
    //       htmlBefore: '<i class="material-icons">table_chart</i>',
    //       to: '/tables',
    //     },
    //     {
    //       title: 'Blog Posts',
    //       htmlBefore: '<i class="material-icons">vertical_split</i>',
    //       to: '/blog-posts',
    //     },
    //   ],
    // },
    // {
    //   title: 'Layouts',
    //   items: [
    //     {
    //       title: 'Header Nav',
    //       htmlBefore: '<i class="material-icons">view_day</i>',
    //       to: '/header-navigation',
    //     },
    //     {
    //       title: 'Icon Sidebar',
    //       htmlBefore: '<i class="material-icons">&#xE251;</i>',
    //       to: '/icon-sidebar-nav',
    //     },
    //   ],
    // },
  ];
}
