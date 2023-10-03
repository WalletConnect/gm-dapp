import { Flex, Icon, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { MdOutlineNotificationsActive } from "react-icons/md";

interface INotificationsIconProps {
  isDisabled: boolean;
}

function NotificationsIcon({ isDisabled }: INotificationsIconProps) {
  const stroke = useColorModeValue(
    isDisabled ? "#8B9797" : "#2D3131",
    isDisabled ? "#3B4040" : "#949E9E"
  );
  const backgroundColor = useColorModeValue(
    "#fff",
    "rgba(255, 255, 255, 0.15)"
  );
  const borderColor = useColorModeValue(
    "rgba(6, 43, 43, 0.1)",
    "rgba(255, 255, 255, 0.05)"
  );

  const disabledBackgroundColor = useColorModeValue(
    "rgba(6, 43, 43, 0.02)",
    "#272A2A"
  );
  const disabledBorderColor = useColorModeValue(
    "rgba(6, 43, 43, 0.10)",
    "rgba(255, 255, 255, 0.05)"
  );

  return (
    <Flex
      border={`2px solid ${isDisabled ? disabledBorderColor : borderColor}`}
      borderRadius="50%"
      backgroundColor={isDisabled ? disabledBackgroundColor : backgroundColor}
    >
      <Flex
        p="5px"
        alignItems="center"
        justifyContent="center"
        w="32px"
        h="32px"
      >
        <Icon
          as={MdOutlineNotificationsActive}
          color={stroke}
          fontWeight={600}
        />
      </Flex>
    </Flex>
  );
}

export default NotificationsIcon;
