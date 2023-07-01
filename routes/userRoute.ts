import { Router, Request, Response } from "express";
import { getChatSessionP2PListCtl, getGroupMsgCtl, getMessageP2PCtl, getPostMessageCtl } from "../controllers/chatController";
import { acceptFriendReqCtl, addUserToGroupCtl, checkFriendShipCtl, createGroupCtl, createPostGroupCtl, getFriendListCtl, getFriendReqFromCtl, getFriendReqToCtl, getGroupListCtl, getGroupMemberCtl, getGroupPostListCtl, getRelationShipTwoUserCtl, getShareResourceCtl, lookedShareCtl, postFriendReqCtl, shareResourceCtl } from "../controllers/userController2";
import { isAuthenticated } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";

const router: Router = Router();
/* All private routes */

router.get('/friends/:username' ,getFriendListCtl);
router.get('/friendreq/to/:username',getFriendReqToCtl);
router.get('/friendreq/from/:username',getFriendReqFromCtl);
router.post('/friendreq', postFriendReqCtl);
router.post('/acceptfriend', acceptFriendReqCtl);
router.get('/checkfriend', checkFriendShipCtl);
router.get('/relationship', getRelationShipTwoUserCtl);
 
router.post('/share', shareResourceCtl);
router.get('/share/:username', getShareResourceCtl);
router.post('/share/:shareId/looked', lookedShareCtl);

router.post('/group', createGroupCtl);
router.post('/group/user', addUserToGroupCtl);
router.post('/group/thread',createPostGroupCtl);
router.get('/group/member', getGroupMemberCtl);
router.get('/group/:username', getGroupListCtl);
router.get('/group/:groupId/post', getGroupPostListCtl);
// group post
router.get('/post/:postId/message', getPostMessageCtl);
router.get('/group/:groupId/message', getGroupMsgCtl);

router.get('/session/p2p', getChatSessionP2PListCtl);
router.get('/session/p2p/:sessionId/message', getMessageP2PCtl);


router.get('/x', async (req: Request, res: Response)=>{
    const x = jwt.sign({username: 'khoapham'}, 'SECRET', {expiresIn: '1d'});
    res.status(200).json({token: x}).end();

});

router.post('/y',async (req: Request, res:Response) =>{
    const token = req.body.token;
    
    const x:any = jwt.decode(token);
    console.log(x);
    res.status(200).json({x: x});
});

export default router;