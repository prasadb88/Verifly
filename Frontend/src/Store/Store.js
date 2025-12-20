import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice.js"
import carSlice from "./carSlice.js"
import messageSlice from "./messageSlice.js"
import testdriveSlice from "./testdriveSlice.js"
const store = configureStore({
    reducer: {
        auth: authSlice,
        carsdata: carSlice,
        testdrive: testdriveSlice,
        message: messageSlice
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/setSocket'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['payload.socket', 'meta.arg.formData'],
                // Ignore these paths in the state
                ignoredPaths: ['auth.socket'],
            },
        }),
})

export default store