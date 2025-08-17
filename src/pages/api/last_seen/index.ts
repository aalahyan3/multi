import { NextApiRequest, NextApiResponse } from "next";
import { getUserIdFromRequest } from "../../../utils/getUserIdFromRequest";
import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";

export default async function handler(req :NextApiRequest, res: NextApiResponse)
{
   try{
    const userId = getUserIdFromRequest(req);
    if (!userId)
        return res.send('dumb');
    await prisma.user.update({where: {id:userId}, data:{last_seen: new Date()}});
        return res.send("done");
  }
  catch(err)
  {
    res.send("dumb");
  }
}