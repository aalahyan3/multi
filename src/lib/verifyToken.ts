import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const SECRET = process.env.JWT_SECRET || "your_secret_here";

export default async function verifyToken(token: string | undefined) {
    if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET) as { username: string };
    if (!payload || !payload.username) return null;
    const user = await prisma.user.findUnique({
      where: { username: payload.username },
    });
    if (!user) return null;
    return user.username;
  } catch (err) {
    return false;
  }
}
