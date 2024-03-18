import CommentRepository from '../repository/comment.js';
import ProfileRepository from "../repository/profile.js";
import {BadRequest, RequestError} from "../common/errors.js";

class CommentService {
    constructor() {
        this.repository = new CommentRepository();
        this.profileRepository = new ProfileRepository();
    }

    async getComment(query, sortQuery) {
        const comment = await this.repository.find(query, sortQuery);
        if (!comment) {
            throw new RequestError("We're sorry, but the comment you're looking for could not be found.", 404);
        }
        return comment
    }

    async createComment(comment) {
        if (comment.parent){
            const commentParent = await this.repository.findById(comment.parent);
            if (!commentParent) {
                throw new RequestError("You can't reply comment that doesn't exist.")
            }
        }

        const [profile, user] = await Promise.all([
            this.profileRepository.findById(comment.profileId),
            this.profileRepository.findById(comment.userId),
        ]);

        if (!profile || !user) {
            throw new RequestError("Invalid ProfileId or UserId.");
        }
        return this.repository.create(comment);
    }

    async likeComment(commentId, userId) {
        const user = await this.profileRepository.findById(userId);
        if (!user) {
            throw new RequestError("Invalid UserId.", 400);
        }

        const comment = await this.repository.findById(commentId);
        if (!comment) {
            throw new RequestError("Like comment, comment not found", 404);
        }

        if (!comment["likes"].includes(userId)) {
            // like
            return this.repository.findOneAndUpdate(
                {_id: commentId},
                {$addToSet: {likes: userId}},
                {new: true}
            );
        } else {
            // unlike
            return this.repository.findOneAndUpdate(
                {_id: commentId},
                {$pull: {likes: userId}},
                {new: true}
            );
        }
    }
}

export default CommentService;