import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { DataInputType } from 'data/Constant';

/**
 * InputMethodSelector - Modern input method selector component with radio buttons
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the selector
 * @param {boolean} props.disabled - Disable the component
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Change handler function
 */
const InputMethodSelector = forwardRef(
  ({ placeholder, disabled = false, value, onChange, ...props }, ref) => {
    const { t } = useTranslation();
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
        },
        isFocused: () => {
          return selectRef.current?.isFocused();
        },
        setNativeProps(nativeProps) {
          selectRef.current?.setNativeProps(nativeProps);
        },
      }),
      [],
    );

    return (
      <div className="w-full">
        <Radio.Group
          ref={selectRef}
          placeholder={placeholder || t('components.inputMethod.placeholder')}
          disabled={disabled}
          value={value}
          onChange={onChange}
          className="w-full"
          {...props}
        >
          <Radio.Button value="importFromFile" className="flex-1 text-center">
            {DataInputType.importFromFile || t('components.inputMethod.importFromFile')}
          </Radio.Button>
          <Radio.Button value="manualInput" className="flex-1 text-center">
            {DataInputType.manualInput || t('components.inputMethod.manualInput')}
          </Radio.Button>
        </Radio.Group>
      </div>
    );
  },
);

InputMethodSelector.displayName = 'InputMethodSelector';

export default InputMethodSelector;
