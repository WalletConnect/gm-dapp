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
  Avatar,
  Spinner,
} from "@chakra-ui/react";
import React from "react";
import GmButton from "./core/GmButton";
import {
  useNotifications,
  useNotificationTypes,
  useSubscription,
} from "@web3inbox/react";
import Link from "next/link";

import useThemeColor from "../styles/useThemeColors";
import NotificationsIcon from "./core/NotificationsIcon";
import SendIcon from "./core/SendIcon";
import useSendNotification from "../utils/useSendNotification";
import { useAccount } from "wagmi";

function Notifications() {
  const { data: notifications, fetchNextPage, isLoadingNextPage, isLoading: isLoadingNotifications } = useNotifications(5, true)
  const { data: types } = useNotificationTypes()

  const { address }  = useAccount();

  const { data: subscription } = useSubscription();

  const isSubscribed = Boolean(subscription)

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { defaultFontColor, cardBgColor, borderColor } = useThemeColor();
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
              {!notifications?.length ? (
                <Flex flexDir={"column"} alignItems="center" gap={"10px"}>
                  <Text>No messages yet.</Text>
                  <GmButton
                    leftIcon={
                      <SendIcon isDisabled={!isSubscribed || isSending} />
                    }
                    border={`solid 1px ${borderColor}`}
                    onClick={async () => {
                      return handleSendNotification({
                        account: `eip155:1:${address}`,
                        notification: {
                          title: "gm!",
                          body: "This is a test notification",
                          // href already contains the trailing slash
                          icon: `https://gm.walletconnect.com/gm.png`,
                          url: "https://gm.walletconnect.com/",
                          friendly_type: "Manual",
                          // id for gm manual
                          type: "eb35fbb8-9b71-4b9e-be3f-62a246e6c992",
                        },
                      });
                    }}
                    isDisabled={!isSubscribed || isSending}
                  >
                    Send test notification
                  </GmButton>
                </Flex>
              ) : (
                notifications
                  .map(({ id, ...message }) => (
                    <Alert
                      as={Link}
                      href={message.url ?? undefined}
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
                      <Avatar src={types?.[message.type]?.imageUrls.md} />
                    </Alert>
                  ))
              )}
	      <Flex justifyContent="center" flexDir="column" alignItems="center">
                {isLoadingNextPage || isLoadingNextPage? <Spinner /> : null }
	        <GmButton
                  leftIcon={<NotificationsIcon isDisabled={!isSubscribed} />}
                  onClick={fetchNextPage}
	        >
                  Load more notifications
                </GmButton>
              </Flex>
            </Flex>

          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Notifications;
