'use client'

import { useEffect } from "react";
import { useState } from "react"
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";


let socket: Socket;

export function useSocket(url:string)
{
    const [isConnected, setIsConnected] = useState(false);

    useEffect(()=>
    {
        if (!socket)
            socket = io(url, {autoConnect: true});
        socket.on("connect", ()=>
        {
            setIsConnected(true);
        });
        
        socket.on("disconnect", ()=>
        {
            setIsConnected(false);
        })

        return ()=>
            {
                socket.off("connect");
                socket.off("disconnect");

            }
    }, [url]);

    return {socket, isConnected};
}