import { Flex, Spinner, Text } from "@chakra-ui/react";
import {
  useSubscribe,
  useUnsubscribe,
  useSubscription,
  useRegister,
  usePrepareRegistration,
  useWeb3InboxAccount
} from "@web3inbox/react";
import React, { useCallback, useEffect, useState } from "react";
import useSendNotification from "../utils/useSendNotification";
import GmButton from "./core/GmButton";
import SendIcon from "./core/SendIcon";
import SubscribeIcon from "./core/SubscribeIcon";
import UnsubscribeIcon from "./core/UnsubscribeIcon";
import Preferences from "./Preferences";
import Notifications from "./Notifications";
import { useAccount, useSignMessage } from "wagmi";
import useThemeColor from "../styles/useThemeColors";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

const PushSubscription = () => {
  const { prepareRegistration } = usePrepareRegistration();
  const { register } = useRegister();
  const { isRegistered } = useWeb3InboxAccount()
  const { address } = useAccount()
  const { actionTextColor } = useThemeColor();

  const [isRegistering, setIsRegistering] = useState(false)

  const { data: subscription } = useSubscription()
  const isSubscribed = Boolean(subscription)

  const {subscribe, isLoading: isSubscribing} = useSubscribe()
  const {unsubscribe, isLoading: isUnsubscribing} = useUnsubscribe()

  const { handleSendNotification, isSending } = useSendNotification();
  
  const { signMessageAsync } = useSignMessage();

  const handleRegister = useCallback(async () => {
    console.log("attempting to register")
    setIsRegistering(true)

    if(!address) {
      return;
    }

    const { message, registerParams } = await prepareRegistration()
    try {
      const signature = await signMessageAsync({message});
      await register({registerParams, signature})
    }
    catch(e) {
      console.error(e)
    }
    finally {
      setIsRegistering(false)
    }

  }, [register, address, signMessageAsync, prepareRegistration])

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
	  <GmButton
            leftIcon={<SubscribeIcon />}
            isLoading={isRegistering}
            onClick={handleRegister}
	  >
	    Register
	  </GmButton>
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
          isDisabled={isSubscribing || isUnsubscribing}
          isLoading={isSubscribing}
          onClick={handleSubscribe}
        >
          Subscribe
        </GmButton>
      )}
      <GmButton
        leftIcon={<SendIcon isDisabled={!isSubscribed || isSending || isUnsubscribing} />}
        onClick={async () => {
          if (!address) {
            return;
          }

          return handleSendNotification({
            account: `eip155:1:${address}`,
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
      <Preferences isUnsubscribing={isUnsubscribing} />
    </Flex>
  );
};

export default PushSubscription;
