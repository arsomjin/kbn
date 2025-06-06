import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody, ListGroup } from 'shards-react';
import DepartmentSelector from 'components/DepartmentSelector';
import { Form } from 'antd';
import BranchSelector from 'components/BranchSelector';
import GroupSelector from 'components/GroupSelector';
const ItemClass = 'mb-2';

const SidebarCategories = ({ title }) => (
  <Card small className="mb-3">
    <CardHeader className="border-bottom">
      <h6 className="m-0">{title}</h6>
    </CardHeader>
    <CardBody className="p-3">
      <ListGroup flush>
        <Form.Item label="ระดับ" name="group" className={ItemClass}>
          <GroupSelector hasAll />
        </Form.Item>
        <Form.Item label="สาขา" name="branch" className={ItemClass}>
          <BranchSelector hasAll />
        </Form.Item>
        <Form.Item label="แผนก" name="department" className={ItemClass}>
          <DepartmentSelector hasAll />
        </Form.Item>
      </ListGroup>
    </CardBody>
  </Card>
);

SidebarCategories.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string
};

SidebarCategories.defaultProps = {
  title: 'Categories'
};

export default SidebarCategories;
