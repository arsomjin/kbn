import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import DocSelector from 'components/DocSelector';

export default forwardRef(({ record, ...props }, ref) => {
  const selectRef = useRef();
  const { isUsed, vehicleType } = record || {};

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

  let wheres = [['deleted', '!=', true]];
  if (typeof isUsed !== 'undefined') {
    wheres = wheres.concat([['isUsed', '==', isUsed]]);
  } else {
    wheres = wheres.concat([['isUsed', '==', false]]);
  }
  if (vehicleType) {
    wheres = wheres.concat([['productType', '==', vehicleType]]);
  }

  // showLog({ record, isUsed, vehicleType, props, wheres });

  return (
    <DocSelector
      ref={selectRef}
      collection="data/products/vehicleList"
      orderBy={['productCode', 'name']}
      wheres={wheres}
      size="small"
      dropdownStyle={{ minWidth: 420 }}
      hasKeywords
      isUsed={isUsed}
      {...props}
    />
  );
});
