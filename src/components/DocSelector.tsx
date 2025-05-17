import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { showWarn, showLog, errorHandler, arrayForEach, distinctArr } from 'utils/functions';
import DebounceSelect from 'components/DebounceSelect';
import { createOptionsFromFirestore, createOptionsFromFirestoreKeywords } from 'utils';
import { hasNameAndSurnamePattern } from 'utils/RegEx';
import { getFirestore, Firestore } from 'firebase/firestore';
import { app } from 'services/firebase';

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

interface SelectRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  setNativeProps: (props: any) => void;
}

interface Option {
  label: string;
  value: string;
  key?: string;
  className?: string;
  [key: string]: any;
}

interface ErrorWithMessage extends Error {
  message: string;
  snap?: {
    function: string;
  };
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
    const firestore: Firestore = getFirestore(app);
    const isMounted = useRef(true);
    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    const controlledValue = typeof value !== 'undefined' ? value : ['multiple', 'tags'].includes(mode) ? [] : '';
    const selectRef = useRef<any>(null);

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

    const handleChange = (val: string | string[]) => {
      if (Array.isArray(val) ? val[val.length - 1] === 'addNew' : val === 'addNew') {
        return showAddNew?.();
      }
      onChange?.(val);
    };

    const _fetchSearchList = async (search: string): Promise<Option[]> => {
      try {
        if (!search || (search && search.length < (startSearchAt || 3))) {
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
        return isMounted.current ? list : [];
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        const customError = new Error(errorMessage) as ErrorWithMessage;
        customError.snap = { function: '_fetchSearchList' };
        showWarn(errorMessage);
        errorHandler(customError);
        return [];
      }
    };

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
        showWarn(errorMessage);
        errorHandler(customError);
        return [];
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

DocSelector.displayName = 'DocSelector';

export default DocSelector; 