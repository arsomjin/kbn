import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import PlantDetails from './PlantDetails';
import { FirebaseContext } from '../../firebase';
import { setPlants } from 'store/slices/dataSlice';
import { tagRender } from 'utils';
import { createNewId } from 'utils';
import { useModal } from 'contexts/ModalContext';
const { Option } = Select;

const PlantSelector = forwardRef(({ onChange, placeholder, ...props }, ref) => {
  const { firestore, api } = useContext(FirebaseContext);
  const { plants } = useSelector((state) => state.data);
  const { user } = useSelector((state) => state.auth);
  const [showAddNew, setShowAddNew] = useState(false);
  const { showWarn, showSuccess } = useModal();

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
    //  showLog('select', value);
    if (
      (Array.isArray(value) ? (value.length > 0 ? value[value.length - 1] : value[0]) : value) ===
      'addNew'
    ) {
      return showModal();
    }
    onChange && onChange(value);
  };

  const showModal = () => {
    setShowAddNew(true);
  };

  const handleOk = async (values) => {
    try {
      //  showLog({ values });
      // Add plant.
      let mPlants = JSON.parse(JSON.stringify(plants));
      const plantsRef = firestore.collection('data').doc('sales').collection('plants');
      let plantId = createNewId('PLANT');
      await plantsRef.doc(plantId).set({
        ...values,
        created: Date.now(),
        inputBy: user.uid,
        plantId,
      });
      mPlants[plantId] = {
        ...values,
        plantId,
        created: Date.now(),
        inputBy: user.uid,
      };
      dispatch(setPlants(mPlants));
      await api.updateData('plants', plantId);
      showSuccess('บันทึกข้อมูลสำเร็จ', 3, () => setShowAddNew(false));
      setShowAddNew(false);
    } catch (e) {
      showWarn(e.message || e);
    }
  };

  const handleCancel = () => {
    setShowAddNew(false);
  };

  // const tagRender = (props) => {
  // //  showLog('plant_props', props);
  //   const { label, value, closable, onClose } = props;

  //   return (
  //     <Tag
  //       color={tagColors[Math.floor(Math.random() * tagColors.length)]}
  //       closable={closable}
  //       onClose={onClose}
  //       style={{ marginRight: 3 }}
  //     >
  //       {label}
  //     </Tag>
  //   );
  // };

  let Options = Object.keys(plants).map((dl) => (
    <Option key={dl} value={dl}>
      {plants[dl].name}
    </Option>
  ));

  return (
    <>
      <Select
        ref={selectRef}
        showSearch
        mode="tags"
        tagRender={tagRender}
        placeholder={placeholder || 'พืชไร่'}
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={handleChange}
        {...props}
      >
        {Options}
        <Option key="addNew" value="addNew" className="text-light">
          เพิ่มรายการ...
        </Option>
      </Select>
      <PlantDetails onOk={handleOk} onCancel={handleCancel} visible={showAddNew} />
    </>
  );
});

export default PlantSelector;
