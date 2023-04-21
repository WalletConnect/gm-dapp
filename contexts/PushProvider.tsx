import { ReactNode } from "react";
import useInitialization from "../hooks/useInitialization";
import { authClient, pushClient, signClient } from "../utils/clients";
import { PushContext } from "./PushContext";

interface IPushProviderProps {
  children: ReactNode;
}

const PushProvider: React.FC<IPushProviderProps> = ({ children }) => {
  const { initialized } = useInitialization();

  return (
    <PushContext.Provider
      value={{ initialized, authClient, pushClient, signClient }}
    >
      {children}
    </PushContext.Provider>
  );
};

export default PushProvider;
