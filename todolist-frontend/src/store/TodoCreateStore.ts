import { observable, makeObservable, runInAction } from 'mobx';

import type { ITodoParams } from '../type/type';

export default class TodoCreateStore {

  baseUrl: string;

  @observable newTodoParams: ITodoParams = { text: '' };

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    makeObservable(this);
  }

  clearNewTodoParams() {
    runInAction(() => {
      this.newTodoParams = { text: '' };
    });
  }

  updateNewTodo(params: ITodoParams) {
    runInAction(() => {
      Object.assign(this.newTodoParams, params);
    });
  }

  async createTodo() {
    const data = { ...this.newTodoParams };
    if (!data.text) {
      return;
    }

    const handler = await fetch(this.baseUrl + '/todo/create', {
      method: 'POST',
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(data),
    });
    await handler.json()
  }
}