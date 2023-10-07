import {
  Box,
  Flex,
  HStack,
  IconButton,
  Spinner,
  Text,
  useClipboard,
  useColorModeValue,
} from "@chakra-ui/react";
import truncate from "smart-truncate";
import { useManageSubscription, useW3iAccount } from "@web3inbox/widget-react";

import PushSubscription from "../components/PushSubscription";
import CopyIcon from "../components/core/CopyIcon";
import GmCard from "../components/core/GmCard";
import Zorb from "../components/core/Zorb";
import useThemeColor from "../styles/useThemeColors";
import { useAccount } from "wagmi";

const SignedInView: React.FC = () => {
  const { account, setAccount } = useW3iAccount();
  const { isSubscribed } = useManageSubscription(account);
  const { address } = useAccount({
    onDisconnect: () => {
      setAccount("");
      window.location.reload();
    },
  });
  const zorbBorder = useColorModeValue(
    "rgba(6, 43, 43, 0.05)",
    "rgba(255, 255, 255, 0.05)"
  );
  const { onCopy, hasCopied } = useClipboard(address ?? "");
  const { actionTextColor, defaultFontColor } = useThemeColor();

  return (
    <Box w="360px">
      <GmCard>
        <Flex justifyContent="center" pt="40px" pb="24px">
          <Box border={`8px solid ${zorbBorder}`} borderRadius={"64px"}>
            <Zorb width="64px" height="64px" />
          </Box>
        </Flex>
        <Flex flexDirection="column" alignItems="center" mt="8px" mb="24px">
          {address ? (
            <HStack>
              <Text fontWeight="600" fontSize={"20px"} color={defaultFontColor}>
                {truncate(address, 9, { position: 4 })}
              </Text>
              <IconButton
                icon={
                  <CopyIcon fillColor={hasCopied ? "#3396FF" : "#8B9797"} />
                }
                aria-label="copy address"
                onClick={onCopy}
                variant="unstyled"
              >
                {hasCopied ? "Copied!" : "Copy"}
              </IconButton>
            </HStack>
          ) : (
            <Spinner />
          )}
        </Flex>

        <Text
          textAlign={"center"}
          color={actionTextColor}
          fontSize="14px"
          fontWeight={500}
          mb="24px"
          px="32px"
        >
          {isSubscribed
            ? "You are subscribed to GM. Now you can send test notifications from the dApp."
            : "Connect your wallet to the widget and enable notifications first in order to send and receive notifications."}
        </Text>
        {address && <PushSubscription address={address} />}
      </GmCard>
    </Box>
  );
};

export default SignedInView;
