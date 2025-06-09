  // lib/authMiddleware.ts
  import { NextApiRequest, NextApiResponse } from "next";
  import { getSession } from "next-auth/react";

  export async function authMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Proceed to the next middleware or route handler
    next();
  }
