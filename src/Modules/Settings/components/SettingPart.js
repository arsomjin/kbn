import React, { useContext } from 'react';
import { Row, Col, Form, FormTextarea } from 'shards-react';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { showLog, showWarn, showSuccess, getChanges, showConfirm, cleanNumberFields } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { useSelector } from 'react-redux';
import { FInput } from 'Formiks';
import { Modal } from 'antd';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import FSelect from 'Formiks/FSelect';
import { load } from 'functions';
import { cleanValuesBeforeSave } from 'functions';
import { Numb } from 'functions';

const PartSchema = Yup.object().shape({
  name: Yup.string().required('กรุณาป้อนชื่อรถ'),
  partType: Yup.string().required('กรุณาป้อนชื่อประเภท'),
  pCode: Yup.string().required('กรุณาป้อนรหัสสินค้า'),
  slp: Yup.string().required('กรุณาป้อนราคาสินค้า')
});

const SettingPart = ({ partModel, visible, onCancel, hideMain }) => {
  showLog({ partModel });
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  const grantPart = true;
  // const grantPart =
  //   user.isDev || (user.permissions && user.permissions.permission602);

  const _preConfirm = async values => {
    //  showLog({ values });
    let mValues = { ...partModel, ...values };
    mValues = cleanNumberFields(mValues, ['standardCost', 'slp']);
    let slp_no_vat = (Number(mValues.slp) / 1.07).toFixed(2);
    mValues.slp_no_vat = Numb(slp_no_vat);
    showConfirm(() => _onConfirm(mValues), `รุ่น ${mValues.pCode}`);
  };

  const _onConfirm = async mValues => {
    try {
      //  showLog('values', values);
      load(true);
      let values = cleanValuesBeforeSave(mValues);
      if (partModel.pCode) {
        await api.setPartList({ ...values, _key: partModel.pCode });
      } else {
        await api.setPartList(values);
      }

      const oldValues = partModel;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.pCode,
          changes
        },
        'partList',
        values.pCode
      );
      load(false);
      showSuccess(() => onCancel(), `บันทึกข้อมูล รุ่น ${values.pCode} สำเร็จ`);
      onCancel && onCancel();
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
          pCode: partModel.pCode || '',
          partType: partModel.partType || 'SKC',
          model: partModel.model || '',
          name: partModel.name || '',
          wsPrice: partModel.wsPrice || '',
          slp: partModel.slp || '',
          creditTerm: partModel.creditTerm || '',
          description: partModel.description || '',
          remark: partModel.remark || ''
        }}
        validationSchema={PartSchema}
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
                      name="pCode"
                      placeholder="รหัสสินค้า (ควรเป็นตัวอักษรภาษาอังกฤษและตัวเลข)"
                      disabled={!grantPart}
                    />
                  </Col>
                  <Col md="4" className="form-group">
                    <label>รุ่น</label>
                    <FInput name="model" placeholder="รุ่น" disabled={!grantPart} />
                  </Col>
                </Row>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>ประเภท</label>
                    <FSelect name="partType" disabled={!grantPart}>
                      <option>SKC</option>
                      <option>KBN</option>
                    </FSelect>
                  </Col>
                  <Col md="8" className="form-group">
                    <label>ชื่อสินค้า</label>
                    <FInput name="name" placeholder="ชื่อสินค้า" disabled={!grantPart} />
                  </Col>
                </Row>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>ราคาขายส่ง</label>
                    <FInput name="wsPrice" placeholder="ราคาขายส่ง" commaNumber disabled={!grantPart} />
                  </Col>
                  <Col md="4" className="form-group">
                    <label>ราคาขาย</label>
                    <FInput name="slp" placeholder="ราคาขาย" commaNumber disabled={!grantPart} />
                  </Col>
                  <Col md="4" className="form-group">
                    <label>เครดิต (วัน)</label>
                    <FInput name="creditTerm" placeholder="เครดิต (วัน)" commaNumber disabled={!grantPart} />
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
                      disabled={!grantPart}
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
                      disabled={!grantPart}
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

export default SettingPart;
