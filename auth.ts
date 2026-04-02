import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      // On first sign-in, call our wallet API to create/retrieve the OWS wallet
      if (account && profile) {
        try {
          const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
          const res = await fetch(`${baseUrl}/api/wallet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: token.sub,
              displayName: token.name ?? (profile as any).name,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            token.walletAddress = data.walletAddress;
          }
        } catch {
          // Non-fatal — wallet can be fetched later
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expose wallet address + userId in the session
      session.user.id = token.sub ?? "";
      (session.user as any).walletAddress = token.walletAddress as string | undefined;
      return session;
    },
  },
});
