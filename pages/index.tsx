"use client";
import { Flex } from "@chakra-ui/react";

import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useW3iAccount,
} from "@web3inbox/widget-react";

import DefaultView from "../views/DefaultView";
import SignedInView from "../views/SignedInView";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import useSendNotification from "../utils/useSendNotification";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

const Home: NextPage = () => {
  const [view, changeView] = useState<"default" | "qr" | "signedIn">("default");
  useInitWeb3InboxClient({
    projectId,
    domain: "gm.walletconnect.com",
  });

  const {
    account,
    setAccount,
  } = useW3iAccount();
  const { isSubscribed } = useManageSubscription(account);
  const { address, isConnected } = useAccount({
    onDisconnect: () => {
      changeView("default");
    },
  });
  const [currentAddress, setCurrentAddress] = useState<`0x${string}`>();
  const { handleSendNotification } = useSendNotification();
  const { close } = useWeb3Modal();

  // We need to set the account as soon as the user is connected
  useEffect(() => {
    if (!address) return;
    setAccount(`eip155:1:${address}`);
  }, [address, setAccount]);

  useEffect(() => {
    if (!address) return;
    setCurrentAddress(address);
  }, [address]);

  const handleIsSubscribed = useCallback(async () => {
    if (!account) {
      return;
    }

    try {
      const subscriberRes = await fetch(`/api/subscriber?account=${account}`);
      if (subscriberRes.status !== 200) {
        throw new Error("Failed to fetch subscriber");
      }
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
        if (updatedSubscriberRes.status !== 200) {
          return console.error("Failed to update subscriber");
        }
        await updatedSubscriberRes.json();
      }
    } catch (error) {
      console.error(error);
    }
  }, [handleSendNotification, account]);

  useEffect(() => {
    if (isSubscribed) {
      handleIsSubscribed();
    }
  }, [isSubscribed, handleIsSubscribed]);

  useEffect(() => {
    if (currentAddress && isConnected) {
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
