import React, { useEffect, useState } from 'react';
import { RoomList } from '../components/rooms/RoomList';
import { CreateRoomModal } from '../components/rooms/CreateRoomModal';
import roomService from '../services/roomService';

export const StudyRoomsPage = () => {
    const [rooms, setRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleDeleteRoom = async (roomId: string) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await roomService.deleteRoom(roomId);
                setRooms(prevRooms => prevRooms.filter(room => room._id !== roomId));
            } catch (error) {
                console.error("Failed to delete room:", error);
                alert("You are not authorized to delete this room.");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Public Study Rooms</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
                >
                    + Create Room
                </button>
            </div>

            {isLoading 
                ? <p className="mt-6">Loading rooms...</p> 
                : <RoomList rooms={rooms} onDelete={handleDeleteRoom} />
            }

            <CreateRoomModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRoomCreated={fetchRooms}
            />
        </div>
    );
};