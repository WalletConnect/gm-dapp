import Core from "@walletconnect/core";
import { useEffect, useState } from "react";
import { createAuthClient, createPushClient } from "../utils/clients";

// 1. Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false);

  // const onInitialize = useCallback(async () => {
  //   try {
  //     debugger;
  //     await createAuthClient();
  //     await createPushClient();
  //     setInitialized(true);
  //   } catch (err: unknown) {
  //     alert(err);
  //   }
  // }, []);

  useEffect(() => {
    async function init() {
      if (!initialized) {
        const core = new Core({
          projectId,
        });
        try {
          debugger;
          await createAuthClient(core);
          await createPushClient(core);
          setInitialized(true);
        } catch (err: unknown) {
          alert(err);
        }
      }
      // onInitialize();
    }
    init();
  }, [initialized]);

  return {
    initialized,
  };
}
