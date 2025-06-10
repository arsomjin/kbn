import React, { useCallback, useContext, useRef, useState } from 'react';
import { Card, CardFooter, CardHeader, Container, Row } from 'shards-react';
import moment from 'moment';
import { List, Avatar, Button, Popconfirm } from 'antd';
import Excels from 'Modules/Utils/Excels';
import { showLog } from 'functions';
import { Slide } from 'react-awesome-reveal';
import { useSelector } from 'react-redux';
import { showSuccess } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { FieldMapping } from 'data/fields-mapping';
import { arrayForEach } from 'functions';
import { showWarn } from 'functions';
import { showAlert } from 'functions';
import { addErrorLogs } from 'firebase/api';

const data = [
  {
    title: 'รับรถและอุปกรณ์',
    description: 'นำเข้าข้อมูล รายการรับรถและอุปกรณ์ จากไฟล์ Excel ของระบบ SKC'
  },
  {
    title: 'รับอะไหล่',
    description: 'นำเข้าข้อมูล รายการรับอะไหล่ จากไฟล์ Excel ของระบบ SKC'
  }
];

const StockImport = () => {
  const { theme } = useSelector(state => state.global);
  const { user } = useSelector(state => state.auth);
  const { users } = useSelector(state => state.data);
  const { api, firestore } = useContext(FirebaseContext);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadedData = useRef(null);
  const loadedJson = useRef(null);

  const resetToInitial = () => {
    setDataLoaded(false);
    setVisible(false);
    loadedData.current = null;
  };

  const _onSelect = useCallback(item => {
    setTitle(item.title);
    setVisible(true);
  }, []);

  const formatToJson = useCallback(async dat => {
    const result = [];
    for (var i = 0; i < dat.rows.length; i++) {
      if (dat.rows[i].length === 0) {
        return;
      }
      let it = {};
      for (var n = 0; n < dat.rows[i].length; n++) {
        let val = dat.rows[i][n] || '';
        let excelFieldName = dat.cols[n + 1].name.trim();
        // Map excel header to field name.
        let fieldName = FieldMapping[excelFieldName];
        if (fieldName) {
          // showLog('last4', fieldName.substr(-4));
          let isDate = fieldName.substr(-4) === 'Date';
          it[fieldName] = isDate ? moment(val, 'DD/MM/YY').format('YYYY-MM-DD') : val;
        } else {
          it[excelFieldName] = val;
        }
      }
      it.billNoSKC = `${it.storeLocationCode.substr(0, 2)}${it.billNoSKC}`;
      result.push(it);
    }
    //  showLog('result', result);
    return result;
  }, []);

  const _checkIsNotDuplicated = (data, dataType) =>
    new Promise(async (r, j) => {
      try {
        let dataRef;
        switch (dataType) {
          case 'vehicles':
            dataRef = firestore
              .collection('stockImportVehicles')
              .where('docNo', '==', data.docNo)
              .where('docDate', '==', data.docDate)
              .where('billNoSKC', '==', data.billNoSKC)
              .where('branchCode', '==', data.branchCode)
              .where('userName', '==', data.userName)
              .where('vehicleNo', '==', data.vehicleNo)
              .where('peripheralNo', '==', data.peripheralNo);
            break;
          case 'parts':
            dataRef = firestore
              .collection('stockImportParts')
              .where('docNo', '==', data.docNo)
              .where('docDate', '==', data.docDate)
              .where('billNoSKC', '==', data.billNoSKC)
              .where('branchCode', '==', data.branchCode)
              .where('userName', '==', data.userName)
              .where('storePoint', '==', data.storePoint);
            break;

          default:
            break;
        }
        const cSnap = await dataRef.get();
        if (!cSnap.empty) {
          cSnap.forEach(doc => {
            r({ result: false, duplicateData: doc.data() });
          });
        } else {
          r({ result: true });
        }
      } catch (e) {
        showWarn(e);
        r(false);
      }
    });

  const _checkImportData = (excelArr, jsonArr, dataType) =>
    new Promise(async (r, j) => {
      try {
        // Check data type and length.
        let isCorrected = !!excelArr && excelArr?.rows && excelArr.cols;
        if (!isCorrected) {
          r({ result: false, info: 'ไม่มีข้อมูล หรือ ข้อมูลไม่ถูกต้อง' });
        }
        isCorrected =
          !!jsonArr && Array.isArray(jsonArr) && Array.isArray(excelArr.rows) && Array.isArray(excelArr.cols);
        if (!isCorrected) {
          r({ result: false, info: 'ไม่มีข้อมูล หรือ ข้อมูลไม่ถูกต้อง' });
        }
        isCorrected = jsonArr.length > 0 && excelArr.rows.length > 0 && excelArr.cols.length > 0;
        if (!isCorrected) {
          r({ result: false, info: 'ไม่มีข้อมูล หรือ ข้อมูลไม่ถูกต้อง' });
        }
        // Check correctness in excel data.
        //  - Rows 11st starts with ['NI', 'NV'] for vehicles, ['NS'] for parts.
        let docType = excelArr.rows[0][11].substr(0, 2);
        switch (dataType) {
          case 'vehicles':
            isCorrected = ['NI', 'NV'].includes(docType);
            break;
          case 'parts':
            isCorrected = ['NS'].includes(docType);
            break;
          default:
            break;
        }
        // Check duplication
        //  - Random check fields [docNo, docDate, billNoSKC, branchCode, userName] in json file.
        let rd1 = Math.floor(Math.random() * jsonArr.length);
        const isNotDuplicated = await _checkIsNotDuplicated(jsonArr[rd1], dataType);
        //  showLog({ isCorrected, isNotDuplicated });
        if (!isNotDuplicated.result) {
          r({
            result: false,
            info: `ไฟล์นี้ได้อัปโหลดแล้ว เมื่อวันที่ ${moment(isNotDuplicated.duplicateData.importTime).format(
              'DD/MM/YY'
            )} เวลา ${moment(isNotDuplicated.duplicateData.importTime).format(
              'hh:mm'
            )} โดย ${users[isNotDuplicated.duplicateData.importBy].displayName}`
          });
        }
        r({ result: true });
      } catch (e) {
        showWarn(e);
        r({ result: false, info: 'ไม่มีข้อมูล หรือ ข้อมูลไม่ถูกต้อง' });
      }
    });

  const _onDataLoaded = async dataLoaded => {
    //  showLog('dataLoaded', dataLoaded);
    let nData = JSON.parse(JSON.stringify(dataLoaded));
    let nRows = [];
    for (var i = 0; i < dataLoaded.rows.length; i++) {
      if (dataLoaded.rows[i].length > 0) {
        nRows.push(dataLoaded.rows[i]);
      }
    }
    nData.rows = nRows;
    const jsonData = await formatToJson(nData);
    let dataType = 'vehicles';
    switch (title) {
      case data[0].title:
        dataType = 'vehicles';
        break;
      case data[1].title:
        dataType = 'parts';
        break;

      default:
        break;
    }
    //  showLog({ nData, jsonData });
    // TODO: Check correctness, duplication, etc.
    const isDataCorrected = await _checkImportData(nData, jsonData, dataType);
    //  showLog({ isDataCorrected });
    if (!isDataCorrected.result) {
      showAlert('ไม่สำเร็จ', isDataCorrected.info, 'warning', _onCancel);
      addErrorLogs({ message: isDataCorrected.info });
      return;
    }
    loadedData.current = nData;
    loadedJson.current = jsonData;
    setDataLoaded(true);
  };

  const _onConfirm = useCallback(async () => {
    //  showLog('dataLoaded', loadedData.current);
    setUploading(true);
    let dataRef = 'stockImportVehicles';
    switch (title) {
      case data[0].title:
        dataRef = 'stockImportVehicles';
        break;
      case data[1].title:
        dataRef = 'stockImportParts';
        break;

      default:
        break;
    }
    // Upload data.
    await arrayForEach(loadedJson.current, async item => {
      await api.addItem({ ...item, importBy: user.uid, importTime: Date.now() }, dataRef);
    });

    setUploading(false);
    showSuccess(() => resetToInitial(), `นำเข้าข้อมูล ${title} เรียบร้อยแล้ว`, true);

    // resetToInitial();
  }, [api, title, user.uid]);

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
        dataSource={data}
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
              avatar={<Avatar src={require('../../../images/importExcel.png')} />}
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
                  {!!loadedData.current && (
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
                {!!loadedData.current && (
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
    //         alt="KBN"
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

export default StockImport;
