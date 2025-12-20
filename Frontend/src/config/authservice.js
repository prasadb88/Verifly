import axios from "axios";

export class Authservice {
    async register(data) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        return axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/registeruser`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
            .then((respone) => {
                return respone.data
            }).catch((e) => {
                throw e.response?.data || e
            }
            )
    }

    async login
        ({
            username, email, password
        }) {
        return axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/login`, { username, email, password }, { withCredentials: true })
            .then((respone) => {
                return respone.data
            }).catch((e) => {
                throw e.response?.data || e
            }
            )
    }

    async logout() {
        return axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/logout`, { withCredentials: true })
            .then((respone) => {
                return respone.data
            }).catch((e) => {
                throw e.response?.data || e
            }
            )
    }

    async newwobtoken() {
        axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/genratenewtoken`, { withCredentials: true })
            .then((respone) => {
                return respone
            }).catch((e) => {
                throw e.response?.data || e
            });
    }

    async getuser() {
        return axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/getuser`, { withCredentials: true })
            .then((respone) => {
                return respone.data
            }).catch((e) => {
                throw e.response?.data || e
            }
            )
    }

    async updateprofile(data) {
        return axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/user/updateprofile`, data, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
            .then((respone) => {
                return respone.data
            }).catch((e) => {
                throw e.response?.data || e
            })
    }

    async changepassword
        ({
            password
        }) {
        return axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/user/changepassword`, { password }, { withCredentials: true })
            .then((respone) => {
                return respone.data
            }).catch((e) => {
                throw e.response?.data || e
            }
            )
    }

    async completeprofile(data) {
        return axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/complete-profile`, data, {
            withCredentials: true,
        })
            .then((respone) => {
                return respone.data
            }).catch((e) => {
                throw e.response?.data || e
            })
    }

    async toggleWishlist(carId) {
        return axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/wishlist/toggle`, { carId }, {
            withCredentials: true
        })
            .then((response) => {
                return response.data;
            })
            .catch((e) => {
                throw e.response?.data || e;
            });
    }
    async getWishlist() {
        return axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/wishlist`, {
            withCredentials: true
        })
            .then((response) => {
                return response.data;
            })
            .catch((e) => {
                throw e.response?.data || e;
            });
    }

    // Role Change Request Methods
    async requestRoleChange(data) {
        return axios.post(`${import.meta.env.VITE_API_URL}/api/v1/request/request`, data, {
            withCredentials: true
        })
            .then((response) => {
                return response.data;
            })
            .catch((e) => {
                throw e.response?.data || e;
            });
    }

    async getMyRequests() {
        return axios.get(`${import.meta.env.VITE_API_URL}/api/v1/request/myrequests`, {
            withCredentials: true
        })
            .then((response) => {
                return response.data;
            })
            .catch((e) => {
                throw e.response?.data || e;
            });
    }

    async getAllRoleRequests() {
        return axios.get(`${import.meta.env.VITE_API_URL}/api/v1/request/admin/requests`, {
            withCredentials: true
        })
            .then((response) => {
                return response.data;
            })
            .catch((e) => {
                throw e.response?.data || e;
            });
    }

    async updateRoleRequestStatus(data) {
        return axios.post(`${import.meta.env.VITE_API_URL}/api/v1/request/admin/request-status`, data, {
            withCredentials: true
        })
            .then((response) => {
                return response.data;
            })
            .catch((e) => {
                throw e.response?.data || e;
            });
    }
}

const authservice = new Authservice();
export default authservice;
