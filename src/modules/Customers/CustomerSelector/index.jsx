import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import DocSelector from 'components/DocSelector';
import CustomerDetailsModal from '../CustomerDetailsModal';

export default forwardRef(({ onAddCallback, size, ...props }, ref) => {
  const [showAddNew, setShowAddNew] = useState(false);

  const selectRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        selectRef.current.focus();
      },

      blur: () => {
        selectRef.current.blur();
      },

      clear: () => {
        selectRef.current.clear();
      },

      isFocused: () => {
        return selectRef.current.isFocused();
      },

      setNativeProps(nativeProps) {
        selectRef.current.setNativeProps(nativeProps);
      }
    }),
    []
  );

  const handleOk = newCustomer => {
    setShowAddNew(false);
    !!onAddCallback && onAddCallback(newCustomer);
  };

  return (
    <>
      <DocSelector
        ref={selectRef}
        collection="data/sales/customers"
        orderBy={['customerId', 'firstName', 'lastName', 'phoneNumber', 'customerNo']}
        labels={['prefix', 'firstName', 'lastName', 'phoneNumber', 'customerNo']}
        size={size || 'small'}
        dropdownStyle={{ minWidth: 420 }}
        showAddNew={() => setShowAddNew(true)}
        {...props}
      />
      <CustomerDetailsModal
        selectedCustomer={{}}
        visible={showAddNew}
        onOk={handleOk}
        onCancel={() => setShowAddNew(false)}
      />
    </>
  );
});
