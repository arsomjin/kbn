import React, { useContext } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Form, Button, FormTextarea } from 'shards-react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { showWarn } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { showSuccess } from 'functions';
import { useSelector, useDispatch } from 'react-redux';
import { setEquipmentLists } from 'redux/actions/data';
import { getChanges } from 'functions';
import { FInput } from 'Formiks';
import { showConfirm } from 'functions';
import { cleanNumberFields } from 'functions';

const EquipmentListSchema = Yup.object().shape({
  name: Yup.string().required('กรุณาป้อนชื่ออุปกรณ์'),
  equipmentName: Yup.string().required('กรุณาป้อนชื่อรุ่นอุปกรณ์')
  // equipmentNo: Yup.string().required('กรุณาป้อนรหัส'),
});

const SettingEquipmentList = ({ equipmentList, onCancel, hideMain }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { equipmentLists } = useSelector(state => state.data);

  const dispatch = useDispatch();

  const grantEquipmentList = user.isDev || (user.permissions && user.permissions.permission602);

  const _preConfirm = async values => {
    let mValues = cleanNumberFields(values, ['standardCost', 'listPrice']);
    showConfirm(() => _onConfirm(mValues), `รุ่น ${mValues.equipmentName}`);
  };

  const _onConfirm = async values => {
    try {
      //  showLog('values', values);
      const mEquipmentLists = JSON.parse(JSON.stringify(equipmentLists));
      if (equipmentList._key) {
        await api.setEquipmentList({ ...values, _key: equipmentList._key });
        mEquipmentLists[equipmentList._key] = { ...equipmentList, ...values };
        dispatch(setEquipmentLists(mEquipmentLists));
      } else {
        await api.setEquipmentList(values);
        await api.getEquipmentLists();
      }

      const oldValues = equipmentList;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.equipmentName,
          changes
        },
        'equipmentLists',
        values.equipmentName
      );

      showSuccess(() => onCancel(), `บันทึกข้อมูล รุ่น ${values.equipmentName} สำเร็จ`);
      onCancel && onCancel();
      // alert('Done!');
    } catch (e) {
      showWarn(e);
    }
  };

  // {
  //   equipmentListId: 'W955J-00020',
  //   equipmentNo: 'L5018DT153278',
  //   equipmentName: 'L5018',
  //   description: '',
  //   standardCost: 639929.5,
  //   listPrice: 744000,
  //   equipmentListCategoryId: 'vh001',
  // }

  return (
    <ListGroup flush>
      <ListGroupItem className="p-3">
        <Formik
          initialValues={{
            equipmentNo: equipmentList.equipmentNo || '',
            equipmentName: equipmentList.equipmentName || '',
            name: equipmentList.name || '',
            standardCost: equipmentList.standardCost || '',
            listPrice: equipmentList.listPrice || '',
            description: equipmentList.description || '',
            remark: equipmentList.remark || ''
          }}
          validationSchema={EquipmentListSchema}
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
                    <label>รุ่นอุปกรณ์</label>
                    <FInput name="equipmentName" placeholder="รุ่นอุปกรณ์" disabled={!grantEquipmentList} />
                  </Col>
                  <Col md="4" className="form-group">
                    <label>รหัส</label>
                    <FInput name="equipmentNo" placeholder="รหัส" disabled={!grantEquipmentList} />
                  </Col>
                </Row>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>อุปกรณ์</label>
                    <FInput name="name" placeholder="อุปกรณ์" disabled={!grantEquipmentList} />
                  </Col>

                  <Col md="8" className="form-group">
                    <label htmlFor="feInputCity">รายละเอียด</label>
                    <FormTextarea
                      name="description"
                      placeholder="รายละเอียด"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={!grantEquipmentList}
                    />
                  </Col>
                </Row>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>ราคาทุน</label>
                    <FInput name="standardCost" placeholder="ราคาทุน" commaNumber disabled={!grantEquipmentList} />
                  </Col>
                  <Col md="4" className="form-group">
                    <label>ราคาขาย</label>
                    <FInput name="listPrice" placeholder="ราคาขาย" commaNumber disabled={!grantEquipmentList} />
                  </Col>
                </Row>
                {/* <Row form>
                  <Col md="4" className="form-group">
                    <label>หมวด</label>
                    <FSelect
                      name="equipmentListCategoryId"
                      initialWords="หมวด"
                      disabled={!grantEquipmentList}
                    >
                      <option>อุปกรณ์เกี่ยวแทรคเตอร์</option>
                      <option>อุปกรณ์เกี่ยวนวดข้าว</option>
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
                      disabled={!grantEquipmentList}
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

export default SettingEquipmentList;
