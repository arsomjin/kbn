import React, { useContext, useRef, forwardRef, useImperativeHandle } from 'react';
import { FirebaseContext } from '../firebase';
import { showWarn } from 'functions';
import { createOptionsFromFirestore } from 'utils';
import DebounceSelect from './DebounceSelect';

export default forwardRef(({ onChange, placeholder, ...props }, ref) => {
  const { firestore } = useContext(FirebaseContext);
  const [value, setValue] = React.useState([]);

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

  const handleChange = value => {
    //  showLog('select', value);
    setValue(value);
    onChange && onChange(value);
  };

  const fetchSearchList = async searchText => {
    try {
      const option = await createOptionsFromFirestore({
        searchText,
        searchCollection: 'sections/stocks/peripherals',
        orderBy: 'peripheralId',
        firestore,
        upperCase: true
      });
      return option;
    } catch (e) {
      showWarn(e);
    }
  };

  return (
    <DebounceSelect
      ref={selectRef}
      mode="tags"
      value={value}
      placeholder="พิมพ์เพื่อค้นหา..."
      fetchOptions={fetchSearchList}
      onChange={handleChange}
      dropdownStyle={{ minWidth: 220 }}
    />
  );
});
