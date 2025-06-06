import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import DocSelector from 'components/DocSelector';

export default forwardRef(({ ...props }, ref) => {
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

  return (
    <DocSelector
      ref={selectRef}
      collection="data/account/expenseCategory"
      orderBy={['expenseCategoryId']}
      labels={['expenseCategoryName']}
      size="small"
      dropdownStyle={{ minWidth: 420 }}
      hasKeywords
      {...props}
    />
  );
});
