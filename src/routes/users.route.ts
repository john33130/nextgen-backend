import { Router } from 'express';
import { validateToken } from '../middlewares/auth.middleware';
import { validatePermissionToUser } from '../middlewares/users.middleware';
import controller from '../controllers/users.controller';

const router = Router();

router.get('/:userId/credentials', validatePermissionToUser, validateToken, controller[':userId'].credentials.get); // get user data
router.patch('/:userId/credentials', validatePermissionToUser, validateToken, controller[':userId'].credentials.patch); // change user data
router.delete('/:userId', validatePermissionToUser, validateToken);

export default router;
