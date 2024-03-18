import mongoose, { Schema } from 'mongoose';

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: [Schema.Types.ObjectId],
        default: []
    },
    userId: { // People who do log in and comment
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
    profileId: { // Target comment
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
    parent: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    votes: {
        mbti: String,
        enneagram: String,
        zodiac: String
    }
});


const CommentModel = mongoose.model('Comment', CommentSchema)

export { CommentSchema, CommentModel };