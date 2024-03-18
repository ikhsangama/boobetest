import express from 'express';
import ProfileController from '../controllers/profile.js';

const router = express.Router();
const profileController = new ProfileController();

router.get('/:id', (req, res) =>
    profileController.getProfile(req, res));

router.post('/', (req, res) =>
    profileController.createProfile(req, res));

export default router;