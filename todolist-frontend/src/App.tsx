import React, { useEffect, useContext } from 'react';
import { observer, useLocalObservable } from 'mobx-react';
import zhCN from 'antd/locale/zh_CN';
import { ConfigProvider, Input, Button, Space } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import './App.css';

import type { IUser } from './type/type';
import TodoStore from './store/TodoStore';
import UserSelect from './component/UserSelect';
import DateTimeSelect from './component/DateTimeSelect';
import TodoList from './component/TodoList';

dayjs.locale('en');

const TodoStoreContextProvider = TodoStore.context.Provider;

const App = observer(() => {
  const todoStore = useContext(TodoStore.context);
  const { todoCreateStore } = todoStore;
  const { newTodoParams } = todoCreateStore;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    todoCreateStore.updateNewTodo({
      text: e.target.value
    });
  }

  const handleSelectAsignee = (selectedUsers: IUser[]) => {
    todoCreateStore.updateNewTodo({
      asignees: selectedUsers
    });
  }

  const handleSelectPlanTime = (planTime: number, remindTime: number, repeatPeriod: number) => {
    todoCreateStore.updateNewTodo({
      planTime,
      remindTime,
      repeatPeriod
    });
  }

  const handleCreate = async () => {
    await todoCreateStore.createTodo();
    todoCreateStore.clearNewTodoParams();
    await todoStore.loadTodoList();
  }

  return (
    <div className='wrap'>
      <div className='head'>
        <div className='head-title'>Todo List</div>
        <div className='head-content'>
          <Input placeholder="Basic usage" value={newTodoParams.text} onChange={handleInput} />
          <div className="head-action-bar">
            <Space>
              <UserSelect
                selectedUsers={newTodoParams.asignees}
                placeholder='添加负责人'
                onSelect={handleSelectAsignee}
              />
              <DateTimeSelect
                planTimeProp={newTodoParams.planTime}
                remindTimeProp={newTodoParams.remindTime}
                repeatPeriodProp={newTodoParams.repeatPeriod}
                onSelect={handleSelectPlanTime}
              />
            </Space>
            <div>
              <Button type="primary" onClick={handleCreate} disabled={!newTodoParams.text?.trim()}>
                创建
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className='content'>
        <TodoList />
      </div>
    </div>
  );
});

export default observer(function() {
  const todoStore = useLocalObservable(() => new TodoStore());

  useEffect(() => {
    todoStore.loadTodoList();
    todoStore.loadUser();
  }, [todoStore]);

  return (
    <TodoStoreContextProvider value={todoStore}>
      <ConfigProvider locale={zhCN}>
        <App />
      </ConfigProvider>
    </TodoStoreContextProvider>
  );
});