import React from 'react';

/**
 * Visual diagram for the Register Page (EN/TH labels)
 * Responsive SVG with highlights for key UI elements
 */
const RegisterPageFlow: React.FC = () => (
  <svg viewBox='0 0 800 1100' width='100%' height='auto' style={{ maxWidth: 600, display: 'block', margin: '0 auto' }}>
    {/* Background card */}
    <rect x='80' y='40' width='640' height='1000' rx='24' fill='#fff' stroke='#bbb' strokeWidth='2' />
    {/* Title */}
    <text x='400' y='90' textAnchor='middle' fontSize='36' fontWeight='bold' fill='#2d4739'>
      สร้างบัญชีใหม่ / Register
    </text>
    {/* User type selector */}
    <rect x='180' y='120' width='440' height='44' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <rect x='180' y='120' width='220' height='44' rx='8' fill='#e6f4ea' stroke='#2d4739' />
    <text x='290' y='148' textAnchor='middle' fontSize='21' fill='#2d4739'>
      พนักงาน / Employee
    </text>
    <text x='510' y='148' textAnchor='middle' fontSize='21' fill='#888'>
      ผู้เยี่ยมชม / Visitor
    </text>
    {/* Email */}
    <rect x='180' y='180' width='440' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <text x='190' y='203' fontSize='18' fill='#888'>
      อีเมล / Email
    </text>
    {/* Name */}
    <rect x='180' y='230' width='210' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <rect x='410' y='230' width='210' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <text x='190' y='253' fontSize='18' fill='#888'>
      ชื่อ / First Name
    </text>
    <text x='420' y='253' fontSize='18' fill='#888'>
      นามสกุล / Last Name
    </text>
    {/* Password */}
    <rect x='180' y='280' width='210' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <rect x='410' y='280' width='210' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <text x='190' y='303' fontSize='18' fill='#888'>
      รหัสผ่าน / Password
    </text>
    <text x='420' y='303' fontSize='18' fill='#888'>
      ยืนยันรหัสผ่าน / Confirm
    </text>
    {/* Province */}
    <rect x='180' y='330' width='440' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <text x='190' y='353' fontSize='18' fill='#888'>
      จังหวัด / Province
    </text>
    {/* Branch & Department */}
    <rect x='180' y='380' width='210' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <rect x='410' y='380' width='210' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <text x='190' y='403' fontSize='18' fill='#888'>
      สาขา / Branch
    </text>
    <text x='420' y='403' fontSize='18' fill='#888'>
      แผนก / Department
    </text>
    {/* Employee ID */}
    <rect x='180' y='430' width='440' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <text x='190' y='453' fontSize='18' fill='#888'>
      รหัสพนักงาน / Employee ID
    </text>
    {/* Visitor fields (phone/purpose) */}
    <rect x='180' y='480' width='440' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <text x='190' y='503' fontSize='18' fill='#888'>
      เบอร์โทร / Phone (Visitor)
    </text>
    <rect x='180' y='530' width='440' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <text x='190' y='553' fontSize='18' fill='#888'>
      วัตถุประสงค์ / Purpose (Visitor)
    </text>
    {/* Register button */}
    <rect x='180' y='590' width='440' height='44' rx='8' fill='#2d4739' />
    <text x='400' y='618' textAnchor='middle' fontSize='22' fill='#fff' fontWeight='bold'>
      ลงทะเบียน / Register
    </text>
    {/* Divider */}
    <line x1='180' y1='650' x2='620' y2='650' stroke='#ddd' strokeWidth='2' />
    <text x='400' y='645' textAnchor='middle' fontSize='17' fill='#888'>
      หรือ / or
    </text>
    {/* Google login */}
    <rect x='180' y='670' width='440' height='44' rx='8' fill='#fff' stroke='#bbb' />
    <text x='400' y='698' textAnchor='middle' fontSize='20' fill='#333'>
      เข้าสู่ระบบด้วย Google / Login with Google
    </text>
    {/* Login link */}
    <text x='400' y='750' textAnchor='middle' fontSize='18' fill='#1a73e8' style={{ cursor: 'pointer' }}>
      มีบัญชีอยู่แล้ว? เข้าสู่ระบบ / Already have an account? Login
    </text>
    {/* Annotations (arrows/labels) */}
    <g stroke='#2d4739' strokeWidth='2' markerEnd='url(#arrow)'>
      <line x1='180' y1='120' x2='120' y2='120' />
      <line x1='180' y1='180' x2='120' y2='180' />
      <line x1='180' y1='230' x2='120' y2='240' />
      <line x1='180' y1='280' x2='120' y2='300' />
      <line x1='180' y1='330' x2='120' y2='360' />
      <line x1='180' y1='380' x2='120' y2='420' />
      <line x1='180' y1='430' x2='120' y2='480' />
      <line x1='180' y1='480' x2='120' y2='540' />
      <line x1='180' y1='590' x2='120' y2='600' />
      <line x1='180' y1='670' x2='120' y2='680' />
      <line x1='400' y1='750' x2='400' y2='800' />
    </g>
    <defs>
      <marker id='arrow' markerWidth='8' markerHeight='8' refX='6' refY='4' orient='auto' markerUnits='strokeWidth'>
        <path d='M2,2 L6,4 L2,6' fill='none' stroke='#2d4739' strokeWidth='2' />
      </marker>
    </defs>
    {/* Annotation labels */}
    <text x='60' y='125' fontSize='28' fill='#2d4739'>
      1. ประเภทผู้ใช้
    </text>
    <text x='60' y='185' fontSize='28' fill='#2d4739'>
      2. อีเมล
    </text>
    <text x='60' y='285' fontSize='28' fill='#2d4739'>
      3. ชื่อ/นามสกุล
    </text>
    <text x='60' y='305' fontSize='28' fill='#2d4739'>
      4. รหัสผ่าน
    </text>
    <text x='60' y='365' fontSize='28' fill='#2d4739'>
      5. จังหวัด
    </text>
    <text x='60' y='425' fontSize='28' fill='#2d4739'>
      6. สาขา/แผนก
    </text>
    <text x='60' y='485' fontSize='28' fill='#2d4739'>
      7. รหัสพนักงาน
    </text>
    <text x='60' y='545' fontSize='28' fill='#2d4739'>
      8. เบอร์/วัตถุประสงค์ (Visitor)
    </text>
    <text x='60' y='605' fontSize='28' fill='#2d4739'>
      9. ลงทะเบียน
    </text>
    <text x='60' y='685' fontSize='28' fill='#2d4739'>
      10. Google Login
    </text>
    <text x='410' y='820' fontSize='28' fill='#2d4739'>
      11. ลิงก์เข้าสู่ระบบ
    </text>
  </svg>
);

export default RegisterPageFlow;
