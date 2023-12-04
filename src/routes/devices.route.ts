import { Router } from 'express';
import { validateToken } from '../middlewares/auth.middleware';
import { validatePermissionToDevice, validateAccessKey } from '../middlewares/devices.middleware';
import controller from '../controllers/devices.controller';

const router = Router();

router.get(
	'/:deviceId/credentials',
	validatePermissionToDevice,
	validateToken,
	controller[':deviceId'].credentials.get
);

router.patch(
	'/:deviceId/credentials',
	validatePermissionToDevice,
	validateToken,
	controller[':deviceId'].credentials.patch
);

router.get('/', controller.get);
router.get('/:deviceId/measurements', controller[':deviceId'].measurements.get);
router.post('/:deviceId/measurements', validateAccessKey, controller[':deviceId'].measurements.post);

export default router;
