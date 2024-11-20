import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AlertCircle, Upload, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './components/alert';
import { Card, CardHeader, CardTitle, CardContent } from './components/card';
import { Button } from './components/button';
import { Input } from './components/input';
import { saveOrganization, saveStoryResponses, getResponseStatistics } from './db';
import { storySets } from './storySets';

const MergedForm = () => {
  const [orgFormData, setOrgFormData] = useState({
    centre_name: '',
    centre_location: '',
    latitude: '',
    longitude: '',
    total_strength: '',
    centre_image: null
  });

  const [currentSet] = useState(0);
  const [showStory, setShowStory] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = async () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        setOrgFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        toast.success('Location obtained successfully');
      } catch (error) {
        toast.error("Location access required. Please enable location services.");
      }
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
    setLocationLoading(false);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      try {
        setOrgFormData(prev => ({ ...prev, centre_image: file }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error('Error processing image');
      }
    }
  };

  const handleAnswer = (questionId, optionValue, count) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [optionValue]: {
          selected: true,
          count: parseInt(count) || 0
        }
      }
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Validate first step
      if (!orgFormData.centre_name?.trim()) {
        newErrors.centre_name = 'Centre name is required';
      }
      if (!orgFormData.centre_location?.trim()) {
        newErrors.centre_location = 'Centre location is required';
      }
      if (!orgFormData.latitude || !orgFormData.longitude) {
        newErrors.location = 'Location coordinates are required';
      }
      if (!orgFormData.total_strength) {
        newErrors.total_strength = 'Total strength is required';
      }
      if (!orgFormData.centre_image) {
        newErrors.centre_image = 'Centre image is required';
      }
    }

    if (step === 2) {
      // Validate second step (responses)
      const currentQ = `q${currentQuestion + 1}`;
      const currentQuestionOptions = storySets[currentSet].questions[currentQuestion].options;
      
      let hasAllAnswers = true;
      currentQuestionOptions.forEach(option => {
        if (!answers[currentQ]?.[option.value]?.count) {
          hasAllAnswers = false;
        }
      });

      if (!hasAllAnswers) {
        newErrors[currentQ] = 'Please provide response count for all options';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save organization data first
      const organizationId = await saveOrganization(orgFormData);

      // Then save the story responses
      await saveStoryResponses(organizationId, {
        setNumber: currentSet + 1,
        responses: answers
      });

      // Get statistics for the current question
      await getResponseStatistics(currentSet + 1, currentQuestion + 1);

      toast.success('Form submitted successfully!');
      
      // Reset form
      setOrgFormData({
        centre_name: '',
        centre_location: '',
        latitude: '',
        longitude: '',
        total_strength: '',
        centre_image: null
      });
      setAnswers({});
      setCurrentStep(1);
      setCurrentQuestion(0);
      setImagePreview(null);
      setShowStory(true);
      setSubmitAttempted(false);
    } catch (error) {
      toast.error('Error submitting form: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {currentStep === 1 ? 'Centre Information' : 'Story Responses'}
                </CardTitle>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 2) * 100}%` }}
                  />
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {currentStep === 1 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Centre Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={orgFormData.centre_name}
                            onChange={(e) => setOrgFormData(prev => ({
                              ...prev,
                              centre_name: e.target.value
                            }))}
                            className={errors.centre_name ? 'border-red-500' : ''}
                          />
                          {errors.centre_name && (
                            <span className="text-red-500 text-sm">{errors.centre_name}</span>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Centre Location <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={orgFormData.centre_location}
                            onChange={(e) => setOrgFormData(prev => ({
                              ...prev,
                              centre_location: e.target.value
                            }))}
                            className={errors.centre_location ? 'border-red-500' : ''}
                          />
                          {errors.centre_location && (
                            <span className="text-red-500 text-sm">{errors.centre_location}</span>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Strength <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            value={orgFormData.total_strength}
                            onChange={(e) => setOrgFormData(prev => ({
                              ...prev,
                              total_strength: e.target.value
                            }))}
                            className={errors.total_strength ? 'border-red-500' : ''}
                          />
                          {errors.total_strength && (
                            <span className="text-red-500 text-sm">{errors.total_strength}</span>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">
                              Location Coordinates <span className="text-red-500">*</span>
                            </label>
                            <Button
                              type="button"
                              onClick={checkLocation}
                              disabled={locationLoading}
                              variant="outline"
                              size="sm"
                            >
                              <MapPin className="w-4 h-4 mr-2" />
                              {locationLoading ? 'Getting Location...' : 'Get Location'}
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              type="text"
                              value={orgFormData.latitude}
                              placeholder="Latitude"
                              readOnly
                              className={errors.location ? 'border-red-500' : ''}
                            />
                            <Input
                              type="text"
                              value={orgFormData.longitude}
                              placeholder="Longitude"
                              readOnly
                              className={errors.location ? 'border-red-500' : ''}
                            />
                          </div>
                          {errors.location && (
                            <span className="text-red-500 text-sm">{errors.location}</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Centre Image <span className="text-red-500">*</span>
                          </label>
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
                              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed 
                                ${errors.centre_image ? 'border-red-500' : 'border-gray-300'}
                                rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}
                            >
                              {imagePreview ? (
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                  <p className="text-sm text-gray-600">Click to upload centre image</p>
                                </div>
                              )}
                            </label>
                            {errors.centre_image && (
                              <span className="text-red-500 text-sm">{errors.centre_image}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    ) : (
                      <div className="space-y-8">
                        {showStory ? (
                          <div className="prose max-w-none">
                            <h2 className="text-2xl font-bold mb-6">कहानी:</h2>
                            <div className="bg-white/50 p-6 rounded-xl backdrop-blur-sm">
                              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                                {storySets[currentSet].story}
                              </p>
                            </div>
  
                            <div className="mt-8">
                              <h3 className="text-xl font-semibold mb-4">जीवन के पाठ:</h3>
                              <div className="grid gap-4">
                                {storySets[currentSet].lifeLessons?.map((lesson, index) => (
                                  <div key={index} className="p-4 bg-blue-50/50 rounded-lg">
                                    <h4 className="font-semibold text-blue-900">{lesson.title}</h4>
                                    <p className="text-blue-800 mt-2">{lesson.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
  
                            <Button
                              type="button"
                              onClick={() => setShowStory(false)}
                              className="mt-8 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            >
                              प्रश्नों को देखें
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-8">
                            <div className="bg-white/50 p-8 rounded-xl backdrop-blur-sm">
                              <h3 className="text-xl font-semibold mb-6">
                                Question {currentQuestion + 1} of {storySets[currentSet].questions.length}:
                              </h3>
                              <p className="text-lg mb-8">
                                {storySets[currentSet].questions[currentQuestion].text}
                              </p>
  
                              <div className="space-y-6">
                                {storySets[currentSet].questions[currentQuestion].options.map((option) => (
                                  <div key={option.value} className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-500 transition-colors">
                                      <div className="flex items-center space-x-4">
                                        <span className="font-medium text-purple-600">{option.value}.</span>
                                        <span className="text-lg">{option.text}</span>
                                      </div>
                                      <Input
                                        type="number"
                                        min="0"
                                        placeholder="Students count"
                                        value={answers[`q${currentQuestion + 1}`]?.[option.value]?.count || ''}
                                        onChange={(e) => handleAnswer(
                                          `q${currentQuestion + 1}`,
                                          option.value,
                                          e.target.value
                                        )}
                                        className="w-32"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
  
                              {errors[`q${currentQuestion + 1}`] && (
                                <Alert variant="destructive" className="mt-4">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Error</AlertTitle>
                                  <AlertDescription>
                                    {errors[`q${currentQuestion + 1}`]}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
  
                            <div className="flex justify-between mt-6">
                              <Button
                                type="button"
                                onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)}
                                variant="outline"
                                disabled={currentQuestion === 0}
                                className="flex items-center"
                              >
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                Previous
                              </Button>
  
                              {currentQuestion === storySets[currentSet].questions.length - 1 ? (
                                <Button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="flex items-center px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                >
                                  {isSubmitting ? 'Submitting...' : 'Submit All'}
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (validateStep(2)) {
                                      setCurrentQuestion(prev => prev + 1);
                                    }
                                  }}
                                  className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                >
                                  Next
                                  <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
  
                    {currentStep === 1 && (
                      <div className="flex justify-end mt-8">
                        <Button
                          type="button"
                          onClick={() => {
                            if (validateStep(1)) {
                              setCurrentStep(2);
                            }
                          }}
                          className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          Next: Story Responses
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
        <ToastContainer position="top-center" />
      </div>
    );
  };
  
  export default MergedForm;