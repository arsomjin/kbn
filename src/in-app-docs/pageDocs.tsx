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
      'ตรวจสอบอีเมลและรหัสผ่าน, หากสำเร็จจะโหลดข้อมูลโปรไฟล์และสิทธิ์, มีการตรวจสอบระบบควบคุมการเข้าถึงตาม[Role] (RBAC) ซึ่งกำหนดสิทธิ์การใช้งานตาม[Role]ของผู้ใช้ เช่น Admin สามารถจัดการระบบทั้งหมด, Manager จัดการได้เฉพาะในจังหวัดของตน และ Staff ใช้งานได้ตามสิทธิ์ที่ได้รับ, รวมถึงมีการตรวจสอบการเข้าถึงตามจังหวัด (province access) หลังเข้าสู่ระบบ'
  },

  // Register Page
  '/auth/signup': {
    overview: 'ลงทะเบียนผู้ใช้ใหม่เพื่อขอสิทธิ์เข้าใช้งานระบบ KBN',
    instruction:
      'เลือกประเภทผู้ใช้งาน 1.พนักงานบริษัทฯ 2.ผู้ใช้งานทั่วไป (ลูกค้า เป็นต้น)) กรอกข้อมูลส่วนตัว เลือกจังหวัด, สาขา, และแผนก ตั้งรหัสผ่าน และยืนยันรหัสผ่าน',
    flow: <RegisterPageFlow />,
    logic:
      'ผู้สมัครใหม่จะถูกกำหนดสถานะเป็น pending และต้องรอผู้ดูแลระบบอนุมัติ, ข้อมูลจังหวัด สาขา และแผนก จะถูกบันทึกใน profile, สิทธิ์การเข้าถึงส่วนต่างๆของระบบ: ผู้ดูแล (Admin/Manager) และผู้บริหารเท่านั้น ที่สามารถอนุมัติหรือแก้ไขสิทธิ์'
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
    logic:
      'ข้อมูลจังหวัด สาขา และแผนก จะถูกบันทึกในระบบ, การกำหนดสิทธิ์การเข้าถึงส่วนต่างๆของระบบ: ผู้ใช้ใหม่จะถูกกำหนด role เป็น pending จนกว่าจะได้รับอนุมัติ'
  },

  // Pending Page
  '/pending': {
    overview: 'ระบบจะแจ้งสถานะบัญชีที่รอการอนุมัติให้ผู้ดูแลระบบ และผู้ที่เกี่ยวข้องเพื่อทำการอนุมัติ',
    instruction:
      'รออีเมลแจ้งเตือนเมื่อบัญชีได้รับการอนุมัติ และจะสามารถเข้าใช้งานระบบตาม Role และสิทธิ์ที่ได้รับได้ทันที',
    flow: 'สมัคร/เข้าสู่ระบบ > รออนุมัติ > ได้รับอีเมลแจ้งเตือน > เข้าสู่ระบบใหม่โดยอัตโนมัติ',
    logic:
      'RBAC: เฉพาะผู้ดูแล (Admin/Manager) และผู้บริหารระดับสูงเท่านั้นที่สามารถอนุมัติบัญชี, ผู้ใช้ที่รออนุมัติจะไม่สามารถเข้าถึงข้อมูลใด ๆ'
  },

  // User Role Manager (Admin)
  '/admin/users': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>👥 ภาพรวม</h2>
        <p>
          <b>หน้าจัดการ [Role] ผู้ใช้</b> สำหรับผู้ดูแลระบบในการจัดการบทบาท (Role) และสิทธิ์ (Permissions)
          ของผู้ใช้แต่ละคนในแต่ละจังหวัด รองรับการค้นหา กรอง แก้ไข และกำหนดสิทธิ์การเข้าถึงข้อมูลตามจังหวัดและบทบาท
        </p>
        <div style={{ margin: '16px 0' }}>
          <img
            src={require('../docs/visuals/userrole-main.png')}
            alt='หน้าหลัก UserRoleManager'
            style={{ width: '100%', borderRadius: 12, boxShadow: '0 2px 12px rgba(44,62,80,0.08)', marginBottom: 8 }}
          />
        </div>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>📝 ขั้นตอนการใช้งาน</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            <b>ค้นหาผู้ใช้:</b> ใช้ช่องค้นหาด้านบนเพื่อค้นหาด้วยชื่อหรืออีเมล กรองตาม Role หรือ จังหวัดได้
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/userrole-filter.png')}
                alt='ค้นหาและกรอง'
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>ดูรายละเอียดผู้ใช้:</b> ตารางแสดงชื่อ, อีเมล, บทบาท, จังหวัด, สิทธิ์, สถานะ และปุ่ม "แก้ไข"
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/userrole-main.png')}
                alt='หน้าหลัก UserRoleManager'
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>แก้ไขบทบาท/สิทธิ์/จังหวัด:</b> ในหน้าต่าง Pop-up การแก้ไข มี 4 แท็บ: Role, สิทธิ์, จังหวัด, สรุป
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/userrole-edit-role.png')}
                alt='แก้ไข Role'
                style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
              />
              <img
                src={require('../docs/visuals/userrole-edit-perm.png')}
                alt='แก้ไขสิทธิ์'
                style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
              />
              <img
                src={require('../docs/visuals/userrole-edit-prov.png')}
                alt='แก้ไขจังหวัด'
                style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
              />
              <img
                src={require('../docs/visuals/userrole-summary.png')}
                alt='สรุปข้อมูล'
                style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
              />
            </div>
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div
          style={{
            background: 'transparent',
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
            overflowX: 'auto'
          }}
        >
          <pre style={{ margin: 0 }}>{`
flowchart TD
    A[เข้าสู่หน้าจัดการ Role ผู้ใช้] --> B{ค้นหาหรือกรองผู้ใช้}
    B -->|เลือกผู้ใช้| C[คลิก "แก้ไข"]
    C --> D[Modal แก้ไขข้อมูลผู้ใช้]
    D --> E[เลือก Role]
    D --> F[กำหนดสิทธิ์]
    D --> G[เลือกจังหวัด]
    D --> H[ตรวจสอบสรุป]
    H --> I{บันทึกหรือยกเลิก}
    I -->|บันทึก| J[อัปเดตข้อมูลสำเร็จ]
    I -->|ยกเลิก| K[ปิด Modal]
      `}</pre>
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>
          <ul>
            <li>ผู้ใช้แต่ละคนจะเห็น/แก้ไขข้อมูลได้เฉพาะจังหวัดที่ตนเองมีสิทธิ์</li>
            <li>การเปลี่ยน Role หรือ Province จะมีผลต่อสิทธิ์การเข้าถึงข้อมูล</li>
          </ul>
        </div>
      </>
    ),
    logic: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔐 ตรรกะธุรกิจ (RBAC & Province Access)</h2>
        <ul>
          <li>RBAC: กำหนดสิทธิ์ตามบทบาท (Admin, Province Manager, User)</li>
          <li>Province-limited: ข้อมูลผู้ใช้และสิทธิ์ถูกจำกัดตาม provinceId</li>
          <li>Permission check: ตรวจสอบสิทธิ์ก่อนแสดงปุ่ม/ดำเนินการ</li>
        </ul>
        <div style={{ margin: '12px 0' }}>
          <b>ตัวอย่าง query:</b>
          <pre
            style={{ background: 'transparent', padding: 8, borderRadius: 6 }}
          >{`query(usersRef, where('provinceId', '==', currentProvinceId))`}</pre>
        </div>
        <div style={{ margin: '12px 0' }}>
          <b>ตัวอย่าง Permission Check:</b>
          <pre style={{ background: 'transparent', padding: 8, borderRadius: 6 }}>{`
if (!hasPermission(PERMISSIONS.USER_ROLE_EDIT) || !hasProvinceAccess(provinceId)) {
  return <AccessDenied />;
}
          `}</pre>
        </div>
        <div style={{ margin: '12px 0', color: '#888', fontSize: 13 }}>
          <b>การแจ้งเตือน:</b> เมื่อมีการเปลี่ยน Role หรือ Province ระบบจะส่ง Notification ไปยังผู้ใช้
        </div>
      </>
    )
  },

  // User Review (Admin)
  '/admin/review-users': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🧑‍💼 ภาพรวม</h2>
        <p>
          <b>หน้าตรวจสอบและอนุมัติผู้ใช้</b> สำหรับผู้ดูแลระบบและผู้จัดการ ใช้สำหรับตรวจสอบ อนุมัติ
          หรือปฏิเสธคำขอสมัครสมาชิกใหม่ สามารถกำหนดบทบาท (Role), สิทธิ์ (Permissions) และจังหวัดที่เข้าถึงได้ (Province)
          ให้กับผู้ใช้แต่ละรายก่อนอนุมัติ
        </p>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>📝 ขั้นตอนการใช้งาน</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            <b>ตรวจสอบรายชื่อผู้ใช้ที่รออนุมัติ:</b> ดูรายละเอียดผู้สมัครใหม่ในตาราง
          </li>
          <li>
            <b>แก้ไขข้อมูลผู้ใช้:</b> คลิก <b>ไอคอนเฟือง</b> หรือ <b>ไอคอนแก้ไข</b> เพื่อเปิดหน้าต่างตั้งค่าผู้ใช้
            <ul>
              <li>
                กำหนด <b>บทบาท</b> (เช่น ผู้ใช้ทั่วไป, ผู้จัดการสาขา, ผู้ดูแลระบบ ฯลฯ)
              </li>
              <li>
                กำหนด <b>สิทธิ์</b> (เลือกจากชุดสิทธิ์ที่มี)
              </li>
              <li>
                กำหนด <b>จังหวัด</b> ที่ผู้ใช้สามารถเข้าถึงได้
              </li>
              <li>ตรวจสอบสรุปข้อมูลก่อนบันทึก</li>
            </ul>
          </li>
          <li>
            <b>อนุมัติหรือปฏิเสธ:</b> ใช้ปุ่ม <b>อนุมัติ</b> (สีเขียว) หรือ <b>ปฏิเสธ</b> (สีแดง) เพื่อดำเนินการ
          </li>
          <li>
            <b>การแจ้งเตือน:</b> ผู้ใช้และผู้ดูแลที่เกี่ยวข้องจะได้รับการแจ้งเตือนเมื่อมีการอนุมัติหรือปฏิเสธ
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔄 ขั้นตอนการทำงาน (Workflow)</h2>
        {/* 1. Notification Center */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/user-review-notification.png')}
            alt='ศูนย์แจ้งเตือน'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>1. ศูนย์แจ้งเตือน:</b> แสดงคำขอสมัครสมาชิกใหม่และสถานะการอนุมัติ/ปฏิเสธ/เปลี่ยนแปลงสิทธิ์
          </div>
        </div>
        {/* 2. Pending User List */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/user-review-table.png')}
            alt='ตารางผู้ใช้ที่รออนุมัติ'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>2. ตารางผู้ใช้ที่รออนุมัติ:</b> แสดงผู้ใช้ที่รออนุมัติทั้งหมด สามารถกรอง ดูรายละเอียด
            และดำเนินการได้จากตารางนี้
          </div>
        </div>
        {/* 3. Edit User Modal - Role Tab */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/user-review-edit-role.png')}
            alt='แก้ไขบทบาทผู้ใช้'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>3. กำหนดบทบาท:</b> เลือกบทบาทที่เหมาะสมให้กับผู้ใช้แต่ละราย
          </div>
        </div>
        {/* 4. Edit User Modal - Permissions Tab */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/user-review-edit-permissions.png')}
            alt='แก้ไขสิทธิ์ผู้ใช้'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>4. กำหนดสิทธิ์:</b> เลือกหรือปรับแต่งสิทธิ์การเข้าถึงของผู้ใช้
          </div>
        </div>
        {/* 5. Edit User Modal - Province Tab */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/user-review-edit-province.png')}
            alt='กำหนดจังหวัด'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>5. กำหนดจังหวัด:</b> ระบุจังหวัดที่ผู้ใช้สามารถเข้าถึงข้อมูลได้
          </div>
        </div>
        {/* 6. Edit User Modal - Summary Tab */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/user-review-edit-summary.png')}
            alt='สรุปข้อมูลผู้ใช้'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>6. สรุปข้อมูล:</b> ตรวจสอบข้อมูลทั้งหมดก่อนบันทึกและอนุมัติ
          </div>
        </div>
        {/* 7. Role Selection Dropdown */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/user-review-role-dropdown.png')}
            alt='เลือกบทบาท'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>7. เลือกบทบาท:</b> เลือกบทบาทจากรายการที่มีให้กับผู้ใช้แต่ละราย
          </div>
        </div>
        {/* 8. Approve/Reject Actions */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/user-review-actions.png')}
            alt='อนุมัติ/ปฏิเสธ'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>8. อนุมัติ/ปฏิเสธ:</b> ใช้ปุ่ม <b>อนุมัติ</b> (สีเขียว) หรือ <b>ปฏิเสธ</b> (สีแดง)
            เพื่อดำเนินการกับผู้ใช้
          </div>
        </div>
      </>
    ),
    logic: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>⚙️ ตรรกะธุรกิจ & สิทธิ์การเข้าถึง</h2>
        <ul>
          <li>
            RBAC: เฉพาะผู้ที่มีสิทธิ์ <b>USER_ROLE_EDIT</b> (เช่น Admin, Manager)
            เท่านั้นที่สามารถอนุมัติหรือปฏิเสธผู้ใช้ได้
          </li>
          <li>การเปลี่ยน Role หรือ Province จะมีผลต่อสิทธิ์การเข้าถึงข้อมูล</li>
        </ul>
        <div style={{ margin: '12px 0' }}>
          <b>ตัวอย่าง query:</b>
          <pre
            style={{ background: 'transparent', padding: 8, borderRadius: 6 }}
          >{`query(usersRef, where('provinceId', '==', currentProvinceId))`}</pre>
        </div>
        <div style={{ margin: '12px 0' }}>
          <b>ตัวอย่าง Permission Check:</b>
          <pre style={{ background: 'transparent', padding: 8, borderRadius: 6 }}>{`
if (!hasPermission(PERMISSIONS.USER_ROLE_EDIT) || !hasProvinceAccess(provinceId)) {
  return <AccessDenied />;
}
          `}</pre>
        </div>
        <div style={{ margin: '12px 0', color: '#888', fontSize: 13 }}>
          <b>การแจ้งเตือน:</b> เมื่อมีการเปลี่ยน Role หรือ Province ระบบจะส่ง Notification ไปยังผู้ใช้
        </div>
      </>
    )
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
  },

  // Employee List Page
  '/admin/employees': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>👥 ภาพรวม</h2>
        <p>
          <b>หน้ารายชื่อพนักงาน</b> สำหรับดูข้อมูลพนักงานทั้งหมดในระบบ สามารถค้นหา กรอง แก้ไข หรือนำเข้าข้อมูลพนักงานได้
          รองรับการส่งออก/นำเข้า Excel และแสดงสถานะการจ้างงานของแต่ละคน
        </p>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>📝 วิธีใช้งาน</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>ใช้ช่องค้นหาเพื่อค้นหาพนักงานด้วยชื่อ, รหัส, หรือแผนก</li>
          <li>
            เลือกกรองตาม <b>สถานะ</b>, <b>แผนก</b>, หรือ <b>ตำแหน่ง</b> เพื่อดูเฉพาะกลุ่มที่ต้องการ
          </li>
          <li>
            คลิก <b>ปุ่มเพิ่มพนักงาน</b> เพื่อเพิ่มข้อมูลใหม่
          </li>
          <li>
            คลิก <b>ไอคอนดินสอ</b> เพื่อแก้ไขข้อมูล หรือ <b>ไอคอนถังขยะ</b> เพื่อลบ
          </li>
          <li>
            ใช้ปุ่ม <b>นำเข้า/ส่งออก Excel</b> เพื่อจัดการข้อมูลจำนวนมาก
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/employee-list.png')}
            alt='ตารางรายชื่อพนักงาน'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>1. ตารางรายชื่อพนักงาน:</b> แสดงข้อมูลพนักงานทั้งหมด สามารถคลิกเพื่อแก้ไข หรือลบแต่ละรายการได้
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/employee-actions.png')}
            alt='การดำเนินการกับพนักงาน'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>2. การดำเนินการ:</b> ใช้ไอคอนดินสอเพื่อแก้ไข หรือถังขยะเพื่อลบข้อมูล
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/employee-batch.png')}
            alt='นำเข้า/ส่งออก Excel'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>3. นำเข้า/ส่งออก Excel:</b> จัดการข้อมูลพนักงานจำนวนมากได้อย่างรวดเร็ว
          </div>
        </div>
      </>
    ),
    logic: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔒 ตรรกะธุรกิจ (RBAC & Province Access)</h2>
        <ul>
          <li>
            ข้อมูลพนักงานจะถูกกรองตาม <b>จังหวัด (provinceId)</b> ของผู้ใช้ที่เข้าสู่ระบบ
          </li>
          <li>
            เฉพาะผู้ที่มีสิทธิ์ <b>ดูข้อมูลพนักงาน</b> หรือ <b>แก้ไขข้อมูลพนักงาน</b> เท่านั้นที่สามารถดู/แก้ไขข้อมูลได้
          </li>
          <li>
            ผู้จัดการ/ผู้บริหารระดับสูง สามารถดูและแก้ไขข้อมูลพนักงานทุกจังหวัด, Manager/Staff
            จะเห็นเฉพาะข้อมูลในจังหวัดของตนเอง
          </li>
          <li>การเพิ่ม/ลบ/แก้ไขข้อมูลจะถูกบันทึกผู้กระทำและเวลา (audit log)</li>
        </ul>
      </>
    )
  },

  // Branches Management Page
  '/admin/branches': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🏢 ภาพรวม</h2>
        <p>
          <b>หน้าจัดการสาขา</b> สำหรับดูข้อมูลสาขาทั้งหมดในระบบ เพิ่ม แก้ไข หรือลบสาขาได้อย่างสะดวก
          รองรับการกรองตามจังหวัดและสถานะการใช้งาน
        </p>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>📝 วิธีใช้งาน</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            คลิก <b>ปุ่มเพิ่มสาขา</b> เพื่อเพิ่มข้อมูลสาขาใหม่
          </li>
          <li>
            ใช้ <b>ไอคอนดินสอ</b> เพื่อแก้ไขข้อมูลสาขา
          </li>
          <li>
            ใช้ <b>ไอคอนถังขยะ</b> เพื่อลบสาขา
          </li>
          <li>กรอกข้อมูลในฟอร์มให้ครบถ้วน เช่น รหัสสาขา ชื่อสาขา จังหวัด สถานะ ฯลฯ</li>
          <li>
            คลิก <b>บันทึก</b> เพื่อยืนยันการเพิ่มหรือแก้ไข
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/branch-list.png')}
            alt='ตารางรายชื่อสาขา'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>1. ตารางรายชื่อสาขา:</b> แสดงข้อมูลสาขาทั้งหมด สามารถแก้ไขหรือลบแต่ละรายการได้
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/branch-actions.png')}
            alt='การดำเนินการกับสาขา'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>2. การดำเนินการ:</b> ใช้ไอคอนดินสอเพื่อแก้ไข หรือถังขยะเพื่อลบข้อมูลสาขา
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/branch-edit-modal.png')}
            alt='ฟอร์มแก้ไข/เพิ่มสาขา'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>3. ฟอร์มแก้ไข/เพิ่มสาขา:</b> กรอกข้อมูลให้ครบถ้วนแล้วกดบันทึก
          </div>
        </div>
      </>
    ),
    logic: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔒 ตรรกะธุรกิจ (RBAC & Permissions)</h2>
        <ul>
          <li>
            เฉพาะผู้ที่มีสิทธิ์ <b>จัดการข้อมูลสาขา</b> เท่านั้นที่สามารถเพิ่ม แก้ไข หรือลบสาขาได้
          </li>
          <li>ข้อมูลสาขาจะถูกกรองตามจังหวัดที่ผู้ใช้มีสิทธิ์เข้าถึง</li>
          <li>ทุกการเปลี่ยนแปลงจะถูกบันทึกผู้กระทำและเวลา (audit log)</li>
        </ul>
      </>
    )
  },

  // Provinces Management Page
  '/admin/provinces': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🗺️ ภาพรวม</h2>
        <p>
          <b>หน้าจัดการจังหวัด</b> สำหรับดูข้อมูลจังหวัดทั้งหมดในระบบ เพิ่ม แก้ไข หรือลบจังหวัดได้อย่างสะดวก
          รองรับการกรองและค้นหาตามชื่อ รหัส หรือภูมิภาค
        </p>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>📝 วิธีใช้งาน</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            คลิก <b>ปุ่มเพิ่มจังหวัด</b> เพื่อเพิ่มข้อมูลจังหวัดใหม่
          </li>
          <li>
            ใช้ <b>ไอคอนดินสอ</b> เพื่อแก้ไขข้อมูลจังหวัด
          </li>
          <li>
            ใช้ <b>ไอคอนถังขยะ</b> เพื่อลบจังหวัด
          </li>
          <li>กรอกข้อมูลในฟอร์มให้ครบถ้วน เช่น รหัสจังหวัด ชื่อจังหวัด (TH/EN) ภูมิภาค สถานะ ฯลฯ</li>
          <li>
            คลิก <b>บันทึก</b> เพื่อยืนยันการเพิ่มหรือแก้ไข
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/province-list.png')}
            alt='ตารางรายชื่อจังหวัด'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>1. ตารางรายชื่อจังหวัด:</b> แสดงข้อมูลจังหวัดทั้งหมด สามารถแก้ไขหรือลบแต่ละรายการได้
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={require('../docs/visuals/province-edit-modal.png')}
            alt='ฟอร์มแก้ไข/เพิ่มจังหวัด'
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>2. ฟอร์มแก้ไข/เพิ่มจังหวัด:</b> กรอกข้อมูลให้ครบถ้วนแล้วกดบันทึก
          </div>
        </div>
      </>
    ),
    logic: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔒 ตรรกะธุรกิจ (RBAC & Permissions)</h2>
        <ul>
          <li>
            เฉพาะผู้ที่มีสิทธิ์ <b>จัดการข้อมูลจังหวัด</b> เท่านั้นที่สามารถเพิ่ม แก้ไข หรือลบจังหวัดได้
          </li>
          <li>ข้อมูลจังหวัดจะถูกกรองตามจังหวัดที่ผู้ใช้มีสิทธิ์เข้าถึง</li>
          <li>ทุกการเปลี่ยนแปลงจะถูกบันทึกผู้กระทำและเวลา (audit log)</li>
        </ul>
      </>
    )
  },

  // Input Price Page (Account)
  '/account/input-price': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>💸 ภาพรวม</h2>
        <p>
          <b>หน้าบันทึกราคาซื้อ (รถและอุปกรณ์)</b> สำหรับบันทึกและตรวจสอบราคาซื้อสินค้า/อุปกรณ์จากใบรับสินค้า
          พร้อมคำนวณยอดสุทธิและภาษี รองรับการอนุมัติหลายขั้นตอน (แก้ไข, ตรวจสอบ, อนุมัติ) และแสดงประวัติการเปลี่ยนแปลง
        </p>
        <div style={{ margin: '16px 0' }}>
          <img
            src={require('../docs/visuals/inputprice-main.png')}
            alt='หน้าหลักบันทึกราคาซื้อ'
            style={{ width: '100%', borderRadius: 12, boxShadow: '0 2px 12px rgba(44,62,80,0.08)', marginBottom: 8 }}
          />
        </div>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>📝 ขั้นตอนการใช้งาน</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            <b>ค้นหาใบรับสินค้า:</b> พิมพ์เลขที่ใบรับสินค้าเพื่อค้นหาและเลือกข้อมูล
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/inputprice-search.png')}
                alt='ค้นหาใบรับสินค้า'
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>กรอกข้อมูลใบกำกับภาษีและรายละเอียด:</b> ระบุเลขที่/วันที่ใบกำกับภาษี ประเภท ราคา เครดิต ฯลฯ
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/inputprice-header.png')}
                alt='กรอกข้อมูลใบกำกับภาษี'
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>เพิ่ม/แก้ไขรายการสินค้า:</b> กรอกรายการสินค้า ปรับจำนวน ราคาต่อหน่วย ส่วนลด ฯลฯ
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/inputprice-items.png')}
                alt='เพิ่ม/แก้ไขรายการสินค้า'
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>ตรวจสอบยอดรวมและภาษี:</b> ระบบคำนวณยอดสุทธิ ส่วนลด หักเงินมัดจำ และภาษีอัตโนมัติ
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/inputprice-summary.png')}
                alt='ตรวจสอบยอดรวมและภาษี'
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>ดูรายละเอียดสินค้าแต่ละรายการ:</b> คลิกแถวสินค้าเพื่อดูข้อมูลขยาย เช่น เลขที่รับ, สาขา, รายละเอียดสินค้า
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/inputprice-item-detail.png')}
                alt='รายละเอียดสินค้าแต่ละรายการ'
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>ระบุผู้แก้ไข/ตรวจสอบ/อนุมัติ และวันที่:</b> กำหนดผู้รับผิดชอบแต่ละขั้นตอนและวันที่ที่เกี่ยวข้อง
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/inputprice-approvers.png')}
                alt='ระบุผู้แก้ไข/ตรวจสอบ/อนุมัติ'
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>ดูประวัติการเปลี่ยนแปลงและสถานะ:</b> ตรวจสอบประวัติการแก้ไขและสถานะเอกสาร
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/inputprice-history.png')}
                alt='ประวัติการเปลี่ยนแปลงและสถานะ'
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>บันทึก:</b> กดปุ่ม "บันทึก" เพื่อบันทึกข้อมูลหรือส่งต่อขั้นตอนถัดไป
            <div style={{ margin: '8px 0' }}>
              <img
                src={require('../docs/visuals/inputprice-save.png')}
                alt='ปุ่มบันทึก'
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div
          style={{
            background: 'transparent',
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
            overflowX: 'auto'
          }}
        >
          <pre style={{ margin: 0 }}>{`
flowchart TD
    A[ค้นหาใบรับสินค้า] --> B[กรอกข้อมูลใบกำกับภาษี]
    B --> C[เพิ่ม/แก้ไขรายการสินค้า]
    C --> D[ตรวจสอบยอดรวมและภาษี]
    D --> E[ระบุผู้แก้ไข/ตรวจสอบ/อนุมัติ]
    E --> F[ดูประวัติการเปลี่ยนแปลง]
    F --> G[บันทึกหรือส่งต่อ]
          `}</pre>
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>
          <ul>
            <li>แต่ละขั้นตอนจะถูกบันทึกในประวัติการเปลี่ยนแปลงและสถานะเอกสาร</li>
            <li>การอนุมัติหลายขั้นตอน (แก้ไข, ตรวจสอบ, อนุมัติ) ตามสิทธิ์ของผู้ใช้</li>
          </ul>
        </div>
      </>
    ),
    logic: (
      <>
        <h2 style={{ marginBottom: 8, color: '#2d4739' }}>🔐 ตรรกะธุรกิจ (RBAC & Permission)</h2>
        <ul>
          <li>
            เฉพาะผู้ที่มีสิทธิ์ <b>MANAGE_EXPENSE</b> และเข้าถึงจังหวัด (province)
            ได้เท่านั้นที่สามารถบันทึก/แก้ไขข้อมูล
          </li>
          <li>
            การตรวจสอบ/อนุมัติ ต้องมีสิทธิ์ <b>DOCUMENT_REVIEW</b> หรือ <b>DOCUMENT_APPROVE</b> ตามลำดับ
          </li>
          <li>
            ข้อมูลจะถูกบันทึกพร้อม <b>provinceId</b> และ <b>departmentId</b> ทุกครั้ง
          </li>
          <li>ทุกการเปลี่ยนแปลงจะถูกบันทึกผู้กระทำและเวลา (audit log)</li>
        </ul>
        <div style={{ margin: '12px 0' }}>
          <b>ตัวอย่าง Permission Check:</b>
          <pre style={{ background: 'transparent', padding: 8, borderRadius: 6 }}>{`
if (!hasPermission(PERMISSIONS.MANAGE_EXPENSE) || !hasProvinceAccess(provinceId)) {
  return <AccessDenied />;
}
          `}</pre>
        </div>
        <div style={{ margin: '12px 0', color: '#888', fontSize: 13 }}>
          <b>การแจ้งเตือน:</b> เมื่อมีการเปลี่ยน Role หรือ Province ระบบจะส่ง Notification ไปยังผู้ใช้
        </div>
      </>
    )
  }
};

export default pageDocs;
