import React, { useCallback, useEffect, useState } from 'react';
import { Button, Select, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import type { ISelectOption } from '../../type/type.d';

interface IProps {
  title: string;
  options: ISelectOption[];
  onSelect: (selectedValue: string) => void;
  value?: string;
  defaultSelectShown?: boolean;
  defaultValue?: string;
}

const SwitchableSelect = (props: IProps) => {
  const { title, options, onSelect, value, defaultSelectShown = false, defaultValue } = props;

  const [selectShown, setSelectShown] = useState(defaultSelectShown);

  useEffect(() => {
    const showSelect = value ? true : false;
    setSelectShown(showSelect);
  }, [value]);

  const handleShowSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(defaultValue || '');
  }, [onSelect, defaultValue]);

  const handleHideSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectShown(false)
    onSelect('0');
  }, [onSelect]);

  const handleSelect = useCallback((value: string) => {
    onSelect(value);
  }, [onSelect])

  return (
    <Space className='datetime-extra'>
      {
        selectShown ? (
          <>
            {title}
            <Select
              style={{ width: 135 }}
              defaultValue={defaultValue}
              value={value}
              options={options}
              onSelect={handleSelect}
            />
            <Button type='text' onClick={handleHideSelect}><CloseOutlined /></Button>
          </>
        ) : (
          <Button type='link' onClick={handleShowSelect}>+ {title}</Button>
        )
      }
    </Space>
  );
}

export default SwitchableSelect;
