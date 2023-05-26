import express from 'express';
import TodoController from '../controller/todo.controller';
import CommentController from '../controller/comment.controller';

const router = express.Router();

router.get('/getList', TodoController.getList);
router.get('/get/:todoId', TodoController.getOne);
router.get('/get/:todoId/history', TodoController.getHistory);
router.post('/create', TodoController.create);
router.put('/:todoId/update', TodoController.update);

router.get('/get/:todoId/comment', CommentController.get);
router.post('/comment/create', CommentController.create);
router.put('/comment/:commentId/update', CommentController.update);

export {
  router
}