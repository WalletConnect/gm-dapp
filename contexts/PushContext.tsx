import { Core } from "@walletconnect/core";
import { createContext } from "react";
import { PushState } from "./PushReducer";

// Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

export const initialPushState = {
  core: new Core({
    projectId,
  }),
  setAuthClient: () => undefined,
  setPushClient: () => undefined,
} as PushState;

export const PushContext = createContext(initialPushState);
