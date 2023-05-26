import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import type { Dayjs } from 'dayjs';
import { Button, Popover, Calendar, Divider, Space, Tag } from 'antd';
import dayjs from 'dayjs';

import { planTimeOptions, remindTimeOptions, repeatPeriodOptions } from './options';
import SwitchableSelect from './SwitchableSelect';

interface IProps {
  onSelect: (planTime: number, remindTime: number, repeatPeriod: number) => void;
  planTimeProp?: number;
  remindTimeProp?: number;
  repeatPeriodProp?: number;
  editable?: boolean;
}

const DateTimeSelect = (props: IProps) => {
  const { planTimeProp = 0, remindTimeProp = 0, repeatPeriodProp = 0, onSelect, editable = true } = props;
  const now = dayjs();

  const [open, setOpen] = useState(false);
  const handleOpenChange = (newOpen: boolean) => editable && setOpen(newOpen);

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [label, setLabel] = useState('');

  const [remindTime, setRemindTime] = useState(0);
  const [repeatPeriod, setRepeatPeriod] = useState(0);

  const reset = (planTimeProp: number, remindTimeProp: number, repeatPeriodProp: number) => {
    setSelectedDate(planTimeProp > 0 ? dayjs(planTimeProp) : dayjs());
    setSelectedTime(planTimeProp > 0 ? dayjs(planTimeProp).format('HH:mm') : '18:00');
    setLabel(planTimeProp > 0 ? dayjs(planTimeProp).format('YYYY-MM-DD HH:mm') : '');

    setRemindTime(remindTimeProp);
    setRepeatPeriod(repeatPeriodProp);
  }

  useEffect(() => {
    reset(planTimeProp, remindTimeProp, repeatPeriodProp);
  }, [planTimeProp, remindTimeProp, repeatPeriodProp]);

  const handleSelectDate = (date: Dayjs)=> setSelectedDate(date);
  const handleSelectTime = (time: string) => setSelectedTime(time);

  const handleSelectRemindTime = (value: string) => setRemindTime(parseInt(value));
  const handleSelectRepeatPeriod = (value: string) => setRepeatPeriod(parseInt(value));

  const handleCancel = useCallback(() => {
    setOpen(false);
    reset(planTimeProp, remindTimeProp, repeatPeriodProp);
  }, [planTimeProp, remindTimeProp, repeatPeriodProp]);

  const handleConfirm = useCallback(() => {
    const planTime = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${selectedTime}`).toDate().getTime();
    setLabel(`${selectedDate.format('MM-DD')} ${selectedTime}`);
    onSelect(planTime, remindTime, repeatPeriod);
    setOpen(false);
  }, [selectedDate, selectedTime, remindTime, repeatPeriod, onSelect]);

  const handleDateRemove = useCallback(() => {
    onSelect(0, 0, 0);
  }, [onSelect]);

  return (
    <Popover
      id="datetime-select"
      placement="bottomLeft"
      autoAdjustOverflow={false}
      arrow={false}
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
      getPopupContainer={(trigger: HTMLElement) => (trigger.parentNode as HTMLElement || document.body)}
      content={
        <div className='datetime-pop'>
          <div className='selectedDateTime'>
            {selectedDate.format('YYYY-MM-DD')} {selectedTime}
          </div>
          <Divider className='divider' />
          <Calendar
            fullscreen={false}
            disabledDate={(currentDate: Dayjs) => currentDate.isBefore(now)}
            value={selectedDate}
            onSelect={handleSelectDate}
          />
          <Divider className='divider' />
          <SwitchableSelect
            title='截止时间'
            defaultSelectShown
            value={selectedTime}
            options={planTimeOptions}
            defaultValue="18:00"
            onSelect={handleSelectTime}
          />

          <SwitchableSelect
            title='提醒时间'
            options={remindTimeOptions.filter(it => it.value !== '0')}
            defaultValue="30"
            value={`${remindTime > 0 ? remindTime : ''}`}
            onSelect={handleSelectRemindTime}
          />
          <SwitchableSelect
            title='重复规则'
            options={repeatPeriodOptions.filter(it => it.value !== '0')}
            defaultValue="1"
            value={`${repeatPeriod > 0 ? repeatPeriod : ''}`}
            onSelect={handleSelectRepeatPeriod}
          />
          <Divider className='divider' />
          <div className='buttons'>
            <Space>
              <Button size='small'  onClick={handleCancel}>取消</Button>
              <Button size='small' type='primary' onClick={handleConfirm}>确定</Button>
            </Space>
          </div>
        </div>
      }
    >
      {
        planTimeProp > 0 ? (
          <Tag closable={editable} onClick={() => editable && setOpen(true)} onClose={handleDateRemove}>
            <a>{label}</a>
          </Tag>
        ) : (
          editable && <Button type="text" size='small' className='planTimeBtn' onClick={() => setOpen(true)}>计划完成时间</Button>
        )
      }
      
    </Popover>
  );
}

export default observer(DateTimeSelect);
