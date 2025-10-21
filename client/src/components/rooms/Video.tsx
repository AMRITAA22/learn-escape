import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { VideoOff } from 'lucide-react';

interface VideoProps {
    stream: MediaStream;
    isMuted?: boolean;
    userName?: string;
}

const Video = forwardRef<HTMLVideoElement, VideoProps>(
    ({ stream, isMuted = false, userName }, ref) => {
        const internalRef = useRef<HTMLVideoElement>(null);
        const [isVideoActive, setIsVideoActive] = useState(true);

        useEffect(() => {
            const videoElement = (ref as React.RefObject<HTMLVideoElement>)?.current || internalRef.current;
            if (videoElement && stream) {
                videoElement.srcObject = stream;
            }
        }, [stream, ref]);

        // Monitor video track status
        useEffect(() => {
            if (stream) {
                const videoTrack = stream.getVideoTracks()[0];
                
                if (videoTrack) {
                    // Set initial state
                    setIsVideoActive(videoTrack.enabled);

                    // Listen for track enable/disable changes
                    const handleTrackChange = () => {
                        setIsVideoActive(videoTrack.enabled);
                    };

                    // Note: Some browsers support 'mute'/'unmute' events
                    videoTrack.addEventListener('ended', handleTrackChange);
                    
                    // Poll for changes (fallback for browsers that don't fire events)
                    const interval = setInterval(() => {
                        setIsVideoActive(videoTrack.enabled);
                    }, 500);

                    return () => {
                        videoTrack.removeEventListener('ended', handleTrackChange);
                        clearInterval(interval);
                    };
                }
            }
        }, [stream]);

        return (
            <div className="relative w-full h-auto bg-black rounded-md overflow-hidden">
                <video
                    ref={ref || internalRef}
                    autoPlay
                    playsInline
                    muted={isMuted}
                    className={`w-full h-auto rounded-md ${isVideoActive ? 'block' : 'hidden'}`}
                />
                
                {/* Black screen with "Camera Off" indicator when video is off */}
                {!isVideoActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                        <div className="flex items-center text-gray-400">
                            <VideoOff size={32} className="mr-3" />
                            <span className="text-lg">Camera Off</span>
                        </div>
                        {userName && (
                            <p className="text-gray-500 text-sm mt-2">{userName}</p>
                        )}
                    </div>
                )}

                {/* Optional: Muted indicator */}
                {isMuted && isVideoActive && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        Muted
                    </div>
                )}
            </div>
        );
    }
);

export default Video;