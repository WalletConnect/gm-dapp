import { Flex } from "@chakra-ui/react";
import { useManageSubscription, useW3iAccount } from "@web3inbox/widget-react";
import React from "react";
import { NOTIFICATION_BODY } from "../utils/constants";
import useSendNotifcation from "../utils/useSendNotification";
import GmButton from "./core/GmButton";
import SendIcon from "./core/SendIcon";
import SubscribeIcon from "./core/SubscribeIcon";
import UnsubscribeIcon from "./core/UnsubscribeIcon";
import Preferences from "./Preferences";
import Notifications from "./Notifications";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

const PushSubscription = ({ address }: { address: string }) => {
  const { account } = useW3iAccount();

  const {
    isSubscribed,
    subscribe,
    unsubscribe,
    isSubscribing,
    isUnsubscribing,
  } = useManageSubscription(account);
  const { handleSendNotification, isSending } = useSendNotifcation();

  return (
    <Flex flexDirection="column" gap={2} mb="24px">
      {isSubscribed ? (
        <GmButton
          leftIcon={<UnsubscribeIcon />}
          isDisabled={isUnsubscribing}
          isLoading={isUnsubscribing}
          onClick={unsubscribe}
        >
          Unsubscribe
        </GmButton>
      ) : (
        <GmButton
          leftIcon={<SubscribeIcon />}
          isDisabled={isSubscribing}
          isLoading={isSubscribing}
          onClick={subscribe}
        >
          Subscribe
        </GmButton>
      )}
      <GmButton
        leftIcon={<SendIcon isDisabled={!isSubscribed || isSending} />}
        onClick={async () => {
          if (!account) {
            return;
          }
          return handleSendNotification({
            account,
            notification: {
              title: "gm!",
              body: "This is a test notification",
              // href already contains the trailing slash
              icon: `https://gm.walletconnect.com/gm.png`,
              url: "https://gm.walletconnect.com/",
              type: "gm_hourly",
            },
          });
        }}
        isDisabled={!isSubscribed || isSending}
      >
        Send notification
      </GmButton>
      <Notifications />
      <Preferences />
    </Flex>
  );
};

export default PushSubscription;
