import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Edit3 } from 'lucide-react';

const EditableField = ({
  isEditing,
  value,
  displayElement,
  onSave,
  onCancel,
  onEdit,
  inputProps = {},
  className = ''
}) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(editValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (isEditing) {
    const InputComponent = inputProps.type === 'textarea' ? 'textarea' : 'input';
    
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <InputComponent
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          {...inputProps}
        />
        <button
          onClick={handleSave}
          className="text-green-600 hover:text-green-700"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-2 ${className}`}>
      {displayElement}
      <button
        onClick={onEdit}
        className="text-gray-400 hover:text-gray-600"
      >
        <Edit3 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EditableField;