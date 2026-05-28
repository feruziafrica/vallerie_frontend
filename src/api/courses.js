import axios from 'axios';

// ✅ Vite uses import.meta.env

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  


/**
 * Fetch all active courses
 */
export const fetchCourses = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/courses/`, {
      params: { is_active: true },
    });

    // ✅ Handle both paginated and non-paginated responses
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

/**
 * Fetch single course by ID
 */
export const fetchCourseById = async (courseId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/courses/${courseId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Fetch courses by category
 */
export const fetchCoursesByCategory = async (category) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/courses/`, {
      params: {
        category,
        is_active: true,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching courses for category ${category}:`, error);
    throw error;
  }
};
