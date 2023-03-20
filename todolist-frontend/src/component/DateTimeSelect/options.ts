import type { ISelectOption } from '../../type/type.d';

const planTimeOptions: ISelectOption[] = [];
for (let i=0; i<24; i++) {
  let mm = i < 10 ? `0${i}` : i;
  planTimeOptions.push({
    label: `${mm}:00`,
    value: `${mm}:00`,
  });
  planTimeOptions.push({
    label: `${mm}:30`,
    value: `${mm}:30`,
  })
}

const remindTimeOptions: ISelectOption[] = [
  { label: '截止前5分钟', value: '5' },
  { label: '截止前15分钟', value: '15' },
  { label: '截止前30分钟', value: '30' },
  { label: '截止前1小时', value: '60' },
  { label: '不提醒', value: '0' },
]

const repeatPeriodOptions: ISelectOption[] = [
  { label: '每天重复', value: '1' },
  { label: '每周重复', value: '7' },
  { label: '每月重复', value: '30' },
  { label: '不重复', value: '0' },
]

export {
  planTimeOptions,
  remindTimeOptions,
  repeatPeriodOptions,
}