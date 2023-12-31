import { PrismaClient,Prisma } from '@prisma/client';
import {generator} from '../utils/genId';
import {GetChatSessionP2PParam, GetMessageParam, GetPostMsgParam, InsertChatMsgGroup, InsertChatMsgP2P, InsertChatParam, InsertPostMsg, ReferenceMessage} from '../controllers/chatController';
import CustomAPIError from '../config/CustomAPIError';

const prisma = new PrismaClient();
/*
export const insertChatMessage = async (params: InsertChatParam)=>{
    try{
        
        if(params.sessionId) {
            const userSession = await prisma.chatSessionUser.findUnique({
                where: {
                    sessionId_username : {
                        sessionId: params.sessionId,
                        username: params.username,
                    }
                }
            });
            
            if(!userSession) {
                if((params.type == MESSAGE_TYPE.MESSAGE_GROUP || params.type == MESSAGE_TYPE.MESSAGE_GROUP_POST) && params.groupId) {
                    const userGroup = await prisma.userGroupRel.findUnique({
                        where: {
                            username_groupId: {
                                groupId: params.groupId,
                                username: params.username,
                            }
                        }
                    });
                    if(userGroup) {
                        await prisma.chatSessionUser.create({
                            data: {
                                username: params.username,
                                joinedAt: new Date(Date.now()),
                                sessionId: params.sessionId,  
                                unseenCnt: 0,
                            }
                        });

                        return await prisma.chatMessage.create({
                            data: {
                                content: params.content,
                                id: generator.nextId().toString(),
                                authorId: params.username,
                                sessionId: params.sessionId,
                                postId: params.postId,
                                referenceMessage: params.referenceMessage?(params.referenceMessage as Prisma.JsonObject):undefined,                      

                            }
                        });
                    }
                    else throw Error("You don't have permission");
                }
                else throw Error("Bad Request");
            }
            else { 
                return await prisma.chatMessage.create({
                    data: {
                        content: params.content,
                        id: generator.nextId().toString(),
                        authorId: params.username,
                        sessionId: params.sessionId,
                        postId: params.postId,
                        referenceMessage: params.referenceMessage?(params.referenceMessage as Prisma.JsonObject):undefined,                      

                    }
                });   
            }
        }
        else { 
            
            if(params.type == MESSAGE_TYPE.MESSAGE_GROUP_POST && params.postId){
                const session = await prisma.chatSession.create({
                    data: {
                        id: params.postId,
                        lastMessage: {} as Prisma.JsonObject,
                        lastUpdate: new Date(Date.now()),
                        type: 'group',
                    }
                
                });
                
                await prisma.chatSessionUser.create({
                    data: {
                        sessionId: session.id,
                        username: params.username,
                        joinedAt: new Date(Date.now()),
                        unseenCnt: 0,
                    }
                });


                return await prisma.chatMessage.create({
                    data: {
                        content: params.content,
                        id: generator.nextId().toString(),
                        authorId: params.username,
                        sessionId: session.id,
                        postId: params.postId,  
                        referenceMessage: params.referenceMessage?(params.referenceMessage as Prisma.JsonObject):undefined,                      
                    }
                }); 
            }

          
            throw Error("Bad Request");
        }
        
    }catch(error){
        throw(error);
    }
}
*/
/*
export const getPostMessages = async (postId: string, params:GetPostMsgParam, username: string) =>{
    try {   
        
        const chatMessages = await prisma.chatMessage.findMany({
            where: {
                postId : postId,
                id: {
                    gt: params.after, 
                    lt: params.before,
                }
            },
            orderBy : {
                id: 'asc',
            }
        });
                

        const userSession = await prisma.chatSessionUser.findUnique({
            where:{
                sessionId_username: {
                    sessionId: postId, 
                    username: username, 
                }
            }
        });
        
        if(!userSession) {
            await addUserToChatSession(username, postId);
        } 
        
        console.log(chatMessages);
        return chatMessages;
    }
    catch(error){
        console.log(error);
        throw(error);
    }
}
*/

export const addUserToChatSession = async(username: string, sessionId: string)=>{
    try {
        return await prisma.chatSessionUser.create({
            data: {
                sessionId : sessionId,
                username : username,
                joinedAt: new Date(Date.now()),
            }
        });
    }catch(error){
        throw error;
    }
}

export const insertMessageP2P = async (params: InsertChatMsgP2P) =>{
    try{
        
        if(params.sessionId){
            const message = await prisma.chatMessage.create({
                data: {
                    content: params.content,
                    authorId: params.username,
                    sessionId: params.sessionId,
                    referenceMessage: params.referenceMessage?(params.referenceMessage as Prisma.JsonObject):undefined,
                    id: generator.nextId().toString(),
                }
            });
            await prisma.chatSession.update({
                where : {
                    id: params.sessionId,
                } 
                ,data: {
                    lastUpdate : new Date(Date.now()),
                    lastMessage: createLastMessage(params.content, params.username),
                }
            });
            
            await prisma.chatSessionUser.update({
                where:{
                    sessionId_username:{
                        sessionId: params.sessionId,
                        username: params.recieverId,
                    }
                },
                data:{
                    unseenCnt: {
                        increment: 1,
                    }
                }    
            });
            // bam vao dung :
            return message;
        }
        else {
            console.log(`Branch : ${params.username} send first message to ${params.recieverId}`);
            const usersInfo = [params.username, params.recieverId];
            
            const session = await prisma.chatSession.create({
                data :{
                    type: 'p2p',
                    id: generator.nextId().toString(),
                    lastMessage: createLastMessage(params.content, params.username),
                    lastUpdate: new Date(Date.now()),
                    usersInfo: usersInfo as Prisma.JsonArray,
                }
            });
            
            await prisma.chatSessionUser.createMany({
                data:[{
                    username: params.username,
                    joinedAt: new Date(Date.now()),
                    sessionId: session.id,
                    unseenCnt: 0,
                },{
                    username: params.recieverId,
                    joinedAt: new Date(Date.now()),
                    sessionId: session.id,
                    unseenCnt: 1,
                }]
            });
            

            const message = await prisma.chatMessage.create({
                data: {
                    id: generateMessageId(),
                    content: params.content,
                    referenceMessage: params.referenceMessage?(params.referenceMessage as Prisma.JsonObject):undefined,
                    authorId: params.username,
                    sessionId: session.id,
                }
            });
            return message;
        }        

    }catch(error){
        throw error;
    }
}

