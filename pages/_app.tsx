import "../styles/globals.css";
import type { AppProps } from "next/app";
import { version } from "@walletconnect/push-client/package.json";
import {
  ChakraProvider,
  Box,
  Flex,
  Grid,
  GridItem,
  Image,
} from "@chakra-ui/react";
import ThemeSwitcher from "../components/ThemeSwitcher";
import dynamic from "next/dynamic";

const PushProvider = dynamic(() => import("../contexts/PushProvider"), {
  ssr: false,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <PushProvider>
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
              >
                <div>Push subscription example app</div>
                <Flex
                  padding="0.5em"
                  borderRadius="16px"
                  className="bg-secondary"
                  gap="2"
                >
                  <Image
                    width="1.5em"
                    height="1.5em"
                    src="/wc-bg.png"
                    alt="WC"
                  ></Image>
                  <span>v{version}</span>
                </Flex>
              </Flex>
            </GridItem>
            <Flex justifyContent="center">
              <GridItem area={"main"} justifyContent="center">
                <Component {...pageProps} />
              </GridItem>
            </Flex>
            <GridItem area={"footer"} alignSelf="flex-end">
              <Flex justifyContent="flex-end" paddingRight={4}>
                <ThemeSwitcher />
              </Flex>
            </GridItem>
          </Grid>
        </Box>
      </PushProvider>
    </ChakraProvider>
  );
}

export default MyApp;
