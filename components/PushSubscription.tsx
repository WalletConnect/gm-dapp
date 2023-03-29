import { SunIcon } from "@chakra-ui/icons";
import { Button, Flex, useColorModeValue, useToast } from "@chakra-ui/react";
import { DappClient } from "@walletconnect/push-client";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { PROJECT_METADATA } from "../utils/constants";
import { PushContext } from "../contexts/PushContext";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

interface IPushSubscriptionProps {
  account: string;
}

const PushSubscription: FC<IPushSubscriptionProps> = ({ account }) => {
  const { setPushClient, pushClient } = useContext(PushContext);
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
        account,
        pairingTopic: latestPairing.topic,
      });

      if (!pushTopic?.id) {
        throw new Error("Subscription request failed", {
          cause: "Push request failed",
        });
      }
      toast({
        status: "info",
        title: "Subscription request",
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
  }, [toast, pushClient, account]);

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

  const handleSendGm = useCallback(async () => {
    try {
      if (!pushClient) {
        throw new Error("Push Client not initialized");
      }
      // Construct the payload, including the target `accounts`
      // that should receive the push notification.
      const notificationPayload = {
        accounts: [account],
        notification: {
          title: "gm!",
          body: "This is a test gm notification",
          // href already contains the trailing slash
          icon: `${window.location.href}gmMemesArtwork.png`,
          url: window.location.href,
        },
      };

      // We can construct the URL to the Cast server using the `castUrl` property
      // of the `PushDappClient` (which will be `https://cast.walletconnect.com` by default),
      // together with our Project ID.
      const result = await fetch(`${pushClient.castUrl}/${projectId}/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationPayload),
      });

      const gmRes = await result.json(); // { "sent": ["eip155:1:0xafeb..."], "failed": [], "not_found": [] }
      const isSuccessfulGm = gmRes.sent.includes(account);
      toast({
        status: isSuccessfulGm ? "success" : "error",
        title: isSuccessfulGm
          ? `gm notification sent to ${account}`
          : "gm notification failed",
      });
    } catch (error) {
      console.error({ sendGmError: error });
      if (error instanceof Error) {
        toast({
          status: "error",
          title: error.message,
          description: error.cause as string,
        });
      }
    }
  }, [pushClient, toast, account]);

  useEffect(() => {
    async function initPushClient() {
      if (!account) {
        return;
      }
      try {
        const client = await DappClient.init({
          // core,
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
  }, [toast, account, setPushClient]);

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
        fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            account,
          }),
        })
          .then(async (data) => data.json())
          .then((data) => {
            if (data.success) {
              setIsSubscribed(true);
              setIsSubscribing(false);
              console.log(
                "Established PushSubscription:",
                event.params.subscription
              );
              toast({
                status: "success",
                colorScheme: "whatsapp",
                title: "Established PushSubscription",
                description: `${event.params.subscription?.account} successfully subscribed`,
              });
            } else {
              throw new Error(data.message);
            }
          })
          .catch((e) => {
            console.log(e);
            setIsSubscribed(false);
            setIsSubscribing(false);
            toast({
              status: "error",
              title: e.message,
            });
          });
      }
    });
  }, [pushClient, toast, account]);

  return isSubscribed ? (
    <Flex flexDirection="column" gap={2}>
      <Button
        leftIcon={<SunIcon />}
        rightIcon={<SunIcon />}
        size="lg"
        fontWeight="bold"
        onClick={handleSendGm}
        border="solid 1px green"
        color={gmBtnTextColor}
        bg="#2BEE6C"
        borderRadius={"16px"}
        _hover={{
          bg: "yellow.300",
          border: "solid 1px yellowgreen",
        }}
      >
        Send me a gm
      </Button>
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
    </Flex>
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
