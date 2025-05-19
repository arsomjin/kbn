import React, { ReactNode } from 'react';
import LoginPageFlow from '../docs/visuals/LoginPageFlow';
import RegisterPageFlow from '../docs/visuals/RegisterPageFlow';

type DocSection = {
  overview: ReactNode;
  instruction: ReactNode;
  flow: ReactNode;
  logic: ReactNode;
};

const pageDocs: Record<string, DocSection> = {
  // Login Page
  '/auth/login': {
    overview: 'เข้าสู่ระบบเพื่อใช้งานระบบ KBN ด้วยอีเมลและรหัสผ่าน หรือบัญชี Google',
    instruction: 'กรอกอีเมลและรหัสผ่านที่ลงทะเบียนไว้ หรือเลือกเข้าสู่ระบบด้วย Google หากมีสิทธิ์',
    flow: <LoginPageFlow />,
    logic:
      'ตรวจสอบอีเมลและรหัสผ่าน, หากสำเร็จจะโหลดข้อมูลโปรไฟล์และสิทธิ์, มีการตรวจสอบระบบควบคุมการเข้าถึงตามบทบาท (RBAC) ซึ่งกำหนดสิทธิ์การใช้งานตามบทบาทของผู้ใช้ เช่น Admin สามารถจัดการระบบทั้งหมด, Manager จัดการได้เฉพาะในจังหวัดของตน และ Staff ใช้งานได้ตามสิทธิ์ที่ได้รับ, รวมถึงมีการตรวจสอบการเข้าถึงตามจังหวัด (province access) หลังเข้าสู่ระบบ'
  },

  // Register Page
  '/auth/signup': {
    overview: 'ลงทะเบียนผู้ใช้ใหม่เพื่อขอสิทธิ์เข้าใช้งานระบบ KBN',
    instruction: 'กรอกข้อมูลส่วนตัว เลือกจังหวัดและสาขา (ถ้ามี) ตั้งรหัสผ่าน และยืนยันรหัสผ่าน',
    flow: <RegisterPageFlow />,
    logic:
      'ผู้สมัครใหม่จะถูกกำหนดสถานะเป็น pending และต้องรอผู้ดูแลระบบอนุมัติ, ข้อมูล province จะถูกบันทึกใน profile, RBAC: ผู้ดูแล (Admin/Manager) เท่านั้นที่สามารถอนุมัติหรือแก้ไขสิทธิ์'
  },

  // Forgot Password Page
  '/auth/reset-password': {
    overview: 'ขอรีเซ็ตรหัสผ่านในกรณีที่ลืมหรือเข้าใช้งานไม่ได้',
    instruction: 'กรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล',
    flow: 'กรอกอีเมล > กดขอรีเซ็ตรหัสผ่าน > ตรวจสอบอีเมล > คลิกลิงก์เพื่อเปลี่ยนรหัสผ่าน',
    logic: 'ไม่มีการเปลี่ยนแปลงสิทธิ์หรือ จังหวัด'
  },

  // Complete Profile Page
  '/complete-profile': {
    overview: 'กรอกข้อมูลโปรไฟล์เพิ่มเติมหลังสมัครหรือเข้าสู่ระบบด้วย Google',
    instruction: 'กรอกชื่อ-นามสกุล เลือกจังหวัด สาขา และข้อมูลที่จำเป็นอื่น ๆ',
    flow: 'เข้าสู่ระบบ > กรอกข้อมูลโปรไฟล์ > ยืนยัน > ระบบบันทึกข้อมูล > รออนุมัติ (ถ้าจำเป็น)',
    logic: 'ข้อมูล province จะถูกบันทึกใน Firestore, RBAC: ผู้ใช้ใหม่จะถูกกำหนด role เป็น pending จนกว่าจะได้รับอนุมัติ'
  },

  // Pending Page
  '/pending': {
    overview: 'แจ้งสถานะบัญชีที่รอการอนุมัติจากผู้ดูแลระบบ',
    instruction: 'รออีเมลแจ้งเตือนเมื่อบัญชีได้รับการอนุมัติ สามารถกลับไปหน้าหลักได้',
    flow: 'สมัคร/เข้าสู่ระบบ > รออนุมัติ > ได้รับอีเมลแจ้งเตือน > เข้าสู่ระบบใหม่',
    logic:
      'RBAC: เฉพาะผู้ดูแล (Admin/Manager) เท่านั้นที่สามารถอนุมัติบัญชี, ผู้ใช้ที่รออนุมัติจะไม่สามารถเข้าถึงข้อมูลใด ๆ'
  },

  // User Role Manager (Admin)
  '/admin/users': {
    overview: 'หน้าสำหรับผู้ดูแลระบบในการจัดการสิทธิ์และบทบาทของผู้ใช้',
    instruction: 'ค้นหา แก้ไขบทบาท กำหนด province และ permission เฉพาะของแต่ละผู้ใช้',
    flow: 'ค้นหาผู้ใช้ > เลือกผู้ใช้ > แก้ไขบทบาท/สิทธิ์/จังหวัด > บันทึก',
    logic:
      'RBAC: เฉพาะ Admin/Manager ที่มี permission USER_ROLE_EDIT เท่านั้นที่สามารถแก้ไข, ข้อมูล province จะถูกใช้ในการกรองและจำกัดสิทธิ์'
  },

  // User Review (Admin)
  '/admin/review-users': {
    overview: 'หน้าสำหรับผู้ดูแลระบบในการอนุมัติหรือปฏิเสธผู้ใช้ใหม่',
    instruction: 'ตรวจสอบข้อมูลผู้สมัครใหม่ อนุมัติหรือปฏิเสธการเข้าใช้งาน',
    flow: 'ดูรายชื่อผู้สมัคร > ตรวจสอบข้อมูล > อนุมัติ/ปฏิเสธ > ระบบแจ้งเตือนผู้ใช้',
    logic:
      'RBAC: เฉพาะ Admin/Manager ที่มี permission USER_VIEW/USER_EDIT เท่านั้นที่สามารถอนุมัติ, province access จะถูกตรวจสอบก่อนอนุมัติ'
  },

  // Profile Page
  '/profile': {
    overview: 'ดูและแก้ไขข้อมูลโปรไฟล์ส่วนตัว เช่น ชื่อ อีเมล เบอร์โทร จังหวัด สาขา',
    instruction: 'สามารถเปลี่ยนรหัสผ่านและดูสถานะการยืนยันอีเมลได้',
    flow: 'เข้าสู่ระบบ > ไปที่โปรไฟล์ > แก้ไขข้อมูล/เปลี่ยนรหัสผ่าน > บันทึก',
    logic: 'ข้อมูล province และ role จะถูกแสดงตามสิทธิ์, RBAC: เฉพาะเจ้าของบัญชีเท่านั้นที่สามารถแก้ไขข้อมูลส่วนตัว'
  },

  // Role Check (internal route)
  '/role-check': {
    overview: 'หน้าตรวจสอบ role หลังเข้าสู่ระบบ เพื่อเปลี่ยนเส้นทางไปยังหน้าที่เหมาะสม',
    instruction: 'ระบบจะ redirect อัตโนมัติ ไม่ต้องมีการโต้ตอบจากผู้ใช้',
    flow: 'เข้าสู่ระบบ > ตรวจสอบ role > redirect ไปยังหน้าหลัก/overview/dashboard',
    logic: 'RBAC: ตรวจสอบ role และ province access เพื่อกำหนด landing page ที่เหมาะสม'
  }
};

export default pageDocs;
