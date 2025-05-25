import React from 'react';

/**
 * Visual diagram for the Login Page (EN/TH labels)
 * Responsive SVG with highlights for key UI elements
 */
const LoginPageFlow: React.FC = () => (
  <svg viewBox='0 0 800 600' width='100%' height='auto' style={{ maxWidth: 600, display: 'block', margin: '0 auto' }}>
    {/* Background card */}
    <rect x='150' y='80' width='500' height='400' rx='24' fill='#fff' stroke='#bbb' strokeWidth='2' />
    {/* Logo */}
    <circle cx='180' cy='120' r='32' fill='#eee' stroke='#aaa' strokeWidth='2' />
    <text x='180' y='125' textAnchor='middle' fontSize='16' fill='#333'>
      Logo
    </text>
    <rect x='250' y='120' width='300' height='32' fill='none' />
    <text x='400' y='142' textAnchor='middle' fontSize='22' fontWeight='bold' fill='#222'>
      KBN
    </text>
    {/* Email input */}
    <rect x='250' y='180' width='300' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <text x='260' y='203' fontSize='14' fill='#888'>
      อีเมล / Email
    </text>
    {/* Password input */}
    <rect x='250' y='230' width='300' height='36' rx='8' fill='#f6f6f6' stroke='#bbb' />
    <text x='260' y='253' fontSize='14' fill='#888'>
      รหัสผ่าน / Password
    </text>
    {/* Forgot password */}
    <text x='250' y='275' fontSize='13' fill='#1a73e8' style={{ cursor: 'pointer' }}>
      ลืมรหัสผ่าน? / Forgot?
    </text>
    {/* Login button */}
    <rect x='250' y='295' width='300' height='40' rx='8' fill='#2d4739' />
    <text x='400' y='320' textAnchor='middle' fontSize='16' fill='#fff' fontWeight='bold'>
      เข้าสู่ระบบ / Login
    </text>
    {/* Divider */}
    <line x1='250' y1='350' x2='550' y2='350' stroke='#ddd' strokeWidth='2' />
    <text x='400' y='345' textAnchor='middle' fontSize='13' fill='#888'>
      หรือ / or
    </text>
    {/* Google login */}
    <rect x='250' y='365' width='300' height='40' rx='8' fill='#fff' stroke='#bbb' />
    <text x='400' y='390' textAnchor='middle' fontSize='15' fill='#333'>
      เข้าสู่ระบบด้วย Google / Login with Google
    </text>
    {/* Register link */}
    <text x='400' y='430' textAnchor='middle' fontSize='13' fill='#1a73e8' style={{ cursor: 'pointer' }}>
      ยังไม่มีบัญชี? ลงทะเบียน / Register
    </text>
    {/* Floating help button */}
    <g>
      <circle cx='740' cy='540' r='28' fill='#f5f7fa' stroke='#2d4739' strokeWidth='2' />
      <text x='740' y='547' textAnchor='middle' fontSize='22' fill='#2d4739'>
        ?
      </text>
      <text x='740' y='575' textAnchor='middle' fontSize='12' fill='#2d4739'>
        คู่มือ / Help
      </text>
    </g>
    {/* Annotations (arrows/labels) */}
    <g stroke='#2d4739' strokeWidth='2' markerEnd='url(#arrow)'>
      <line x1='250' y1='180' x2='200' y2='160' />
      <line x1='250' y1='230' x2='200' y2='210' />
      <line x1='250' y1='295' x2='200' y2='270' />
      <line x1='740' y1='540' x2='700' y2='500' />
    </g>
    <defs>
      <marker id='arrow' markerWidth='8' markerHeight='8' refX='6' refY='4' orient='auto' markerUnits='strokeWidth'>
        <path d='M2,2 L6,4 L2,6' fill='none' stroke='#2d4739' strokeWidth='2' />
      </marker>
    </defs>
    {/* Annotation labels */}
    <text x='160' y='150' fontSize='28' fill='#2d4739'>
      1. อีเมล / Email
    </text>
    <text x='160' y='200' fontSize='28' fill='#2d4739'>
      2. รหัสผ่าน / Password
    </text>
    <text x='160' y='260' fontSize='28' fill='#2d4739'>
      3. เข้าสู่ระบบ / Login
    </text>
    <text x='660' y='490' fontSize='28' fill='#2d4739'>
      คู่มือ / Help
    </text>
  </svg>
);

export default LoginPageFlow;
