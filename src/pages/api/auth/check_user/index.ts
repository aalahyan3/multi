import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from 'cookie';
import ApiRespBuilder from "../../../../utils/ApiRespBuilder";
import jwt from "jsonwebtoken";
export default async function handler(req : NextApiRequest, res: NextApiResponse){
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.token;

    if (!token) return res.status(401).send(ApiRespBuilder(false, "you are not authaurized", 401, null));

    try{
        const user = jwt.verify(token, process.env.JWT_SECRET as string) as {username:string};

        return res.status(200).json(ApiRespBuilder(true, "check is done seccussfully", 200, user))
    }catch(err)
    {
        return res.status(401).json(ApiRespBuilder(false, "something went wrong ", 401, null));
    }
}