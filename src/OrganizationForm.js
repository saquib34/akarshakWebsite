import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrganizationForm = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    address: '',
    location: '',
    latitude: '',
    longitude: '',
    totalStudents: 0,
    students: []
  });

  useEffect(() => {
    const studentCount = parseInt(formData.totalStudents) || 0;
    setFormData(prevState => ({
      ...prevState,
      students: Array(studentCount).fill().map((_, i) => prevState.students[i] || { name: '', class: '' })
    }));
  }, [formData.totalStudents]);

  const handleChange = (e, index) => {
    if (e.target.name === 'studentName' || e.target.name === 'studentClass') {
      const newStudents = [...formData.students];
      newStudents[index][e.target.name === 'studentName' ? 'name' : 'class'] = e.target.value;
      setFormData({ ...formData, students: newStudents });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.students.length !== parseInt(formData.totalStudents)) {
      alert('Number of students does not match the total students specified.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/submit-form', formData);
      console.log(response.data);
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve your location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-extrabold text-blue-600 mb-6">Center Information</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="organizationName">
                      Organization Name*
                    </label>
                    <input
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      id="organizationName"
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                      Address*
                    </label>
                    <textarea
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows="3"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                      City/Town*
                    </label>
                    <input
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      id="location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Coordinates*
                    </label>
                    <div className="flex space-x-2">
                      <input
                        className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        type="text"
                        value={formData.latitude ? `Lat: ${formData.latitude}` : ''}
                        readOnly
                        required
                      />
                      <input
                        className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        type="text"
                        value={formData.longitude ? `Lon: ${formData.longitude}` : ''}
                        readOnly
                        required
                      />
                      <button
                        type="button"
                        onClick={handleLocateMe}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                      >
                        Locate Me
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalStudents">
                      Total Students*
                    </label>
                    <input
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      id="totalStudents"
                      type="number"
                      name="totalStudents"
                      value={formData.totalStudents}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-blue-600">Students*</h3>
                    {formData.students.map((student, index) => (
                      <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <input
                          className="shadow-sm bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2"
                          type="text"
                          name="studentName"
                          value={student.name}
                          onChange={(e) => handleChange(e, index)}
                          placeholder="Student Name"
                          required
                        />
                        <input
                          className="shadow-sm bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          type="text"
                          name="studentClass"
                          value={student.class}
                          onChange={(e) => handleChange(e, index)}
                          placeholder="Student Class"
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                      type="submit"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationForm;