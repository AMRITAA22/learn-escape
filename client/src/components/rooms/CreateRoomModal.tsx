// client/src/components/rooms/CreateRoomModal.tsx
import React, { useState } from 'react';
import roomService from '../../services/roomService';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoomCreated: () => void;
}

export const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) => {
    const [roomName, setRoomName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName.trim()) return;
        try {
            await roomService.createRoom({ name: roomName, isPublic: true });
            onRoomCreated();
            onClose();
        } catch (error) {
            console.error("Failed to create room:", error);
            alert("Could not create the room. Please try again.");
        }
    };

    // This line is crucial for the modal to appear/disappear
    if (!isOpen) return null;

    return (
        // Check these CSS classes for visibility
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Create a New Study Room</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">Room Name</label>
                    <input
                        type="text"
                        id="roomName"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="e.g., Final Exam Prep"
                        required
                    />
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            Create Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};