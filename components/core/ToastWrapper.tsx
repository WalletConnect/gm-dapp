import { Flex } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import useThemeColor from "../../styles/useThemeColors";

function ToastWrapper({ children }: { children: ReactNode }) {
  const { defaultFontColor, cardBgColor, borderColor } = useThemeColor();
  return (
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
      {children}
    </Flex>
  );
}

export default ToastWrapper;
