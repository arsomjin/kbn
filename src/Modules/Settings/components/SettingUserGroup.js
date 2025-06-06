import React, { useContext } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Form, FormInput, Button, FormTextarea } from 'shards-react';
import { Formik } from 'formik';
import { showWarn } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { showSuccess } from 'functions';
import { useSelector } from 'react-redux';
import { getChanges } from 'functions';

const SettingUserGroup = ({ userGroup, onCancel, showPermissions }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { userGroups } = useSelector(state => state.data);

  const _onConfirm = async values => {
    try {
      //  showLog('values', values);
      let mUserGroup = JSON.parse(JSON.stringify(userGroups[userGroup.userGroupId]));
      mUserGroup = { ...mUserGroup, ...values };
      await api.setUserGroup(mUserGroup);
      const oldValues = userGroup;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.userGroupId,
          changes
        },
        'userGroups',
        values.userGroupId
      );

      await api.updateData('userGroups', values.userGroupId);
      showSuccess(() => onCancel(), `บันทึกข้อมูล กลุ่ม ${userGroup.userGroupName} สำเร็จ`);
      onCancel && onCancel();
      // alert('Done!');
    } catch (e) {
      showWarn(e);
    }
  };
  return (
    <ListGroup flush>
      <ListGroupItem className="p-3">
        <Formik
          initialValues={{
            userGroupId: userGroup.userGroupId || '',
            userGroupName: userGroup.userGroupName || '',
            remark: userGroup.remark || ''
          }}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              // alert(JSON.stringify(values, null, 2));
              _onConfirm(values);
              setSubmitting(false);
            }, 400);
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
            /* and other goodies */
          }) => (
            <Form>
              <Row form>
                {/* First Name */}
                <Col md="3" className="form-group">
                  <label htmlFor="feReceiptNo">รหัสกลุ่มผู้ใช้งาน</label>
                  <FormInput
                    name="userGroupId"
                    placeholder="รหัสกลุ่มผู้ใช้งาน"
                    value={values.userGroupId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </Col>
                <Col md="4" className="form-group">
                  <label htmlFor="feFirstName">ชื่อกลุ่ม</label>
                  <FormInput
                    name="userGroupName"
                    placeholder="ชื่อกลุ่ม"
                    value={values.userGroupName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </Col>
              </Row>
              <Row form></Row>
              <Row form>
                <Col className="form-group">
                  <label htmlFor="feLastName">สิทธิ์การเข้าถึง</label>
                  <Button
                    // size="lg"
                    className="d-flex btn-white "
                    onClick={showPermissions}
                  >
                    กำหนดสิทธิ์การเข้าถึงข้อมูล &rarr;
                  </Button>
                </Col>
              </Row>
              <Row form>
                <Col className="form-group">
                  <label htmlFor="feInputCity">หมายเหตุ</label>
                  <FormTextarea
                    name="remark"
                    placeholder="หมายเหตุ"
                    value={values.remark}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows="5"
                  />
                </Col>
              </Row>
              {/* <FormGroup>
                <label htmlFor="feInputAddress">หมายเหตุ</label>
                <FormInput id="feInputAddress" value="เงินโอน" />
              </FormGroup> */}
              <Row style={{ justifyContent: 'flex-end' }} form>
                <Button onClick={onCancel} className="btn-white mr-3">
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSubmit}
                  theme="accent"
                  // className="d-flex ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0"
                >
                  บันทึก
                </Button>
              </Row>
            </Form>
          )}
        </Formik>
      </ListGroupItem>
    </ListGroup>
  );
};

export default SettingUserGroup;
