import { Request, Response } from 'express';
import type { ITodoFilter, ITotoSort } from '../service/todo.service';
import todoService from '../service/todo.service';
import { ITodo } from '../model/todo';
import { UserDoc } from '../model/user';

async function getList(req: Request, res: Response) {
  const { creator, createTimeStart, createTimeEnd, sort } = req.query;
  let filter = null;
  if (creator || createTimeStart || createTimeEnd) {
    filter = {
      creator,
      createTimeStart: parseInt(createTimeStart as string),
      createTimeEnd: parseInt(createTimeEnd as string),
    } as ITodoFilter;
  }

  let formatSort = null;
  if (sort) {
    const sortParams: string[] = (sort as string).split(',');
    if (sortParams[0] && sortParams[1]) {
      formatSort = {
        field: sortParams[0],
        direction: sortParams[1] === 'ASC' ? 1 : -1,
      } as ITotoSort;
    }
  }

  try {
    const todos = await todoService.getList(filter, formatSort);
    return res.status(200).send(todos);
  } catch (err) {
    console.error('[Error] todo getList:', err);
  }
  return res.status(500).send([]);
}

async function getOne(req: Request, res: Response) {
  const { todoId } = req.params;
  if (!todoId) {
    return res.status(406).send({});
  }

  try {
    const todo = await todoService.getOne(todoId);
    return res.status(200).send(todo);
  } catch (err) {
    console.error('[Error] todo getOne:', err);
  }
  return res.status(500).send({});
}

async function getHistory(req: Request, res: Response) {
  const { todoId } = req.params;
  if (!todoId) {
    return res.status(406).send({});
  }

  try {
    const history = await todoService.getHistory(todoId);
    return res.status(200).send(history);
  } catch (err) {
    console.error('[Error] todo getHistory:', err);
  }
  return res.status(500).send({});
}

async function create(req: Request, res: Response) {
  if (req.body) {
    const { text, planTime, asignees, remindTime, repeatPeriod } = req.body;
    if (!text) {
      return res.status(406).send({});
    }

    try {
      const todo = await todoService.create({
        text,
        planTime,
        asignees: (asignees as UserDoc[])?.map(it => it._id),
        remindTime,
        repeatPeriod,
      });
      return res.status(200).send(todo);
    } catch (err) {
      console.error('[Error] todo create:', err);
    }
  }
  return res.status(500).send({});
}

async function update(req: Request, res: Response) {
  const { todoId } = req.params;
  if (!todoId) {
    return res.status(406).send({});
  }

  const fields = ['text', 'planTime', 'asignees', 'followers', 'remindTime', 'repeatPeriod', 'status'];
  const params: ITodo = {};
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      const key = field as keyof ITodo;
      params[key] = req.body[key];
    }
  });

  const { followers, asignees } = req.body;
  if (followers) {
    params.followers = (followers as UserDoc[])?.map(it => it._id);
  }
  if (asignees) {
    params.asignees = (asignees as UserDoc[])?.map(it => it._id);
  }

  try {
    await todoService.update(todoId, params);
    return res.status(200).send({ re: 'ok' });
  } catch (err) {
    console.error('Todo更新失败:', err);
  }
  return res.status(500).send({});
}

export default {
  getList,
  getOne,
  getHistory,
  create,
  update,
}