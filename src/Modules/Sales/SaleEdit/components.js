import React from 'react';
import { Fragment } from 'react';
import { Input as AInput, Modal } from 'antd';
import { Input } from 'elements';
import { Col, Row } from 'shards-react';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import numeral from 'numeral';
import dayjs from 'dayjs';
import Payments from 'components/Payments';

export const GuarantorDocs = ({ value: guarantorDoc, onChange, grant, readOnly }) => {
  const triggerChange = changedData => {
    const val = Object.assign({}, guarantorDoc, changedData);
    // showLog({ changedData, val });
    onChange(val);
  };

  return (
    <Fragment>
      <AInput.Group compact>
        <Input disabled style={{ textAlign: 'center', width: '15%' }} />
        <Input disabled style={{ textAlign: 'center', width: '30%' }} defaultValue="สำเนาบัตรประชาชน" />
        <Input disabled style={{ textAlign: 'center', width: '29.5%' }} defaultValue="สำเนาทะเบียนบ้าน" />
        <Input style={{ textAlign: 'center', width: '25%' }} disabled defaultValue="เอกสารอื่นๆ" />
      </AInput.Group>
      <AInput.Group compact>
        <Input disabled style={{ textAlign: 'center', width: '15%' }} />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="จำนวน" />
        <Input style={{ textAlign: 'center', width: '10%' }} disabled defaultValue="รับมา" />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="คงค้าง" />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="จำนวน" />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="รับมา" />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="คงค้าง" />
        <Input style={{ textAlign: 'center', width: '15%' }} disabled defaultValue="ชื่อเอกสาร" />
        <Input style={{ textAlign: 'center', width: '10%' }} disabled defaultValue="จำนวน" />
      </AInput.Group>
      <AInput.Group compact>
        <Input disabled style={{ width: '15%' }} defaultValue="ผู้เช่าซื้อ" />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="6 ชุด" />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="6"
          onChange={e => triggerChange({ tenantCopyIdCardReceive: e.target.value })}
          disabled={!grant}
          readOnly={readOnly}
        />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="0"
          disabled
          value={
            guarantorDoc?.tenantCopyIdCardReceive ? 6 - Math.abs(Number(guarantorDoc.tenantCopyIdCardReceive)) : null
          }
        />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="6 ชุด" />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="6"
          onChange={e => triggerChange({ tenantCopyHouseRegReceive: e.target.value })}
          disabled={!grant}
          readOnly={readOnly}
        />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="0"
          disabled
          value={
            guarantorDoc?.tenantCopyHouseRegReceive
              ? 6 - Math.abs(Number(guarantorDoc.tenantCopyHouseRegReceive))
              : null
          }
        />
        <Input style={{ textAlign: 'center', width: '15%' }} disabled defaultValue="ชุดโอนทะเบียน" />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="1"
          onChange={e => triggerChange({ regTransferDoc: e.target.value })}
          disabled={!grant}
          readOnly={readOnly}
        />
      </AInput.Group>
      <AInput.Group compact>
        <Input disabled style={{ width: '15%' }} defaultValue="ผู้ค้ำประกันคนที่ 1" />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="4 ชุด" />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="4"
          onChange={e => triggerChange({ guarantor1CopyIdCardReceive: e.target.value })}
          disabled={!grant}
          readOnly={readOnly}
        />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="0"
          disabled
          value={
            guarantorDoc?.guarantor1CopyIdCardReceive
              ? 4 - Math.abs(Number(guarantorDoc.guarantor1CopyIdCardReceive))
              : null
          }
        />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="4 ชุด" />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="4"
          onChange={e => triggerChange({ guarantor1CopyHouseRegReceive: e.target.value })}
          disabled={!grant}
          readOnly={readOnly}
        />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="0"
          disabled
          value={
            guarantorDoc?.guarantor1CopyHouseRegReceive
              ? 4 - Math.abs(Number(guarantorDoc.guarantor1CopyHouseRegReceive))
              : null
          }
        />
        <Input style={{ textAlign: 'center', width: '15%' }} disabled defaultValue="ลอกลาย 2 ชุด" />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="2"
          onChange={e => triggerChange({ regCopyPeel: e.target.value })}
          disabled={!grant}
          readOnly={readOnly}
        />
      </AInput.Group>
      <AInput.Group compact>
        <Input disabled style={{ width: '15%' }} defaultValue="ผู้ค้ำประกันคนที่ 2" />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="4 ชุด" />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="4"
          onChange={e => triggerChange({ guarantor2CopyIdCardReceive: e.target.value })}
          disabled={!grant}
          readOnly={readOnly}
        />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="0"
          disabled
          value={
            guarantorDoc?.guarantor2CopyIdCardReceive
              ? 4 - Math.abs(Number(guarantorDoc.guarantor2CopyIdCardReceive))
              : null
          }
        />
        <Input disabled style={{ textAlign: 'center', width: '10%' }} defaultValue="4 ชุด" />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="4"
          onChange={e => triggerChange({ guarantor2CopyHouseRegReceive: e.target.value })}
          disabled={!grant}
          readOnly={readOnly}
        />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          placeholder="0"
          disabled
          value={
            guarantorDoc?.guarantor2CopyHouseRegReceive
              ? 4 - Math.abs(Number(guarantorDoc.guarantor2CopyHouseRegReceive))
              : null
          }
        />
        <Input
          style={{ textAlign: 'center', width: '15%' }}
          onChange={e => triggerChange({ guarantor2ExtraDocName: e.target.value })}
          disabled={!grant}
          readOnly={readOnly}
        />
        <Input
          style={{ textAlign: 'center', width: '10%' }}
          onChange={e => triggerChange({ guarantor2ExtraDoc: e.target.value })}
          disabled={!grant}
          readOnly={readOnly}
        />
      </AInput.Group>
    </Fragment>
  );
};

