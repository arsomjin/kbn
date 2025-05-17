import React, { forwardRef, useRef, useImperativeHandle, useState } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { collection, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "services/firebase";
import { showWarn, showSuccess } from "utils/functions";
import { createNewId } from "utils/functions";
import ServiceDetails from "./ServiceDetails";
import type { ServiceFormValues } from "./ServiceDetails";

const { Option } = Select;

interface Service {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  created?: number;
  updated?: number;
  inputBy?: string;
  updateBy?: string;
  [key: string]: any;
}

interface ServiceSelectorProps extends Omit<SelectProps, "ref"> {
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  noAddable?: boolean;
  allowNotInList?: boolean;
}

export interface ServiceSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const ServiceSelector = forwardRef<ServiceSelectorRef, ServiceSelectorProps>(
  ({ onChange, placeholder, noAddable, allowNotInList, ...props }, ref) => {
    const { services } = useSelector((state: any) => state.data);
    const { user } = useSelector((state: any) => state.auth);
    const [showAddNew, setShowAddNew] = useState(false);
    const [mValue, setValue] = useState<string | string[] | null>(null);
    const [searchTxt, setSearchTxt] = useState("");

    const dispatch = useDispatch();
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

    const handleChange = (value: string | string[]) => {
      if (value === "addNew") {
        return showModal();
      }
      setValue(value);
      onChange?.(value);
    };

    const handleSearch = (txt: string) => {
      setSearchTxt(txt);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" && allowNotInList) {
        if (["multiple", "tags"].includes(props.mode || "")) {
          handleChange(Array.isArray(mValue) ? [...mValue, searchTxt] : [searchTxt]);
          setValue([]);
        } else {
          handleChange(searchTxt);
        }
      }
    };

    const showModal = () => {
      setShowAddNew(true);
    };

    const handleOk = async (values: ServiceFormValues, type: "add" | "edit" | "delete") => {
      try {
        let mServices = JSON.parse(JSON.stringify(services));
        const servicesRef = collection(firestore, "data/sales/services");
        let serviceId: string;

        if (type === "add") {
          serviceId = createNewId("SERV");
          await setDoc(doc(servicesRef, serviceId), {
            ...values,
            serviceId,
            created: Date.now(),
            inputBy: user.uid
          });
          mServices[serviceId] = {
            ...values,
            serviceId,
            created: Date.now(),
            inputBy: user.uid
          };
        } else if (type === "edit") {
          serviceId = values.serviceId || "";
          await updateDoc(doc(servicesRef, serviceId), {
            ...values,
            serviceId,
            updated: Date.now(),
            updateBy: user.uid
          });
          mServices[serviceId] = {
            ...values,
            serviceId,
            updated: Date.now(),
            updateBy: user.uid
          };
        } else {
          serviceId = values.serviceId || "";
          await deleteDoc(doc(servicesRef, serviceId));
          mServices = Object.fromEntries(
            Object.entries(mServices).filter(([_, l]: [string, any]) => l.serviceId !== serviceId)
          );
        }

        dispatch({ type: "SET_SERVICES", payload: mServices });
        showSuccess({ content: "บันทึกข้อมูลสำเร็จ" });
        setShowAddNew(false);
      } catch (e) {
        showWarn((e as Error).message);
      }
    };

    const handleCancel = () => {
      setShowAddNew(false);
    };

    const Options = Object.keys(services).map((it) => (
      <Option key={it} value={it}>
        {`${services[it].serviceCode} / ${services[it].serviceName}`}
      </Option>
    ));

    return (
      <>
        <Select
          ref={selectRef}
          showSearch
          placeholder={placeholder || "พิมพ์ชื่อ/รหัสบริการ"}
          optionFilterProp="children"
          filterOption={(input, option) => {
            if (!option || !option.children) return false;
            return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }}
          onChange={handleChange}
          onSearch={handleSearch}
          onKeyDown={handleKeyDown}
          dropdownStyle={{ minWidth: 340 }}
          {...props}
        >
          {Options}
          {!noAddable && (
            <Option key="addNew" value="addNew" className="text-light">
              เพิ่ม/แก้ไข รายชื่อ...
            </Option>
          )}
        </Select>
        {showAddNew && <ServiceDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />}
      </>
    );
  }
);

ServiceSelector.displayName = "ServiceSelector";

export default ServiceSelector; 