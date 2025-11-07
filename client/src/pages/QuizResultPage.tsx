import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';
import { Loader2, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Leaderboard entry type
interface Result {
    _id: string;
    score: number;
    userId: { _id: string; name: string };
    createdAt: string;
}

// User's personal result type (passed from previous page)
interface UserResult {
    _id: string;
    score: number;
    quizId: string;
    answers: Array<{
        questionText: string;
        userAnswer: string;
        correctAnswer: string;
    }>;
}

export const QuizResultPage = () => {
    const { id: quizId } = useParams<{ id: string }>(); // This 'id' is now the QUIZ ID
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [leaderboard, setLeaderboard] = useState<Result[]>([]);
    // Get the user's result from the navigation state, if it exists
    const [userResult, setUserResult] = useState<UserResult | null>(location.state?.userResult);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!quizId) {
            setError('No Quiz ID found.');
            setIsLoading(false);
            return;
        }

        const fetchLeaderboard = async () => {
            try {
                setIsLoading(true);
                // 1. Fetch the leaderboard FIRST. This is our priority.
                const leaderboardData = await quizService.getLeaderboard(quizId);
                setLeaderboard(leaderboardData);

                // 2. If we didn't get the user's result from the previous page
                // (e.g., they bookmarked this page), we need to find it
                // in the leaderboard.
                if (!userResult) {
                    const myResultFromBoard = leaderboardData.find((r: Result) => r.userId._id === user?.id);
                    if (myResultFromBoard) {
                        // This is a partial result (no answers), but it's enough to show the score
                        setUserResult({ 
                            ...myResultFromBoard, 
                            quizId: quizId, 
                            answers: [] // Can't show answer review in this case
                        });
                    }
                }
            } catch (err: any) {
                console.error("Failed to load leaderboard:", err);
                setError(err.response?.data?.message || 'Failed to load results.');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchLeaderboard();
    }, [quizId, user, userResult]); // Re-run if these change


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
        // This can happen if the user just visits the URL without taking the quiz
        // We'll just show the leaderboard
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">Leaderboard</h1>
                <LeaderboardDisplay leaderboard={leaderboard} currentUserId={user?.id} />
                <Link to="/study-groups" className="text-indigo-600 font-semibold mt-4">
                    Back to Study Groups
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Score Header */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8 text-center">
                    <h1 className="text-xl font-semibold text-gray-600">
                        Quiz Complete!
                    </h1>
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
                    <LeaderboardDisplay leaderboard={leaderboard} currentUserId={user?.id} />

                    {/* Answer Review (only show if we have the answers) */}
                    {userResult.answers.length > 0 && (
                        <div className="bg-white rounded-lg shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Answers</h2>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
                    )}
                </div>
            </div>
        </div>
    );
};

// A new component to display the leaderboard
const LeaderboardDisplay = ({ leaderboard, currentUserId }: { leaderboard: Result[], currentUserId?: string }) => {
    return (
        <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                Leaderboard
            </h2>
            <ol className="space-y-3">
                {leaderboard.length === 0 ? (
                    <p className="text-gray-500 text-sm">No results yet. Be the first!</p>
                ) : (
                    leaderboard.map((result, index) => {
                        const isCurrentUser = result.userId._id === currentUserId;
                        return (
                        <li 
                            key={result._id}
                            className={`p-3 rounded-lg flex items-center
                                ${index === 0 ? 'bg-yellow-50 border border-yellow-200' : ''}
                                ${isCurrentUser ? 'bg-indigo-50 border-2 border-indigo-300' : 'bg-white'}
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
                    )})
                )}
            </ol>
        </div>
    );
};