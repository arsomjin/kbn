import React from 'react';
import { Card, List } from 'antd';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import UploadPhoto from 'components/upload-photo';
import { setEmployees } from 'store/slices/dataSlice';
import { useModal } from 'contexts/ModalContext';
import { PERMISSIONS } from 'constants/Permissions';
import { usePermissions } from 'hooks/usePermissions';

export const EmpDetails = ({ selectedEmployee }) => {
  const { t } = useTranslation('employees');
  const { showModal } = useModal();
  const { employees } = useSelector((state) => state.data);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const db = getFirestore();
  const { hasPermission } = usePermissions();

  const _setPhotoUrl = async (photoURL) => {
    try {
      const employeeRef = doc(db, 'data/company/employees', selectedEmployee.employeeCode);
      const docSnap = await getDoc(employeeRef);
      if (docSnap.exists()) {
        await updateDoc(employeeRef, {
          ...docSnap.data(),
          photoURL,
        });
      }

      // Update redux store
      let mEmployees = JSON.parse(JSON.stringify(employees));
      mEmployees[selectedEmployee.employeeCode] = {
        ...mEmployees[selectedEmployee.employeeCode],
        photoURL,
      };
      dispatch(setEmployees(mEmployees));
    } catch (error) {
      showModal({
        type: 'error',
        title: t('errors.uploadFailed'),
        content: error.message,
      });
    }
  };

  const canEditEmployee =
    hasPermission(PERMISSIONS.EMPLOYEE_EDIT) || user.employeeCode === selectedEmployee.employeeCode;

  return (
    <Card className="mb-4 pt-3">
      <div className="border-bottom text-center p-3">
        <div className="mb-3 mx-auto">
          <UploadPhoto
            disabled={!canEditEmployee}
            src={selectedEmployee.photoURL}
            storeRef={`images/employees/${selectedEmployee.employeeCode}`}
            setUrl={_setPhotoUrl}
          />
        </div>
        <h5 className="mb-0">
          {selectedEmployee.firstName
            ? `${selectedEmployee.prefix}${selectedEmployee.firstName} ${selectedEmployee.lastName}`.trim()
            : ''}
        </h5>
        {selectedEmployee.position && (
          <span className="text-muted d-block mb-2">
            {selectedEmployee.jobTitle || selectedEmployee.position}
          </span>
        )}
      </div>
      <List>
        {selectedEmployee.description && (
          <List.Item className="p-4">
            <div>
              <strong className="text-muted d-block mb-2">{t('fields.description')}</strong>
              <span>{selectedEmployee.description}</span>
            </div>
          </List.Item>
        )}
      </List>
    </Card>
  );
};
