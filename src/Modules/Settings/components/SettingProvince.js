import React, { useContext } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Form, FormInput, FormSelect, Button, FormTextarea, FormCheckbox } from 'shards-react';
import { Formik } from 'formik';
import { showWarn } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { showSuccess } from 'functions';
import { useSelector } from 'react-redux';
import { getChanges } from 'functions';
import shortid from 'shortid';

const THAI_REGIONS = [
  { value: 'เหนือ', label: 'ภาคเหนือ' },
  { value: 'อีสาน', label: 'ภาคอีสาน' },
  { value: 'กลาง', label: 'ภาคกลาง' },
  { value: 'ใต้', label: 'ภาคใต้' },
  { value: 'ตะวันออก', label: 'ภาคตะวันออก' },
  { value: 'ตะวันตก', label: 'ภาคตะวันตก' }
];

const SettingProvince = ({ province, onCancel, showBranches }) => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { branches = {} } = useSelector(state => state.data);

  // Get branches for this province
  const provinceBranches = Object.keys(branches).filter(branchCode => 
    branches[branchCode].provinceCode === province.provinceName
  );

  const _onConfirm = async values => {
    try {
      const provinceData = {
        ...values,
        provinceCode: values.provinceCode || shortid.generate(),
        branches: provinceBranches,
        createdAt: province.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await api.setProvince(provinceData);
      await api.updateData('provinces', values.provinceName);
      
      const oldValues = province;
      const newValues = provinceData;
      const changes = getChanges(oldValues, newValues);
      
      await api.addLog(
        {
          time: Date.now(),
          type: province.provinceName ? 'edited' : 'created',
          by: user.uid,
          docId: values.provinceName,
          changes
        },
        'provinces',
        values.provinceName
      );
      
      showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
    } catch (e) {
      showWarn(e);
    }
  };

  return (
    <ListGroup flush>
      <ListGroupItem className="p-3">
        <Formik
          initialValues={{
            provinceCode: province.provinceCode || '',
            provinceName: province.provinceName || '',
            provinceNameEn: province.provinceNameEn || '',
            region: province.region || '',
            isActive: province.isActive !== undefined ? province.isActive : true,
            manager: province.manager || '',
            remark: province.remark || ''
          }}
          validate={values => {
            const errors = {};
            if (!values.provinceName) {
              errors.provinceName = 'กรุณาระบุชื่อจังหวัด';
            }
            if (!values.region) {
              errors.region = 'กรุณาเลือกภูมิภาค';
            }
            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
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
          }) => (
            <Form>
              <Row form>
                <Col md="3" className="form-group">
                  <label>รหัสจังหวัด</label>
                  <FormInput
                    name="provinceCode"
                    placeholder="รหัสจังหวัด"
                    value={values.provinceCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Col>
                <Col md="4" className="form-group">
                  <label>ชื่อจังหวัด *</label>
                  <FormInput
                    name="provinceName"
                    placeholder="ชื่อจังหวัด"
                    value={values.provinceName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={touched.provinceName && !!errors.provinceName}
                    disabled={!!province.provinceName} // Disable editing existing province name
                  />
                  {touched.provinceName && errors.provinceName && (
                    <div className="invalid-feedback" style={{ display: 'block' }}>
                      {errors.provinceName}
                    </div>
                  )}
                </Col>
                <Col md="4" className="form-group">
                  <label>ชื่อภาษาอังกฤษ</label>
                  <FormInput
                    name="provinceNameEn"
                    placeholder="Province Name (English)"
                    value={values.provinceNameEn}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Col>
              </Row>

              <Row form>
                <Col md="3" className="form-group">
                  <label>ภูมิภาค *</label>
                  <FormSelect 
                    name="region" 
                    value={values.region} 
                    onChange={handleChange}
                    invalid={touched.region && !!errors.region}
                  >
                    <option value="">เลือกภูมิภาค</option>
                    {THAI_REGIONS.map(region => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </FormSelect>
                  {touched.region && errors.region && (
                    <div className="invalid-feedback" style={{ display: 'block' }}>
                      {errors.region}
                    </div>
                  )}
                </Col>
                <Col md="3" className="form-group">
                  <label>ผู้จัดการจังหวัด</label>
                  <FormInput
                    name="manager"
                    placeholder="ชื่อผู้จัดการ"
                    value={values.manager}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Col>
                <Col md="2" className="form-group">
                  <label style={{ display: 'block' }}>&nbsp;</label>
                  <FormCheckbox
                    name="isActive"
                    checked={values.isActive}
                    onChange={handleChange}
                  >
                    เปิดใช้งาน
                  </FormCheckbox>
                </Col>
              </Row>

              <Row form>
                <Col className="form-group">
                  <label>สาขาในจังหวัด</label>
                  <Row>
                    <Col md="6">
                      <div className="border rounded p-2 bg-light">
                        {provinceBranches.length > 0 ? (
                          <ul className="list-unstyled mb-0">
                            {provinceBranches.map(branchCode => (
                              <li key={branchCode} className="mb-1">
                                • {branches[branchCode]?.branchName || branchCode}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <small className="text-muted">ยังไม่มีสาขาในจังหวัดนี้</small>
                        )}
                      </div>
                    </Col>
                    <Button size="sm" className="btn-white ml-3 mt-2" onClick={() => showBranches()}>
                      จัดการสาขา &rarr;
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
                  />
                </Col>
              </Row>

              <Row style={{ justifyContent: 'flex-end' }} form>
                <Button className="btn-white mr-3" onClick={onCancel}>
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSubmit}
                  theme="accent"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </Row>
            </Form>
          )}
        </Formik>
      </ListGroupItem>
    </ListGroup>
  );
};

export default SettingProvince; 