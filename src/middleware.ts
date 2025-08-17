import { NextRequest, NextResponse } from "next/server";
import {validateUser} from './middleware/validateUser'
export async function middleware(req:NextRequest)
{
    
    const user = await validateUser(req);
    // console.log("user id", user);
    if (!user)
        return NextResponse.redirect(new URL("/", req.url));
    const response =  NextResponse.next()
      response.cookies.set('username', user as string, {'path': '/'});
      return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|$|api/auth/.*).*)',
    ],
}

