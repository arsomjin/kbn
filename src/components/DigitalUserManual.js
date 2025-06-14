import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  Button,
  Typography,
  Steps,
  Card,
  Space,
  Tag,
  Divider,
  Tooltip,
} from 'antd';
import './DigitalUserManual.css';
import {
  QuestionCircleOutlined,
  BookOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  SafetyOutlined,
  FormOutlined,
  HomeOutlined,
  MailOutlined,
  CloseOutlined,
  EyeOutlined,
  EditOutlined,
  SettingOutlined,
  DeleteOutlined,
  HistoryOutlined,
  BarChartOutlined,
  DollarOutlined,
  RocketOutlined,
  TrophyOutlined,
  GlobalOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  CloudServerOutlined,
  SearchOutlined,
  DashboardOutlined,
  CrownOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

/**
 * Digital User Manual Component
 * Shows easy-to-understand help for any screen
 */
const DigitalUserManual = ({
  screenType = 'general',
  visible = false,
  onClose = () => {},
  autoShow = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [manualVisible, setManualVisible] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Handle external visible prop changes
  useEffect(() => {
    if (visible) {
      setManualVisible(true);
    }
  }, [visible]);

  // Auto-show manual for first-time users and detect first-time status
  useEffect(() => {
    const hasSeenManual = localStorage.getItem(`manual-seen-${screenType}`);
    const isFirstTimeUser = !hasSeenManual;

    setIsFirstTime(isFirstTimeUser);

    if (autoShow && isFirstTimeUser) {
      setManualVisible(true);
    }
  }, [screenType, autoShow]);

  const handleClose = () => {
    setManualVisible(false);
    localStorage.setItem(`manual-seen-${screenType}`, 'true');
    setIsFirstTime(false); // Remove first-time status after closing
    onClose();
  };

  // Manual content for different screens
  const getManualContent = () => {
    switch (screenType) {
      case 'signup':
        return {
          title: '📝 วิธีสมัครสมาชิก',
          subtitle: 'ขั้นตอนง่ายๆ ในการเข้าร่วม KBN',
          steps: [
            {
              title: 'เลือกประเภทผู้ใช้',
              description:
                'เลือกว่าคุณเป็นพนักงานใหม่ หรือพนักงานเดิมที่ต้องการเข้าสู่ระบบ',
              icon: <UserOutlined />,
              details: [
                '🟢 พนักงานใหม่: สำหรับคนที่ยังไม่เคยใช้ระบบ KBN',
                '⚫ พนักงานเดิม: สำหรับคนที่เคยใช้ระบบแล้ว',
              ],
            },
            {
              title: 'กรอกอีเมล',
              description: 'ใส่อีเมลที่ใช้งานได้จริง เพื่อรับการยืนยัน',
              icon: <FormOutlined />,
              details: [
                '📧 ใช้อีเมลที่เช็คได้ทุกวัน',
                '✅ ระบบจะส่งลิงก์ยืนยันมาให้',
                '⚠️ ถ้าไม่ได้รับอีเมล ให้เช็คในกล่อง Spam',
              ],
            },
            {
              title: 'กรอกข้อมูลส่วนตัว',
              description: 'ใส่ชื่อ-นามสกุล และรหัสผ่านที่ต้องการใช้',
              icon: <SafetyOutlined />,
              details: [
                '👤 ใส่ชื่อจริงตามบัตรประชาชน',
                '🔐 รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร',
                '💡 จำรหัสผ่านให้ดี เพราะจะใช้เข้าระบบทุกครั้ง',
              ],
            },
            {
              title: 'เลือกสาขาและแผนก',
              description: 'บอกระบบว่าคุณทำงานที่สาขาไหน แผนกอะไร',
              icon: <HomeOutlined />,
              details: [
                '🏢 เลือกจังหวัดที่ทำงาน',
                '🏪 เลือกสาขาที่ทำงาน',
                '👥 เลือกแผนกที่สังกัด (ขาย, บริการ, บัญชี, ฯลฯ)',
              ],
            },
            {
              title: 'รอการอนุมัติ',
              description: 'หัวหน้าจะตรวจสอบและอนุมัติให้เข้าใช้ระบบ',
              icon: <CheckCircleOutlined />,
              details: [
                '⏳ รอประมาณ 1-2 วันทำการ',
                '📱 จะได้รับแจ้งเตือนทางอีเมลเมื่ออนุมัติแล้ว',
                '🎉 พอได้รับการอนุมัติ ก็เข้าใช้ระบบได้เลย!',
              ],
            },
          ],
        };

      case 'login':
        return {
          title: '🔐 วิธีเข้าสู่ระบบ',
          subtitle: 'เข้าใช้งาน KBN อย่างง่ายดาย',
          steps: [
            {
              title: 'ใส่อีเมลและรหัสผ่าน',
              description: 'ใช้ข้อมูลเดียวกับตอนสมัครสมาชิก',
              icon: <FormOutlined />,
              details: [
                '📧 ใส่อีเมลที่ใช้สมัครสมาชิก',
                '🔐 ใส่รหัสผ่านที่ตั้งไว้',
                '👁️ กดปุ่มตาเพื่อดูรหัสผ่านได้',
              ],
            },
            {
              title: 'กดเข้าสู่ระบบ',
              description: 'ระบบจะตรวจสอบและพาเข้าไปในระบบ',
              icon: <CheckCircleOutlined />,
              details: [
                '✅ ถ้าข้อมูลถูกต้อง จะเข้าระบบได้ทันที',
                '❌ ถ้าผิด ระบบจะแจ้งให้แก้ไข',
                '🔄 ลืมรหัสผ่าน? กดลิงก์ "ลืมรหัสผ่าน" ได้เลย',
              ],
            },
          ],
        };

      case 'forgot-password':
        return {
          title: '🔄 วิธีรีเซ็ตรหัสผ่าน',
          subtitle: 'กู้คืนการเข้าใช้งาน KBN',
          steps: [
            {
              title: 'ใส่อีเมลที่ลงทะเบียนไว้',
              description: 'ใส่อีเมลเดียวกับที่ใช้สมัครสมาชิก',
              icon: <MailOutlined />,
              details: [
                '📧 ใส่อีเมลที่เคยใช้สมัครสมาชิก',
                '✅ ตรวจสอบให้แน่ใจว่าสะกดถูกต้อง',
                '📱 เตรียมเช็คอีเมลหลังกดส่ง',
              ],
            },
            {
              title: 'เช็คอีเมลรีเซ็ตรหัสผ่าน',
              description: 'ระบบจะส่งลิงก์รีเซ็ตไปยังอีเมลของคุณ',
              icon: <CheckCircleOutlined />,
              details: [
                '📧 เช็คกล่องขาเข้าในอีเมล',
                '📁 ถ้าไม่เจอ ให้เช็คกล่อง Spam',
                '🔗 กดลิงก์ในอีเมลเพื่อตั้งรหัสผ่านใหม่',
              ],
            },
          ],
        };

      case 'dashboard':
        return {
          title: '🏠 หน้าหลักของระบบ',
          subtitle: 'ศูนย์รวมการทำงานทั้งหมด',
          steps: [
            {
              title: 'เมนูหลัก',
              description: 'เลือกงานที่ต้องการทำจากเมนูด้านซ้าย',
              icon: <BookOutlined />,
              details: [
                '📊 ดูข้อมูลสรุปในหน้าแรก',
                '📋 เลือกเมนูงานที่ต้องการ',
                '🔔 ดูการแจ้งเตือนที่มุมขวาบน',
              ],
            },
            {
              title: 'การแจ้งเตือน',
              description: 'ระบบจะแจ้งเมื่อมีงานที่ต้องดำเนินการ',
              icon: <InfoCircleOutlined />,
              details: [
                '🔔 กระดิ่งสีเหลือง = มีงานรอ',
                '📝 กดดูรายละเอียดได้',
                '✅ ทำงานเสร็จแล้วจะหายไป',
              ],
            },
          ],
        };

      case 'approval-status':
        return {
          title: '⏳ รอการอนุมัติ',
          subtitle: 'ขั้นตอนการรอการอนุมัติเข้าใช้งานระบบ',
          steps: [
            {
              title: 'สถานะปัจจุบัน',
              description: 'คำขอของคุณอยู่ในขั้นตอนการตรวจสอบ',
              icon: <InfoCircleOutlined />,
              details: [
                '📝 ข้อมูลของคุณถูกส่งไปยังผู้อนุมัติแล้ว',
                '👤 ผู้อนุมัติจะตรวจสอบข้อมูลและสิทธิ์การเข้าถึง',
                '⏰ กระบวนการนี้ใช้เวลาประมาณ 1-2 วันทำการ',
              ],
            },
            {
              title: 'ขั้นตอนการอนุมัติ',
              description: 'เข้าใจขั้นตอนที่คำขอของคุณจะผ่าน',
              icon: <CheckCircleOutlined />,
              details: [
                '1️⃣ ตรวจสอบข้อมูลส่วนตัว (ชื่อ, อีเมล, แผนก)',
                '2️⃣ ยืนยันสิทธิ์การเข้าถึงตามตำแหน่งงาน',
                '3️⃣ อนุมัติและเปิดใช้งานบัญชี',
                '4️⃣ ส่งอีเมลแจ้งผลการอนุมัติ',
              ],
            },
            {
              title: 'สิ่งที่ควรทำ',
              description: 'คำแนะนำขณะรอการอนุมัติ',
              icon: <UserOutlined />,
              details: [
                '📧 เช็คอีเมลเป็นประจำ (รวมทั้งกล่อง Spam)',
                '📱 เตรียมพร้อมใช้งานเมื่อได้รับการอนุมัติ',
                '❓ หากรอเกิน 3 วันทำการ ให้ติดต่อ IT Support',
                '🔄 หากถูกปฏิเสธ สามารถแก้ไขข้อมูลและส่งใหม่ได้',
              ],
            },
            {
              title: 'หลังได้รับการอนุมัติ',
              description: 'ขั้นตอนเมื่อคำขอได้รับการอนุมัติแล้ว',
              icon: <CheckCircleOutlined />,
              details: [
                '✅ จะได้รับอีเมลแจ้งการอนุมัติ',
                '🔐 สามารถเข้าสู่ระบบด้วยอีเมลและรหัสผ่านได้ทันที',
                '🏠 จะเข้าสู่หน้าหลักของระบบ',
                '🎉 เริ่มใช้งานระบบ KBN ได้เลย!',
              ],
            },
          ],
        };

      case 'user-approval':
        return {
          title: '👥 การอนุมัติผู้ใช้งาน',
          subtitle: 'คู่มือสำหรับผู้ดูแลระบบในการอนุมัติผู้ใช้ใหม่',
          steps: [
            {
              title: 'ดูรายการคำขออนุมัติ',
              description: 'ตรวจสอบผู้ใช้ที่รอการอนุมัติทั้งหมด',
              icon: <UserOutlined />,
              details: [
                '📋 ดูรายการผู้ใช้ที่รอการอนุมัติ',
                '🔍 ใช้ตัวกรองเพื่อค้นหาผู้ใช้เฉพาะ',
                '📊 ดูสถิติการอนุมัติในแต่ละวัน',
                '⏰ เรียงลำดับตามวันที่ส่งคำขอ',
              ],
            },
            {
              title: 'ตรวจสอบข้อมูลผู้ใช้',
              description: 'ตรวจสอบความถูกต้องของข้อมูลก่อนอนุมัติ',
              icon: <InfoCircleOutlined />,
              details: [
                '👤 ตรวจสอบชื่อ-นามสกุล ให้ตรงกับเอกสาร',
                '📧 ยืนยันอีเมลที่ใช้งานได้จริง',
                '🏢 ตรวจสอบสาขาและแผนกที่ระบุ',
                '📱 ตรวจสอบเบอร์โทรศัพท์ (ถ้ามี)',
                '🆔 ตรวจสอบประเภทผู้ใช้ที่เลือก',
              ],
            },
            {
              title: 'การอนุมัติผู้ใช้',
              description: 'ขั้นตอนการอนุมัติผู้ใช้เข้าสู่ระบบ',
              icon: <CheckCircleOutlined />,
              details: [
                '✅ กดปุ่ม "อนุมัติ" หากข้อมูลถูกต้อง',
                '🎯 เลือกบทบาทและสิทธิ์ที่เหมาะสม',
                '🏢 กำหนดขอบเขตการเข้าถึงข้อมูล',
                '💾 บันทึกการอนุมัติ',
                '📧 ระบบจะส่งอีเมลแจ้งผู้ใช้อัตโนมัติ',
              ],
            },
            {
              title: 'การปฏิเสธคำขอ',
              description: 'วิธีการปฏิเสธคำขอที่ไม่เหมาะสม',
              icon: <CloseOutlined />,
              details: [
                '❌ กดปุ่ม "ปฏิเสธ" หากข้อมูลไม่ถูกต้อง',
                '📝 เลือกเหตุผลการปฏิเสธที่เหมาะสม',
                '💬 เพิ่มข้อความอธิบายเพิ่มเติม (ถ้าจำเป็น)',
                '📧 ระบบจะส่งอีเมลแจ้งเหตุผลให้ผู้ใช้',
                '🔄 ผู้ใช้สามารถส่งคำขอใหม่ได้หลังแก้ไข',
              ],
            },
            {
              title: 'การติดตามและรายงาน',
              description: 'ติดตามสถานะและสร้างรายงาน',
              icon: <BookOutlined />,
              details: [
                // '📊 ดูสถิติการอนุมัติรายวัน/รายเดือน',
                '📈 ติดตามจำนวนผู้ใช้ใหม่',
                '🔍 ค้นหาประวัติการอนุมัติ',
                // '📋 ส่งออกรายงานเป็น Excel',
                '⚠️ ตรวจสอบผู้ใช้ที่รอนานเกินไป',
              ],
            },
          ],
        };

      case 'user-management':
        return {
          title: '👥 การจัดการผู้ใช้งาน',
          subtitle: 'คู่มือสำหรับการจัดการผู้ใช้งานในระบบ',
          steps: [
            {
              title: 'ดูรายการผู้ใช้งาน',
              description: 'ตรวจสอบและจัดการผู้ใช้งานทั้งหมดในระบบ',
              icon: <UserOutlined />,
              details: [
                '👥 ดูรายการผู้ใช้งานทั้งหมดในระบบ',
                '🔍 ค้นหาผู้ใช้งานด้วยชื่อหรืออีเมล',
                '🏢 กรองตามจังหวัด สาขา หรือแผนก',
                '📊 ดูสถิติการใช้งานของแต่ละผู้ใช้',
              ],
            },
            {
              title: 'จัดการข้อมูลผู้ใช้',
              description: 'แก้ไขข้อมูลและสิทธิ์การใช้งาน',
              icon: <EditOutlined />,
              details: [
                '✏️ แก้ไขข้อมูลส่วนตัวของผู้ใช้',
                '🔐 จัดการสิทธิ์การเข้าถึงข้อมูล',
                '🏢 เปลี่ยนสาขาหรือแผนกของผู้ใช้',
                '⚠️ ระงับหรือเปิดใช้งานบัญชีผู้ใช้',
              ],
            },
            {
              title: 'ตรวจสอบกิจกรรม',
              description: 'ติดตามการใช้งานและกิจกรรมของผู้ใช้',
              icon: <HistoryOutlined />,
              details: [
                '📈 ดูประวัติการเข้าใช้งานระบบ',
                '🔍 ตรวจสอบกิจกรรมที่สำคัญ',
                '📊 วิเคราะห์รูปแบบการใช้งาน',
                '🚨 ตรวจสอบการเข้าถึงที่ผิดปกติ',
              ],
            },
            {
              title: 'รายงานและสถิติ',
              description: 'สร้างรายงานเกี่ยวกับผู้ใช้งาน',
              icon: <BarChartOutlined />,
              details: [
                '📋 สร้างรายงานผู้ใช้งานตามช่วงเวลา',
                '📊 วิเคราะห์การกระจายผู้ใช้ตามสาขา',
                '📈 ติดตามการเติบโตของผู้ใช้งาน',
                '💾 ส่งออกข้อมูลเป็นไฟล์ Excel',
              ],
            },
            {
              title: 'การรักษาความปลอดภัย',
              description: 'จัดการความปลอดภัยของระบบ',
              icon: <SafetyCertificateOutlined />,
              details: [
                '🔒 ตั้งค่านโยบายรหัสผ่าน',
                '🛡️ จัดการการเข้าถึงข้อมูลสำคัญ',
                '📱 ควบคุมการเข้าใช้งานจากอุปกรณ์',
                '🔐 ตรวจสอบและอัปเดตสิทธิ์การใช้งาน',
              ],
            },
          ],
        };

      case 'permission-management':
        return {
          title: '🔐 การจัดการสิทธิ์การใช้งาน',
          subtitle: 'คู่มือสำหรับการจัดการสิทธิ์และการเข้าถึงข้อมูล',
          steps: [
            {
              title: 'ทำความเข้าใจระบบสิทธิ์',
              description: 'เรียนรู้โครงสร้างสิทธิ์ในระบบ KBN',
              icon: <BookOutlined />,
              details: [
                '🏢 สิทธิ์แบ่งตามแผนก: ขาย บริการ บัญชี คลังสินค้า',
                '📊 ระดับสิทธิ์: ดู แก้ไข อนุมัติ จัดการ',
                '🌍 การควบคุมตามพื้นที่: จังหวัด สาขา',
                '👥 บทบาทผู้ใช้: พนักงาน หัวหน้า ผู้จัดการ',
              ],
            },
            {
              title: 'ค้นหาและกรองผู้ใช้',
              description: 'ใช้เครื่องมือค้นหาและกรองข้อมูล',
              icon: <SearchOutlined />,
              details: [
                '🔍 ค้นหาด้วยชื่อ อีเมล หรือรหัสพนักงาน',
                '🏢 กรองตามแผนก: ขาย บริการ บัญชี HR',
                '📍 กรองตามจังหวัดและสาขา',
                '👤 กรองตามบทบาทและระดับสิทธิ์',
              ],
            },
            {
              title: 'จัดการสิทธิ์รายบุคคล',
              description: 'แก้ไขสิทธิ์การใช้งานของผู้ใช้แต่ละคน',
              icon: <UserOutlined />,
              details: [
                '✏️ คลิกที่ชื่อผู้ใช้เพื่อแก้ไขสิทธิ์',
                '☑️ เลือกสิทธิ์ตามหมวดหมู่และระดับ',
                '🌍 กำหนดพื้นที่การเข้าถึงข้อมูล',
                '💾 บันทึกการเปลี่ยนแปลงและตรวจสอบ',
              ],
            },
            {
              title: 'ตรวจสอบและอนุมัติ',
              description: 'ตรวจสอบการเปลี่ยนแปลงสิทธิ์',
              icon: <CheckCircleOutlined />,
              details: [
                '👀 ตรวจสอบสิทธิ์ที่เปลี่ยนแปลงอย่างละเอียด',
                '⚠️ ระวังสิทธิ์ที่อาจส่งผลกระทบต่อความปลอดภัย',
                '📝 เพิ่มหมายเหตุเหตุผลในการเปลี่ยนแปลง',
                '✅ อนุมัติการเปลี่ยนแปลงเมื่อแน่ใจแล้ว',
              ],
            },
            {
              title: 'รายงานและติดตาม',
              description: 'ติดตามการใช้สิทธิ์และสร้างรายงาน',
              icon: <BarChartOutlined />,
              details: [
                '📊 ดูรายงานการใช้สิทธิ์ตามแผนก',
                '📈 วิเคราะห์การเข้าถึงข้อมูลสำคัญ',
                '🔍 ตรวจสอบการใช้สิทธิ์ที่ผิดปกติ',
                '📋 สร้างรายงานสำหรับผู้บริหาร',
              ],
            },
          ],
        };

      case 'executive-briefing':
        return {
          title: '👑 การบรรยายสรุปสำหรับผู้บริหาร',
          subtitle: 'ภาพรวมเชิงกลยุทธ์และข้อได้เปรียบในการแข่งขันของระบบ KBN',
          steps: [
            {
              title: 'ภาพรวมเชิงกลยุทธ์',
              description: 'เข้าใจมูลค่าทางธุรกิจและข้อได้เปรียบในการแข่งขัน',
              icon: <TrophyOutlined />,
              details: [
                '🏆 ระบบ KBN ได้รับการยกระดับเป็น "เครื่องมือสร้างข้อได้เปรียบ"',
                '🛡️ ระบบรักษาความปลอดภัยระดับองค์กร 98%',
                '🌍 รองรับการขยายธุรกิจหลายจังหวัดได้ไม่จำกัด',
                '💎 เทคโนโลยี "Complexity Mastery" - ซับซ้อนแต่ใช้งานง่าย',
              ],
            },
            {
              title: 'ข้อได้เปรียบในการแข่งขัน',
              description: 'ความสามารถที่คู่แข่งไม่มี',
              icon: <CrownOutlined />,
              details: [
                '🏗️ สถาปัตยกรรม Multi-Province RBAC ระดับอุตสาहกรรม',
                '🔒 โมเดลความปลอดภัย Clean Slate แบบ Zero-Trust',
                '🧠 ระบบ Business Intelligence แบบเรียลไทม์',
                '⚡ เครื่องมือ Workflow อัตโนมัติที่ชาญฉลาด',
              ],
            },
            {
              title: 'แผนงานการพัฒนา',
              description: 'เส้นทางสู่การเป็นผู้นำตลาด',
              icon: <RocketOutlined />,
              details: [
                '✅ Phase 1: Foundation Excellence - เสร็จสมบูรณ์',
                '🔄 Phase 2: Business Intelligence - กำลังดำเนินการ',
                '🌟 Phase 3: Market Leadership - วางแผนแล้ว',
                '🎯 เป้าหมาย: กำหนดมาตรฐานใหม่ของอุตสาหกรรม',
              ],
            },
            {
              title: 'การวิเคราะห์ผลตอบแทน (ROI)',
              description: 'ประโยชน์ทางธุรกิจที่วัดผลได้',
              icon: <DollarOutlined />,
              details: [
                '⚡ เพิ่มประสิทธิภาพการทำงาน 50%',
                '🛡️ ลดความเสี่ยงด้านความปลอดภัย 85%',
                '🌍 ประหยัดต้นทุนการขยายธุรกิจ 70%',
                '📱 เพิ่มประสิทธิภาพการทำงานบนมือถือ 40%',
              ],
            },
            {
              title: 'การใช้งานระบบบรรยายสรุป',
              description: 'วิธีการใช้งานหน้านี้อย่างมีประสิทธิภาพ',
              icon: <BookOutlined />,
              details: [
                '📊 แท็บ "ภาพรวม": ดูสรุปข้อมูลเชิงกลยุทธ์',
                '🚀 แท็บ "ความสามารถ": รายละเอียดฟีเจอร์ระบบ',
                '🗺️ แท็บ "แผนงาน": เส้นทางการพัฒนาในอนาคต',
                '💰 แท็บ "ROI": การวิเคราะห์ผลตอบแทนการลงทุน',
              ],
            },
          ],
        };

      case 'system-configuration':
        return {
          title: '⚙️ การตั้งค่าระบบ',
          subtitle:
            'การจัดการระบบระดับผู้บริหารสำหรับจังหวัด สาขา และการตั้งค่าเชิงกลยุทธ์',
          steps: [
            {
              title: 'ภาพรวมระบบ',
              description: 'ตรวจสอบสถานะและสุขภาพของระบบ',
              icon: <DashboardOutlined />,
              details: [
                '📊 ดูจำนวนจังหวัดและสาขาทั้งหมด',
                '👥 ตรวจสอบจำนวนผู้ใช้งานที่ใช้งานอยู่',
                '💚 ติดตามสุขภาพระบบแบบเรียลไทม์',
                '📈 วิเคราะห์การเติบโตของระบบ',
              ],
            },
            {
              title: 'การจัดการจังหวัด',
              description: 'เพิ่ม แก้ไข และจัดการจังหวัดในระบบ',
              icon: <GlobalOutlined />,
              details: [
                '➕ เพิ่มจังหวัดใหม่สำหรับการขยายธุรกิจ',
                '✏️ แก้ไขข้อมูลจังหวัดที่มีอยู่',
                '🏷️ กำหนดรหัสและภูมิภาคของจังหวัด',
                '📊 ดูจำนวนสาขาในแต่ละจังหวัด',
              ],
            },
            {
              title: 'การจัดการสาขา',
              description: 'เพิ่ม แก้ไข และจัดการสาขาในแต่ละจังหวัด',
              icon: <BankOutlined />,
              details: [
                '🏢 เพิ่มสาขาใหม่ในจังหวัดที่ต้องการ',
                '📍 กำหนดที่อยู่และข้อมูลติดต่อ',
                '👥 ดูจำนวนผู้ใช้งานในแต่ละสาขา',
                '🔄 เปิด/ปิดการใช้งานสาขาตามต้องการ',
              ],
            },
            {
              title: 'การตั้งค่าความปลอดภัย',
              description: 'จัดการการตั้งค่าความปลอดภัยระดับระบบ',
              icon: <SafetyCertificateOutlined />,
              details: [
                '🔐 ตั้งค่านโยบายรหัสผ่านองค์กร',
                '🛡️ จัดการการเข้าถึงข้อมูลสำคัญ',
                '📱 ควบคุมการเข้าใช้งานจากอุปกรณ์',
                '🔍 ตรวจสอบและติดตามกิจกรรมที่สำคัญ',
              ],
            },
            {
              title: 'การสำรองและกู้คืนข้อมูล',
              description: 'จัดการการสำรองข้อมูลและแผนกู้คืน',
              icon: <CloudServerOutlined />,
              details: [
                '💾 ตั้งค่าการสำรองข้อมูลอัตโนมัติ',
                '🔄 ทดสอบกระบวนการกู้คืนข้อมูล',
                '📊 ตรวจสอบสถานะการสำรองข้อมูล',
                '⚡ วางแผนการกู้คืนในกรณีฉุกเฉิน',
              ],
            },
          ],
        };

      default:
        return {
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
                '💾 กด "บันทึก" เมื่อเสร็จแล้ว',
              ],
            },
          ],
        };
    }
  };

  const manualContent = getManualContent();

  return (
    <>
      {/* Floating Help Button */}
      <Tooltip title='คู่มือการใช้งาน' placement='left'>
        <Button
          type='primary'
          shape='circle'
          icon={<QuestionCircleOutlined />}
          onClick={() => setManualVisible(true)}
          className={`digital-manual-float-button ${isFirstTime ? 'first-time' : ''}`}
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 60,
            height: 60,
            backgroundColor: 'rgba(82, 196, 26, 0.7)',
            borderColor: 'rgba(82, 196, 26, 0.8)',
            color: 'white',
            fontSize: '22px',
            zIndex: 1010,
            boxShadow: '0 4px 20px rgba(82, 196, 26, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)',
            top: 'auto',
            left: 'auto',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(82, 196, 26, 0.95)';
            e.target.style.boxShadow = '0 8px 30px rgba(82, 196, 26, 0.6)';
            e.target.style.transform = 'scale(1.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(82, 196, 26, 0.7)';
            e.target.style.boxShadow = '0 4px 20px rgba(82, 196, 26, 0.3)';
            e.target.style.transform = 'scale(1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        />
      </Tooltip>

      {/* Manual Drawer */}
      <Drawer
        title={
          <Space>
            <BookOutlined style={{ color: '#52c41a' }} />
            <span>{manualContent.title}</span>
          </Space>
        }
        placement='right'
        width={window.innerWidth <= 768 ? '100vw' : 480}
        visible={manualVisible}
        onClose={handleClose}
        className='digital-manual-drawer'
        zIndex={1025}
        extra={
          <Button type='primary' onClick={handleClose}>
            เข้าใจแล้ว
          </Button>
        }
      >
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          {/* Header */}
          <Card
            size='small'
            style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
          >
            <Text type='secondary'>{manualContent.subtitle}</Text>
          </Card>

          {/* Steps */}
          <Steps
            direction='vertical'
            current={currentStep}
            onChange={setCurrentStep}
            size='small'
          >
            {manualContent.steps.map((step, index) => (
              <Step
                key={index}
                title={
                  <Space>
                    {step.icon}
                    <span>{step.title}</span>
                  </Space>
                }
                description={
                  <div style={{ marginTop: 8 }}>
                    <Paragraph style={{ marginBottom: 12 }}>
                      {step.description}
                    </Paragraph>

                    {/* Details */}
                    <Space
                      direction='vertical'
                      size='small'
                      style={{ width: '100%' }}
                    >
                      {step.details.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fafafa',
                            borderRadius: '6px',
                            fontSize: '13px',
                          }}
                        >
                          {detail}
                        </div>
                      ))}
                    </Space>
                  </div>
                }
              />
            ))}
          </Steps>

          <Divider />

          {/* Tips */}
          <Card
            size='small'
            title={
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                <span>เคล็ดลับ</span>
              </Space>
            }
          >
            <Space direction='vertical' size='small'>
              <Text>
                💡 <strong>ติดปัญหา?</strong> กดปุ่มช่วยเหลือ (?) ได้ทุกหน้า
              </Text>
              <Text>
                📞 <strong>ต้องการความช่วยเหลือ?</strong> ติดต่อ IT Support
              </Text>
              <Text>
                🎯 <strong>ใช้งานครั้งแรก?</strong> ลองทำตามขั้นตอนทีละขั้น
              </Text>
            </Space>
          </Card>

          {/* Quick Actions */}
          <Space
            wrap
            style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
          >
            <Tag color='green'>ใช้ง่าย</Tag>
            <Tag color='blue'>ปลอดภัย</Tag>
            <Tag color='orange'>รวดเร็ว</Tag>
          </Space>
        </Space>
      </Drawer>
    </>
  );
};

DigitalUserManual.propTypes = {
  screenType: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  autoShow: PropTypes.bool,
};

export default DigitalUserManual;
