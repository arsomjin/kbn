import React, { forwardRef, useRef, useImperativeHandle, useState } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { collection, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "services/firebase";
import { showWarn, showSuccess } from "utils/functions";
import { createNewId } from "utils/functions";
import ExpenseNameDetails from "./ExpenseNameDetails";
import type { ExpenseNameFormValues } from "./ExpenseNameDetails";

const { Option } = Select;

interface ExpenseName {
  expenseNameId: string;
  expenseName: string;
  created?: number;
  updated?: number;
  inputBy?: string;
  updateBy?: string;
  [key: string]: any;
}

interface ExpenseNameSelectorProps extends Omit<SelectProps, "ref"> {
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  noAddable?: boolean;
  allowNotInList?: boolean;
}

export interface ExpenseNameSelectorRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (nativeProps: any) => void;
}

const ExpenseNameSelector = forwardRef<ExpenseNameSelectorRef, ExpenseNameSelectorProps>(
  ({ onChange, placeholder, noAddable, allowNotInList, ...props }, ref) => {
    const { expenseNames } = useSelector((state: any) => state.data);
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

    const handleOk = async (values: ExpenseNameFormValues, type: "add" | "edit" | "delete") => {
      try {
        let mExpenseNames = JSON.parse(JSON.stringify(expenseNames));
        const expenseNamesRef = collection(firestore, "data/company/expenseNames");
        let expenseNameId: string;

        if (type === "add") {
          expenseNameId = createNewId("EXP");
          await setDoc(doc(expenseNamesRef, expenseNameId), {
            ...values,
            expenseNameId,
            created: Date.now(),
            inputBy: user.uid
          });
          mExpenseNames[expenseNameId] = {
            ...values,
            expenseNameId,
            created: Date.now(),
            inputBy: user.uid
          };
        } else if (type === "edit") {
          expenseNameId = values.expenseNameId || "";
          await updateDoc(doc(expenseNamesRef, expenseNameId), {
            ...values,
            expenseNameId,
            updated: Date.now(),
            updateBy: user.uid
          });
          mExpenseNames[expenseNameId] = {
            ...values,
            expenseNameId,
            updated: Date.now(),
            updateBy: user.uid
          };
        } else {
          expenseNameId = values.expenseNameId || "";
          await deleteDoc(doc(expenseNamesRef, expenseNameId));
          mExpenseNames = Object.fromEntries(
            Object.entries(mExpenseNames).filter(([_, l]: [string, any]) => l.expenseNameId !== expenseNameId)
          );
        }

        dispatch({ type: "SET_EXPENSE_NAMES", payload: mExpenseNames });
        showSuccess({ content: "บันทึกข้อมูลสำเร็จ" });
        setShowAddNew(false);
      } catch (e) {
        showWarn((e as Error).message);
      }
    };

    const handleCancel = () => {
      setShowAddNew(false);
    };

    const Options = Object.keys(expenseNames).map((it) => (
      <Option key={it} value={it}>
        {expenseNames[it].expenseName}
      </Option>
    ));

    return (
      <>
        <Select
          ref={selectRef}
          showSearch
          placeholder={placeholder || "พิมพ์ชื่อรายจ่าย"}
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
        {showAddNew && <ExpenseNameDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />}
      </>
    );
  }
);

ExpenseNameSelector.displayName = "ExpenseNameSelector";

export default ExpenseNameSelector;