import axios from "axios";

export class Authservice {
    async register(data) {
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/registeruser`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async login({ username, email, password }) {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/login`, { username, email, password }, { withCredentials: true });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async logout() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/logout`, { withCredentials: true });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async generateNewToken() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/genratenewtoken`, { withCredentials: true });
            return response;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async getuser() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/getuser`, { withCredentials: true });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async updateprofile(data) {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/user/updateprofile`, data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async changepassword({ password }) {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/user/changepassword`, { password }, { withCredentials: true });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async completeprofile(data) {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/complete-profile`, data, {
                withCredentials: true,
            });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async toggleWishlist(carId) {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/wishlist/toggle`, { carId }, {
                withCredentials: true
            });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async getWishlist() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/wishlist`, {
                withCredentials: true
            });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    // Role Change Request Methods
    async requestRoleChange(data) {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/request/request`, data, {
                withCredentials: true
            });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async getMyRequests() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/request/myrequests`, {
                withCredentials: true
            });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async getAllRoleRequests() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/request/admin/requests`, {
                withCredentials: true
            });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async updateRoleRequestStatus(data) {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/request/admin/request-status`, data, {
                withCredentials: true
            });
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }
}

const authservice = new Authservice();
export default authservice;
