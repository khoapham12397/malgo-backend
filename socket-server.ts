import { ChatMessage } from '@prisma/client';
import {Socket , Server} from 'socket.io';
import CustomAPIError from './config/CustomAPIError';
import { InsertChatMsgGroup, InsertChatMsgP2P, InsertChatParam, InsertPostMsg, ReferenceMessage } from './controllers/chatController';
import { getUserSockets, insertUserSocket, removeUserSocket } from './redis/baseService';
import { insertGroupMessage, insertGroupPostMsg, insertMessageP2P } from './services/chatService';
import { getChatSessionUser, getGroupMember, getGroupMemberNoCheck } from './services/userService2';
import { getUsernameFromToken } from './utils/token';

export const MESSAGE_TYPE = {
    MESSAGE_P2P: 'MESSAGE_P2P',
    MESSAGE_GROUP: 'MESSAGE_GROUP',
    MESSAGE_GROUP_POST: 'MESSAGE_GROUP_POST',
}

let io:any = null;

type SubmiMessageParam = {
    username: string;
    message: string;
    postId: string;
    sessionId: string;
    groupId: string;
    type: string;
    recieverId: string;
    referenceMessage: null | ReferenceMessage;
}

export const initIOSocket = (server: any) =>{
    io = new Server(server, {
        cors: {
            origin :"*",
        }
    });
    io.on("connection", (socket: Socket)=>{
        
        socket.emit("send-id", {id : socket.id}); 
        
        socket.on("auth", async (data: any) => {
            try{
                const username = getUsernameFromToken(data.accessToken);
                socket.data.username = username;
                insertUserSocket(username, socket.id);

            }
            catch(error){
                console.log("error occur when getting profile from accessToken");
            }
            
        });
        
        setTimeout(()=>{
            if(!socket.data.username) socket.disconnect();
        },3000);

        socket.on("disconnecting", (data: any) => {
            removeUserSocket(socket.data.username, socket.id);            
        });
        

        socket.on("submit-message", async (data: SubmiMessageParam)=>{
            try{
                console.log(data.username);
                if(socket.data.username == data.username) {
                    console.log("here");
                    
                    let chatMessage: any = null;

                    switch(data.type){
                        case MESSAGE_TYPE.MESSAGE_P2P: 
                            const paramP2p: InsertChatMsgP2P = {
                                content: data.message,
                                recieverId: data.recieverId,
                                referenceMessage: data.referenceMessage,
                                sessionId: data.sessionId,
                                username: data.username,
                            
                            }
                            chatMessage = await insertMessageP2P(paramP2p);
                            break;
                        case MESSAGE_TYPE.MESSAGE_GROUP:
                            const paramGroup: InsertChatMsgGroup ={
                                content : data.message,
                                groupId: data.groupId,
                                postId: data.postId,
                                referenceMessage: data.referenceMessage,
                                sessionId: data.sessionId,
                                username:data.username,
                            }
                            chatMessage = await insertGroupMessage(paramGroup);
                            break;
                        case MESSAGE_TYPE.MESSAGE_GROUP_POST:
                            const paramGroupPost: InsertPostMsg ={
                                content : data.message,
                                groupId: data.groupId,
                                postId: data.postId,
                                referenceMessage: data.referenceMessage,
                                username:data.username,
                            }
                            chatMessage = await insertGroupPostMsg(paramGroupPost);
                            break;
                        default:
                            break;
                    }             
                    console.log("vao day");
                    //chatMessage = await insertChatMessage(params);
                
                    if(chatMessage) {
                        console.log(`type of message : ${data.type}`);
                        if(data.type === MESSAGE_TYPE.MESSAGE_GROUP || data.type===MESSAGE_TYPE.MESSAGE_GROUP_POST){
                            
                            const users = await getGroupMemberNoCheck(data.groupId);
                                                   
                            if(users) {
                                console.log(`users length= ${users.length}`);
                                users.forEach(user => sendMessage(user.username, chatMessage,data.type));
                            }
                        }
                        else {
                            sendMessage(data.username, chatMessage, data.type);
                            sendMessage(data.recieverId, chatMessage, data.type);
                                                        
                        }
                    }  
                    
                }    
            }
            catch(error) {
                console.log(error);
            }
        });
        
    });
}

const sendMessage = async (username: string, chatMessage : ChatMessage, type: string) =>{
    if(!io) return;
    const socketIds : Array<string> =  await getUserSockets(username);
    socketIds.forEach(id=> {
        const socket = io.sockets.sockets.get(id);         
        if(socket && socket.connected) {
            console.log(`socket: ${id} send message: ${chatMessage.content}`);
            socket.emit('new-message', {message: chatMessage, type: type});
        }     
    })
}
