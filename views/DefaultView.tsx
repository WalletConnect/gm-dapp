import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Image,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useWeb3Modal } from "@web3modal/react";
import { useContext } from "react";
import { useAccount } from "wagmi";
import GmCard from "../components/core/GmCard";
import { PushContext } from "../contexts/PushContext";
import useThemeColor from "../styles/useThemeColors";

const DefaultView = () => {
  const { initialized } = useContext(PushContext);
  const { address, isConnected } = useAccount();
  const { colorMode } = useColorMode();
  const { open } = useWeb3Modal();
  const { dividerColor, infoTextColor, strongTextColor, cardFooterBgColor } =
    useThemeColor();

  return (
    <Box w="360px">
      <Box position={{ position: "relative" }}>
        <Flex
          style={{ position: "relative", top: "40px" }}
          justifyContent="center"
        >
          <Image
            style={{ width: "80px", height: "80px" }}
            src="/gm.png"
            alt="gm"
          />
        </Flex>
      </Box>
      <GmCard>
        <Box pt="40px" w="full">
          <Heading
            py="16px"
            h="63px"
            fontSize="16px"
            fontWeight="700"
            lineHeight="21px"
            textAlign="center"
          >
            GM Dapp Sign In
          </Heading>
        </Box>
        <Divider borderColor={dividerColor} />

        <Flex py="40px" w="full" justifyContent="center">
          <Button
            paddingY="1.25em"
            fontSize={"16px"}
            onClick={open}
            borderRadius={"10px"}
            border="solid 1px rgba(6, 43, 43, 0.10)"
            bg="brand.400"
            _hover={{
              bg: "brand.300",
            }}
            disabled={!initialized}
          >
            <Flex gap="1em">
              <Image src="/wc.png" fit="scale-down" alt="WC" />
              <span style={{ color: "white" }}>
                {isConnected && address ? "Connected" : "WalletConnect Sign"}
              </span>
            </Flex>
          </Button>
        </Flex>

        <Divider borderColor={dividerColor} />

        <Box
          fontSize={"14px"}
          color={infoTextColor}
          bgColor={cardFooterBgColor}
          borderBottomRadius={"24px"}
          padding="12px"
          textAlign={"center"}
          w="full"
        >
          <Text as="span" fontWeight={colorMode === "dark" ? "600" : "normal"}>
            By connecting your wallet, you acknowledge and agree to our
          </Text>{" "}
          <Text as="span" fontWeight="600" color={strongTextColor}>
            Terms of Service
          </Text>
        </Box>
      </GmCard>
    </Box>
  );
};

export default DefaultView;
