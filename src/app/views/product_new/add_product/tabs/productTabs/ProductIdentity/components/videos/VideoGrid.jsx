// ProductIdentity/components/videos/VideoGrid.jsx
import React from "react";
import { Grid, Box, IconButton, Typography } from "@mui/material";
import { DeleteOutline, PlayArrow } from "@mui/icons-material";

const VideoGrid = ({ videos, setVideos }) => {
    const handleDeleteVideo = (videoId) => {
        const updatedVideos = videos.filter(video => video._id !== videoId);

        // Update sort orders
        updatedVideos.forEach((video, idx) => {
            if (video.file) {
                video.file.sortOrder = idx + 1;
            } else {
                video.sortOrder = idx + 1;
            }
        });

        setVideos(updatedVideos);
    };

    const handlePlayVideo = (videoSrc) => {
        // Open video in new tab or implement video player modal
        window.open(videoSrc, '_blank');
    };

    return (
        <Box sx={{ width: 400 }}>
            <Grid container spacing={1}>
                {videos.map((video, index) => (
                    <Grid item xs={6} key={video._id || index}>
                        <Box
                            sx={{
                                position: 'relative',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                aspectRatio: '16/9',
                                background: '#f5f5f5',
                                cursor: 'pointer'
                            }}
                        >
                            {/* Video Thumbnail/Player */}
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#000'
                                }}
                                onClick={() => handlePlayVideo(video.src)}
                            >
                                <video
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                >
                                    <source src={video.src} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>

                                {/* Play Button Overlay */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        background: 'rgba(0,0,0,0.7)',
                                        borderRadius: '50%',
                                        width: 40,
                                        height: 40,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}
                                >
                                    <PlayArrow />
                                </Box>
                            </Box>

                            {/* Delete Button */}
                            <IconButton
                                size="small"
                                onClick={() => handleDeleteVideo(video._id)}
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    background: 'rgba(255,255,255,0.9)',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,1)',
                                    }
                                }}
                            >
                                <DeleteOutline fontSize="small" />
                            </IconButton>

                            {/* Video Info */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    fontSize: '10px'
                                }}
                            >
                                Video {index + 1}
                                {video.file && (
                                    <div>{(video.file.size / (1024 * 1024)).toFixed(2)} MB</div>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                ))}
                {videos.length === 0 && (
                    <Grid item xs={12}>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            textAlign="center"
                            sx={{ py: 2 }}
                        >
                            No videos uploaded yet
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default VideoGrid;
