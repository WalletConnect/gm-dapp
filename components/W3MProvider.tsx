import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { useEffect, useState } from "react";
import { mainnet } from "viem/chains";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

const chains = [mainnet] as const;

const queryClient = new QueryClient();

const metadata = {
  name: "GM dApp",
  description: "GM dApp is example dApp to test notifications with Web3Inbox",
  url: "https://gm.walletconnect.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableEmail: true,
});

type W3MProviderProps = {
  children: React.ReactNode;
};

export default function W3MProvider({ children }: W3MProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready || typeof window === "undefined" || !document) {
    return null;
  }

  createWeb3Modal({
    wagmiConfig,
    projectId,
    metadata,
  });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
