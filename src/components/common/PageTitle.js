import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Col } from 'antd';

const PageTitle = ({ title, subtitle, className, editing, ...attrs }) => {
  const classes = classNames(className, 'text-center', 'text-md-left', 'mb-sm-0');

  return (
    <Col xs="24" sm="12" md="12" lg="8" xl="6" className={classes} {...attrs}>
      <span className="text-uppercase page-subtitle">{subtitle}</span>
      <h3 className={`page-title ${!!editing ? 'text-warning' : ''}`}>{title}</h3>
    </Col>
  );
};

PageTitle.propTypes = {
  /**
   * The page title.
   */
  title: PropTypes.string,
  /**
   * The page subtitle.
   */
  subtitle: PropTypes.string
};

export default PageTitle;
