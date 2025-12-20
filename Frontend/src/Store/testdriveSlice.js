import { createSlice } from "@reduxjs/toolkit";
const testdriveSlice = createSlice({
    name: "testdrive",
    initialState: {
        testdrivestatus: false,
        testdrivedata: null
    },
    reducers: {
        testdrivedata: (state, action) => {
            state.testdrivestatus = true
            state.testdrivedata = action.payload
        }
    }
})
export default testdriveSlice.reducer
export const { testdrivedata } = testdriveSlice.actions