import axios from "axios";

export class testDriveService {
    async requesttestdrive(data) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/testdrive/requesttestdrive`,
                data,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }
    async mytestdriverequest() {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/testdrive/mytestdriverequest`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }
    async getSellerTestDriveRequests() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/testdrive/getsellertestdriverequests`,
                { withCredentials: true })
            return response.data
        }
        catch (e) {
            throw e.response?.data || e
        }
    }
    async accepttestdrive({ id }) {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/testdrive/accepttestdrive`,
                { id },
                { withCredentials: true })
            return response.data
        }
        catch (e) {
            throw e.response.data
        }
    }
    async rejecttestdrive({ id, message }) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/testdrive/rejectedtestdrive`,
                { id, message },
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }
    async starttestdrive(id) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/testdrive/starttestdrive`,
                { id },
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async completetestdrive(id) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/testdrive/completetestdrive`,
                { id },
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }
    async canceltestdrive(id) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/testdrive/canceltestdrive`,
                { id },
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }
}

const testdriveservice = new testDriveService()

export default testdriveservice
