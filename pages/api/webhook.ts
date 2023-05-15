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

  const { id, event, account, dappUrl } = req.body;

  console.log(
    `[API] Webhook ${id} received event "${event}" for account ${account} on dapp ${dappUrl}`
  );

  if (!account || !event) {
    return res.status(400).json({ success: false });
  }

  if (event === "subscribed") {
    const existingUser = await db
      .select()
      .from(gmUsers)
      .where(eq(gmUsers.account, account));

    if (existingUser.length > 0) {
      return res.status(200).json({ success: true });
    }

    try {
      await db.insert(gmUsers).values({
        account,
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        return res
          .status(500)
          .json({ success: false, message: error?.message });
      }
    }
  } else if (event === "unsubscribed") {
    try {
      await db.delete(gmUsers).where(eq(gmUsers.account, account));
      return res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        return res
          .status(500)
          .json({ success: false, message: error?.message });
      }
    }
  } else {
    res.status(400).json({
      success: false,
      message: `Unknown event ${event}. Expected "subscribed" or "unsubscribed".`,
    });
  }

  res.status(200).json({ success: true });
}
