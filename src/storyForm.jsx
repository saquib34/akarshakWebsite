// StoryForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronRight, ChevronLeft, BarChart2 } from 'lucide-react';
import { storySets } from './storySets';

const StoryForm = () => {
  const [currentSet, setCurrentSet] = useState(0);
  const [showStory, setShowStory] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [participantId] = useState(() => Math.random().toString(36).substring(7));
  const [showStats, setShowStats] = useState(false);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    const fetchRandomSet = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/random-set');
        const data = await response.json();
        setCurrentSet(data.setNumber - 1);
      } catch (error) {
        console.error('Error fetching random set:', error);
        toast.error('Error loading story set');
      }
    };

    fetchRandomSet();
  }, []);

  const validateAnswer = () => {
    const currentKey = `q${currentQuestion + 1}`;
    if (!answers[currentKey]) {
      setErrors({ ...errors, [currentKey]: 'Please select an answer' });
      toast.error('Please select an answer before proceeding');
      return false;
    }
    return true;
  };

  const handleAnswer = (answer) => {
    const questionKey = `q${currentQuestion + 1}`;
    setAnswers(prev => ({
      ...prev,
      [questionKey]: {
        questionText: currentStorySet.questions[currentQuestion].text,
        selectedAnswer: answer,
        answerText: currentStorySet.questions[currentQuestion].options.find(
          opt => opt.value === answer
        ).text
      }
    }));
    setErrors(prev => ({ ...prev, [questionKey]: '' }));
  };

  const nextQuestion = () => {
    if (!validateAnswer()) return;

    if (currentQuestion < currentStorySet.questions.length - 1) {
      setCurrentQuestion(curr => curr + 1);
    } else {
      handleSubmit();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(curr => curr - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateAnswer()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3001/api/story-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setNumber: currentSet + 1,
          answers,
          participantId
        }),
      });

      if (!response.ok) throw new Error('Submission failed');
      
      toast.success('Responses saved successfully!');
      await fetchStatistics();
      setShowStats(true);
    } catch (error) {
      toast.error('Error saving responses: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/statistics/${currentSet + 1}`);
      const stats = await response.json();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const currentStorySet = storySets[currentSet];
  const progress = ((currentQuestion + 1) / currentStorySet.questions.length) * 100;

  // Statistics View
  if (showStats && statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
            <h2 className="text-2xl font-bold mb-6">Response Statistics</h2>
            {Object.entries(statistics).map(([questionNumber, options]) => (
              <div key={questionNumber} className="mb-8">
                <h3 className="text-lg font-semibold mb-4">
                  Question {questionNumber}: {currentStorySet.questions[questionNumber - 1].text}
                </h3>
                <div className="space-y-2">
                  {options.map(option => (
                    <div key={option.optionValue} className="flex items-center space-x-4">
                      <span className="w-8">{option.optionValue}:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-blue-600 rounded-full h-6 transition-all duration-500"
                          style={{ width: `${(option.count / Math.max(...options.map(o => o.count))) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right">{option.count} votes</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Start New Set
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600 text-right">
              Question {currentQuestion + 1} of {currentStorySet.questions.length}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Set {currentStorySet.setNumber}: {currentStorySet.title}
          </h1>

          {showStory ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose max-w-none mb-8"
            >
              <h2 className="text-xl font-semibold mb-4">कहानी:</h2>
              <p className="whitespace-pre-wrap text-lg leading-relaxed">
                {currentStorySet.story}
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-4">जीवन के पाठ:</h3>
              <div className="space-y-4">
                {currentStorySet.lifeLessons.map((lesson, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900">{lesson.title}</h4>
                    <p className="text-blue-800">{lesson.description}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowStory(false)}
                className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                प्रश्नों को देखें
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="p-6 bg-white rounded-lg shadow-md">
                <p className="text-lg mb-6 font-medium">
                  {currentStorySet.questions[currentQuestion].text}
                </p>
                <div className="space-y-4">
                  {currentStorySet.questions[currentQuestion].options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleAnswer(option.value);
                        // Only auto-advance if it's not the last question
                        if (currentQuestion < currentStorySet.questions.length - 1) {
                          nextQuestion();
                        }
                      }}
                      className={`w-full text-left p-4 rounded-lg border transition-colors
                        ${answers[`q${currentQuestion + 1}`]?.selectedAnswer === option.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'hover:bg-gray-50 border-gray-200'}`}
                    >
                      {option.value}. {option.text}
                    </button>
                  ))}
                </div>
                {errors[`q${currentQuestion + 1}`] && (
                  <p className="text-red-500 mt-2">{errors[`q${currentQuestion + 1}`]}</p>
                )}
              </div>

              <div className="flex justify-between mt-6">
                {currentQuestion > 0 && (
                  <button
                    onClick={prevQuestion}
                    className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg
                      hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                  </button>
                )}
                
                {currentQuestion === currentStorySet.questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex items-center px-6 py-3 ${
                      isSubmitting 
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white rounded-lg transition-colors ml-auto`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg
                      hover:bg-blue-700 transition-colors ml-auto"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default StoryForm;