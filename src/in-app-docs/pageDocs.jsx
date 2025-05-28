import React, { ReactNode } from 'react';
import LoginPageFlow from '../docs/visuals/LoginPageFlow';
import RegisterPageFlow from '../docs/visuals/RegisterPageFlow';

// Import all images
import userroleMain from '../docs/visuals/userrole-main.png';
import userroleFilter from '../docs/visuals/userrole-filter.png';
import userroleEditRole from '../docs/visuals/userrole-edit-role.png';
import userroleEditPerm from '../docs/visuals/userrole-edit-perm.png';
import userroleEditProv from '../docs/visuals/userrole-edit-prov.png';
import userroleSummary from '../docs/visuals/userrole-summary.png';
import userReviewNotification from '../docs/visuals/user-review-notification.png';
import userReviewTable from '../docs/visuals/user-review-table.png';
import userReviewEditRole from '../docs/visuals/user-review-edit-role.png';
import userReviewEditPermissions from '../docs/visuals/user-review-edit-permissions.png';
import userReviewEditProvince from '../docs/visuals/user-review-edit-province.png';
import userReviewEditSummary from '../docs/visuals/user-review-edit-summary.png';
import userReviewRoleDropdown from '../docs/visuals/user-review-role-dropdown.png';
import userReviewActions from '../docs/visuals/user-review-actions.png';
import employeeList from '../docs/visuals/employee-list.png';
import employeeActions from '../docs/visuals/employee-actions.png';
import employeeBatch from '../docs/visuals/employee-batch.png';
import branchList from '../docs/visuals/branch-list.png';
import branchActions from '../docs/visuals/branch-actions.png';
import branchEditModal from '../docs/visuals/branch-edit-modal.png';
import provinceList from '../docs/visuals/province-list.png';
import provinceEditModal from '../docs/visuals/province-edit-modal.png';
import inputpriceMain from '../docs/visuals/inputprice-main.png';
import inputpriceSearch from '../docs/visuals/inputprice-search.png';
import inputpriceHeader from '../docs/visuals/inputprice-header.png';
import inputpriceItems from '../docs/visuals/inputprice-items.png';
import inputpriceSummary from '../docs/visuals/inputprice-summary.png';
import inputpriceItemDetail from '../docs/visuals/inputprice-item-detail.png';
import inputpriceApprovers from '../docs/visuals/inputprice-approvers.png';
import inputpriceHistory from '../docs/visuals/inputprice-history.png';
import inputpriceSave from '../docs/visuals/inputprice-save.png';

// Placeholder for compose notification image until actual screenshot is added
const composeNotificationPlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='system-ui' font-size='24' fill='%23666'%3ECompose Notification Screenshot Placeholder%3C/text%3E%3C/svg%3E";

// Dynamic route matching patterns
const ROUTE_PATTERNS = {
  // Static routes (exact match)
  STATIC: 'static',
  // Dynamic routes with single parameter
  SINGLE_PARAM: 'single_param',
  // Dynamic routes with multiple parameters
  MULTI_PARAM: 'multi_param',
  // Wildcard routes
  WILDCARD: 'wildcard',
};

// Route matcher utility
const routeMatcher = {
  /**
   * Check if a route matches a pattern
   * @param {string} currentRoute - The current route path
   * @param {string} pattern - The pattern to match against
   * @returns {boolean|object} - false if no match, object with params if match
   */
  match: (currentRoute, pattern) => {
    // Remove trailing slashes
    const route = currentRoute.replace(/\/$/, '') || '/';
    const patternPath = pattern.replace(/\/$/, '') || '/';

    // Exact match for static routes
    if (!pattern.includes(':') && !pattern.includes('*')) {
      return route === patternPath ? { type: ROUTE_PATTERNS.STATIC } : false;
    }

    // Convert pattern to regex
    const regexPattern = patternPath
      .replace(/:[^/]+/g, '([^/]+)') // Replace :param with capture group
      .replace(/\*/g, '.*'); // Replace * with wildcard

    const regex = new RegExp(`^${regexPattern}$`);
    const match = route.match(regex);

    if (!match) return false;

    // Extract parameter names and values
    const paramNames = (patternPath.match(/:[^/]+/g) || []).map((p) => p.slice(1));
    const paramValues = match.slice(1);

    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = paramValues[index];
    });

    return {
      type: paramNames.length > 1 ? ROUTE_PATTERNS.MULTI_PARAM : ROUTE_PATTERNS.SINGLE_PARAM,
      params,
    };
  },

  /**
   * Find the best matching documentation for a route
   * @param {string} currentRoute - The current route path
   * @param {object} pageDocs - The page documentation object
   * @returns {object|null} - The matching documentation or null
   */
  findDoc: (currentRoute, pageDocs) => {
    // First try exact match
    if (pageDocs[currentRoute]) {
      return pageDocs[currentRoute];
    }

    // Then try pattern matching
    for (const pattern of Object.keys(pageDocs)) {
      const match = routeMatcher.match(currentRoute, pattern);
      if (match) {
        const doc = pageDocs[pattern];
        // Add route parameters to the documentation context
        return { ...doc, routeParams: match.params, matchType: match.type };
      }
    }

    return null;
  },

  /**
   * Get role-specific route documentation
   * @param {string} currentRoute - The current route
   * @param {string} userRole - The user's role
   * @param {object} pageDocs - The page documentation object
   * @returns {object|null} - Role-specific documentation
   */
  getRoleSpecificDoc: (currentRoute, userRole, pageDocs) => {
    const doc = routeMatcher.findDoc(currentRoute, pageDocs);
    if (!doc) return null;

    // If the documentation has role-specific content, merge it
    if (doc.roleSpecific && doc.roleSpecific[userRole]) {
      return {
        ...doc,
        ...doc.roleSpecific[userRole],
        baseDoc: doc,
      };
    }

    return doc;
  },
};

