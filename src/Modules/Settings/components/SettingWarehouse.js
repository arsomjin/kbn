import React, { useContext } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Form, FormInput, FormSelect, Button, FormTextarea } from 'shards-react';
import { Formik } from 'formik';
import { showWarn } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { showSuccess } from 'functions';
import { useSelector } from 'react-redux';
import { getChanges } from 'functions';
import { capitalizeFirstLetter } from 'functions';

const SettingWarehouse = ({ warehouse, onCancel, showLocation }) => {
  const { user } = useSelector(state => state.auth);
  const { locations } = useSelector(state => state.data);
  const { api } = useContext(FirebaseContext);

  const grantBranch = user.isDev || (user.permissions && user.permissions.permission602);

  const _onConfirm = async values => {
    try {
      //  showLog('values', values);
      await api.setWarehouse(values);
      const oldValues = warehouse;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.warehouseId,
          changes
        },
        'warehouses',
        values.warehouseId
      );

      await api.updateData('warehouses', values.warehouseId);

      showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
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
            warehouseId: warehouse.warehouseId || '',
            warehouseName: warehouse.warehouseName || '',
            locationId: warehouse.locationId || '',
            remark: warehouse.remark || ''
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
                  <label htmlFor="feReceiptNo">รหัสคลังสินค้า</label>
                  <FormInput
                    name="warehouseId"
                    placeholder="รหัสคลังสินค้า"
                    value={values.warehouseId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </Col>
              </Row>
              <Row form>
                <Col md="4" className="form-group">
                  <label htmlFor="feFirstName">ชื่อคลังสินค้า</label>
                  <FormInput
                    name="warehouseName"
                    placeholder="ชื่อคลังสินค้า"
                    value={values.warehouseName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                </Col>
              </Row>
              <Row form>
                <Col className="form-group">
                  <label htmlFor="fePrefix">สถานที่</label>
                  <Row>
                    <Col md="4">
                      <FormSelect name="locationId" value={values.locationId} onChange={handleChange} disabled>
                        {Object.keys(locations).map(k => (
                          <option value={k}>{capitalizeFirstLetter(k)}</option>
                        ))}
                      </FormSelect>
                    </Col>
                    <Button size="sm" className="btn-white ml-3 mt-2" onClick={() => showLocation()}>
                      ข้อมูลเพิ่มเติม &rarr;
                    </Button>
                  </Row>
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
                    disabled={!grantBranch}
                  />
                </Col>
              </Row>
              {/* <FormGroup>
                <label htmlFor="feInputAddress">หมายเหตุ</label>
                <FormInput id="feInputAddress" value="เงินโอน" />
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
          )}
        </Formik>
      </ListGroupItem>
    </ListGroup>
  );
};

export default SettingWarehouse;
