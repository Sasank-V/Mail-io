import { IUser, User } from "@/models/User";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connect_DB } from "@/utils/DB";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { defaultCategories } from "@/lib/constants";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI // e.g., "http://localhost:3000/oauth2callback"
);

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string; // Assign `sub` as `id`
      }
      return session;
    },
    async signIn({ account, user }) {
      if (!account) return false;
      await connect_DB();
      await User.findOneAndUpdate(
        { google_id: user.id },
        {
          email: user.email,
          name: user.name,
          image: user.image,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
        },
        { upsert: true, new: true }
      );
      return true;
    },
  },
};

export async function refresh_access_token(user: IUser) {
  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    oauth2Client.setCredentials({
      refresh_token: user.refresh_token,
    });
    const { credentials } = await oauth2Client.refreshAccessToken();
    if (credentials) {
      user.access_token = credentials.access_token!;
      user.expires_at = credentials.expiry_date!;
      await user.save();

      oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || user.refresh_token,
        expiry_date: credentials.expiry_date,
      });
    }
    console.log("Access Token Refreshed");
  } catch (error) {
    console.log("Error while refreshing Token: ", error);
  }
}
