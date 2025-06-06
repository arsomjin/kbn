import React, { useCallback } from 'react';
import { Card, Row, Col, CardBody } from 'shards-react';
import { Form, Input as AInput, Modal } from 'antd';
import { showConfirm, load } from 'functions';
import { showSuccess } from 'functions';
import { showWarn } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { getEditArr } from 'utils';
import { useSelector } from 'react-redux';
import { NotificationIcon } from 'elements';
import { getChanges } from 'functions';

const ModalPageTemplate = ({ selectedData = {}, visible, onOk, onCancel, ...mProps }) => {
  const { user } = useSelector(state => state.auth);
  const { users } = useSelector(state => state.data);
  const grant = true;

  const [form] = Form.useForm();

  const onConfirm = useCallback(
    async mValues => {
      try {
        load(true);
        let newValues = cleanValuesBeforeSave(mValues);
        const oldValues = JSON.parse(JSON.stringify(selectedData));
        //  showLog({ newValues, oldValues });
        let changes = getChanges(oldValues, newValues);
        newValues.editedBy = !!selectedData.editedBy
          ? [...selectedData.editedBy, { uid: user.uid, time: Date.now(), changes }]
          : [{ uid: user.uid, time: Date.now(), changes }];
        load(false);
        showSuccess(
          () =>
            onOk &&
            onOk({
              ...selectedData,
              ...newValues
            }),
          'บันทึกข้อมูลสำเร็จ',
          true
        );
        // showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
      } catch (e) {
        showWarn(e);
        load(false);
      }
    },
    [onOk, selectedData, user.uid]
  );

  const onPreConfirm = useCallback(
    values => {
      showConfirm(() => onConfirm(values), `บันทึกรข้อมูลของ คุณ${values.dataId}`);
    },
    [onConfirm]
  );

  return (
    <Modal
      title="Title"
      visible={visible}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            onPreConfirm(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
      onCancel={onCancel}
      okText="บันทึก"
      cancelText="ปิด"
      width={isMobile ? w(92) : w(77)}
      style={{ left: isMobile ? 0 : w(7) }}
    >
      <Form
        form={form}
        onFinish={onPreConfirm}
        size="small"
        initialValues={{
          dataId: selectedData.dataId || null,
          remark: selectedData.remark || null
        }}
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
            <Card small className="mb-4">
              <HiddenItem name="dataId" />
              {values.editedBy && (
                <Row form className="mb-3 ml-2" style={{ alignItems: 'center' }}>
                  <NotificationIcon icon="edit" data={editData} badgeNumber={values.editedBy.length} theme="warning" />
                  <span className="ml-2 text-light">ประวัติการแก้ไขเอกสาร</span>
                </Row>
              )}
              <CardBody>
                <label className="text-light mb-2">ข้อมูลส่วนบุคคล</label>
                <Row>
                  {/* Remark */}
                  <Col md="12">
                    <Form.Item name="remark" label="หมายเหตุ">
                      <AInput.TextArea disabled={!grant} />
                    </Form.Item>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          );
        }}
      </Form>
    </Modal>
  );
};

export default ModalPageTemplate;
