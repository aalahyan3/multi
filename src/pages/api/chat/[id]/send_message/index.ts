import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma"
import verifyToken from "../../../../../lib/verifyToken";
import ApiRespBuilder from '../../../../../utils/ApiRespBuilder';
import { serverHooks } from "next/dist/server/app-render/entry-base";
import { number } from "framer-motion";
import { log } from "console";


type User = {
    id:number;
    username:string;
    firt_name:string;
    last_name:string;
    image_url:string | null;
    specific_color: string;
}

type Message = {
    content:string;
    senderId: number;
    createdAt:Date;
}

type ChatRespFormat = {
    chatId:string;
    members:User[],
    messages: Message[]
}



async function  insertInto(username : string, chatId : string, messageContent: string, id:number)
{
    
    try{
        const user = await prisma.user.findUnique({where:{username}});
        if (!user) return null;

        const chat = await prisma.chat.findUnique({where:{id:chatId}, include:{members:true}});
        if (!chat) return null;
        if (!chat.members.find(member => member.userId === user.id))
            return null;
        const res = await prisma.message.create(
            {
                data:{
                    chatId:chatId,
                    senderId:user.id,
                    content: messageContent
                }
            }
        )
        console.log(JSON.stringify(res, null, 2));
        return res;
        
    }catch(err)
    {
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    const curr_user = req.cookies['username'];
    const { id} = req.query
    const {messageContent, senderId} = req.body

    console.log(curr_user);
    console.log(messageContent);
    console.log(senderId);
    console.log(id);
    
    if (!curr_user || !id || !messageContent || !senderId)
        return res.status(401).json(ApiRespBuilder(false, "can't make operation", 401, null));

    if (req.method !== 'POST')
        return res.status(401).json(ApiRespBuilder(false, "forbidden method", 405, null));

    const chat = await insertInto(curr_user, id as string, messageContent as string, parseInt(id as string));
    if (!chat)
        return res.status(401).json(ApiRespBuilder(false, "this chat doesn't belong to you", 405, null));
    return res.status(200).json(ApiRespBuilder(true, "chat fetched", 200, chat));

}