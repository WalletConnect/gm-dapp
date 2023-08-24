import { useColorModeValue } from "@chakra-ui/react";
import React from "react";

function WalletConnectIcon() {
  const fillColor = useColorModeValue("#9EA9A9", "#6E7777");
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="18"
      viewBox="0 0 24 18"
      fill="none"
    >
      <path
        d="M6.33054 5.39922C9.46165 2.3336 14.5382 2.3336 17.6693 5.39922L18.0461 5.76817C18.2027 5.92145 18.2027 6.16997 18.0461 6.32325L16.757 7.58536C16.6788 7.662 16.5519 7.662 16.4736 7.58536L15.955 7.07764C13.7707 4.93899 10.2292 4.93899 8.04482 7.07764L7.48947 7.62136C7.4112 7.69801 7.28428 7.69801 7.206 7.62136L5.91693 6.35925C5.76038 6.20597 5.76038 5.95746 5.91693 5.80418L6.33054 5.39922ZM20.3352 8.0094L21.4825 9.13268C21.639 9.28596 21.639 9.53448 21.4825 9.68776L16.3093 14.7528C16.1528 14.9061 15.899 14.9061 15.7424 14.7528L12.0708 11.158C12.0317 11.1197 11.9682 11.1197 11.9291 11.158L8.25756 14.7528C8.101 14.9061 7.84718 14.9061 7.69062 14.7528L2.51732 9.68769C2.36076 9.53441 2.36076 9.28589 2.51732 9.13261L3.6646 8.00933C3.82115 7.85605 4.07498 7.85605 4.23154 8.00933L7.90318 11.6042C7.94232 11.6425 8.00577 11.6425 8.04491 11.6042L11.7164 8.00933C11.8729 7.85605 12.1268 7.85604 12.2833 8.00932L15.955 11.6042C15.9941 11.6425 16.0576 11.6425 16.0967 11.6042L19.7683 8.0094C19.9248 7.85611 20.1787 7.85611 20.3352 8.0094Z"
        fill={fillColor}
      />
    </svg>
  );
}

export default WalletConnectIcon;
