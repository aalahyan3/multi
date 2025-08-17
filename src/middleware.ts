import { NextRequest, NextResponse } from "next/server";
import { match } from "assert";

export async function middleware(req:NextRequest)
{

    console.log("middle ware called");
    
    // await updateLastSeen(req).catch(console.error); 

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)' 
    ]
}
