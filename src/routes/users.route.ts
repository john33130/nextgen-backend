import { Router } from 'express';

const router = Router();

router.get('/:userId'); // get user data
router.patch('/:userId'); // change user data
router.delete('/:userId'); // delete user data
router.post('/:userId/pair'); // set user in pair modus

export default router;
