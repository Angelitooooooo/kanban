import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';

const instance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Kanban Print API endpoints
export const getKanbanPrintsStation1 = async () => {
  try {
    const response = await instance.get('/kanban-prints/station/1');
    return response.data;
  } catch (error) {
    console.error('Error fetching kanban prints for Station 1:', error);
    throw error;
  }
};

export const getAllKanbanPrints = async (isAdmin = false) => {
  try {
    const params = isAdmin ? { all: true } : {};
    const response = await instance.get('/kanban-prints', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching kanban prints:', error);
    throw error;
  }
};

export const saveKanbanPrint = async (kanbanData) => {
  try {
    const response = await instance.post('/kanban-prints', kanbanData);
    return response.data;
  } catch (error) {
    console.error('Error saving kanban print:', error);
    throw error;
  }
};

export const updateKanbanPrint = async (id, kanbanData) => {
  try {
    const response = await instance.put(`/kanban-prints/${id}`, kanbanData);
    return response.data;
  } catch (error) {
    console.error('Error updating kanban print:', error);
    throw error;
  }
};

// Error Logs API endpoints
export const saveErrorLog = async (route, error) => {
  try {
    const response = await instance.post('/error-logs', {
      route: route,
      error: error
    });
    return response.data;
  } catch (err) {
    console.error('Error saving error log:', err);
    // Fail silently to prevent infinite loops
    return null;
  }
};


export default instance;
