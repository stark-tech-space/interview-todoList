import mongoose from "mongoose";

interface IMessage {
  todoId?: string;
  commentId?: string;
  sentFrom?: string;
  sentTo?: string;
  createTime?: number;
  status?: number;
}

interface MessageDoc extends mongoose.Document, IMessage {}

const messageSchema = new mongoose.Schema({
  todoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Todo",
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
  sentFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sentTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createTime: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
  }
});

interface messageInterface extends mongoose.Model<Document> {
  prepare(): Promise<void>
}

const Message = mongoose.model<MessageDoc, messageInterface>('Message', messageSchema);


Message.prepare = async () => {
  await Message.collection.drop();
  await Message.createCollection();

  await Message.collection.createIndex({ status: 'hashed' });
  await Message.collection.createIndex({ sendTo: 'hashed' });
}

export {
  IMessage,
  MessageDoc,
  Message,
}