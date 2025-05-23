import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useAntdUi } from '../hooks/useAntdUi';
import { showLog, errorHandler, arrayForEach, distinctArr } from 'utils/functions';
import DebounceSelect from 'components/DebounceSelect';
import { createOptionsFromFirestore, createOptionsFromFirestoreKeywords } from 'utils';
import { hasNameAndSurnamePattern } from 'utils/RegEx';
import { getFirestore, Firestore } from 'firebase/firestore';
import { app } from 'services/firebase';
import { Option, ErrorWithMessage, SelectRef, SelectOption } from '../types/common';

interface DocSelectorProps {
  collection: string;
  orderBy?: string[];
  wheres?: [string, string, any][];
  labels?: string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  mode?: 'multiple' | 'tags';
  hasAll?: boolean;
  allowNotInList?: boolean;
  record?: Record<string, any>;
  value?: string | string[];
  dropdownStyle?: React.CSSProperties;
  dropdownAlign?: 'left' | 'right';
  size?: 'small' | 'middle' | 'large';
  hasKeywords?: boolean;
  showAddNew?: () => void;
  startSearchAt?: number;
  isUsed?: boolean;
  [key: string]: any;
}

const DocSelector = forwardRef<SelectRef, DocSelectorProps>(
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
      value,
      dropdownStyle,
      dropdownAlign,
      size,
      hasKeywords,
      showAddNew,
      startSearchAt,
      isUsed,
      ...props
    },
    ref
  ) => {
    console.log('DocSelector: props:', props);
    const firestore: Firestore = getFirestore(app);
    const isMounted = useRef(true);
    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    const controlledValue = typeof value !== 'undefined' ? value : ['multiple', 'tags'].includes(mode) ? [] : '';
    const selectRef = useRef<any>(null);
    const { message } = useAntdUi();

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
        },
        isFocused: () => {
          return selectRef.current?.isFocused();
        },
        setNativeProps(nativeProps: any) {
          selectRef.current?.setNativeProps(nativeProps);
        }
      }),
      []
    );

    const handleKeyDown = async (event: React.KeyboardEvent) => {
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

    const handleChange = (value: SelectOption | SelectOption[]) => {
      console.log('DocSelector: handleChange called with value:', value);
      if (Array.isArray(value)) {
        onChange?.(value.map(v => v.value as string));
      } else {
        onChange?.(value.value as string);
      }
    };

    // Memoize _fetchSearchList to avoid debounce issues
    const _fetchSearchList = React.useCallback(
      async (search: string) => {
        try {
          console.log('DocSelector: _fetchSearchList called with search:', search);
          if (!search || (search && search.length < (startSearchAt || 4))) {
            console.log('DocSelector: Search text too short, returning empty array');
            return [];
          }
          let list: Option[] = [];
          const sameNameCase = ['data/sales/customers'].includes(collection) && hasNameAndSurnamePattern(search);
          if (sameNameCase) {
            let words = search.split(' ');
            await arrayForEach(words, async (str: string) => {
              if (!!str) {
                let arr = await fetchSearchList(str);
                list = list.concat(arr);
              }
            });
            const distinctList = distinctArr(list, ['label', 'value'], []);
            list = distinctList.map(item => ({
              ...item,
              label: String(item.label),
              value: String(item.value)
            }));
          } else {
            list = await fetchSearchList(search);
          }
          console.log('DocSelector: Returning list:', list);
          return list;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          const customError = new Error(errorMessage) as ErrorWithMessage;
          customError.snap = { function: '_fetchSearchList' };
          message.warning(errorMessage);
          errorHandler(customError);
          return [];
        }
      },
      [collection, orderBy, wheres, labels, startSearchAt, isUsed, showAddNew]
    );

    const fetchSearchList = async (search: string): Promise<Option[]> => {
      try {
        const fProps = {
          searchText: search,
          searchCollection: collection,
          orderBy,
          wheres,
          firestore,
          labels,
          startSearchAt,
          isUsed
        };
        console.log('fProps:', fProps);
        let options: Option[] = hasKeywords
          ? await createOptionsFromFirestoreKeywords(fProps)
          : await createOptionsFromFirestore(fProps);

        if (showAddNew) {
          options = [
            ...options,
            {
              label: 'เพิ่มรายการ...',
              value: 'addNew',
              key: 'addNew',
              className: 'text-light'
            }
          ];
        }
        return options;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        const customError = new Error(errorMessage) as ErrorWithMessage;
        customError.snap = { function: 'fetchSearchList' };
        message.warning(errorMessage);
        errorHandler(customError);
        return [];
      }
    };

    return (
      <DebounceSelect
        showSearch
        mode={mode}
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

DocSelector.displayName = 'DocSelector';

export default DocSelector;
