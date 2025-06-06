import React, { useContext } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Form, Button, FormTextarea } from 'shards-react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { showWarn } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { showSuccess } from 'functions';
import { useSelector, useDispatch } from 'react-redux';
import { setBanks } from 'redux/actions/data';
import { getChanges } from 'functions';
import { FInput } from 'Formiks';
import { showConfirm } from 'functions';
import FSelect from 'Formiks/FSelect';

const BankSchema = Yup.object().shape({
  name: Yup.string().required('กรุณาป้อนชื่อบัญชี'),
  accNo: Yup.string()
    .test('test-name', 'กรุณาตรวจสอบเลขที่บัญชี', val => val && val.length === 10)
    .required('กรุณาป้อนเลขที่บัญชี'),
  bankName: Yup.string().required('กรุณาป้อนชื่อธนาคาร')
});

const SettingBank = ({ bank, onCancel, hideMain }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { banks } = useSelector(state => state.data);

  const dispatch = useDispatch();

  const grantBank = user.isDev || (user.permissions && user.permissions.permission602);

  const _preConfirm = async values => {
    showConfirm(() => _onConfirm(values), `ธนาคาร ${values.bankName}`);
  };

  const _onConfirm = async values => {
    try {
      //  showLog('values', values);
      const mBanks = JSON.parse(JSON.stringify(banks));
      if (bank._key) {
        await api.setBank({ ...values, _key: bank._key });
        mBanks[bank._key] = { ...bank, ...values };
        dispatch(setBanks(mBanks));
      } else {
        await api.setBank(values);
        await api.getBanks();
      }
      await api.updateData('banks', values.accNo);
      const oldValues = bank;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.accNo,
          changes
        },
        'banks',
        values.accNo
      );

      showSuccess(() => onCancel(), `บันทึกข้อมูล ธนาคาร ${values.bankName} สำเร็จ`);
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
            accNo: bank.accNo || '',
            name: bank.name || '',
            bankName: bank.bankName || '',
            branch: bank.branch || '',
            remark: bank.remark || ''
          }}
          validationSchema={BankSchema}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              // alert(JSON.stringify(values, null, 2));
              _preConfirm(values);
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
          }) => {
            //  showLog({ values, errors });
            return (
              <Form>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>ชื่อบัญชี</label>
                    <FInput name="name" placeholder="ชื่อบัญชี" disabled={!grantBank} />
                  </Col>
                </Row>

                <Row form>
                  {/* First Name */}
                  <Col md="4" className="form-group">
                    <label>เลขที่บัญชี</label>
                    <FInput name="accNo" placeholder="เลขที่บัญชี" disabled={!grantBank} />
                  </Col>
                </Row>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>ชื่อธนาคาร</label>
                    <FSelect name="bankName" initialWords="ธนาคาร" disabled={!grantBank}>
                      <option>กรุงเทพ</option>
                      <option>กสิกรไทย</option>
                      <option>ไทยพาณิชย์</option>
                      <option>ทหารไทย</option>
                      <option>กรุงศรีอยุธยา</option>
                    </FSelect>
                  </Col>
                </Row>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>สาขา</label>
                    <FInput name="branch" placeholder="สาขา" disabled={!grantBank} />
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
                      disabled={!grantBank}
                    />
                  </Col>
                </Row>
                {/* <FormGroup>
                <label htmlFor="feInputAddress">หมายเหตุ</label>
                <TextInput id="feInputAddress" value="เงินโอน" />
              </FormGroup> */}
                <Row style={{ justifyContent: 'flex-end' }} form>
                  <Button className="btn-white mr-3" onClick={onCancel}>
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
            );
          }}
        </Formik>
      </ListGroupItem>
    </ListGroup>
  );
};

export default SettingBank;
