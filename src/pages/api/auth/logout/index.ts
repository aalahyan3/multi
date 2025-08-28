import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req:NextApiRequest, res:NextApiResponse)
{
    if (req.method != 'POST')
            return res.status(405).send("Bad Request");
    console.log("trigger logout");
    res.setHeader("Set-Cookie", "token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax; Secure");
    res.redirect("/");
}