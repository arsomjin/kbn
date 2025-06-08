import { Form } from 'antd';
import { useMergeState } from 'api/CustomHooks';
import HiddenItem from 'components/HiddenItem';
import { NotificationIcon } from 'elements';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col } from 'shards-react';
import { getEditArr } from 'utils';
import ExpenseHeader from '../expense-header';
import { getInitValues } from './api';

export default ({ order, onConfirm, onBack, isEdit, readOnly, reset }) => {
  const { user } = useSelector(state => state.auth);
  const { users } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const history = useHistory();

  const [nProps, setProps] = useMergeState({
    readOnly,
    onBack,
    isEdit
  });

  useEffect(() => {
    setProps({
      readOnly,
      onBack,
      isEdit
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, onBack, readOnly]);

  const grant = true;

  const _onValuesChange = val => {};

  const _onPreConfirm = values => {};

  return (
    <div className="bg-white px-3 py-3">
      <Form
        form={form}
        onFinish={_onPreConfirm}
        onValuesChange={_onValuesChange}
        initialValues={{
          ...getInitValues(nProps.order),
          branchCode: nProps.order?.branchCode || user.homeBranch || (user?.allowedBranches?.[0]) || '0450'
        }}
        size="small"
        layout="vertical"
      >
        {values => {
          //  showLog({ values });
          let editData = [];
          if (values.editedBy) {
            editData = getEditArr(values.editedBy, users);
            // showLog('mapped_data', editData);
          }
          return (
            <>
              <HiddenItem name="docId" />
              <HiddenItem name="changeDeposit" />
              <Row form>
                <Col md="8">
                  <ExpenseHeader disabled={!grant || readOnly} disableAllBranches />
                </Col>
              </Row>
              {values.editedBy && (
                <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                  <NotificationIcon icon="edit" data={editData} badgeNumber={values.editedBy.length} theme="warning" />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
            </>
          );
        }}
      </Form>
    </div>
  );
};
