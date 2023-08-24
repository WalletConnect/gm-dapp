"use client";
import { Box, Flex, useColorMode } from "@chakra-ui/react";
import {
  W3iContext,
  W3iWidget,
  W3iButton,
  useManageW3iWidget,
} from "@web3inbox/widget-react";

import type { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

import DefaultView from "../views/DefaultView";
import SignedInView from "../views/SignedInView";
import { widgetStore } from "../stores/widgetStore";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useSignMessage } from "wagmi";
import dynamic from "next/dynamic";
import useSendNotifcation from "../utils/useSendNotification";

const Web3ModalButton = dynamic(
  () => import("@web3modal/react").then((w3m) => w3m.Web3Button),
  {
    ssr: false,
  }
);

const Home: NextPage = () => {
  const [view, changeView] = useState<"default" | "qr" | "signedIn">("default");
  const { close: closeWidget } = useManageW3iWidget();
  const { address, isConnected, connector } = useAccount({
    onDisconnect: () => {
      changeView("default");
    },
  });
  const { signMessageAsync } = useSignMessage();
  const { handleSendNotification } = useSendNotifcation();
  const [iconUrl, setIconUrl] = useState("");
  const { close, open } = useWeb3Modal();
  const { colorMode } = useColorMode();
  const ref = useRef(null);

  useOnClickOutside(ref, () => {
    console.log("clicked outside");
    // closeWidget();
  });

  useEffect(() => {
    setIconUrl(`${window.location.origin}/gm.png`);
  }, [setIconUrl]);

  const onSignInWithSign = useCallback(async () => {
    console.log({ signingIn: true, connector });
    if (!connector) return open();
    try {
      const connected = await connector.connect({
        chainId: 1,
      });
      console.log({ connected });
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

  const handleIsSubscribed = useCallback(async () => {
    widgetStore.isSubscribed = true;
    await handleSendNotification({
      title: "Welcome to gm!",
      body: "You successfully subscribed to hourly gm notifications.",
      icon: `${window.location.href}gm.png`,
      url: "https://notify.gm.walletconnect.com/",
      type: "gm_hourly",
    });
  }, [handleSendNotification]);

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
          zIndex={1}
        >
          <div
            style={{
              position: "relative",
              zIndex: 99999999,
            }}
          >
            <W3iButton theme={colorMode} />
            <Box
              ref={ref}
              position="fixed"
              top="5em"
              left={{
                base: "10px",
                sm: isConnected ? "30%" : "37%",
                md: isConnected ? "50%" : "57%",
                lg: isConnected ? "65%" : "65%",
                xl: isConnected ? "70%" : "75%",
              }}
              zIndex={99999}
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
      <Flex
        width={"100%"}
        justifyContent="center"
        position="relative"
        zIndex={0}
      >
        {view === "default" ? <DefaultView /> : <SignedInView />}
      </Flex>
    </W3iContext>
  );
};

export default Home;
