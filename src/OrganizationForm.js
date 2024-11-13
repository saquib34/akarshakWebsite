import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { storySets } from './storySets';
import { saveOrganization, saveStoryResponses, getResponseStatistics } from './db';

const MergedForm = () => {
  const [orgFormData, setOrgFormData] = useState({
    centre_name: '',
    centre_location: '',
    latitude: '',
    longitude: '',
    total_strength: '',
    total_area: '',
    educational_rooms: '',
    furniture_condition: '',
    study_areas: '',
    digital_devices: [],
    internet_reliability: '',
    technical_support: '',
    wheelchair_access: '',
    learning_kits: '',
    staff_count: '',
    staff_gender_distribution: '',
    male_students: '',
    female_students: '',
    extracurricular_activities: '',
    centre_image: null
  });

  const [currentSet, setCurrentSet] = useState(0);
  const [showStory, setShowStory] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [responseStats, setResponseStats] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const totalSteps = 2;

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setOrgFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
        },
        () => toast.error("Location access denied. Please enter manually.")
      );
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setOrgFormData(prev => ({ ...prev, centre_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleResponseCount = (questionId, optionValue, category, count) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        counts: {
          ...prev[questionId]?.counts,
          [category]: parseInt(count) || 0
        }
      }
    }));
  };

  const handleAnswer = (questionId, answerValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedAnswer: answerValue,
        counts: prev[questionId]?.counts || {
          students: 0,
          teachers: 0,
          parents: 0,
          others: 0
        }
      }
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!orgFormData.centre_name?.trim()) newErrors.centre_name = 'Required';
      if (!orgFormData.centre_location?.trim()) newErrors.centre_location = 'Required';
      if (!orgFormData.total_strength) newErrors.total_strength = 'Required';
      if (!orgFormData.total_area) newErrors.total_area = 'Required';
      if (!orgFormData.educational_rooms) newErrors.educational_rooms = 'Required';
      if (!orgFormData.staff_count) newErrors.staff_count = 'Required';
    }

    if (step === 2) {
      const currentQ = `q${currentQuestion + 1}`;
      if (!answers[currentQ]?.selectedAnswer) {
        newErrors[currentQ] = 'Please select an answer and provide response counts';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateStep(currentStep)) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let imageBlob = null;
      if (orgFormData.centre_image) {
        const response = await fetch(imagePreview);
        imageBlob = await response.blob();
      }

      const organizationId = await saveOrganization({
        ...orgFormData,
        centre_image: imageBlob
      });

      await saveStoryResponses(organizationId, {
        setNumber: currentSet + 1,
        ...answers
      });

      const stats = await getResponseStatistics(currentSet + 1, currentQuestion + 1);
      setResponseStats(stats);

      toast.success('Form submitted successfully!');
      
      setOrgFormData({
        centre_name: '',
        centre_location: '',
        latitude: '',
        longitude: '',
        total_strength: '',
        total_area: '',
        educational_rooms: '',
        furniture_condition: '',
        study_areas: '',
        digital_devices: [],
        internet_reliability: '',
        technical_support: '',
        wheelchair_access: '',
        learning_kits: '',
        staff_count: '',
        staff_gender_distribution: '',
        male_students: '',
        female_students: '',
        extracurricular_activities: '',
        centre_image: null
      });
      
      setAnswers({});
      setCurrentStep(1);
      setCurrentQuestion(0);
      setImagePreview(null);
      setShowStory(true);
    } catch (error) {
      toast.error('Error submitting form: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = ({ name, label, type = "text", options = [], readOnly = false }) => {
    const fieldError = submitAttempted ? errors[name] : null;
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          <span className="text-red-500">*</span>
        </label>
        
        {type === "file" ? (
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="centre-image"
            />
            <label
              htmlFor="centre-image"
              className="flex items-center justify-center px-6 py-2 border border-gray-300 rounded-md shadow-sm 
                text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Image
            </label>
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
              </div>
            )}
          </div>
        ) : type === "select" ? (
          <select
            name={name}
            value={orgFormData[name]}
            onChange={(e) => setOrgFormData(prev => ({ ...prev, [name]: e.target.value }))}
            className={`w-full p-2 border rounded-lg ${fieldError ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select an option</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : type === "checkbox" ? (
          <div className="grid grid-cols-2 gap-4">
            {options.map(opt => (
              <label key={opt} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name={name}
                  value={opt}
                  checked={orgFormData[name].includes(opt)}
                  onChange={(e) => {
                    const updatedDevices = e.target.checked
                      ? [...orgFormData[name], opt]
                      : orgFormData[name].filter(d => d !== opt);
                    setOrgFormData(prev => ({ ...prev, [name]: updatedDevices }));
                  }}
                  className="w-4 h-4"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={orgFormData[name]}
            onChange={(e) => setOrgFormData(prev => ({ ...prev, [name]: e.target.value }))}
            readOnly={readOnly}
            className={`w-full p-2 border rounded-lg ${fieldError ? 'border-red-500' : 'border-gray-300'} 
              ${readOnly ? 'bg-gray-100' : ''}`}
          />
        )}
        
        {fieldError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{fieldError}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            {currentStep === 1 ? 'Centre Information' : 'Story Responses'}
          </h1>

          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {currentStep === 1 ? (
              <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField({
                  name: "centre_name",
                  label: "Centre Name"
                })}
                {renderField({
                  name: "centre_location",
                  label: "Centre Location"
                })}
                {renderField({
                  name: "latitude",
                  label: "Latitude",
                  readOnly: true
                })}
                {renderField({
                  name: "longitude",
                  label: "Longitude",
                  readOnly: true
                })}
                {renderField({
                  name: "total_strength",
                  label: "Total Capacity",
                  type: "number"
                })}
                {renderField({
                  name: "total_area",
                  label: "Total Area",
                  type: "select",
                  options: [
                    "Less than 500 sq. ft",
                    "500 - 1000 sq. ft",
                    "1000 - 2000 sq. ft",
                    "More than 2000 sq. ft"
                  ]
                })}
                {renderField({
                  name: "digital_devices",
                  label: "Available Digital Devices",
                  type: "checkbox",
                  options: ['Tablets', 'Laptops', 'Desktop computers', 'Smart boards']
                })}
                {renderField({
                  name: "educational_rooms",
                  label: "Number of Rooms",
                  type: "select",
                  options: ["1 - 2", "3 - 4", "More than 4"]
                })}
                {renderField({
                  name: "furniture_condition",
                  label: "Furniture Condition",
                  type: "select",
                  options: ["Excellent", "Good", "Fair", "Poor"]
                })}
                {renderField({
                  name: "internet_reliability",
                  label: "Internet Reliability",
                  type: "select",
                  options: ["Excellent", "Good", "Fair", "Poor"]
                })}
                {renderField({
                  name: "staff_count",
                  label: "Staff Count",
                  type: "select",
                  options: ["1 - 5", "6 - 10", "11 - 15", "More than 15"]
                })}
                {renderField({
                  name: "staff_gender_distribution",
                  label: "Staff Gender Distribution",
                  type: "select",
                  options: [
                    "Predominantly male",
                    "Predominantly female",
                    "Equal distribution"
                  ]
                })}
                {renderField({
                  name: "male_students",
                  label: "Male Students Count",
                  type: "select",
                  options: ["Less than 5", "5 - 10", "11 - 15", "More than 15"]
                })}
                {renderField({
                  name: "female_students",
                  label: "Female Students Count",
                  type: "select",
                  options: ["Less than 5", "5 - 10", "11 - 15", "More than 15"]
                })}
                {renderField({
                  name: "centre_image",
                  label: "Centre Image",
                  type: "file"
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {showStory ? (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold mb-4">कहानी:</h2>
                  <p className="whitespace-pre-wrap text-lg leading-relaxed">
                    {storySets[currentSet].story}
                  </p>

                  <h3 className="text-xl font-semibold mt-6 mb-4">जीवन के पाठ:</h3>
                  <div className="space-y-4">
                    {storySets[currentSet].lifeLessons.map((lesson, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900">{lesson.title}</h4>
                        <p className="text-blue-800">{lesson.description}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowStory(false)}
                    className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    प्रश्नों को देखें
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-white rounded-lg shadow-md">
                    <p className="text-lg mb-6 font-medium">
                      {storySets[currentSet].questions[currentQuestion].text}
                    </p>

                    <div className="space-y-4">
                      {storySets[currentSet].questions[currentQuestion].options.map((option) => (
                        <div key={option.value} className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleAnswer(`q${currentQuestion + 1}`, option.value)}
                            className={`w-full text-left p-4 rounded-lg border transition-colors
                              ${answers[`q${currentQuestion + 1}`]?.selectedAnswer === option.value
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'hover:bg-gray-50 border-gray-200'}`}
                          >
                            {option.value}. {option.text}
                          </button>

                          {answers[`q${currentQuestion + 1}`]?.selectedAnswer === option.value && (
                            <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-gray-50 rounded-lg">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Students Response Count
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={answers[`q${currentQuestion + 1}`]?.counts?.students || ''}
                                  onChange={(e) => handleResponseCount(`q${currentQuestion + 1}`, option.value, 'students', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Teachers Response Count
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={answers[`q${currentQuestion + 1}`]?.counts?.teachers || ''}
                                  onChange={(e) => handleResponseCount(`q${currentQuestion + 1}`, option.value, 'teachers', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Parents Response Count
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={answers[`q${currentQuestion + 1}`]?.counts?.parents || ''}
                                  onChange={(e) => handleResponseCount(`q${currentQuestion + 1}`, option.value, 'parents', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Others Response Count
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={answers[`q${currentQuestion + 1}`]?.counts?.others || ''}
                                  onChange={(e) => handleResponseCount(`q${currentQuestion + 1}`, option.value, 'others', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)}
                      className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg
                        hover:bg-gray-200 transition-colors"
                      disabled={currentQuestion === 0}
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Previous
                    </button>
                    
                    {currentQuestion === storySets[currentSet].questions.length - 1 ? (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex items-center px-6 py-3 ${
                          isSubmitting ? 'bg-blue-400' : 'bg-green-600 hover:bg-green-700'
                        } text-white rounded-lg transition-colors`}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit All'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg
                          hover:bg-blue-700 transition-colors"
                      >
                        Next
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 1 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (validateStep(1)) {
                    setCurrentStep(2);
                  }
                }}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg
                  hover:bg-blue-700 transition-colors"
              >
                Next: Story Responses
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
    <ToastContainer />
  </div>
);
};

export default MergedForm;