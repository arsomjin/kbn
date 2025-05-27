import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import DocSelector from 'components/DocSelector';
import { showLog } from 'utils/functions';

export default forwardRef(({ record, ...props }, ref) => {
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
      },
    }),
    [],
  );

  let wheres = null;
  if (typeof record?.expenseCategoryId !== 'undefined' && !!record?.expenseCategoryId) {
    wheres = [['expenseCategoryId', '==', record.expenseCategoryId]];
  }

  showLog({ wheres, record });

  return (
    <DocSelector
      ref={selectRef}
      collection="data/account/expenseName"
      orderBy={['expenseNameId', 'expenseName']}
      labels={['expenseName', 'expenseCategoryName', 'expenseSubCategoryName']}
      {...(wheres && { wheres })}
      size="small"
      dropdownStyle={{ minWidth: 420 }}
      hasKeywords
      {...props}
    />
  );
});
