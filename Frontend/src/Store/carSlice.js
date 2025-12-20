import { createSlice } from "@reduxjs/toolkit";
const carSlice = createSlice({
    name: "car",
    initialState: {
        carstatus: false,
        cardata: null,
        allcardata: null
    },
    reducers: {
        cardata: (state, action) => {
            state.carstatus = true
            state.cardata = action.payload
        },
        allcardata: (state, action) => {
            state.carstatus = true
            state.allcardata = action.payload
        }
    }
})
export default carSlice.reducer
export const { cardata, allcardata } = carSlice.actions