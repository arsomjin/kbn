import React from 'react';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';

import PageTitle from '../components/common/PageTitle';
import Editor from '../components/add-new-post/Editor';
import SidebarActions from '../components/add-new-post/SidebarActions';
import SidebarCategories from '../components/add-new-post/SidebarCategories';

const AddNewPost = () => (
  <div className='main-content-container px-4 pb-4' style={{ padding: '1rem' }}>
    {/* Page Header */}
    <Row className='page-header py-4'>
      <PageTitle
        sm='4'
        title='Add New Post'
        subtitle='Blog Posts'
        className='text-sm-left'
      />
    </Row>

    <Row gutter={24}>
      {/* Editor */}
      <Col lg={18} md={24}>
        <Editor />
      </Col>

      {/* Sidebar Widgets */}
      <Col lg={6} md={24}>
        <SidebarActions />
        <SidebarCategories />
      </Col>
    </Row>
  </div>
);

export default AddNewPost;
