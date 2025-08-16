import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req : NextApiRequest, res :NextApiResponse)
{
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const redirect_uri = "http://localhost:3000/api/auth/google/callback";
    const scope = encodeURIComponent("openid email profile");

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&access_type=offline`);
}
