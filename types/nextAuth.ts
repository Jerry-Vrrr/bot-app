import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      verificationStatus: boolean;
      companyName: string;
      username: string;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user types if needed
   */
  interface User {
    id: string;
    verificationStatus: boolean;
    companyName: string;
    username: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    id: string;
    verificationStatus: boolean;
    companyName: string;
    username: string;
  }
}
