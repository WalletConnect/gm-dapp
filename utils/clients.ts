import AuthClient from "@walletconnect/auth-client";
import { DappClient } from "@walletconnect/push-client";
import { ICore } from "@walletconnect/types";
import { PROJECT_METADATA } from "./constants";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const relayUrl =
  process.env.NEXT_PUBLIC_RELAY_URL || "wss://relay.walletconnect.com";

export let authClient: AuthClient;
export let pushClient: DappClient;

export async function createAuthClient(core: ICore) {
  if (!projectId) {
    throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
  }
  console.log("INITIALIZING AUTH");
  authClient = await AuthClient.init({
    core,
    projectId,
    relayUrl,
    metadata: PROJECT_METADATA,
    logger: "debug",
  });
  console.log("END INITIALIZING AUTH");
}

export async function createPushClient(core: ICore) {
  if (!projectId) {
    throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
  }
  console.log("INITIALIZING PUSH");
  pushClient = await DappClient.init({
    core,
    projectId,
    metadata: PROJECT_METADATA,
    relayUrl,
    logger: "debug",
  });
  console.log("END INITIALIZING PUSH");
}
