import React, { useCallback, useContext, useRef, useState } from 'react';
import { Card, CardFooter, CardHeader, Container, Row } from 'shards-react';

import { List, Avatar, Button, Popconfirm } from 'antd';
import Excels from 'Modules/Utils/Excels';
import { showLog } from 'functions';
import { Slide } from 'react-awesome-reveal';
import { useSelector } from 'react-redux';
import { showSuccess } from 'functions';
import { FirebaseContext } from '../firebase';
import { showWarn } from 'functions';
import { arrayForEach } from 'functions';
import { load } from 'functions';
import { formatExcelToJson } from 'functions';
import { Numb } from 'functions';
import numeral from 'numeral';
import { showWarning } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { progress } from 'functions';
import { checkCollection } from 'firebase/api';
import { showAlert } from 'functions';
import { useHistory } from 'react-router-dom';
import { getDataType } from 'Modules/Utils/Upload/api';

const data = [
  {
    title: 'รับรถและอุปกรณ์',
    description: 'นำเข้าข้อมูล รายการรับรถและอุปกรณ์ จากไฟล์ Excel ของระบบ SKC'
  },
  {
    title: 'รับอะไหล่',
    description: 'นำเข้าข้อมูล รายการรับอะไหล่ จากไฟล์ Excel ของระบบ SKC'
  },
  {
    title: 'รายได้งานบริการ',
    description: 'นำเข้าข้อมูล รายได้งานบริการ จากไฟล์ Excel ของระบบ SKC'
  },
  {
    title: 'รายได้ขายอะไหล่',
    description: 'นำเข้าข้อมูล รายได้ขายอะไหล่ จากไฟล์ Excel ของระบบ SKC'
  },
  {
    title: 'รายการรถและอุปกรณ์',
    description: 'นำเข้าข้อมูล รายการรถและอุปกรณ์ จากไฟล์ Excel ของระบบ SKC'
  },
  {
    title: 'รายการอะไหล่',
    description: 'นำเข้าข้อมูล รายการอะไหล่ จากไฟล์ Excel ของระบบ SKC'
  },
  {
    title: 'การสแกนลายนิ้วมือ',
    description: 'นำเข้าข้อมูล การสแกนลายนิ้วมือ จากไฟล์ Excel'
  }
];

const dataDev = [
  ...data,
  {
    title: 'ข้อมูลอื่นๆ',
    description: 'นำเข้าข้อมูล อื่นๆสำหรับการพัฒนาระบบ'
  }
];
const ImportData = () => {
  const history = useHistory();

  const { api, firestore } = useContext(FirebaseContext);
  const { theme } = useSelector(state => state.global);
  const { user } = useSelector(state => state.auth);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadedData = useRef(null);

  const resetToInitial = () => {
    setDataLoaded(false);
    setVisible(false);
    loadedData.current = null;
  };

  const _onSelect = useCallback(
    item => {
      if (item.title !== 'ข้อมูลอื่นๆ') {
        history.push('/utils/upload-data-from-excel-file', {
          params: { dataType: getDataType(item.title) }
        });
      } else {
        // Manual input.
        setTitle(item.title);
        setVisible(true);
      }
    },
    [history]
  );

  const _onDataLoaded = async dataLoaded => {
    //  showLog('dataLoaded', dataLoaded);
    try {
      let nData = JSON.parse(JSON.stringify(dataLoaded));
      let nRows = [];
      for (var i = 0; i < dataLoaded.rows.length; i++) {
        if (dataLoaded.rows[i].length > 0) {
          nRows.push(dataLoaded.rows[i]);
        }
      }
      nData.rows = nRows;
      let jsonData = await formatExcelToJson(nData, api, user);
      setDataLoaded(true);
      loadedData.current = jsonData;
    } catch (e) {
      showWarn(e);
    }
  };

  const onCancelImportData = async (collection, batchNo, api, handleCancel) => {
    // showLog({ batchNo });
    try {
      load(true, 'กำลังยกเลิก... \nห้ามออกจากหน้านี้ การยกเลิกจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด');
      const dSnap = await checkCollection(collection, [['batchNo', '==', batchNo]]);
      if (dSnap) {
        let dArr = [];
        dSnap.forEach(async doc => {
          dArr.push({ ...doc.data(), _id: doc.id });
        });
        // showLog({ dArr });
        await arrayForEach(dArr, async it => {
          await api.deleteItem(collection, it._id);
        });
      }
      load(false);
      showAlert('สำเร็จ', 'ยกเลิกการนำเข้าข้อมูลเรียบร้อยแล้ว', 'warning', handleCancel);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _onConfirm = useCallback(async () => {
    //  showLog('jsonData', loadedData.current);
    // Upload data.
    try {
      let otherImportRef = firestore.collection('data').doc('account').collection('expenseCategory');
      let mBreak1 = false;
      const batchNo = Date.now();
      const records = loadedData.current.length;
      await arrayForEach(loadedData.current, async (item, i) => {
        if (mBreak1) {
          return;
        }
        item.no_ && delete item.no_;
        // showLog({ i });
        const percent = Numb(((i + 1) * 100) / records);
        progress({
          show: true,
          percent,
          text: `กำลังอัปโหลด ${i + 1} จาก ${numeral(records).format('0,0')} รายการ`,
          subtext: 'ห้ามออกจากหน้านี้ การอัปโหลดจะถูกขัดจังหวะ และข้อมูลจะเกิดการผิดพลาด',
          onCancel: () => {
            mBreak1 = true;
            onCancelImportData('data/account/expenseCategory', batchNo, api, () => resetToInitial());
          }
        });
        const { expenseCategoryId, expenseCategoryName } = item;
        let sItem = {
          expenseCategoryId,
          expenseCategoryName
        };

        const sSnap = await otherImportRef.doc(expenseCategoryId).get();
        if (!sSnap.exists) {
          const saveItem = cleanValuesBeforeSave(
            {
              ...sItem,
              importBy: user.uid,
              importTime: Date.now(),
              batchNo
            },
            true
          );
          await otherImportRef.doc(expenseCategoryId).set(saveItem);
        } else {
          showWarning(`${expenseCategoryId} อัปโหลดก่อนหน้านี้แล้ว!`);
          // Add anomaly
          // await api.addItem(
          //   {
          //     item,
          //     anomaly: {
          //       dataType: 'partList',
          //       type: 'IMPORT_DUPLICATED',
          //       by: user.uid,
          //       time: Date.now(),
          //       batchNo,
          //     },
          //   },
          //   'anomaly/imports/partList'
          // );
        }
      });
      if (mBreak1) {
        progress({ show: false, percent: 0, text: null, subtext: null });
        return;
      }

      progress({ show: false, percent: 0, text: null, subtext: null });
      showSuccess(() => resetToInitial(), `นำเข้าข้อมูล ${title} เรียบร้อยแล้ว`, true);
    } catch (e) {
      showWarn(e);
      progress({ show: false, percent: 0, text: null, subtext: null });
    }
    // resetToInitial();
  }, [api, firestore, title, user.uid]);

  const _onCancel = useCallback(() => {
    resetToInitial();
  }, []);

  return (
    <Container fluid className="main-content-container px-2 py-2">
      <CardHeader className="border-bottom">
        <h6>รายการนำเข้าข้อมูล</h6>
      </CardHeader>
      <List
        itemLayout="horizontal"
        dataSource={user.isDev ? dataDev : data}
        renderItem={item => (
          <List.Item
            className="px-2"
            style={{ backgroundColor: theme.colors.surface }}
            actions={[
              <Button htmlType="button" type="primary" onClick={() => _onSelect(item)}>
                นำเข้า
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={require('../images/importExcel.png')} />}
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />

      {/* <Modal
        title={title}
        // centered
        style={{ left: isMobile ? 10 : 100 }}
        visible={visible}
        onOk={_onConfirm}
        onCancel={() => setVisible(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        width={'70%'}
      > */}
      {visible && (
        <Slide
          triggerOnce
          direction="up"
          duration={500}
          style={{
            position: 'absolute',
            top: 70,
            left: 10,
            right: 10,
            bottom: 10,
            zIndex: 20,
            width: '97%',
            height: '80%',
            backgroundColor: theme.colors.surface
          }}
        >
          <Card small className="mb-4 d-flex">
            {dataLoaded && (
              <CardHeader className="border-bottom">
                <Row form style={{ alignItems: 'center' }}>
                  <Button onClick={_onCancel} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  {!!dataLoaded && (
                    <Popconfirm
                      title="อัปโหลดข้อมูลเข้าสู่ระบบ ?"
                      onConfirm={_onConfirm}
                      onCancel={() => showLog('cancel')}
                      okText="ยืนยัน"
                      cancelText="ยกเลิก"
                    >
                      <Button className="btn-primary mr-3">นำเข้าข้อมูล</Button>
                    </Popconfirm>
                  )}
                </Row>
              </CardHeader>
            )}
            <Excels style={{ flex: 1, padding: 20 }} firstRowIsHeader onDataLoaded={_onDataLoaded} title={title} />
            <CardFooter className="border-top">
              <Row form style={{ alignItems: 'center' }}>
                <Button onClick={_onCancel} className="btn-white mr-3">
                  &larr; กลับ
                </Button>
                {!!dataLoaded && (
                  <Button onClick={_onConfirm} className="btn-primary mr-3">
                    นำเข้าข้อมูล
                  </Button>
                )}
              </Row>
            </CardFooter>
          </Card>
        </Slide>
      )}
      {/* </Modal> */}
    </Container>
    // <Container fluid className="main-content-container px-4 pb-4">
    //   <div className="error">
    //     <div className="error__content">
    //       <img
    //         id="main-logo"
    //         className="d-inline-block align-top mr-1"
    //         style={{
    //           maxWidth: '128px',
    //           size: '122px',
    //           marginBottom: '30px',
    //         }}
    //         src={require('images/logo192.png')}
    //         alt="Kubota Benjapol"
    //       />
    //       <h2>KBN</h2>
    //       <h3>บริษัท คูโบต้าเบญจพล นครราชสีมา จำกัด</h3>
    //       <p>
    //         จำหน่าย รถแทรกเตอร์ รถแมคโคร รถเกี่ยวข้าว รถดำนา รถตัดอ้อย
    //         คูโบต้าใหม่และเก่า
    //       </p>
    //       <Socials medium />
    //     </div>
    //   </div>
    // </Container>
  );
};

export default ImportData;
