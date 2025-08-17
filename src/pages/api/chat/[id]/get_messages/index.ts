import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma"
import verifyToken from "../../../../../lib/verifyToken";
import ApiRespBuilder from '../../../../../utils/ApiRespBuilder';
import { serverHooks } from "next/dist/server/app-render/entry-base";
import { number } from "framer-motion";


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



async function  userIsInChat(username : string, chatId : string, before: Date, limit: number)
{
    console.log("begin");
    
    try{
        const user = await prisma.user.findUnique({where:{username}});
        if (!user) return null;
        const res = await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
              members: {
                include: {
                  user: {
                    select:{
                        id:true,
                        username:true,
                        first_name:true,
                        last_name:true,
                        image_url:true,
                        specific_color:true,
                    }
                  }
                },
              },
              messages:
              {
                take:limit,
                where:{createdAt:{lt:before}},
                orderBy:{
                    createdAt: 'desc'
                }
                
              }
            },
          });

        console.log(JSON.stringify(res, null, 2));
        if (!res) return null;

        if (res.members.find(member => member.userId === user.id)) return res;
        return null;
        
    }catch(err)
    {
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    const curr_user = req.cookies['username'];
    const {id, before, limit} = req.query

    const beforeDate = before ? new Date(before as string) : new Date();
    const FetchLimit = parseInt(limit as string) || 50;
    if (!curr_user || !id)
        return res.status(401).json(ApiRespBuilder(false, "can't make operation", 401, null));

    if (req.method !== 'GET')
        return res.status(401).json(ApiRespBuilder(false, "forbidden method", 405, null));

    const chat = await userIsInChat(curr_user, id as string, beforeDate, FetchLimit);
    if (!chat)
        return res.status(401).json(ApiRespBuilder(false, "this chat doesn't belong to you", 405, null));
    return res.status(401).json(ApiRespBuilder(true, "chat fetched", 200, chat));

}