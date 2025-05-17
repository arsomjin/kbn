import CustomFileUpload from 'components/components-overview/CustomFileUpload';
import { showLog } from 'functions';
import React, { useEffect, useState } from 'react';
import { OutTable, ExcelRenderer } from 'react-excel-renderer';
import { ListGroup, ListGroupItem } from 'shards-react';
import { Spin, Typography } from 'antd';
import { formatExcelImportArr, getColNameFromTitle, isDataValid } from './api';
import Modal from 'antd/lib/modal/Modal';
import { Button } from 'elements';
import { showMessageBar } from 'functions';
const { Text } = Typography;

const Excels = ({ firstRowIsHeader, onDataLoaded, style, title }) => {
  const [rows, setRows] = useState(null);
  const [cols, setCols] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [uploadedFileName, setUploadFileName] = useState('');
  const [isFormInvalid, setIsFormInvalid] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [colName, setColName] = useState([]);
  const [imgSrc, setImg] = useState(require('../../../images/ExcelForImport.png'));

  useEffect(() => {
    switch (title) {
      case 'รับรถและอุปกรณ์':
        setImg(require('../../../images/ExcelForImport.png'));
        break;
      case 'รับอะไหล่':
        setImg(require('../../../images/ExcelForImportParts.png'));

        break;
      case 'รายได้งานบริการ':
        setImg(require('../../../images/ExcelForImportServiceIncome.png'));
        break;
      case 'รายได้ขายอะไหล่':
        setImg(require('../../../images/ExcelForImportPartIncome.png'));

        break;
      case 'รายการรถและอุปกรณ์':
        setImg(require('../../../images/ExcelForImportModelList.png'));
        break;
      // case 'รายการอะไหล่':
      //   break;
      case 'การสแกนลายนิ้วมือ':
        setImg(require('../../../images/ExcelForImportFingerPrint.png'));
        break;

      default:
        break;
    }
  }, [title]);

  const setInitial = () => {
    setDataLoaded(false);
    setIsFormInvalid(false);
    setLoading(false);
    setRows(null);
    setCols(null);
  };

  const renderFile = fileObj => {
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
        setLoading(false);
      } else {
        //  showLog('resp', resp);
        let columnArr = [{ name: 'A', key: 0 }];
        let rowArr = JSON.parse(JSON.stringify(resp.rows));
        if (firstRowIsHeader) {
          let firstRow = rowArr[0];
          for (var i = 0; i < firstRow.length; i++) {
            columnArr.push({
              name: firstRow[i],
              key: i + 1
            });
          }
          rowArr = rowArr.slice(1);
          rowArr = formatExcelImportArr({ rows: rowArr, cols: columnArr });
          // Check isDataVaid
          const isValid = isDataValid(columnArr, title);
          if (!isValid) {
            setLoading(false);
            setIsFormInvalid(true);
            return;
          }
        } else {
          columnArr = resp.cols;
        }
        setCols(columnArr);
        setRows(rowArr);
        setDataLoaded(true);
        onDataLoaded({ rows: rowArr, cols: columnArr });
        setLoading(false);
      }
    });
  };

  const fileHandler = event => {
    setInitial();
    if (event.target.files.length) {
      let fileObj = event.target.files[0];
      let fileName = fileObj.name;

      //check for file extension and pass only if it is .xlsx and display error message otherwise
      let fileExtension = fileName.slice(fileName.lastIndexOf('.') + 1);
      if (['xlsx', 'xls'].includes(fileExtension)) {
        setUploadFileName(fileName);
        setIsFormInvalid(false);
        setLoading(true);
        renderFile(fileObj);
      } else {
        setIsFormInvalid(true);
        setUploadFileName('');
      }
    }
  };

  const toggle = () => {
    if (title === 'ข้อมูลอื่นๆ') {
      return showMessageBar('การอัพโหลดนี้ ไม่มีการตรวจสอบชื่อคอลัมน์ก่อนนำเข้า');
    }
    let names = getColNameFromTitle(title);
    setColName(names);
    setIsOpen(true);
  };

  const openNewPage = chosenItem => {
    const url =
      chosenItem === 'github'
        ? 'https://github.com/ashishd751/react-excel-renderer'
        : 'https://medium.com/@ashishd751/render-and-display-excel-sheets-on-webpage-using-react-js-af785a5db6a7';
    window.open(url, '_blank');
  };

  showLog({ rows, cols });
  const isLoaded = dataLoaded && rows && cols;
  return (
    <div style={style}>
      <div className="border-bottom bg-white p-3">
        <h6 className="text-primary">{isLoaded ? 'กรุณาตรวจสอบข้อมูล ก่อนอัปโหลด' : `อัปโหลดข้อมูล ${title}`}</h6>
        {!isLoaded && (
          <div>
            <div>
              <Text className="text-light">กรุณาจัดรูปแบบไฟล์ Excel ที่ต้องการนำเข้า ดังตัวอย่างในรูป</Text>
            </div>
            <div>
              <Text className="text-light">1. ให้แถวแรกเป็นชื่อข้อมูล (แถวเดียวเท่านั้น)</Text>
            </div>
            <div>
              <Text className="text-light">
                2. ชื่อข้อมูลในแต่ละช่อง ต้องตรงตามที่กำหนดไว้เท่านั้น{' '}
                <Text onClick={toggle} className="text-primary">
                  ตรวจสอบรายชื่อข้อมูลได้ที่นี่
                </Text>
              </Text>
            </div>
            <div>
              <Text className="text-light">(หมายเหตุ: ระบบจะนำเข้าเฉพาะ Sheet แรก ของไฟล์เท่านั้น)</Text>
            </div>
          </div>
        )}
      </div>
      {!isLoaded && (
        <div className="text-center">
          <div className="bordered">
            <img
              src={imgSrc}
              alt="ExcelForImport"
              className="restrict-excel-img"
              // style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
            <div style={{ height: 50 }} />
            <ListGroup flush>
              <ListGroupItem className="px-3">
                <CustomFileUpload fileHandler={fileHandler} fileName={uploadedFileName} />
              </ListGroupItem>
            </ListGroup>
            {loading && (
              <div style={{ textAlign: 'center' }}>
                <Spin tip="กำลังอ่านข้อมูล..." />
              </div>
            )}
            {isFormInvalid && (
              <div style={{ textAlign: 'center' }}>
                <p className="text-danger">รูปแบบไฟล์ไม่ถูกต้อง</p>
              </div>
            )}
          </div>
        </div>
      )}
      <Modal
        title={`รายชื่อคอลัมน์ในไฟล์ Excel - ${title}`}
        visible={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={[
          <Button type="primary" key="ok" onClick={() => setIsOpen(false)}>
            ตกลง
          </Button>
        ]}
      >
        <div>
          <Text>{colName.map((l, i) => `${l}${i < colName.length - 1 ? ' | ' : ''}`)}</Text>
        </div>
        {!['การสแกนลายนิ้วมือ'].includes(title) && (
          <div className="mt-3">
            <Text className="text-muted">(รวม {colName.length} ช่อง)</Text>
          </div>
        )}
      </Modal>
      {isLoaded && (
        <div className="restrict-card">
          <OutTable data={rows} columns={cols} tableClassName="ExcelTable2007" tableHeaderRowClass="heading" />
        </div>
      )}
    </div>
  );
};

export default Excels;
