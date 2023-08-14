import type { AppProps } from "next/app";
import { ChakraProvider, Box, Flex, Grid, GridItem } from "@chakra-ui/react";
import PushProvider from "../contexts/PushProvider";
import { theme } from "../styles/theme";
import Footer from "../components/core/Footer";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
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
      </PushProvider>
    </ChakraProvider>
  );
}

export default MyApp;
