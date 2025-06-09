import React, { useContext, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { FirebaseContext } from '../firebase';
import { showWarn } from 'functions';
import DebounceSelect from './DebounceSelect';
import { showLog } from 'functions';
import { createOptionsFromFirestore, createOptionsFromFirestoreKeywords } from 'utils';
import { errorHandler } from 'functions';
import { arrayForEach, distinctArr } from 'functions';
import { hasNameAndSurnamePattern } from 'utils/RegEx';

export default forwardRef(
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
      record,
      value, // use value from props for controlled behavior
      dropdownStyle,
      dropdownAlign,
      size,
      hasKeywords,
      showAddNew,
      startSearchAt,
      isUsed,
      geographic = null, // ← Enhanced: Accept geographic context from LayoutWithRBAC
      respectRBAC = true, // ← Enhanced: Enable/disable RBAC filtering
      ...props
    },
    ref
  ) => {
    const { firestore } = useContext(FirebaseContext);
    const isMounted = useRef(true);
    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);
    // Instead of using internal state for value, use the passed-in value directly.
    // If value is undefined, default based on mode.
    const controlledValue = typeof value !== 'undefined' ? value : ['multiple', 'tags'].includes(mode) ? [] : '';

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

    // We no longer manage an internal state for value.
    // Instead, we directly use the controlledValue from props.

    const handleKeyDown = async event => {
      if (event.key === 'Enter' && allowNotInList) {
        let newValue = controlledValue;
        if (['multiple', 'tags'].includes(mode)) {
          if (!controlledValue || (Array.isArray(controlledValue) && controlledValue.length === 0)) {
            return showLog('No search text');
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

    const handleChange = val => {
      // If the value is the special 'addNew' option, trigger showAddNew.
      if (Array.isArray(val) ? val[val.length - 1] === 'addNew' : val === 'addNew') {
        return showAddNew && showAddNew();
      }
      // Directly propagate the value change.
      onChange && onChange(val);
    };

    const _fetchSearchList = async search => {
      try {
        if (!search || (search && search.length < (startSearchAt || 3))) {
          return [];
        }
        let list = [];
        const sameNameCase = ['data/sales/customers'].includes(collection) && hasNameAndSurnamePattern(search);
        if (sameNameCase) {
          let words = search.split(' ');
          await arrayForEach(words, async str => {
            if (!!str) {
              let arr = await fetchSearchList(str);
              list = list.concat(arr);
            }
          });
          list = distinctArr(list, ['label', 'value']);
        } else {
          list = await fetchSearchList(search);
        }
        // return isMounted.current ? list : [];
        return list;
      } catch (e) {
        showWarn(e);
        errorHandler({
          e,
          snap: { function: '_fetchSearchList' }
        });
      }
    };

    const fetchSearchList = async search => {
      try {
        // Enhanced: Add geographic filters automatically
        let enhancedWheres = wheres || [];
        
        if (respectRBAC && geographic?.getQueryFilters) {
          const geoFilters = geographic.getQueryFilters();
          
          // Auto-inject provinceId if available
          if (geoFilters.provinceId) {
            enhancedWheres = [...enhancedWheres, ['provinceId', '==', geoFilters.provinceId]];
          }
          
          // Auto-inject branchCode if available  
          if (geoFilters.branchCode) {
            enhancedWheres = [...enhancedWheres, ['branchCode', '==', geoFilters.branchCode]];
          }
        }

        const fProps = {
          searchText: search,
          searchCollection: collection,
          orderBy,
          wheres: enhancedWheres, // ← Enhanced: Include geographic filters
          firestore,
          labels,
          startSearchAt,
          isUsed
        };
        
        let option = hasKeywords
          ? await createOptionsFromFirestoreKeywords(fProps)
          : await createOptionsFromFirestore(fProps);

        console.log('fetchSearchList with geographic filtering', { 
          fProps, 
          geoFilters: geographic?.getQueryFilters?.(),
          option 
        });
        
        // Enhanced: Apply additional filtering if needed
        if (respectRBAC && geographic?.filterFetchedData) {
          option = geographic.filterFetchedData(option, (item) => ({
            provinceId: item.provinceId,
            branchCode: item.branchCode
          }));
        }
          
        if (!!showAddNew) {
          option = [
            ...option,
            {
              label: 'เพิ่มรายการ...',
              value: 'addNew',
              key: 'addNew',
              className: 'text-light'
            }
          ];
        }
        return option;
      } catch (e) {
        showWarn(e);
        errorHandler({
          e,
          snap: { function: 'fetchSearchList' }
        });
      }
    };

    return (
      <DebounceSelect
        ref={selectRef}
        mode={mode}
        hasAll={hasAll}
        value={controlledValue}
        placeholder={placeholder || 'พิมพ์เพื่อค้นหา...'}
        fetchOptions={_fetchSearchList}
        onChange={handleChange}
        dropdownStyle={dropdownStyle || { minWidth: 220 }}
        onKeyDown={handleKeyDown}
        dropdownAlign={dropdownAlign}
        {...props}
      />
    );
  }
);
