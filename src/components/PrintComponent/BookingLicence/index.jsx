import React, { forwardRef, memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Col, Row, Table, Divider } from 'antd';
import 'antd/dist/antd.css';
import { PrintContainer } from '../Common/PrintContainer';
import { PrintFooter } from '../Common/PrintFooter';
import { PrintHeader } from '../Common/PrintHeader';
import { PrintSignBox } from '../Common/PrintSignBox';
import { PrintConsent } from '../Common/PrintConsent';
import { showLog } from 'utils/functions';
import { getFullName } from 'modules/Utils';
import { dateToThai } from 'utils/functions';
import { Numb } from 'utils/number';
import { numer } from 'utils/number';
import { getDoc } from 'services/firebase';

const BookingLicence = memo((props) => {
  const { content, values, columns } = props;
  const data = useSelector((state) => state.data);
  const { employees } = data;

  // Debug log
  showLog({ values, content });

  // Initialize state for derived data
  const [derivedData, setDerivedData] = useState({
    bdate: '',
    sales: '',
    address: '',
    moo: '',
    tambol: '',
    amphoe: '',
    province: '',
    postcode: '',
    fullName: '',
    ID: '',
    tableData: [],
    total: 0,
    vat: 0,
    grandTotal: 0,
  });

  const getCustomerID = async ({ customerId } = {}) => {
    if (!customerId) return null;
    try {
      const customer = await getDoc('data', `sales/customers/${customerId}`);
      return customer?.idNumber || null;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  };

  useEffect(() => {
    const getSalesName = () => {
      if (Array.isArray(values.salesPerson)) {
        return values.salesPerson
          .map((id) => {
            const emp = employees[id];
            return emp ? `${emp.firstName}${emp.nickName ? `(${emp.nickName})` : ''}` : id || '-';
          })
          .join(', ');
      }
      if (values.salesPerson && employees[values.salesPerson]) {
        const emp = employees[values.salesPerson];
        return `${emp.firstName}${emp.nickName ? `(${emp.nickName})` : ''}`;
      }
      return values.salesPerson || '-';
    };

    const bdate = values?.date ? dateToThai(values.date) : '';
    const sales = getSalesName();

    const address = values.address?.address ? `บ้านเลขที่ ${values.address.address || ''}` : '';
    const moo = values.address?.moo ? ` หมู่ที่ ${values.address.moo || ''}` : '';
    const tambol = values.address?.tambol ? ` ต. ${values.address.tambol || ''}` : '';
    const amphoe = values.address?.amphoe ? ` อ. ${values.address.amphoe || ''}` : '';
    const province = values.address?.province ? ` จ. ${values.address.province || ''}` : '';
    const postcode = values.address?.postcode ? ` ${values.address.postcode || ''}` : '';
    const fullName = getFullName(values);

    const tableData = (values.items || []).map((it, id) => ({
      id,
      key: id,
      productName: it.productName,
      unitPrice: it.unitPrice,
      qty: it.qty,
      discount: it.discount,
      total: it.total,
    }));

    let total = (values.items || [])
      .filter((l) => !l.deleted)
      .reduce((sum, elem) => sum + Numb(elem.total), 0);

    const vat = total * 0.07;
    const grandTotal = total + vat;

    async function updateDerivedData() {
      const idNumber = await getCustomerID(values);
      setDerivedData({
        bdate,
        sales,
        address,
        moo,
        tambol,
        amphoe,
        province,
        postcode,
        fullName,
        ID: idNumber,
        tableData,
        total,
        vat,
        grandTotal,
      });
    }
    updateDerivedData();
  }, [values, employees]);

  return (
    <PrintContainer style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1 }} {...(content.subtitle === '(สำเนา)' && { className: 'pt-2' })}>
        <PrintHeader
          title={content.docName}
          subtitle={content.subtitle}
          rightData={[
            { th: 'เลขที่', td: content.docNo },
            { th: 'วันที่', td: derivedData.bdate },
            { th: 'ชื่อพนักงานขาย', td: derivedData.sales },
          ]}
        />
        <Row className="mt-5 align-items-center">
          <Row className="mr-4 align-items-center">
            <h6 className="text-primary mr-2">ผู้จอง</h6>
            <h6>{derivedData.fullName}</h6>
          </Row>
          <Row className="align-items-center">
            <h6 className="mr-2">เลขที่บัตรประชาชน</h6>
            <h6>{derivedData.ID}</h6>
          </Row>
        </Row>
        <Row className="align-items-center">
          <h6 className="mr-2">ที่อยู่ :</h6>
          <h6>
            {`${derivedData.address}${derivedData.moo}${derivedData.tambol}${derivedData.amphoe}${derivedData.province}${derivedData.postcode}`}{' '}
          </h6>
          <h6 className="mr-2 ml-4">เบอร์โทร :</h6>
          <h6>{values.phoneNumber || ''}</h6>
        </Row>

        <Row style={{ marginTop: 48 }}>
          <Table
            dataSource={derivedData.tableData}
            columns={columns}
            pagination={false}
            style={{ width: '100%' }}
            rowClassName="print-row"
          />
        </Row>

        <Row style={{ marginTop: 48 }}>
          <Col span={10} offset={14}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <th className="text-right text-primary">รวมเป็นเงิน</th>
                  <td className="text-right">{numer(derivedData.total).format('0,0.00')}</td>
                  <th className="text-right">บาท</th>
                </tr>
                <tr>
                  <th className="text-right" style={{ color: 'transparent' }}>
                    .
                  </th>
                </tr>
                <tr>
                  <th className="text-right text-primary">มูลค่าที่คำนวณภาษี</th>
                  <td className="text-right">{numer(derivedData.total).format('0,0.00')}</td>
                  <th className="text-right">บาท</th>
                </tr>
                <tr>
                  <th className="text-right text-primary">ภาษีมูลค่าเพิ่ม 7%</th>
                  <td className="text-right">{numer(derivedData.vat).format('0,0.00')}</td>
                  <th className="text-right">บาท</th>
                </tr>
                <tr>
                  <th className="text-right text-primary">จำนวนเงินรวมทั้งสิ้น</th>
                  <td className="text-right">{numer(derivedData.grandTotal).format('0,0.00')}</td>
                  <th className="text-right">บาท</th>
                </tr>
              </tbody>
            </table>
            <Divider style={{ backgroundColor: 'lightgrey' }} />
          </Col>
        </Row>
      </div>
      <PrintFooter style={{ marginTop: 'auto' }}>
        <PrintConsent
          title="เงื่อนไขการจอง - รับ รถและอุปกรณ์"
          data={[
            'ผู้จองต้องจ่ายเงินมัดจำตามที่บริษัทฯกำหนด ให้แก่บริษัทฯ',
            'บริษัทฯจะรักษาสิทธิ์การจองของผู้จองภายใน 7 วัน นับตั้งแต่วันจองเป็นต้นไป หากพ้นกำหนดนี้แล้ว ถือว่าผู้จองสละสิทธิ์',
            'ราคาสินค้าและโปรโมชั่น อาจมีการเปลี่ยนแปลงโดยไม่ต้องแจ้งให้ทราบล่วงหน้า',
            'กรณีผู้จองไม่ผ่านการประเมินหรือไม่ได้รับอนุมัติจากบริษัทคูโบต้าลิสซิ่งฯ ถือว่าการจองเป็นอันยกเลิก ผู้รับจองจะต้องจ่ายเงินค่ามัดจำคืนให้แก่ผู้จอง',
          ]}
        />
        <Row>
          <Col span={8}>
            <PrintSignBox title="ผู้จอง" consentText="ข้าพเจ้ายอมรับเงื่อนไข" />
          </Col>
          <Col span={8}>
            <PrintSignBox title="ผู้รับจอง" />
          </Col>
          <Col span={8}>
            <PrintSignBox title="ผู้รับเงิน" />
          </Col>
        </Row>
      </PrintFooter>
    </PrintContainer>
  );
});

const BookingLicenceFC = forwardRef((props, ref) => {
  return <BookingLicence {...props} ref={ref} />;
});

export default BookingLicence;
export { BookingLicenceFC };
