import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const SECRET = process.env.JWT_SECRET as string;

export default async function verifyToken(token: string | undefined) {
    if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET) as { id: number };
    if (!payload || !payload.id) return null;
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user) return null;
    return user.username;
  } catch (err) {
    return false;
  }
}
