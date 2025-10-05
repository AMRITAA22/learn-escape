import React, { forwardRef, useEffect, useRef } from 'react';

interface VideoProps {
    stream: MediaStream;
    isMuted?: boolean;
}

const Video = forwardRef<HTMLVideoElement, VideoProps>(({ stream, isMuted = false }, ref) => {
    const internalRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const videoElement = (ref as React.RefObject<HTMLVideoElement>)?.current || internalRef.current;
        if (videoElement && stream) {
            videoElement.srcObject = stream;
        }
    }, [stream, ref]);

    return (
        <video
            ref={ref || internalRef}
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-auto rounded-md bg-black"
        />
    );
});

export default Video;