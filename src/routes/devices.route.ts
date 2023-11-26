import { Router } from 'express';

const router = Router();

router.get('/:deviceId'); // data fo  r owner
router.patch('/:deviceId'); // change data (no measurements)
router.post('/:deviceId/pair'); // set device in pair-modus
router.get('/data'); // public data from all devices
router.get('/data/:deviceId'); // public data from 1 device
router.post('/data/:deviceId'); // add measurements to a device

export default router;
