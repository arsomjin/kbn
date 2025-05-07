import React from 'react';

interface InputItemsProps {
  items: string[];
  onItemChange: (index: number, value: string) => void;
}

const InputItems: React.FC<InputItemsProps> = ({ items, onItemChange }) => {
  return (
    <div>
      {items.map((item, index) => (
        <input
          key={index}
          value={item}
          onChange={(e) => onItemChange(index, e.target.value)}
        />
      ))}
    </div>
  );
};

export default InputItems;