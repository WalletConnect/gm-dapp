import { SunIcon } from "@chakra-ui/icons";
import { Button, useColorModeValue, useToast } from "@chakra-ui/react";
import { DappClient } from "@walletconnect/push-client";
import React, { FC, useCallback, useEffect, useState } from "react";
import { PROJECT_METADATA } from "../utils/constants";

// Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}
interface IPushSubscriptionProps {
  address: string;
}

const PushSubscription: FC<IPushSubscriptionProps> = ({ address }) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [pushClient, setPushClient] = useState<DappClient>();
  const toast = useToast();

  const gmBtnTextColor = useColorModeValue("gray.800", "gray.100");

  const handleSubscribe = useCallback(async () => {
    setIsSubscribing(true);

    try {
      if (!pushClient) {
        throw new Error("Push Client not initialized");
      }

      const pairingTopic = localStorage.getItem("wc_pairingTopic");
      if (!pairingTopic) {
        throw new Error("Subscription failed", {
          cause: "pairingTopic is missing",
        });
      }

      const pushTopic = await pushClient.request({
        account: address,
        pairingTopic,
      });

      if (!pushTopic?.id) {
        throw new Error("Subscription failed", {
          cause: "Push request failed",
        });
      }
      setIsSubscribing(false);
      setIsSubscribed(true);
      toast({
        status: "success",
        title: "Subscribed",
        colorScheme: "whatsapp",
        description: "You successfully subscribed to gm notification",
      });
    } catch (error) {
      setIsSubscribing(false);
      console.error({ subscribeError: error });
      if (error instanceof Error) {
        toast({
          status: "error",
          title: error.message,
          description: error.cause as string,
        });
      }
    }
  }, [setIsSubscribed, toast, pushClient, address]);

  const handleUnsubscribe = useCallback(() => {
    setIsSubscribed(false);
    toast({
      status: "error",
      title: "Unsubscribed",
      description: "You unsubscribed from gm notification",
    });
  }, [setIsSubscribed, toast]);

  useEffect(() => {
    async function initPushClient() {
      if (!address) {
        return;
      }
      try {
        const client = await DappClient.init({
          projectId,
          metadata: PROJECT_METADATA,
          relayUrl:
            process.env.NEXT_PUBLIC_RELAY_URL ||
            "wss://relay.walletconnect.com",
        });

        setPushClient(client);
      } catch (error) {
        if (error instanceof Error) {
          toast({
            status: "error",
            title: "An error occurred initializing the Push Client",
            description: error.message,
          });
          setPushClient(undefined);
        }
      }
    }

    initPushClient();
  }, [toast, address]);

  return isSubscribed ? (
    <Button
      size="lg"
      fontWeight="bold"
      border="solid 1px rgba(255, 0, 0, 0.2)"
      borderRadius={"16px"}
      onClick={handleUnsubscribe}
      color="red.400"
      _hover={{
        bg: "red.300",
        border: "solid 1px red",
        color: gmBtnTextColor,
      }}
    >
      Unsubscribe from gm
    </Button>
  ) : (
    <Button
      leftIcon={<SunIcon />}
      rightIcon={<SunIcon />}
      size="lg"
      fontWeight="bold"
      onClick={handleSubscribe}
      border="solid 1px green"
      color={gmBtnTextColor}
      bg="#2BEE6C"
      borderRadius={"16px"}
      _hover={{
        bg: "yellow.300",
        border: "solid 1px yellowgreen",
      }}
      isLoading={isSubscribing}
      loadingText="Subscribing.."
      isDisabled={isSubscribing}
    >
      Subscribe to gm
    </Button>
  );
};

export default PushSubscription;
