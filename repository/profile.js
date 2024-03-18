import { ProfileModel } from '../models/profile.js';
import {ProfileNotFound} from '../common/errors.js';

class ProfileRepository {

    async create(profileData) {
        return ProfileModel.create(profileData);
    }

    async findById(id) {
        return ProfileModel.findById(id);
    }
}

export default ProfileRepository;