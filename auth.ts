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
      // Resolve wallet address on first sign-in OR whenever it's missing from the token
      if ((account && profile) || !token.walletAddress) {
        try {
          const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
          const res = await fetch(`${baseUrl}/api/wallet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: token.sub,
              displayName: token.name ?? (profile as any)?.name,
              email: token.email ?? (profile as any)?.email,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            token.walletAddress = data.walletAddress;
            token.username = data.username;
          }
        } catch {
          // Non-fatal — will retry on next token refresh
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expose wallet address + userId in the session
      session.user.id = token.sub ?? "";
      (session.user as any).walletAddress = token.walletAddress as string | undefined;
      (session.user as any).username = token.username as string | undefined;
      return session;
    },
  },
});
