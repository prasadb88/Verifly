import axios from "axios";

export class carService {
    async analyzeCarImages(formData) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/cars/generate-ai`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async addcar(formData) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/cars/addcar`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async updateCar({ id, formData }) {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/v1/cars/updatecar/${id}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async deletecar(id) {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/v1/cars/deletecar/${id}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async getallcars() {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/cars/getallcars`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async getcar(id) {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/cars/getcar/${id}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async getmycars() {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/cars/getmycars`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async getRcDetails(registrationnumber) {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/cars/rc/${registrationnumber}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }
}

const carservice = new carService();

export default carservice;
