import { Button, Flex, Text, useToast } from "@chakra-ui/react";
import React, { FC, useCallback, useState } from "react";
import { useSnapshot } from "valtio";
import { widgetStore } from "../stores/widgetStore";
import useThemeColor from "../styles/useThemeColors";
import { NOTIFICATION_BODY } from "../utils/constants";
import SendIcon from "./core/SendIcon";
import StatusIcon from "./core/StatusIcon";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

interface IPushSubscriptionProps {
  account: string;
}

const PushSubscription: FC<IPushSubscriptionProps> = ({ account }) => {
  const { isSubscribed } = useSnapshot(widgetStore);
  const [isSendingGm, setIsSendingGm] = useState<boolean>(false);
  const toast = useToast();
  const {
    defaultFontColor,
    buttonTextColor,
    buttonBgColor,
    disabledButtonBgColor,
    disabledButtonTextColor,
    cardBgColor,
    borderColor,
  } = useThemeColor();

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
        position: "top",
        containerStyle: {
          display: "flex",
          justifyContent: "center",
        },
        render: (props) => (
          <Flex
            mt="16px"
            h="40px"
            borderRadius="100px"
            alignItems="center"
            w="fit-content"
            color={defaultFontColor}
            border={`solid 1px ${borderColor}`}
            bgColor={cardBgColor}
            p="8px 16px 8px 8px"
            gap="8px"
            boxShadow="0px 14px 64px -4px rgba(0, 0, 0, 0.08), 0px 8px 22px -6px rgba(0, 0, 0, 0.08)"
          >
            <StatusIcon status={success ? "success" : "error"} />
            <Text fontSize={"14px"} fontWeight={500}>
              {message ??
                (success
                  ? `Message sent`
                  : "Message failed. Did you set up a subscription via the widget first?")}
            </Text>
          </Flex>
        ),
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
  }, [toast, account, borderColor, defaultFontColor, cardBgColor]);

  return (
    <Flex flexDirection="column" gap={2} mb="24px">
      <Button
        leftIcon={<SendIcon isDisabled={!isSubscribed || isSendingGm} />}
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
        isDisabled={!isSubscribed || isSendingGm}
        _disabled={{
          bgColor: disabledButtonBgColor,
          color: disabledButtonTextColor,
          cursor: "no-drop",
          _hover: {
            bgColor: disabledButtonBgColor,
          },
        }}
        borderRadius={"16px"}
        zIndex={2}
      >
        Send notification
      </Button>
    </Flex>
  );
};

export default PushSubscription;
