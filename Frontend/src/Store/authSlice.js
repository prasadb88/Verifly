import { createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

const initialState = {
    isAuthenticated: false,
    user: null,
    onlineUsers: [],
    socket: null,
};

const baseurl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "http://localhost:8000";

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            // socket disconnection is handled by the thunk or external logic, 
            // but we reset the state here if we stored it.
            state.socket = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setSocket: (state, action) => {
            // We can store it, but Redux warns about non-serializable data.
            // If you ignore the warning, this works.
            state.socket = action.payload;
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        }
    },
});

export const { login, logout, setUser, setSocket, setOnlineUsers } = authSlice.actions;

export const connectSocket = () => (dispatch, getState) => {
    const { auth } = getState();
    // Use optional chaining for safety
    if (!auth.isAuthenticated || (auth.socket && auth.socket.connected)) return;

    const socket = io(baseurl, { withCredentials: true });

    socket.on("connect", () => {
        // console.log("Socket connected:", socket.id);
    });

    socket.on("getonlineusers", (users) => {
        dispatch(setOnlineUsers(users));
    });

    // Save socket to state so we can access it elsewhere if needed
    dispatch(setSocket(socket));
};

export const disconnectSocket = () => (dispatch, getState) => {
    const { auth } = getState();
    if (auth.socket) {
        auth.socket.disconnect();
        dispatch(setSocket(null));
    }
};

export default authSlice.reducer;

