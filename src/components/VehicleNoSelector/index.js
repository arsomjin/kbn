import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import DocSelector from 'components/DocSelector';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';

export default forwardRef(({ isUsed, vehicleType, productCode, branchCode, ...props }, ref) => {
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

  let wheres = [];
  if (typeof isUsed !== 'undefined') {
    wheres = [['isUsed', '==', isUsed]];
  }
  if (vehicleType) {
    wheres = wheres.concat([['productType', '==', vehicleType]]);
  }

  if (!!productCode && productCode !== 'undefined') {
    wheres = wheres.concat([['productPCode', '==', removeAllNonAlphaNumericCharacters(productCode)]]);
  }
  if (!!branchCode && typeof branchCode !== 'undefined') {
    wheres = wheres.concat([['branchCode', '==', branchCode]]);
  }
  if (typeof sold !== 'undefined') {
    wheres = wheres.concat([['sold', '==', null]]);
  }

  return (
    <DocSelector
      ref={selectRef}
      collection="sections/stocks/vehicles"
      orderBy={['vehicleNo', 'model']}
      wheres={wheres}
      size="small"
      dropdownStyle={{ minWidth: 420 }}
      hasKeywords
      {...props}
    />
  );
});
