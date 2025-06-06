import React from 'react';
import { Form } from 'antd';
import PageTitle from 'components/common/PageTitle';
import { Container, Row, Col } from 'shards-react';
import { Input } from 'elements';
import { firstKey } from 'functions';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';
import { createVehicleNoKeyWords, createPeripheralNoKeyWords } from 'Modules/Utils';

export default () => {
  const [form] = Form.useForm();

  const _onValuesChange = val => {
    if (firstKey(val) === 'input1') {
      // const result1 = val.input1.match(/[0-9]/g) || [];
      // const result1 = val.input1.match(/\d+/g) || [];
      const result1 = createVehicleNoKeyWords(val.input1);
      form.setFieldsValue({ strings: result1.map(l => `${l}\n`) });
    }
    if (firstKey(val) === 'input2') {
      const result2 = createPeripheralNoKeyWords(val.input2);
      form.setFieldsValue({ strings: result2.map(l => `${l}\n`) });
    }
    if (firstKey(val) === 'input3') {
      const result3 = removeAllNonAlphaNumericCharacters(val.input3);
      form.setFieldsValue({ result3 });
    }
  };
  return (
    <Container fluid className="main-content-container p-3">
      <PageTitle title="ทดสอบ" subtitle="Development" className="text-sm-left" />
      <Form
        form={form}
        layout="vertical"
        // onFinish={onFinish}
        initialValues={{
          input1: null,
          result1: null,
          input2: null,
          result2: null,
          input3: null,
          result3: null,
          strings: null
        }}
        style={{ alignItems: 'center' }}
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <>
              <Row>
                <Col md="4">
                  <Form.Item name="input1" label="Input Vehicle Number">
                    <Input />
                  </Form.Item>
                  <Form.Item name="result1" label="Vehicle Number Result">
                    <Input className="text-primary" readOnly />
                  </Form.Item>
                </Col>
                <Col md="4">
                  <Form.Item name="input2" label="Input Equipment Number">
                    <Input />
                  </Form.Item>
                  <Form.Item name="result2" label="Equipment Number Result">
                    <Input className="text-primary" readOnly />
                  </Form.Item>
                </Col>
                <Col md="4">
                  <Form.Item name="input3" label="Input">
                    <Input />
                  </Form.Item>
                  <Form.Item name="result3" label="Result">
                    <Input className="text-primary" readOnly />
                  </Form.Item>
                </Col>
              </Row>
              <div className="m-3">
                <Form.Item name="strings">
                  <Input />
                </Form.Item>
              </div>
            </>
          );
        }}
      </Form>
    </Container>
  );
};
