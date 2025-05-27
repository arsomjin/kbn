import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import SourceOfDataDetails from './SourceOfDataDetails';
import { FirebaseContext } from '../../firebase';
import { setDataSources } from 'store/slices/dataSlice';
import { tagRender } from 'utils';
import { load } from 'utils/functions';
import { MKT_Channels } from 'data/Constant';
import { createNewId } from 'utils';
import { useModal } from 'contexts/ModalContext';
const { Option } = Select;

const SourceOfDataSelector = forwardRef(
  ({ onChange, value, placeholder, allowNotInList, ...props }, ref) => {
    const { firestore, api } = useContext(FirebaseContext);
    const { dataSources } = useSelector((state) => state.data);
    const { user } = useSelector((state) => state.auth);
    const [showAddNew, setShowAddNew] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [mValue, setValue] = useState(value || []);
    const { showWarn, showSuccess, showMessageBar } = useModal();

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

    useEffect(() => {
      setValue(value);
    }, [value]);

    const handleChange = (value) => {
      // showLog('select', value);
      if (
        (Array.isArray(value) ? (value.length > 0 ? value[value.length - 1] : value[0]) : value) ===
        'addNew'
      ) {
        return showModal();
      }
      onChange && onChange(value);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && allowNotInList) {
        if (mValue.indexOf(searchText) === -1) {
          //  showLog({ searchText, mValue });
          handleChange(mValue ? [...mValue, searchText] : [searchText]);
          setSearchText('');
        } else {
          showMessageBar(`"${searchText}" มีในรายการที่เลือกแล้ว`);
        }
      }
    };

    const showModal = () => {
      setShowAddNew(true);
    };

    const handleOk = async (values) => {
      try {
        //  showLog({ values });
        load(true);
        let mDataSources = JSON.parse(JSON.stringify(dataSources));
        const dataSourcesRef = firestore.collection('data').doc('sales').collection('dataSources');
        let dataSourceId = createNewId('MKT-CHA');
        await dataSourcesRef.doc(dataSourceId).set({
          ...values,
          created: Date.now(),
          inputBy: user.uid,
          dataSourceId,
        });
        mDataSources[dataSourceId] = {
          ...values,
          dataSourceId,
          created: Date.now(),
          inputBy: user.uid,
        };
        dispatch(setDataSources(mDataSources));
        await api.updateData('dataSources', dataSourceId);
        load(false);
        showSuccess('บันทึกข้อมูลสำเร็จ', 3, () => setShowAddNew(false));
        setShowAddNew(false);
      } catch (e) {
        showWarn(e.message || e);
        load(false);
      }
    };

    const handleCancel = () => {
      setShowAddNew(false);
    };

    let Options = Object.keys(MKT_Channels).map((dl) => (
      <Option key={dl} value={MKT_Channels[dl].name}>
        {MKT_Channels[dl].name}
      </Option>
    ));

    return (
      <>
        <Select
          ref={selectRef}
          showSearch
          style={{ width: '100%' }}
          mode="tags"
          showArrow
          tagRender={tagRender}
          placeholder={placeholder || 'แหล่งที่มา'}
          optionFilterProp="children"
          filterOption={(input, option) => {
            return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }}
          value={mValue}
          onChange={handleChange}
          onSearch={(txt) => setSearchText(txt)}
          searchValue={searchText}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {Options}
          {/* <Option key="addNew" value="addNew" className="text-light">
            เพิ่มรายการ...
          </Option> */}
        </Select>

        <SourceOfDataDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
      </>
    );
  },
);

export default SourceOfDataSelector;
