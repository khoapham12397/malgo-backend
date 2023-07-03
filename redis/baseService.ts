
import { createClient } from "redis";
import { ShareParam } from "../controllers/userController2";
import dotenv from 'dotenv';
dotenv.config();
const redisClient = createClient({
    url : process.env.REDIS_URL
});

export const initRedisClient = async () =>{
    redisClient.on('error', error=>{
        console.log(error);
    });
    await redisClient.connect();        
}


export const insertShareP2PNotif = async (params: ShareParam) => {
    const key = `notification:share:${params.recieverId}`;
    // senderID:resourceId: dung va d: co ban la vay thoi dung:

}
const generateUserSocketsKey = (username :string) =>{
    return `sockets:${username}`;
}
export const insertUserSocket = async (username: string, socketId: string) =>{
    try{
        const socketsStr = await redisClient.GET(generateUserSocketsKey(username));
        if(socketsStr) {
            const sockets = JSON.parse(socketsStr);
            sockets.push(socketId);
            await redisClient.SET(generateUserSocketsKey(username), JSON.stringify(sockets));
        }
        else {
            const sockets = JSON.stringify([socketId]);
            await redisClient.SET(generateUserSocketsKey(username), sockets);
        }
        
    }catch(error){
        throw(error);
    }
}
export const removeUserSocket = async (username: string, socketId: string) =>{
    try {
        const socketsStr = await redisClient.GET(generateUserSocketsKey(username));
        if(socketsStr){
            const sockets = JSON.parse(socketsStr);
            for(let i=0;i<sockets.length;i++) {
                if(sockets[i] == socketId) {
                    sockets.splice(i,1);
                    break;
                }
            }
            if(sockets.length == 0){
                await redisClient.DEL(generateUserSocketsKey(username));
            }
            else {
                await redisClient.SET(generateUserSocketsKey(username), JSON.stringify(sockets));
            }
        }         
    }
    catch(error){
        throw(error);
    }
}

export const getUserSockets = async (username: string) =>{
    try{
        const socketsStr= await redisClient.GET(generateUserSocketsKey(username)); 
        if(socketsStr) {
            return JSON.parse(socketsStr);
        }   
        return [];
    }
    catch(error){
        throw(error);
    }
}