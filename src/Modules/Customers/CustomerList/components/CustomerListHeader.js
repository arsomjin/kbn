import BranchSelector from 'components/BranchSelector';
import React, { useRef } from 'react';
import { Row, Col } from 'shards-react';
import { Form, Input } from 'antd';
import { useSelector } from 'react-redux';
import { showLog } from 'functions';
import PageTitle from 'components/common/PageTitle';
import { isMobile } from 'react-device-detect';
const { Search } = Input;

export default ({ title, subtitle, onChange, hideBranch }) => {
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();

  let valuesRef = useRef({
    branch: user?.branch || '0450',
    searchText: ''
  });

  const _onValuesChange = headerChange => {
    let vChange = { ...valuesRef.current, ...headerChange };
    valuesRef.current = vChange;
    onChange && onChange(vChange);
  };

  const _onSearch = valueSearch => showLog({ valueSearch });

  return (
    <Form
      form={form}
      onValuesChange={_onValuesChange}
      initialValues={{
        branch: user?.branch || '0450',
        searchText: ''
      }}
    >
      {values => {
        // showLog({ values });
        return (
          <Row noGutters className="page-header pt-3">
            {/* Page Header :: Title */}
            {title && <PageTitle title={title} subtitle={subtitle} className="text-sm-left mb-3" />}
            {!hideBranch && (
              <Col {...(!isMobile && { className: 'pt-3' })}>
                <Form.Item name="branch">
                  <BranchSelector hasAll />
                </Form.Item>
              </Col>
            )}
            <Col {...(!isMobile && { className: 'pt-3' })}>
              <Form.Item name="searchText">
                <Search placeholder="ชื่อลูกค้า, นามสกุล, เบอร์โทร" onSearch={_onSearch} />
              </Form.Item>
              {/* <SearchSelect
                id={'displayName'}
                // id={'firstName'}
                type={'text'}
                placeholder="ชื่อลูกค้า, นามสกุล, เบอร์โทร"
                onChange={(val) => {
                //  showLog('selected', val);
                  form.setFieldsValue({
                    customerId: val.value,
                  });
                  onChange && onChange({ customerId: val.value });
                }}
                options={customerOptions}
                // onInputChange={(txt) => showLog('txt', txt)}
                defaultValue={customerOptions.filter(
                  (l) => l.value === values.customerId
                )}
              /> */}
            </Col>
          </Row>
        );
      }}
    </Form>
  );
};
