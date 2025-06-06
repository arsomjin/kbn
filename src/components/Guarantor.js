import React, { Fragment } from 'react';

import { Row, Col } from 'shards-react';
import { Form, Collapse } from 'antd';
import { Input } from 'elements';
import PrefixAnt from './PrefixAnt';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import { Address } from './NameAddress';
const { Panel } = Collapse;

const Guarantor = ({ grant, onClick, getParent, values, notRequired, readOnly }) => {
  // showLog({ guarantor });
  const guarantor = values.guarantor;
  return (
    <Fragment>
      <Row form style={{ alignItems: 'center' }}>
        <Col md="2">
          <Form.Item name={['guarantor', 'prefix']} label="คำนำหน้า" className={formItemClass}>
            <PrefixAnt disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="2">
          <Form.Item
            name={['guarantor', 'firstName']}
            label="ชื่อผู้ค้ำประกัน"
            className={formItemClass}
            rules={[{ required: !notRequired, message: 'กรุณาป้อนชื่อผู้ค้ำประกัน' }]}
          >
            <Input placeholder="ชื่อผู้ค้ำประกัน" disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
        {!['หจก.', 'บจ.'].includes(guarantor.prefix) && (
          <Col md="3">
            <Form.Item name={['guarantor', 'lastName']} label="นามสกุล" className={formItemClass}>
              <Input placeholder="นามสกุล" disabled={!grant} readOnly={readOnly} />
            </Form.Item>
          </Col>
        )}

        <Col md="2">
          <Form.Item
            name={['guarantor', 'phoneNumber']}
            label="เบอร์โทรศัพท์"
            className={formItemClass}
            rules={[
              {
                required: !notRequired || guarantor.firstName,
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
            name={['guarantor', 'relationship']}
            label="ความสัมพันธ์"
            className={formItemClass}
            rules={[
              {
                required: !notRequired || guarantor.firstName,
                message: 'กรุณาป้อนข้อมูล'
              }
            ]}
          >
            <Input placeholder="กรุณาป้อนข้อมูล" disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
      </Row>
      {guarantor?.address && (
        // <Collapse>
        //   <Panel header="ที่อยู่" key="1">
        <Address
          parent={['guarantor', 'address']}
          address={guarantor?.address}
          // noLabel
          disabled={!grant}
          readOnly={readOnly}
          notRequired={notRequired && !guarantor.firstName}
        />
        //   </Panel>
        // </Collapse>
      )}
    </Fragment>
  );
};

export default Guarantor;
