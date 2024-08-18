import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the table name
const TABLE_NAME = 'centres';

const OrganizationForm = () => {
  const [formData, setFormData] = useState({
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
    extracurricular_activities: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        console.log('Supabase URL:', supabaseUrl);
        console.log('API Key:', supabaseKey ? 'Set' : 'Not set');
    
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase URL or API Key is missing. Check your environment variables.');
        }
    
        const { data, error } = await supabase.from(TABLE_NAME).select('*').limit(1);
        
        if (error) {
          console.error('Supabase query error:', error);
          if (error.code === '42P01') {
            toast.error(`Table "${TABLE_NAME}" does not exist. Please check your table name.`);
          } else if (error.code === '42501') {
            toast.error('Permission denied. Check your API key permissions.');
          } else {
            toast.error(`Database error: ${error.message}`);
          }
        } else {
          console.log('Supabase connection successful');
          console.log('Data retrieved:', data);
          toast.success('Successfully connected to the database.');
        }
      } catch (error) {
        console.error('Error testing Supabase connection:', error);
        toast.error(`Connection error: ${error.message}`);
      }
    };
    testSupabaseConnection();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          setFormData(prevState => ({
            ...prevState,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
        },
        function(error) {
          console.error("Error getting geolocation:", error);
          toast.error("Unable to get location. Please enter manually.");
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      toast.warn("Geolocation is not supported. Please enter location manually.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' 
        ? (checked 
          ? [...prevState[name], value]
          : prevState[name].filter(item => item !== value)
        )
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData);
      console.log('Supabase URL:', `${supabaseUrl}/rest/v1/${TABLE_NAME}`);

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL or API Key is missing. Check your environment variables.');
      }

      // Convert digital_devices array to a string
      const formDataToSubmit = {
        ...formData,
        digital_devices: formData.digital_devices.join(', '),
        total_strength: parseInt(formData.total_strength, 10)
      };

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([formDataToSubmit]);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'An error occurred while submitting the form');
      }

      console.log('Data inserted successfully:', data);
      toast.success('Form submitted successfully!');
      // Reset form or navigate to a new page here if needed
    } catch (error) {
      console.error('Error submitting form:', error.message);
      toast.error(`Error submitting form: ${error.message}`);
    }
  };

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, totalSteps));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 1));

  const renderInputField = (name, label, type = "text", readOnly = false) => (
    <div className="col-span-2 sm:col-span-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}*
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={formData[name]}
        onChange={handleChange}
        required
        readOnly={readOnly}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
          readOnly ? 'bg-gray-100' : 'focus:ring-indigo-500 focus:border-indigo-500'
        }`}
      />
    </div>
  );

  const renderSelectField = (name, label, options) => (
    <div className="col-span-2 sm:col-span-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}*
      </label>
      <select
        name={name}
        id={name}
        value={formData[name]}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">Select an option</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Centre Information</h2>
            
            <div className="mb-8">
              <div className="flex justify-between">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`step ${currentStep >= step ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
                    Step {step}
                  </div>
                ))}
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <motion.div 
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {renderInputField("centre_name", "What is the name of the centre?")}
                    {renderInputField("centre_location", "Where is the centre located?")}
                    {renderInputField("latitude", "Latitude", "text", true)}
                    {renderInputField("longitude", "Longitude", "text", true)}
                    {renderInputField("total_strength", "How many people does the centre serve in total?", "number")}
                    {renderSelectField("total_area", "What is the total area of the centre?", [
                      "Less than 500 sq. ft", "500 - 1000 sq. ft", "1000 - 2000 sq. ft", "More than 2000 sq. ft"
                    ])}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900">Facilities</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {renderSelectField("educational_rooms", "How many rooms are designated for educational activities?", [
                      "1 - 2", "3 - 4", "More than 4"
                    ])}
                    {renderSelectField("furniture_condition", "What is the general condition of the furniture?", [
                      "Excellent", "Good", "Fair", "Poor"
                    ])}
                    {renderSelectField("study_areas", "Are there dedicated study areas for children?", [
                      "Yes, separate rooms", "Yes, shared spaces", "No, they study in multipurpose areas", "Not applicable"
                    ])}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Which digital devices are available at the centre?*
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {['Tablets', 'Laptops', 'Desktop computers', 'Smart boards'].map((device) => (
                          <label key={device} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              name="digital_devices"
                              value={device}
                              checked={formData.digital_devices.includes(device)}
                              onChange={handleChange}
                              className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                            />
                            <span className="ml-2 text-sm text-gray-700">{device}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {renderSelectField("internet_reliability", "How reliable is the internet connection?", [
                      "Excellent", "Good", "Fair", "Poor"
                    ])}
                    {renderSelectField("technical_support", "Is technical support available?", [
                      "Yes, full-time", "Yes, part-time", "No, but support is available remotely", "No, there is no technical support"
                    ])}
                    {renderSelectField("wheelchair_access", "Is wheelchair access available?", [
                      "Yes, fully accessible", "Yes, partially accessible", "No, but there are plans to improve", "No, not applicable"
                    ])}
                    {renderSelectField("learning_kits", "Are learning kits available?", [
                      "Yes, comprehensive kits for all subjects", "Yes, but only for some subjects", "No, only basic materials are provided", "Not applicable"
                    ])}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900">Staff and Students</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {renderSelectField("staff_count", "How many staff members are there?", [
                      "1 - 5", "6 - 10", "11 - 15", "More than 15"
                    ])}
                    {renderSelectField("staff_gender_distribution", "What is the gender distribution of the staff?", [
                      "Predominantly male", "Predominantly female", "Equal distribution", "Not applicable"
                    ])}
                    {renderSelectField("male_students", "How many male students are there?", [
                      "Less than 5", "5 - 10", "11 - 15", "More than 15"
                    ])}
                    {renderSelectField("female_students", "How many female students are there?", [
                      "Less than 5", "5 - 10", "11 - 15", "More than 15"
                    ])}
                    {renderSelectField("extracurricular_activities", "Are extracurricular activities offered?", [
                      "Yes, a wide range of activities", "Yes, a few activities", "No, but there are plans to introduce activities", "No, not applicable"
                    ])}
                  </div>
                </motion.div>
              )}

<div className="flex justify-between pt-5">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-300"
                  >
                    Previous
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
                  >
                    Submit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default OrganizationForm;