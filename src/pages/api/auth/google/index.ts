import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req : NextApiRequest, res :NextApiResponse)
{
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const redirect_uri = process.env.CALLBACK_URI;
   console.log("redirect_uri " + redirect_uri);
    
    const scope = encodeURIComponent("openid email profile");
    console.log(redirect_uri, client_id)
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&access_type=offline`);
}
