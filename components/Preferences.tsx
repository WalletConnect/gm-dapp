import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
  Flex,
  Box,
  Switch,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import GmButton from "./core/GmButton";
import {
  useManageSubscription,
  useSubscriptionScopes,
  useW3iAccount,
} from "@web3inbox/widget-react";
import SettingsIcon from "./core/SettingsIcon";
import useThemeColor from "../styles/useThemeColors";
import { useForm } from "react-hook-form";
import StatusIcon from "./core/StatusIcon";
import ToastWrapper from "./core/ToastWrapper";

function Preferences() {
  const { account } = useW3iAccount();

  const { isSubscribed } = useManageSubscription(account);
  const { scopes, updateScopes } = useSubscriptionScopes(account);
  const {
    isOpen: isPreferencesOpen,
    onOpen: onOpenPreferences,
    onClose: onClosePreferences,
  } = useDisclosure();
  const { defaultFontColor, helperFontColor, cardBgColor, borderColor } =
    useThemeColor();
  const {
    register,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();
  const toast = useToast();

  useEffect(() => {
    Object.entries(scopes).forEach(([scopeKey, scope]) => {
      const s: any = scope;
      setValue(scopeKey, s.enabled);
    });
  }, [scopes, setValue]);

  const onSubmitPreferences = handleSubmit(async (formData) => {
    const enabledScopes = Object.entries(formData)
      .filter(([key, isEnabled]) => isEnabled)
      .map(([key]) => key);
    try {
      const isUpdated = await updateScopes(enabledScopes);
      if (isUpdated) {
        toast({
          status: isUpdated ? "success" : "error",
          colorScheme: isUpdated ? "whatsapp" : "red",
          position: "top",
          containerStyle: {
            display: "flex",
            justifyContent: "center",
          },
          render: () => (
            <ToastWrapper>
              <StatusIcon status={isUpdated ? "success" : "error"} />
              <Text fontSize={"14px"} fontWeight={500}>
                {isUpdated
                  ? "Preferences updated"
                  : "Failed to update preferences"}
              </Text>
            </ToastWrapper>
          ),
        });
      }
    } catch (error) {
      toast({
        status: "error",
        colorScheme: "red",
        position: "top",
        containerStyle: {
          display: "flex",
          justifyContent: "center",
        },
        render: () => (
          <ToastWrapper>
            <StatusIcon status={"error"} />
            <Text fontSize={"14px"} fontWeight={500}>
              Failed to update preferences
            </Text>
          </ToastWrapper>
        ),
      });
    }
  });

  return (
    <>
      <GmButton
        leftIcon={<SettingsIcon isDisabled={!isSubscribed} />}
        isDisabled={!isSubscribed}
        onClick={onOpenPreferences}
      >
        Preferences
      </GmButton>
      <Modal onClose={onClosePreferences} isOpen={isPreferencesOpen} isCentered>
        <ModalOverlay />
        <ModalContent
          borderRadius="24px"
          color={defaultFontColor}
          bg={cardBgColor}
        >
          <ModalHeader textAlign="center">Preferences</ModalHeader>
          <ModalCloseButton rounded="full" mt={2} mr="12px" />

          <ModalBody display="flex" gap="10px" flexDir="column">
            {Object.entries(scopes)?.map(([scopeKey, scope]) => {
              return (
                <Flex
                  key={scopeKey}
                  alignItems="flex-start"
                  gap="20px"
                  alignSelf="stretch"
                >
                  <Box flexGrow={1}>
                    <Text fontWeight={600}>{scopeKey}</Text>
                    <Text fontSize="14px" color={helperFontColor}>
                      {scope.description}
                    </Text>
                  </Box>
                  <Switch
                    size="lg"
                    colorScheme="brand"
                    id={scopeKey}
                    defaultChecked={(scope as any).enabled}
                    {...register(scopeKey)}
                  />
                </Flex>
              );
            })}
          </ModalBody>
          <ModalFooter>
            <GmButton
              onClick={onSubmitPreferences}
              w="full"
              rounded="full"
              justifyContent={"center"}
              isLoading={isSubmitting}
              border={`solid 1px ${borderColor}`}
            >
              Update
            </GmButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Preferences;