export const MoreReservationInfo = ({ visible, values, onOk, onCancel, employees, banks }) => {
  const { amtReservation, bookingPerson, receiverEmployee, depositPayments, reservationDepositor, bookDate, payments } =
    values;
  return (
    <Modal
      title="รายละเอียด เงินจอง/เงินมัดจำ"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="บันทึก"
      cancelText="ปิด"
      footer={[
        <Button key="close" onClick={onCancel}>
          ปิด
        </Button>
      ]}
      width={isMobile ? '90vw' : '77vw'}
      style={{ left: isMobile ? 0 : w(7) }}
    >
      <div className=" bg-white">
        <Row form className="mb-3">
          <Col md="6">
            <Input
              value={numeral(amtReservation).format('0,0.00')}
              addonBefore="เงินรับจอง"
              addonAfter="บาท"
              readOnly
            />
          </Col>
          <Col md="6">
            <Input
              value={bookDate ? dayjs(bookDate, 'YYYY-MM-DD').format('D/MM/YYYY') : null}
              addonBefore="วันที่รับจอง"
              readOnly
            />
          </Col>
        </Row>
        <Row form className="mb-3">
          <Col md="6">
            <Input
              addonBefore="ผู้รับจอง"
              value={
                bookingPerson && employees[bookingPerson]
                  ? `${employees[bookingPerson].firstName}${
                      employees[bookingPerson].nickName ? `(${employees[bookingPerson].nickName})` : ''
                    }`
                  : bookingPerson || '-'
              }
              readOnly
            />
          </Col>
          <Col md="6">
            <Input
              addonBefore="ผู้รับเงิน"
              value={
                receiverEmployee && employees[receiverEmployee]
                  ? `${employees[receiverEmployee].firstName}${
                      employees[receiverEmployee].nickName ? `(${employees[receiverEmployee].nickName})` : ''
                    }`
                  : receiverEmployee || '-'
              }
              readOnly
            />
          </Col>
        </Row>
        <div className="border bg-light px-3 pt-3 my-3">
          <label className="text-muted">ช่องทางการชำระเงิน</label>
          <Payments value={payments} disabled />
        </div>
      </div>
    </Modal>
  );
};
