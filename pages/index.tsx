"use client";
import { Box, Flex } from "@chakra-ui/react";
import { W3iContext, W3iWidget, W3iButton } from "@web3inbox/widget-react";

import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";

import DefaultView from "../views/DefaultView";
import SignedInView from "../views/SignedInView";
import { widgetStore } from "../stores/widgetStore";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useSignMessage } from "wagmi";
import dynamic from "next/dynamic";

const Web3ModalButton = dynamic(
  () => import("@web3modal/react").then((w3m) => w3m.Web3Button),
  {
    ssr: false,
  }
);

const Home: NextPage = () => {
  const [view, changeView] = useState<"default" | "qr" | "signedIn">("default");

  const { address, isConnected, connector } = useAccount({
    onDisconnect: () => {
      changeView("default");
    },
  });
  const { signMessageAsync } = useSignMessage();
  const [iconUrl, setIconUrl] = useState("");
  const { close, open } = useWeb3Modal();

  useEffect(() => {
    setIconUrl(`${window.location.origin}/gm.png`);
  }, [setIconUrl]);

  const onSignInWithSign = useCallback(async () => {
    if (!connector) return open();
    try {
      await connector.connect({
        chainId: 1,
      });
    } catch (error) {
      console.log({ error });
    }
  }, [connector, open]);

  const signMessage = useCallback(
    async (message: string) => {
      const res = await signMessageAsync({
        message,
      });

      return res as string;
    },
    [signMessageAsync]
  );

  const handleIsSubscribed = useCallback(() => {
    widgetStore.isSubscribed = true;
  }, []);

  useEffect(() => {
    if (address) {
      close();
      changeView("signedIn");
    }
  }, [address, changeView, close]);

  return (
    <W3iContext>
      <Flex width={"100vw"}>
        <Flex
          position="fixed"
          top={"36px"}
          right={"36px"}
          alignItems="center"
          gap="16px"
        >
          <div style={{ position: "relative" }}>
            <W3iButton />
            <Box
              position="fixed"
              top="6em"
              right={{
                base: 0,
                sm: "38px",
              }}
            >
              <W3iWidget
                onMessage={console.log}
                onSubscriptionSettled={handleIsSubscribed}
                web3inboxUrl="https://web3inbox-dev-hidden.vercel.app"
                account={address}
                signMessage={async (message) => {
                  const rs = await signMessage(message);
                  return rs as string;
                }}
                dappIcon={iconUrl}
                connect={onSignInWithSign}
                dappName={"GM Dapp"}
                dappNotificationsDescription={"Subscribe to get GMs!"}
                settingsEnabled={false}
                chatEnabled={false}
              />
            </Box>
          </div>

          {isConnected && (
            <Web3ModalButton
              icon="show"
              label="Connect Wallet"
              balance="show"
            />
          )}
        </Flex>
      </Flex>
      <Flex width={"100%"} justifyContent="center">
        {view === "default" ? <DefaultView /> : <SignedInView />}
      </Flex>
    </W3iContext>
  );
};

export default Home;
