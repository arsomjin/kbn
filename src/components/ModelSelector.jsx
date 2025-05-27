import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { distinctArr } from 'utils/functions';

const { Option } = Select;

/**
 * ModelSelector - A component for selecting product models/names
 *
 * Features:
 * - i18next translation support for all text content
 * - Search functionality with filter capabilities
 * - Redux integration for model data
 * - Filtering options for used/unused and vehicle/non-vehicle models
 * - Optional "All" option for filtering scenarios
 * - Imperative ref API for external control
 * - Consistent styling and responsive design
 * - Dark mode compatible with Ant Design theming
 *
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Custom placeholder text (overrides translation)
 * @param {boolean} [props.hasAll=false] - Whether to include "All" option
 * @param {boolean} [props.isUsed] - Filter for used/unused models (undefined = all)
 * @param {boolean} [props.isVehicle] - Filter for vehicle/non-vehicle models (undefined = all)
 * @param {Object} [props.style] - Additional style object
 * @param {React.Ref} ref - Forwarded ref for imperative API
 * @returns {JSX.Element} The model selector component
 */
const ModelSelector = forwardRef(({ hasAll = false, isUsed, isVehicle, ...props }, ref) => {
  const { t } = useTranslation();
  const { modelList } = useSelector((state) => state.data);
  const selectRef = useRef();

  const { data } = modelList;

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

  // Process and filter model data
  let modelArray = Object.keys(data || {}).map((key) => data[key]);

  // Remove duplicates based on productCode
  modelArray = distinctArr(modelArray, ['productCode']);

  // Filter by usage status if specified
  if (typeof isUsed !== 'undefined') {
    modelArray = modelArray.filter((model) => (isUsed ? !!model.isUsed : !model.isUsed));
  }

  // Filter by vehicle type if specified
  if (typeof isVehicle !== 'undefined') {
    modelArray = modelArray.filter((model) => (isVehicle ? !!model.isVehicle : !model.isVehicle));
  }

  const modelOptions = modelArray.map((model) => (
    <Option key={model._key} value={model.productPCode}>
      {`${model.model} ${model.productName}`}
    </Option>
  ));

  return (
    <Select
      ref={selectRef}
      placeholder={props?.placeholder || t('modelSelector.placeholder')}
      dropdownStyle={{ minWidth: 320 }}
      style={{ display: 'flex' }}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) => {
        return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      }}
      {...props}
      className={`w-full ${props.className || ''}`}
    >
      {hasAll && (
        <Option key="all" value="all">
          {t('common.all')}
        </Option>
      )}
      {modelOptions}
    </Select>
  );
});

ModelSelector.displayName = 'ModelSelector';

export default ModelSelector;
