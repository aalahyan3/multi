import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../../lib/prisma";

function getUsernameFromEmail(email: string) {
  return email.slice(0, email.indexOf("@"));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code was found in callback");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        code: code as string,
        grant_type: "authorization_code",
        redirect_uri: process.env.CALLBACK_URI as string,
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) {
      return res.status(400).json(tokens);
    }

    const user = jwt.decode(tokens.id_token as string) as { email?: string } | null;
    if (!user || !user.email) {
      return res.status(400).send("Something went wrong with ID token");
    }

    const userInfos = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }).then((res) => res.json());

    let user_touched = await prisma.user.findUnique({
      where: { email: userInfos.email },
    });

    if (!user_touched) {
      user_touched = await prisma.user.create({
        data: {
          username: getUsernameFromEmail(user.email),
          email: userInfos.email,
          first_name: userInfos.given_name || "",
          last_name: userInfos.family_name || "",
          image_url: userInfos.picture || "",
        },
      });
    }

    const jwtToken = jwt.sign(
      { id: user_touched.id, username: user_touched.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.setHeader(
      "Set-Cookie",
      `token=${jwtToken}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`
    );

    res.redirect(`/chat`);
  } catch (err) {
    console.error("❌ Callback handler error:", err);
    res.status(500).send("Internal server error in callback");
  }
}
