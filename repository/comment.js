import { CommentModel } from '../models/comment.js';
import {ProfileNotFound} from '../common/errors.js';

class CommentRepository {

    async create(commentData) {
        return CommentModel.create(commentData);
    }

    async findById(id) {
        return CommentModel.findById(id)
    }

    async find(query, sortQuery) {
        return  CommentModel.find(query).sort(sortQuery)
    }

    async findOneAndUpdate(query, updateQuery, opts) {
        return CommentModel.findOneAndUpdate(query, updateQuery, opts);
    }


}

export default CommentRepository;