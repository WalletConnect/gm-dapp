import { SunIcon } from "@chakra-ui/icons";
import { Button, Flex, useColorModeValue, useToast } from "@chakra-ui/react";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { PushContext } from "../contexts/PushContext";
import useThemeColor from "../styles/useThemeColors";
import { NOTIFICATION_BODY } from "../utils/constants";
import SendIcon from "./core/SendIcon";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

interface IPushSubscriptionProps {
  account: string;
}

const PushSubscription: FC<IPushSubscriptionProps> = ({ account }) => {
  const { pushClient } = useContext(PushContext);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSendingGm, setIsSendingGm] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState<boolean>(false);
  const toast = useToast();

  const { buttonTextColor, buttonBgColor } = useThemeColor();

  // useEffect(() => {
  //   if (!pushClient || !account) {
  //     return;
  //   }
  //   const activeSubscriptions = pushClient?.getActiveSubscriptions();

  //   if (
  //     Object.values(activeSubscriptions).some((sub) => sub.account === account)
  //   ) {
  //     setIsSubscribed(true);
  //   }
  // }, [pushClient, account]);

  // const handleSubscribe = useCallback(async () => {
  //   setIsSubscribing(true);

  //   try {
  //     if (!pushClient) {
  //       throw new Error("Push Client not initialized");
  //     }

  //     // Resolve known pairings from the Core's Pairing API.
  //     const pairings = pushClient.core.pairing.getPairings();
  //     if (!pairings?.length) {
  //       throw new Error("No pairings found");
  //     }

  //     // Use the latest pairing.
  //     const latestPairing = pairings[pairings.length - 1];
  //     if (!latestPairing?.topic) {
  //       throw new Error("Subscription failed", {
  //         cause: "pairingTopic is missing",
  //       });
  //     }

  //     const { id } = await pushClient.propose({
  //       account,
  //       pairingTopic: latestPairing.topic,
  //     });

  //     if (!id) {
  //       throw new Error("Subscription request failed", {
  //         cause: "Push propose failed",
  //       });
  //     }
  //     toast({
  //       status: "info",
  //       title: "Subscription request",
  //       description: "The subscription request has been sent to your wallet",
  //     });
  //   } catch (error) {
  //     setIsSubscribing(false);
  //     console.error({ subscribeError: error });
  //     if (error instanceof Error) {
  //       toast({
  //         status: "error",
  //         title: error.message,
  //         description: error.cause as string,
  //       });
  //     }
  //   }
  // }, [toast, account, pushClient]);

  // const handleUnsubscribe = useCallback(async () => {
  //   setIsUnsubscribing(true);
  //   try {
  //     if (!pushClient) {
  //       throw new Error("Push Client not initialized");
  //     }
  //     const pushSubscriptions = pushClient.getActiveSubscriptions();
  //     const currentSubscription = Object.values(pushSubscriptions).find(
  //       (sub) => sub.account === account
  //     );

  //     if (currentSubscription) {
  //       const unsubscribeRawRes = await fetch("/api/unsubscribe", {
  //         method: "DELETE",
  //         body: JSON.stringify({
  //           account,
  //         }),
  //         headers: {
  //           "content-type": "application/json",
  //         },
  //       });
  //       const unsubscribeRes = await unsubscribeRawRes.json();
  //       const isSuccess = unsubscribeRes.success;
  //       if (!isSuccess) {
  //         throw new Error("Failed to unsubscribe!");
  //       }
  //       await pushClient.deleteSubscription({
  //         topic: currentSubscription.topic,
  //       });

  //       setIsUnsubscribing(false);
  //       setIsSubscribed(false);
  //       toast({
  //         status: "error",
  //         title: "Unsubscribed",
  //         description: "You unsubscribed from gm notification",
  //       });
  //     }
  //   } catch (error) {
  //     setIsUnsubscribing(false);
  //     console.error({ unsubscribeError: error });
  //     if (error instanceof Error) {
  //       toast({
  //         status: "error",
  //         title: error.message,
  //         description: error.cause as string,
  //       });
  //     }
  //   }
  // }, [setIsSubscribed, toast, account, pushClient]);

  const handleSendGm = useCallback(async () => {
    setIsSendingGm(true);
    try {
      // Construct the payload, including the target `accounts`
      // that should receive the push notification.
      const notificationPayload = {
        accounts: [account],
        notification: {
          title: "gm!",
          body: NOTIFICATION_BODY,
          // href already contains the trailing slash
          icon: `${window.location.href}gmMemesArtwork.png`,
          url: "https://gm.walletconnect.com/",
          type: "gm_hourly",
        },
      };

      const result = await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationPayload),
      });

      const gmRes = await result.json();
      const { success, message } = gmRes;
      setIsSendingGm(false);
      toast({
        status: success ? "success" : "error",
        colorScheme: success ? "whatsapp" : "red",
        title:
          message ??
          (success
            ? `gm notification sent to ${account}`
            : "gm notification failed. Did you set up a subscription via the widget first?"),
      });
    } catch (error) {
      setIsSendingGm(false);
      console.error({ sendGmError: error });
      if (error instanceof Error) {
        toast({
          status: "error",
          title: error.message,
          description: error.cause as string,
        });
      }
    }
  }, [toast, account]);

  // useEffect(() => {
  //   if (!pushClient) {
  //     return;
  //   }
  //   pushClient.on("push_response", (event) => {
  //     if (event.params.error) {
  //       setIsSubscribed(false);
  //       setIsSubscribing(false);
  //       console.error("Error on `push_response`:", event.params.error);
  //       toast({
  //         status: "error",
  //         title: "Error on `push_response`",
  //         description: event.params.error.message,
  //       });
  //     } else {
  //       fetch("/api/subscribe", {
  //         method: "POST",
  //         headers: {
  //           "content-type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           account,
  //         }),
  //       })
  //         .then(async (data) => data.json())
  //         .then((data) => {
  //           if (data.success) {
  //             setIsSubscribed(true);
  //             setIsSubscribing(false);
  //             console.log(
  //               "Established PushSubscription:",
  //               event.params.subscription
  //             );
  //             toast({
  //               status: "success",
  //               colorScheme: "whatsapp",
  //               title: "Established PushSubscription",
  //               description: `${event.params.subscription?.account} successfully subscribed`,
  //             });
  //           } else {
  //             throw new Error(data.message);
  //           }
  //         })
  //         .catch((e) => {
  //           console.log(e);
  //           setIsSubscribed(false);
  //           setIsSubscribing(false);
  //           toast({
  //             status: "error",
  //             title: e.message,
  //           });
  //         });
  //     }
  //   });

  //   pushClient.on("push_delete", (event) => {
  //     setIsSubscribed(false);
  //     setIsSubscribing(false);
  //     toast({
  //       status: "success",
  //       title: "Deleted PushSubscription",
  //       description: `Deleted PushSubscription on topic ${event.topic}`,
  //     });
  //   });
  // }, [toast, account, pushClient]);

  return (
    <Flex flexDirection="column" gap={2} mb="24px">
      <Button
        leftIcon={<SendIcon isDisabled={isSendingGm} />}
        display="flex"
        size="xl"
        fontSize="16px"
        fontWeight="600"
        w="320px"
        gap="12px"
        bg={buttonBgColor}
        color={buttonTextColor}
        padding="12px 18px 12px 12px"
        justifyContent={"flex-start"}
        onClick={handleSendGm}
        isDisabled={isSendingGm}
        borderRadius={"16px"}
      >
        Send notification
      </Button>
    </Flex>
  );
};

export default PushSubscription;
