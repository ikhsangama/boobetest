import ProfileRepository from '../repository/profile.js';
import {ProfileNotFound} from "../common/errors.js";

class ProfileService {
    constructor() {
        this.repository = new ProfileRepository();
    }

    async getProfileById(id) {
        const profile = await this.repository.findById(id);
        if (!profile) {
            throw ProfileNotFound;
        }
        return profile
    }

    async createProfile(profile) {
        return this.repository.create(profile);
    }
}

export default ProfileService;