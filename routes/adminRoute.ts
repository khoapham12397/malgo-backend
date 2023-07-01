import { Router } from 'express';
import { getAllUsersController } from '../controllers/adminController';
import { isAdmin } from '../middleware/authMiddleware';

const router: Router = Router();

router.get('/', (req, res) => res.json({ message: 'Admin private route' }));
router.get('/users', isAdmin, getAllUsersController);

export default router;
