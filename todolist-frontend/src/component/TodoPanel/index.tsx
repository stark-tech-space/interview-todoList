import React, { useContext } from 'react';
import type { MenuProps } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Button, Checkbox, Dropdown, Space } from 'antd';
import { EllipsisOutlined, BellOutlined, RetweetOutlined, CheckCircleFilled } from '@ant-design/icons';
import dayjs from 'dayjs';

import { ITodo } from '../../type/type';
import TodoStore from '../../store/TodoStore';

const items: MenuProps['items'] = [
  {
    key: '1',
    label: <a>查看历史记录</a>,
  },
  {
    key: '2',
    label: <a>删除任务</a>,
  },
];

interface IProps {
  data: ITodo;
  onDetail: (todo: ITodo) => void;
  onHistory: (todo: ITodo) => void;
}

const TodoPanel = (props: IProps) => {
  const { data, onDetail, onHistory } = props;

  const todoStore = useContext(TodoStore.context);

  const now = new Date().getTime();
  const expired= 0 < (data.planTime || 0) && (data.planTime || 0) < now;

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    e.domEvent.stopPropagation();
    const { key } = e;
    if (key === '1') {
      onHistory(data);
    } else if (key === '2') {
      await todoStore.updateTodo(data._id, { status: -1 });
      await todoStore.loadTodoList();
    }
  };

  const handleCheckboxClick = async (todoId: string, finished: boolean) => {
    await todoStore.updateTodo(todoId, { status: finished ? 2 : 1 });
    await todoStore.loadTodoList();
  }

  return (
    <div className='todo-wrap'>
      {
        (data.finishTime || 0) > 0
        ? <CheckCircleFilled style={{ color: '#4caf50' }} onClick={() => handleCheckboxClick(data._id, false)} />
        : <Checkbox
            checked={data.status === 2}
            onChange={(e: CheckboxChangeEvent) => handleCheckboxClick(data._id, e.target.checked)}
          ></Checkbox>
      }
      <div className='todo' onClick={() => onDetail(data)}>
        <div className='title'>
          <div>{data.text}</div>
          <Dropdown
            placement="bottomRight"
            menu={{
              items,
              onClick: handleMenuClick
            }}
          >
            <Button type="text" size='small' onClick={handleDropdownClick}>
              <EllipsisOutlined />
            </Button>
          </Dropdown>
        </div>
        {
          <div className='info'>
            <Space>
              <span className={expired ? 'expired' : ''}>
                { (data.planTime || 0) > 0 ? `${dayjs(data.planTime).format('MM-DD')}截止` : '未安排' }
              </span>
              <span className='info-sub'>
                { data.creator && data.creator[0].nickname} 创建于 {dayjs(data.createTime).format('MM-DD') }
              </span>
              { (data.remindTime || 0) > 0 && <BellOutlined className='info-sub' /> }
              { (data.repeatPeriod || 0) > 0 && <RetweetOutlined className='info-sub' /> }
            </Space>
          </div>
        }
      </div>
    </div>
  );
}

export default TodoPanel;
