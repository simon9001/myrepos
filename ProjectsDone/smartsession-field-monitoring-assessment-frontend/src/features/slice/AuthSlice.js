import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    isAuthenticated: false,
    token: null,
    user: null,
}


export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set user credentials
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        // Clear user credentials
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer