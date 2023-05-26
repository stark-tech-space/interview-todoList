import { User } from '../model/user';

async function getList() {
  const users = await User.find({});
  return users;
}

export default {
  getList,
}