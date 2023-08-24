import { Flex } from "@chakra-ui/react";
import { useIsSubscribed, useManageW3iWidget } from "@web3inbox/widget-react";
import React, { FC } from "react";
import { useSnapshot } from "valtio";
import { widgetStore } from "../stores/widgetStore";
import { NOTIFICATION_BODY } from "../utils/constants";
import useSendNotifcation from "../utils/useSendNotification";
import GmButton from "./core/GmButton";
import SendIcon from "./core/SendIcon";
import SubscribeIcon from "./core/SubscribeIcon";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

const PushSubscription: FC = () => {
  const isSubscribed = useIsSubscribed();
  const { isSubscribed: hasSubscribed } = useSnapshot(widgetStore);
  const { open } = useManageW3iWidget();
  const { handleSendNotification, isSending } = useSendNotifcation();

  return (
    <Flex flexDirection="column" gap={2} mb="24px">
      {!isSubscribed && !hasSubscribed && (
        <GmButton leftIcon={<SubscribeIcon />} onClick={open}>
          Subscribe
        </GmButton>
      )}
      <GmButton
        leftIcon={<SendIcon isDisabled={!isSubscribed || isSending} />}
        onClick={async () =>
          handleSendNotification({
            title: "gm!",
            body: NOTIFICATION_BODY,
            // href already contains the trailing slash
            icon: `${window.location.href}gmMemesArtwork.png`,
            url: "https://gm.walletconnect.com/",
            type: "gm_hourly",
          })
        }
        isDisabled={!isSubscribed || isSending}
      >
        Send notification
      </GmButton>
    </Flex>
  );
};

export default PushSubscription;
