"use client";
import { Box, Flex } from "@chakra-ui/react";
import { W3iContext, W3iWidget, W3iButton } from "@web3inbox/widget-react";

import type { NextPage } from "next";
import { useCallback, useContext, useEffect, useState } from "react";
import { PushContext } from "../contexts/PushContext";

import DefaultView from "../views/DefaultView";
import SignedInView from "../views/SignedInView";
import { widgetStore } from "../stores/widgetStore";
import { useWeb3Modal, Web3Button } from "@web3modal/react";
import { useAccount, useSignMessage } from "wagmi";

const Home: NextPage = () => {
  const { signClient } = useContext(PushContext);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [iconUrl, setIconUrl] = useState("");
  const { open, close } = useWeb3Modal();

  useEffect(() => {
    setIconUrl(`${window.location.origin}/gm.png`);
  }, [setIconUrl]);

  const onSignInWithSign = useCallback(async () => {
    if (!signClient) return;
    try {
      await signClient.connect({
        // Optionally: pass a known prior pairing (e.g. from `signClient.core.pairing.getPairings()`) to skip the `uri` step.
        // Provide the namespaces and chains (e.g. `eip155` for EVM-based chains) we want to use in this session.
        requiredNamespaces: {
          eip155: {
            methods: ["personal_sign"],
            chains: ["eip155:1"],
            events: [],
          },
        },
      });
    } catch (error) {
      console.log({ error });
    }
  }, [signClient]);

  const [view, changeView] = useState<"default" | "qr" | "signedIn">("default");

  const signMessage = useCallback(
    async (message: string) => {
      const msg = `0x${Buffer.from(message, "utf8").toString("hex")}`;

      const res = await signMessageAsync({
        message: msg,
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

          <Web3Button icon="show" label="Connect Wallet" balance="show" />
          {/* {address && (
            <Flex
              justifyContent="space-between"
              fontSize={"1.5em"}
              alignItems="center"
              borderRadius="100px"
              border="1px solid rgba(6, 43, 43, 0.10)"
              pl="8px"
              gap="10px"
            >
              <Flex fontSize={"14px"} gap="6px" alignItems="center">
                {isLoading ? (
                  <Spinner />
                ) : (
                  <Flex alignItems="center" gap="2">
                    <EthIcon />
                    <Text
                      color={defaultFontColor}
                      fontSize={"14px"}
                      fontWeight={500}
                    >
                      {balance?.formatted} ETH
                    </Text>
                  </Flex>
                )}
              </Flex>

              <Flex
                alignItems="center"
                borderRadius="100px"
                border="1px solid rgba(6, 43, 43, 0.10)"
                backgroundColor={cardBgColor}
                gap="6px"
                pl="8px"
                pr="10px"
                py="10px"
              >
                <Zorb />
                <Text
                  fontSize={"14px"}
                  fontWeight={500}
                  color={defaultFontColor}
                >
                  {truncate(address, 9, { position: 4 })}
                </Text>
                <IconButton
                  size="xs"
                  aria-label="sign out"
                  variant="ghost"
                  display={"flex"}
                  borderRadius={"100%"}
                  icon={<FiLogOut />}
                  colorScheme="red"
                  onClick={onSignOut}
                  alignSelf="flex-end"
                />
              </Flex>
            </Flex>
          )} */}
        </Flex>
      </Flex>
      <Flex width={"100%"} justifyContent="center">
        {view === "default" && <DefaultView handleSign={onSignInWithSign} />}
        {view === "signedIn" && address && isConnected && (
          <SignedInView address={address} />
        )}
      </Flex>
    </W3iContext>
  );
};

export default Home;
