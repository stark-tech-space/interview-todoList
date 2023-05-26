import React, { ReactNode, useContext, useCallback, useState } from 'react';
import { observer } from 'mobx-react';
import { Button, Popover, Input, List, Space, Tag } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

import type { IUser } from '../../type/type';
import TodoStore from '../../store/TodoStore';

interface IProps {
  onSelect: (selectedUsers: IUser[]) => void;
  defaultFollowers?: IUser[];
  buttonContent?: ReactNode;
  placeholder?: string;
  selectedUsers?: IUser[];
  editable?: boolean;
}

const UserSelect = (props: IProps) => {
  const { onSelect, defaultFollowers, buttonContent, placeholder, selectedUsers = [], editable = true } = props;

  const todoStore = useContext(TodoStore.context);
  const { userList } = todoStore;

  const [userInput, setUserInput] = useState('');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleUserClick = useCallback((user: IUser) => {
    const newSelectedUsers = [...selectedUsers, {...user}];
    onSelect(newSelectedUsers);
    setUserInput('');
  }, [selectedUsers, onSelect]);

  const handleUserRemove = useCallback((userId: string) => {
    const newSelectedUsers = selectedUsers.filter(it => it._id !== userId);
    onSelect(newSelectedUsers);
  }, [selectedUsers, onSelect]);

  return (
    <>
      {
        selectedUsers.map(user => (
          <Tag
            key={user._id}
            closable={editable && !defaultFollowers?.map(it => it._id).includes(user._id)}
            onClose={() => handleUserRemove(user._id)}
          >
            {user.nickname}
          </Tag>
        ))
      }
      {
        editable && (
          <Popover
            placement="bottomLeft"
            autoAdjustOverflow={false}
            arrow={false}
            trigger="click"
            content={
              <Space direction='vertical'>
                <Input
                  id="todo-create-userInput"
                  placeholder={placeholder}
                  value={userInput}
                  onChange={handleInput}
                />
                <List
                  dataSource={
                    userList
                      .filter(it => !selectedUsers?.map(it => it.nickname).includes(it.nickname))
                      .filter(it => it.nickname.startsWith(userInput))
                  }
                  renderItem={(item) => (
                    <List.Item className='userListItem' onClick={() => handleUserClick(item)}>
                      <div className="nickname">{item.nickname}</div>
                    </List.Item>
                  )}
                />
              </Space>
            }
            onOpenChange={(open) => open && setUserInput('')}
          >
            <Button type="text" size='small'>
              { buttonContent || <UserAddOutlined /> }
            </Button>
          </Popover>
        )
      }
    </>
  );
}

export default observer(UserSelect);