export const insertGroupMessage = async(params: InsertChatMsgGroup)=>{
    try {
       const message = await prisma.chatMessage.create({
            data: {
                id: generateMessageId(),
                content: params.content,
                authorId: params.username,
                sessionId: params.sessionId,
                referenceMessage: params.referenceMessage?(params.referenceMessage as Prisma.JsonObject):undefined                     
            }
        });
        return message;   
    }catch(error){
        throw error;
    }
}

export const insertGroupPostMsg = async (params: InsertPostMsg)=>{
    try{
        const message = await prisma.groupPostMessage.create({
            data: {
                id: generateMessageId(),
                content: params.content,
                authorId: params.username,
                postId: params.postId,
                referenceMessage: params.referenceMessage?(params.referenceMessage as Prisma.JsonObject):undefined                 
            }
        });
        return message;
    }catch(error){
        throw error;
    }
}
export const getGroupPostMsg = async (postId: string,username: string,params: GetPostMsgParam)=>{
    try{
        const post = await prisma.groupPost.findUnique({
            where: {
                id: postId,
            },
            select : {groupId: true}
        });
        if(!post) throw new CustomAPIError('Post Not Found', 404);

        const userGroup = await prisma.userGroupRel.findUnique({
            where: {
                username_groupId:{ 
                    groupId: post.groupId, 
                    username: username,
                }
            }
        });
        if(!userGroup) throw new CustomAPIError('Not Permission', 403);

        const messages = await prisma.groupPostMessage.findMany({
            take: undefined,// params.limit 
            where: {
                postId: postId,
                id: {
                    gt: params.after,
                    lt: params.before,
                }
            },
        });
        return messages;
    }catch(error){  
        throw error;
    }
}

export const getGroupMessage = async(groupId: string,username:string, params: GetMessageParam)=>{
    try {   
        const userGroup = await prisma.userGroupRel.findUnique({
            where: {
                username_groupId:{ 
                    groupId: groupId,
                    username: username,
                }
            }
        });
        if(!userGroup) throw new CustomAPIError('Not Permission', 403);

        const messages = await prisma.chatMessage.findMany({
            take: undefined, //params.limit
            where: {
                sessionId: groupId,
                id: {
                    gt: params.after,
                    lt: params.before,
                }
            },            
        });
        return messages;
    }catch(error){
        throw error;
    }
}

export const getMessageP2P = async (username: string, sessionId: string, params: GetMessageParam) =>{
    
    try{
        const userSession = await prisma.chatSessionUser.findUnique({
            where :{
                sessionId_username:{
                    sessionId: sessionId,
                    username: username,
                }
            }
        });
        if(!userSession) throw new CustomAPIError('Not Permission',403);
        const messages = await prisma.chatMessage.findMany({
            take:undefined, // add limit after 
            where:{
                sessionId: sessionId,
                id: {
                    gt: params.after,
                    lt: params.before,
                }
            }
        });
        return messages; 
    }catch(error){
        throw error;
    }
}

const generateMessageId = ()=>{
    return generator.nextId().toString();
}
const createLastMessage = (message: string, username: string)=> {
    return {message: message, authorId: username};
    
}

export const getChatSessionP2PList = async(username: string, params: GetChatSessionP2PParam)=>{
    try {      
        const chatSession = await prisma.chatSessionUser.findMany({
            where: {
                username: username,
                chatSession: params.before?{
                    lastUpdate: {
                        lt: params.before,
                    }
                }:undefined,
            },
            include: {
                chatSession: {
                    select: {
                        lastUpdate: true,
                        usersInfo: true,
                        lastMessage: true,
                    }
                }
            },
            orderBy :{
                chatSession: { 
                    lastUpdate : 'asc'
                }
            }
        });

        const chatList = chatSession.map(item =>({
            sessionId: item.sessionId,
            partner : getPartner(item.chatSession.usersInfo, username),
            lastUpdate: item.chatSession.lastUpdate,
            unseenCnt: item.unseenCnt,
            joinedAt: item.joinedAt,
            lastMessage: item.chatSession.lastMessage,
        }));
        
        return chatList;

    }catch(error){
        throw error;
    }
}

export const createChatSessionP2P = async(params: any)=>{
    try{

    }catch(error){
        throw error;
    }
}

const getPartner = (usersInfo: any, username: string)=>{
    if(!usersInfo) return undefined;   
    return usersInfo[0]===username?usersInfo[1]:usersInfo[0];
}