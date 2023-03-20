import mongoose from "mongoose";

interface IComment {
  content?: string;
  creator?: string;
  todoId?: string;
  replyTo?: string;
  createTime?: number;
  updateTime?: number;
}

interface CommentDoc extends mongoose.Document, IComment {}

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  todoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Todo",
    required: true,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createTime: {
    type: Number,
    required: true,
  },
  updateTime: {
    type: Number,
  },
});

interface commentInterface extends mongoose.Model<Document> {
  prepare(): Promise<void>
}

const Comment = mongoose.model<Document, commentInterface>('Comment', commentSchema);

Comment.prepare = async () => {
  await Comment.collection.drop();
  await Comment.createCollection();

  await Comment.collection.createIndex({ todoId: 'hashed' });
}

export {
  IComment,
  CommentDoc,
  Comment,
}