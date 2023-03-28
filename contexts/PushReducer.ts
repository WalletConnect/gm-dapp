import { AuthClient } from "@walletconnect/auth-client/dist/types/client";
import { DappClient } from "@walletconnect/push-client";
import { ICore } from "@walletconnect/types";

export type PushState = {
  core: ICore;
  authClient?: AuthClient;
  setAuthClient: (authClient: AuthClient) => void;
  pushClient?: DappClient;
  setPushClient: (pushClient: DappClient) => void;
};

export const PushReducer = (
  state: PushState,
  action:
    | {
        type: "SET_AUTH_CLIENT";
        payload: AuthClient;
      }
    | {
        type: "SET_PUSH_CLIENT";
        payload: DappClient;
      }
) => {
  switch (action.type) {
    case "SET_PUSH_CLIENT":
      return {
        ...state,
        pushClient: action.payload,
      };
    case "SET_AUTH_CLIENT":
      return {
        ...state,
        authClient: action.payload,
      };
    default:
      return state;
  }
};
