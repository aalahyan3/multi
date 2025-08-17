import { NextApiRequest } from "next";
import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken'

export  function getUserIdFromRequest(req:NextApiRequest){
    const token = req.cookies.token;
    if (!token) return null;
    try{
        const paylaod = jwt.verify(token, process.env.JWT_SECRET!) as unknown as {id:number};
        return paylaod.id;
    }
    catch(err)
    {
        console.log(err);
        
        return null
    }
}
