import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { getFirestore } from 'firebase/firestore';
import { useModal } from '../contexts/ModalContext';
import { createOptionsFromFirestore } from 'utils';
import DebounceSelect from './DebounceSelect';

/**
 * PeripheralIdSelector Component
 *
 * A selector component for peripheral IDs with search functionality.
 * Provides debounced search through Firestore peripherals collection.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onChange - Callback function when selection changes
 * @param {string} props.placeholder - Placeholder text for the selector
 * @param {Object} ref - Component reference for imperative methods
 * @returns {React.ForwardRefExoticComponent} Peripheral ID selector component
 */
export default forwardRef(({ onChange, placeholder, ...props }, ref) => {
  const { t } = useTranslation();
  const { showWarning } = useModal();
  const firestore = getFirestore();
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
      },
    }),
    [],
  );

  const handleChange = (value) => {
    setValue(value);
    onChange && onChange(value);
  };

  const fetchSearchList = async (searchText) => {
    try {
      const option = await createOptionsFromFirestore({
        searchText,
        searchCollection: 'sections/stocks/peripherals',
        orderBy: 'peripheralId',
        firestore,
        upperCase: true,
      });
      return option;
    } catch (e) {
      showWarning(e.message || t('common.error'));
    }
  };

  return (
    <DebounceSelect
      ref={selectRef}
      mode="tags"
      value={value}
      placeholder={placeholder || t('components.peripheralIdSelector.placeholder')}
      fetchOptions={fetchSearchList}
      onChange={handleChange}
      dropdownStyle={{ minWidth: 220 }}
      {...props}
    />
  );
});
