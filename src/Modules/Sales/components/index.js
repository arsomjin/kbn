import React from 'react';
import { Checkbox, Collapse, Form, Radio, Space } from 'antd';
import { getRules } from 'api/Table';
import { Row, Col } from 'shards-react';
import { Input, Switch } from 'elements';
import TurnOverItems from './TurnOverItems';
import BuyMoreItems from './BuyMoreItems';
import { Numb } from 'functions';

export const TurnOverVehicle = ({ onItemChange, values, docId, grant, readOnly }) => {
  const _onChange = dat => {
    onItemChange && onItemChange(dat);
  };
  const hasTurnOver = !!values.amtTurnOverVehicle ? Numb(values.amtTurnOverVehicle) > 0 : false;
  return (
    <div className="mb-3">
      <Collapse defaultActiveKey={hasTurnOver ? ['1'] : undefined}>
        <Collapse.Panel header={<h6 className="text-primary pt-1">ตีเทิร์น</h6>} key="1">
          {/* <h6 className="text-primary">ตีเทิร์น</h6> */}
          <TurnOverItems
            items={values.turnOverItems}
            docId={docId}
            onChange={_onChange}
            grant={grant}
            readOnly={readOnly}
            permanentDelete={true}
          />
          <Row className="mt-3">
            <Col md="3">
              <Form.Item name="amtTurnOverVehicle" label="ราคาตีเทิร์นตัวรถ" rules={getRules(['number'])}>
                <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly className="text-primary" />
              </Form.Item>
            </Col>
            <Col md="1">
              <Form.Item label="ซ่อม" name="turnOverFix">
                <Switch disabled={!grant || readOnly} />
              </Form.Item>
            </Col>
            {values.turnOverFix && (
              <>
                <Col md="3">
                  <Form.Item name="turnOveFixMAX" label="ซ่อม MAX" rules={getRules(['number'])}>
                    <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                  </Form.Item>
                </Col>
                <Col md="3">
                  <Form.Item name="turnOveFixKBN" label="ซ่อม KBN" rules={getRules(['number'])}>
                    <Input currency placeholder="จำนวนเงิน" disabled={!grant} readOnly={readOnly} />
                  </Form.Item>
                </Col>
              </>
            )}

            {/*  <Col md="2">
          <Form.Item
            name="turnOverVehicleYear"
            label="ปีรถ"
            rules={[
              {
                required: !!values.amtTurnOver,
                message: 'กรุณาป้อนข้อมูล',
              },
            ]}
          >
            <DatePicker format='year' disabled={!grant || readOnly} />
          </Form.Item>
        </Col>
        <Col md="3">
          <Form.Item
            name="turnOverVehicleModel"
            label="รุ่นรถ"
            rules={[
              {
                required: !!values.amtTurnOver,
                message: 'กรุณาป้อนข้อมูล',
              },
            ]}
          >
            <Input placeholder="รุ่นรถ" disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="2">
          <Form.Item
            name="turnOverVehicleNo"
            label="หมายเลขรถ"
            rules={[
              {
                required: !!values.amtTurnOver,
                message: 'กรุณาป้อนข้อมูล',
              },
            ]}
          >
            <Input
              placeholder="หมายเลขรถ"
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
        <Col md="2">
          <Form.Item
            name="turnOverEngineNo"
            label="หมายเลขเครื่อง"
            rules={[
              {
                required: !!values.amtTurnOver,
                message: 'กรุณาป้อนข้อมูล',
              },
            ]}
          >
            <Input
              placeholder="หมายเลขรถ"
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="12">
          <Form.Item label="อุปกรณ์">
            <ArrayInput
              name="turnOverVehiclePeripherals"
              columns={peripheralInputColumns}
              hasSum
            />
          </Form.Item>
        </Col>*/}
          </Row>
          {/* <Row>
        <Col md="3">
          <Form.Item
            name="turnOverWorkHours"
            label="ชั่วโมงการทำงาน"
            rules={[
              {
                required: !!values.amtTurnOver,
                message: 'กรุณาป้อนข้อมูล',
              },
              ...getRules(['number']),
            ]}
          >
            <Input
              number
              placeholder="จำนวนชั่วโมง"
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
        <Col md="1">
          <Form.Item label="ซ่อม" name="turnOverFix">
            <Switch disabled={!grant || readOnly} />
          </Form.Item>
        </Col>
        {values.turnOverFix && (
          <>
            <Col md="3">
              <Form.Item
                name="turnOveFixMAX"
                label="ซ่อม MAX"
                rules={getRules(['number'])}
              >
                <Input
                  currency
                  placeholder="จำนวนเงิน"
                  disabled={!grant}
                  readOnly={readOnly}
                />
              </Form.Item>
            </Col>
            <Col md="3">
              <Form.Item
                name="turnOveFixKBN"
                label="ซ่อม KBN"
                rules={getRules(['number'])}
              >
                <Input
                  currency
                  placeholder="จำนวนเงิน"
                  disabled={!grant}
                  readOnly={readOnly}
                />
              </Form.Item>
            </Col>
          </>
        )}
      </Row> */}
          <Form.Item
            name="turnOverDocs"
            rules={[
              {
                required: !!values.amtTurnOver,
                message: 'กรุณาป้อนข้อมูล'
              }
            ]}
            label="เอกสารสำหรับรถตีเทิร์น"
            className="border p-3 bg-light"
          >
            <Checkbox.Group style={{ width: '100%' }} disabled={!grant || readOnly}>
              <Row>
                <Col md="3" className="my-1">
                  <Checkbox value="สำเนาบัตรประชาชน">สำเนาบัตรประชาชน</Checkbox>
                </Col>
                <Col md="3" className="my-1">
                  <Checkbox value="สำเนาทะเบียนบ้าน">สำเนาทะเบียนบ้าน</Checkbox>
                </Col>
                <Col md="3" className="my-1">
                  <Checkbox value="เล่มทะเบียน+ป้ายทะเบียน">เล่มทะเบียน+ป้ายทะเบียน</Checkbox>
                </Col>
                <Col md="3" className="my-1">
                  <Checkbox value="ภาพถ่าย">ภาพถ่าย</Checkbox>
                </Col>
                {/* </Row>
              <Row> */}
                <Col md="3" className="my-1">
                  <Checkbox value="ลอกลาย">ลอกลาย</Checkbox>
                </Col>
                <Col md="3" className="my-1">
                  <Checkbox value="เอกสารปิดบัญชีรถคันเก่า">เอกสารปิดบัญชีรถคันเก่า</Checkbox>
                  {values.turnOverDocs.includes('เอกสารปิดบัญชีรถคันเก่า') && (
                    <Form.Item
                      name="turnOverCloseInstallment"
                      rules={[
                        {
                          required: !!values.turnOverDocs.includes('เอกสารปิดบัญชีรถคันเก่า'),
                          message: 'กรุณาป้อนข้อมูล'
                        }
                      ]}
                      className="mt-2 border p-2 bg-light"
                    >
                      <Radio.Group style={{ width: '100%' }} disabled={!grant || readOnly}>
                        <Space direction="vertical">
                          <Radio
                            style={{
                              whiteSpace: 'normal'
                            }}
                            value={'byKBN'}
                          >
                            ร้านจ่ายปิดค่างวดให้ลูกค้าก่อน
                          </Radio>
                          <Radio
                            style={{
                              whiteSpace: 'normal'
                            }}
                            value={'byCustomer'}
                          >
                            ลูกค้าปิดค่างวด
                          </Radio>
                        </Space>
                      </Radio.Group>
                    </Form.Item>
                  )}
                </Col>
                <Col md="3" className="my-1">
                  <Checkbox value="แบบยืนยันการแลกเปลี่ยนสินค้า">แบบยืนยันการแลกเปลี่ยนสินค้า</Checkbox>
                </Col>
                <Col md="3" className="my-1">
                  <Checkbox value="จดหมายขออนุมัติใช้โปรโมชั่น">จดหมายขออนุมัติใช้โปรโมชั่น</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <label className="text-muted">หมายเหตุ: เอกสารให้ส่ง สนง.ใหญ่ ภายใน 3 วัน นับจากที่มีการตีเทิร์นรถ</label>
          {/* </Collapse.Panel>
        </Collapse> */}
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export const BuyMore = ({ onItemChange, values, docId, grant, readOnly, permanentDelete = false }) => {
  const _onChange = dat => {
    onItemChange && onItemChange(dat);
  };
  const hasBuyMore =
    !!values.additionalPurchase && Array.isArray(values.additionalPurchase)
      ? values.additionalPurchase.length > 0
      : false;
  return (
    <div className="mb-3">
      <Collapse defaultActiveKey={hasBuyMore ? ['1'] : undefined}>
        <Collapse.Panel header={<h6 className="text-primary pt-1">รายการซื้อเพิ่ม</h6>} key="1">
          {/* <h6 className="text-primary">ตีเทิร์น</h6> */}
          <BuyMoreItems
            items={values.additionalPurchase}
            docId={docId}
            onChange={_onChange}
            grant={grant}
            readOnly={readOnly}
            permanentDelete={permanentDelete}
          />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
