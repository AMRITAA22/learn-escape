import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';
import { Loader2, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Define types
interface Result {
    _id: string;
    score: number;
    userId: { _id: string; name: string };
    createdAt: string;
}

interface UserResult {
    _id: string;
    score: number;
    quizId: string; // The result object contains the quizId
    answers: Array<{
        questionText: string;
        userAnswer: string;
        correctAnswer: string;
    }>;
}

export const QuizResultPage = () => {
    const { id: resultId } = useParams<{ id: string }>();
    const { user } = useAuth(); // Get current user
    const navigate = useNavigate();

    const [leaderboard, setLeaderboard] = useState<Result[]>([]);
    const [userResult, setUserResult] = useState<UserResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!resultId) return;

        // This is the correct logic from your screenshot
        const fetchResults = async () => {
            try {
                setIsLoading(true);
                // 1. Fetch the user's specific result by its ID
                const userResultData = await quizService.getQuizResult(resultId);
                setUserResult(userResultData);
                
                // 2. Use the 'quizId' from the result to fetch the leaderboard
                const leaderboardData = await quizService.getLeaderboard(userResultData.quizId);
                setLeaderboard(leaderboardData);
                
            } catch (err: any) {
                console.error("Failed to load results:", err);
                setError(err.response?.data?.message || 'Failed to load results.');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchResults();
    }, [resultId]);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <Link to="/study-groups" className="text-indigo-600 font-semibold mt-4">
                    Back to Study Groups
                </Link>
            </div>
        );
    }

    if (!userResult) {
        return <div className="p-8 text-center">Could not load quiz result.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Score Header */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8 text-center">
                    <h1 className="text-xl font-semibold text-gray-600">Quiz Complete!</h1>
                    <p className="text-7xl font-bold text-indigo-600 my-4">{userResult.score}%</p>
                    <Link 
                        to="/study-groups" // Go back to groups page
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold
                                   hover:bg-indigo-700 transition-colors"
                    >
                        Back to Study Groups
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Leaderboard */}
                    <div className="bg-white rounded-lg shadow-xl p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-500" />
                            Leaderboard
                        </h2>
                        <ol className="space-y-3">
                            {leaderboard.map((result, index) => {
                                const isCurrentUser = result.userId._id === user?.id;
                                return (
                                <li 
                                    key={result._id}
                                    className={`p-3 rounded-lg flex items-center
                                        ${index === 0 ? 'bg-yellow-50 border border-yellow-200' : ''}
                                        ${isCurrentUser ? 'bg-indigo-50 border-2 border-indigo-300' : ''}
                                    `}
                                >
                                    <span className={`text-lg font-bold w-8 ${
                                        index === 0 ? 'text-yellow-600' : 'text-gray-700'
                                    }`}>
                                        {index + 1}
                                    </span>
                                    <span className="flex-1 font-semibold text-gray-800">
                                        {result.userId.name} {isCurrentUser && '(You)'}
                                    </span>
                                    <span className="text-lg font-bold text-indigo-600">
                                        {result.score}%
                                    </span>
                                </li>
                            )})}
                        </ol>
                    </div>

                    {/* Answer Review */}
                    <div className="bg-white rounded-lg shadow-xl p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Answers</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {userResult.answers.map((ans, index) => {
                                const isCorrect = ans.userAnswer === ans.correctAnswer;
                                return (
                                    <div key={index} className="border-b pb-4">
                                        <p className="font-semibold text-gray-800">{ans.questionText}</p>
                                        <div className={`mt-2 flex items-center gap-2 text-sm ${
                                            isCorrect ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {isCorrect 
                                                ? <CheckCircle size={16} /> 
                                                : <XCircle size={16} />
                                            }
                                            <span>Your answer: {ans.userAnswer}</span>
                                        </div>
                                        {!isCorrect && (
                                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                <span className="ml-7">Correct answer: {ans.correctAnswer}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};