import { NextApiRequest, NextApiResponse } from "next";
import {prisma} from '../../../lib/prisma'
import ApiRespBuilder from "../../../utils/ApiRespBuilder";
import { getUserIdFromRequest } from "../../../utils/getUserIdFromRequest";
export default async function handler(req: NextApiRequest, res: NextApiResponse)
{
    const {page} = req.query;

    const pageAsInt = page ? parseInt(page as string, 10) : 1;
    const PAGE_SIZE = 10;
    const userId = getUserIdFromRequest(req);
    const curr_user = req.cookies['username'];
    console.log("the user want others is", curr_user);
    
    if (!userId)
        return res.status(401).json(ApiRespBuilder(false, "you are not authorized", 401, null));
    const skip = (pageAsInt - 1) * PAGE_SIZE;
    try{
        const users = await prisma.user.findMany({skip, take:PAGE_SIZE, where:{
            username:{not: curr_user}
        }});
        const total_users = await prisma.user.count();
        res.status(200).send(ApiRespBuilder(true, "users fetched", 200, {page:pageAsInt, total_pages:Math.ceil(total_users / PAGE_SIZE), users}));
    }catch(error)
    {
        res.status(500).send(ApiRespBuilder(false, "something went wrong", 500, null));
    }
}
