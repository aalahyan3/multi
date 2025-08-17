import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken'
import { prisma } from "../lib/prisma";
import { jwtVerify } from "jose";

async function validateUser(req:NextRequest)
{
    const token = req.cookies.get('token')?.value;
    
    if (!token) return null;
    try{
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const {payload} = await jwtVerify(token, secret);
        console.log(payload);
        
        if (!payload)
        {
            return null;
        }
        return payload.username;
    }catch(err)
    {
        console.log(err);
        
        return null;
    }
}

export {validateUser}