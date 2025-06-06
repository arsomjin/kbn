import React from 'react';
import { Container, Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'shards-react';

import { showLog } from 'functions';
import { SettingItems } from 'data/Constant';

const PartList = ({ onSelect }) => (
  <Container fluid>
    {/* Default Light Table */}
    <Card small className="mb-4">
      <CardHeader className="border-bottom">
        <h6 className="m-0">อะไหล่</h6>
      </CardHeader>
      <CardBody className="p-0 pb-3">
        <ListGroup>
          <ListGroupItem action onClick={() => onSelect(SettingItems.branch)}>
            KX91-3SX
          </ListGroupItem>
          <ListGroupItem data-id="Dapibus" action onClick={ev => showLog('clicked!', ev.currentTarget.dataset.id)}>
            U35
          </ListGroupItem>
          <ListGroupItem action onClick={() => showLog('Spare parts clicked!')}>
            L5D18DT
          </ListGroupItem>
        </ListGroup>
      </CardBody>
    </Card>
  </Container>
);

export default PartList;
