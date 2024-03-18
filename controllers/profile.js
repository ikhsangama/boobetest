import profiles from '../mocks/data/profiles.js';
import ProfileService from '../services/profile.js';
import { ProfileModel} from '../models/profile.js';

class ProfileController {
    constructor() {
        this.service = new ProfileService();
    }

    async getProfile(req, res) {
        const { id } = req.params;
        try {
            const profile = await this.service.getProfileById(id);
            res.render('profile_template', {
                profile,
            });
        } catch (e) {
            res.render('error_template', {
                e,
            });
        }
    }

    async createProfile(req, res) {
        const profileData = req.body;
        const newProfile = new ProfileModel(profileData);
        console.log({profileData, newProfile});
        try {
            const profile = await this.service.createProfile(newProfile);
            res.status(201).json(profile);
        } catch (e) {
            console.log({e}, "controller createProfile err");
            res.status(e.code).json(e);
        }
    }
}

export default ProfileController;