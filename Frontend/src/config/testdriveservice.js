import axios from "axios";

export class TestDriveService {
    async requestTestDrive(data) {
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

    async getMyRequests() {
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

    async cancelTestDrive(id) {
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

    async getDealerRequests() {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/testdrive/getsellertestdriverequests`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async acceptRequest(id) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/testdrive/accepttestdrive`,
                { id },
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async rejectRequest(id, message) {
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

    async startTestDrive(id) {
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

    async completeTestDrive(id) {
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
}

const testdriveservice = new TestDriveService();
export default testdriveservice;
