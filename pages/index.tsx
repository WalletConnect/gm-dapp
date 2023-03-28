import { Box } from "@chakra-ui/react";
import AuthClient, { generateNonce } from "@walletconnect/auth-client";
import { Web3Modal } from "@web3modal/standalone";
import type { NextPage } from "next";
import { useCallback, useContext, useEffect, useState } from "react";

import { PushContext } from "../contexts/PushContext";
import { PROJECT_METADATA } from "../utils/constants";
import DefaultView from "../views/DefaultView";
import SignedInView from "../views/SignedInView";

// 1. Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

// 2. Configure web3Modal
const web3Modal = new Web3Modal({
  projectId,
  walletConnectVersion: 2,
});

const Home: NextPage = () => {
  const { core, authClient, setAuthClient } = useContext(PushContext);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [uri, setUri] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const onSignIn = useCallback(() => {
    if (!authClient) return;
    authClient
      .request({
        aud: window.location.href,
        domain: window.location.hostname.split(".").slice(-2).join("."),
        chainId: "eip155:1",
        type: "eip4361",
        nonce: generateNonce(),
        statement: "Sign in with wallet.",
      })
      .then(({ uri }) => {
        if (uri) {
          setUri(uri);
        }
      });
  }, [authClient, setUri]);

  useEffect(() => {
    if (core) {
      AuthClient.init({
        // core,
        relayUrl:
          process.env.NEXT_PUBLIC_RELAY_URL || "wss://relay.walletconnect.com",
        projectId,
        metadata: PROJECT_METADATA,
      })
        .then((authClient) => {
          setAuthClient(authClient);
          setHasInitialized(true);
        })
        .catch(console.error);
    }
  }, [core, setAuthClient]);

  useEffect(() => {
    if (!authClient) return;
    authClient.on("auth_response", ({ params, topic }) => {
      if (topic) {
        localStorage.setItem("wc_pairingTopic", topic);
      }
      if ("code" in params) {
        console.error(params);
        return;
      }
      if ("error" in params) {
        console.error(params.error);
        return;
      }
      setAddress(params.result.p.iss.split(":")[4]);
    });
  }, [authClient]);

  const [view, changeView] = useState<"default" | "qr" | "signedIn">("default");

  useEffect(() => {
    async function handleOpenModal() {
      if (uri) {
        await web3Modal.openModal({
          uri,
          standaloneChains: ["eip155:1"],
        });
      }
    }
    handleOpenModal();
  }, [uri]);

  useEffect(() => {
    if (address) {
      web3Modal.closeModal();
      changeView("signedIn");
    }
  }, [address, changeView]);

  return (
    <Box width="100%" height="100%">
      {view === "default" && (
        <DefaultView onClick={onSignIn} hasInitialized={hasInitialized} />
      )}
      {view === "signedIn" && <SignedInView address={address} />}
    </Box>
  );
};

export default Home;
