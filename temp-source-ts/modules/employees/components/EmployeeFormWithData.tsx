import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from 'antd';
import { EmployeeFormData } from '../types';
import { employeeService } from '../services/employeeService';
import LoadingScreen from '../../../components/common/LoadingScreen';
import { EmployeeForm } from './EmployeeForm';
import dayjs from 'dayjs';

// Helper function to convert Firestore Timestamp to JavaScript Date
const convertFirestoreTimestampToDate = (timestamp: any): Date | undefined => {
  if (!timestamp) return undefined;

  // Handle Firestore Timestamp
  if (typeof timestamp === 'object' && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // Handle JavaScript Date or timestamp number
  try {
    const date = new Date(timestamp);
    return date instanceof Date && !isNaN(date.getTime()) ? date : undefined;
  } catch (err) {
    return undefined;
  }
};

// This wrapper component handles fetching the employee data
export const EmployeeFormWithData: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<Partial<EmployeeFormData> | undefined>();
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(['employees', 'common']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const employeeData = await employeeService.getEmployeeById(id);

        if (!employeeData) {
          setError(t('error.notFound', { ns: 'employees' }));
          return;
        }

        // Convert dates for the form and handle any document fields
        const { documents, ...restData } = employeeData;
        const initialData: Partial<EmployeeFormData> = {
          ...restData,
          startDate: convertFirestoreTimestampToDate(employeeData.startDate),
          endDate: convertFirestoreTimestampToDate(employeeData.endDate)
          // We don't pass documents as they can't be serialized as File objects when coming from Firestore
          // The documents will remain available in the employee record for display purposes
        };

        setInitialValues(initialData);
        setEmployeeId(id);
      } catch (error) {
        console.error('Error fetching employee:', error);
        setError(t('error.loading', { ns: 'employees' }));
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id, t]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className='p-6'>
        <Card>
          <div className='text-center'>
            <h2 className='text-xl font-bold text-red-500 mb-4'>{error}</h2>
            <Button onClick={() => navigate('/admin/employees')}>{t('back', { ns: 'common' })}</Button>
          </div>
        </Card>
      </div>
    );
  }

  return <EmployeeForm initialValues={initialValues} employeeId={employeeId} />;
};

export default EmployeeFormWithData;
