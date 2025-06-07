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
    branches[branchCode].provinceId === province.key || 
    branches[branchCode].provinceId === province._key ||
    branches[branchCode].provinceId === province.provinceName
  );

  const _onConfirm = async values => {
    try {
      const provinceData = {
        ...values,
        key: province.key || province._key || values.provinceName,
        code: values.code || shortid.generate(),
        branches: provinceBranches,
        createdAt: province.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await api.setProvince(provinceData);
      await api.updateData('provinces', values.provinceName || province.key);
      
      const oldValues = province;
      const newValues = provinceData;
      const changes = getChanges(oldValues, newValues);
      
      await api.addLog(
        {
          time: Date.now(),
          type: province.provinceName ? 'edited' : 'created',
          by: user.uid,
          docId: values.provinceName || province.key,
          changes
        },
        'provinces',
        values.provinceName || province.key
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
            code: province.code || '',
            name: province.name || province.provinceName || '',
            nameEn: province.nameEn || province.provinceNameEn || '',
            region: province.region || '',
            status: province.status !== undefined ? province.status : 'active',
            manager: province.manager || '',
            description: province.description || province.remark || ''
          }}
          validate={values => {
            const errors = {};
            if (!values.name) {
              errors.name = 'กรุณาระบุชื่อจังหวัด';
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
                    name="code"
                    placeholder="รหัสจังหวัด"
                    value={values.code}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Col>
                <Col md="4" className="form-group">
                  <label>ชื่อจังหวัด *</label>
                  <FormInput
                    name="name"
                    placeholder="ชื่อจังหวัด"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={touched.name && !!errors.name}
                    disabled={!!province.name || !!province.provinceName} // Disable editing existing province name
                  />
                  {touched.name && errors.name && (
                    <div className="invalid-feedback" style={{ display: 'block' }}>
                      {errors.name}
                    </div>
                  )}
                </Col>
                <Col md="4" className="form-group">
                  <label>ชื่อภาษาอังกฤษ</label>
                  <FormInput
                    name="nameEn"
                    placeholder="Province Name (English)"
                    value={values.nameEn}
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
                  <label>สถานะ</label>
                  <FormSelect
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ไม่ใช้งาน</option>
                  </FormSelect>
                </Col>
                <Col md="6" className="form-group">
                  <label>ผู้จัดการจังหวัด</label>
                  <FormInput
                    name="manager"
                    placeholder="ผู้จัดการจังหวัด"
                    value={values.manager}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Col>
              </Row>

              <Row form>
                <Col className="form-group">
                  <label>หมายเหตุ</label>
                  <FormTextarea
                    name="description"
                    placeholder="หมายเหตุ"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Col>
              </Row>

              {showBranches && provinceBranches.length > 0 && (
                <Row>
                  <Col md="12">
                    <h6>สาขาในจังหวัดนี้ ({provinceBranches.length} สาขา)</h6>
                    <ul className="list-unstyled">
                      {provinceBranches.map(branchCode => {
                        const branch = branches[branchCode];
                        return (
                          <li key={branchCode} className="mb-1">
                            <small className="text-muted">
                              {branch.branchName} ({branchCode})
                            </small>
                          </li>
                        );
                      })}
                    </ul>
                  </Col>
                </Row>
              )}

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