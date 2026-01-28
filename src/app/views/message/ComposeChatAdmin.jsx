import { Box, Button, FormControl, FormControlLabel, Link, List, Radio, RadioGroup, TextareaAutosize, TextField, Tooltip, Typography } from "@mui/material";
import ListItem from "@mui/material/ListItem";
import React, { useEffect, useState, useRef } from "react";
import { db, storage } from "../../../../src/firebase/Firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  getDocs
} from "firebase/firestore";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import { useProfileData } from "app/contexts/profileContext";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import useChat from "app/hooks/useChat";
import { useNavigate } from "react-router-dom";

const ComposeChatAdmin = ({ slug }) => {
  const [messages, setMessages] = useState([]);
  const [audienceMode, setAudienceMode] = useState("snapshot");
  const [input, setInput] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  console.log({ imagePreviews });
  const [files, setFiles] = useState([]);
  const { logUserData, setLogUserData } = useProfileData();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  // const receiverId = "66f4e9e2c0b4b8af3e4555e4";
  const senderId = logUserData?._id;
  // const roomId = `${receiverId}_${senderId}`;
  const { chats, userDetails } = useChat();

  console.log("asdfghjkjhgfd", logUserData);
  const [selectedUser, setSelectedUser] = useState("allvendors");

  const handleAudienceChange = (event) => {
    setAudienceMode(event.target.value);
  };


  const handleChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    setFiles(selectedFiles);
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearPreview = () => {
    setImagePreviews([]);
    setFiles([]);
    fileInputRef.current.value = "";
  };

  const uploadImagesToFirebase = async () => {
    const uploadPromises = files.map(async (file) => {
      const storageRef = ref(storage, `announcements/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await uploadTask;
      return getDownloadURL(uploadTask.snapshot.ref);
    });

    return Promise.all(uploadPromises);
  };

  const sendMessage = async () => {
    let imageUrls = [];
    if (input.trim() || files.length > 0) {
      // Upload image if there is a file selected
      if (files.length > 0) {
        imageUrls = await uploadImagesToFirebase();
        handleClearPreview(); // Clear preview and file after upload
      }
      const now = new Date();

      const payload = {
        text: [
          {
            senderType: "admin",
            text: input,
            createdAt: now,
            messageSenderId: senderId,
            isNotification: false,
            imageUrls: imageUrls
          }
        ],
        createdAt: now,
        receiverId: senderId,
        isDeleted: false,
        currentTime: now,
        title: "title1",
        type: selectedUser
      };

      if (selectedUser === "allusers") {
        if (audienceMode === "snapshot") {
          payload.audienceMode = "snapshot";
          payload.userCreatedBefore = now;
        } else {
          payload.audienceMode = "persistent";
        }
      }

      const res = await addDoc(collection(db, "composeChat"), payload);
      navigate(`/pages/message/compose/message?slug=${res.id}`);
      setInput("");
    }
  };

  const handleRemoveAllNotification = async (venderID) => {
    console.log("venderIDvenderID", venderID);

    // Fetch all documents from 'chatRooms' collection
    const querySnapshot = await getDocs(collection(db, "chatRooms"));

    // Map the documents and return relevant data
    const documents = querySnapshot.docs.map((doc) => {
      const docId = doc.id;
      const docData = doc.data();
      const receiverId = docData.receiverId;

      return {
        id: docId,
        data: docData,
        receiverId: receiverId
      };
    });

    console.log("documentsdocuments", documents);

    // Find the document matching the given venderID
    const matchingDocument = documents.find((doc) => {
      return doc.id === venderID;
    });

    console.log("matchingDocumentmatchingDocument", matchingDocument);

    if (!matchingDocument) {
      console.error("No matching document found for the provided venderID");
      return;
    }

    // Get the existing text array from the matched document
    const existingText = matchingDocument.data.text || [];

    console.log("existingTextexistingText", existingText);

    // Update only the `isNotification` field for the relevant messages
    const updatedText = existingText.map((item) => {
      console.log("itemitemexistingTextexistingText", item);

      if (item.messageSenderId !== senderId) {
        return {
          ...item,
          isNotification: true
        };
      }
      return item;
    });

    // Update the document with the modified `text` field
    await updateDoc(doc(db, "chatRooms", matchingDocument.id), {
      text: updatedText
    });

    console.log("Updated document:", matchingDocument);
  };

  useEffect(() => {
    if (slug) {
      handleRemoveAllNotification(slug);
    }
  }, [slug, messages]);

  // Helper function to format the date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date?.toLocaleDateString();
  };

  const detectLink = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <Box p={2} sx={{ background: "#f6f9fc" }} borderBottom={"1px solid #b6b6b6"}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography fontWeight={500}>Send to:</Typography>
          <FormControl>
            <RadioGroup row value={selectedUser} onChange={handleChange}>
              <FormControlLabel value="allvendors" control={<Radio />} label="All Vendors" />
              <FormControlLabel value="allusers" control={<Radio />} label="All Users" />
            </RadioGroup>

            {selectedUser === "allusers" && (
              <Box mt={2}>
                <Typography fontWeight={500}>Audience Mode:</Typography>
                <FormControl>
                  <RadioGroup row value={audienceMode} onChange={handleAudienceChange}>
                    <FormControlLabel value="snapshot" control={<Radio />} label="Snapshot" />
                    <FormControlLabel value="persistent" control={<Radio />} label="Persistent" />
                  </RadioGroup>
                </FormControl>
              </Box>
            )}

          </FormControl>
        </Box>
      </Box>
      <Box
        sx={{
          overflow: "hidden",
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "column",
          background: "#fff"
        }}
      >
        <Typography
          p={3}
          component="div"
          sx={{
            overflowY: "scroll",
            minHeight: "100%",
            height: "300px",
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column-reverse"
          }}
        >
          <List>
            {messages.map((msg, index) => {
              const currentMessageDate = formatDate(msg?.createdAt);
              const prevMessageDate = index > 0 ? formatDate(messages[index - 1]?.createdAt) : null;

              const showDate = currentMessageDate !== prevMessageDate;
              console.log(msg, "sbse bdi hdhdhdhdhdhdhdh");

              return (
                <ListItem
                  key={msg.id}
                  sx={{
                    margin: "24px 0",
                    padding: "0",
                    display: "block",
                    width: "auto",
                    textAlign: msg.senderType === "user" ? "left" : "right"
                  }}
                >
                  {showDate && (
                    <Typography fontSize={13} color={"gray"} textAlign={"center"} pb={1}>
                      {currentMessageDate}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: msg.senderType === "user" ? "flex-start" : "flex-end"
                    }}
                  >
                    {msg.messageSenderId !== senderId && (
                      <Typography component="span" mr={2}>
                        <img
                          src={
                            userDetails?.[0]?.image ||
                            "https://i.etsystatic.com/site-assets/images/avatars/default_avatar.png?width=75"
                          }
                          style={{
                            borderRadius: "50%",
                            height: "40px",
                            width: "40px",
                            objectFit: "contain"
                          }}
                          alt=""
                        />
                      </Typography>
                    )}
                    <div>
                      <div>
                        {msg?.imageUrls?.length > 0 &&
                          msg.imageUrls.map((imageUrl, index) => (
                            <Typography
                              key={index}
                              p={2}
                              component="div"
                              sx={{
                                background: msg.senderType === "user" ? "#fff" : "#e9e9e9",
                                boxShadow: "0 0 3px #000",
                                border: "2px solid black",
                                borderRadius: "6px",
                                maxWidth: "340px",
                                minWidth: "75px",
                                textAlign: "center",
                                mb: 1,
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt="sent"
                                style={{
                                  maxWidth: "100%",
                                  height: "150px",
                                  width: "100%",
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                }}
                              />
                            </Typography>
                          ))
                        }
                        {
                          msg.text && (
                            <Typography
                              p={2}
                              component="div"
                              sx={{
                                background: msg.senderType === "user" ? "#fff" : "#e9e9e9",
                                boxShadow: "0 0 3px #000",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                maxWidth: "340px",
                                minWidth: "75px",
                                textAlign: "initial",
                                mt: 1,
                              }}
                            >
                              <Typography
                                sx={{
                                  wordWrap: "break-word",
                                  whiteSpace: "pre-line",
                                }}
                              >
                                {detectLink(msg.text || "")}
                              </Typography>

                              {msg.productLink && (
                                <Typography
                                  sx={{ wordWrap: "break-word", marginTop: "15px" }}
                                >
                                  <a
                                    href={msg.productLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "blue", textDecoration: "underline" }}
                                  >
                                    {msg.productLink}
                                  </a>
                                </Typography>
                              )}
                              {msg.shopLink && (
                                <Typography
                                  sx={{ wordWrap: "break-word", marginTop: "15px" }}
                                >
                                  <a
                                    href={msg.shopLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "blue", textDecoration: "underline" }}
                                  >
                                    {msg.shopLink}
                                  </a>
                                </Typography>
                              )}
                            </Typography>
                          )
                        }
                      </div>
                      <div>
                        <Typography
                          fontSize={11}
                          color={"gray"}
                          // textAlign={"center"}
                          pb={1}
                        >
                          {new Date(msg.createdAt.seconds * 1000).toLocaleTimeString()}{" "}
                        </Typography>
                      </div>
                    </div>
                    {msg.senderType !== "user" && (
                      <Typography component="span" ml={2}>
                        <img
                          src="https://i.etsystatic.com/icm/0ff82a/701770387/icm_150x150.701770387_gvl90sgooigcowk8wcw0.png?version=0"
                          style={{
                            borderRadius: "50%",
                            height: "40px",
                            width: "40px",
                            objectFit: "contain"
                          }}
                          alt=""
                        />
                      </Typography>
                    )}
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Typography>
        <Box sx={{ boxShadow: "0 -10px 18px -10px #0e0e0e2e", background: "#fff" }} p={2}>
          <Typography component="div" display={"flex"} alignItems={"center"}>
            <Typography component="span" mr={2}>
              <svg
                width="36"
                height="37"
                viewBox="0 0 36 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M18.24 7.37659C21.615 5.26159 26.205 5.95159 29.175 8.90659C32.76 12.4916 32.76 18.2816 29.175 21.8666L25.935 25.1066"
                  fill="#4D6BC6"
                ></path>
                <path
                  d="M26.7449 25.9015L25.1249 24.2815L28.3649 21.0415C31.4849 17.9215 31.4849 12.8365 28.3649 9.70152C25.7549 7.09152 21.7499 6.52152 18.8549 8.33652L17.6399 6.40152C21.4349 4.01652 26.6249 4.73652 29.9849 8.09652C34.0049 12.1165 34.0049 18.6565 29.9849 22.6765L26.7449 25.9165V25.9015Z"
                  fill="#222222"
                ></path>
                <path
                  d="M30.0601 19.1965L26.4601 15.5965L19.7701 8.90652C16.1851 5.32152 10.3951 5.32152 6.81009 8.90652C3.22509 12.4915 3.22509 18.2815 6.81009 21.8665L11.4301 26.4865L14.6701 29.7265C15.5701 30.6265 17.0101 30.6265 17.9101 29.7265C18.8101 28.8265 18.8101 27.3865 17.9101 26.4865L16.6201 25.1965L19.5301 28.1065C20.4301 29.0065 21.8701 29.0065 22.7701 28.1065C23.6701 27.2065 23.6701 25.7665 22.7701 24.8665L23.5801 25.6765C24.4801 26.5765 25.9201 26.5765 26.8201 25.6765C27.7201 24.7765 27.7201 23.3365 26.8201 22.4365L23.1751 18.7915L26.8201 22.4365C27.7201 23.3365 29.1601 23.3365 30.0601 22.4365C30.9601 21.5365 30.9601 20.0965 30.0601 19.1965Z"
                  fill="#D7E6F5"
                ></path>
                <path
                  d="M12.495 29.1414L6.015 22.6614C1.995 18.6414 1.995 12.1014 6.015 8.08141C10.035 4.06141 16.575 4.06141 20.595 8.08141L27.285 14.7714L25.665 16.3914L18.975 9.70141C15.855 6.58141 10.77 6.58141 7.635 9.70141C4.515 12.8214 4.515 17.9064 7.635 21.0414L14.115 27.5214L12.495 29.1414Z"
                  fill="#222222"
                ></path>
                <path
                  d="M16.2901 31.5266C15.4051 31.5266 14.5351 31.1966 13.8601 30.5216L10.6201 27.2816L12.2401 25.6616L15.4801 28.9016C15.9301 29.3516 16.6501 29.3516 17.1001 28.9016C17.5501 28.4516 17.5501 27.7316 17.1001 27.2816L13.8601 24.0416L15.4801 22.4216L18.7201 25.6616C20.0551 26.9966 20.0551 29.1866 18.7201 30.5216C18.0451 31.1966 17.1751 31.5266 16.2901 31.5266Z"
                  fill="#222222"
                ></path>
                <path
                  d="M21.1501 29.9064C20.2651 29.9064 19.3951 29.5764 18.7201 28.9014L13.8601 24.0414L15.4801 22.4214L20.3401 27.2814C20.7901 27.7314 21.5101 27.7314 21.9601 27.2814C22.4101 26.8314 22.4101 26.1114 21.9601 25.6614L17.1001 20.8014L18.7201 19.1814L23.5801 24.0414C24.9151 25.3764 24.9151 27.5664 23.5801 28.9014C22.9051 29.5764 22.0351 29.9064 21.1501 29.9064Z"
                  fill="#222222"
                ></path>
                <path
                  d="M25.2001 27.4915C24.2851 27.4915 23.4151 27.1315 22.7701 26.4865L17.1001 20.8165L18.7201 19.1965L24.3901 24.8665C24.8401 25.3165 25.5601 25.3165 26.0101 24.8665C26.4601 24.4165 26.4601 23.6965 26.0101 23.2465L20.3401 17.5765L21.9601 15.9565L27.6301 21.6265C28.9651 22.9615 28.9651 25.1515 27.6301 26.4865C26.9851 27.1315 26.1151 27.4915 25.2001 27.4915Z"
                  fill="#222222"
                ></path>
                <path
                  d="M28.4401 24.2516C27.5251 24.2516 26.6551 23.8916 26.0101 23.2466L20.3401 17.5766L21.9601 15.9566L27.6301 21.6266C28.0651 22.0616 28.8151 22.0616 29.2501 21.6266C29.4751 21.4166 29.5801 21.1166 29.5801 20.8166C29.5801 20.5166 29.4601 20.2166 29.2501 20.0066L23.5801 14.3366L25.2001 12.7166L30.8701 18.3866C31.5151 19.0316 31.8751 19.9016 31.8751 20.8166C31.8751 21.7316 31.5151 22.6016 30.8701 23.2466C30.2251 23.8916 29.3551 24.2516 28.4401 24.2516Z"
                  fill="#222222"
                ></path>
                <path
                  d="M24.2851 10.2415L17.2651 15.1615C15.9601 16.0765 14.1751 15.7615 13.2601 14.4565C12.3601 13.1665 12.6601 11.3815 13.9501 10.4665C15.4801 9.38647 17.4601 7.93147 18.0901 7.54147C21.4651 5.42647 26.2201 5.95147 29.1751 8.90647"
                  fill="#4D6BC6"
                ></path>
                <path
                  d="M14.6101 11.3815L16.0351 10.3615C16.7701 9.83645 17.5201 9.31145 18.0601 8.92145C18.3301 8.72645 18.5551 8.57645 18.7051 8.48645C19.2001 8.17145 19.7251 7.96145 20.2801 7.78145C23.0251 6.88145 26.2651 7.57145 28.3801 9.70145L30.0001 8.08145C26.8801 4.96145 21.8701 4.21145 18.0751 6.22145C17.8801 6.32645 17.6851 6.43145 17.4901 6.55145C17.1601 6.76145 16.5151 7.21145 15.7651 7.75145C15.4351 7.99145 15.0751 8.24645 14.7151 8.50145L13.2901 9.52145C11.4901 10.7965 11.0551 13.3015 12.3301 15.1015C12.9451 15.9865 13.8751 16.5715 14.9251 16.7515C15.1651 16.7965 15.3901 16.8115 15.6301 16.8115C16.4551 16.8115 17.2501 16.5565 17.9251 16.0765L22.3051 13.0165L24.2101 11.6815L22.5601 10.0315L20.6551 11.3665L16.6051 14.2015C16.2301 14.4715 15.7651 14.5615 15.3151 14.4865C14.8651 14.4115 14.4601 14.1565 14.2051 13.7815C13.6651 13.0015 13.8451 11.9215 14.6251 11.3815H14.6101Z"
                  fill="#222222"
                ></path>
              </svg>
            </Typography>
            <Typography fontSize={14} color={"#000"}>
              Have a question? Just message us — we’re here to help!
            </Typography>
          </Typography>
          <Box mt={2} sx={{ position: "relative" }}>
            {/* Image Preview */}
            {imagePreviews.length > 0 && (
              <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {imagePreviews.map((preview, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      width: "55px",
                      height: "55px",
                    }}
                  >
                    <img
                      src={preview}
                      alt={`preview-${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Button
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        fontSize: "11px",
                        color: "white",
                      }}
                    >
                      X
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
            <Typography component="div" sx={{ position: "relative" }}>
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your reply"
                minRows={4}
                maxRows={10}
                style={{
                  width: "100%",
                  border: "1px solid gray",
                  borderRadius: "4px",
                  padding: "8px",
                  fontSize: "16px",
                  fontFamily: "inherit",
                  outline: "none",
                  resize: "vertical",
                }}
              />
              <input
                type="file"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
              />
              <Tooltip title="Upload image" arrow placement="left">
                <Button
                  onClick={() => fileInputRef.current.click()}
                  sx={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "40px",
                    width: "40px",
                    borderRadius: "50%",
                    background: "#ffff",
                    transition: "all 500ms",
                    "&:hover": { boxShadow: "0 0 3px #000" }
                  }}
                >
                  <label htmlFor="upload-file">
                    <WallpaperIcon />
                  </label>
                </Button>
              </Tooltip>
            </Typography>
          </Box>
          <Typography component="div" textAlign={"end"} mt={2}>
            <Button
              onClick={sendMessage}
              sx={{
                padding: "6px 18px",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "30px",
                "&:hover": { background: "#222222" }
              }}
            >
              Send
            </Button>
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default ComposeChatAdmin;
