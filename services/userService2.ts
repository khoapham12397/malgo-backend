import { Prisma, PrismaClient } from "@prisma/client";
import CustomAPIError from "../config/CustomAPIError";
import { AddUserGroupParam, CreateGroupParam, CreatePostParam, GetGroupPostsParam, ShareParam } from "../controllers/userController2";
import { generator } from "../utils/genId";

const prisma = new PrismaClient();

export const getFriendList = async (username: string)=>{

    try{
        const frdShipList = await prisma.friendShip.findMany({
            select : {
                username1: true,
                username2: true,
            },
            where: {
                OR :[
                    {username1: username},
                    {username2: username}
                ]  
            }
        });
        
        return frdShipList.map(item=> (item.username1 == username)?item.username2:item.username1);
        
    }catch(error){
        throw(error);
    } 
}

export const createFriendReq = async(senderId: string, recieverId: string) =>{
    try{
        const friendReq = await prisma.friendRequest.create({
            data: {
                senderId: senderId,
                recieverId: recieverId, 
            }
        });

        return friendReq;
        
    }catch(error){
        throw(error);
    } 
}

export const getFriendReqTo = async (username: string) =>{
    try { 
        const friendReq = await prisma.friendRequest.findMany({
            where: {
                recieverId : username,
                disable: false,
            }
        });
        return friendReq;

    }catch(error){
        throw(error);
    } 
}

export const getFriendReqFrom = async (username: string) =>{
    try { 
        const friendReq = await prisma.friendRequest.findMany({
            where: {
                senderId : username,
            }
        });
        return friendReq;

    }catch(error){
        throw(error);
    } 
}

export const acceptFriendReq = async (reqId: string, senderId: string, recieverId: string) => {
    try{
        const friendShip =  await prisma.friendShip.create({
            data: {
                username1: senderId,
                username2: recieverId,
            }
        });
        
        await prisma.friendRequest.update({
            where :{
                id: reqId
            },
            data: {
                disable: true,
            }
        });
        return friendShip;
    }catch(error){
        throw(error);
    }
}
export const checkFriendShip = async (username1: string, username2: string) =>{
    try{
        const friendShip = await prisma.friendShip.findFirst({
            where: {
                OR: [{
                    username1 : username1,
                    username2: username2,
                }, {
                    username1 : username2,
                    username2: username1,
                }]
                
            }
        })
        return (friendShip?true:false);
    
    }catch(error){
        throw(error);
    }
}

export const RelTwoUser= {
    NONE: 'NONE',
    FRIEND: 'FRIEND',
    ONE_REQUEST_TWO: 'ORT',
    TWO_REQUEST_ONE: 'TRO',
}

export const checkRelTwoUser = async (username1: string, username2: string) =>{
    try{
        const friendShip = await prisma.friendShip.findFirst({
            where: {
                OR: [{
                    username1 : username1,
                    username2: username2,
                }, {
                    username1 : username2,
                    username2: username1,
                }]
                
            }
        })
        if(friendShip) {
            return RelTwoUser.FRIEND;    
        }
        
        const friendReq = await prisma.friendRequest.findFirst({
            where: {
                OR: [{
                    senderId : username1,
                    recieverId: username2,
                }, {
                    senderId : username2,
                    recieverId: username1,
                }],
                disable: false,
            }
        });
        if(friendReq) {
            if(friendReq.senderId == username1) return RelTwoUser.ONE_REQUEST_TWO;
            return RelTwoUser.TWO_REQUEST_ONE;
        }

        return RelTwoUser.NONE;
        //return (lst?true:false);
    
    }catch(error){
        throw(error);
    }
}
export const shareResource = async (params: ShareParam)=>{
    try{
        return (await prisma.sharePTP.create({
            data: {
                senderId : params.senderId,
                receiverId: params.recieverId,
                resourceType: params.type,
                resourceId: params.id,
                id: generator.nextId().toString(),
                resourceLink: params.resourceLink,
            }
        }));

    }catch(error){
        throw(error);
    }
}

export const getShareResource = async(username: string, limit: number)=>{
    try{        
        const share = await prisma.sharePTP.findMany({
            take: limit,
            where: {
                receiverId : username,
                look: false,
            },
            orderBy :{
                id: 'desc'
            }
        });
        return share;
    }
    catch(error){
        throw(error);
    }
}

