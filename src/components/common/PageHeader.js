import BranchSelector from 'components/BranchSelector';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import PageTitle from './PageTitle';
import { DatePicker } from 'elements';
import DurationPicker from 'elements/DurationPicker';
import { useSelector } from 'react-redux';
import { usePermissions } from 'hooks/usePermissions';
import moment from 'moment';
import { isMobile } from 'react-device-detect';
import { Button } from 'elements';
import { TableOutlined } from '@ant-design/icons';

const PageHeader = ({
  title,
  subtitle,
  hasBranch,
  hasAllBranch,
  defaultBranch,
  hasDate,
  hasDuration,
  hasAllDate,
  defaultDuration,
  onChange,
  onMoreInfo,
  moreInfoTitle,
  moreInfoIcon,
  onlyUserBranch
}) => {
  const { user } = useSelector(state => state.auth);
  const { homeLocation, accessibleBranches } = usePermissions();
  const [form] = Form.useForm();

  // Get default branch from RBAC data
  const getDefaultBranch = () => {
    return homeLocation?.branch || 
           (accessibleBranches.length === 1 ? accessibleBranches[0] : null) || 
           user?.homeBranch || 
           (user?.allowedBranches?.[0]) || 
           '0450';
  };

  const _onValuesChange = headerChange => {
    onChange && onChange(headerChange);
  };
  return (
    <Form
      form={form}
      onValuesChange={_onValuesChange}
      initialValues={{
        branch: defaultBranch || user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
        date: moment(),
        duration: {
          start: moment().startOf('week').format('YYYY-MM-DD'),
          end: moment().format('YYYY-MM-DD')
        }
      }}
      //   size="small"
    >
      <Row noGutters className="page-header py-3">
        {/* Page Header :: Title */}
        {title && <PageTitle title={title} subtitle={subtitle} className="text-sm-left mb-3" />}
        {hasBranch && (
          <Col {...(!isMobile && { md: onMoreInfo ? '3' : '4' })} {...(!isMobile && { className: 'pt-3' })}>
            <Form.Item name="branch">
              <BranchSelector hasAll={hasAllBranch} onlyUserBranch={onlyUserBranch} />
            </Form.Item>
          </Col>
        )}
        {(hasDuration || hasDate) && (
          <Col {...(!isMobile && { md: onMoreInfo ? '3' : '4' })} {...(!isMobile && { className: 'pt-3' })}>
            {hasDuration ? (
              <Form.Item name="duration">
                <DurationPicker hasAll={hasAllDate} defaultDuration={defaultDuration} />
              </Form.Item>
            ) : (
              <Form.Item name="date">
                <DatePicker />
              </Form.Item>
            )}
          </Col>
        )}
        {onMoreInfo && (
          <Col
            {...(!isMobile && { md: '2' })}
            className={`d-flex flex-column align-items-end ${!isMobile ? ' mt-3' : ''}`}
          >
            <Button onClick={onMoreInfo} className="btn-white ml-2">
              {moreInfoTitle || 'ข้อมูลเพิ่มเติม'} {moreInfoIcon || <TableOutlined />}
            </Button>
          </Col>
        )}
      </Row>
    </Form>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  hasBranch: PropTypes.bool,
  hasAllBranch: PropTypes.bool,
  defaultBranch: PropTypes.string,
  hasDate: PropTypes.bool,
  hasDuration: PropTypes.bool,
  hasAllDate: PropTypes.bool,
  defaultDuration: PropTypes.object,
  onChange: PropTypes.func,
  onMoreInfo: PropTypes.func,
  moreInfoTitle: PropTypes.string,
  moreInfoIcon: PropTypes.node,
  onlyUserBranch: PropTypes.string
};

export default PageHeader;
