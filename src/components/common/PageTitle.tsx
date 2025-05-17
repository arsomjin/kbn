import React from 'react';
import classNames from 'classnames';
import { Col } from 'antd';

interface PageTitleProps {
  title: string;
  subtitle: string;
  className?: string;
  editing?: boolean;
  [key: string]: any;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, className, editing, ...attrs }) => {
  const classes = classNames(className, 'text-center', 'text-md-left', 'mb-sm-0');

  return (
    <Col xs={12} sm={4} className={classes} {...attrs}>
      <span className="text-uppercase page-subtitle">{subtitle}</span>
      <h3 className={`page-title ${editing ? 'text-warning' : ''}`}>{title}</h3>
    </Col>
  );
};

export default PageTitle;
