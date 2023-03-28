import { AuthClient } from "@walletconnect/auth-client/dist/types/client";
import { DappClient } from "@walletconnect/push-client";
import { ReactNode, useCallback, useReducer } from "react";
import { initialPushState, PushContext } from "./PushContext";
import { PushReducer } from "./PushReducer";

// Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

interface IPushProviderProps {
  children: ReactNode;
}

const PushProvider: React.FC<IPushProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(PushReducer, initialPushState);

  const setAuthClient = useCallback((authClient: AuthClient) => {
    dispatch({
      type: "SET_AUTH_CLIENT",
      payload: authClient,
    });
  }, []);

  const setPushClient = useCallback((pushClient: DappClient) => {
    dispatch({
      type: "SET_PUSH_CLIENT",
      payload: pushClient,
    });
  }, []);

  return (
    <PushContext.Provider value={{ ...state, setAuthClient, setPushClient }}>
      {children}
    </PushContext.Provider>
  );
};

export default PushProvider;
