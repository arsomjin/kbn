import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import { useResponsive } from 'hooks/useResponsive';
import { useModal } from 'contexts/ModalContext';
import { useAuth } from 'hooks/useAuth';
import { app } from 'config/firebase';
import DebounceSelect from './DebounceSelect';

/**
 * Vehicle ID Selector Component
 * Provides searchable dropdown for vehicle selection with province filtering
 * @param {Object} props - Component props
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} ref - Component reference
 */
export default forwardRef(({ onChange, placeholder, ...props }, ref) => {
  const { t } = useTranslation('components');
  const { showError } = useModal();
  const { currentProvinceId } = useAuth();
  const { isMobile } = useResponsive();

  const db = getFirestore(app);
  const [value, setValue] = useState([]);
  const selectRef = useRef();

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
        setValue([]);
      },

      isFocused: () => {
        return selectRef.current?.isFocused() || false;
      },

      setNativeProps(nativeProps) {
        selectRef.current?.setNativeProps?.(nativeProps);
      },
    }),
    [],
  );

  const handleChange = (newValue) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  /**
   * Fetch vehicle search results with province filtering
   * @param {string} search - Search term
   * @returns {Promise<Array>} Search options
   */
  const fetchSearchList = async (search) => {
    try {
      if (!search || search.length < 2) {
        return [];
      }

      const vehiclesRef = collection(db, 'data', 'inventory', 'vehicles');
      const searchQuery = query(
        vehiclesRef,
        where('provinceId', '==', currentProvinceId),
        where('deleted', '==', false),
        where('active', '==', true),
        orderBy('productCode'),
        limit(50),
      );

      const snapshot = await getDocs(searchQuery);
      const options = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const searchTerm = search.toLowerCase();

        // Filter by search term in productCode, name, or description
        if (
          data.productCode?.toLowerCase().includes(searchTerm) ||
          data.name?.toLowerCase().includes(searchTerm) ||
          data.description?.toLowerCase().includes(searchTerm)
        ) {
          options.push({
            label: `${data.productCode} - ${data.name}`,
            value: doc.id,
            data: data,
          });
        }
      });

      return options;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showError(t('errors.fetchFailed'));
      return [];
    }
  };

  return (
    <DebounceSelect
      ref={selectRef}
      mode="tags"
      value={value}
      placeholder={placeholder || t('vehicle.search.placeholder')}
      fetchOptions={fetchSearchList}
      onChange={handleChange}
      dropdownStyle={{
        minWidth: isMobile ? 200 : 220,
        maxHeight: 300,
      }}
      className="w-full"
      showSearch
      allowClear
      {...props}
    />
  );
});
