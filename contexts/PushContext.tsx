import { AuthClient } from "@walletconnect/auth-client/dist/types/client";
import { DappClient } from "@walletconnect/push-client";
import { createContext } from "react";

export type PushState = {
  initialized: boolean;
  authClient?: AuthClient;
  pushClient?: DappClient;
};

export const initialPushState = {
  initialized: false,
} as PushState;

export const PushContext = createContext(initialPushState);
