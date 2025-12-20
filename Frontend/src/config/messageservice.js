import axios from "axios";

export class MessageService {
    async getMessages(id) {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/message/get/${id}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async sendMessage({ id, formData }) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/message/send/${id}`,
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

    async deleteChat(id) {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/v1/message/delete/${id}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async deleteMessage(messageId) {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/v1/message/delete/message/${messageId}`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }

    async getChatPartners() {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/message/getChatpartner`,
                { withCredentials: true }
            );
            return response.data;
        } catch (e) {
            throw e.response?.data || e;
        }
    }
}

const messageservice = new MessageService();
export default messageservice;
