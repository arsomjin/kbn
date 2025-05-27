import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import DealerDetails from './DealerDetails';
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useModal } from '../contexts/ModalContext';
import { setDealers } from 'store/slices/dataSlice';
import { createNewId } from 'utils';

const { Option } = Select;

/**
 * DealerSelector Component
 * Provides a searchable dropdown for selecting dealers with add/edit functionality
 * @param {Object} props - Component props
 * @param {Function} props.onChange - Callback function when selection changes
 * @param {string} props.placeholder - Placeholder text for the selector
 * @param {boolean} props.noAddable - If true, hides the add new option
 * @param {boolean} props.allowNotInList - If true, allows entering values not in the list
 * @param {Object} ref - Component reference for imperative methods
 */
export default forwardRef(({ onChange, placeholder, noAddable, allowNotInList, ...props }, ref) => {
  const { t } = useTranslation('components');
  const firestore = getFirestore();
  const { showWarning, showSuccess } = useModal();
  const { dealers } = useSelector((state) => state.data);
  const { user } = useSelector((state) => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const [mValue, setValue] = useState(null);
  const [searchTxt, setSearchTxt] = useState('');

  const dispatch = useDispatch();

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
    //  showLog('change', value);
    if (value === 'addNew') {
      return showModal();
    }
    setValue(value);
    onChange && onChange(value);
  };

  const handleSearch = (txt) => {
    setSearchTxt(txt);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && allowNotInList) {
      //  showLog({ searchTxt, mValue });
      if (['multiple', 'tags'].includes(props.mode)) {
        handleChange(mValue ? [...mValue, searchTxt] : [searchTxt]);
        setValue([]);
      } else {
        handleChange(searchTxt);
      }
    }
  };

  const showModal = () => {
    setShowAddNew(true);
  };

  const handleOk = async (values, type) => {
    try {
      let mDealers = JSON.parse(JSON.stringify(dealers));
      const dealersRef = collection(firestore, 'data', 'sales', 'dealers');
      let dealerId;
      if (type === 'add') {
        dealerId = createNewId('DEAL');
        await setDoc(doc(dealersRef, dealerId), {
          ...values,
          created: Date.now(),
          inputBy: user.uid,
          dealerId,
        });
        mDealers[dealerId] = {
          ...values,
          dealerId,
          created: Date.now(),
          inputBy: user.uid,
        };
      } else if (type === 'edit') {
        dealerId = values.dealerId;
        await updateDoc(doc(dealersRef, values.dealerId), {
          ...values,
          updated: Date.now(),
          updateBy: user.uid,
        });
        mDealers[values.dealerId] = {
          ...values,
          updated: Date.now(),
          updateBy: user.uid,
        };
      } else {
        await deleteDoc(doc(dealersRef, values.dealerId));
        mDealers = mDealers.filter((l) => l.dealerId !== values.dealerId);
      }
      dispatch(setDealers(mDealers));
      // await api.updateData('dealers', dealerId); // Remove or refactor if api is not modular
      showSuccess(t('dealerSelector.saveSuccess'));
      setShowAddNew(false);
    } catch (e) {
      showWarning(e.message || t('common.error'));
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  let Options = Object.keys(dealers).map((dl) => (
    <Option key={dl} value={dl}>
      {/* <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {`${dealers[dl].dealerCode} / ${dealers[dl].dealerName}`}
        <Tooltip title="แก้ไข">
          <Button
            onClick={() => onEditOption(dl)}
            icon={<EditOutlined style={{ color: 'lightgray' }} />}
            ghost
            size="small"
          />
        </Tooltip>
      </div>
    </Option> */}
      {`${dealers[dl].dealerCode} / ${dealers[dl].dealerName}`}
    </Option>
  ));

  return (
    <>
      <Select
        ref={selectRef}
        showSearch
        placeholder={placeholder || t('dealerSelector.placeholder')}
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={handleChange}
        onSearch={handleSearch}
        onKeyDown={handleKeyDown}
        styles={{ popup: { root: { minWidth: 340 } } }}
        {...props}
      >
        {Options}
        {!noAddable && (
          <Option key="addNew" value="addNew" className="text-light">
            {t('dealerSelector.addEdit')}
          </Option>
        )}
      </Select>
      {showAddNew && <DealerDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />}
    </>
  );
});
