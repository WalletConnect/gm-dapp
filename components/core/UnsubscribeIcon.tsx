import { Flex, useColorModeValue } from "@chakra-ui/react";
import React from "react";

interface IUnsubscribeIconProps {
  isDisabled?: boolean;
}

function UnsubscribeIcon({ isDisabled }: IUnsubscribeIconProps) {
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
        <svg
          width="16"
          height="14"
          viewBox="0 0 16 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.16687 12.8333H6.83275M6.0351 2.353C6.61077 1.96286 7.29431 1.75 7.99981 1.75C8.92838 1.75 9.81891 2.11875 10.4755 2.77513C11.1321 3.4315 11.501 4.32174 11.501 5.25C11.501 6.47545 11.6587 7.43821 11.8794 8.18557M4.64958 4.23339C4.55037 4.56007 4.49863 4.90237 4.49863 5.25C4.49863 7.05261 4.04376 8.28681 3.53562 9.10316C3.10699 9.79176 2.89268 10.1361 2.90054 10.2321C2.90924 10.3385 2.93178 10.379 3.01751 10.4426C3.09493 10.5 3.44396 10.5 4.14201 10.5H10.9175M13.2516 12.8333L2.74805 2.33333"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Flex>
    </Flex>
  );
}

export default UnsubscribeIcon;
