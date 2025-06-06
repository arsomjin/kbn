import React from 'react';
import { Collapse } from 'antd';
import BranchDeliverInput from './Input';
import PageTitle from 'components/common/PageTitle';
import { Container, Row, Col } from 'shards-react';
import { Stepper } from 'elements';
import { CommonSteps } from 'data/Constant';
import Table from './Table';
export default () => {
  const activeStep = 0;
  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-light">
        <PageTitle sm="4" title="แผนการส่งรถสาขา" subtitle="คลังสินค้า" className="text-sm-left" />
        <Col>
          <Stepper
            className="bg-light"
            steps={CommonSteps}
            activeStep={activeStep}
            alternativeLabel={false} // In-line labels
          />
        </Col>
      </Row>

      <Collapse defaultActiveKey={['2']}>
        <Collapse.Panel header="บันทึกข้อมูล" key="1">
          <BranchDeliverInput />
        </Collapse.Panel>
        <Collapse.Panel header="แผนการส่งรถ" key="2">
          <Table />
        </Collapse.Panel>
      </Collapse>
    </Container>
  );
};