export const lookedShare = async (shareId: string, username: string) =>{
    try{
        const share = await prisma.sharePTP.findUnique({
            where: {
                id: shareId
            },
            select :{
                receiverId: true,
            }
        });
        if(share?.receiverId != username) {
            throw new CustomAPIError("You don't have permission",403);
        }
        return await prisma.sharePTP.update({
            where: {
                id: shareId,
            },
            data: {
                look: true,
            }
        });
    }catch(error){
        throw(error);
    }
}
export const createGroup = async (params: CreateGroupParam) => {
    try{
        const group = await prisma.group.create({
            data: {
                name: params.name,
                creatorId: params.creatorId,
                users : {
                    create :{
                        username : params.creatorId,
                        joinedAt : new Date(Date.now())
                    }
                }
            }
        });
                 
        await prisma.chatSession.create({
            data: {
                id: group.id,
                lastMessage: {},
                lastUpdate: new Date(Date.now()),
                type: 'group',
            }
        });

        return group;      
    }
    catch(error){
        console.log(error);
        throw(error);
    }
}


export const addUserToGroup = async (params : AddUserGroupParam) => {
    try {
        const userGroup = await prisma.userGroupRel.findUnique({
            where: {
                username_groupId :{
                    groupId: params.groupId,
                    username: params.username1,
                }
            }
        });
        if(!userGroup) throw new CustomAPIError("Not permission", 403);
        return await prisma.userGroupRel.create({
            data:{
                groupId: params.groupId,
                username: params.username2,
                joinedAt :new Date(Date.now()),
            }
        });
    }
    catch(error){
        throw(error);
    }
} 


export const createPostGroup = async (params: CreatePostParam) => {
    try{
        const post = await prisma.groupPost.create({
            data :{
                id: generator.nextId().toString(),
                content: params.content,
                groupId: params.groupId,
                authorId: params.authorId,
                title: params.title,
            }
        });
        
        return post;
    
    }catch(error){
        throw(error);
    }
}

export const getGroupList = async (username: string) => {
    try{
        //console.log("username: "+ username);
        const groupList=await prisma.group.findMany({
            where :{
                users: {
                  some: {
                    username: username
                  } 
                }
            }
        });
        return groupList;
        
    }catch(error){
        console.log(error);
        throw(error);
    }
}
export const getGroupMember = async (groupId : string, username: string) =>{
    
    try{
        const rel = await prisma.userGroupRel.findUnique({
            where: {
                username_groupId :{
                    groupId: groupId,
                    username: username,
                }
            }
        });

        if(!rel) {
            throw new CustomAPIError("You don't have permission", 403);
        }

        const users = await prisma.userGroupRel.findMany({
            where: {
                groupId: groupId, 
            },
            select: {
                user: {
                    select :{ 
                        username: true,
                    }
                }
            }
        })
        const userList = users.map(item => item.user);
        
        return userList;
    }
    catch(error){
        console.log(error);
        throw(error);
    }
}
export const getGroupMemberNoCheck =  async (groupId : string) =>{
    try{
        console.log(`find member of group: ${groupId}`);
        return await prisma.userGroupRel.findMany({
            where: {
                groupId: groupId, 
            },
            select: {
                username: true,
            }
        });
    }
    catch(error){
        console.log(error);
        throw(error);
    }
}
export const getChatSessionUser = async(sessionId: string) =>{
    try {
        return await prisma.chatSessionUser.findMany({
            where: {
                sessionId: sessionId,
            },
            select:{
                username: true,
            }
        });
    }
    catch(error) {
        throw error;
    } 
} 
export const getGroupPostList = async(groupId: string, params: GetGroupPostsParam) =>{
    try{
        const {limit, after, before} = params;
        
        const posts = await prisma.groupPost.findMany({
            where: {
                id : {
                    gt : after,
                    lt : before,
                },
                groupId: groupId,
            },
            orderBy : {
                id: 'desc'
            },
            take: limit, 
        });
        return posts;
        
    }catch(error){
        console.log(error);
        throw(error);
    }
}
// of user dung A:
