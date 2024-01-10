import { Flex, Spinner, Text } from "@chakra-ui/react";
import { useManageSubscription, useW3iAccount } from "@web3inbox/widget-react";
import React, { useCallback, useEffect, useState } from "react";
import useSendNotification from "../utils/useSendNotification";
import GmButton from "./core/GmButton";
import SendIcon from "./core/SendIcon";
import SubscribeIcon from "./core/SubscribeIcon";
import UnsubscribeIcon from "./core/UnsubscribeIcon";
import Preferences from "./Preferences";
import Notifications from "./Notifications";
import { useSignMessage } from "wagmi";
import useThemeColor from "../styles/useThemeColors";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

const PushSubscription = ({ address }: { address: string }) => {
  const { account, register, isRegistered, isRegistering } = useW3iAccount();
  const { actionTextColor } = useThemeColor();
  const [cancelledRegistry, setCancelledRegistry] = useState(false);

  const {
    isSubscribed,
    subscribe,
    unsubscribe,
    isSubscribing,
    isUnsubscribing,
  } = useManageSubscription(account);
  const { handleSendNotification, isSending } = useSendNotification();
  
  const { signMessageAsync } = useSignMessage();

  const handleRegister = useCallback(() => {
    setCancelledRegistry(false);
    console.log("attempting to register")
    register((m) => signMessageAsync({message: m})).catch((m) => {
      console.error(m);
      setCancelledRegistry(true);
    });
  }, [register, signMessageAsync])

  useEffect(() => {
    if(!isRegistered) {
      handleRegister()
    }
  }, [register, signMessageAsync, isRegistered])

  const handleSubscribe = useCallback(() => {
    if(isRegistered) {
      return subscribe()
    }
  }, [subscribe, isRegistered])

  if(!isRegistered) {
    return (
      <Flex align="center" justify="center" flexDirection="column" gap={2} mb="24px">
        <Text
          textAlign={"center"}
          color={actionTextColor}
          fontSize="14px"
          fontWeight={500}
          mb="24px"
          px="32px"
        >
	  Sign the message to allow subscribing
        </Text>
	{cancelledRegistry ? (
	  <GmButton
            leftIcon={<SubscribeIcon />}
            isLoading={false}
            onClick={handleRegister}
	  >
	    Register
	  </GmButton>
	) : <Spinner />}
      </Flex>
    )
  }

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
          onClick={handleSubscribe}
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
              friendly_type: "Manual",
              // id for manual
              type: "eb35fbb8-9b71-4b9e-be3f-62a246e6c992",
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
