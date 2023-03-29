import AuthClient from "@walletconnect/auth-client";
import { DappClient } from "@walletconnect/push-client";
import { useCallback, useEffect, useState } from "react";
import { PROJECT_METADATA } from "../utils/constants";

// 1. Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

const relayUrl =
  process.env.NEXT_PUBLIC_RELAY_URL || "wss://relay.walletconnect.com";

export default function useClients() {
  const [initialized, setInitialized] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [pushInitialized, setPushInitialized] = useState(false);
  const [pushClient, setPushClient] = useState<DappClient>();
  const [authClient, setAuthClient] = useState<AuthClient>();

  const onAuthInitialize = useCallback(async () => {
    if (!projectId) {
      throw new Error(
        "You need to provide NEXT_PUBLIC_PROJECT_ID env variable"
      );
    }
    try {
      console.log("INITIALIZING AUTH");
      const dappAuthClient = await AuthClient.init({
        // core,
        projectId,
        relayUrl,
        metadata: PROJECT_METADATA,
      });
      setAuthClient(dappAuthClient);
      setAuthInitialized(true);
      console.log("END INITIALIZING AUTH");
    } catch (err: unknown) {
      alert(err);
    }
  }, []);

  const onPushInitialize = useCallback(async () => {
    try {
      console.log("INITIALIZING PUSH");
      const dappPushClient = await DappClient.init({
        // core,
        projectId,
        metadata: PROJECT_METADATA,
        relayUrl,
      });
      setPushClient(dappPushClient);
      setPushInitialized(true);
      console.log("END INITIALIZING PUSH");
    } catch (err: unknown) {
      alert(err);
    }
  }, []);

  useEffect(() => {
    if (!authInitialized) {
      onAuthInitialize();
    }
  }, [authInitialized, onAuthInitialize]);

  useEffect(() => {
    if (!pushInitialized) {
      onPushInitialize();
    }
  }, [pushInitialized, onPushInitialize]);

  useEffect(() => {
    if (pushInitialized && authInitialized) {
      setInitialized(true);
    }
  }, [authInitialized, pushInitialized]);

  return {
    initialized,
    authInitialized,
    pushInitialized,
    authClient,
    pushClient,
  };
}
