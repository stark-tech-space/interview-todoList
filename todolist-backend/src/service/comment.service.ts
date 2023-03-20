import mongoose from "mongoose";
import { runInTransaction } from "./transaction.util";

import { Comment, IComment, CommentDoc } from '../model/comment';
import { Message } from '../model/message';

async function get(todoId: string) {
  const comments = await Comment.aggregate([
    {
      $match: {
        todoId: new mongoose.Types.ObjectId(todoId)
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
        localField: 'replyTo',
        foreignField: '_id',
        as: 'replyTo',
      }
    },
    { 
      $sort : {
        createTime : 1
      }
    },
  ]);
  return comments;
}

async function create(params: IComment) {
  const now = new Date().getTime();
  const creator = process.env.fakeUserId || ''; // <-- hard code
  
  let newComment;
  await runInTransaction(async (_session) => {
    newComment = await new Comment({
      ...params,
      creator,
      createTime: now,
    }).save();

    await new Message({
      todoId: params.todoId,
      sentFrom: creator,
      sentTo: params.replyTo,
      createTime: now,
      status: 0,
    }).save();
  });
  return newComment;
}

async function update(commentId: string, params: IComment) {
  const now = new Date().getTime();
  const creator = process.env.fakeUserId || ''; // <-- hard code
  
  await runInTransaction(async (_session) => {
    const target: CommentDoc | null = await Comment.findById(commentId).exec();
    if (target) {
      await Comment.updateOne({ _id: commentId }, {
        ...params,
        updateTime: new Date().getTime()
      });
  
      await new Message({
        todoId: target.todoId,
        sentFrom: creator,
        sentTo: params.replyTo || target.replyTo,
        createTime: now,
        status: 0,
      }).save();
    }
  });
}

export default {
  get,
  create,
  update,
}