import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { Drawer, Timeline } from 'antd';
import dayjs from 'dayjs';

import { IUser } from '../../type/type';
import TodoStore from '../../store/TodoStore';
import { remindTimeOptions, repeatPeriodOptions } from '../DateTimeSelect/options';

type actionTypeKey = 'create' | 'update' | 'remove';
const actionTypeLabel: Record<actionTypeKey, string> = {
  create: '创建',
  update: '更新',
  remove: '删除'
}

const validFields = ['text', 'followers', 'asignees', 'planTime', 'remindTime', 'repeatPeriod', 'status'];
function isValidField(field: string): field is fieldTypeKey {
  return validFields.indexOf(field) !== -1;
}

type fieldTypeKey = typeof validFields[number];
const fieldLabel: Record<fieldTypeKey, { label: string, value?: (v: string) => string}> = {
  text: {
    label: '任务内容',
    value: (v) => v,
  },
  followers: {
    label: '关注人',
    value: (v) => {
      let arr: IUser[];
      try {
        arr = JSON.parse(v);
        return arr && arr.map(it => it.nickname).join(',');
      } catch (err) {
        console.log('JSON parsing error:', v)
      }
      return '';
    }
  },
  asignees: {
    label: '负责人',
    value: (v) => {
      let arr: IUser[];
      try {
        arr = JSON.parse(v);
        return arr && arr.map(it => it.nickname).join(',');
      } catch (err) {
        console.log('JSON parsing error:', v)
      }
      return '';
    }
  },
  planTime: {
    label: '计划完成时间',
    value: (v) => {
      const ts = parseInt(v);
      if (ts > 0) {
        return dayjs(ts).format('YYYY-MM-DD hh:mm')
      }
      return '未安排';
    }
  },
  remindTime: {
    label: '提醒时间',
    value: (v) => {
      const index = remindTimeOptions.findIndex(it => it.value === v);
      if (index >= 0) {
        return remindTimeOptions[index].label;
      }
      return '';
    }
  },
  repeatPeriod: {
    label: '重复规则',
    value: (v) => {
      const index = repeatPeriodOptions.findIndex(it => it.value === v);
      if (index >= 0) {
        return repeatPeriodOptions[index].label;
      }
      return '';
    }
  },
  status: {
    label: '状态',
    value: (v) => {
      const map: Record<string, string> = {
        '-1': '已删除',
        '0': '新建',
        '1': '进行中',
        '2': '已完成'
      }
      return map[v];
    }
  }
}

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const TodoHistoryDrawer = (props: IProps) => {
  const { visible, onClose } = props;

  const todoStore = useContext(TodoStore.context);
  const { todoDetailStore } = todoStore;
  const { history } = todoDetailStore;

  const items = history
    .map(it => {
      if (!it.field || isValidField(it.field)) {
        let content = `${actionTypeLabel[it.actionType as actionTypeKey]}了${it.field && isValidField(it.field) ? fieldLabel[it.field as fieldTypeKey].label : '任务'}`;
        if (it.field && isValidField(it.field)) {
          const valueFun = fieldLabel[it.field as fieldTypeKey].value;
          const label = valueFun ? valueFun(it.value as string) : '';
          if (label) {
            content += `: ${label}`;
          }
        }
        return {
          children: (
            <div>
              <p>{dayjs(it.createTime).format('YYYY-MM-DD hh:mm:ss')}</p>
              <p>
                {content}
              </p>
            </div>
          )
        }
      }
      return {};
    })
    .filter(it => it.children);

  return (
    <Drawer
      title="历史记录"
      className='todo-history-drawer'
      width="40%"
      placement="right"
      onClose={onClose}
      open={visible}
    >
      {
        history?.length > 0 && (
          <Timeline
            items={items}
          />
        )
      }
    </Drawer>
  )
}

export default observer(TodoHistoryDrawer);
