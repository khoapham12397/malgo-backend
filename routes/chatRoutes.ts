import { Router } from 'express';
import { getGroupMsgCtl, getMessageP2PCtl, getPostMessageCtl } from '../controllers/chatController';
const router = Router();

router.get('/post/:postId/message', getPostMessageCtl);
router.get('/group/:groupId/message', getGroupMsgCtl);
router.get('/session/:sessionId/message', getMessageP2PCtl);

export default router;