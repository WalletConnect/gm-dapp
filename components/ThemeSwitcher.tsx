import {
  Flex,
  FormLabel,
  Icon,
  Input,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import useThemeColor from "../styles/useThemeColors";
import SunIcon from "./core/SunIcon";
import MoonIcon from "./core/MoonIcon";

const ThemeSwitcher = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { borderColor } = useThemeColor();
  const activeIconBg = useColorModeValue("#FFF", "#1E1F1F");
  const activeIconBorderColor = useColorModeValue(
    "rgba(6, 43, 43, 0.10)",
    "rgba(255, 255, 255, 0.05)"
  );

  return (
    <FormLabel
      htmlFor="theme-switcher"
      as={"label"}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
      position="relative"
    >
      <Input
        id="theme-switcher"
        type="checkbox"
        checked={colorMode === "dark"}
        onChange={toggleColorMode}
        display="inline-block"
        appearance="none"
        cursor="pointer"
        height="34px"
        width="82px"
        border={`1px solid ${borderColor}`}
        _hover={{ border: `1px solid ${borderColor}` }}
        borderRadius="full"
      />
      {/* Active icon */}
      <Flex
        transition="all 0.2s ease-in"
        transform={`${
          colorMode === "dark" ? "translateX(40px)" : "translateX(0)"
        }`}
        position="absolute"
        cursor="pointer"
        top={"1px"}
        left={"1px"}
        w={"40px"}
        height="32px"
        border={`solid 1px ${activeIconBorderColor}`}
        borderRadius="full"
        bg={activeIconBg}
        justifyContent={"center"}
        alignItems="center"
      >
        <Icon
          as={colorMode === "dark" ? MoonIcon : SunIcon}
          padding="2px"
          w="16px"
          height="16px"
        />
      </Flex>
      {/* Inactive icon */}
      <Flex
        transition="all 0.2s ease-in"
        transform={`${
          colorMode === "dark" ? "translateX(0)" : "translateX(40px)"
        }`}
        position="absolute"
        cursor="pointer"
        top={"1px"}
        left={"1px"}
        w={"40px"}
        height="32px"
        borderRadius="full"
        justifyContent={"center"}
        alignItems="center"
      >
        <Icon
          as={colorMode === "dark" ? SunIcon : MoonIcon}
          padding="2px"
          w={"16px"}
          height="16px"
        />
      </Flex>
    </FormLabel>
  );
};

export default ThemeSwitcher;
