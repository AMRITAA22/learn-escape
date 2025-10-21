import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Peer, { MediaConnection } from 'peerjs';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import { Users, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';
import Video from '../components/rooms/Video';

// --- TYPE DEFINITIONS ---
interface Message { user: { name: string }; message: string; }
interface User { id: string; name: string; socketId?: string; }
interface VideoStream { peerId: string; stream: MediaStream; }

// --- MAIN ROOM PAGE COMPONENT ---
export const RoomPage = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();

    const [myPeerId, setMyPeerId] = useState('');
    const [localStream, setLocalStream] = useState<MediaStream>();
    const [videoStreams, setVideoStreams] = useState<VideoStream[]>([]);
    const [usersInRoom, setUsersInRoom] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    
    // New states for audio/video controls
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    
    const callsRef = useRef<Map<string, MediaConnection>>(new Map());
    const peerInstanceRef = useRef<Peer | null>(null);

    useEffect(() => {
        if (!user || !roomId) return;

        const peer = new Peer();
        peerInstanceRef.current = peer;
        let localStreamRef: MediaStream;

        const addVideoStream = (peerId: string, stream: MediaStream) => {
            setVideoStreams(prev => {
                if (prev.some(video => video.stream.id === stream.id)) return prev;
                return [...prev, { peerId, stream }];
            });
        };

        const removeVideoStream = (peerId: string) => {
            setVideoStreams(prev => prev.filter(video => video.peerId !== peerId));
        };

        // Set up listeners synchronously
        socketService.connect();

        socketService.on('user-joined', (data: { peerId: string; user: any }) => {
            if (localStreamRef) {
                const call = peer.call(data.peerId, localStreamRef);
                call.on('stream', (userVideoStream) => {
                    addVideoStream(data.peerId, userVideoStream);
                });
                callsRef.current.set(data.peerId, call);
            }
        });
        
        socketService.on('update-user-list', (users: User[]) => setUsersInRoom(users));
        socketService.on('receive-message', (data: Message) => setMessages(prev => [...prev, data]));

        socketService.on('user-left', (data: { peerId: string }) => {
            callsRef.current.get(data.peerId)?.close();
            callsRef.current.delete(data.peerId);
            removeVideoStream(data.peerId);
        });

        // Get media, then set up the peer and join the room
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setLocalStream(stream);
                localStreamRef = stream;

                peer.on('open', (id) => {
                    setMyPeerId(id);
                    socketService.emit('join-room', { roomId, peerId: id, user });
                });

                peer.on('call', (call) => {
                    call.answer(stream);
                    call.on('stream', (userVideoStream) => {
                        addVideoStream(call.peer, userVideoStream);
                    });
                    callsRef.current.set(call.peer, call);
                });
            })
            .catch(err => console.error("getUserMedia error:", err));

        // Cleanup function
        return () => {
            localStreamRef?.getTracks().forEach(track => track.stop());
            peerInstanceRef.current?.destroy();
            socketService.disconnect();
        };
    }, [roomId, user]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentMessage.trim() && user) {
            const messageData = { roomId, message: currentMessage, user: { name: user.name } };
            socketService.emit('send-message', messageData);
            setMessages(prev => [...prev, messageData]);
            setCurrentMessage('');
        }
    };

    // Toggle audio mute/unmute
    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    // Toggle video on/off
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <div className="flex h-screen p-4 space-x-4">
            <div className="flex-1 flex flex-col">
                <h1 className="text-3xl font-bold mb-4">Study Room: {roomId}</h1>
                
                {/* Video Grid */}
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-100 rounded-md overflow-y-auto">
                    {localStream && (
                        <div className="relative">
                            <Video 
                                stream={localStream} 
                                isMuted={true} 
                                userName={user?.name || 'You'}
                            />
                            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                You
                            </div>
                        </div>
                    )}
                    {videoStreams.map(({ stream, peerId }) => {
                        const remoteUser = usersInRoom.find(u => u.id === peerId);
                        return (
                            <div key={peerId} className="relative">
                                <Video 
                                    stream={stream} 
                                    userName={remoteUser?.name || 'Anonymous'}
                                />
                                {remoteUser && (
                                    <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded text-xs font-semibold">
                                        {remoteUser.name}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Video Controls */}
                <div className="flex justify-center gap-4 mt-4 p-4 bg-white rounded-lg shadow-md">
                    <button
                        onClick={toggleMute}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                            isMuted 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                    
                    <button
                        onClick={toggleVideo}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                            isVideoOff 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                        title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
                    >
                        {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
                        <span>{isVideoOff ? 'Camera Off' : 'Camera On'}</span>
                    </button>
                </div>
            </div>

            {/* Sidebar with Participants and Chat */}
            <div className="w-80 flex flex-col space-y-4">
                {/* Participants List */}
                <div className="p-4 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-bold flex items-center mb-4">
                        <Users className="mr-2"/> Participants ({usersInRoom.length})
                    </h2>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                        {usersInRoom.map((u) => (
                            <li key={u.id} className="p-2 bg-gray-100 rounded flex items-center justify-between">
                                <span className="font-medium">{u.name}</span>
                                {u.id === myPeerId && (
                                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">You</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Live Chat */}
                <div className="flex-1 flex flex-col p-4 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Live Chat</h2>
                    <div className="flex-grow p-2 border rounded bg-gray-50 mb-4 overflow-y-auto">
                        {messages.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center mt-4">No messages yet. Start the conversation!</p>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className="mb-3 p-2 bg-white rounded shadow-sm">
                                    <span className="font-bold text-indigo-600">{msg.user.name}: </span>
                                    <span className="text-gray-800">{msg.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <form onSubmit={sendMessage} className="flex">
                        <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors font-semibold"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};