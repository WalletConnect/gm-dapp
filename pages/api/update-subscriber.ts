import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import { gmUsers } from "../../db/schema/gm_users";

const dbConnectionString = process.env.DB_POOLING_URL;

if (!dbConnectionString) {
  throw new ReferenceError(
    "process.env.DB_POOLING_URL is missing in environment variables"
  );
}

const pool = new Pool({
  connectionString: dbConnectionString,
});

const db = drizzle(pool);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    // Method Not Allowed
    res.status(405).json({ success: false });
  }

  const { account, hasBeenWelcomed } = req.body;

  if (!account || typeof account !== "string") {
    return res.status(400).json({ success: false });
  }

  try {
    await db
      .update(gmUsers)
      .set({
        hasBeenWelcomed,
      })
      .where(eq(gmUsers.account, account));

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ success: false });
  }
}
