/* eslint jsx-a11y/anchor-is-valid: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem, Button } from 'shards-react';
import { Form, Input, Popconfirm, Select } from 'antd';
import StatusSelector from 'components/StatusSelector';
const ItemClass = 'mb-2';

const SidebarActions = ({ title, onPublish, values }) => (
  <Card small className="mb-3">
    <CardHeader className="border-bottom">
      <h6 className="m-0">{title}</h6>
    </CardHeader>
    <CardBody className="p-3">
      <ListGroup flush>
        <Form.Item label="สถานะ" name="type" className={ItemClass}>
          <StatusSelector className="text-succcess" />
        </Form.Item>
        <Form.Item name="duration" label="เวลา" className={ItemClass} tooltip="ตั้งเวลาการปิดหน้าต่างอัตโนมัติ">
          <Select>
            {Array.from(new Array(10), (_, i) => (
              <Select.Option key={i} value={i + 1}>
                {`${i + 1} วินาที`}
              </Select.Option>
            ))}
            <Select.Option key={10} value={0}>
              {'เปิดตลอด'}
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="ลิงค์" name="link" className={ItemClass}>
          <Input className="text-succcess" placeholder="https://kubota-benjapol.web.app/overview" />
        </Form.Item>
        <ListGroupItem className="d-flex px-3">
          {/* <Button outline theme="accent" size="sm">
            <i className="material-icons">save</i> Save Draft
          </Button> */}
          <Popconfirm title="ส่งการแจ้งเตือน?" okText="ส่งเลย" cancelText="ยังก่อน" onConfirm={onPublish}>
            <Button
              // onClick={onPublish}
              theme="accent"
              size="sm"
              className="ml-auto"
              style={{ width: '100%' }}
            >
              <i className="material-icons">send</i> ส่งการแจ้งเตือน
            </Button>
          </Popconfirm>
        </ListGroupItem>
      </ListGroup>
    </CardBody>
  </Card>
);

SidebarActions.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string
};

SidebarActions.defaultProps = {
  title: 'สถานะ'
};

export default SidebarActions;
