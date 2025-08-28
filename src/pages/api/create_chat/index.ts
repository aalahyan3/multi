import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma"
import verifyToken from "../../../lib/verifyToken";
import ApiRespBuilder from '../../../utils/ApiRespBuilder';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json(ApiRespBuilder(false, "method not allowed", 405, null));
    }
  
    const curr_user = req.cookies['username'] as string;
    const with_user = req.body?.username;
  
    if (!with_user || !curr_user) {
      return res.status(400).json(ApiRespBuilder(false, "can't perform action", 400, null));
    }
  
    try {
      let chat = await prisma.chat.findFirst({
        where: {
          AND: [
            { members: { some: { user: { username: curr_user } } } },
            { members: { some: { user: { username: with_user } } } },
          ],
        },
        include: {
          members: { include: { user: true } },
          messages: { include: { sender: true } },
        },
      });
  
      if (chat) {
        return res.status(200).json(ApiRespBuilder(true, "chat already exists", 200, chat));
      }
  
      chat = await prisma.chat.create({
        data: {
          members: {
            create: [
              { user: { connect: { username: curr_user } } },
              { user: { connect: { username: with_user } } },
            ],
          },
        },
        include: {
          members: { include: { user: true } },
          messages: { include: { sender: true } },
        },
      });
  
      return res.status(200).json(ApiRespBuilder(true, "chat created", 200, chat));
    } catch (err) {
      console.error(err);
      return res.status(500).json(ApiRespBuilder(false, "server error", 500, null));
    }
  }
  