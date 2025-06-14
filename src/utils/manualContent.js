/**
 * Digital User Manual Content Library
 * Easy explanations for every KBN screen - NO technical terms!
 */

import React from 'react';
import { 
  UserOutlined, 
  SafetyOutlined, 
  FormOutlined, 
  HomeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  BookOutlined,
  CarOutlined,
  ToolOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  BarChartOutlined
} from '@ant-design/icons';

export const getManualContent = (screenType) => {
  const manuals = {
    // Authentication Screens
    signup: {
      title: '📝 วิธีสมัครสมาชิก',
      subtitle: 'ขั้นตอนง่ายๆ ในการเข้าร่วม KBN',
      steps: [
        {
          title: 'เลือกประเภทผู้ใช้',
          description: 'เลือกว่าคุณเป็นพนักงานใหม่ หรือพนักงานเดิม',
          icon: <UserOutlined />,
          details: [
            '🟢 พนักงานใหม่: ยังไม่เคยใช้ระบบ KBN',
            '⚫ พนักงานเดิม: เคยใช้แล้ว แต่ลืมรหัสผ่าน'
          ]
        },
        {
          title: 'กรอกอีเมล',
          description: 'ใส่อีเมลที่ใช้งานได้จริง',
          icon: <FormOutlined />,
          details: [
            '📧 ใช้อีเมลที่เช็คได้ทุกวัน',
            '✅ ระบบจะส่งลิงก์ยืนยันมาให้',
            '⚠️ ไม่ได้รับอีเมล? เช็คกล่อง Spam'
          ]
        },
        {
          title: 'กรอกข้อมูลส่วนตัว',
          description: 'ใส่ชื่อ-นามสกุล และรหัสผ่าน',
          icon: <SafetyOutlined />,
          details: [
            '👤 ใส่ชื่อจริงตามบัตรประชาชน',
            '🔐 รหัสผ่านอย่างน้อย 6 ตัวอักษร',
            '💡 จำรหัสผ่านให้ดี จะใช้เข้าระบบทุกครั้ง'
          ]
        },
        {
          title: 'เลือกสาขาและแผนก',
          description: 'บอกระบบว่าทำงานที่ไหน แผนกอะไร',
          icon: <HomeOutlined />,
          details: [
            '🏢 เลือกจังหวัดที่ทำงาน',
            '🏪 เลือกสาขาที่ทำงาน',
            '👥 เลือกแผนก (ขาย, บริการ, บัญชี, ฯลฯ)'
          ]
        },
        {
          title: 'รอการอนุมัติ',
          description: 'หัวหน้าจะตรวจสอบและอนุมัติ',
          icon: <CheckCircleOutlined />,
          details: [
            '⏳ รอประมาณ 1-2 วันทำการ',
            '📱 จะแจ้งทางอีเมลเมื่ออนุมัติแล้ว',
            '🎉 อนุมัติแล้วก็เข้าใช้ระบบได้เลย!'
          ]
        }
      ]
    },

    login: {
      title: '🔐 วิธีเข้าสู่ระบบ',
      subtitle: 'เข้าใช้งาน KBN อย่างง่ายดาย',
      steps: [
        {
          title: 'ใส่อีเมลและรหัสผ่าน',
          description: 'ใช้ข้อมูลเดียวกับตอนสมัคร',
          icon: <FormOutlined />,
          details: [
            '📧 ใส่อีเมลที่ใช้สมัครสมาชิก',
            '🔐 ใส่รหัสผ่านที่ตั้งไว้',
            '👁️ กดปุ่มตาเพื่อดูรหัสผ่าน'
          ]
        },
        {
          title: 'กดเข้าสู่ระบบ',
          description: 'ระบบจะตรวจสอบและพาเข้าไป',
          icon: <CheckCircleOutlined />,
          details: [
            '✅ ข้อมูลถูกต้อง = เข้าระบบทันที',
            '❌ ข้อมูลผิด = ระบบจะแจ้งให้แก้',
            '🔄 ลืมรหัสผ่าน? กดลิงก์ "ลืมรหัสผ่าน"'
          ]
        }
      ]
    },

    // Main Dashboard
    dashboard: {
      title: '🏠 หน้าหลักของระบบ',
      subtitle: 'ศูนย์รวมการทำงานทั้งหมด',
      steps: [
        {
          title: 'เมนูหลัก',
          description: 'เลือกงานจากเมนูด้านซ้าย',
          icon: <BookOutlined />,
          details: [
            '📊 ดูข้อมูลสรุปในหน้าแรก',
            '📋 เลือกเมนูงานที่ต้องการ',
            '🔔 ดูการแจ้งเตือนมุมขวาบน'
          ]
        },
        {
          title: 'การแจ้งเตือน',
          description: 'ระบบแจ้งเมื่อมีงานรอทำ',
          icon: <InfoCircleOutlined />,
          details: [
            '🔔 กระดิ่งสีเหลือง = มีงานรอ',
            '📝 กดดูรายละเอียดได้',
            '✅ ทำเสร็จแล้วจะหายไป'
          ]
        }
      ]
    },

    // Sales Module
    sales: {
      title: '🚗 ระบบขายรถ',
      subtitle: 'จัดการการขายรถแทรกเตอร์',
      steps: [
        {
          title: 'เพิ่มลูกค้าใหม่',
          description: 'บันทึกข้อมูลลูกค้าที่สนใจซื้อรถ',
          icon: <UserOutlined />,
          details: [
            '👤 กรอกชื่อ-นามสกุล เบอร์โทร',
            '🏠 ใส่ที่อยู่และข้อมูลติดต่อ',
            '💼 บันทึกอาชีพและความต้องการ'
          ]
        },
        {
          title: 'เลือกรถที่ต้องการ',
          description: 'เลือกรุ่นรถที่ลูกค้าสนใจ',
          icon: <CarOutlined />,
          details: [
            '🚜 เลือกรุ่นรถแทรกเตอร์',
            '💰 ดูราคาและโปรโมชั่น',
            '📋 เช็คสต็อกในสาขา'
          ]
        },
        {
          title: 'ทำใบจอง',
          description: 'สร้างใบจองสำหรับลูกค้า',
          icon: <FileTextOutlined />,
          details: [
            '📝 กรอกรายละเอียดการจอง',
            '💵 ระบุเงินมัดจำ',
            '📅 กำหนดวันส่งมอบ'
          ]
        }
      ]
    },

    // Service Module
    service: {
      title: '🔧 ระบบบริการ',
      subtitle: 'จัดการงานซ่อมและบำรุงรักษา',
      steps: [
        {
          title: 'รับงานซ่อม',
          description: 'บันทึกรถที่เข้ามาซ่อม',
          icon: <ToolOutlined />,
          details: [
            '🚜 สแกนหรือใส่เลขทะเบียนรถ',
            '📝 บันทึกอาการเสีย',
            '👤 ข้อมูลเจ้าของรถ'
          ]
        },
        {
          title: 'มอบหมายช่าง',
          description: 'เลือกช่างที่จะรับผิดชอบ',
          icon: <TeamOutlined />,
          details: [
            '👨‍🔧 เลือกช่างที่เหมาะสม',
            '⏰ กำหนดเวลาซ่อม',
            '📋 ส่งรายละเอียดให้ช่าง'
          ]
        },
        {
          title: 'ติดตามงาน',
          description: 'ดูความคืบหน้าการซ่อม',
          icon: <BarChartOutlined />,
          details: [
            '📊 ดูสถานะการซ่อม',
            '💰 ตรวจสอบค่าใช้จ่าย',
            '✅ อนุมัติงานเสร็จ'
          ]
        }
      ]
    },

    // Parts/Inventory Module
    parts: {
      title: '📦 ระบบอะไหล่',
      subtitle: 'จัดการสต็อกอะไหล่',
      steps: [
        {
          title: 'เช็คสต็อก',
          description: 'ดูจำนวนอะไหล่ในคลัง',
          icon: <ShoppingCartOutlined />,
          details: [
            '🔍 ค้นหาอะไหล่ที่ต้องการ',
            '📊 ดูจำนวนคงเหลือ',
            '📍 เช็คตำแหน่งในคลัง'
          ]
        },
        {
          title: 'เบิกอะไหล่',
          description: 'เบิกอะไหล่ไปใช้งาน',
          icon: <FileTextOutlined />,
          details: [
            '📝 ใส่รายการที่ต้องเบิก',
            '🎯 ระบุงานที่จะใช้',
            '✍️ ลงชื่อผู้เบิก'
          ]
        },
        {
          title: 'สั่งซื้อเพิ่ม',
          description: 'สั่งอะไหล่เมื่อของหมด',
          icon: <DollarOutlined />,
          details: [
            '⚠️ ระบบจะแจ้งเมื่อของใกล้หมด',
            '📋 ทำใบสั่งซื้อ',
            '📅 ติดตามการส่งของ'
          ]
        }
      ]
    },

    // Accounting Module
    accounting: {
      title: '💰 ระบบบัญชี',
      subtitle: 'จัดการเงินและการเงิน',
      steps: [
        {
          title: 'บันทึกรายรับ',
          description: 'บันทึกเงินที่ได้รับ',
          icon: <DollarOutlined />,
          details: [
            '💵 บันทึกเงินสด',
            '💳 บันทึกเงินโอน',
            '🧾 แนบใบเสร็จ'
          ]
        },
        {
          title: 'บันทึกรายจ่าย',
          description: 'บันทึกเงินที่จ่ายออกไป',
          icon: <FileTextOutlined />,
          details: [
            '🛒 ค่าซื้อของ',
            '⚡ ค่าไฟ ค่าน้ำ',
            '👥 เงินเดือนพนักงาน'
          ]
        },
        {
          title: 'ดูรายงาน',
          description: 'ดูสรุปการเงิน',
          icon: <BarChartOutlined />,
          details: [
            '📊 รายงานรายวัน',
            '📈 รายงานรายเดือน',
            '💹 กำไร-ขาดทุน'
          ]
        }
      ]
    },

    // User Management
    userManagement: {
      title: '👥 จัดการผู้ใช้',
      subtitle: 'อนุมัติและจัดการพนักงาน',
      steps: [
        {
          title: 'อนุมัติสมาชิกใหม่',
          description: 'ตรวจสอบและอนุมัติคนที่สมัครใหม่',
          icon: <CheckCircleOutlined />,
          details: [
            '👀 ดูข้อมูลผู้สมัคร',
            '✅ อนุมัติถ้าข้อมูลถูกต้อง',
            '❌ ปฏิเสธถ้าข้อมูลผิด'
          ]
        },
        {
          title: 'กำหนดสิทธิ์',
          description: 'ตั้งค่าว่าใครทำอะไรได้บ้าง',
          icon: <SafetyOutlined />,
          details: [
            '🔐 กำหนดสิทธิ์ตามตำแหน่ง',
            '🏢 กำหนดสาขาที่เข้าถึงได้',
            '📋 กำหนดเมนูที่ใช้ได้'
          ]
        }
      ]
    }
  };

  return manuals[screenType] || {
    title: '📖 คู่มือการใช้งาน',
    subtitle: 'วิธีใช้งานระบบ KBN',
    steps: [
      {
        title: 'การใช้งานทั่วไป',
        description: 'หลักการใช้งานระบบ KBN',
        icon: <InfoCircleOutlined />,
        details: [
          '🖱️ กดปุ่มเพื่อทำงาน',
          '📝 กรอกข้อมูลในช่องที่กำหนด',
          '💾 กด "บันทึก" เมื่อเสร็จแล้ว'
        ]
      }
    ]
  };
};

