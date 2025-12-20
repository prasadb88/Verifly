import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import messageservice from "../config/messageservice";

export const getMessages = createAsyncThunk(
    "message/getMessages",
    async (id, { rejectWithValue }) => {
        try {
            const response = await messageservice.getMessages(id);
            return response.data; // Assuming API structure: { data: [...] } or direct.
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch messages");
        }
    }
);

export const sendMessage = createAsyncThunk(
    "message/sendMessage",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await messageservice.sendMessage({ id, formData });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to send message");
        }
    }
);

export const getChatPartners = createAsyncThunk(
    "message/getChatPartners",
    async (_, { rejectWithValue }) => {
        try {
            const response = await messageservice.getChatPartners();
            return response.data; // Assuming API returns array of user objects
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch chat partners");
        }
    }
);

export const deleteChat = createAsyncThunk(
    "message/deleteChat",
    async (id, { rejectWithValue }) => {
        try {
            await messageservice.deleteChat(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to delete chat");
        }
    }
);

export const deleteMessage = createAsyncThunk(
    "message/deleteMessage",
    async (messageId, { rejectWithValue }) => {
        try {
            await messageservice.deleteMessage(messageId);
            return messageId;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to delete message");
        }
    }
);

const messageSlice = createSlice({
    name: "message",
    initialState: {
        messages: [],
        chatPartners: [],
        selectedUser: null,
        loading: false,
        error: null,
    },
    reducers: {
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        removeMessage: (state, action) => {
            state.messages = state.messages.filter(msg => msg._id !== action.payload);
        },
        clearMessages: (state) => {
            state.messages = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(getMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.messages.push(action.payload);
            })
            .addCase(getChatPartners.fulfilled, (state, action) => {
                state.chatPartners = action.payload;
            })
            .addCase(deleteChat.fulfilled, (state) => {
                state.messages = []; // Clear current messages
            })
            .addCase(deleteMessage.fulfilled, (state, action) => {
                state.messages = state.messages.filter(msg => msg._id !== action.payload);
            });
    },
});

export const { setSelectedUser, addMessage, removeMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;

