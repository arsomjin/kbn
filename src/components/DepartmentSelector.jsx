import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useModal } from '../contexts/ModalContext';

const { Option } = Select;

/**
 * DepartmentSelector Component
 *
 * A selector component for departments with optional "All" option.
 * Loads departments from Firestore and provides selection functionality.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.hasAll - Whether to include "All departments" option
 * @param {Object} ref - Component reference for imperative methods
 * @returns {React.ForwardRefExoticComponent} Department selector component
 */
export default forwardRef(({ hasAll, ...props }, ref) => {
  const { t } = useTranslation();
  const { showWarning } = useModal();
  const { departments } = useSelector((state) => state.data);
  const [data, setData] = useState(null);
  const firestore = getFirestore();
  const selectRef = useRef();

  /**
   * Fetches department data from Firestore
   */
  const _getData = useCallback(async () => {
    try {
      const departmentsRef = collection(firestore, 'data', 'company', 'departments');
      const q = query(departmentsRef, where('deleted', '!=', true));
      const querySnapshot = await getDocs(q);
      const docData = {};
      querySnapshot.forEach((doc) => {
        docData[doc.id] = doc.data();
      });
      setData(docData);
    } catch (e) {
      showWarning(e.message || t('common.error'));
    }
  }, [firestore, showWarning, t]);

  useEffect(() => {
    _getData();
  }, [_getData]);

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

  let Options = Object.keys(data || departments).map((it) =>
    (data || departments)[it].department ? (
      <Option key={it} value={it}>
        {(data || departments)[it].department}
      </Option>
    ) : null,
  );

  return (
    <Select
      ref={selectRef}
      placeholder={t('components.departmentSelector.placeholder')}
      showSearch
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      {...props}
    >
      {hasAll
        ? [
            <Option key="all" value="all">
              {t('components.departmentSelector.allDepartments')}
            </Option>,
            ...Options,
          ]
        : Options}
    </Select>
  );
});
