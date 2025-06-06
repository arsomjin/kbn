import React, { useCallback, useEffect } from 'react';
import { Card, Row, CardBody } from 'shards-react';
import { Form, Modal } from 'antd';
import { showConfirm, load, showWarn, cleanValuesBeforeSave, getChanges } from 'functions';
import HiddenItem from 'components/HiddenItem';
import { isMobile } from 'react-device-detect';
import { w, renderInput } from './api';
import { getEditArr } from 'utils';
import { useSelector } from 'react-redux';
import { NotificationIcon, Button } from 'elements';
import { getNameFromEmployeeCode } from 'Modules/Utils';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

export default ({ selectedData = {}, visible, onOk, onCancel, POSITIONS, grant, ...mProps }) => {
  const { user } = useSelector(state => state.auth);
  const { users, employees } = useSelector(state => state.data);

  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(selectedData);
  }, [form, selectedData]);

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
        onOk &&
          onOk({
            ...selectedData,
            ...newValues
          });
      } catch (e) {
        showWarn(e);
        load(false);
      }
    },
    [onOk, selectedData, user.uid]
  );

  const onPreConfirm = useCallback(
    values => {
      showConfirm(
        () => onConfirm(values),
        `บันทึกข้อมูลของ ${getNameFromEmployeeCode({
          employeeCode: values.employeeId,
          employees
        })}`
      );
    },
    [employees, onConfirm]
  );

  const onDeleteConfirm = useCallback(() => {
    showConfirm(
      () => onConfirm({ ...selectedData, deleted: true }),
      `ลบรายการของ ${getNameFromEmployeeCode({
        employeeCode: selectedData.employeeId,
        employees
      })}`
    );
  }, [employees, onConfirm, selectedData]);

  if (!visible) {
    return null;
  }

  let buttons = [
    <Button key="close" onClick={() => onCancel()}>
      ยกเลิก
    </Button>,
    <Button key="delete" icon={<CloseOutlined />} type="danger" onClick={() => onDeleteConfirm()}>
      ลบ
    </Button>,
    <Button
      key="ok"
      icon={<CheckOutlined />}
      onClick={() => {
        form
          .validateFields()
          .then(values => {
            onPreConfirm(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
      type="primary"
    >
      บันทึก
    </Button>
  ];

  return (
    <Modal
      title={`แก้ไขข้อมูลการลางาน ${getNameFromEmployeeCode({
        employeeCode: selectedData.employeeId,
        employees
      })}`}
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
      footer={buttons}
      width={isMobile ? w(92) : w(77)}
      style={{ left: isMobile ? 0 : w(7) }}
      destroyOnClose
    >
      <Form form={form} onFinish={onPreConfirm} size="small" initialValues={selectedData} layout="vertical">
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
              <CardBody>{renderInput(values)}</CardBody>
            </Card>
          );
        }}
      </Form>
    </Modal>
  );
};
