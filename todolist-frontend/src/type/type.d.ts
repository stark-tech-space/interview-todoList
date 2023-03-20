interface IUser {
  _id: string;
  nickname: string;
}

interface ITodoParams {
  text?: string;
  creator?: IUser[];
  createTime?: number;
  asignees?: IUser[];
  planTime?: number;
  followers?: IUser[];
  remindTime?: number;
  repeatPeriod?: number;
  updateTime?: number;
  finishTime?: number;
  status?: number;
}

interface ITodo extends ITodoParams {
  _id: string;
}

interface IComment {
  _id: string;
  content: string;
  creator: IUser[];
  todoId: string;
  replyTo?: IUser[];
  createTime: number;
  updateTime?: number;
}

interface ITodoHistory {
  _id: string;
  todoId: string;
  actionType: string;
  field?: string;
  value?: string;
  createTime: number;
  operator: IUser[];
}

interface ISelectOption {
  label: string;
  value: string;
}

interface IFilter {
  creator?: string;
  createTimeStart?: number;
  createTimeEnd?: number;
}

interface ISort {
  field: string;
  direction: 'ASC' | 'DESC';
}

export {
  IUser,
  ITodoParams,
  ITodo,
  IComment,
  ITodoHistory,
  ISelectOption,
  IFilter,
  ISort,
}