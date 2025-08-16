import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma"
import verifyToken from "../../../../lib/verifyToken";
import ApiRespBuilder from '../../../../utils/ApiRespBuilder';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;
  const curr_user = await verifyToken(req.cookies['token'])
  if (!curr_user)
    return res.status(401).json(ApiRespBuilder(false, "you are not authorized", 401, null));

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { username: username as string },
      });

      if (!user) {
        return res.status(404).json(ApiRespBuilder(false, "user was not found", 404, null));
      }

      return res.status(200).json(ApiRespBuilder(true, "user fetched", 200, {self_profile:username === curr_user, user}));
    } catch (error) {
      return res.status(500).json(ApiRespBuilder(false, "internal server error test", 500, null));
    }
  }
  else if (req.method === 'PUT') {
    try {
      const { username: newUsername, first_name, last_name, specic_color, image_url, bio } = req.body;

      if (username !== curr_user)
        return res.status(401).json(ApiRespBuilder(false, "this is not u", 400, null))
      if (!newUsername || !first_name || !last_name) {
        return res.status(400).json(ApiRespBuilder(false, "username, first_name and last_name are required", 400, null));
      }

      const existingUser = await prisma.user.findUnique({
        where: { username: username as string },
      });

      if (!existingUser) {
        return res.status(404).json(ApiRespBuilder(false, "user was not found", 404, null));
      }

      if (newUsername !== username) {
        const usernameExists = await prisma.user.findUnique({
          where: { username: newUsername },
        });

        if (usernameExists) {
          return res.status(409).json(ApiRespBuilder(false, "username already exists", 409, null));
        }
      }

      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (specic_color && !colorRegex.test(specic_color)) {
        return res.status(400).json(ApiRespBuilder(false, "invalid color format", 400, null));
      }

      if (image_url && image_url.trim() !== '') {
        try {
          new URL(image_url);
        } catch {
          return res.status(400).json(ApiRespBuilder(false, "invalid image URL", 400, null));
        }
      }

      const updateData: any = {
        username: newUsername,
        first_name,
        last_name,
      };

      if (specic_color) updateData.specic_color = specic_color;
      if (image_url) updateData.image_url = image_url.trim() === '' ? null : image_url;
      if (bio) updateData.bio = bio.trim() === '' ? null : bio;

      const updatedUser = await prisma.user.update({
        where: { username: username as string },
        data: updateData,
      });

      return res.status(200).json(ApiRespBuilder(true, "profile updated successfully", 200, updatedUser));
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json(ApiRespBuilder(false, "username already exists", 409, null));
      }
      
      console.error('Profile update error:----', error);
      return res.status(500).json(ApiRespBuilder(false, "internal server error", 500, null));
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json(ApiRespBuilder(false, "method not allowed", 405, null));
  }
}