import { ReactNode } from "react";
import useInitialization from "../hooks/useInitialization";
import { authClient, pushClient } from "../utils/clients";
import { PushContext } from "./PushContext";

// Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

interface IPushProviderProps {
  children: ReactNode;
}

const PushProvider: React.FC<IPushProviderProps> = ({ children }) => {
  // const { initialized, authClient, pushClient } = useClients();
  const { initialized } = useInitialization();

  return (
    <PushContext.Provider value={{ initialized, authClient, pushClient }}>
      {children}
    </PushContext.Provider>
  );
};

export default PushProvider;
