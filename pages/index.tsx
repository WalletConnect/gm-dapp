"use client";

import { Flex, Text } from "@chakra-ui/react";

import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useWeb3InboxAccount, useWeb3InboxClient } from "@web3inbox/react";

import DefaultView from "../views/DefaultView";
import SignedInView from "../views/SignedInView";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useAccountEffect } from "wagmi";
import dynamic from "next/dynamic";

const Home: NextPage = () => {
  const [view, changeView] = useState<"default" | "qr" | "signedIn">("default");

  const { data: client } = useWeb3InboxClient();
  const isReady = Boolean(client);

  const { address: currentAddress, isConnected } = useAccount();
  const { close } = useWeb3Modal();

  useAccountEffect({
    onDisconnect() {
      changeView("default");
    },
  });

  useWeb3InboxAccount(`eip155:1:${currentAddress}`);

  useEffect(() => {
    if (currentAddress && isConnected) {
      changeView("signedIn");
      close();
    }
  }, [currentAddress, changeView, close, isConnected]);

  if (!isReady) {
    return (
      <Flex>
        <span>Loading..</span>
      </Flex>
    );
  }

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

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
