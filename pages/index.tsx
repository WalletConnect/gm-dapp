import { Box, Flex } from "@chakra-ui/react";
import AuthClient, { generateNonce } from "@walletconnect/auth-client";
import { W3iContext, W3iWidget, W3iButton } from "@web3inbox/widget-react";
import { Web3Modal } from "@web3modal/standalone";
import type { NextPage } from "next";
import { useCallback, useContext, useEffect, useState } from "react";
import { PushContext } from "../contexts/PushContext";

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
  standaloneChains: ["eip155:1"],
});

const Home: NextPage = () => {
  const { authClient, signClient } = useContext(PushContext);
  const [authUri, setAuthUri] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [sessionTopic, setSessionTopic] = useState<string>("");
  const [iconUrl, setIconUrl] = useState("");

  useEffect(() => {
    setIconUrl(`${window.location.origin}/gm.png`);
  }, [setIconUrl]);

  const onSignInWithAuth = useCallback(() => {
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
          setAuthUri(uri);
        }
      });
  }, [setAuthUri, authClient]);

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
    if (!authClient) return;
    authClient.on("auth_response", ({ params, topic }) => {
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

  useEffect(() => {
    async function handleOpenModal() {
      if (authUri) {
        await web3Modal.openModal({
          uri: authUri,
          standaloneChains: ["eip155:1"],
        });
      }
    }
    handleOpenModal();
  }, [authUri]);

  useEffect(() => {
    if (address) {
      web3Modal.closeModal();
      changeView("signedIn");
    }
  }, [address, changeView]);

  return (
    <W3iContext>
      <Flex width={"100vw"}>
        <Flex width="75%" justifyContent={"flex-end"}>
          <div style={{ position: "relative" }}>
            <W3iButton />
            <W3iWidget
              style={{
                position: "absolute",
                top: "2.5em",
                right: "-12em",
                zIndex: 2,
              }}
              web3inboxUrl="https://web3inbox-dev-hidden-git-chore-filter-by-notify-walletconnect1.vercel.app"
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
          </div>
        </Flex>
      </Flex>
      <Flex width={"100%"} justifyContent="center">
        <Box width="30%" height="100%">
          {view === "default" && (
            <DefaultView
              handleAuth={onSignInWithAuth}
              handleSign={onSignInWithSign}
            />
          )}
          {view === "signedIn" && <SignedInView address={address} />}
        </Box>
      </Flex>
    </W3iContext>
  );
};

export default Home;
