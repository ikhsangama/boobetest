import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    mbti: {
        type: String,
        required: true,
    },
    enneagram: String,
    variant: String,
    tritype: Number,
    socionics: String,
    sloan: String,
    psyche: String,
    image: String,
});

const ProfileModel = mongoose.model('Profile', ProfileSchema);

export {
    ProfileSchema,
    ProfileModel
};