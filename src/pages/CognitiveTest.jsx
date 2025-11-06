import { useState } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CognitiveTest() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  const questions = [
    {
      q: "Remember this sequence: 🍎 🍌 🍇",
      options: ["🍎 🍌 🍇", "🍎 🍇 🍌", "🍇 🍌 🍎"],
      correct: "🍎 🍌 🍇",
    },
    {
      q: "Which one is an animal?",
      options: ["Car", "Dog", "Chair", "Bottle"],
      correct: "Dog",
    },
    {
      q: "What day comes after Monday?",
      options: ["Sunday", "Tuesday", "Friday"],
      correct: "Tuesday",
    },
  ];

  const handleAnswer = (answer) => {
    if (answer === questions[step].correct) setScore(score + 1);
    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      navigate("/results", { state: { score, total: questions.length } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-xl text-center"
      >
        <div className="flex justify-center mb-6">
          <Brain className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Cognitive Test – Question {step + 1}
        </h2>
        <p className="text-gray-700 mb-6">{questions[step].q}</p>

        <div className="grid gap-4">
          {questions[step].options.map((opt, i) => (
            <motion.button
              key={i}
              onClick={() => handleAnswer(opt)}
              whileHover={{ scale: 1.05 }}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium shadow hover:bg-indigo-700"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
