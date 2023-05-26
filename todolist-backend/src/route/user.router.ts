import express from 'express';
import UserController from '../controller/user.controller';

const router = express.Router();

router.get('/get', UserController.getList);

export {
  router
}