import mongoose from "mongoose";

interface IUser {
  nickname?: string;
}

const userSchema = new mongoose.Schema({
  nickname: {
    type: String, 
    require: true,
  },
});

interface UserDoc extends mongoose.Document, IUser {}

interface userInterface extends mongoose.Model<Document> {
  prepare(): Promise<void>
}

const User = mongoose.model<UserDoc, userInterface>('User', userSchema);

User.prepare = async () => {
  await User.collection.drop();
  await User.createCollection();

  const fakeUser = await new User({ nickname: 'fatsheep' }).save();
  process.env.fakeUserId = fakeUser._id.toString();

  await new User({ nickname: 'tiger' }).save();
  await new User({ nickname: 'lazypig'}).save();
}

export {
  IUser,
  UserDoc,
  User,
}
