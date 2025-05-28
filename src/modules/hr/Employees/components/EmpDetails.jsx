/**
 * EmployeeDetails component displays employee profile and allows photo upload if permitted.
 * Refactored to use Ant Design, Firebase Modular SDK, i18next, and project RBAC guidelines.
 */
import React from 'react';
import { Card, Typography, List, Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore as db } from '../../../../services/firebase';
import { useAuth } from 'contexts/AuthContext';
import { useModal } from 'contexts/ModalContext';
import { usePermissions } from 'hooks/usePermissions';
import { PERMISSIONS } from 'constants/Permissions';
import { UploadPhoto } from 'elements';

/**
 * EmployeeDetails component
 * @param {object} props
 * @param {object} props.selectedEmployee - The employee object to display
 */
const EmployeeDetails = ({ selectedEmployee }) => {
  const { t } = useTranslation(['employees']);
  const { user } = useAuth();
  const { showWarning, showSuccess } = useModal();
  const { hasPermission } = usePermissions();

  // RBAC: Only allow edit if user has permission or is self
  const canEdit =
    hasPermission(PERMISSIONS.EMPLOYEE_EDIT) || user.employeeCode === selectedEmployee.employeeCode;

  // Handle photo upload
  const setPhotoUrl = async (photoURL) => {
    try {
      const docRef = doc(db, 'data/company/employees', selectedEmployee.employeeCode);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, { ...docSnap.data(), photoURL });
        // Update redux store
        showSuccess(t('messages.success.profilePhotoUploaded'));
      } else {
        showWarning(t('messages.error.employeeNotFound'));
      }
    } catch (e) {
      showWarning(e.message || t('messages.error.unknownError'));
    }
  };

  return (
    <Card className="mb-4 pt-3">
      <Row justify="center">
        <Col span={24} className="text-center">
          <div className="mb-3 mx-auto">
            <UploadPhoto
              disabled={!canEdit}
              src={selectedEmployee.photoURL}
              storeRef={`images/employees/${selectedEmployee.employeeCode}`}
              setUrl={setPhotoUrl}
            />
          </div>
          <Typography.Title level={5} className="mb-0">
            {selectedEmployee.firstName
              ? `${selectedEmployee.prefix || ''}${selectedEmployee.firstName} ${selectedEmployee.lastName || ''}`.trim()
              : ''}
          </Typography.Title>
          {selectedEmployee.position && (
            <Typography.Text type="secondary" className="d-block mb-2">
              {selectedEmployee.jobTitle || selectedEmployee.position}
            </Typography.Text>
          )}
        </Col>
      </Row>
      {selectedEmployee.description && (
        <Row>
          <Col span={24}>
            <Typography.Text type="secondary" className="d-block mb-2">
              {t('fields.description')}
            </Typography.Text>
            <Typography.Paragraph>{selectedEmployee.description}</Typography.Paragraph>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default EmployeeDetails;