// Quick tips for common actions
export const getQuickTips = () => [
  '💡 ติดปัญหา? กดปุ่มช่วยเหลือ (?) ได้ทุกหน้า',
  '📞 ต้องการความช่วยเหลือ? ติดต่อ IT Support',
  '🎯 ใช้งานครั้งแรก? ลองทำตามขั้นตอนทีละขั้น',
  '💾 อย่าลืมกด "บันทึก" หลังกรอกข้อมูล',
  '🔄 หน้าจอค้าง? ลองรีเฟรชหน้าเว็บ',
  '📱 ใช้งานบนมือถือ? หมุนหน้าจอเป็นแนวนอน'
];

// Screen-specific quick actions
export const getQuickActions = (screenType) => {
  const actions = {
    sales: [
      { label: 'เพิ่มลูกค้าใหม่', action: 'add-customer' },
      { label: 'ค้นหาลูกค้า', action: 'search-customer' },
      { label: 'ดูใบจอง', action: 'view-bookings' }
    ],
    service: [
      { label: 'รับงานซ่อมใหม่', action: 'new-service' },
      { label: 'ดูงานที่รอ', action: 'pending-jobs' },
      { label: 'ติดตามงาน', action: 'track-jobs' }
    ],
    parts: [
      { label: 'เช็คสต็อก', action: 'check-stock' },
      { label: 'เบิกอะไหล่', action: 'request-parts' },
      { label: 'สั่งซื้อ', action: 'order-parts' }
    ],
    accounting: [
      { label: 'บันทึกรายรับ', action: 'add-income' },
      { label: 'บันทึกรายจ่าย', action: 'add-expense' },
      { label: 'ดูรายงาน', action: 'view-reports' }
    ]
  };

  return actions[screenType] || [];
}; 