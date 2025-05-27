import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getFirestore } from 'firebase/firestore';
import { useModal } from '../contexts/ModalContext';
import DebounceSelect from './DebounceSelect';
import { createOptionsFromFirestore, createOptionsFromFirestoreKeywords } from 'utils';
import { arrayForEach, distinctArr } from 'utils/functions';
import { hasNameAndSurnamePattern } from 'utils/RegEx';
import { errorHandler } from '../utils/functions';

/**
 * DocSelector Component
 * A searchable dropdown component that fetches options from Firestore collections
 * @param {Object} props - Component props
 * @param {string} props.collection - Firestore collection path
 * @param {string} props.orderBy - Field to order results by
 * @param {Array} props.wheres - Where conditions for filtering
 * @param {Array} props.labels - Field labels for display
 * @param {Function} props.onChange - Callback when selection changes
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.mode - Selection mode (single, multiple, tags)
 * @param {boolean} props.hasAll - If true, includes "All" option
 * @param {boolean} props.allowNotInList - If true, allows values not in list
 * @param {any} props.value - Controlled value
 * @param {Object} props.dropdownStyle - Dropdown styling
 * @param {boolean} props.hasKeywords - If true, searches keywords
 * @param {Function} props.showAddNew - Callback for add new functionality
 * @param {number} props.startSearchAt - Minimum characters to start search
 * @param {boolean} props.isUsed - Filter for used/unused items
 * @param {Object} ref - Component reference
 */
const DocSelector = forwardRef(
  (
    {
      collection,
      orderBy,
      wheres,
      labels,
      onChange,
      placeholder,
      mode,
      hasAll,
      allowNotInList,
      value, // use value from props for controlled behavior
      dropdownStyle,
      dropdownAlign,
      hasKeywords,
      showAddNew,
      startSearchAt,
      isUsed,
      firestore: firestoreProp,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation('components');
    const { showWarning } = useModal();
    const firestore = firestoreProp || getFirestore();
    const isMounted = useRef(true);
    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);
    // Instead of using internal state for value, use the passed-in value directly.
    // If value is undefined, default based on mode.
    const controlledValue =
      typeof value !== 'undefined' ? value : ['multiple', 'tags'].includes(mode) ? [] : '';

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

    // We no longer manage an internal state for value.
    // Instead, we directly use the controlledValue from props.

    const handleKeyDown = async (event) => {
      if (event.key === 'Enter' && allowNotInList) {
        let newValue = controlledValue;
        if (['multiple', 'tags'].includes(mode)) {
          if (
            !controlledValue ||
            (Array.isArray(controlledValue) && controlledValue.length === 0)
          ) {
            showWarning(t('docSelector.noSearchText'));
            return;
          } else if (Array.isArray(controlledValue) && controlledValue.includes('addNew')) {
            return;
          }
          newValue = Array.isArray(controlledValue)
            ? [...controlledValue, controlledValue[controlledValue.length - 1]]
            : controlledValue;
        }
        handleChange(newValue);
      }
    };

    const handleChange = (val) => {
      // Extract the actual value from labelInValue format
      let actualValue = val;
      if (val && typeof val === 'object' && 'value' in val) {
        // Single selection with labelInValue
        actualValue = val.value;
      } else if (Array.isArray(val)) {
        // Multiple selection with labelInValue
        actualValue = val.map((item) =>
          item && typeof item === 'object' && 'value' in item ? item.value : item,
        );
      }

      // If the value is the special 'addNew' option, trigger showAddNew.
      if (
        Array.isArray(actualValue)
          ? actualValue[actualValue.length - 1] === 'addNew'
          : actualValue === 'addNew'
      ) {
        return showAddNew && showAddNew();
      }
      // Directly propagate the actual value change.
      onChange && onChange(actualValue);
    };

    const fetchSearchList = React.useCallback(
      async (search) => {
        try {
          const fProps = {
            searchText: search,
            searchCollection: collection,
            orderBy,
            wheres,
            firestore,
            labels,
            startSearchAt,
            isUsed,
          };

          let option = hasKeywords
            ? await createOptionsFromFirestoreKeywords(fProps)
            : await createOptionsFromFirestore(fProps);

          if (showAddNew) {
            option = [
              ...option,
              {
                label: t('docSelector.addNew'),
                value: 'addNew',
                key: 'addNew',
                className: 'text-light',
              },
            ];
          }
          return option;
        } catch (e) {
          console.error('[DocSelector] fetchSearchList error:', e);
          showWarning(e.message || t('common.error'));
          return [];
        }
      },
      [
        collection,
        orderBy,
        wheres,
        firestore,
        labels,
        startSearchAt,
        isUsed,
        hasKeywords,
        showAddNew,
        t,
        showWarning,
      ],
    );

    // Memoize _fetchSearchList to avoid debounce issues
    const _fetchSearchList = React.useCallback(
      async (search) => {
        try {
          if (!search || (search && search.length < (startSearchAt || 4))) {
            return [];
          }
          let list = [];
          const sameNameCase =
            ['data/sales/customers'].includes(collection) && hasNameAndSurnamePattern(search);
          if (sameNameCase) {
            let words = search.split(' ');
            await arrayForEach(words, async (str) => {
              if (str) {
                let arr = await fetchSearchList(str);
                list = list.concat(arr);
              }
            });
            const distinctList = distinctArr(list, ['label', 'value'], []);
            list = distinctList.map((item) => ({
              ...item,
              label: String(item.label),
              value: String(item.value),
            }));
          } else {
            list = await fetchSearchList(search);
          }
          return list;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          const customError = new Error(errorMessage);
          customError.snap = { function: '_fetchSearchList' };
          console.warn(errorMessage);
          errorHandler(customError);
          return [];
        }
      },
      [startSearchAt, collection, fetchSearchList],
    );

    return (
      <DebounceSelect
        showSearch={true}
        mode={mode}
        hasAll={hasAll}
        value={controlledValue}
        placeholder={placeholder || t('docSelector.searchPlaceholder')}
        fetchOptions={_fetchSearchList}
        onChange={handleChange}
        styles={{ popup: { root: dropdownStyle || { minWidth: 220 } } }}
        onKeyDown={handleKeyDown}
        dropdownAlign={dropdownAlign}
        {...props}
      />
    );
  },
);

export default DocSelector;
