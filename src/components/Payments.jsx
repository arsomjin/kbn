import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useModal } from '../contexts/ModalContext';
import { formatPaymentItemData } from 'modules/Utils';
import MTable from 'components/Table';
import { TableSummary } from './Table/helper';

/**
 * Payments Component
 *
 * A table component for managing payment items with different payment types,
 * amounts, banks, and customer/person information.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.value - Array of payment items
 * @param {Function} props.onChange - Callback function when payment data changes
 * @param {boolean} props.disabled - Whether the table is disabled for editing
 * @param {boolean} props.byCustomer - Whether to show customer or person column
 * @param {boolean} props.permanentDelete - Whether to allow permanent deletion
 * @returns {React.ReactElement} Payments table component
 */
const Payments = ({ value, onChange, disabled, byCustomer, permanentDelete = false }) => {
  const { t } = useTranslation();
  const { showWarning } = useModal();

  const initPaymentItem = {
    key: 0,
    id: 0,
    paymentType: 'cash',
    amount: null,
    ...(byCustomer ? { customer: null, customerName: null } : { person: null, personName: null }),
    selfBank: null,
  };

  const [data, setData] = useState([]);

  useEffect(() => {
    // Initialize table data from props
    const initData = value.map((item, i) => ({
      ...item,
      key: i.toString(),
      id: i,
    }));
    setData(initData);
  }, [value]);

  const handleDataChange = async (arr, dataIndex, rowIndex) => {
    try {
      if (dataIndex && ['customer'].includes(dataIndex)) {
        let formatArr = await formatPaymentItemData(arr, dataIndex, rowIndex);
        onChange && onChange(formatArr);
      } else {
        onChange && onChange(arr);
      }
    } catch (e) {
      showWarning(e.message || t('common.error'));
    }
  };

  const columns = [
    {
      title: t('components.payments.order'),
      dataIndex: 'id',
      align: 'center',
    },
    {
      title: t('components.payments.type'),
      dataIndex: 'paymentType',
      required: true,
      editable: !disabled,
      align: 'center',
    },
    {
      title: t('components.payments.amount'),
      dataIndex: 'amount',
      number: true,
      required: true,
      align: 'right',
      editable: !disabled,
    },
    {
      title: t('components.payments.bank'),
      dataIndex: 'selfBank',
      ellipsis: true,
      editable: !disabled,
      align: 'center',
    },
    {
      title: t('components.payments.paymentMethod'),
      dataIndex: 'paymentMethod',
      ellipsis: true,
      editable: !disabled,
      align: 'center',
    },
    {
      title: byCustomer
        ? t('components.payments.customer')
        : t('components.payments.transferPerson'),
      dataIndex: byCustomer ? 'customer' : 'person',
      editable: !disabled,
      align: 'center',
    },
  ];

  return (
    <div className="w-full">
      <MTable
        dataSource={value}
        columns={columns}
        canAdd={!disabled}
        onChange={handleDataChange}
        permanentDelete={permanentDelete}
        defaultRowItem={initPaymentItem}
        disabled={disabled}
        tableProps={{
          pagination: false,
          bordered: true,
          tableLayout: 'auto',
          scroll: { x: 'max-content' },
          summary: (pageData) => (
            <TableSummary
              pageData={pageData}
              dataLength={data.length}
              startAt={1}
              sumKeys={['amount']}
            />
          ),
          rowClassName: (record) => (record?.deleted ? 'deleted-row' : ''),
        }}
      />
    </div>
  );
};

export default Payments;
