import type { AppProps } from "next/app";
import { ChakraProvider, Box, Flex, Grid, GridItem } from "@chakra-ui/react";

import { WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { theme } from "../styles/theme";
import Footer from "../components/core/Footer";
import { PROJECT_METADATA } from "../utils/constants";
import Head from "next/head";

import { initWeb3InboxClient } from "@web3inbox/react";

// 1. Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

const queryClient = new QueryClient();

const chains = [mainnet] as const;
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: PROJECT_METADATA,
  enableEmail: true,
});

createWeb3Modal({ wagmiConfig, projectId });

initWeb3InboxClient({
  projectId,
  allApps: process.env.NODE_ENV === "development" ? true : false,
  domain: "gm.walletconnect.com",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>GM Dapp</title>
        <link rel="shortcut icon" href="/gm.png" />
      </Head>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ChakraProvider theme={theme}>
            <Box
              width="100vw"
              style={{ width: "100vw", height: "100vh" }}
              className="bg-primary"
            >
              <Grid
                templateAreas={`"header" "main" "footer"`}
                style={{ height: "100%", width: "100%" }}
                gridTemplateRows={"50px 3f 20px"}
                gridTemplateColumns={"1fr"}
                paddingY="2em"
              >
                <GridItem area={"header"} padding={4}>
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    gap="5"
                    fontSize={"1.25em"}
                  />
                </GridItem>
                <Flex justifyContent="center">
                  <GridItem area={"main"} justifyContent="center">
                    <Component {...pageProps} />
                  </GridItem>
                </Flex>
                <Footer />
              </Grid>
            </Box>
          </ChakraProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;
