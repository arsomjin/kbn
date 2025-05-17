import React, { forwardRef, useRef, useImperativeHandle, useState, useEffect } from "react";
import { Select } from "antd";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { showSuccess, showWarn } from "utils/functions";
import { getDocumentsWithCompoundQuery, createDocument } from "utils/firestoreUtils";
import { useProvince } from "hooks/useProvince";
import { usePermission } from "hooks/usePermission";
import ExpenseCategoryDetails from "./ExpenseCategoryDetails";
import { ExpenseCategorySelectorProps, ExpenseCategorySelectorRef, ExpenseCategory } from "./types";

const { Option } = Select;

const ExpenseCategorySelector = forwardRef<ExpenseCategorySelectorRef, ExpenseCategorySelectorProps>(
  ({ onChange, placeholder, noAddable, ...props }, ref) => {
    const { t } = useTranslation();
    const { currentProvince } = useProvince();
    const { hasPermission } = usePermission();
    const { user } = useSelector((state: any) => state.auth);
    const [showAddNew, setShowAddNew] = useState(false);
    const [data, setData] = useState<Record<string, ExpenseCategory> | null>(null);

    const selectRef = useRef<ExpenseCategorySelectorRef>(null);

    const _getData = async () => {
      try {
        const categories = await getDocumentsWithCompoundQuery<ExpenseCategory>(
          "data/account/expenseCategory",
          [
            { field: "deleted", operator: "==", value: false },
            { field: "provinceId", operator: "==", value: currentProvince?.id }
          ]
        );
        
        const categoryMap = categories.reduce((acc, category) => {
          acc[category.expenseCategoryId] = category;
          return acc;
        }, {} as Record<string, ExpenseCategory>);
        
        setData(categoryMap);
      } catch (error) {
        showWarn(error instanceof Error ? error.message : "Failed to fetch categories");
      }
    };

    useEffect(() => {
      _getData();
    }, [currentProvince?.id]);

    useImperativeHandle(ref, () => selectRef.current!, []);

    const handleChange = (value: string) => {
      if (value === "addNew") {
        return showModal();
      }
      onChange?.(value);
    };

    const showModal = () => {
      if (!hasPermission("CREATE")) return;
      setShowAddNew(true);
    };

    const handleOk = async (values: ExpenseCategory) => {
      try {
        if (!hasPermission("CREATE")) return;

        const categoryData = {
          ...values,
          provinceId: currentProvince?.id,
          created: Date.now(),
          inputBy: user.uid,
          deleted: false
        };

        await createDocument(
          "data/account/expenseCategory",
          categoryData,
          values.expenseCategoryId
        );

        await _getData();
        showSuccess(t("common.saveSuccess"));
        setShowAddNew(false);
      } catch (error) {
        showWarn(error instanceof Error ? error.message : "Failed to save category");
      }
    };

    const handleCancel = () => {
      setShowAddNew(false);
    };

    if (!data) {
      return null;
    }

    const Options = Object.values(data)
      .filter(category => !category.deleted)
      .map(category => (
        <Option key={category.expenseCategoryId} value={category.expenseCategoryId}>
          {category.expenseCategoryName}
        </Option>
      ));

    return (
      <>
        <Select
          ref={selectRef}
          placeholder={placeholder || t("expenseCategory.placeholder")}
          optionFilterProp="children"
          filterOption={(input, option) => {
            const optionText = option?.children?.toString() || "";
            return optionText.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }}
          onChange={handleChange}
          dropdownStyle={{ minWidth: 280 }}
          showSearch
          {...props}
        >
          {Options}
          {!noAddable && hasPermission("CREATE") && (
            <Option key="addNew" value="addNew" className="text-light">
              {t("expenseCategory.addNew")}
            </Option>
          )}
        </Select>
        <ExpenseCategoryDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
      </>
    );
  }
);

ExpenseCategorySelector.displayName = "ExpenseCategorySelector";

export default ExpenseCategorySelector; 