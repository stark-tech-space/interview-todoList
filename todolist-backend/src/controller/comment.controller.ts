import { Request, Response } from 'express';

import commentService from '../service/comment.service';

async function get(req: Request, res: Response) {
  const { todoId } = req.params;
  if (!todoId) {
    return res.status(406).send([]);
  }

  try {
    const comments = await commentService.get(todoId);
    return res.status(200).send(comments);
  } catch (err) {
    console.error('[Error] todo comment get:', err);
  }
  return res.status(500).send([]);
}

async function create(req: Request, res: Response) {
  const { replyTo, todoId, content } = req.body;
  if (!todoId) {
    return res.status(406).send([]);
  }

  try {
    const comment = await commentService.create({ replyTo, todoId, content });
    return res.status(201).send(comment);
  } catch (err) {
    console.error('[Error] todo comment create:', err);
  }
  return res.status(500).send({});
}

async function update(req: Request, res: Response) {
  const { commentId } = req.params;
  if (!commentId) {
    return res.status(406).send([]);
  }
  
  const { content } = req.body;
  try {
    await commentService.update(commentId, { content });
    return res.status(200).send({ re: 'ok' });
  } catch (err) {
    console.error('[Error] todo comment update:', err);
  }
  return res.status(500).send({});
}

export default {
  get,
  create,
  update
}