/* eslint jsx-a11y/anchor-is-valid: 0 */

import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Card, CardBody, Badge } from 'shards-react';

import PageTitle from 'components/common/PageTitle';
import { isMobile } from 'react-device-detect';
import { showLog } from 'functions';
import { FirebaseContext } from '../../firebase';
import moment from 'moment';
import { useHistory } from 'react-router';
import { Skeleton, Typography } from 'antd';
import { useSelector } from 'react-redux';
const { Text, Link } = Typography;

const ChangeLogs = ({ collection = 'changeLogs', limit = 50 }) => {
  const { firestore } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const [data, setData] = useState([]);
  const [ready, setReady] = useState(false);

  const addChangeLogs = () => {
    firestore.collection('changeLogs').add({
      time: Date.now(),
      version: '1.4.3',
      changes: [
        // {
        //   detail: 'งานบริการ - แจ้งบริการ / ประเมินราคา',
        //   subDetails: ['บันทึกข้อมูล'],
        //   link: '/service-order',
        // },
        // {
        //   detail: 'งานบริการ - สรุปปิดงาน',
        //   subDetails: ['บันทึกข้อมูล'],
        //   link: '/service-close',
        // },
        // {
        //   detail: 'การตั้งค่า - คลังสินค้า',
        //   subDetails: ['รายการรถและอุปกรณ์'],
        //   link: '/setting-vehicles',
        // },
        // {
        //   detail: 'รายงาน - งานบริการ',
        //   subDetails: ['สรุปประเภท'],
        //   link: '/reports/service-type',
        // },
        // {
        //   detail: 'รายงาน - งานบริการ',
        //   subDetails: ['สรุปงาน'],
        //   link: '/reports/service-works',
        // },
        // {
        //   detail: 'ปรับเปลี่ยนแก้ไขหมวดรายจ่าย',
        //   subDetails: [
        //     'ลดการซ้ำซ้อนเนื่องจากผู้ใช้งานสามารถเพิ่มเองได้',
        //     'ยกเลิกการ เพิ่ม/ลบ/แก้ไข หมวดรายจ่ายชั่วคราว',
        //     'ปรับปรุงและตรวจสอบแก้ไขในส่วนต่างๆในระบบที่ได้รับผลกระทบจากการเปลี่ยนแปลง เช่น รายงานต่างๆ',
        //   ],
        //   link: '/setting-expense-category',
        // },
        // {
        //   detail: 'ปรับเปลี่ยนแก้ไขสูตรการคำนวณรายงานสรุปส่งเงินประจำวัน',
        //   subDetails: ['แก้ไขสูตรการคำนวณรายงานสรุปส่งเงินประจำวัน'],
        //   link: '/reports/daily-money-summary',
        // },
        // {
        //   detail:
        //     'เพิ่มบรรทัดแสดงยอดรวมในข้อมูล export excel ของรายงานสรุปรายจ่าย',
        //   subDetails: ['เพิ่มบรรทัดด้านล่าง แสดงยอดรวมในข้อมูลในตาราง excel'],
        //   link: '/reports/expenses-summary',
        // },
        // {
        //   detail:
        //     'ปรับปรุงรายงานการลางาน ทำให้สามารถเลือกช่วงวันที่และดูพร้อมกันทุกสาขาได้',
        //   subDetails: [
        //     'เปลี่ยนจากเลือกดูเป็นวัน เป็นเลือกช่วงเวลาเริ่มต้น-สิ้นสุด',
        //     'เพิ่มให้เลือกดูทุกสาขาได้',
        //     'แสดงรายการของ พนง. ที่ลางานตรงกับช่วงวันที่เลืือก',
        //   ],
        //   link: '/reports/hr/leaving',
        // },
        // {
        //   detail: 'แก้ไขให้ผู้ใช้งานที่ลาออกแล้ว ไม่สามารถใช้งานระบบได้',
        //   subDetails: [
        //     'Log out ผู้ใช้งานที่ลาออก โดยระบบจะมีการตรวจสอบอย่างสม่ำเสมอ',
        //     'ไม่สามารถ Log in เข้าระบบได้ โดยจะตรวจสอบจาก email, ชื่อ, นามสกุล ผู้ใช้งาน กับข้อมูลพนักงาน',
        //   ],
        //   link: '/users',
        // },
        {
          detail: 'บัญชี - รายรับ',
          subDetails: ['เพิ่มงาน รับเงิน - สินเชื่อส่วนบุคล'],
          link: '/account/income-personal-loan'
        },
        {
          detail: 'รายงาน - บัญชี - รายรับ',
          subDetails: ['เพิ่มรายงาน รับเงิน - สินเชื่อส่วนบุคล'],
          link: '/reports/account/income-personal-loan'
        }
        // {
        //   detail: 'รายงาน - บัญชี - รายรับ',
        //   subDetails: [
        //     'เพิ่มฟังก์ชั่น export ข้อมูล รายงานสรุปส่งเงินประจำวัน',
        //     'เพิ่มฟังก์ชั่น export ข้อมูล รายงานเงินฝากธนาคาร',
        //     'เพิ่มฟังก์ชั่น export ข้อมูล รายงานรายรับขายอะไหล่รวม',
        //     'เพิ่มฟังก์ชั่น export ข้อมูล รายงานรายรับอื่นๆ',
        //     'เพิ่มฟังก์ชั่น export ข้อมูล รายงานรายรับแทรกเตอร์ใหม่',
        //   ],
        //   link: '/reports/income-summary',
        // },
        // {
        //   detail: 'รายงาน - บัญชี - รายจ่าย',
        //   subDetails: ['เพิ่มฟังก์ชั่น export ข้อมูล รายงานสรุปรายจ่าย'],
        //   link: '/reports/expense-summary',
        // },

        // {
        //   detail: 'เพิ่มรายละเอียด หน้างานขาย',
        //   subDetails: ['เพิ่มช่อง วันที่นัดทำสัญญาเช่าซื้อ SKL'],
        //   link: '/sale-machines',
        // },
        // {
        //   detail: 'กำหนดสิทธิ์ การเข้าถึงรายงาน',
        //   subDetails: [
        //     'กำหนดสิทธิ์การเข้าถึงรายงานตามสาขา ยกเว้นสำนักงานใหญ่ สามารถเข้าถึงได้ทุกสาขา',
        //   ],
        //   link: '/sale-machines',
        // },
        // {
        //   detail: 'เพิ่มรายละเอียดในหน้าการจ่ายสินค้า (คลังสินค้า)',
        //   subDetails: [
        //     'เพิ่มรายละเอียด รายการตีเทิร์น, ของแถม ในหน้าการจ่ายสินค้าจากการขายสินค้า',
        //   ],
        //   link: '/warehouse/export-by-sale',
        // },
        // {
        //   detail: 'คลังสินค้า - อะไหล่ - การรับสินค้าจากการซื้อสินค้า',
        //   subDetails: ['แก้ไขตามรายการที่ได้รับแจ้งเมื่อวันที่ 22/12/2021'],
        //   link: '/wherehouse/import-parts',
        // },
        // {
        //   detail: 'เปลี่ยนแปลงการอัปโหลดไฟล์ข้อมูลสแกนลายนิ้วมือเข้างาน',
        //   subDetails: [
        //     'ปรับเปลี่ยนให้อัปโหลดไฟล์ที่มีข้อมูลรายชื่อซ้ำกันได้ในแต่ละวันที่สแกนลายนิ้วมือ(กรณีที่มีหลายไฟล์) โดยจะมีการบันทึก Log ในการอัปโหลดไว้สำหรับอ้างอิงทุกครั้ง',
        //   ],
        //   link: '/hr/attendance',
        // },
        // {
        //   detail: 'ส่งงานจากการประชุม วันที่ 31 มกราคม 2567',
        //   subDetails: [
        //     'แก้ไขรายงานสรุปรายจ่าย ยังไม่มีข้อมูลที่สาขาอื่นจ่ายให้',
        //     'แก้ไขรายงานสรุปรายจ่าย ข้อมูลบางส่วนยังมาไม่ครบ',
        //     'อัปเดตรายงานสรุปรายจ่าย แบ่งหมวด เงินสด/เงินโอน/สาขาอื่นจ่ายให้',
        //     'แก้ไขรายงานสรุปรายรับ ไม่แสดงรายการ',
        //     'แก้ไขรายงานเงินฝากธนาคาร ไม่แสดงรายการ',
        //     'แก้ไขรายงานรายรับขายอะไหล่รวม ไม่แสดงรายการ',
        //   ],
        //   link: '/reports/expense-summary',
        // },
        // {
        //   detail: 'ปรับปรุงเพิ่มเติมรายละเอียด',
        //   subDetails: ['งานขาย', 'งานรับจอง'],
        //   link: '/sale-vehicles',
        // },
      ]
    });
  };

  useEffect(() => {
    // addChangeLogs();
    const handleAdd = snapshot => {
      if (snapshot.empty) {
        //  showLog('No document');
        setReady(true);
        return;
      }
      // Accumulate
      let arr = [];
      snapshot.forEach(doc => {
        let item = doc.data();
        item._key = doc.id;
        arr.push(item);
      });
      //  showLog({ arr });
      setData(arr);
      setReady(true);
    };

    const query = firestore.collection(collection).orderBy('time', 'desc').limit(limit);

    query.get().then(handleAdd, err => showLog(err));
    // unsubscribe = query.onSnapshot(handleAdd, (err) => showLog(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, firestore, limit]);

  const history = useHistory();

  const _renderDetail = (item, i) => {
    const _onClick = (lnk, grant) => {
      if (grant && !(user && user.group && grant.includes(user.group)) && !user.isDev) {
        //  showLog('Permission not granted!');
        return;
      }
      history.push(lnk);
    };
    return (
      <div key={i} className="m-2 mb-4">
        <div className="d-inline-flex ">
          <h5 className="card-title mr-2">
            เวอร์ชั่น <span className="text-primary">{item.version}</span>
          </h5>
          <Text disabled style={{ fontSize: 12 }}>
            {moment(item.time).fromNow()}
          </Text>
        </div>
        {item.changes.map((ch, n) => (
          <div className="d-flex flex-column " key={n}>
            <Link className="ml-2" strong onClick={() => _onClick(ch.link, ch.grant)}>
              {`${n + 1}. ${ch.detail}`}
            </Link>
            {ch.subDetails &&
              ch.subDetails.map((sd, x) => (
                <Text key={x} className="ml-4">
                  {`${n + 1}.${x + 1} ${sd}`}
                </Text>
              ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Container fluid className="main-content-container px-4">
      <Row noGutters className="page-header py-4">
        <PageTitle sm="4" title="บันทึการเปลี่ยนแปลง" subtitle="Change Logs" className="text-sm-left" />
      </Row>
      <Row>
        <Card small className="card-post card-post--aside card-post--1 d-flex mx-2" style={{ height: '72vh' }}>
          {!isMobile && (
            <div
              className="card-post__image"
              style={{
                backgroundImage: `url(${require('../../images/office2.jpg')})`
              }}
            >
              <Badge pill className={`card-post__category bg-info`}>
                Chang logs
              </Badge>
              <div className="card-post__author d-flex">
                <a
                  href="#"
                  className="card-post__author-avatar card-post__author-avatar--small"
                  style={{
                    backgroundImage: `url('${require('../../images/logo192.png')}')`
                  }}
                >
                  Written by Anna Ken
                </a>
              </div>
            </div>
          )}
          <CardBody style={{ overflowY: 'scroll', width: isMobile ? '100vw' : '65vw' }}>
            {!ready
              ? Array.from(new Array(3), (_, i) => <Skeleton key={i} />)
              : data.map((it, i) => _renderDetail(it, i))}
          </CardBody>
        </Card>
      </Row>
    </Container>
  );
};

export default ChangeLogs;
