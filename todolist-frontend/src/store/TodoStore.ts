import { createContext } from 'react';
import { observable, makeObservable, runInAction } from 'mobx';

import type { IUser, ITodo, IFilter, ISort, ITodoParams } from '../type/type.d';
import TodoCreateStore from './TodoCreateStore';
import TodoDetailStore from './TodoDetailStore';

const baseUrl: string = process.env.API_ADDR || '';

export default class TodoStore {
  static context = createContext<TodoStore>({} as TodoStore);

  @observable userList: IUser[] = [];

  @observable filter: IFilter = {};

  @observable todoList: ITodo[] = [];

  @observable todoCreateStore = new TodoCreateStore(baseUrl);

  @observable todoDetailStore = new TodoDetailStore(baseUrl);

  constructor() {
    makeObservable(this);
  }

  updateFilter(filter: IFilter) {
    runInAction(() => {
      this.filter = {
        ...this.filter,
        ...filter
      }
    });
  }

  async loadUser() {
    const handler = await fetch(baseUrl + '/user/get', { method: 'GET' });
    const userList = await handler.json();
    runInAction(() => {
      this.userList = userList || [];
    });
  }

  async loadTodoList(sort: ISort | null = null) {
    let queryStr = Object.keys(this.filter).map(key => {
      const filterKey = key as keyof IFilter;
      if (this.filter[filterKey]) {
        return key + '=' + this.filter[filterKey]
      }
      return '';
    }).filter(it => it).join('&');

    if (sort) {
      queryStr += `&sort=${sort.field},${sort.direction}`
    }

    const address = baseUrl + '/todo/getList?' + queryStr;
    const handler = await fetch(address, { method: 'GET' });
    const todoList = await handler.json();
    runInAction(() => {
      this.todoList = todoList || [];
    });
  }

  async updateTodo(todoId: string, params: ITodoParams) {
    const handler = await fetch(baseUrl + '/todo/' + todoId + '/update', {
      method: 'PUT',
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(params),
    });
    await handler.json();
  }
}
