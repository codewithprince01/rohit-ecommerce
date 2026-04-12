import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/adminUserController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

export default router;
