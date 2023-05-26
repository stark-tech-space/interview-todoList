import React, { useCallback, useEffect, useState, useContext } from 'react';
import { Input, Button } from 'antd';

import type { IUser } from '../../type/type';
import TodoStore from '../../store/TodoStore';

function copyStyle(sourceEle: HTMLElement, targetEle: HTMLElement) {
  var computedStyle = window.getComputedStyle(sourceEle);
  Array.from(computedStyle).forEach((key) => {
    return targetEle.style.setProperty(
      key,
      computedStyle.getPropertyValue(key),
      computedStyle.getPropertyPriority(key)
    );
  });
}

interface IProps {
  onClose: () => void;
  commentId?: string;
}

const CommentInput = (props: IProps) => {
  const { onClose, commentId } = props;

  const todoStore = useContext(TodoStore.context);
  const { userList, todoDetailStore } = todoStore;

  const [input, setInput] = useState('');
  const [tipPosition, setTipPosition] = useState({ left: '0', top: '0', display: 'none' });
  const [tipList, setTipList] = useState([] as IUser[]);
  const [atIndex, setAtIndex] = useState(-1);
  const [curTipIndex, setCurTipIndex] = useState(-1);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value || '';
    setInput(input);

    const spanEle = document.getElementById('input-copy');
    if (spanEle) {
      spanEle.textContent = input;

      const atIndex = input.lastIndexOf('@');
      setAtIndex(atIndex);
      if (input.length > 0 && atIndex === input.length - 1) {
        setTipList(userList);

        const { offsetHeight, offsetWidth, offsetLeft, offsetTop } = spanEle;
        const left = `${offsetLeft + offsetWidth}px`;
        const top = `${offsetTop + offsetHeight}px`;
        setTipPosition({ left, top, display: 'block' });
      } else if (atIndex >= 0) {
        const atStr = input.substring(atIndex + 1);
        const availableUserOptions =  userList.filter(user => user.nickname.startsWith(atStr));
        if (availableUserOptions.length === 0) {
          setTipPosition({ left: '0', top: '0', display: 'none' });
        } else {
          setTipList(availableUserOptions);
          
          const { offsetHeight, offsetWidth, offsetLeft, offsetTop } = spanEle;
          const left = `${offsetLeft + offsetWidth}px`;
          const top = `${offsetTop + offsetHeight}px`;
          setTipPosition({ left, top, display: 'block' });
        }
      }
    }
  }

  const handleTipClick = useCallback((user: IUser) => {
    const newInput = input.substring(0, atIndex) + '@' + user.nickname + ' ';
    setInput(newInput);

    setTipPosition({ left: '0', top: '0', display: 'none' });
    document.getElementById('comment-textarea')?.focus();
  }, [input, atIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (tipPosition.display !== 'none') {
      if (e.key === 'ArrowDown') {
        setCurTipIndex(prevIndex => (prevIndex + 1) % tipList.length);
      } else if (e.key === 'ArrowUp') {
        e.stopPropagation();
        e.preventDefault();
        
        setCurTipIndex(prevIndex => (prevIndex - 1 + tipList.length) % tipList.length);
      } else if (e.key === 'Enter' && curTipIndex >= 0) {
        e.stopPropagation();
        e.preventDefault();

        handleTipClick(tipList[curTipIndex]);
        setTipPosition({ left: '0', top: '0', display: 'none' });
        document.getElementById('comment-textarea')?.focus();
      } else {
        setTipPosition({ left: '0', top: '0', display: 'none' });
      }
    }
  }, [tipPosition, tipList, curTipIndex, handleTipClick]);

  const handleSendComment = useCallback(async () => {
    if (commentId) {
      await todoDetailStore.updateComment(commentId, input);
    } else {
      await todoDetailStore.sendComment(input);
    }
    
    await todoDetailStore.loadTodoComments();
    onClose();
  }, [commentId, input, todoDetailStore, onClose]);

  useEffect(() => {
    const textareaEle = document.getElementById('comment-textarea');
    const divEle = document.getElementById('underlayer');
    if (textareaEle && divEle) {
      copyStyle(textareaEle, divEle);
      divEle.style.height = 'auto';
      divEle.style.position = 'absolute';
      divEle.style.left = '0px';
      divEle.style.top = '0px';
      divEle.style.visibility = 'hidden';
    }
  }, []);

  useEffect(() => {
    if (commentId) {
      const { comments } = todoDetailStore;
      const index = comments.findIndex(it => it._id === commentId);
      if (index >= 0) {
        setInput(comments[index].content);
      }
    }
  }, [commentId, todoDetailStore])

  return (
    <div className='comment-input'>
      <div id='underlayer' style={{ visibility: 'hidden' }}>
        <span id="input-copy"></span>
      </div>
      <Input.TextArea
        id="comment-textarea"
        rows={3}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
      />
      <div className='tip' style={{...tipPosition}}>
        {
          tipList.map((it, index) => (
            <div className={`tip-item ${curTipIndex === index ? 'cur' : ''}`} key={it._id} onClick={() => handleTipClick(it)}>
              {it.nickname}
            </div>
          ))
        }
      </div>
      <div className='comment-buttons'>
        <Button size='small' onClick={onClose}>取消</Button>
        <Button type='primary' size='small' onClick={handleSendComment}>确定</Button>
      </div>
    </div>
  );
}

export default CommentInput;