const pageDocs = {
  // Login Page
  '/auth/login': {
    overview: 'เข้าสู่ระบบเพื่อใช้งานระบบ KBN ด้วยอีเมลและรหัสผ่าน หรือบัญชี Google',
    instruction: 'กรอกอีเมลและรหัสผ่านที่ลงทะเบียนไว้ หรือเลือกเข้าสู่ระบบด้วย Google หากมีสิทธิ์',
    flow: <LoginPageFlow />,
    logic:
      'ตรวจสอบอีเมลและรหัสผ่าน, หากสำเร็จจะโหลดข้อมูลโปรไฟล์และสิทธิ์, มีการตรวจสอบระบบควบคุมการเข้าถึงตาม[Role] (Role Based Access Control) ซึ่งกำหนดสิทธิ์การใช้งานตาม[Role]ของผู้ใช้ เช่น Admin สามารถจัดการระบบทั้งหมด, Manager จัดการได้เฉพาะในจังหวัดของตน และ Staff ใช้งานได้ตามสิทธิ์ที่ได้รับ, รวมถึงมีการตรวจสอบการเข้าถึงตามจังหวัด (province access) หลังเข้าสู่ระบบ',
  },

  // Register Page
  '/auth/signup': {
    overview: 'ลงทะเบียนผู้ใช้ใหม่เพื่อขอสิทธิ์เข้าใช้งานระบบ KBN',
    instruction:
      'เลือกประเภทผู้ใช้งาน 1.พนักงานบริษัทฯ 2.ผู้ใช้งานทั่วไป (ลูกค้า เป็นต้น)) กรอกข้อมูลส่วนตัว เลือกจังหวัด, สาขา, และแผนก ตั้งรหัสผ่าน และยืนยันรหัสผ่าน',
    flow: <RegisterPageFlow />,
    logic:
      'ผู้สมัครใหม่จะถูกกำหนดสถานะเป็น pending และต้องรอผู้ดูแลระบบอนุมัติ, ข้อมูลจังหวัด สาขา และแผนก จะถูกบันทึกใน profile, สิทธิ์การเข้าถึงส่วนต่างๆของระบบ: ผู้ดูแล (Admin/Manager) และผู้บริหารเท่านั้น ที่สามารถอนุมัติหรือแก้ไขสิทธิ์',
  },

  // Forgot Password Page
  '/auth/reset-password': {
    overview: 'ขอรีเซ็ตรหัสผ่านในกรณีที่ลืมหรือเข้าสู่ระบบไม่ได้',
    instruction: 'กรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล',
    flow: 'กรอกอีเมล > กดขอรีเซ็ตรหัสผ่าน > ตรวจสอบอีเมล > คลิกลิงก์เพื่อเปลี่ยนรหัสผ่าน',
    logic: 'ไม่มีการเปลี่ยนแปลงสิทธิ์หรือ จังหวัด',
  },

  // Complete Profile Page
  '/complete-profile': {
    overview: 'กรอกข้อมูลโปรไฟล์เพิ่มเติมหลังสมัครหรือเข้าสู่ระบบด้วย Google',
    instruction: 'กรอกชื่อ-นามสกุล เลือกจังหวัด สาขา และข้อมูลที่จำเป็นอื่น ๆ',
    flow: 'เข้าสู่ระบบ > กรอกข้อมูลโปรไฟล์ > ยืนยัน > ระบบบันทึกข้อมูล > รออนุมัติ (ถ้าจำเป็น)',
    logic:
      'ข้อมูลจังหวัด สาขา และแผนก จะถูกบันทึกในระบบ, การกำหนดสิทธิ์การเข้าถึงส่วนต่างๆของระบบ: ผู้ใช้ใหม่จะถูกกำหนด role เป็น pending จนกว่าจะได้รับอนุมัติ',
  },

  // Pending Page
  '/pending': {
    overview:
      'ระบบจะแจ้งสถานะบัญชีที่รอการอนุมัติให้ผู้ดูแลระบบ และผู้ที่เกี่ยวข้องเพื่อทำการอนุมัติ',
    instruction:
      'รออีเมลแจ้งเตือนเมื่อบัญชีได้รับการอนุมัติ และจะสามารถเข้าใช้งานระบบตาม Role และสิทธิ์ที่ได้รับได้ทันที',
    flow: 'สมัคร/เข้าสู่ระบบ > รออนุมัติ > ได้รับอีเมลแจ้งเตือน > เข้าสู่ระบบใหม่โดยอัตโนมัติ',
    logic:
      'Role Based Access Control: เฉพาะผู้ดูแล (Admin/Manager) และผู้บริหารระดับสูงเท่านั้นที่สามารถอนุมัติบัญชี, ผู้ใช้ที่รออนุมัติจะไม่สามารถเข้าถึงข้อมูลใด ๆ',
  },

  // User Role Manager (Admin)
  '/admin/users': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>👥 ภาพรวม</h2>
        <p>
          <b>หน้าจัดการ [Role] ผู้ใช้</b> สำหรับผู้ดูแลระบบในการจัดการบทบาท (Role) และสิทธิ์
          (Permissions) ของผู้ใช้แต่ละคนในแต่ละจังหวัด รองรับการค้นหา กรอง แก้ไข
          และกำหนดสิทธิ์การเข้าถึงข้อมูลตามจังหวัดและบทบาท
        </p>
        <div style={{ margin: '16px 0' }}>
          <img
            src={userroleMain}
            alt="หน้าหลัก UserRoleManager"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44,62,80,0.08)',
              marginBottom: 8,
            }}
          />
        </div>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8 }}>📝 ขั้นตอนการใช้งาน</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            <b>ค้นหาผู้ใช้:</b> ใช้ช่องค้นหาด้านบนเพื่อค้นหาด้วยชื่อหรืออีเมล กรองตาม Role หรือ
            จังหวัดได้
            <div style={{ margin: '8px 0' }}>
              <img
                src={userroleFilter}
                alt="ค้นหาและกรอง"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>ดูรายละเอียดผู้ใช้:</b> ตารางแสดงชื่อ, อีเมล, บทบาท, จังหวัด, สิทธิ์, สถานะ และปุ่ม
            "แก้ไข"
            <div style={{ margin: '8px 0' }}>
              <img
                src={userroleMain}
                alt="หน้าหลัก UserRoleManager"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>แก้ไขบทบาท/สิทธิ์/จังหวัด:</b> ในหน้าต่าง Pop-up การแก้ไข มี 4 แท็บ: Role, สิทธิ์,
            จังหวัด, สรุป
            <div style={{ margin: '8px 0' }}>
              <img
                src={userroleEditRole}
                alt="แก้ไข Role"
                style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
              />
              <img
                src={userroleEditPerm}
                alt="แก้ไขสิทธิ์"
                style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
              />
              <img
                src={userroleEditProv}
                alt="แก้ไขจังหวัด"
                style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
              />
              <img
                src={userroleSummary}
                alt="สรุปข้อมูล"
                style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
              />
            </div>
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8 }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div
          style={{
            background: 'transparent',
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
            overflowX: 'auto',
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
        <h2 style={{ marginBottom: 8 }}>🔐 ระบบงาน (RBAC & Province Access)</h2>
        <ul>
          <li>RBAC: กำหนดสิทธิ์ตามระดับสิทธิ์ (Admin, Province Manager, User)</li>
          <li>Province-limited: ข้อมูลผู้ใช้และสิทธิ์ถูกจำกัดตาม จังหวัด</li>
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
          <b>การแจ้งเตือน:</b> เมื่อมีการเปลี่ยน Role หรือ Province ระบบจะส่ง Notification
          ไปยังผู้ใช้
        </div>
      </>
    ),
  },

  // User Review (Admin)
  '/admin/review-users': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>🧑‍💼 ภาพรวม</h2>
        <p>
          <b>หน้าตรวจสอบและอนุมัติผู้ใช้</b> สำหรับผู้ดูแลระบบและผู้จัดการ ใช้สำหรับตรวจสอบ อนุมัติ
          หรือปฏิเสธคำขอสมัครสมาชิกใหม่ สามารถกำหนดบทบาท (Role), สิทธิ์ (Permissions)
          และจังหวัดที่เข้าถึงได้ (Province) ให้กับผู้ใช้แต่ละรายก่อนอนุมัติ
        </p>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8 }}>📝 ขั้นตอนการใช้งาน</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            <b>ตรวจสอบรายชื่อผู้ใช้ที่รออนุมัติ:</b> ดูรายละเอียดผู้สมัครใหม่ในตาราง
          </li>
          <li>
            <b>แก้ไขข้อมูลผู้ใช้:</b> คลิก <b>ไอคอนเฟือง</b> หรือ <b>ไอคอนแก้ไข</b>{' '}
            เพื่อเปิดหน้าต่างตั้งค่าผู้ใช้
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
            <b>อนุมัติหรือปฏิเสธ:</b> ใช้ปุ่ม <b>อนุมัติ</b> (สีเขียว) หรือ <b>ปฏิเสธ</b> (สีแดง)
            เพื่อดำเนินการ
          </li>
          <li>
            <b>การแจ้งเตือน:</b>{' '}
            ผู้ใช้และผู้ดูแลที่เกี่ยวข้องจะได้รับการแจ้งเตือนเมื่อมีการอนุมัติหรือปฏิเสธ
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8 }}>🔄 ขั้นตอนการทำงาน (Workflow)</h2>
        {/* 1. Notification Center */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={userReviewNotification}
            alt="ศูนย์แจ้งเตือน"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>1. ศูนย์แจ้งเตือน:</b>{' '}
            แสดงคำขอสมัครสมาชิกใหม่และสถานะการอนุมัติ/ปฏิเสธ/เปลี่ยนแปลงสิทธิ์
          </div>
        </div>
        {/* 2. Pending User List */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={userReviewTable}
            alt="ตารางผู้ใช้ที่รออนุมัติ"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
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
            src={userReviewEditRole}
            alt="แก้ไขบทบาทผู้ใช้"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>3. กำหนดบทบาท:</b> เลือกบทบาทที่เหมาะสมให้กับผู้ใช้แต่ละราย
          </div>
        </div>
        {/* 4. Edit User Modal - Permissions Tab */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={userReviewEditPermissions}
            alt="แก้ไขสิทธิ์ผู้ใช้"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>4. กำหนดสิทธิ์:</b> เลือกหรือปรับแต่งสิทธิ์การเข้าถึงของผู้ใช้
          </div>
        </div>
        {/* 5. Edit User Modal - Province Tab */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={userReviewEditProvince}
            alt="กำหนดจังหวัด"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>5. กำหนดจังหวัด:</b> ระบุจังหวัดที่ผู้ใช้สามารถเข้าถึงข้อมูลได้
          </div>
        </div>
        {/* 6. Edit User Modal - Summary Tab */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={userReviewEditSummary}
            alt="สรุปข้อมูลผู้ใช้"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>6. สรุปข้อมูล:</b> ตรวจสอบข้อมูลทั้งหมดก่อนบันทึกและอนุมัติ
          </div>
        </div>
        {/* 7. Role Selection Dropdown */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={userReviewRoleDropdown}
            alt="เลือกบทบาท"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>7. เลือกบทบาท:</b> เลือกบทบาทจากรายการที่มีให้กับผู้ใช้แต่ละราย
          </div>
        </div>
        {/* 8. Approve/Reject Actions */}
        <div style={{ marginBottom: 16 }}>
          <img
            src={userReviewActions}
            alt="อนุมัติ/ปฏิเสธ"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
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
        <h2 style={{ marginBottom: 8 }}>⚙️ ระบบงาน & สิทธิ์การเข้าถึง</h2>
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
          <b>การแจ้งเตือน:</b> เมื่อมีการเปลี่ยน Role หรือ Province ระบบจะส่ง Notification
          ไปยังผู้ใช้
        </div>
      </>
    ),
  },

  // Profile Page
  '/profile': {
    overview: 'ดูและแก้ไขข้อมูลโปรไฟล์ส่วนตัว เช่น ชื่อ อีเมล เบอร์โทร จังหวัด สาขา',
    instruction: 'สามารถเปลี่ยนรหัสผ่านและดูสถานะการยืนยันอีเมลได้',
    flow: 'เข้าสู่ระบบ > ไปที่โปรไฟล์ > แก้ไขข้อมูล/เปลี่ยนรหัสผ่าน > บันทึก',
    logic:
      'ข้อมูล province และ role จะถูกแสดงตามสิทธิ์, RBAC: เฉพาะเจ้าของบัญชีเท่านั้นที่สามารถแก้ไขข้อมูลส่วนตัว',
  },

  // Role Check (internal route)
  '/role-check': {
    overview: 'หน้าตรวจสอบ role หลังเข้าสู่ระบบ เพื่อเปลี่ยนเส้นทางไปยังหน้าที่เหมาะสม',
    instruction: 'ระบบจะ redirect อัตโนมัติ ไม่ต้องมีการโต้ตอบจากผู้ใช้',
    flow: 'เข้าสู่ระบบ > ตรวจสอบ role > redirect ไปยังหน้าหลัก/overview/dashboard',
    logic: 'RBAC: ตรวจสอบ role และ province access เพื่อกำหนด landing page ที่เหมาะสม',
  },

  // Employee List Page
  '/admin/employees': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>👥 ภาพรวม</h2>
        <p>
          <b>หน้ารายชื่อพนักงาน</b> สำหรับดูข้อมูลพนักงานทั้งหมดในระบบ สามารถค้นหา กรอง แก้ไข
          หรือนำเข้าข้อมูลพนักงานได้ รองรับการส่งออก/นำเข้า Excel และแสดงสถานะการจ้างงานของแต่ละคน
        </p>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8 }}>📝 วิธีใช้งาน</h2>
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
        <h2 style={{ marginBottom: 8 }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div style={{ marginBottom: 16 }}>
          <img
            src={employeeList}
            alt="ตารางรายชื่อพนักงาน"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>1. ตารางรายชื่อพนักงาน:</b> แสดงข้อมูลพนักงานทั้งหมด สามารถคลิกเพื่อแก้ไข
            หรือลบแต่ละรายการได้
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={employeeActions}
            alt="การดำเนินการกับพนักงาน"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>2. การดำเนินการ:</b> ใช้ไอคอนดินสอเพื่อแก้ไข หรือถังขยะเพื่อลบข้อมูล
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={employeeBatch}
            alt="นำเข้า/ส่งออก Excel"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
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
        <h2 style={{ marginBottom: 8 }}>🔒 ระบบงาน (RBAC & Province Access)</h2>
        <ul>
          <li>
            ข้อมูลพนักงานจะถูกกรองตาม <b>จังหวัด (provinceId)</b> ของผู้ใช้ที่เข้าสู่ระบบ
          </li>
          <li>
            เฉพาะผู้ที่มีสิทธิ์ <b>ดูข้อมูลพนักงาน</b> หรือ <b>แก้ไขข้อมูลพนักงาน</b>{' '}
            เท่านั้นที่สามารถดู/แก้ไขข้อมูลได้
          </li>
          <li>
            ผู้จัดการ/ผู้บริหารระดับสูง สามารถดูและแก้ไขข้อมูลพนักงานทุกจังหวัด, Manager/Staff
            จะเห็นเฉพาะข้อมูลในจังหวัดของตนเอง
          </li>
          <li>การเพิ่ม/ลบ/แก้ไขข้อมูลจะถูกบันทึกผู้กระทำและเวลา (audit log)</li>
        </ul>
      </>
    ),
  },

  // Branches Management Page
  '/admin/branches': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>🏢 ภาพรวม</h2>
        <p>
          <b>หน้าจัดการสาขา</b> สำหรับดูข้อมูลสาขาทั้งหมดในระบบ เพิ่ม แก้ไข หรือลบสาขาได้อย่างสะดวก
          รองรับการกรองตามจังหวัดและสถานะการใช้งาน
        </p>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8 }}>📝 วิธีใช้งาน</h2>
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
        <h2 style={{ marginBottom: 8 }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div style={{ marginBottom: 16 }}>
          <img
            src={branchList}
            alt="ตารางรายชื่อสาขา"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>1. ตารางรายชื่อสาขา:</b> แสดงข้อมูลสาขาทั้งหมด สามารถแก้ไขหรือลบแต่ละรายการได้
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={branchActions}
            alt="การดำเนินการกับสาขา"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>2. การดำเนินการ:</b> ใช้ไอคอนดินสอเพื่อแก้ไข หรือถังขยะเพื่อลบข้อมูลสาขา
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={branchEditModal}
            alt="ฟอร์มแก้ไข/เพิ่มสาขา"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
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
        <h2 style={{ marginBottom: 8 }}>🔒 ระบบงาน (RBAC & Permissions)</h2>
        <ul>
          <li>
            เฉพาะผู้ที่มีสิทธิ์ <b>จัดการข้อมูลสาขา</b> เท่านั้นที่สามารถเพิ่ม แก้ไข หรือลบสาขาได้
          </li>
          <li>ข้อมูลสาขาจะถูกกรองตามจังหวัดที่ผู้ใช้มีสิทธิ์เข้าถึง</li>
          <li>ทุกการเปลี่ยนแปลงจะถูกบันทึกผู้กระทำและเวลา (audit log)</li>
        </ul>
      </>
    ),
  },

  // Provinces Management Page
  '/admin/provinces': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>🗺️ ภาพรวม</h2>
        <p>
          <b>หน้าจัดการจังหวัด</b> สำหรับดูข้อมูลจังหวัดทั้งหมดในระบบ เพิ่ม แก้ไข
          หรือลบจังหวัดได้อย่างสะดวก รองรับการกรองและค้นหาตามชื่อ รหัส หรือภูมิภาค
        </p>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8 }}>📝 วิธีใช้งาน</h2>
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
          <li>
            กรอกข้อมูลในฟอร์มให้ครบถ้วน เช่น รหัสจังหวัด ชื่อจังหวัด (TH/EN) ภูมิภาค สถานะ ฯลฯ
          </li>
          <li>
            คลิก <b>บันทึก</b> เพื่อยืนยันการเพิ่มหรือแก้ไข
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8 }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div style={{ marginBottom: 16 }}>
          <img
            src={provinceList}
            alt="ตารางรายชื่อจังหวัด"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div style={{ fontSize: 13, color: '#888' }}>
            <b>1. ตารางรายชื่อจังหวัด:</b> แสดงข้อมูลจังหวัดทั้งหมด สามารถแก้ไขหรือลบแต่ละรายการได้
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={provinceEditModal}
            alt="ฟอร์มแก้ไข/เพิ่มจังหวัด"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
              marginBottom: 8,
              objectFit: 'contain',
              display: 'block',
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
        <h2 style={{ marginBottom: 8 }}>🔒 ระบบงาน (RBAC & Permissions)</h2>
        <ul>
          <li>
            เฉพาะผู้ที่มีสิทธิ์ <b>จัดการข้อมูลจังหวัด</b> เท่านั้นที่สามารถเพิ่ม แก้ไข
            หรือลบจังหวัดได้
          </li>
          <li>ข้อมูลจังหวัดจะถูกกรองตามจังหวัดที่ผู้ใช้มีสิทธิ์เข้าถึง</li>
          <li>ทุกการเปลี่ยนแปลงจะถูกบันทึกผู้กระทำและเวลา (audit log)</li>
        </ul>
      </>
    ),
  },

  // Input Price Page (Account)
  '/account/input-price': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>💸 ภาพรวม</h2>
        <p>
          <b>หน้าบันทึกราคาซื้อ (รถและอุปกรณ์)</b>{' '}
          สำหรับบันทึกและตรวจสอบราคาซื้อสินค้า/อุปกรณ์จากใบรับสินค้า
          หลังจากคลังสินค้าตรวจรับสินค้าเรียบร้อยแล้ว พร้อมคำนวณยอดสุทธิและภาษี
          รองรับการอนุมัติหลายขั้นตอน (แก้ไข, ตรวจสอบ, อนุมัติ) และแสดงประวัติการเปลี่ยนแปลง
          ก่อนส่งต่อให้กับแผนกสินเชื่อเพื่อตรวจสอบในขั้นตอนถัดไป
        </p>
        <div style={{ margin: '16px 0' }}>
          <img
            src={inputpriceMain}
            alt="หน้าหลักบันทึกราคาซื้อ"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44,62,80,0.08)',
              marginBottom: 8,
            }}
          />
        </div>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8 }}>📝 ขั้นตอนการใช้งาน</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            <b>ค้นหาใบรับสินค้า:</b> พิมพ์เลขที่ใบรับสินค้าเพื่อค้นหาและเลือกข้อมูล
            <div style={{ margin: '8px 0' }}>
              <img
                src={inputpriceSearch}
                alt="ค้นหาใบรับสินค้า"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>กรอกข้อมูลใบกำกับภาษีและรายละเอียด:</b> ระบุเลขที่/วันที่ใบกำกับภาษี ประเภท ราคา
            เครดิต ฯลฯ
            <div style={{ margin: '8px 0' }}>
              <img
                src={inputpriceHeader}
                alt="กรอกข้อมูลใบกำกับภาษี"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>เพิ่ม/แก้ไขรายการสินค้า:</b> กรอกรายการสินค้า ปรับจำนวน ราคาต่อหน่วย ส่วนลด ฯลฯ
            <div style={{ margin: '8px 0' }}>
              <img
                src={inputpriceItems}
                alt="เพิ่ม/แก้ไขรายการสินค้า"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>ตรวจสอบยอดรวมและภาษี:</b> ระบบคำนวณยอดสุทธิ ส่วนลด หักเงินมัดจำ และภาษีอัตโนมัติ
            <div style={{ margin: '8px 0' }}>
              <img
                src={inputpriceSummary}
                alt="ตรวจสอบยอดรวมและภาษี"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>ดูรายละเอียดสินค้าแต่ละรายการ:</b> คลิกแถวสินค้าเพื่อดูข้อมูลขยาย เช่น เลขที่รับ,
            สาขา, รายละเอียดสินค้า
            <div style={{ margin: '8px 0' }}>
              <img
                src={inputpriceItemDetail}
                alt="รายละเอียดสินค้าแต่ละรายการ"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>ระบุผู้แก้ไข/ตรวจสอบ/อนุมัติ และวันที่:</b>{' '}
            กำหนดผู้รับผิดชอบแต่ละขั้นตอนและวันที่ที่เกี่ยวข้อง
            <div style={{ margin: '8px 0' }}>
              <img
                src={inputpriceApprovers}
                alt="ระบุผู้แก้ไข/ตรวจสอบ/อนุมัติ"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>ดูประวัติการเปลี่ยนแปลงและสถานะ:</b> ตรวจสอบประวัติการแก้ไขและสถานะเอกสาร
            <div style={{ margin: '8px 0' }}>
              <img
                src={inputpriceHistory}
                alt="ประวัติการเปลี่ยนแปลงและสถานะ"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
          <li>
            <b>บันทึก:</b> กดปุ่ม "บันทึก" เพื่อบันทึกข้อมูลหรือส่งต่อขั้นตอนถัดไป
            <div style={{ margin: '8px 0' }}>
              <img
                src={inputpriceSave}
                alt="ปุ่มบันทึก"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </div>
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8 }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div
          style={{
            background: 'transparent',
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
            overflowX: 'auto',
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
        <h2 style={{ marginBottom: 8 }}>🔐 ระบบงาน (RBAC & Permission)</h2>
        <ul>
          <li>
            เฉพาะผู้ที่มีสิทธิ์ <b>จัดการข้อมูลบัญชีรายจ่าย</b> และเข้าถึงข้อมูลระดับจังหวัด
            (province) ได้เท่านั้นที่สามารถบันทึก/แก้ไขข้อมูล
          </li>
          <li>ข้อมูลจังหวัดจะถูกกรองตามจังหวัดที่ผู้ใช้มีสิทธิ์เข้าถึง</li>
          <li>ทุกการเปลี่ยนแปลงจะถูกบันทึกผู้กระทำและเวลา (audit log)</li>
        </ul>
      </>
    ),
  },

  // System Overview Page
  '/about/system-overview': {
    overview: (
      <>
        <h2 style={{ color: '#2d4739', marginBottom: 8 }}>🚀 KBN Platform – System Overview</h2>
        <p>
          <b>KBN</b> is a role-based, permission-driven platform for managing users, branches,
          provinces, and business operations. This document provides a quick understanding of how
          access, roles, and permissions work in the system.
        </p>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ color: '#2d4739', marginBottom: 8 }}>🔑 Key Concepts</h2>
        <ul>
          <li>
            <b>Role-Based Access Control (RBAC):</b> Every user is assigned a <b>role</b> (e.g.,
            User, Manager, Admin, Super Admin, Developer) that determines their default permissions.
          </li>
          <li>
            <b>Permissions:</b> Permissions (e.g., VIEW_SALES, MANAGE_EXPENSE) control access to
            features and data. Roles come with a default set of permissions.
          </li>
          <li>
            <b>Custom Permissions:</b> Admins can grant extra permissions to specific users,
            allowing for exceptions (e.g., an accountant with access to sales data).
          </li>
          <li>
            <b>Province/Branch/Department Access:</b> Data and actions can be limited by province,
            branch, or department. Users only see and manage data for their assigned areas, unless
            their role grants broader access.
          </li>
          <li>
            <b>Super Admin & Developer:</b> These roles have full access to all features and data.
            Nothing is hidden from them.
          </li>
          <li>
            <b>Audit & Security:</b> All changes (e.g., edits, deletions) are logged with user and
            timestamp for accountability.
          </li>
        </ul>
      </>
    ),
    flow: (
      <>
        <h2 style={{ color: '#2d4739', marginBottom: 8 }}>🧭 How Access is Checked</h2>
        <ol>
          <li>
            When you try to access a page or feature, the system checks your <b>role</b> and{' '}
            <b>permissions</b>.
          </li>
          <li>
            If you have the required permission (either from your role or custom permissions), you
            can proceed.
          </li>
          <li>
            If the feature is province/branch/department-limited, the system checks if you have
            access to that area.
          </li>
          <li>
            If you lack access, you'll see an <b>Access Denied</b> message.
          </li>
        </ol>
      </>
    ),
    logic: (
      <>
        <h2 style={{ color: '#2d4739', marginBottom: 8 }}>💡 Practical Examples</h2>
        <ul>
          <li>
            <b>Custom Access:</b> An accountant can be given sales permissions by an admin, even if
            their main role doesn't include it.
          </li>
          <li>
            <b>Province-Limited:</b> A branch manager only sees and manages data for their
            branch/province.
          </li>
          <li>
            <b>Super Admin/Developer:</b> Always have full access, no restrictions.
          </li>
          <li>
            <b>Audit Trail:</b> All important actions are logged for security and traceability.
          </li>
        </ul>
        <div style={{ marginTop: 16, color: '#888', fontSize: 13 }}>
          <b>Need help?</b> Contact your system administrator or support team.
        </div>
      </>
    ),
  },

  // Compose Notification Page
  '/compose-notification': {
    overview: (
      <>
        <h2 style={{ color: '#2d4739', marginBottom: 8 }}>
          🚀 KBN Platform – Compose Notification
        </h2>
        <p>
          <b>Compose Notification</b> is a feature in the KBN platform designed to allow users to
          create and send notifications to other users or groups. This document provides a detailed
          explanation of how to use this feature.
        </p>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ color: '#2d4739', marginBottom: 8 }}>🔑 Key Concepts</h2>
        <ul>
          <li>
            <b>Notification Content:</b> Users can compose notifications with text, images, and
            attachments.
          </li>
          <li>
            <b>Recipient Selection:</b> Users can select specific recipients or a group of users for
            the notification.
          </li>
          <li>
            <b>Send Notification:</b> Users can send the notification to the selected recipients.
          </li>
        </ul>
      </>
    ),
    flow: (
      <>
        <h2 style={{ color: '#2d4739', marginBottom: 8 }}>🧭 How to Use Compose Notification</h2>
        <ol>
          <li>
            <b>Enter Notification Content:</b> Users can type the text of the notification, add
            images, and include attachments.
          </li>
          <li>
            <b>Select Recipients:</b> Users can choose specific recipients or a group of users for
            the notification.
          </li>
          <li>
            <b>Send Notification:</b> Users can click the "Send" button to send the notification to
            the selected recipients.
          </li>
        </ol>
      </>
    ),
    logic: (
      <>
        <h2 style={{ color: '#2d4739', marginBottom: 8 }}>💡 Practical Examples</h2>
        <ul>
          <li>
            <b>Custom Notification:</b> Users can create a notification with text, images, and
            attachments.
          </li>
          <li>
            <b>Recipient Selection:</b> Users can select specific recipients or a group of users for
            the notification.
          </li>
          <li>
            <b>Send Notification:</b> Users can send the notification to the selected recipients.
          </li>
        </ul>
        <div style={{ marginTop: 16, color: '#888', fontSize: 13 }}>
          <b>Need help?</b> Contact your system administrator or support team.
        </div>
      </>
    ),
  },

  // Compose Notification Page - Enhanced with role-specific content
  '/admin/send-notification': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>📢 ภาพรวม - สร้างการแจ้งเตือน</h2>
        <p>
          <b>หน้าสร้างการแจ้งเตือน</b>{' '}
          สำหรับผู้ดูแลระบบและผู้จัดการในการส่งข้อความแจ้งเตือนให้กับผู้ใช้งานในระบบ
          รองรับการกำหนดเป้าหมายตาม Role, จังหวัด, สาขา, แผนก หรือผู้ใช้เฉพาะ
          พร้อมระบบควบคุมสิทธิ์การเข้าถึงตาม RBAC
        </p>
        <div style={{ margin: '16px 0' }}>
          <img
            src={composeNotificationPlaceholder}
            alt="หน้าสร้างการแจ้งเตือน"
            style={{
              width: '100%',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(44,62,80,0.08)',
              marginBottom: 8,
            }}
          />
          <p style={{ fontSize: 12, color: '#666', textAlign: 'center', margin: 0 }}>
            หน้าต่างสร้างการแจ้งเตือนแสดงฟอร์มกรอกข้อมูลและเลือกผู้รับ
          </p>
        </div>
      </>
    ),
    instruction: (
      <>
        <h2 style={{ marginBottom: 8 }}>📝 ขั้นตอนการใช้งาน</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            <b>กำหนดประเภทและความสำคัญ:</b>
            <ul style={{ marginTop: 8 }}>
              <li>
                <b>ประเภทการแจ้งเตือน:</b> เลือกข้อมูล, สำเร็จ, คำเตือน, หรือข้อผิดพลาด
              </li>
              <li>
                <b>ความสำคัญ:</b> ปกติ, สูง, เร่งด่วน, หรือต่ำ
              </li>
              <li>
                <b>ตัวเลือกการส่ง:</b> แจ้งเตือนในแอป หรือ Push Notification
              </li>
            </ul>
          </li>
          <li>
            <b>กรอกเนื้อหาการแจ้งเตือน:</b>
            <ul style={{ marginTop: 8 }}>
              <li>
                <b>หัวข้อ:</b> กรอกหัวข้อการแจ้งเตือน (สูงสุด 100 ตัวอักษร)
              </li>
              <li>
                <b>ข้อความ:</b> กรอกรายละเอียดข้อความ (สูงสุด 500 ตัวอักษร)
              </li>
              <li>
                <b>ลิงก์:</b> เพิ่มลิงก์ที่เกี่ยวข้อง (ไม่บังคับ)
              </li>
            </ul>
          </li>
          <li>
            <b>เลือกผู้รับการแจ้งเตือน:</b>
            <ul style={{ marginTop: 8 }}>
              <li>
                <b>เลือก Role:</b> ส่งถึงผู้ใช้ตาม Role ที่กำหนด
              </li>
              <li>
                <b>ผู้ใช้ระบุ:</b> เลือกผู้ใช้เฉพาะเจาะจง
              </li>
              <li>
                <b>เลือกสาขา:</b> ส่งถึงผู้ใช้ในสาขาที่กำหนด
              </li>
              <li>
                <b>เลือกแผนก:</b> ส่งถึงผู้ใช้ในแผนกที่กำหนด
              </li>
              <li>
                <b>เลือกจังหวัด:</b> ส่งถึงผู้ใช้ในจังหวัดที่กำหนด
              </li>
            </ul>
          </li>
          <li>
            <b>ส่งการแจ้งเตือน:</b> กดปุ่ม "ส่งการแจ้งเตือน" เพื่อส่งให้ผู้รับที่เลือก
          </li>
        </ol>
      </>
    ),
    flow: (
      <>
        <h2 style={{ marginBottom: 8 }}>🔄 ลำดับการทำงาน (Workflow)</h2>
        <div
          style={{
            background: 'transparent',
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
            overflowX: 'auto',
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`
flowchart TD
    A[เข้าสู่หน้าสร้างการแจ้งเตือน] --> B[เลือกประเภทและความสำคัญ]
    B --> C[กรอกหัวข้อและข้อความ]
    C --> D[เลือกตัวเลือกการส่ง]
    D --> E{เลือกผู้รับ}
    E -->|Role| F[เลือก Role ที่ต้องการ]
    E -->|ผู้ใช้| G[เลือกผู้ใช้เฉพาะ]
    E -->|สาขา| H[เลือกสาขา]
    E -->|แผนก| I[เลือกแผนก]
    E -->|จังหวัด| J[เลือกจังหวัด]
    F --> K[ตรวจสอบจำนวนผู้รับ]
    G --> K
    H --> K
    I --> K
    J --> K
    K --> L{ส่งการแจ้งเตือน}
    L -->|สำเร็จ| M[แจ้งผลสำเร็จ]
    L -->|ล้มเหลว| N[แจ้งข้อผิดพลาด]
          `}</pre>
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>
          <ul>
            <li>ระบบจะแสดงจำนวนผู้รับโดยประมาณก่อนส่ง</li>
            <li>สามารถเลือกผู้รับได้หลายรูปแบบพร้อมกัน</li>
            <li>มีการตรวจสอบสิทธิ์การเข้าถึงก่อนส่ง</li>
          </ul>
        </div>
      </>
    ),
    logic: (
      <>
        <h2 style={{ marginBottom: 8 }}>🔐 ระบบควบคุมสิทธิ์ (RBAC) และตรรกะธุรกิจ</h2>

        <h3 style={{ color: '#d35400', marginTop: 16, marginBottom: 8 }}>
          สิทธิ์การเข้าถึงหน้านี้:
        </h3>
        <ul style={{ paddingLeft: 20 }}>
          <li>
            <b>PROVINCE_ADMIN</b> (Level 7): เข้าถึงได้ที่ <code>/admin/send-notification</code> และ{' '}
            <code>/:provinceId/admin/send-notification</code>
          </li>
          <li>
            <b>GENERAL_MANAGER</b> (Level 8): เข้าถึงได้ที่ <code>/admin/send-notification</code>
          </li>
          <li>
            <b>SUPER_ADMIN</b> (Level 9): เข้าถึงได้ที่ <code>/admin/send-notification</code>
          </li>
          <li>
            <b>DEVELOPER</b> (Level 10): เข้าถึงได้ที่ <code>/admin/send-notification</code>
          </li>
          <li>
            <b>PROVINCE_MANAGER</b> (Level 6): เข้าถึงได้ที่{' '}
            <code>/:provinceId/admin/send-notification</code>
          </li>
          <li>
            <b>BRANCH_MANAGER</b> (Level 5): เข้าถึงได้ที่{' '}
            <code>/:provinceId/:branchCode/admin/send-notification</code>
          </li>
        </ul>

        <h3 style={{ color: '#d35400', marginTop: 16, marginBottom: 8 }}>
          ข้อจำกัดการกำหนดเป้าหมาย:
        </h3>
        <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>BRANCH_MANAGER (Level 5):</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>✅ ส่งถึงผู้ใช้ในสาขาเดียวกันเท่านั้น</li>
            <li>✅ กำหนด Role ได้: USER, LEAD</li>
            <li>❌ ไม่สามารถส่งข้ามสาขาหรือจังหวัด</li>
          </ul>
        </div>

        <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>PROVINCE_MANAGER (Level 6):</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>✅ ส่งถึงผู้ใช้ในจังหวัดเดียวกันทั้งหมด</li>
            <li>✅ กำหนด Role ได้: USER, LEAD, BRANCH_MANAGER</li>
            <li>❌ ไม่สามารถส่งข้ามจังหวัด</li>
          </ul>
        </div>

        <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>PROVINCE_ADMIN (Level 7):</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>✅ ส่งถึงผู้ใช้ในจังหวัดที่มีสิทธิ์เข้าถึง</li>
            <li>✅ กำหนด Role ได้: USER ถึง PROVINCE_MANAGER</li>
            <li>
              ✅ อาจมีสิทธิ์หลายจังหวัด (ตาม <code>accessibleProvinceIds</code>)
            </li>
          </ul>
        </div>

        <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
            GENERAL_MANAGER และสูงกว่า (Level 8+):
          </h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>✅ ส่งถึงผู้ใช้ทั้งระบบ</li>
            <li>✅ กำหนด Role ได้ทุกระดับ (ตามลำดับชั้น)</li>
            <li>✅ เข้าถึงข้อมูลทุกจังหวัดและสาขา</li>
          </ul>
        </div>

        <h3 style={{ color: '#d35400', marginTop: 16, marginBottom: 8 }}>ตรรกะการกรองผู้รับ:</h3>
        <div
          style={{
            background: '#e8f5e8',
            padding: 12,
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          <p style={{ margin: '0 0 8px 0' }}>
            <b>การตรวจสอบสิทธิ์:</b>
          </p>
          <code>
            {`// 1. ตรวจสอบ Role ของผู้ส่ง
if (!hasPermission(SEND_NOTIFICATIONS)) return false;

// 2. ตรวจสอบเป้าหมายตามจังหวัด
notification.provinceId = userProfile?.provinceId || values.province;

// 3. กรองผู้รับตามสิทธิ์
const canTargetUser = (targetUser) => {
  // ตรวจสอบ Role Hierarchy
  const senderLevel = ROLE_HIERARCHY[senderRole];
  const targetLevel = ROLE_HIERARCHY[targetUser.role];
  return senderLevel <= targetLevel;
  
  // ตรวจสอบ Province Access
  return hasProvinceAccess(targetUser.province);
};`}
          </code>
        </div>

        <div style={{ marginTop: 16, color: '#e74c3c', fontSize: 13, fontWeight: 'bold' }}>
          ⚠️ หมายเหตุ: การส่งการแจ้งเตือนจะถูกจำกัดด้วยระบบ RBAC
          และการเข้าถึงตามพื้นที่ที่ผู้ใช้มีสิทธิ์
        </div>
      </>
    ),
    // Role-specific content variations
    roleSpecific: {
      SUPER_ADMIN: {
        overview: (
          <>
            <h2 style={{ marginBottom: 8 }}>📢 ภาพรวม - สร้างการแจ้งเตือน (Super Admin)</h2>
            <p>
              <b>หน้าสร้างการแจ้งเตือนสำหรับ Super Admin</b>{' '}
              มีสิทธิ์เต็มในการส่งการแจ้งเตือนให้กับผู้ใช้ทั้งระบบ สามารถกำหนดเป้าหมายได้ทุกระดับ
              และเข้าถึงข้อมูลทุกจังหวัด สาขา และแผนก
            </p>
            <div style={{ background: '#d1ecf1', padding: 12, borderRadius: 8, marginTop: 12 }}>
              <b>🔓 สิทธิ์พิเศษ:</b> ไม่มีข้อจำกัดใดๆ ในการส่งการแจ้งเตือน
            </div>
          </>
        ),
      },
      GENERAL_MANAGER: {
        overview: (
          <>
            <h2 style={{ marginBottom: 8 }}>📢 ภาพรวม - สร้างการแจ้งเตือน (General Manager)</h2>
            <p>
              <b>หน้าสร้างการแจ้งเตือนสำหรับ General Manager</b>{' '}
              สามารถส่งการแจ้งเตือนให้กับผู้ใช้ทั้งระบบ แต่ไม่สามารถกำหนดเป้าหมายเป็น Admin
              ระดับสูงได้
            </p>
          </>
        ),
      },
      PROVINCE_ADMIN: {
        overview: (
          <>
            <h2 style={{ marginBottom: 8 }}>📢 ภาพรวม - สร้างการแจ้งเตือน (Province Admin)</h2>
            <p>
              <b>หน้าสร้างการแจ้งเตือนสำหรับ Province Admin</b>{' '}
              สามารถส่งการแจ้งเตือนให้กับผู้ใช้ในจังหวัดที่มีสิทธิ์เข้าถึง
              สามารถมีสิทธิ์หลายจังหวัดตาม accessibleProvinceIds
            </p>
            <div style={{ background: '#fff3cd', padding: 12, borderRadius: 8, marginTop: 12 }}>
              <b>📍 ข้อจำกัดพื้นที่:</b> จำกัดเฉพาะจังหวัดที่ได้รับสิทธิ์
            </div>
          </>
        ),
      },
      PROVINCE_MANAGER: {
        overview: (
          <>
            <h2 style={{ marginBottom: 8 }}>📢 ภาพรวม - สร้างการแจ้งเตือน (Province Manager)</h2>
            <p>
              <b>หน้าสร้างการแจ้งเตือนสำหรับ Province Manager</b>{' '}
              สามารถส่งการแจ้งเตือนให้กับผู้ใช้ในจังหวัดของตนเองเท่านั้น
            </p>
            <div style={{ background: '#f8d7da', padding: 12, borderRadius: 8, marginTop: 12 }}>
              <b>🏢 ข้อจำกัดพื้นที่:</b> จำกัดเฉพาะจังหวัดเดียวเท่านั้น
            </div>
          </>
        ),
      },
      BRANCH_MANAGER: {
        overview: (
          <>
            <h2 style={{ marginBottom: 8 }}>📢 ภาพรวม - สร้างการแจ้งเตือน (Branch Manager)</h2>
            <p>
              <b>หน้าสร้างการแจ้งเตือนสำหรับ Branch Manager</b>{' '}
              สามารถส่งการแจ้งเตือนให้กับผู้ใช้ในสาขาของตนเองเท่านั้น
            </p>
            <div style={{ background: '#f8d7da', padding: 12, borderRadius: 8, marginTop: 12 }}>
              <b>🏪 ข้อจำกัดพื้นที่:</b> จำกัดเฉพาะสาขาเดียวเท่านั้น
            </div>
          </>
        ),
      },
    },
  },

  // Dynamic province-level route
  '/:provinceId/admin/send-notification': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>📢 สร้างการแจ้งเตือน (ระดับจังหวัด)</h2>
        <p>
          หน้าสร้างการแจ้งเตือนระดับจังหวัด สำหรับ Province Admin และ Province Manager
          ในการส่งข้อความแจ้งเตือนให้กับผู้ใช้งานในจังหวัดของตนเอง
        </p>
        <div style={{ background: '#fff3cd', padding: 12, borderRadius: 8, marginTop: 12 }}>
          <b>📍 การจำกัดพื้นที่:</b> การแจ้งเตือนจะถูกจำกัดเฉพาะผู้ใช้ในจังหวัดเดียวกันเท่านั้น
        </div>
      </>
    ),
    instruction: 'เหมือนกับหน้า /admin/send-notification แต่จำกัดเฉพาะจังหวัดที่ผู้ใช้มีสิทธิ์',
    flow: 'เช่นเดียวกับการสร้างการแจ้งเตือนปกติ แต่ระบบจะกรองผู้รับให้เป็นเฉพาะจังหวัดที่เกี่ยวข้องโดยอัตโนมัติ',
    logic: (
      <>
        <p>ใช้ระบบ RBAC เดียวกัน แต่เพิ่มการตรวจสอบ:</p>
        <div
          style={{
            background: '#e8f5e8',
            padding: 12,
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          <code>
            {`// กรองผู้รับเฉพาะจังหวัดที่เข้าถึงได้
const provinceId = useParams().provinceId;
const canAccess = hasProvinceAccess(provinceId);
if (!canAccess) return <Navigate to="/access-denied" />;

// การแจ้งเตือนจะถูกกำหนด provinceId อัตโนมัติ
notification.provinceId = provinceId;`}
          </code>
        </div>
      </>
    ),
    // Dynamic content based on route parameters
    dynamicContent: (routeParams) => (
      <>
        <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 8, marginTop: 12 }}>
          <b>📍 จังหวัดปัจจุบัน:</b> {routeParams?.provinceId || 'ไม่ระบุ'}
        </div>
      </>
    ),
  },

  // Dynamic branch-level route
  '/:provinceId/:branchCode/admin/send-notification': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>📢 สร้างการแจ้งเตือน (ระดับสาขา)</h2>
        <p>
          หน้าสร้างการแจ้งเตือนระดับสาขา สำหรับ Branch Manager
          ในการส่งข้อความแจ้งเตือนให้กับผู้ใช้งานในสาขาของตนเอง
        </p>
        <div style={{ background: '#f8d7da', padding: 12, borderRadius: 8, marginTop: 12 }}>
          <b>🏢 การจำกัดพื้นที่:</b> การแจ้งเตือนจะถูกจำกัดเฉพาะผู้ใช้ในสาขาเดียวกันเท่านั้น
        </div>
      </>
    ),
    instruction: 'เหมือนกับหน้า /admin/send-notification แต่จำกัดเฉพาะสาขาที่ผู้ใช้มีสิทธิ์',
    flow: 'เช่นเดียวกับการสร้างการแจ้งเตือนปกติ แต่ระบบจะกรองผู้รับให้เป็นเฉพาะสาขาที่เกี่ยวข้องโดยอัตโนมัติ',
    logic: (
      <>
        <p>ใช้ระบบ RBAC เดียวกัน แต่เพิ่มการตรวจสอบ:</p>
        <div
          style={{
            background: '#e8f5e8',
            padding: 12,
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        >
          <code>
            {`// กรองผู้รับเฉพาะสาขาที่เข้าถึงได้
const { provinceId, branchCode } = useParams();
const canAccess = hasBranchAccess(provinceId, branchCode);
if (!canAccess) return <Navigate to="/access-denied" />;

// การแจ้งเตือนจะถูกกำหนด province และ branch อัตโนมัติ
notification.provinceId = provinceId;
notification.targetBranch = branchCode;`}
          </code>
        </div>
      </>
    ),
    // Dynamic content based on route parameters
    dynamicContent: (routeParams) => (
      <>
        <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 8, marginTop: 12 }}>
          <b>📍 ตำแหน่งปัจจุบัน:</b>
          <br />
          จังหวัด: {routeParams?.provinceId || 'ไม่ระบุ'}
          <br />
          สาขา: {routeParams?.branchCode || 'ไม่ระบุ'}
        </div>
      </>
    ),
  },

  // Generic dynamic admin route pattern
  '/:provinceId/admin/*': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>🏛️ หน้าดูแลระบบ (ระดับจังหวัด)</h2>
        <p>
          หน้าดูแลระบบสำหรับจังหวัดเฉพาะ สิทธิ์การเข้าถึงขึ้นอยู่กับ Role และ Province Access
          ของผู้ใช้งาน
        </p>
      </>
    ),
    instruction: 'การใช้งานขึ้นอยู่กับหน้าที่เฉพาะ แต่จะถูกจำกัดขอบเขตตามจังหวัดที่ระบุ',
    flow: 'ระบบจะตรวจสอบสิทธิ์การเข้าถึงจังหวัดก่อนแสดงเนื้อหา',
    logic: 'ใช้ระบบ RBAC ร่วมกับการตรวจสอบสิทธิ์การเข้าถึงจังหวัด',
    dynamicContent: (routeParams) => (
      <>
        <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 8, marginTop: 12 }}>
          <b>📍 จังหวัด:</b> {routeParams?.provinceId || 'ไม่ระบุ'}
        </div>
      </>
    ),
  },

  // Generic dynamic branch admin route pattern
  '/:provinceId/:branchCode/admin/*': {
    overview: (
      <>
        <h2 style={{ marginBottom: 8 }}>🏪 หน้าดูแลระบบ (ระดับสาขา)</h2>
        <p>
          หน้าดูแลระบบสำหรับสาขาเฉพาะ สิทธิ์การเข้าถึงขึ้นอยู่กับ Role และ Branch Access
          ของผู้ใช้งาน
        </p>
      </>
    ),
    instruction: 'การใช้งานขึ้นอยู่กับหน้าที่เฉพาะ แต่จะถูกจำกัดขอบเขตตามสาขาที่ระบุ',
    flow: 'ระบบจะตรวจสอบสิทธิ์การเข้าถึงสาขาก่อนแสดงเนื้อหา',
    logic: 'ใช้ระบบ RBAC ร่วมกับการตรวจสอบสิทธิ์การเข้าถึงสาขา',
    dynamicContent: (routeParams) => (
      <>
        <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 8, marginTop: 12 }}>
          <b>📍 ตำแหน่ง:</b>
          <br />
          จังหวัด: {routeParams?.provinceId || 'ไม่ระบุ'}
          <br />
          สาขา: {routeParams?.branchCode || 'ไม่ระบุ'}
        </div>
      </>
    ),
  },
};

// Export the route matcher utility along with pageDocs
export { routeMatcher };
export default pageDocs;
