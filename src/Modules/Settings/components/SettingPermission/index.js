import React, { useContext, useEffect, useState, useCallback } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Form, FormCheckbox, Button } from 'shards-react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik } from 'formik';
import { showWarn } from 'functions';
import { FirebaseContext } from '../../../../firebase';
import { showSuccess } from 'functions';
import Load from 'elements/Load';
import { showActionSheet } from 'functions';
import { setUserGroups } from 'redux/actions/data';
import { getPermCatFromPermissions } from 'functions';
import { showGrantDenied } from 'functions';
import { getChanges } from 'functions';

const SettingPermission = ({ onCancel, userGroup }) => {
  const { theme } = useSelector(state => state.global);
  const { user } = useSelector(state => state.auth);
  const { userGroups, permissions, permissionCategories } = useSelector(state => state.data);
  const { api } = useContext(FirebaseContext);
  const [groupPermissions, setGroupPermissions] = useState({});
  const [ready, setReady] = useState(false);

  const dispatch = useDispatch();

  const getDefaultUserGroupPermissions = useCallback(() => {
    let mPermissions = {};
    Object.keys(permissions).map(key => {
      mPermissions[key] = false;
      return key;
    });
    return mPermissions;
  }, [permissions]);

  useEffect(() => {
    api.getPermissionCategories();
    api.getPermissions();
    window.scrollTo(0, 100);
    return () => window.scrollTo(0, 100);
  }, [api]);

  useEffect(() => {
    if (userGroup.permissions) {
      setGroupPermissions(userGroup.permissions);
    } else {
      let mPermissions = getDefaultUserGroupPermissions();
      setGroupPermissions(mPermissions);
    }
    setReady(true);
  }, [getDefaultUserGroupPermissions, userGroup.permissions]);

  const _onPreConfirm = async values => {
    try {
      // showLog('values', values);
      showActionSheet(
        () => _onConfirm(values),
        'ยืนยัน?',
        `บันทึกข้อมูลการกำหนดสิทธิ์ของ กลุ่ม ${userGroup.userGroupName}`
      );
    } catch (e) {
      showWarn(e);
    }
  };

  const _onConfirm = async values => {
    try {
      let mUserGroups = JSON.parse(JSON.stringify(userGroups));
      let mUserGroup = JSON.parse(JSON.stringify(userGroup));
      let permCats = getPermCatFromPermissions(values, permissionCategories);
      const oldValues = JSON.parse(JSON.stringify(userGroup.permissions));
      mUserGroup.permissions = values;
      mUserGroup.permCats = permCats;
      mUserGroups[mUserGroup.userGroupId] = mUserGroup;
      // Update firestore
      await api.setUserGroup(mUserGroup);
      // Update redux store
      dispatch(setUserGroups(mUserGroups));
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: mUserGroup.userGroupId,
          changes
        },
        'userGroups',
        mUserGroup.userGroupId
      );
      await api.updateData('userGroups', mUserGroup.userGroupId);

      showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
      onCancel && onCancel();
    } catch (e) {
      showWarn(e);
    }
  };

  if (!ready) {
    return <Load loading />;
  }

  const grantEditUser = user.isDev || (user.permissions && user.permissions.permission614);

  const {
    permission101,
    permission201,
    permission202,
    permission203,
    permission204,
    permission205,
    permission206,
    permission207,
    permission208,
    permission209,
    permission210,
    permission212,
    permission301,
    permission302,
    permission303,
    permission304,
    permission401,
    permission402,
    permission403,
    permission404,
    permission501,
    permission502,
    permission503,
    permission504,
    permission601,
    permission602,
    permission605,
    permission606,
    permission609,
    permission610,
    permission613,
    permission614,
    permission701,
    permission702,
    permission703,
    permission704,
    permission801,
    permission802,
    permission803,
    permission804,
    permission805,
    permission806
  } = groupPermissions;

  return (
    <ListGroup flush>
      <ListGroupItem className="p-3">
        <Formik
          initialValues={{
            permission101,
            permission201,
            permission202,
            permission203,
            permission204,
            permission205,
            permission206,
            permission207,
            permission208,
            permission209,
            permission210,
            permission212,
            permission301,
            permission302,
            permission303,
            permission304,
            permission401,
            permission402,
            permission403,
            permission404,
            permission501,
            permission502,
            permission503,
            permission504,
            permission601,
            permission602,
            permission605,
            permission606,
            permission609,
            permission610,
            permission613,
            permission614,
            permission701: typeof permission701 !== 'undefined' ? permission701 : false,
            permission702: typeof permission702 !== 'undefined' ? permission702 : false,
            permission703: typeof permission703 !== 'undefined' ? permission703 : false,
            permission704: typeof permission704 !== 'undefined' ? permission704 : false,
            permission801: typeof permission801 !== 'undefined' ? permission801 : false,
            permission802: typeof permission802 !== 'undefined' ? permission802 : false,
            permission803: typeof permission803 !== 'undefined' ? permission803 : false,
            permission804: typeof permission804 !== 'undefined' ? permission804 : false,
            permission805: typeof permission805 !== 'undefined' ? permission805 : false,
            permission806: typeof permission806 !== 'undefined' ? permission806 : false
          }}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              // alert(JSON.stringify(values, null, 2));
              _onPreConfirm(values);
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
            isSubmitting,
            setFieldValue
            /* and other goodies */
          }) => (
            <Form>
              <label className="text-primary">Dashboard</label>
              <Row
                form
                style={{
                  backgroundColor: theme.colors.background,
                  padding: '10px'
                }}
              >
                <FormCheckbox
                  disabled={!grantEditUser}
                  toggle
                  small
                  name="permission101"
                  checked={values.permission101}
                  onChange={() =>
                    grantEditUser ? setFieldValue('permission101', !values.permission101) : showGrantDenied()
                  }
                >
                  ดูรายการ
                </FormCheckbox>
              </Row>
              <label className="text-primary" style={{ paddingTop: '20px' }}>
                บัญชี
              </label>
              <Row
                form
                style={{
                  backgroundColor: theme.colors.background,
                  padding: '10px'
                }}
              >
                <Col sm="12" md="4" className="mb-3">
                  <strong className="text-success d-block mb-2">บัญชีรายรับ</strong>
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission201"
                      checked={values.permission201}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission201', !values.permission201) : showGrantDenied()
                      }
                    >
                      ดูรายการ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission202"
                      checked={values.permission202}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission202', !values.permission202) : showGrantDenied()
                      }
                    >
                      เพิ่ม/แก้ไข/ลบ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission203"
                      checked={values.permission203}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission203', !values.permission203) : showGrantDenied()
                      }
                    >
                      ตรวจสอบ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission204"
                      checked={values.permission204}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission204', !values.permission204) : showGrantDenied()
                      }
                    >
                      อนุมัติ
                    </FormCheckbox>
                  </fieldset>
                </Col>
                <Col sm="12" md="4" className="mb-3">
                  <strong className="text-success d-block mb-2">บัญชีรายจ่าย</strong>
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission205"
                      checked={values.permission205}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission205', !values.permission205) : showGrantDenied()
                      }
                    >
                      ดูรายการ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission206"
                      checked={values.permission206}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission206', !values.permission206) : showGrantDenied()
                      }
                    >
                      เพิ่ม/แก้ไข/ลบ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission207"
                      checked={values.permission207}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission207', !values.permission207) : showGrantDenied()
                      }
                    >
                      ตรวจสอบ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission208"
                      checked={values.permission208}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission208', !values.permission208) : showGrantDenied()
                      }
                    >
                      อนุมัติ
                    </FormCheckbox>
                  </fieldset>
                </Col>
                <Col sm="12" md="4" className="mb-3">
                  <strong className="text-success d-block mb-2">อื่นๆ</strong>
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission209"
                      checked={values.permission209}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission209', !values.permission209) : showGrantDenied()
                      }
                    >
                      ดูรายการ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission210"
                      checked={values.permission210}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission210', !values.permission210) : showGrantDenied()
                      }
                    >
                      เพิ่ม/แก้ไข/ลบ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission211"
                      checked={values.permission211}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission211', !values.permission211) : showGrantDenied()
                      }
                    >
                      ตรวจสอบ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission212"
                      checked={values.permission212}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission212', !values.permission212) : showGrantDenied()
                      }
                    >
                      อนุมัติ
                    </FormCheckbox>
                  </fieldset>
                </Col>
              </Row>
              <label className="text-primary" style={{ paddingTop: '20px' }}>
                งานขายและบริการ
              </label>
              <Row
                form
                style={{
                  backgroundColor: theme.colors.background,
                  padding: '10px'
                }}
              >
                <Col sm="12" md="6" className="mb-3">
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission301"
                      checked={values.permission301}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission301', !values.permission301) : showGrantDenied()
                      }
                    >
                      ดูรายการ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission302"
                      checked={values.permission302}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission302', !values.permission302) : showGrantDenied()
                      }
                    >
                      เพิ่ม/ลบ/แก้ไข
                    </FormCheckbox>
                  </fieldset>
                </Col>
                <Col sm="12" md="6" className="mb-3">
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission303"
                      checked={values.permission303}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission303', !values.permission303) : showGrantDenied()
                      }
                    >
                      ตรวจสอบ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission304"
                      checked={values.permission304}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission304', !values.permission304) : showGrantDenied()
                      }
                    >
                      อนุมัติ
                    </FormCheckbox>
                  </fieldset>
                </Col>
              </Row>
              <label className="text-primary" style={{ paddingTop: '20px' }}>
                คลังสินค้า
              </label>
              <Row
                form
                style={{
                  backgroundColor: theme.colors.background,
                  padding: '10px'
                }}
              >
                <Col sm="12" md="6" className="mb-3">
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission401"
                      checked={values.permission401}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission401', !values.permission401) : showGrantDenied()
                      }
                    >
                      ดูรายการ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission402"
                      checked={values.permission402}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission402', !values.permission402) : showGrantDenied()
                      }
                    >
                      เพิ่ม/ลบ/แก้ไข
                    </FormCheckbox>
                  </fieldset>
                </Col>
                <Col sm="12" md="6" className="mb-3">
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission403"
                      checked={values.permission403}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission403', !values.permission403) : showGrantDenied()
                      }
                    >
                      ตรวจสอบ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission404"
                      checked={values.permission404}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission404', !values.permission404) : showGrantDenied()
                      }
                    >
                      อนุมัติ
                    </FormCheckbox>
                  </fieldset>
                </Col>
              </Row>
              <label className="text-primary" style={{ paddingTop: '20px' }}>
                สินเชื่อ
              </label>
              <Row
                form
                style={{
                  backgroundColor: theme.colors.background,
                  padding: '10px'
                }}
              >
                <Col sm="12" md="6" className="mb-3">
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission501"
                      checked={values.permission501}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission501', !values.permission501) : showGrantDenied()
                      }
                    >
                      ดูรายการ ข้อมูลสินเชื่อ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission502"
                      checked={values.permission502}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission502', !values.permission502) : showGrantDenied()
                      }
                    >
                      เพิ่ม/ลบ/แก้ไข ข้อมูลสินเชื่อ
                    </FormCheckbox>
                  </fieldset>
                </Col>
                <Col sm="12" md="6" className="mb-3">
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission503"
                      checked={values.permission503}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission503', !values.permission503) : showGrantDenied()
                      }
                    >
                      ตรวจสอบ ข้อมูลสินเชื่อ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission504"
                      checked={values.permission504}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission504', !values.permission504) : showGrantDenied()
                      }
                    >
                      อนุมัติ ข้อมูลสินเชื่อ
                    </FormCheckbox>
                  </fieldset>
                </Col>
              </Row>
              <label className="text-primary" style={{ paddingTop: '20px' }}>
                รายงาน
              </label>
              <Row
                form
                style={{
                  backgroundColor: theme.colors.background,
                  padding: '10px'
                }}
              >
                <Col sm="12" md="6" className="mb-3">
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission801"
                      checked={values.permission801}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission801', !values.permission801) : showGrantDenied()
                      }
                    >
                      ดูรายงาน บัญชี
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission802"
                      checked={values.permission802}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission802', !values.permission802) : showGrantDenied()
                      }
                    >
                      ดูรายงาน งานขาย
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission805"
                      checked={values.permission805}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission805', !values.permission805) : showGrantDenied()
                      }
                    >
                      ดูรายงาน สินเชื่อ
                    </FormCheckbox>
                  </fieldset>
                </Col>
                <Col sm="12" md="6" className="mb-3">
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission803"
                      checked={values.permission803}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission803', !values.permission803) : showGrantDenied()
                      }
                    >
                      ดูรายงาน งานบริการ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission804"
                      checked={values.permission804}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission804', !values.permission804) : showGrantDenied()
                      }
                    >
                      ดูรายงาน คลังสินค้า
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission806"
                      checked={values.permission806}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission806', !values.permission806) : showGrantDenied()
                      }
                    >
                      ดูรายงาน บุคคล
                    </FormCheckbox>
                  </fieldset>
                </Col>
              </Row>
              <label className="text-primary" style={{ paddingTop: '20px' }}>
                ผู้ใช้งาน
              </label>
              <Row
                form
                style={{
                  backgroundColor: theme.colors.background,
                  padding: '10px'
                }}
              >
                <Col sm="12" md="6" className="mb-3">
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission701"
                      checked={values.permission701}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission701', !values.permission701) : showGrantDenied()
                      }
                    >
                      ดูรายการ ข้อมูลผู้ใช้งาน
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission702"
                      checked={values.permission702}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission702', !values.permission702) : showGrantDenied()
                      }
                    >
                      เพิ่ม/ลบ/แก้ไข ข้อมูลผู้ใช้งาน
                    </FormCheckbox>
                  </fieldset>
                </Col>
                <Col sm="12" md="6" className="mb-3">
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission703"
                      checked={values.permission703}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission703', !values.permission703) : showGrantDenied()
                      }
                    >
                      ตรวจสอบ ข้อมูลผู้ใช้งาน
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission704"
                      checked={values.permission704}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission704', !values.permission704) : showGrantDenied()
                      }
                    >
                      อนุมัติ ข้อมูลผู้ใช้งาน
                    </FormCheckbox>
                  </fieldset>
                </Col>
              </Row>
              <label className="text-primary" style={{ paddingTop: '20px' }}>
                การตั้งค่า
              </label>
              <Row
                form
                style={{
                  backgroundColor: theme.colors.background,
                  padding: '10px'
                }}
              >
                <Col sm="12" md="6" className="mb-3">
                  <strong className="text-success d-block mb-2">ข้อมูลสาขา</strong>
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission601"
                      checked={values.permission601}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission601', !values.permission601) : showGrantDenied()
                      }
                    >
                      ดูรายการ ข้อมูลสาขา
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission602"
                      checked={values.permission602}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission602', !values.permission602) : showGrantDenied()
                      }
                    >
                      เพิ่ม/แก้ไข/ลบ ข้อมูลสาขา
                    </FormCheckbox>
                  </fieldset>
                </Col>
                <Col sm="12" md="6" className="mb-3">
                  <strong className="text-success d-block mb-2">สิทธิ์การเข้าถึงข้อมูลผู้ใช้งาน</strong>
                  <fieldset>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission613"
                      checked={values.permission613}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission613', !values.permission613) : showGrantDenied()
                      }
                    >
                      ดูรายการ
                    </FormCheckbox>
                    <FormCheckbox
                      disabled={!grantEditUser}
                      toggle
                      small
                      name="permission614"
                      checked={values.permission614}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission614', !values.permission614) : showGrantDenied()
                      }
                    >
                      เปลี่ยนแปลงสิทธิ์
                    </FormCheckbox>
                  </fieldset>
                </Col>
              </Row>
              {/* <Row
                form
                style={{
                  backgroundColor: theme.colors.background,
                  padding: '10px',
                }}
              >
                <Col sm="12" md="6" className="mb-3">
                  <strong className="text-success d-block mb-2">
                    ข้อมูลรถแทรคเตอร์
                  </strong>
                  <fieldset>
                    <FormCheckbox
                    disabled={!grantEditUser}
                      toggle
                      small
                      name="permission605"
                      checked={values.permission605}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission605', !values.permission605)
                      }
                    : showGrantDenied()
                      >
                      ดูรายการ ข้อมูลรถแทรคเตอร์
                    </FormCheckbox>
                    <FormCheckbox
                    disabled={!grantEditUser}
                      toggle
                      small
                      name="permission606"
                      checked={values.permission606}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission606', !values.permission606)
                      }
                    : showGrantDenied()
                      >
                      เพิ่ม/แก้ไข/ลบ ข้อมูลรถแทรคเตอร์
                    </FormCheckbox>
                  </fieldset>
                </Col>
                <Col sm="12" md="6" className="mb-3">
                  <strong className="text-success d-block mb-2">อะไหล่</strong>
                  <fieldset>
                    <FormCheckbox
                    disabled={!grantEditUser}
                      toggle
                      small
                      name="permission609"
                      checked={values.permission609}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission609', !values.permission609)
                      }
                    : showGrantDenied()
                      >
                      ดูรายการ อะไหล่
                    </FormCheckbox>
                    <FormCheckbox
                    disabled={!grantEditUser}
                      toggle
                      small
                      name="permission610"
                      checked={values.permission610}
                      onChange={() =>
                        grantEditUser ? setFieldValue('permission610', !values.permission610)
                      }
                    : showGrantDenied()
                      >
                      เพิ่ม/แก้ไข/ลบ อะไหล่
                    </FormCheckbox>
                  </fieldset>
                </Col>
              </Row> */}
              <Row style={{ justifyContent: 'flex-end', marginTop: '20px' }} form>
                <Button onClick={onCancel} className="btn-white mr-3">
                  ยกเลิก
                </Button>
                <Button
                  theme="accent"
                  onClick={handleSubmit}
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

export default SettingPermission;
