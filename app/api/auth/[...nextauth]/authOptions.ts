import  { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ConnectToDB } from "@/config/db";
import User from "@/schemas/user";


export const authOptions: AuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "your@email.com" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          // Ensure DB is connected
          await ConnectToDB();
          const { email, password } = credentials as { email: string; password: string };
          
          // Find the user by email
          const user = await User.findOne({ email });
          if (!user) {
            throw new Error("Invalid credentials");
          }
          
          // Validate the password
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            throw new Error("Invalid credentials");
          }
          // Return the user object (NextAuth will embed this info into the session)
          return { 
            id: user._id.toString(), 
            email: user.email, 
            companyName: user.companyName,
            username: user.username,
            verificationStatus: user.verificationStatus
          };
        },
      }),
    ],
    // Use JSON Web Tokens for session handling.
    session: {
      strategy: "jwt" as SessionStrategy,
      maxAge: 24*24*5, // 24 hours
    },
    callbacks: {
      async jwt({ token, user }) {
        // When a user is returned (i.e. during sign-in) add their details to the token.
        if (user) {

          token.id = user.id;
          token.email = user.email;
          token.companyName = user.companyName;
          token.username = user.username;
          token.verificationStatus= user.verificationStatus;
        }
        return token;
      },
      async session({ session, token }) {
        // Make the token data available in the session
        if (session.user) {
          session.user.id = token.id;
          session.user.email = token.email as string; 
          session.user.companyName = token.companyName;
          session.user.username = token.username;
          session.user.verificationStatus = token.verificationStatus
        }

        return session;
      },
    },
    pages: {
      signIn: '/auth/signin', // your custom sign-in page
      error: '/auth/error',   // an error page if needed
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
  