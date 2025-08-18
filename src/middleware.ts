import { NextRequest, NextResponse } from "next/server";
import {validateUser} from './middleware/validateUser'
export async function middleware(req:NextRequest)
{
    
    const {username, id} = await validateUser(req) as {username:string, id:string};
    // console.log("user id", user);
    
    if (!username || !id)
        return NextResponse.redirect(new URL("/", req.url));
    const response =  NextResponse.next()
      response.cookies.set('username', username as string, {'path': '/'});
      response.cookies.set('id', id as string, {'path': '/'});
      return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|$|api/auth/.*).*)',
    ],
}

