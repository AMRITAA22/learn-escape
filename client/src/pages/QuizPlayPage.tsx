import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';
import { Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

// Define types for our data
interface Question {
    _id: string;
    questionText: string;
    options: string[];
}
interface Quiz {
    _id: string;
    title: string;
    questions: Question[];
}
interface Answer {
    questionId: string;
    userAnswer: string;
}

export const QuizPlayPage = () => {
    const { id } = useParams<{ id: string }>(); // This 'id' is the quizId
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Fetch the quiz on load
    useEffect(() => {
        if (!id) return;
        const fetchQuiz = async () => {
            try {
                setIsLoading(true);
                const quizData = await quizService.getQuiz(id);
                setQuiz(quizData);
            } catch (err) {
                console.error("Failed to fetch quiz:", err);
                setError('Failed to load quiz. You may not have permission to view it.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    // Handle selecting an answer
    const handleSelectAnswer = (option: string) => {
        setSelectedOption(option);
    };

    // Handle moving to the next question or finishing
    const handleNextQuestion = async () => {
        if (!quiz || !selectedOption) return;

        // Save the current answer
        const currentQuestion = quiz.questions[currentQuestionIndex];
        const newAnswers = [...userAnswers, {
            questionId: currentQuestion._id,
            userAnswer: selectedOption
        }];
        setUserAnswers(newAnswers);
        
        // Check if this is the last question
        if (currentQuestionIndex === quiz.questions.length - 1) {
            // End of quiz - submit answers
            await handleSubmitQuiz(newAnswers);
        } else {
            // Move to the next question
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null); // Reset selection
        }
    };

    // Submit the quiz to the backend
    const handleSubmitQuiz = async (finalAnswers: Answer[]) => {
        if (!id) return;
        setIsLoading(true); // Show loader during submission
        try {
            const result = await quizService.submitQuiz(id, finalAnswers);
            
            // --- THIS IS THE FIX ---
            // Navigate to the result page using the QUIZ ID (from useParams, which is 'id')
            // and pass the new result data in the state.
            navigate(`/quiz/result/${id}`, { state: { userResult: result } });
            // --- END OF FIX ---

        } catch (err: any) {
            console.error("Failed to submit quiz:", err);
            setError(err.response?.data?.message || 'Failed to submit quiz. You may have already taken it.');
        }
    };

    if (isLoading && !quiz) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    if (!quiz) {
        return <div className="p-8 text-center">Quiz not found.</div>;
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
                {/* ... (rest of the JSX is identical to before) ... */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h1>
                    <p className="text-sm text-gray-500">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div 
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                        {currentQuestion.questionText}
                    </h2>
                </div>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelectAnswer(option)}
                            className={`w-full text-left p-4 border-2 rounded-lg transition-all
                                ${selectedOption === option 
                                    ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                                    : 'border-gray-200 hover:border-gray-400'
                                }
                            `}
                        >
                            <span className="font-medium text-gray-800">{option}</span>
                        </button>
                    ))}
                </div>
                <div className="mt-8 text-right">
                    <button
                        onClick={handleNextQuestion}
                        disabled={!selectedOption || isLoading}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold
                                   hover:bg-indigo-700 transition-colors
                                   disabled:bg-gray-400 disabled:cursor-not-allowed
                                   flex items-center gap-2 ml-auto"
                    >
                        {isLoading 
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : (currentQuestionIndex === quiz.questions.length - 1 
                                ? 'Finish Quiz' 
                                : 'Next')
                        }
                        {!isLoading && currentQuestionIndex < quiz.questions.length - 1 && <ArrowRight size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizPlayPage;