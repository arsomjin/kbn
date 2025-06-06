import React, { Fragment } from 'react';

import { Row, Col } from 'shards-react';
import { Form, Collapse, Popconfirm } from 'antd';
import { Button, Input } from 'elements';
import PrefixAnt from './PrefixAnt';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import { Address } from './NameAddress';
import { showLog } from 'functions';
import { PlusOutlined } from '@ant-design/icons';
const { Panel } = Collapse;

const Guarantors = ({ name, notRequired, addText, grant, readOnly, values, ...props }) => {
  // showLog({ guarantor });
  return (
    <Form.List name={name} {...props}>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            {fields.map(field => {
              let value = values[name][field.name];
              // showLog({ value });
              return (
                <div key={field.key} className="border bg-light px-3 pt-3">
                  <div className="d-flex flex-row" style={{ justifyContent: 'space-between' }}>
                    <label className="text-muted">{`ผู้ค้ำประกัน #${field.name + 1}`}</label>
                    <Popconfirm
                      title="ลบรายการ ?"
                      onConfirm={() => remove(field.name)}
                      onCancel={() => showLog('cancel')}
                      okText="ยืนยัน"
                      cancelText="ยกเลิก"
                      disabled={fields.length === 0 || !grant || readOnly}
                    >
                      <Button
                        theme="white"
                        className="p-2"
                        disabled={!grant || readOnly}
                        // onClick={() => remove(field.name)}
                      >
                        <i className="material-icons">clear</i>
                      </Button>
                    </Popconfirm>
                  </div>
                  <Row form style={{ alignItems: 'center' }}>
                    <Col md="2">
                      <Form.Item name={[field.name, 'prefix']} label="คำนำหน้า" className={formItemClass}>
                        <PrefixAnt disabled={!grant || readOnly} readOnly={readOnly} />
                      </Form.Item>
                    </Col>
                    <Col md="2">
                      <Form.Item
                        name={[field.name, 'firstName']}
                        label="ชื่อผู้ค้ำประกัน"
                        className={formItemClass}
                        rules={[
                          {
                            required: !notRequired,
                            message: 'กรุณาป้อนชื่อผู้ค้ำประกัน'
                          }
                        ]}
                      >
                        <Input placeholder="ชื่อผู้ค้ำประกัน" disabled={!grant} readOnly={readOnly} />
                      </Form.Item>
                    </Col>
                    {!['หจก.', 'บจ.'].includes([field.name, 'prefix']) && (
                      <Col md="3">
                        <Form.Item name={[field.name, 'lastName']} label="นามสกุล" className={formItemClass}>
                          <Input placeholder="นามสกุล" disabled={!grant} readOnly={readOnly} />
                        </Form.Item>
                      </Col>
                    )}

                    <Col md="2">
                      <Form.Item
                        name={[field.name, 'phoneNumber']}
                        label="เบอร์โทรศัพท์"
                        className={formItemClass}
                        rules={[
                          {
                            required: !notRequired || value.firstName,
                            message: 'กรุณาป้อนข้อมูล'
                          },
                          ...getRules(['mobileNumber'])
                        ]}
                      >
                        <Input mask="111-1111111" placeholder="012-3456789" disabled={!grant} readOnly={readOnly} />
                      </Form.Item>
                    </Col>
                    <Col md="2">
                      <Form.Item
                        name={[field.name, 'relationship']}
                        label="ความสัมพันธ์"
                        className={formItemClass}
                        rules={[
                          {
                            required: !notRequired || value.firstName,
                            message: 'กรุณาป้อนข้อมูล'
                          }
                        ]}
                      >
                        <Input placeholder="กรุณาป้อนข้อมูล" disabled={!grant} readOnly={readOnly} />
                      </Form.Item>
                    </Col>
                  </Row>
                  {!!value?.address && (
                    <Address
                      parent={[field.name, 'address']}
                      address={value.address}
                      // noLabel
                      disabled={!grant}
                      readOnly={readOnly}
                      notRequired={notRequired && !value.firstName}
                    />
                  )}
                </div>
              );
            })}
            <Form.ErrorList errors={errors} />
            {!readOnly && grant && (
              <Form.Item className={fields.length > 0 ? 'mb-2 mt-1' : 'mb-2 mt-0'}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  size="middle"
                  icon={<PlusOutlined />}
                  disabled={!grant || readOnly}
                >
                  {addText || 'เพิ่มรายการ'}
                </Button>
              </Form.Item>
            )}
          </>
        );
      }}
    </Form.List>
  );
};

export default Guarantors;
