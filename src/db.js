// db.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_UR || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const saveOrganization = async (formData) => {
  try {
    // Create FormData object for multipart/form-data (needed for image upload)
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'centre_image' && formData[key]) {
        data.append('centre_image', formData[key]);
      } else {
        data.append(key, formData[key]);
      }
    });

    const response = await api.post('/organizations', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.id;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error saving organization');
  }
};

export const saveStoryResponses = async (organizationId, responses) => {
  try {
    const response = await api.post('/responses', {
      organizationId,
      responses,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error saving responses');
  }
};

export const getResponseStatistics = async (setNumber, questionNumber) => {
  try {
    const response = await api.get(`/statistics`, {
      params: { setNumber, questionNumber }
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error getting statistics');
  }
};