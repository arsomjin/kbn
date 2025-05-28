import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Form, Input, Select, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { useModal } from 'hooks/useModal';
import { hasPermission } from 'utils/permissions';
import { PERMISSIONS } from 'constants/Permissions';
import { setEmployees } from 'store/slices/dataSlice';
import PrefixAnt from 'components/PrefixAnt';
import { validateMobileNumber } from 'utils/validation';
import { Tambols, Provinces } from 'data/thaiTambol';
import {
  getAmphoesFromProvince,
  getPostcodeFromProvince,
  getTambolsFromAmphoe,
} from 'data/thaiTambol';

const { TextArea } = Input;

const EmployeeDetails = ({ onCancel, selectedEmployee }) => {
  const { t } = useTranslation('employees');
  const { showModal } = useModal();
  const { branches, employees } = useSelector((state) => state.data);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const db = getFirestore();

  const [TAMBOLS, setTambols] = useState([]);
  const [AMPHOES, setAmphoes] = useState([]);
  const [PROVINCES, setProvinces] = useState(Provinces());
  const [POSTCODES, setPostcodes] = useState([]);

  const _getProvincesDB = useCallback(async () => {
    let mProvinces = Provinces().map((pv) => ({
      value: pv.p,
      label: pv.p,
    }));
    // Move korat to first element
    mProvinces.forEach((item, i) => {
      if (item.value === 'นครราชสีมา') {
        mProvinces.splice(i, 1);
        mProvinces.unshift(item);
      }
    });
    setProvinces(mProvinces);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 100);
    return () => window.scrollTo(0, 100);
  }, []);

  useEffect(() => {
    _getProvincesDB();
    _onProvinceSelect('นครราชสีมา');
  }, [_getProvincesDB]);

  const _onPreConfirm = async (values) => {
    try {
      await form.validateFields();
      if (!values.employeeCode) {
        showModal({
          type: 'warning',
          title: t('errors.incompleteData'),
          content: t('errors.employeeCodeRequired'),
        });
        return;
      }
      showModal({
        type: 'confirm',
        title: t('actions.confirm'),
        content: t('actions.confirmSave', { name: values.firstName }),
        onOk: () => _onConfirm(values),
      });
    } catch (error) {
      showModal({
        type: 'error',
        title: t('errors.validationFailed'),
        content: error.message,
      });
    }
  };

  const _onProvinceSelect = async (pv) => {
    let mAmphoes = getAmphoesFromProvince(pv);
    mAmphoes = mAmphoes.map((ap) => ({
      value: ap.a,
      label: ap.a,
    }));
    let mPostcodes = getPostcodeFromProvince(pv);
    mPostcodes = mPostcodes.map((ap) => ({
      value: ap.z,
      label: ap.z,
    }));
    setAmphoes(mAmphoes);
    setPostcodes(mPostcodes);
  };

  const _onAmphoeSelect = async (ap) => {
    let mTambols = getTambolsFromAmphoe(ap);
    setTambols(mTambols);
  };

  const _onTambolSelect = (tb, values, setFieldValue) => {
    const { amphoe, province } = values;
    const pc = Tambols.findIndex((l) => l.p === province && l.a === amphoe && l.d === tb);
    if (pc !== -1) {
      setFieldValue('postcode', Tambols[pc].z);
    }
  };

  const _onConfirm = async (values) => {
    try {
      showModal({ type: 'loading', content: t('actions.saving') });

      const employeeRef = collection(db, 'data/company/employees');
      let mEmployees = JSON.parse(JSON.stringify(employees));
      let docId;

      if (selectedEmployee?.employeeCode) {
        // Update existing employee
        docId = selectedEmployee.employeeCode;
        const docRef = doc(db, 'data/company/employees', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const updateData = {
            ...docSnap.data(),
            ...values,
            updatedAt: Date.now(),
            updatedBy: user.uid,
          };
          await updateDoc(docRef, updateData);
          mEmployees[docId] = {
            ...mEmployees[docId],
            ...values,
          };
        } else {
          showModal({
            type: 'warning',
            title: t('errors.dataNotFound'),
            content: t('errors.employeeNotFound'),
          });
          return;
        }
      } else {
        // Add new employee
        const { prefix, firstName, lastName, phoneNumber, employeeCode } = values;

        // Check duplicate employee
        const q = query(
          employeeRef,
          where('firstName', '==', firstName),
          where('lastName', '==', lastName),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          showModal({
            type: 'warning',
            title: t('errors.duplicateEmployee'),
            content: t('errors.employeeExists', { firstName, lastName }),
          });
          return;
        }

        if (!employeeCode) {
          showModal({
            type: 'warning',
            title: t('errors.incompleteData'),
            content: t('errors.employeeCodeRequired'),
          });
          return;
        }

        const addData = {
          prefix,
          firstName,
          lastName,
          phoneNumber,
          employeeCode,
          createdAt: Date.now(),
          createdBy: user.uid,
          provinceId: user.provinceId,
        };

        await setDoc(doc(employeeRef, employeeCode), addData);
        mEmployees[employeeCode] = {
          employeeCode,
          prefix,
          firstName,
          lastName,
          phoneNumber,
          createdAt: Date.now(),
        };
        docId = employeeCode;
      }

      // Update redux store
      dispatch(setEmployees(mEmployees));

      showModal({
        type: 'success',
        title: t('success.saved'),
        content: t('success.employeeSaved'),
        onOk: onCancel,
      });
    } catch (error) {
      showModal({
        type: 'error',
        title: t('errors.saveFailed'),
        content: error.message,
      });
    }
  };

  const canEditEmployee =
    hasPermission(PERMISSIONS.EMPLOYEE_EDIT) || user.employeeCode === selectedEmployee.employeeCode;

  const displayName = `${
    selectedEmployee.firstName || selectedEmployee.lastName ? t('prefix.mr') : ''
  }${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`;

  return (
    <Card className="mb-4">
      <div className="border-bottom p-3">
        <Row justify="space-between" align="middle">
          <Button onClick={onCancel} className="btn-white">
            &larr; {t('actions.back')}
          </Button>
          <h6 className="m-0 mr-3 text-primary">
            {selectedEmployee.employeeCode ? displayName : t('form.title.new')}
          </h6>
        </Row>
      </div>
      <Form
        form={form}
        initialValues={{
          prefix: selectedEmployee.prefix || t('prefix.mr'),
          employeeCode: selectedEmployee.employeeCode || '',
          firstName: selectedEmployee.firstName || '',
          lastName: selectedEmployee.lastName || '',
          phoneNumber: selectedEmployee.phoneNumber || '',
          address: selectedEmployee.address || '',
          tambol: selectedEmployee.tambol || '',
          amphoe: selectedEmployee.amphoe || '',
          province: selectedEmployee.province || 'นครราชสีมา',
          postcode: selectedEmployee.postcode || '',
          branch: selectedEmployee.branch || '0450',
          remark: selectedEmployee.remark || '',
        }}
        layout="vertical"
      >
        <div className="p-3">
          <Row gutter={[16, 16]}>
            <Col md={4}>
              <Form.Item
                name="employeeCode"
                label={t('fields.employeeCode')}
                rules={[{ required: true, message: t('validation.required.employeeId') }]}
              >
                <Input disabled={!canEditEmployee} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col md={2}>
              <Form.Item
                name="prefix"
                label={t('fields.prefix')}
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <PrefixSelector disabled={!canEditEmployee} />
              </Form.Item>
            </Col>
            <Col md={4}>
              <Form.Item
                name="firstName"
                label={t('fields.firstName')}
                rules={[{ required: true, message: t('validation.required.firstName') }]}
              >
                <Input disabled={!canEditEmployee} />
              </Form.Item>
            </Col>
            <Col md={4}>
              <Form.Item
                name="lastName"
                label={t('fields.lastName')}
                rules={[{ required: true, message: t('validation.required.lastName') }]}
              >
                <Input disabled={!canEditEmployee} />
              </Form.Item>
            </Col>
            <Col md={2}>
              <Form.Item
                name="phoneNumber"
                label={t('fields.phoneNumber')}
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      return validateMobileNumber(value)
                        ? Promise.resolve()
                        : Promise.reject(new Error(t('validation.format.phone')));
                    },
                  },
                ]}
              >
                <Input disabled={!canEditEmployee} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col md={4}>
              <Form.Item name="address" label={t('fields.address')}>
                <Input disabled={!canEditEmployee} />
              </Form.Item>
            </Col>
            <Col md={4}>
              <Form.Item name="province" label={t('fields.province')}>
                <Select
                  disabled={!canEditEmployee}
                  options={PROVINCES}
                  onChange={(value) => {
                    form.setFieldValue('province', value);
                    _onProvinceSelect(value);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col md={4}>
              <Form.Item name="amphoe" label={t('fields.amphoe')}>
                <Select
                  disabled={!canEditEmployee}
                  options={AMPHOES}
                  onChange={(value) => {
                    form.setFieldValue('amphoe', value);
                    _onAmphoeSelect(value);
                  }}
                />
              </Form.Item>
            </Col>
            <Col md={4}>
              <Form.Item name="tambol" label={t('fields.tambol')}>
                <Select
                  disabled={!canEditEmployee}
                  options={TAMBOLS}
                  onChange={(value) => {
                    form.setFieldValue('tambol', value);
                    _onTambolSelect(value, form.getFieldsValue(), form.setFieldValue);
                  }}
                />
              </Form.Item>
            </Col>
            <Col md={4}>
              <Form.Item name="postcode" label={t('fields.postcode')}>
                <Select
                  disabled={!canEditEmployee}
                  options={POSTCODES}
                  onChange={(value) => form.setFieldValue('postcode', value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col md={6}>
              <Form.Item name="branch" label={t('fields.branch')}>
                <Select disabled={!canEditEmployee}>
                  {Object.keys(branches).map((key) => (
                    <Select.Option key={key} value={key}>
                      {branches[key].branchName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col md={12}>
              <Form.Item name="remark" label={t('fields.remark')}>
                <TextArea rows={5} disabled={!canEditEmployee} />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="space-between">
            <Button onClick={onCancel} className="btn-white">
              &larr; {t('actions.back')}
            </Button>
            <Button type="primary" onClick={_onPreConfirm} disabled={!canEditEmployee}>
              {t('actions.save')}
            </Button>
          </Row>
        </div>
      </Form>
    </Card>
  );
};

EmployeeDetails.propTypes = {
  onCancel: PropTypes.func.isRequired,
  selectedEmployee: PropTypes.object.isRequired,
};

export default EmployeeDetails;
