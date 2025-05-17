import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import DocSelector from "components/DocSelector";
import CustomerDetailsModal from "components/CustomerDetailsModal";
import type { SelectProps } from "antd";

interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  customerNo: string;
  prefix: string;
  [key: string]: any;
}

interface CustomerSelectorProps extends Omit<SelectProps, "ref"> {
  onAddCallback?: (customer: Customer) => void;
  size?: "small" | "middle" | "large";
}

export interface CustomerSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const CustomerSelector = forwardRef<CustomerSelectorRef, CustomerSelectorProps>(
  ({ onAddCallback, size, ...props }, ref) => {
    const [showAddNew, setShowAddNew] = useState(false);
    const selectRef = useRef<any>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          selectRef.current?.focus();
        },
        blur: () => {
          selectRef.current?.blur();
        },
        clear: () => {
          selectRef.current?.clear();
        },
        isFocused: () => {
          return selectRef.current?.isFocused() ?? false;
        },
        setNativeProps: (nativeProps: any) => {
          selectRef.current?.setNativeProps?.(nativeProps);
        }
      }),
      []
    );

    const handleOk = (newCustomer: Customer) => {
      setShowAddNew(false);
      onAddCallback?.(newCustomer);
    };

    return (
      <>
        <DocSelector
          ref={selectRef}
          collection="data/sales/customers"
          orderBy={["customerId", "firstName", "lastName", "phoneNumber", "customerNo"]}
          labels={["prefix", "firstName", "lastName", "phoneNumber", "customerNo"]}
          size={size || "small"}
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
  }
);

CustomerSelector.displayName = "CustomerSelector";

export default CustomerSelector; 