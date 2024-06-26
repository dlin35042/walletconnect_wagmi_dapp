import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { WagmiProvider } from "wagmi";
import { mainnet, base, polygon, bsc, arbitrum } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const projectId = "dda205841b3853ee59b0fe19f8467cfc";

const metadata = {
  name: "GPO Checkout",
  description: "GetPaidOut checkout",
  url: "https://getpaidout.loc", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
export const tron = {
  id: 718,
  name: "Tron",
  nativeCurrency: { name: "TRX", symbol: "TRX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.trongrid.io"],
    },
  },
  blockExplorers: {},
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 25770160,
    },
  },
};

const chains = [mainnet, bsc, base, polygon, arbitrum, tron];

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
  defaultChain: mainnet,
  themeMode: "light",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
