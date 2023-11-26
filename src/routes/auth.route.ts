import { Router } from 'express';
import controller from '../controllers/auth.controller';

const router = Router();

router.post('/signup', controller.signup.post);
router.post('/login', controller.login.post);
router.post('/logout', controller.logout.post);

export default router;
