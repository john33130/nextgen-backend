import { Router } from 'express';
import * as auth from '../middlewares/auth.middleware';

const router = Router();

router.get('/', auth.validateToken); // get all device information at once (only admins)
router.get('/measurements'); // get all device measurements at once (public)
router.get('/:deviceId', auth.validateToken); // get device information (only users and admins)
router.patch('/:deviceId', auth.validateToken); // change device information (only users and admins)
router.get('/:deviceId/measurements'); // get device measurements (public)
router.post('/:deviceId/measurements'); // change device measurements (devices only)

export default router;
