"use client";
import { Box, Flex, keyframes, useColorMode } from "@chakra-ui/react";

import type { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useW3iAccount,
} from "@web3inbox/widget-react";

import DefaultView from "../views/DefaultView";
import SignedInView from "../views/SignedInView";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { motion, AnimatePresence, isValidMotionProp } from "framer-motion";
import { useAccount, useSignMessage } from "wagmi";
import dynamic from "next/dynamic";
import useSendNotifcation from "../utils/useSendNotification";
import { useSnapshot } from "valtio";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

const animationKeyframes = keyframes`
  0% { opacity: 0.001; }
  25% { opacity: 0.01; }
  75% { opacity: 0.75; }
  100% { opacity: 1; }
`;

const animation = `${animationKeyframes} 1.5s ease-in`;

const Home: NextPage = () => {
  const [view, changeView] = useState<"default" | "qr" | "signedIn">("default");
  const isW3iInitialized = useInitWeb3InboxClient({
    projectId,
    domain: "gm.walletconnect.com",
  });
  // const { close: closeWidget, isOpen } = useManageW3iWidget();
  const {
    account,
    setAccount,
    register: registerIdentity,
    identityKey,
  } = useW3iAccount();
  const {
    subscribe,
    unsubscribe,
    isSubscribed,
    isSubscribing,
    isUnsubscribing,
  } = useManageSubscription(account);
  const { address, isConnected, connector } = useAccount({
    onDisconnect: () => {
      changeView("default");
    },
  });
  const { signMessageAsync } = useSignMessage();

  const signMessage = useCallback(
    async (message: string) => {
      const res = await signMessageAsync({
        message,
      });

      return res as string;
    },
    [signMessageAsync]
  );

  // We need to set the account as soon as the user is connected
  useEffect(() => {
    if (!Boolean(address)) return;
    setAccount(`eip155:1:${address}`);
  }, [signMessage, address, setAccount]);

  const handleRegistration = useCallback(async () => {
    if (!account) return;
    try {
      await registerIdentity(signMessage);
    } catch (registerIdentityError) {
      console.error({ registerIdentityError });
    }
  }, [signMessage, registerIdentity, account]);

  useEffect(() => {
    if (!identityKey) {
      handleRegistration();
    }
  }, [handleRegistration, identityKey]);
  const [currentAddress, setCurrentAddress] = useState<`0x${string}`>();
  const { handleSendNotification, isSending } = useSendNotifcation();
  const [iconUrl, setIconUrl] = useState("");
  const { close, open } = useWeb3Modal();
  const { colorMode } = useColorMode();
  const ref = useRef(null);
  useEffect(() => {
    if (!address) return;
    setCurrentAddress(address);
  }, [address]);

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
    if (!account) {
      return;
    }
    const subscriberRes = await fetch(`/api/subscriber?account=${account}`);
    const { subscriber } = await subscriberRes.json();

    if (subscriber && !subscriber.hasBeenWelcomed) {
      await handleSendNotification({
        account,
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
  }, [handleSendNotification, account]);

  useEffect(() => {
    if (isSubscribed) {
      handleIsSubscribed();
    }
  }, [isSubscribed, handleIsSubscribed]);

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
          {/* <div
            style={{
              position: "relative",
              zIndex: 99999999,
            }}
          >
            <W3iButton theme={colorMode} />
          </div> */}

          {currentAddress && (
            <w3m-button label="Connect Wallet" balance="show" />
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
