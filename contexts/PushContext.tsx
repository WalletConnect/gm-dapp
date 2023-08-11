import { SignClient } from "@walletconnect/sign-client/dist/types/client";
import { createContext } from "react";

export type PushState = {
  initialized: boolean;
  signClient?: SignClient;
};

export const initialPushState = {
  initialized: false,
} as PushState;

export const PushContext = createContext(initialPushState);
