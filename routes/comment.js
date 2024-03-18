import express from 'express';
import CommentController from '../controllers/comment.js';

const router = express.Router();
const commentController = new CommentController();

router.get('/', (req, res) =>
    commentController.getComment(req, res));

router.post('/', (req, res) =>
    commentController.createComment(req, res));

router.put('/like', (req, res) =>
    commentController.likeComment(req, res));

export default router;