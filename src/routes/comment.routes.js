
import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { isOwner } from '../middlewares/isOwner.middleware.js';
import { Comment } from '../models/comment.model.js';

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(isOwner(Comment, "commentId"),deleteComment).patch(isOwner(Comment, "commentId"),updateComment);

export default router
