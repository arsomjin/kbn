import React, { useContext } from 'react';
import { Row, Col, Form, FormTextarea } from 'shards-react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { showWarn, showSuccess, getChanges, showConfirm, cleanNumberFields } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { useSelector } from 'react-redux';
import { FInput } from 'Formiks';
import { Modal } from 'antd';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import FSelect from 'Formiks/FSelect';
import { load } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { VehicleType } from 'data/Constant';

const VehicleModelSchema = Yup.object().shape({
  name: Yup.string().required('กรุณาป้อนชื่อรถ'),
  productType: Yup.string().required('กรุณาป้อนชื่อประเภท'),
  productCode: Yup.string().required('กรุณาป้อนรหัสสินค้า'),
  listPrice: Yup.string().required('กรุณาป้อนราคาสินค้า')
});

const SettingVehicleModel = ({ vehicleModel, visible, onFinish, onCancel, hideMain }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  const grantVehicleModel = true;
  // const grantVehicleModel =
  //   user.isDev || (user.permissions && user.permissions.permission602);

  const _preConfirm = async values => {
    //  showLog({ values });
    let mValues = cleanNumberFields(values, ['standardCost', 'listPrice']);
    showConfirm(() => _onConfirm(mValues), `รุ่น ${mValues.productCode}`);
  };

  const _onConfirm = async mValues => {
    try {
      // showLog({ mValues, vehicleModel });
      load(true);
      let values = cleanValuesBeforeSave(mValues);
      values.deleted = false;
      if (vehicleModel.productCode) {
        await api.setVehicleList({ ...values, _key: vehicleModel.productCode });
      } else {
        await api.setVehicleList(values);
      }

      const oldValues = vehicleModel;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.productCode,
          changes
        },
        'vehicleList',
        values.productCode
      );
      load(false);
      showSuccess(() => onFinish(), `บันทึกข้อมูล รุ่น ${values.productCode} สำเร็จ`);
      onFinish && onFinish();
      // alert('Done!');
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  return (
    <div className="p-3">
      <Formik
        initialValues={{
          productCode: vehicleModel.productCode || '',
          productType: vehicleModel.productType || 'รถแทรกเตอร์',
          model: vehicleModel.model || '',
          name: vehicleModel.name || '',
          wsPrice: vehicleModel.wsPrice || '',
          listPrice: vehicleModel.listPrice || '',
          creditTerm: vehicleModel.creditTerm || '',
          description: vehicleModel.description || '',
          remark: vehicleModel.remark || ''
        }}
        validationSchema={VehicleModelSchema}
        onSubmit={_preConfirm}
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
            <Modal
              title={values.name}
              visible={visible}
              onOk={handleSubmit}
              onCancel={onCancel}
              okText="บันทึก"
              cancelText="ยกเลิก"
              width={isMobile ? w(92) : w(77)}
              style={{ left: isMobile ? 0 : w(7) }}
            >
              <Form>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>รหัส</label>
                    <FInput
                      name="productCode"
                      placeholder="รหัสสินค้า (ควรเป็นตัวอักษรภาษาอังกฤษและตัวเลข)"
                      disabled={!grantVehicleModel}
                    />
                  </Col>
                  {/* <Col md="4" className="form-group">
                    <label>รุ่น</label>
                    <FInput
                      name="model"
                      placeholder="รุ่น"
                      // disabled={!grantVehicleModel}
                      disabled={!!vehicleModel.productCode}
                    />
                  </Col> */}
                </Row>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>ประเภท</label>
                    <FSelect name="productType" disabled={!grantVehicleModel}>
                      {VehicleType.map((type, i) => (
                        <option key={i}>{type}</option>
                      ))}
                    </FSelect>
                  </Col>
                  <Col md="8" className="form-group">
                    <label>ชื่อสินค้า</label>
                    <FInput name="name" placeholder="รถ" disabled={!grantVehicleModel} />
                  </Col>
                </Row>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>ราคาขายส่ง</label>
                    <FInput name="wsPrice" placeholder="ราคาขายส่ง" commaNumber disabled={!grantVehicleModel} />
                  </Col>
                  <Col md="4" className="form-group">
                    <label>ราคาขาย</label>
                    <FInput name="listPrice" placeholder="ราคาขาย" commaNumber disabled={!grantVehicleModel} />
                  </Col>
                  <Col md="4" className="form-group">
                    <label>เครดิต (วัน)</label>
                    <FInput name="creditTerm" placeholder="เครดิต (วัน)" commaNumber disabled={!grantVehicleModel} />
                  </Col>
                </Row>
                <Row form>
                  <Col md="6" className="form-group">
                    <label htmlFor="feInputCity">รายละเอียด</label>
                    <FormTextarea
                      name="description"
                      placeholder="รายละเอียด"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={!grantVehicleModel}
                    />
                  </Col>
                  <Col md="6" className="form-group">
                    <label htmlFor="feInputCity">หมายเหตุ</label>
                    <FormTextarea
                      name="remark"
                      placeholder="หมายเหตุ"
                      value={values.remark}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={!grantVehicleModel}
                    />
                  </Col>
                </Row>
                {/* <FormGroup>
                <label htmlFor="feInputAddress">หมายเหตุ</label>
                <TextInput id="feInputAddress" value="เงินโอน" />
              </FormGroup> */}
              </Form>
            </Modal>
          );
        }}
      </Formik>
    </div>
  );
};

export default SettingVehicleModel;
