import { SunIcon } from "@chakra-ui/icons";
import { Button, useColorModeValue, useToast } from "@chakra-ui/react";
import { DappClient } from "@walletconnect/push-client";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { PROJECT_METADATA } from "../utils/constants";
import { PushContext } from "../contexts/PushContext";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

interface IPushSubscriptionProps {
  address: string;
}

const PushSubscription: FC<IPushSubscriptionProps> = ({ address }) => {
  const { core, setPushClient, pushClient } = useContext(PushContext);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const toast = useToast();

  const gmBtnTextColor = useColorModeValue("gray.800", "gray.100");

  const handleSubscribe = useCallback(async () => {
    setIsSubscribing(true);

    try {
      if (!pushClient) {
        throw new Error("Push Client not initialized");
      }

      // Resolve known pairings from the Core's Pairing API.
      const pairings = pushClient.core.pairing.getPairings();
      if (!pairings?.length) {
        throw new Error("No pairings found");
      }

      // Use the latest pairing.
      const latestPairing = pairings[pairings.length - 1];
      if (!latestPairing?.topic) {
        throw new Error("Subscription failed", {
          cause: "pairingTopic is missing",
        });
      }

      const pushTopic = await pushClient.request({
        account: `eip155:1:${address}`,
        pairingTopic: latestPairing.topic,
      });

      if (!pushTopic?.id) {
        throw new Error("Subscription failed", {
          cause: "Push request failed",
        });
      }
      toast({
        status: "info",
        title: "Subscription proposal",
        description: "The subscription request has been sent to your wallet",
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
  }, [toast, pushClient, address]);

  const handleUnsubscribe = useCallback(async () => {
    try {
      if (!pushClient) {
        throw new Error("Push Client not initialized");
      }
      const pushSubscriptions = pushClient.getActiveSubscriptions();
      const foundSubscription = Object.values(pushSubscriptions).find(
        (sub) => sub.metadata.url === PROJECT_METADATA.url
      );

      if (foundSubscription) {
        await pushClient?.deleteSubscription({
          topic: foundSubscription.topic,
        });

        setIsSubscribed(false);
        toast({
          status: "error",
          title: "Unsubscribed",
          description: "You unsubscribed from gm notification",
        });
      }
    } catch (error) {
      console.error({ unsubscribeError: error });
      if (error instanceof Error) {
        toast({
          status: "error",
          title: error.message,
          description: error.cause as string,
        });
      }
    }
  }, [setIsSubscribed, toast, pushClient]);

  useEffect(() => {
    async function initPushClient() {
      if (!address || !core) {
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

        const pushSubscriptions = client.getActiveSubscriptions();
        if (
          pushSubscriptions &&
          Object.values(pushSubscriptions)
            .map((sub) => sub.metadata.url)
            .includes(PROJECT_METADATA.url)
        ) {
          setIsSubscribed(true);
        }

        setPushClient(client);
      } catch (error) {
        if (error instanceof Error) {
          toast({
            status: "error",
            title: "An error occurred initializing the Push Client",
            description: error.message,
          });
        }
      }
    }

    initPushClient();
  }, [toast, address, core, setPushClient]);

  useEffect(() => {
    if (!pushClient) {
      return;
    }
    pushClient.on("push_response", (event) => {
      if (event.params.error) {
        setIsSubscribed(false);
        setIsSubscribing(false);
        console.error("Error on `push_response`:", event.params.error);
        toast({
          status: "error",
          title: "Error on `push_response`",
          description: event.params.error.message,
        });
      } else {
        setIsSubscribed(true);
        setIsSubscribing(false);
        console.log("Established PushSubscription:", event.params.subscription);
        toast({
          status: "success",
          colorScheme: "whatsapp",
          title: "Established PushSubscription",
          description: `${event.params.subscription?.account} successfully subscribed`,
        });
      }
    });
  }, [pushClient, toast]);

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
