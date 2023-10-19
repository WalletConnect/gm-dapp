import { Text, useToast } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import StatusIcon from "../components/core/StatusIcon";
import useThemeColor from "../styles/useThemeColors";
import ToastWrapper from "../components/core/ToastWrapper";

interface INotification {
  account: string;
  notification: {
    friendly_type: string;
    title: string;
    body: string;
    icon: string;
    url: string;
    type: string;
  };
}
function useSendNotification() {
  const [isSending, setIsSending] = useState<boolean>(false);
  const toast = useToast();

  const handleSendNotification = useCallback(
    async ({ account, notification }: INotification) => {
      setIsSending(true);
      try {
        // Construct the payload, including the target `accounts`
        // that should receive the push notification.
        const notificationPayload = {
          accounts: [account],
          notification,
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
        setIsSending(false);
        toast({
          status: success ? "success" : "error",
          colorScheme: success ? "whatsapp" : "red",
          position: "top",
          containerStyle: {
            display: "flex",
            justifyContent: "center",
          },
          render: (props) => (
            <ToastWrapper>
              <StatusIcon status={success ? "success" : "error"} />
              <Text fontSize={"14px"} fontWeight={500}>
                {message ??
                  (success
                    ? notification.title
                    : `Message failed. Is ${notification.friendly_type} enabled in your preferences ?`)}
              </Text>
            </ToastWrapper>
          ),
        });
      } catch (error: any) {
        setIsSending(false);
        console.error({ sendNotificationError: error });
        toast({
          status: "error",
          title: error.message,
          description: error.cause,
        });
      }
    },
    [toast]
  );

  return {
    handleSendNotification,
    isSending,
  };
}

export default useSendNotification;
