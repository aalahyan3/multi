import { NextApiRequest, NextApiResponse } from "next";
import {prisma} from '../../../lib/prisma'
import ApiRespBuilder from '../../../utils/ApiRespBuilder'
export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    const query = req.query.query as string;
    const curr_user = req.cookies['username'] as string

    if (req.method !== 'GET')
        return res.status(405).json(ApiRespBuilder(false, "method not allowd", 405, null));

    try{

        const users = await prisma.user.findMany(
            {
                where:
                {
                    OR:[
                        {username: {contains: query, mode: 'insensitive'}},
                        {first_name: {contains: query, mode: 'insensitive'}},
                        {last_name: {contains: query, mode: 'insensitive'}},
                    ],
                    AND:[{username:{not:curr_user}}]
                },
                orderBy: {username: 'asc'},
                take: 10
            }
        );
        res.status(200).json(ApiRespBuilder(true, "users fetched", 200, users))

    }catch(err)
    {
        return res.status(500).json(ApiRespBuilder(false, "Internal Server Error", 500, null));
    }
}