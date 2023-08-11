import { Core } from "@walletconnect/core";
import SignClient from "@walletconnect/sign-client";

import { PROJECT_METADATA } from "./constants";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const relayUrl =
  process.env.NEXT_PUBLIC_RELAY_URL || "wss://relay.walletconnect.com";

const core = new Core({
  projectId,
});

export let signClient: SignClient;

export async function createSignClient() {
  if (!projectId) {
    throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
  }
  signClient = await SignClient.init({
    projectId,
    core,
    relayUrl,
    metadata: PROJECT_METADATA,
  });
}
