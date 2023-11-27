import { Router } from 'express';
import * as auth from '../middlewares/auth.middleware';
import controller from '../controllers/users.controller';

const router = Router();

router.get('/:userId', auth.validateUserId, auth.validateToken, controller[':userId'].get); // get user data
router.patch('/:userId', auth.validateUserId, auth.validateToken, controller[':userId'].patch); // change user data

export default router;
