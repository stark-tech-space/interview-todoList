import { Request, Response } from 'express';
import userService from '../service/user.service';

async function getList(req: Request, res: Response) {
  try {
    const users = await userService.getList();
    return res.status(200).send(users);
  } catch (err) {
    console.log('[Error] user getList:', err);
  }
  return res.status(500).send([]);
}

export default {
  getList,
}