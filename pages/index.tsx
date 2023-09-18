"use client";
import { Box, Flex, keyframes, useColorMode } from "@chakra-ui/react";
import {
  W3iWidget,
  useAccount as useW3iAccount,
} from "@web3inbox/widget-react";
import "@web3inbox/widget-react/dist/compiled.css";

import type { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

import DefaultView from "../views/DefaultView";
import SignedInView from "../views/SignedInView";
import { widgetStore } from "../stores/widgetStore";
import { useWeb3Modal } from "@web3modal/react";
import { motion, AnimatePresence, isValidMotionProp } from "framer-motion";
import { useAccount, useSignMessage } from "wagmi";
import dynamic from "next/dynamic";
import useSendNotifcation from "../utils/useSendNotification";
import { useSnapshot } from "valtio";

const animationKeyframes = keyframes`
  0% { opacity: 0.001; }
  25% { opacity: 0.01; }
  75% { opacity: 0.75; }
  100% { opacity: 1; }
`;

const animation = `${animationKeyframes} 1.5s ease-in`;

const Web3ModalButton = dynamic(
  () => import("@web3modal/react").then((w3m) => w3m.Web3Button),
  {
    ssr: false,
  }
);

const Home: NextPage = () => {
  const [view, changeView] = useState<"default" | "qr" | "signedIn">("default");

  // const { close: closeWidget, isOpen } = useManageW3iWidget();
  const { address, isConnected, connector } = useAccount({
    onDisconnect: () => {
      changeView("default");
    },
  });
  const { isSubscribed: hasSubscribed } = useSnapshot(widgetStore);
  const [currentAddress, setCurrentAddress] = useState<`0x${string}`>();
  const { signMessageAsync } = useSignMessage();
  const { handleSendNotification, isSending } = useSendNotifcation();
  // const isSubscribed = useIsSubscribed();
  const [iconUrl, setIconUrl] = useState("");
  const { close, open } = useWeb3Modal();
  const { colorMode } = useColorMode();
  const ref = useRef(null);

  const signMessage = useCallback(
    async (message: string) => {
      const res = await signMessageAsync({
        message,
      });

      return res as string;
    },
    [signMessageAsync]
  );

  const { account, setAccount } = useW3iAccount(signMessage);

  console.log({ account });
  // console.log({ isOpen });
  useEffect(() => {
    if (!address) return;
    setCurrentAddress(address);
    setAccount(`eip155:1:${address}`);
    console.log("---ACCOUNT SET", `eip155:1:${address}`);
  }, [address, setAccount]);

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

  const handleIsSubscribed = useCallback(async () => {
    if (!currentAddress) {
      return;
    }
    widgetStore.isSubscribed = true;
    const account = `eip155:1:${currentAddress}`;
    const subscriberRes = await fetch(`/api/subscriber?account=${account}`);
    const { subscriber } = await subscriberRes.json();

    if (subscriber && !subscriber.hasBeenWelcomed) {
      await handleSendNotification({
        address: currentAddress,
        notification: {
          title: "Welcome to gm!",
          body: "You successfully subscribed to hourly gm notifications.",
          icon: `${window.location.origin}/gm.png`,
          url: window.location.origin,
          type: "gm_hourly",
        },
      });

      const updatedSubscriberRes = await fetch(`/api/update-subscriber`, {
        method: "POST",
        body: JSON.stringify({
          hasBeenWelcomed: true,
          account,
        }),
        headers: {
          "content-type": "application/json",
        },
      });
      const { success } = await updatedSubscriberRes.json();
      console.log({ success });
    }
  }, [handleSendNotification, currentAddress]);

  // useEffect(() => {
  //   if (isSubscribed) {
  //     handleIsSubscribed();
  //   }
  // }, [isSubscribed, handleIsSubscribed]);

  useEffect(() => {
    if (currentAddress && isConnected) {
      console.log({ currentAddress, isConnected });
      changeView("signedIn");
      close();
    }
  }, [currentAddress, changeView, close, isConnected]);

  return (
    <>
      <Flex width={"100vw"}>
        <Flex
          position="fixed"
          top={"36px"}
          right={"36px"}
          alignItems="center"
          gap="16px"
          zIndex={1}
        >
          <Box maxH="600px" maxW="400px" position="fixed" top={10} right={10}>
            {currentAddress && (
              <W3iWidget
                account={currentAddress}
                onSign={signMessage}
                onConnect={onSignInWithSign}
              />
            )}
          </Box>

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
    </>
  );
};

export default Home;
