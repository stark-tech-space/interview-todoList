import React, { ReactNode, useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { Drawer, Input, Space, Button } from 'antd';
import {
  LoadingOutlined, UserOutlined, ScheduleOutlined, TeamOutlined, EditOutlined, CommentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import type { IUser } from '../../type/type';
import TodoStore from '../../store/TodoStore';
import UserSelect from '../UserSelect';
import DateTimeSelect from '../DateTimeSelect';
import CommentInput from './CommentInput';

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const TodoDetailDrawer = (props: IProps) => {
  const { visible, onClose } = props;

  const todoStore = useContext(TodoStore.context);
  const { userList, todoDetailStore } = todoStore;
  const { comments } = todoDetailStore;

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [curCommentId, setCurCommentId] = useState('');

  const handleUpdateText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    todoDetailStore.updateCurTodo({ text });
  }

  const handleUpdateAsignees = (selectedUsers: IUser[]) => {
    todoDetailStore.updateCurTodo({
      asignees: selectedUsers
    });
  }

  const handleUpdatePlanTime = (planTime: number, remindTime: number, repeatPeriod: number) => {
    todoDetailStore.updateCurTodo({
      planTime,
      remindTime,
      repeatPeriod
    });
  }

  const handleUpdateFollowers = (selectedUsers: IUser[]) => {
    todoDetailStore.updateCurTodo({
      followers: selectedUsers
    });
  }

  const formatContent = (content: string): ReactNode => {
    let formatTokens: ReactNode[] = [];
    const lines: string[] = content.split('\n');
    lines.forEach((line, l) => {
      const tokens: string[] = line.split(' ');
      tokens.forEach((it, k) => {
        let atIndex = it.indexOf('@');
        if (atIndex >= 0) {
          const atStr = it.substring(atIndex + 1);
          if (userList.map(it => it.nickname).includes(atStr)) {
            formatTokens.push(it.substring(0, atIndex));
            formatTokens.push(<span key={`at-${k}`} className='at'>@{it.substring(atIndex)}</span>);
            formatTokens.push(' ')
            return;
          }
        }

        formatTokens.push(it);
        formatTokens.push(' ')
      });

      formatTokens.push(<br key={`line-${l}`}></br>)
    });

    return <>{formatTokens.map(it => it)}</>;
  }

  const handleEditComment = (commentId: string) => {
    setCurCommentId(commentId);
    setShowCommentInput(true);
  }

  const handleCommentInputClose = () => {
    setShowCommentInput(false);
    setCurCommentId('');
  }

  const handleTodoFinish = async () => {
    const { todo } = todoDetailStore;
    if (todo?._id) {
      await todoStore.updateTodo(todo._id, { status: 2 });
      onClose();

      await todoStore.loadTodoList();
    }
  }

  return (
    <Drawer
      title="todo"
      className='todo-drawer'
      width="40%"
      placement="right"
      onClose={onClose}
      afterOpenChange={(open) => { if(!open) setShowCommentInput(false) }}
      open={visible}
    >
      {
        !todoDetailStore.todo ? <LoadingOutlined /> : (
          <div className='todo-detail-wrap'>
            <Input.TextArea
              autoSize
              className='text'
              value={todoDetailStore.todo.text}
              onChange={handleUpdateText}
            />
            <div className='todo-config'>
              <Space>
                <UserOutlined />
                <UserSelect
                  buttonContent={<a>添加负责人</a>}
                  selectedUsers={todoDetailStore.todo.asignees}
                  onSelect={handleUpdateAsignees}
                  editable={todoDetailStore.todo.status !== 2}
                />
              </Space>
            </div>
            <div className='todo-config'>
              <Space>
                <ScheduleOutlined />
                <DateTimeSelect
                  planTimeProp={todoDetailStore.todo.planTime}
                  remindTimeProp={todoDetailStore.todo.remindTime}
                  repeatPeriodProp={todoDetailStore.todo.repeatPeriod}
                  onSelect={handleUpdatePlanTime}
                  editable={todoDetailStore.todo.status !== 2}
                />
              </Space>
            </div>
            <div className='todo-config'>
              <Space>
                <TeamOutlined />
                <UserSelect
                  buttonContent={<a>添加关注人</a>}
                  defaultFollowers={
                    [...(todoDetailStore.todo.creator || []), ...(todoDetailStore.todo.asignees || [])]
                  }
                  selectedUsers={todoDetailStore.todo.followers}
                  onSelect={handleUpdateFollowers}
                  editable={todoDetailStore.todo.status !== 2}
                />
              </Space>
            </div>

            <div className='todo-comment-title'>评论</div>
            <div className='todo-comment-wrap'>
              <div className='todo-comment-list'>
                {
                  comments?.map(it => (
                    <div className={`todo-comment ${curCommentId === it._id ? 'cur' : ''}`} key={it._id}>
                      <div className='todo-comment-head'>
                        <Space>
                          <span>{it.creator[0].nickname}</span>
                          <span>{dayjs(it.createTime).format('YYYY-MM-DD hh:mm')}</span>
                        </Space>
                        <Space className='todo-comment-actions'>
                          <EditOutlined onClick={() => handleEditComment(it._id)} />
                        </Space>
                      </div>
                      <div className='todo-comment-content'>
                        { formatContent(it.content) }
                      </div>
                    </div>
                  ))
                }
              </div>

              {
                showCommentInput
                ? <CommentInput
                    commentId={curCommentId}
                    onClose={handleCommentInputClose}
                  />
                : (
                  <div className='bottom'>
                    <Button onClick={() => setShowCommentInput(true)}><CommentOutlined /></Button>
                    {
                      todoDetailStore.todo.status === 2
                      ? <Button className='finish'>已完成</Button>
                      : <Button className='finish' onClick={handleTodoFinish}>完成任务</Button>
                    }
                  </div>
                )
              }
            </div>
          </div>
        )
      }
    </Drawer>
  )
}

export default observer(TodoDetailDrawer);
