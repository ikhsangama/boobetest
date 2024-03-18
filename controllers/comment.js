import CommentService from '../services/comment.js';
import { CommentModel } from '../models/comment.js';
import {BadRequest, RequestError} from "../common/errors.js";

class CommentController {
    constructor() {
        this.service = new CommentService();
    }

    async getComment(req, res) {
        let query = { profileId: req.query["profileId"] };

        if (req.query["voteType"] && req.query["voteValue"]) {
            query['votes.' + req.query["voteType"]] = req.query["voteValue"];
        }

        let sortQuery = {};
        if (req.query["sortBy"]) {
            sortQuery[req.query["sortBy"]] = req.query["direction"] || 'asc';
        }

        console.log({query, sortQuery})
        try {
            if (!query.profileId) {
                throw BadRequest;
            }

            const comments = await this.service.getComment(query, sortQuery);
            res.status(200).json(comments);
        } catch (e) {
            console.log({e}, "controller getComment err");
            res.status(e.code).json({message: e.message});
        }
    }

    async createComment(req, res) {
        const commentData = req.body;
        const newComment = new CommentModel(commentData);
        console.log({commentData, newComment})
        try {
            const profile = await this.service.createComment(newComment);
            res.status(201).json(profile);
        } catch (e) {
            console.log({e}, "controller createComment err");
            res.status(e.code).json({message: e.message});
        }
    }

    async likeComment(req, res) {
        try {
            // Destructure commentId and userId from the request body
            const { commentId, userId } = req.body;

            if (!commentId || !userId){
                throw new RequestError("Both commentId and userId are required");
            }

            console.log({commentId, userId})
            const comment = await this.service.likeComment(commentId, userId);

            res.status(200).json(comment);
        } catch (err) {
            res.status(e.code).json({message: e.message});
        }
    }
}

export default CommentController;