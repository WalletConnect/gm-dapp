import { Box, Flex, Spinner, Text, Image, IconButton } from "@chakra-ui/react";
import { W3iContext, W3iWidget, W3iButton } from "@web3inbox/widget-react";
import { Web3Modal } from "@web3modal/standalone";
import { providers } from "ethers";
import truncate from "smart-truncate";
import type { NextPage } from "next";
import { useCallback, useContext, useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { PushContext } from "../contexts/PushContext";

import DefaultView from "../views/DefaultView";
import SignedInView from "../views/SignedInView";
import Zorb from "../components/core/Zorb";
import EthIcon from "../components/core/EthIcon";
import useThemeColor from "../styles/useThemeColors";
import { widgetStore } from "../stores/widgetStore";

// 1. Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

// 2. Configure web3Modal
const web3Modal = new Web3Modal({
  projectId,
  walletConnectVersion: 2,
  standaloneChains: ["eip155:1"],
});

const Home: NextPage = () => {
  const { signClient } = useContext(PushContext);
  const [address, setAddress] = useState<string>("");
  const [sessionTopic, setSessionTopic] = useState<string>("");
  const [iconUrl, setIconUrl] = useState("");
  const [balance, setBalance] = useState<number>();
  const [isLoading, setLoading] = useState<boolean>(false);

  const { cardBgColor, defaultFontColor } = useThemeColor();

  useEffect(() => {
    setIconUrl(`${window.location.origin}/gm.png`);
  }, [setIconUrl]);

  useEffect(() => {
    const innerEffect = async (address: string) => {
      setLoading(true);
      const provider = new providers.JsonRpcProvider(
        `https://rpc.walletconnect.com/v1/?chainId=eip155:1&projectId=${process.env.NEXT_PUBLIC_PROJECT_ID}`
      );

      try {
        const balance = await provider.getBalance(address);
        setBalance(balance.toNumber());
      } catch (error) {
        setBalance(0);
        console.log({ error });
      }

      setLoading(false);
    };
    if (address) {
      innerEffect(address);
    }
  }, [setBalance, address]);

  const onSignOut = useCallback(() => {
    window.location.reload();
  }, []);

  const onSignInWithSign = useCallback(async () => {
    if (!signClient) return;
    try {
      const signRes = await signClient.connect({
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
      const { uri, approval } = signRes;
      if (uri) {
        web3Modal.openModal({ uri });
        // Await session approval from the wallet.
        const session = await approval();
        // Handle the returned session (e.g. update UI to "connected" state).
        // * You will need to create this function *
        setAddress(session.namespaces.eip155.accounts[0].split(":")[2]);
        setSessionTopic(session.topic);
        // Close the QRCode modal in case it was open.
        web3Modal.closeModal();
      }
    } catch (error) {
      console.log({ error });
    }
  }, [signClient, setSessionTopic]);

  useEffect(() => {
    if (!signClient) return;
    signClient.on("session_event", ({ id, topic, params }) => {
      // Handle session events, such as "chainChanged", "accountsChanged", etc.
    });

    signClient.on("session_update", ({ topic, params }) => {
      const { namespaces } = params;
      const _session = signClient.session.get(topic);
      // Overwrite the `namespaces` of the existing session with the incoming one.
      const updatedSession = { ..._session, namespaces };
      // Integrate the updated session state into your dapp state.
      // setAddress(_session.controller);
    });

    signClient.on("session_delete", () => {
      // Session was deleted -> reset the dapp state, clean up from user session, etc.
    });
  }, [signClient]);

  const [view, changeView] = useState<"default" | "qr" | "signedIn">("default");

  const signMessage = useCallback(
    async (message: string) => {
      const msg = `0x${Buffer.from(message, "utf8").toString("hex")}`;

      const res = await signClient?.request({
        chainId: "eip155:1",
        topic: sessionTopic,
        request: {
          method: "personal_sign",
          params: [msg, address],
        },
      });

      console.log({ res });

      return res as string;
    },
    [sessionTopic, signClient, address]
  );

  const handleIsSubscribed = useCallback(() => {
    widgetStore.isSubscribed = true;
  }, []);

  useEffect(() => {
    if (address) {
      web3Modal.closeModal();
      changeView("signedIn");
    }
  }, [address, changeView]);

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
              position="absolute"
              top="3em"
              right={{
                base: "10",
                md: "5.5em",
              }}
              width="100%"
              height="100vh"
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

          {address && (
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
                      {balance} ETH
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
          )}
        </Flex>
      </Flex>
      <Flex width={"100%"} justifyContent="center">
        {view === "default" && <DefaultView handleSign={onSignInWithSign} />}
        {view === "signedIn" && <SignedInView address={address} />}
      </Flex>
    </W3iContext>
  );
};

export default Home;
