import { observable, makeObservable, runInAction } from 'mobx';

import type { ITodoParams, ITodo, IComment, ITodoHistory } from '../type/type';

export default class TodoDetailStore {

  baseUrl: string;

  @observable todo: ITodo | null = null;

  @observable updatedTodoParams: ITodoParams = {};

  @observable comments: IComment[] = [];

  @observable history: ITodoHistory[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    makeObservable(this);
  }

  setTodo(todo: ITodo) {
    runInAction(() => {
      this.todo = todo;
      this.updatedTodoParams = {};
    });
  }

  updateCurTodo(params: ITodoParams) {
    runInAction(() => {
      if (this.todo) {
        Object.assign(this.todo, params);
        Object.assign(this.updatedTodoParams, params);
      }
    });
  }

  async loadTodoComments(todoId?: string) {
    if (todoId || this.todo?._id) {
      const address = this.baseUrl + '/todo/get/' + (todoId || this.todo?._id) + '/comment';
      const handler = await fetch(address, { method: 'GET' });
      const comments = await handler.json();
      runInAction(() => {
        this.comments = comments;
      })
    }
  }

  async loadTodoHistory(todoId: string) {
    const address = this.baseUrl + '/todo/get/' + todoId + '/history';
    const handler = await fetch(address, { method: 'GET' });
    const history = await handler.json();
    runInAction(() => {
      this.history = history;
    })
  }

  async sendComment(content: string, replayTo: string | null = null) {
    const data = {
      replyTo: replayTo || this.todo?.creator?.[0]._id,
      todoId: this.todo?._id,
      content: content,
    }

    const handler = await fetch(this.baseUrl + '/todo/comment/create', {
      method: 'POST',
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(data),
    });
    await handler.json();
  }

  async updateComment(commentId: string, content: string) {
    const handler = await fetch(this.baseUrl + '/todo/comment/' + commentId + '/update', {
      method: 'PUT',
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ content }),
    });
    await handler.json();
  }
}
