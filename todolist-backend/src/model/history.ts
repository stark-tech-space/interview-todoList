import mongoose from "mongoose";

interface IHistory {
  todoId?: string;
  actionType?: string;
  field?: string;
  value?: string;
  createTime?: number;
  operator?: string
}

interface HistoryDoc extends mongoose.Document, IHistory {}

const historySchema = new mongoose.Schema({
  todoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Todo",
    required: true,
  },
  actionType: {
    type: String,
    required: true,
  },
  field: {
    type: String,
  },
  value: {
    type: String,
  },
  createTime: {
    type: Number,
    required: true,
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

interface historyInterface extends mongoose.Model<Document> {
  prepare(): Promise<void>
}

const History = mongoose.model<HistoryDoc, historyInterface>('History', historySchema);

History.prepare = async () => {
  await History.collection.drop();
  await History.createCollection();

  await History.collection.createIndex({ todoId: 'hashed' });
}

export {
  IHistory,
  HistoryDoc,
  History,
}