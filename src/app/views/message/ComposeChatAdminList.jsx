import React, { useEffect, useState } from "react";
import { Box, Button, Checkbox, Grid, Typography } from "@mui/material";
import { collection, getDocs, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../../../src/firebase/Firebase";
import { useProfileData } from "app/contexts/profileContext";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { Link, useLocation } from "react-router-dom";
import useChat from "app/hooks/useChat";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import {
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material";
import { REACT_APP_BASE_URL } from "config";

const ComposeChatAdminList = () => {
  const { logUserData } = useProfileData();
  const { pathname } = useLocation();
  const receiverId = logUserData?._id;
  const [currentTime, setCurrentTime] = useState(new Date());

  const [notificationNumber, setNotificationNumber] = useState("");

  const { composeChats, userDetails, handleCheckboxChange, checkMessage, pinnedMessageHadler } = useChat();
  console.log({composeChats})

  const designation_id = localStorage.getItem(localStorageKey.designation_id);

  // Find user details for each chat
  const findUserDetails = (userId) => {
    return userDetails.find((user) => user?._id === userId);
  };

  // Helper function to format the date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date?.toLocaleDateString();
  };

  // Helper function to format the time
  const formatTime = (timestamp) => {
    const time = new Date(timestamp?.seconds * 1000);
    return time?.toLocaleTimeString();
  };

  // Helper function to check if the date is today
  // const isToday = (timestamp) => {
  //   const date = new Date(timestamp?.seconds * 1000);
  //   const today = new Date();

  //   return (
  //     date.getDate() === today.getDate() &&
  //     date.getMonth() === today.getMonth() &&
  //     date.getFullYear() === today.getFullYear()
  //   );
  // };

  const isToday = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    const today = new Date();

    const diffInMs = today - date;

    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 1) {
      return "Just now";
    }

    const isSameDay =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isSameDay) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return date.toLocaleDateString();
  };

  useEffect(() => {
    // Update the current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  console.log(designation_id, "this oscojjjjjjjjjjjjjj");
  return (
    <Box p={3}>
      {composeChats?.length < 1 ? (
        <Typography p={3} component="div" sx={{ textAlign: "center" }}>
          <Typography component="div">
            <svg
              width="232px"
              height="152px"
              viewBox="0 0 232 152"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <title>Page 1</title>
              <desc>Created with Sketch.</desc>
              <defs></defs>
              <g id="Convos" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Artboard-Copy-28" transform="translate(-656.000000, -275.000000)">
                  <g id="Page-1" transform="translate(657.000000, 275.000000)">
                    <path
                      d="M222.365145,113.016025 L222.365145,128.114437"
                      id="Stroke-1"
                      stroke="#BBBBBB"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                    <g id="Group-34" transform="translate(0.000000, 0.067872)">
                      <polygon
                        id="Stroke-2"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        points="177.9647 138.780523 183.068792 131.548909 200.204322 139.78068 194.461257 150.151073"
                      ></polygon>
                      <polygon
                        id="Stroke-4"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        points="200.203937 139.781193 207.586778 149.242351 229.826399 134.323226 223.536742 128.045668"
                      ></polygon>
                      <path
                        d="M209.842175,91.989535 C210.255327,93.6338403 210.021807,95.7340434 209.997428,97.0428285 C209.942256,99.9318883 209.68564,103.060423 210.329746,105.9021 C211.107292,109.337981 213.5105,111.721199 216.958136,112.502372 C219.932315,113.175974 223.211867,112.325648 225.481635,110.293317 C227.2587,108.700236 228.381395,106.493742 229.1166,104.225779 C231.15413,97.931573 229.107618,87.8851747 225.724137,82.1979785 C223.105371,77.7952357 217.794704,76.112512 212.983155,75.4209817 C207.701998,74.661579 202.351556,74.5591301 197.022926,74.575778 C191.795659,74.592426 186.619715,74.74738 181.459168,75.6655785 C178.637676,76.1675783 175.576247,76.9077718 173.171756,78.5981792 C170.329734,80.5972139 169.158282,84.0868806 171.783464,86.8530017 C175.184908,90.4348725 203.410097,89.1581027 206.774332,89.4718525 C207.399192,89.5294801 208.038165,89.6421739 208.566794,89.9802554 C209.242977,90.4131021 209.629184,91.1404895 209.842175,91.989535 L209.842175,91.989535 Z"
                        id="Stroke-6"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M178.887491,95.6381256 C178.887491,96.4013701 179.508502,97.0211862 180.273217,97.0211862 C181.037933,97.0211862 181.658944,96.4013701 181.658944,95.6381256 C181.658944,94.8748811 181.037933,94.255065 180.273217,94.255065 C179.508502,94.255065 178.887491,94.8748811 178.887491,95.6381256"
                        id="Fill-8"
                        fill="#BABABA"
                      ></path>
                      <path
                        d="M160.183524,109.204029 C161.217687,108.929978 162.250566,108.652085 163.287294,108.375473 C162.222338,108.219238 161.179194,107.979764 160.159146,107.664734"
                        id="Stroke-10"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M153.259384,104.254721 C151.03709,102.725671 149.003409,100.887993 147.198116,98.8979225 C142.427625,93.643573 139.352083,87.259724 135.105089,81.6544869 C132.245104,77.8792438 128.693539,73.8350723 123.973089,72.4673791 C116.518396,70.3095485 108.564584,72.9591339 103.803075,79.0394779 C97.6019506,86.9574997 97.8341881,99.2027081 104.247021,106.881255 C109.194576,112.807926 117.183031,116.35394 124.91102,116.003052 C134.969082,115.545874 145.05024,112.996176 154.786249,110.595029 C155.341823,110.458004 155.896113,110.318417 156.450404,110.17755"
                        id="Stroke-12"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-dasharray="5.017,6.021"
                      ></path>
                      <path
                        d="M102.574013,43.7552979 C100.941936,44.5351904 99.6550065,45.0768891 99.6550065,45.0768891 C99.6550065,45.0768891 101.135681,45.6749347 102.629185,46.2627355"
                        id="Stroke-14"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M109.852283,48.4939451 C115.859662,49.7745568 122.077467,49.9243883 128.209305,49.7655925 C133.295433,49.6336895 139.250206,49.318659 143.563921,46.3040992 C145.090785,45.2360691 146.458549,43.9490545 148.081644,43.0218916 C154.9705,39.0840109 162.692074,39.3772709 170.361041,39.1813373 C175.347089,39.0532762 180.23434,38.0300675 184.138752,34.7452987 C188.544848,31.0392086 191.24958,25.3929919 190.475883,19.6199947 C190.031937,16.3160167 188.741159,13.1336968 186.866579,10.382943 C181.614934,2.68390586 171.002581,-1.57156659 162.527839,2.4136968 C161.307631,2.98869143 160.131046,3.73272678 159.022466,4.66373144 C156.746282,6.57056216 154.989746,9.09720891 152.893193,11.203815 C150.201292,13.9071862 147.224547,16.3698024 143.841066,18.1652199 C139.035932,20.7161982 133.476347,20.5522799 128.251647,21.5024938 C123.736489,22.3233658 119.801283,25.3199971 117.136327,28.9530922 C114.278908,32.8487128 112.088691,37.3628688 108.283076,40.4734745 C107.677463,40.9677906 106.843461,41.500525 105.931191,42.0204533"
                        id="Stroke-16"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-dasharray="4.914,5.897"
                      ></path>
                      <path
                        d="M59.361683,31.9440888 C65.7424386,29.101131 75.5426018,30.6545129 81.6192676,29.4942787 C83.8697895,29.0639932 86.2499024,28.4915598 87.8280905,26.8331678 C89.8104488,24.748332 89.9438891,21.3675173 88.7121325,18.7691563 C87.4803759,16.1707953 85.1246415,14.2639646 82.6085221,12.8642561 C74.4263225,8.31168173 64.494002,8.4512684 55.1737107,9.38995672 C49.6487692,9.94702278 44.0442768,10.7717367 39.044115,13.1792865 C34.0426701,15.588117 29.6648019,19.8205385 28.3111528,25.1952655 C27.3526922,29.0038045 27.9326443,33.1709147 26.3570223,36.7681528 C24.3797964,41.278467 19.5015272,42.9816804 15.8396175,45.7772556 C11.2615889,49.2707641 9.58588677,54.8030064 9.1778674,60.357019 C8.93023301,63.717344 9.05469175,67.2800055 7.38797114,70.2100449 C5.91114633,72.8058447 3.22822656,74.5180225 1.60641374,77.0267406 C0.0590195482,79.4214844 -0.399039926,82.4911105 0.382355648,85.2316194 C1.1650343,87.9734089 3.17305413,90.3412598 5.75332752,91.5642439 C7.93456312,92.5976975 10.4891749,93.0792074 12.8949495,93.2956308 C18.5084234,93.8014724 24.1385774,94.1805334 29.7751468,94.1446763 C32.8699352,94.1254671 36.0352929,93.9666713 38.9068254,92.8154014 C41.779641,91.6641316 44.3458006,89.3449439 45.0296821,86.3316648 C46.1023367,81.6074884 42.4519748,76.4479042 44.4279177,72.0221104 C45.510837,69.5953513 47.9910302,68.1610663 49.919499,66.3285111 C52.7050652,63.6802062 54.4385059,59.9574682 54.6707434,56.123317 C54.9979287,50.7101716 52.459997,45.334164 53.3093958,39.9773655 C53.9842957,35.7295768 56.2720269,33.3207463 59.361683,31.9440888 L59.361683,31.9440888 Z"
                        id="Stroke-18"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M84.2878169,29.2194595 C84.0722595,30.3463977 85.094874,31.3721676 86.1854918,31.7320195 C87.2761096,32.093152 88.4616753,32.0201571 89.5856532,32.2557896 C90.7096311,32.4927028 91.8862152,33.2060035 92.0568648,34.3393448 C92.2506099,35.6404462 91.0547795,36.7174406 89.8897431,37.3321342 C88.7247067,37.9455471 87.3697745,38.4641948 86.766727,39.6333933 C86.3458768,40.4491429 86.3895015,41.414724 86.4421078,42.3290807 C86.558868,44.3255543 86.6743452,46.3220278 86.7898224,48.3185013 C86.8873365,49.9922607 86.9296781,51.8453058 85.8544573,53.1348817 C84.8985628,54.2823097 83.3190917,54.6588095 82.0668058,55.4745591 C79.1080239,57.4031602 78.6550967,60.6034087 78.6550967,64.9613301 L78.6550967,76.5073246"
                        id="Stroke-20"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M77.2700121,34.2361275 C77.2700121,34.999372 77.8910227,35.619188 78.6557383,35.619188 C79.4204538,35.619188 80.0414644,34.999372 80.0414644,34.2361275 C80.0414644,33.4728829 79.4204538,32.8530669 78.6557383,32.8530669 C77.8910227,32.8530669 77.2700121,33.4728829 77.2700121,34.2361275"
                        id="Fill-22"
                        fill="#BABABA"
                      ></path>
                      <path
                        d="M52.4896266,76.5066843 L52.4896266,90.3155195"
                        id="Stroke-24"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M62.9875519,76.5066843 L62.9875519,90.2822236"
                        id="Stroke-26"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M73.4854772,76.5066843 L73.4854772,90.3155195"
                        id="Stroke-28"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M44.2369954,76.5066843 L80.6880083,76.5066843 C84.4923398,76.5066843 87.6050913,79.6134481 87.6050913,83.4117422 L87.6050913,83.4117422 C87.6050913,87.2087557 84.4923398,90.3155195 80.6880083,90.3155195 L42.8679493,90.3155195"
                        id="Stroke-30"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                      <path
                        d="M175.442935,89.4558449 C175.65721,91.3626756 175.074691,92.9263024 173.736439,94.3311334 C172.250633,95.8909183 169.823046,95.6552858 168.173005,96.9576678 C166.815507,98.0295398 166.806525,99.8057481 167.738041,101.19265 C168.421923,102.212017 169.334193,102.879216 170.426093,103.39018 C171.927297,104.091955 172.938364,104.490225 172.996102,106.313816 C173.089767,109.313009 172.480304,112.485084 173.341251,115.452261 C174.17012,118.306744 176.446304,120.575988 179.095863,121.832268 C181.327139,122.891334 183.790652,123.315216 186.159218,123.958083 C186.645505,124.091267 187.562907,125.088864 187.562907,126.228608 L187.562907,133.223309"
                        id="Stroke-32"
                        stroke="#BBBBBB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </Typography>
          <Typography mt={2} variant="h6" fontWeight={600}>
            No conversations to see here!
          </Typography>
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
            <Table sx={{ minWidth: "100%", width: "max-content" }}>
              <TableBody>
                {composeChats.map((chat) => {
                  const user = findUserDetails(chat?.user);
                  const lastMessage = chat?.text?.[chat?.text?.length - 1];
                  const isNotification = chat?.text?.filter(
                    (data) => data.messageSenderId !== receiverId && data.isNotification == false
                  );
                  return (
                    <>
                      <TableRow key={chat.id}>
                        {
                          pathname !== "/pages/message/compose/message" && <TableCell sx={{ border: "none", width: "30px" }}>
                            <Typography component="span">
                              <Checkbox
                                checked={checkMessage.includes(chat.id)}
                                onChange={(e) => handleCheckboxChange(e, chat?.id)}
                              />
                            </Typography>
                          </TableCell>
                        }
                        <TableCell sx={{ border: "none" }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                wordBreak: "break-all",
                                cursor: "pointer"
                              }}
                              onClick={() => {
                                const url =`${REACT_APP_BASE_URL}pages/message/compose/message?slug=${chat.id}`
                                window.open(url, "_blank");
                              }}
                            >
                              <Typography component="span">
                                <img
                                  src={
                                    user?.image ||
                                    "https://i.etsystatic.com/site-assets/images/avatars/default_avatar.png?width=75"
                                  }
                                  style={{
                                    borderRadius: "50%",
                                    height: "60px",
                                    width: "60px"
                                  }}
                                  alt="User Avatar"
                                />
                              </Typography>
    
                              <Box ml={2}>
                                <Typography fontWeight="bold">
                                  {user?.name || "Agukart"}
                                </Typography>
    
                                <Typography
                                  sx={{
                                    textDecoration: "none",
                                    fontSize: "16px",
                                    color: "#565675",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    display: "inline-block",
                                    width: "200px",
                                    "&:hover": { textDecoration: "underline" }
                                  }}
                                >
                                  {lastMessage?.text || "No message available"}
                                </Typography>
    
                                {chat?.productId != null && chat?.orderId != null && (
                                  <Box
                                    sx={{
                                      mt: 1, 
                                      backgroundColor: "#fe8e40",
                                      borderRadius: "20px",
                                      display: "block",
                                      width: "fit-content", 
                                      padding: "6px 12px",
                                      color: "black",
                                      fontSize: "14px"
                                    }}
                                  >
                                    Help Request
                                  </Box>
                                )}
    
                              </Box>
                            </Box>
                        </TableCell>
                        <TableCell sx={{ border: "none" }}>
                          <Box>
                            {!isNotification?.length ? (
                              <></>
                            ) : (
                              <Link
                                to={`/pages/message/compose/message?slug=${chat.id}`}
                                sx={{ textDecoration: "none" }}
                              >
                                <Typography
                                  component="span"
                                  sx={{
                                    color: "#fff",
                                    background: "#D23F57",
                                    borderRadius: "50%",
                                    height: "25px",
                                    width: "25px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                >
                                  {isNotification?.length || 0}
                                </Typography>
                              </Link>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ border: "none" }}>
                          <Box>
                            <Link
                              to={`/pages/message/compose/message?slug=${chat.id}`}
                              sx={{
                                textDecoration: "none",
                                color: "#000",
                                "&:hover": { textDecoration: "underline" }
                              }}
                            >
                              <Typography sx={{ color: "#000" }}>
                                {lastMessage && isToday(lastMessage?.createdAt, currentTime)}
                              </Typography>
                            </Link>
                            <Typography>
                              <svg
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 512 512"
                                height="25px"
                                width="25px"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="32"
                                  d="m112 160-64 64 64 64"
                                ></path>
                                <path
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="32"
                                  d="M64 224h294c58.76 0 106 49.33 106 108v20"
                                ></path>
                              </svg>
                            </Typography>
                          </Box>
                        </TableCell>
                        {
                          pathname !== "/pages/message/compose/message" && <TableCell sx={{ border: "none" }}>
                            <Box>
                              <div>
                                {chat?.pinnedMsgAdmin !== logUserData?._id ? (
                                  <PushPinOutlinedIcon
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => pinnedMessageHadler(chat?.id, receiverId)}
                                  />
                                ) : (
                                  <PushPinIcon
                                    onClick={() => pinnedMessageHadler(chat?.id, receiverId)}
                                    sx={{ cursor: "pointer" }}
                                  />
                                )}
                              </div>
                            </Box>
                          </TableCell>
                        }
                      </TableRow>
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default ComposeChatAdminList;
