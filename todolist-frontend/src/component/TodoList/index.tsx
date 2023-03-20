import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import type { MenuProps } from 'antd';
import type { Dayjs } from 'dayjs';
import { Button, Dropdown, Space, DatePicker, Select } from 'antd';

import { ITodo } from '../../type/type';
import TodoStore from '../../store/TodoStore';
import TodoPanel from '../TodoPanel';
import TodoDetailDrawer from '../TodoDetailDrawer';
import TodoHistoryDrawer from '../TodoHistoryDrawer';

const sortMenu: MenuProps['items'] = [
  {
    key: '1',
    label: <a>按创建时间</a>,
  },
  {
    key: '2',
    label: <a>按计划完成时间</a>,
  },
  {
    key: '3',
    label: <a>按创建者</a>,
  },
]

type RangeValue = [Dayjs | null, Dayjs | null] | null;

const TodoList = () => {
  const todoStore = useContext(TodoStore.context);
  const { userList, todoList, filter, todoDetailStore } = todoStore;

  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);

  const handleTimeRange = (dates: RangeValue) => {
    if (dates?.[0] && dates?.[1]) {
      const startDateStr = dates[0].format('YYYY-MM-DD');
      const endDateStr = dates[1].format('YYYY-MM-DD');
      todoStore.updateFilter({
        createTimeStart: new Date(`${startDateStr} 00:00:00`).getTime(),
        createTimeEnd: new Date(`${endDateStr} 23:59:59`).getTime()
      })
    } else {
      todoStore.updateFilter({
        createTimeStart: 0,
        createTimeEnd: 0
      })
    }
  };

  const handleSelectCreator = (value: string | undefined) => {
    todoStore.updateFilter({ creator: value });
  };

  const handleQuery = () => {
    todoStore.loadTodoList();
  };

  const handleSort: MenuProps['onClick'] = (e) => {
    e.domEvent.stopPropagation();
    const { key } = e;
    if (key === '1') {
      todoStore.loadTodoList({ field: 'createTime', direction: 'DESC' });
    } else if (key === '2') {
      todoStore.loadTodoList({ field: 'planTime', direction: 'DESC' });
    } else if (key === '3') {
      todoStore.loadTodoList({ field: 'creator.nickname', direction: 'ASC' });
    }
  };

  const handleDetail = (todo: ITodo) => {
    setDetailDrawerVisible(true);
    todoDetailStore.setTodo(todo);
    todoDetailStore.loadTodoComments(todo._id)
  }

  const handleHistory = (todo: ITodo) => {
    setHistoryDrawerVisible(true);
    todoDetailStore.setTodo(todo);
    todoDetailStore.loadTodoHistory(todo._id);
  }

  const handleDetailDrawerClose = async () => {
    const { todo, updatedTodoParams } = todoDetailStore;
    if (todo && Object.keys(updatedTodoParams).length > 0) {
      await todoStore.updateTodo(todo._id, updatedTodoParams);
      setDetailDrawerVisible(false);
      await todoStore.loadTodoList();
    } else {
      setDetailDrawerVisible(false);
    }
  }

  return (
    <div className='todo-list-wrap'>
      <div className='todo-list-filter'>
        <Space>
          <span>创建时间:</span>
          <DatePicker.RangePicker onChange={handleTimeRange} />
          <span>创建者:</span>
          <Select
            style={{ width: 120 }}
            value={filter.creator}
            options={userList.map(user => ({
              value: user._id,
              label: user.nickname
            }))}
            allowClear
            onChange={handleSelectCreator}
          />
          <Button onClick={handleQuery}>查询</Button>
          <Dropdown menu={{ items: sortMenu, onClick: handleSort}} placement="bottomRight">
            <Button>排序</Button>
          </Dropdown>
        </Space>
      </div>
      {
        todoList.map(it => (
          <TodoPanel
            key={it._id}
            data={it}
            onDetail={handleDetail}
            onHistory={handleHistory}
          />
        ))
      }

      <TodoDetailDrawer visible={detailDrawerVisible} onClose={handleDetailDrawerClose}  />
      <TodoHistoryDrawer visible={historyDrawerVisible} onClose={() => setHistoryDrawerVisible(false)} />
    </div>
  );
}

export default observer(TodoList);
