import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

import mongoose from "mongoose";
import { Todo } from './src/model/todo';
import { Comment } from './src/model/comment';
import { Message } from './src/model/message';
import { History } from './src/model/history';
import { User } from './src/model/user';

import { router as todoRouter } from './src/route/todo.router';
import { router as userRouter } from './src/route/user.router';

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/static", express.static("static"));
app.use('/todo', todoRouter);
app.use('/user', userRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server !!');
});

async function prepareDB() {
  [Todo, Comment, Message, History, User].forEach(async coll => {
    await coll.prepare();
  });
}

async function main() {
  const port = process.env.PORT;
  const dbhost = process.env.DB_HOST;
  const dbport = process.env.DB_PORT;
  const dbname = process.env.DB_NAME;

  console.log('env:', dbhost, dbport, dbname);
  
  await mongoose.connect(`mongodb://${dbhost}:${dbport}/${dbname}`);
  console.log('connected to database');

  await prepareDB();

  app.listen(port, () => {
    console.log(`[server]: Server is running on port:${port}`);
  });
}
main().catch(err => console.error(err));