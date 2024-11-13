// src/services/api.js
export const saveOrganization = async (formData) => {
    const data = new FormData();
    
    for (const [key, value] of Object.entries(formData)) {
      if (key === 'digital_devices') {
        data.append(key, JSON.stringify(value));
      } else if (key === 'centre_image' && value instanceof File) {
        data.append('centre_image', value);
      } else {
        data.append(key, value);
      }
    }
  
    const response = await fetch('http://localhost:5000/api/organizations', {
      method: 'POST',
      body: data
    });
  
    if (!response.ok) {
      throw new Error('Failed to save organization');
    }
  
    const result = await response.json();
    return result.id;
  };
  
  export const saveStoryResponses = async (organizationId, responses) => {
    const response = await fetch('http://localhost:5000/api/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        ...responses
      }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to save responses');
    }
  
    return response.json();
  };
  
  export const getResponseStatistics = async (setNumber, questionNumber) => {
    const response = await fetch(
      `http://localhost:5000/api/statistics/${setNumber}/${questionNumber}`
    );
  
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
  
    return response.json();
  };