import axios, { AxiosResponse } from 'axios';

const API_URL = 'https://api.example.com';

interface ApiResponse {
  data: any;
  status: number;
}

export const fetchData = async (endpoint: string): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<any> = await axios.get(`${API_URL}/${endpoint}`);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    throw new Error('Error fetching data');
  }
};

export const postData = async (endpoint: string, data: any): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<any> = await axios.post(`${API_URL}/${endpoint}`, data);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    throw new Error('Error posting data');
  }
};