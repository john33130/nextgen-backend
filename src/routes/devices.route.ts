import { Router } from 'express';
import { validateToken } from '../middlewares/auth.middleware';
import { validatePermissionToDevice, validateAccessKey } from '../middlewares/devices.middleware';
import controller from '../controllers/devices.controller';

const router = Router();

router.get(
	'/credentials/:deviceId',
	validatePermissionToDevice,
	validateToken,
	controller.credentials[':deviceId'].get
);

router.patch(
	'/credentials/:deviceId',
	validatePermissionToDevice,
	validateToken,
	controller.credentials[':deviceId'].patch
);

router.get('/measurements/all', controller.measurements.all.get);
router.get('/measurements/:deviceId', controller.measurements[':deviceId'].get);
router.post('/measurements/:deviceId', validateAccessKey, controller.measurements[':deviceId'].post);

export default router;
