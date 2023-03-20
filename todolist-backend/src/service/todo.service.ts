import mongoose from "mongoose";
import { runInTransaction } from "./transaction.util";
import { Todo, ITodo, TodoDoc } from "../model/todo";
import { History, HistoryDoc } from "../model/history";

interface ITodoFilter {
  creator?: string;
  createTimeStart?: number;
  createTimeEnd?: number;
}

interface ITotoSort {
  field: string;
  direction: 1 | -1;
}

async function getList(filter: ITodoFilter | null, sort: ITotoSort | null = null) {
  const matchConfig: Record<string, any> = {};
  if (filter?.creator) {
    matchConfig.creator = new mongoose.Types.ObjectId(filter.creator);
    matchConfig.followers = new mongoose.Types.ObjectId(filter.creator);
  }
  if (filter?.createTimeStart && filter?.createTimeEnd) {
    matchConfig.createTime = {
      $gte: filter.createTimeStart,
      $lte: filter.createTimeEnd,
    };
  }

  let sortConfig: Record<string, 1 | -1> = { createTime : -1 };
  if (sort) {
    sortConfig = {
      [sort.field]: sort.direction
    }
  }

  const todos = await Todo.aggregate([
    {
      $match: {
        status: { $ne: -1 },
        ...matchConfig,
     }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator',
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'asignees',
        foreignField: '_id',
        as: 'asignees',
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'followers',
        foreignField: '_id',
        as: 'followers',
      }
    },
    { $sort : sortConfig },
    { $limit: 100 }
  ]);
  return todos;
}

async function getOne(todoId: string) {
  const todo = await Todo.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(todoId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator',
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'asignees',
        foreignField: '_id',
        as: 'asignees',
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'followers',
        foreignField: '_id',
        as: 'followers',
      }
    }
  ]);
  return todo.length > 0 ? todo[0] : null;
}

async function getHistory(todoId: string) {
  const history = await History.aggregate([
    { $match: { todoId: new mongoose.Types.ObjectId(todoId) } },
    {
      $addFields: {
        value: '$value',
        valueExt: {
          $function: {
            body: function(rawStr: string | undefined) {
              if (rawStr?.startsWith('[')) {
                try {
                  const arr: string[] = JSON.parse(rawStr);
                  return arr;
                } catch {}
              }
              return [];
            },
            args: ['$value'],
            lang: 'js'
          }
        }
      }
    },
    {
      $addFields: {
        userObjectIds: {
          $map: {
            input: '$valueExt',
            as: 'it',
            in: { $toObjectId: '$$it' }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userObjectIds',
        foreignField: '_id',
        as: 'valueExt',
      }
    },
    { $unset: 'userObjectIds' },
    { $sort : { createTime : 1 } },
  ]);
  return history.map(it => ({
    ...it,
    value: ['asignees', 'followers'].includes(it.field) ? JSON.stringify(it.valueExt) : it.value,
    valueExt: undefined,
  }));
}

async function create(params: ITodo) {
  let newTodo;
  const creator = process.env.fakeUserId || ''; // <-- hard code
  let followers = [creator];
  if (params.asignees) {
    followers = params.asignees.includes(creator) ? [...params.asignees] : [...params.asignees, creator];
  }

  await runInTransaction(async (_session) => {
    newTodo = await new Todo({
      ...params,
      creator,
      createTime: new Date().getTime(),
      followers,
      status: 0,
    }).save();

    await new History({
      todoId: newTodo._id,
      actionType: 'create',
      createTime: new Date().getTime(),
      operator: creator,
    }).save();
  });
  return newTodo;
}

async function update(todoId: string, params: ITodo) {
  const now = new Date().getTime();
  const creator = process.env.fakeUserId || ''; // <-- hard code

  await runInTransaction(async (_session) => {
    const target: TodoDoc | null = await Todo.findById(todoId).exec();
    if (target) {
      let followers = params.followers ? params.followers : target.followers;
      if (!followers?.includes(creator)) {
        followers?.push(creator);
      }
      let asignees = params.asignees ? params.asignees : target.asignees;
      asignees?.forEach(it => !followers?.includes(it) && followers?.push(it));

      await Todo.updateOne({ _id: todoId }, {
        ...params,
        followers,
        asignees,
        updateTime: now,
        finishTime: params.status === 2 ? now : 0
      });
  
      const histories: HistoryDoc[] = [];
      Object.keys(params).forEach(key => {
        if (params[key as keyof ITodo]) {
          histories.push(new History({
            todoId,
            actionType: 'update',
            field: key,
            value: JSON.stringify(params[key as keyof ITodo]),
            createTime: new Date().getTime(),
            operator: creator,
          }));
        }
      });
      await History.collection.insertMany(histories);
    }
  });
}

export type {
  ITodoFilter,
  ITotoSort,
}

export default {
  getList,
  getOne,
  getHistory,
  create,
  update,
}