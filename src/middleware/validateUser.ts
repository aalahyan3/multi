import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken'
import { prisma } from "../lib/prisma";
import { jwtVerify } from "jose";

async function validateUser(req:NextRequest)
{
    const token = req.cookies.get('token')?.value;
    
    if (!token) return {username:null, id:null};
    try{
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const {payload} = await jwtVerify(token, secret);
        
        if (!payload)
        {
            return {username:null, id:null};
        }
        return {username:payload.username as string, id:payload.id as string};
    }catch(err)
    {
        console.log(err);
        
        return {username:null, id:null};
    }
}

export {validateUser}