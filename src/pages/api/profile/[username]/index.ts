import { NextApiRequest, NextApiResponse } from "next";
import {prisma} from '../../../../lib/prisma'

export async function GET(req : NextApiRequest, {params}: {username : string}){
    const res = await prisma.user.findUnique({where:{username: params.username}})    
}