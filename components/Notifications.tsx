import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Text,
  Flex,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  CloseButton,
  Avatar,
} from "@chakra-ui/react";
import React from "react";
import GmButton from "./core/GmButton";
import {
  useManageSubscription,
  useMessages,
  useW3iAccount,
} from "@web3inbox/widget-react";
import Link from "next/link";

import useThemeColor from "../styles/useThemeColors";
import NotificationsIcon from "./core/NotificationsIcon";
import SendIcon from "./core/SendIcon";
import useSendNotification from "../utils/useSendNotification";

function Notifications() {
  const { account } = useW3iAccount();

  const { isSubscribed } = useManageSubscription(account);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { defaultFontColor, cardBgColor, borderColor } = useThemeColor();
  const { messages, deleteMessage } = useMessages(account);
  const { handleSendNotification, isSending } = useSendNotification();
  return (
    <>
      <GmButton
        leftIcon={<NotificationsIcon isDisabled={!isSubscribed} />}
        isDisabled={!isSubscribed}
        onClick={onOpen}
      >
        Notifications
      </GmButton>
      <Modal
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="24px"
          color={defaultFontColor}
          bg={cardBgColor}
        >
          <ModalHeader textAlign="center">Notifications</ModalHeader>
          <ModalCloseButton rounded="full" mt={2} mr="12px" />

          <ModalBody pb="24px">
            <Flex gap={4} flexDir="column">
              {!messages?.length ? (
                <Flex flexDir={"column"} alignItems="center" gap={"10px"}>
                  <Text>No messages yet.</Text>
                  <GmButton
                    leftIcon={
                      <SendIcon isDisabled={!isSubscribed || isSending} />
                    }
                    border={`solid 1px ${borderColor}`}
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
                          friendly_type: "gm_hourly",
                          // id for gm hourly
                          type: "cad9a52d-9b0f-4aed-9cca-3e9568a079f9",
                        },
                      });
                    }}
                    isDisabled={!isSubscribed || isSending}
                  >
                    Send test notification
                  </GmButton>
                </Flex>
              ) : (
                messages
                  .sort((a, b) => b.id - a.id)
                  .map(({ id, message }) => (
                    <Alert
                      as={Link}
                      href={message.url}
                      target="_blank"
                      key={id}
                      status="info"
                      colorScheme="gray"
                      rounded="xl"
                    >
                      <AlertIcon />

                      <Flex flexDir={"column"} flexGrow={1}>
                        <AlertTitle>{message.title}</AlertTitle>
                        <AlertDescription flexGrow={1}>
                          {message.body.split("")}
                        </AlertDescription>
                      </Flex>
                      <Avatar src={message.icon} />
                      <CloseButton
                        alignSelf="flex-start"
                        position="relative"
                        rounded="full"
                        right={-1}
                        top={-1}
                        onClick={async (e) => {
                          e.preventDefault();
                          deleteMessage(id);
                        }}
                      />
                    </Alert>
                  ))
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Notifications;
