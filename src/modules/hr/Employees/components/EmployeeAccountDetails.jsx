import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { firestore as db } from '../../../../services/firebase';
import { uniq } from 'lodash';
import { useModal } from 'contexts/ModalContext';
import { usePermissions } from 'hooks/usePermissions';
import { PERMISSIONS } from 'constants/Permissions';
import PrefixAnt from 'components/PrefixAnt';
import CommonSelector from 'components/CommonSelector';
import { ExtraPositions } from 'data/Constant';
import { DatePicker } from 'elements';
import { useAuth } from 'contexts/AuthContext';
import { prepareDataForFirestore } from '../../../../utils/firestoreUtils';
import BranchSelector from '../../../../components/common/BranchSelector';
import { useParams } from 'react-router';
import ProvinceSelector from '../../../../components/common/ProvinceSelector';
import { useResponsive } from 'hooks/useResponsive';

const EmployeeAccountDetails = ({ onCancel, selectedEmployee, isEdit }) => {
  const { t } = useTranslation(['employees']);
  const { showConfirm, showWarning, showSuccess, showError } = useModal();
  const { employees, branches } = useSelector((state) => state.data);
  const [form] = Form.useForm();
  const [positions, setPos] = useState([]);
  const [saving, setSaving] = useState(false);
  const { provinceId, branchCode } = useParams();

  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const { isMobile } = useResponsive();

  useEffect(() => {
    let arr = Object.keys(employees)
      .map((k) => employees[k].position)
      .filter((l) => !!l);
    arr = arr.concat(ExtraPositions);
    arr = uniq(arr);
    setPos(arr);
  }, [employees]);

  const AFFILIATES = Object.keys(branches).map((k) => branches[k].branchName);

  const _onPreConfirm = async () => {
    try {
      const values = await form.validateFields();
      // Fallback for name: use firstName + lastName, else employeeCode
      const name =
        (values.firstName || '') + (values.lastName ? ' ' + values.lastName : '') ||
        values.employeeCode ||
        '-';
      showConfirm({
        title: t('actions.confirm'),
        content: t('actions.confirmSave', { name }),
        onOk: () => _onConfirm(values),
      });
    } catch (error) {
      showError(`${t('errors.validationFailed')}: ${error.message}`);
    }
  };

  // Save to Firestore
  const _onConfirm = async (values) => {
    setSaving(true);
    const {
      prefix,
      firstName,
      lastName,
      employeeCode,
      status,
      nickName,
      position,
      branch,
      provinceId,
      workBegin,
      workEnd,
      startDate,
      endDate,
    } = values;
    try {
      const employeeRef = collection(db, 'data/company/employees');
      if (isEdit) {
        const docRef = doc(
          db,
          'data/company/employees',
          selectedEmployee._key || selectedEmployee.employeeCode,
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const updateData = {
            ...docSnap.data(),
            prefix,
            firstName,
            lastName,
            employeeCode,
            status,
            nickName,
            position,
            branch,
            provinceId,
            workBegin,
            workEnd,
            startDate,
            endDate,
            updatedAt: Date.now(),
            updatedBy: user.uid,
          };
          const safeData = prepareDataForFirestore(updateData);
          console.log('[EmployeeAccountDetails] _onConfirm updateDoc updateData', updateData);
          console.log('[EmployeeAccountDetails] _onConfirm updateDoc safeData', safeData);
          await updateDoc(docRef, safeData);
        } else {
          showWarning(`${t('errors.dataNotFound')}: ${t('errors.employeeNotFound')}`);
          setSaving(false);
          return;
        }
      } else {
        // Check duplicate employee
        const q = query(
          employeeRef,
          where('firstName', '==', firstName),
          where('lastName', '==', lastName),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          showWarning(
            `${t('errors.duplicateEmployee')}: ${t('errors.employeeExists', { firstName, lastName })}`,
          );
          setSaving(false);
          return;
        }
        const addData = prepareDataForFirestore({
          prefix,
          firstName,
          lastName,
          employeeCode,
          status,
          nickName,
          position,
          branch,
          provinceId,
          workBegin,
          workEnd,
          startDate,
          endDate,
          createdAt: Date.now(),
          createdBy: user.uid,
        });

        await setDoc(doc(employeeRef, employeeCode), addData);
      }
      showSuccess(`${t('success.saved')}: ${t('success.employeeSaved')}`);
      if (onCancel) onCancel();
    } catch (error) {
      showError(`${t('errors.saveFailed')}: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const canEditEmployee =
    hasPermission(PERMISSIONS.EMPLOYEE_EDIT) || user.employeeCode === selectedEmployee.employeeCode;

  return (
    <Form
      form={form}
      initialValues={{
        prefix: selectedEmployee.prefix || t('prefix.mr'),
        firstName: selectedEmployee.firstName || '',
        lastName: selectedEmployee.lastName || '',
        employeeCode: selectedEmployee.employeeCode || '',
        status: selectedEmployee.status || t('status.active'),
        nickName: selectedEmployee.nickName || '',
        position: selectedEmployee.position || '',
        branch: selectedEmployee.branch || branchCode || '',
        provinceId: selectedEmployee.province || provinceId || '',
        description: selectedEmployee.description || '',
        workBegin: selectedEmployee.workBegin || undefined,
        workEnd: selectedEmployee.workEnd || undefined,
        startDate: selectedEmployee.startDate || undefined,
        endDate: selectedEmployee.endDate || undefined,
      }}
      layout="vertical"
    >
      <Card className={isMobile ? 'p-0' : 'p-4'}>
        <Row gutter={[16, 16]}>
          <Col md={8}>
            <Form.Item
              name="prefix"
              label={t('fields.prefix')}
              rules={[{ required: true, message: t('validation.required.prefix') }]}
            >
              <PrefixAnt disabled={!canEditEmployee} autoFocus />
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item
              name="firstName"
              label={t('fields.firstName')}
              rules={[{ required: true, message: t('validation.required.firstName') }]}
            >
              <Input disabled={!canEditEmployee} autoFocus />
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item
              name="lastName"
              label={t('fields.lastName')}
              rules={[{ required: true, message: t('validation.required.lastName') }]}
            >
              <Input disabled={!canEditEmployee} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={8}>
            <Form.Item name="nickName" label={t('fields.nickName')}>
              <Input disabled={!canEditEmployee} />
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item
              name="employeeCode"
              label={t('fields.employeeCode')}
              rules={[{ required: true, message: t('validation.required.employeeCode') }]}
            >
              <Input disabled={!canEditEmployee} />
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item
              name="status"
              label={t('fields.status')}
              rules={[{ required: true, message: t('validation.required.status') }]}
            >
              <CommonSelector
                options={[
                  { value: t('status.active'), label: t('status.active') },
                  { value: t('status.resigned'), label: t('status.resigned') },
                ]}
                disabled={!canEditEmployee}
                placeholder={t('fields.status')}
                className={form.getFieldValue('status') === 'ปกติ' ? 'text-success' : 'text-danger'}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={8}>
            <Form.Item
              name="position"
              label={t('fields.position')}
              rules={[{ required: true, message: t('validation.required.position') }]}
            >
              <CommonSelector
                options={positions.map((pos) => ({ value: pos, label: pos }))}
                disabled={!canEditEmployee}
              />
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item
              name="branch"
              label={t('fields.branch')}
              rules={[{ required: true, message: t('validation.required.branch') }]}
            >
              <BranchSelector disabled={!canEditEmployee} provinceId={provinceId} size="middle" />
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item
              name="provinceId"
              label={t('fields.provinceId')}
              rules={[{ required: true, message: t('validation.required.provinceId') }]}
            >
              <ProvinceSelector disabled={!canEditEmployee} provinceId={provinceId} size="middle" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={12}>
            <Form.Item name="workBegin" label={t('fields.workBegin')}>
              <DatePicker
                disabled={!canEditEmployee}
                format="HH:mm"
                picker="time"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name="workEnd" label={t('fields.workEnd')}>
              <DatePicker
                disabled={!canEditEmployee}
                format="HH:mm"
                picker="time"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={12}>
            <Form.Item name="startDate" label={t('fields.startDate')}>
              <DatePicker disabled={!canEditEmployee} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name="endDate" label={t('fields.endDate')}>
              <DatePicker disabled={!canEditEmployee} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item name="description" label={t('fields.description')}>
              <Input.TextArea disabled={!canEditEmployee} rows={4} />
            </Form.Item>
          </Col>
        </Row>
        {canEditEmployee && (
          <Row justify="end" gutter={[8, 8]}>
            <Col>
              <Button onClick={onCancel}>{t('actions.cancel')}</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={_onPreConfirm} loading={saving} disabled={saving}>
                {t('actions.save')}
              </Button>
            </Col>
          </Row>
        )}
      </Card>
    </Form>
  );
};

export default EmployeeAccountDetails;
