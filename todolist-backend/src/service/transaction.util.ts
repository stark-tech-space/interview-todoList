import mongoose from "mongoose";
import type { ClientSession } from 'mongoose';

type TransactionJob = (session: ClientSession) => Promise<void>;

export const runInTransaction = async (job: TransactionJob) => {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    await job(session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};