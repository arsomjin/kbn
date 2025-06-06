import React, { useContext } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Form, Button, FormTextarea } from 'shards-react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { showLog } from 'functions';
import { showWarn } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { showSuccess } from 'functions';
import { useSelector, useDispatch } from 'react-redux';
import { setGiveaways } from 'redux/actions/data';
import { getChanges } from 'functions';
import { FInput } from 'Formiks';
import { showConfirm } from 'functions';
import { cleanNumberFields } from 'functions';

const GiveawaySchema = Yup.object().shape({
  giveawayName: Yup.string().required('กรุณาป้อนชื่อของแถม')
  // giveawayNo: Yup.string().required('กรุณาป้อนรหัส'),
});

const SettingGiveaway = ({ giveaway, onCancel, hideMain }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { giveaways } = useSelector(state => state.data);

  const dispatch = useDispatch();

  const grantGiveaway = user.isDev || (user.permissions && user.permissions.permission602);

  const _preConfirm = async values => {
    let mValues = cleanNumberFields(values, ['standardCost', 'listPrice']);
    showConfirm(() => _onConfirm(mValues), `ของแถม ${mValues.giveawayName}`);
  };

  const _onConfirm = async values => {
    try {
      //  showLog('values', values);
      const mGiveaways = JSON.parse(JSON.stringify(giveaways));
      if (giveaway._key) {
        await api.setGiveaway({ ...values, _key: giveaway._key });
        mGiveaways[giveaway._key] = { ...giveaway, ...values };
        dispatch(setGiveaways(mGiveaways));
      } else {
        await api.setGiveaway(values);
        await api.getGiveaways();
      }
      const oldValues = giveaway;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.giveawayName,
          changes
        },
        'giveaways',
        values.giveawayName
      );

      showSuccess(() => onCancel(), `บันทึกข้อมูล ของแถม ${values.giveawayName} สำเร็จ`);
      onCancel && onCancel();
      // alert('Done!');
    } catch (e) {
      showWarn(e);
    }
  };

  // {
  //   giveawayId: 'W955J-00020',
  //   giveawayNo: 'L5018DT153278',
  //   giveawayName: 'L5018',
  //   description: '',
  //   standardCost: 639929.5,
  //   listPrice: 744000,
  //   giveawayCategoryId: 'vh001',
  // }
  showLog('selected_giveaway', giveaway);
  return (
    <ListGroup flush>
      <ListGroupItem className="p-3">
        <Formik
          initialValues={{
            giveawayNo: giveaway.giveawayNo || '',
            giveawayName: giveaway.giveawayName || '',
            standardCost: giveaway.standardCost || '',
            listPrice: giveaway.listPrice || '',
            description: giveaway.description || '',
            remark: giveaway.remark || ''
          }}
          validationSchema={GiveawaySchema}
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
                    <label>ชื่อของแถม</label>
                    <FInput name="giveawayName" placeholder="ชื่อของแถม" disabled={!grantGiveaway} />
                  </Col>
                  <Col md="4" className="form-group">
                    <label>รหัส</label>
                    <FInput name="giveawayNo" placeholder="รหัส" disabled={!grantGiveaway} />
                  </Col>
                </Row>
                <Row form>
                  {/* <Col md="4" className="form-group">
                    <label>ราคาทุน</label>
                    <FInput
                      name="standardCost"
                      placeholder="ราคาทุน"
                      commaNumber
                      disabled={!grantGiveaway}
                    />
                  </Col> */}
                  <Col md="4" className="form-group">
                    <label>มูลค่า</label>
                    <FInput name="listPrice" placeholder="จำนวนเงิน" commaNumber disabled={!grantGiveaway} />
                  </Col>
                </Row>
                <Row form>
                  <Col md="8" className="form-group">
                    <label htmlFor="feInputCity">รายละเอียด</label>
                    <FormTextarea
                      name="description"
                      placeholder="รายละเอียด"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={!grantGiveaway}
                    />
                  </Col>
                </Row>
                {/* <Row form>
                  <Col md="4" className="form-group">
                    <label>หมวด</label>
                    <FSelect
                      name="giveawayCategoryId"
                      initialWords="หมวด"
                      disabled={!grantGiveaway}
                    >
                      <option>รถเกี่ยวแทรคเตอร์</option>
                      <option>รถเกี่ยวนวดข้าว</option>
                    </FSelect>
                  </Col>
                </Row> */}
                <Row form>
                  <Col className="form-group">
                    <label htmlFor="feInputCity">หมายเหตุ</label>
                    <FormTextarea
                      name="remark"
                      placeholder="หมายเหตุ"
                      value={values.remark}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={!grantGiveaway}
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

export default SettingGiveaway;
