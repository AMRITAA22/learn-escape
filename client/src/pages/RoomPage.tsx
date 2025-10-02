import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import Peer, { SignalData } from 'simple-peer';
import Video from '../components/rooms/Video';
import { Users } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Message { user: { name: string }; message: string; }
interface User { id: string; name: string; }
interface PeerRef { peerID: string; peer: Peer.Instance; }

// --- HELPER COMPONENT ---
const PeerVideo = ({ peer }: { peer: Peer.Instance }) => {
    const ref = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        peer.on("stream", (stream: MediaStream) => {
            if (ref.current) ref.current.srcObject = stream;
        });
        peer.on("error", (err) => console.error("Peer error:", err));
    }, [peer]);
    return <Video ref={ref} stream={new MediaStream()} />;
};

// --- MAIN ROOM PAGE COMPONENT ---
export const RoomPage = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [usersInRoom, setUsersInRoom] = useState<User[]>([]);
    const [localStream, setLocalStream] = useState<MediaStream>();
    const [peers, setPeers] = useState<PeerRef[]>([]);
    const peersRef = useRef<PeerRef[]>([]);

    const createPeer = useCallback((userToSignal: string, callerID: string, stream: MediaStream): Peer.Instance => {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peer.on("signal", signal => {
            socketService.emit("sending-signal", { userToSignal, callerID, signal });
        });
        return peer;
    }, []);

    const addPeer = useCallback((incomingSignal: SignalData, callerID: string, stream: MediaStream): Peer.Instance => {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on("signal", signal => {
            socketService.emit("returning-signal", { signal, callerID });
        });
        peer.signal(incomingSignal);
        return peer;
    }, []);

    // Effect for getting user media
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => setLocalStream(stream))
            .catch(err => console.error("getUserMedia error:", err));
    }, []);

    // Effect for handling all socket and peer logic
    useEffect(() => {
        if (!user || !roomId || !localStream) return;

        socketService.connect();
        socketService.emit('join-room', { roomId, user: { name: user.name } });

        const allUsersHandler = (users: User[]) => {
            const socketId = socketService.socket?.id;
            if (!socketId) return;
            const peersToCreate: PeerRef[] = [];
            users.forEach(u => {
                const peer = createPeer(u.id, socketId, localStream);
                peersRef.current.push({ peerID: u.id, peer });
                peersToCreate.push({ peerID: u.id, peer });
            });
            setPeers(peersToCreate);
        };
        
        const userJoinedHandler = (newUser: User) => {
            const socketId = socketService.socket?.id;
            if (!socketId) return;
            const peer = createPeer(newUser.id, socketId, localStream);
            peersRef.current.push({ peerID: newUser.id, peer });
            setPeers(prev => [...prev, { peerID: newUser.id, peer }]);
        };
        
        const offerSignalHandler = (payload: { signal: SignalData; callerID: string; }) => {
            const peer = addPeer(payload.signal, payload.callerID, localStream);
            peersRef.current.push({ peerID: payload.callerID, peer });
            setPeers(prev => [...prev, { peerID: payload.callerID, peer }]);
        };

        const answerSignalHandler = (payload: { signal: SignalData; id: string }) => {
            const item = peersRef.current.find(p => p.peerID === payload.id);
            item?.peer.signal(payload.signal);
        };

        const userLeftHandler = (payload: { id: string }) => {
            const item = peersRef.current.find(p => p.peerID === payload.id);
            if (item) item.peer.destroy();
            const newPeers = peersRef.current.filter(p => p.peerID !== payload.id);
            peersRef.current = newPeers;
            setPeers(newPeers);
        };

        const updateUserListHandler = (users: User[]) => setUsersInRoom(users);
        const receiveMessageHandler = (data: Message) => setMessages(prev => [...prev, data]);
        
        socketService.on("all-users", allUsersHandler);
        socketService.on("user-joined", userJoinedHandler);
        socketService.on("offer-signal", offerSignalHandler);
        socketService.on('answer-signal', answerSignalHandler);
        socketService.on("user-left", userLeftHandler);
        socketService.on('update-user-list', updateUserListHandler);
        socketService.on('receive-message', receiveMessageHandler);

        return () => {
            peersRef.current.forEach(p => p.peer.destroy());
            peersRef.current = [];
            setPeers([]);
            
            socketService.off("all-users");
            socketService.off("user-joined");
            socketService.off("offer-signal");
            socketService.off('answer-signal');
            socketService.off("user-left");
            socketService.off('update-user-list');
            socketService.off('receive-message');
            socketService.disconnect();
        };
    }, [user, roomId, localStream, createPeer, addPeer]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentMessage.trim() && user) {
            const messageData = { roomId, message: currentMessage, user: { name: user.name } };
            socketService.emit('send-message', messageData);
            setMessages(prev => [...prev, messageData]);
            setCurrentMessage('');
        }
    };
    
    return (
        <div className="flex h-[calc(100vh-100px)]">
            {/* Video Grid */}
            <div className="flex-1 flex flex-col">
                <h1 className="text-3xl font-bold mb-4">Study Room: {roomId}</h1>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-200 rounded-md">
                    {localStream && <Video stream={localStream} isMuted={true} />}
                    {peers.map(({ peer, peerID }) => <PeerVideo key={peerID} peer={peer} />)}
                </div>
            </div>
            {/* Right Sidebar */}
            <div className="w-80 border-l ml-4 pl-4 flex flex-col">
                <h2 className="text-xl font-bold flex items-center mb-4"><Users className="mr-2"/> Participants ({usersInRoom.length})</h2>
                <ul className="space-y-2 border-b pb-4">
                    {usersInRoom.map((u) => (
                        <li key={u.id} className="p-2 bg-gray-100 rounded">
                            {u.name} {u.id === socketService.socket?.id ? '(You)' : ''}
                        </li>
                    ))}
                </ul>
                <div className="flex-1 flex flex-col mt-4">
                    <h2 className="text-xl font-bold mb-4">Live Chat</h2>
                    <div className="flex-grow p-4 border rounded bg-gray-50 mb-4 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className="mb-2">
                                <span className="font-bold">{msg.user.name}: </span>
                                <span>{msg.message}</span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={sendMessage} className="flex">
                        <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
                        />
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700">
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};