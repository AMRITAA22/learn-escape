import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { MessageSquare, Users } from 'lucide-react';

export const RoomList = ({ rooms }: { rooms: any[] }) => {
    if (rooms.length === 0) {
        return <p className="text-gray-500 mt-4">No public study rooms available. Why not create one?</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {rooms.map((room) => (
                <div key={room._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
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
                    <Link 
                        to={`/room/${room._id}`}
                        className="w-full block text-center bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Join Room
                    </Link>
                </div>
            ))}
        </div>
    );
};