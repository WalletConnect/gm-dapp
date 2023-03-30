import AuthClient from "@walletconnect/auth-client";
import { Core } from "@walletconnect/core";
import { DappClient } from "@walletconnect/push-client";
import { PROJECT_METADATA } from "./constants";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const relayUrl =
  process.env.NEXT_PUBLIC_RELAY_URL || "wss://relay.walletconnect.com";

const core = new Core({
  projectId,
});

export let authClient: AuthClient;
export let pushClient: DappClient;

export async function createAuthClient() {
  if (!projectId) {
    throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
  }
  authClient = await AuthClient.init({
    core,
    projectId,
    relayUrl,
    metadata: PROJECT_METADATA,
  });
}

export async function createPushClient() {
  if (!projectId) {
    throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
  }
  pushClient = await DappClient.init({
    core,
    projectId,
    metadata: PROJECT_METADATA,
    relayUrl,
    logger: "debug",
  });
}
