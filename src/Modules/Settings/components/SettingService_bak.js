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
import { load } from 'functions';
import { cleanValuesBeforeSave } from 'functions';

const ServiceSchema = Yup.object().shape({
  name: Yup.string().required('กรุณาป้อนชื่อรายการ'),
  serviceCode: Yup.string().required('กรุณาป้อนรหัสบริการ'),
  unitPrice: Yup.string().required('กรุณาป้อนราคา')
});

const SettingService = ({ service, visible, onCancel, hideMain }) => {
  showLog({ service });
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  const grantService = user.isDev || (user.permissions && user.permissions.permission602);

  const _preConfirm = async values => {
    //  showLog({ values });
    let mValues = { ...service, ...values };
    mValues = cleanNumberFields(mValues, ['standardCost', 'unitPrice']);
    let unitPrice_no_vat = (Number(mValues.unitPrice) / 1.07).toFixed(2);
    mValues.unitPrice_no_vat = Numb(unitPrice_no_vat);
    showConfirm(() => _onConfirm(mValues), `บันทึกบริการ ${mValues.serviceCode} ${mValues.name}`);
  };

  const _onConfirm = async mValues => {
    try {
      //  showLog('values', values);
      load(true);
      let values = cleanValuesBeforeSave(mValues);
      if (service.serviceCode) {
        await api.setServiceList({ ...values, _key: service.serviceCode });
      } else {
        await api.setServiceList(values);
      }

      const oldValues = service;
      const newValues = values;
      const changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: 'edited',
          by: user.uid,
          docId: values.serviceCode,
          changes
        },
        'serviceList',
        values.serviceCode
      );
      load(false);
      showSuccess(() => onCancel && onCancel(), `บันทึกข้อมูล บริการ ${values.serviceCode} สำเร็จ`);
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
          serviceCode: service.serviceCode || '',
          serviceType: service.serviceType || '',
          name: service.name || '',
          discount: service.discount || '',
          unit: service.unit || '',
          unitPrice: service.unitPrice || '',
          creditTerm: service.creditTerm || '',
          description: service.description || '',
          remark: service.remark || ''
        }}
        validationSchema={ServiceSchema}
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
                    <label>รหัสบริการ</label>
                    <FInput name="serviceCode" placeholder="รหัส" disabled={!grantService} />
                  </Col>
                </Row>
                <Row form>
                  {/* <Col md="4" className="form-group">
                    <label>ประเภท</label>
                    <FSelect name="serviceType" disabled={!grantService}>
                      <option>SKC</option>
                      <option>KBN</option>
                    </FSelect>
                  </Col> */}
                  <Col md="8" className="form-group">
                    <label>ชื่อบริการ</label>
                    <FInput name="name" placeholder="ชื่อบริการ" disabled={!grantService} />
                  </Col>
                </Row>
                <Row form>
                  <Col md="4" className="form-group">
                    <label>หน่วย</label>
                    <FInput name="unit" placeholder="หน่วย" commaNumber disabled={!grantService} />
                  </Col>
                  <Col md="4" className="form-group">
                    <label>ราคาต่อหน่วย</label>
                    <FInput name="unitPrice" placeholder="ราคา" commaNumber disabled={!grantService} />
                  </Col>
                  <Col md="4" className="form-group">
                    <label>เครดิต (วัน)</label>
                    <FInput name="creditTerm" placeholder="เครดิต (วัน)" commaNumber disabled={!grantService} />
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
                      disabled={!grantService}
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
                      disabled={!grantService}
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

export default SettingService;
