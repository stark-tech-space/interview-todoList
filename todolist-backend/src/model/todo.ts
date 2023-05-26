import mongoose from "mongoose";

interface ITodo {
  text?: string;
  creator?: string;
  createTime?: number;
  planTime?: number;
  updateTime?: number;
  finishTime?: number;
  remindTime?: number;
  repeatPeriod?: number;
  asignees?: string[];
  followers?: string[];
  status?: number;
}

interface TodoDoc extends mongoose.Document, ITodo {}

const todoSchema = new mongoose.Schema({
  text: {
    type: String, 
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createTime: {
    type: Number,
    required: true,
  },
  planTime: {
    type: Number,
  },
  updateTime: {
    type: Number,
  },
  finishTime: {
    type: Number,
  },
  remindTime: {
    type: Number,
  },
  repeatPeriod: {
    type: Number,
  },
  asignees: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },  
  status: {
    type: Number,
  }
});

interface todoInterface extends mongoose.Model<Document> {
  prepare(): Promise<void>
}

const Todo = mongoose.model<TodoDoc, todoInterface>('Todo', todoSchema);

Todo.prepare = async () => {
  await Todo.collection.drop();
  await Todo.createCollection();

  await Todo.collection.createIndex({ followers: 1, createTime: -1 });
  await Todo.collection.createIndex({ followers: 1, planTime: -1 });
}

export {
  ITodo,
  TodoDoc,
  Todo,
}
