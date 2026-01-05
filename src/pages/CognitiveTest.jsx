import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, ArrowRight, Home, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CognitiveTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 1,
      category: "Memory",
      question: "Remember this sequence of numbers: 7, 3, 9, 2. Which number comes third?",
      options: ["7", "3", "9", "2"],
      correct: "9",
    },
    {
      id: 2,
      category: "Recognition",
      question: "Which of these is NOT a fruit?",
      options: ["Apple", "Carrot", "Banana", "Orange"],
      correct: "Carrot",
    },
    {
      id: 3,
      category: "Logic",
      question: "If all cats are animals, and some animals are pets, can we conclude that all cats are pets?",
      options: ["Yes", "No", "Cannot be determined"],
      correct: "No",
    },
    {
      id: 4,
      category: "Temporal Awareness",
      question: "What day comes after Monday?",
      options: ["Sunday", "Tuesday", "Wednesday", "Friday"],
      correct: "Tuesday",
    },
    {
      id: 5,
      category: "Calculation",
      question: "What is 15 + 28?",
      options: ["42", "43", "44", "45"],
      correct: "43",
    },
    {
      id: 6,
      category: "Pattern Recognition",
      question: "Complete the sequence: 2, 4, 8, 16, ?",
      options: ["20", "24", "32", "64"],
      correct: "32",
    },
    {
      id: 7,
      category: "Language",
      question: "Which word is the opposite of 'hot'?",
      options: ["Warm", "Cold", "Cool", "Freezing"],
      correct: "Cold",
    },
    {
      id: 8,
      category: "Spatial Awareness",
      question: "If you are facing North and turn left, which direction are you facing?",
      options: ["East", "West", "South", "North"],
      correct: "West",
    },
    {
      id: 9,
      category: "Memory Recall",
      question: "Earlier in this test, you saw a sequence of numbers. What was the first number?",
      options: ["2", "3", "7", "9"],
      correct: "7",
    },
    {
      id: 10,
      category: "Abstract Reasoning",
      question: "Which item does NOT belong in this group: Dog, Cat, Car, Horse",
      options: ["Dog", "Cat", "Car", "Horse"],
      correct: "Car",
    },
    {
      id: 11,
      category: "Time Perception",
      question: "How many months have 31 days?",
      options: ["5", "6", "7", "8"],
      correct: "7",
    },
    {
      id: 12,
      category: "Problem Solving",
      question: "A book costs $10. You pay with a $20 bill. How much change do you receive?",
      options: ["$5", "$8", "$10", "$12"],
      correct: "$10",
    },
  ];

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let score = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        score++;
      }
    });

    // Navigate to results
    navigate("/results", {
      state: {
        score: score,
        total: questions.length,
        testType: "cognitive",
      },
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== undefined;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="w-full bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Home</span>
            </motion.button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Cognitive Assessment</h1>
          </div>
          <div className="text-sm sm:text-base font-semibold text-indigo-600">
            {currentQuestion + 1} / {questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-2xl"
        >
          {/* Question Header */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-purple-100 rounded-full">
              <Brain className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          {/* Category Badge */}
          <div className="mb-4 flex justify-center">
            <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              {currentQ.category}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-8 text-center leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="grid gap-4 mb-8">
            {currentQ.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(option)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 px-6 rounded-xl font-medium shadow transition-all text-left ${answers[currentQuestion] === option
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-200"
                    : "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border-2 border-gray-200"
                  }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${answers[currentQuestion] === option
                      ? "border-white bg-white"
                      : "border-gray-400"
                    }`}>
                    {answers[currentQuestion] === option && (
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                    )}
                  </span>
                  {option}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              whileHover={currentQuestion > 0 ? { scale: 1.02 } : {}}
              whileTap={currentQuestion > 0 ? { scale: 0.98 } : {}}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold shadow transition-all flex items-center justify-center gap-2 ${currentQuestion === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </motion.button>

            {currentQuestion === questions.length - 1 ? (
              <motion.button
                onClick={handleSubmit}
                disabled={!allAnswered}
                whileHover={allAnswered ? { scale: 1.02 } : {}}
                whileTap={allAnswered ? { scale: 0.98 } : {}}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold shadow transition-all flex items-center justify-center gap-2 ${allAnswered
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <CheckCircle className="w-5 h-5" />
                Submit Test
              </motion.button>
            ) : (
              <motion.button
                onClick={goToNext}
                disabled={!isAnswered}
                whileHover={isAnswered ? { scale: 1.02 } : {}}
                whileTap={isAnswered ? { scale: 0.98 } : {}}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold shadow transition-all flex items-center justify-center gap-2 ${isAnswered
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Answer Status */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Answered: <span className="font-bold text-indigo-600">{Object.keys(answers).length}</span> / {questions.length}
            </p>
            {!allAnswered && currentQuestion === questions.length - 1 && (
              <p className="text-sm text-amber-600 mt-2 font-medium">
                Please answer all questions before submitting
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Info Footer */}
      <div className="w-full bg-white border-t border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>
            <span className="font-semibold">Tip:</span> Take your time and answer honestly.
            You can navigate back to review or change your answers.
          </p>
        </div>
      </div>
    </div>
  );
}
/ /   c o m m i t :   C o g n i t i v e T e s t   w i t h   1 2   q u e s t i o n s ,   p r o g r e s s   b a r ,   n a v i g a t i o n  
 