import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RoomList = ({ rooms, onDelete }: { rooms: any[], onDelete: (roomId: string) => void }) => {
    const { user } = useAuth();

    if (rooms.length === 0) {
        return <p className="text-gray-500 mt-6">No public study rooms available. Why not create one?</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {rooms.map((room) => (
                <div key={room._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col">
                    <div className="flex items-center mb-3">
                        <MessageSquare className="w-6 h-6 mr-3 text-indigo-500" />
                        <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Created by: <span className="font-semibold">{room.createdBy?.name || 'Unknown'}</span>
                    </p>
                    <div className="flex items-center text-gray-500 mb-6">
                        <Users className="w-5 h-5 mr-2" />
                        <span>{room.members?.length || 0} member(s)</span>
                    </div>
                    
                    <div className="mt-auto pt-4 flex items-center space-x-2">
                        <Link 
                            to={`/room/${room._id}`}
                            className="flex-grow bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-center"
                        >
                            Join Room
                        </Link>
                        
                        {/* Show delete button only if the logged-in user's ID matches the room's creator ID */}
                        {user && user._id === room.createdBy?._id && (
                            <button
                                onClick={() => onDelete(room._id)}
                                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                title="Delete Room"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};