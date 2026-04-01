"use client";

import { PhantomProvider, darkTheme, AddressType } from "@phantom/react-sdk";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PhantomProvider
      config={{
        providers: ["google", "apple", "injected"],
        appId: "85254667-f372-4083-b135-ab4d0df0ec04",
        // process.env.NEXT_PUBLIC_PHANTOM_APP_ID as string,
        addressTypes: [AddressType.solana],
        authOptions: {
          redirectUrl:
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        },
      }}
      theme={{
        ...darkTheme,
        background: "#1a3614",
        secondary: "#8FAF86",
        text: "#F7F3DD",
        brand: "#C8FF69",
        success: "#9CE43F",
        overlay: "rgba(20, 48, 20, 0.72)",
        borderRadius: "28px",
      }}
      appName="Cooper"
    >
      {children}
    </PhantomProvider>
  );
}
