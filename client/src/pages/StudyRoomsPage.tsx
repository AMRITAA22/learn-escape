// client/src/pages/StudyRoomsPage.tsx
import React, { useEffect, useState } from 'react';
import { RoomList } from '../components/rooms/RoomList';
import { CreateRoomModal } from '../components/rooms/CreateRoomModal';
import roomService from '../services/roomService';

export const StudyRoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // Make sure this line exists

    const fetchRooms = async () => {
        try {
            setIsLoading(true);
            const publicRooms = await roomService.getPublicRooms();
            setRooms(publicRooms);
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Public Study Rooms</h1>
                <button 
                    onClick={() => setIsModalOpen(true)} // Check this onClick handler
                    className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
                >
                    + Create Room
                </button>
            </div>

            {isLoading ? <p>Loading rooms...</p> : <RoomList rooms={rooms} />}

            {/* Make sure you are passing the correct props here */}
            <CreateRoomModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRoomCreated={fetchRooms}
            />
        </div>
    );
};