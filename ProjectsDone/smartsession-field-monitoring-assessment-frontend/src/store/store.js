import { configureStore } from '@reduxjs/toolkit'
import { AuthApi } from '../features/api/AuthApi'
import authSlice from '../features/slice/AuthSlice'
// Fix for redux-persist in Vite/ESM
const storage = {
    getItem: (key) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
    removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { userApi } from '../features/api/UserApi';
import { FieldApi } from '../features/api/FieldApi';

// configure the Redux store
const authPersistConfig = {
    key: 'auth',
    storage,
    version: 1,
    whitelist: ['token', 'isAuthenticated', 'user'], // only persist these keys
};

//Create the persisted reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);

export const store = configureStore({
    reducer: {
        // Add the AuthApi reducer
        [AuthApi.reducerPath]: AuthApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [FieldApi.reducerPath]: FieldApi.reducer,

        //add the auth slice reducer
        authSlice: persistedAuthReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(AuthApi.middleware, userApi.middleware, FieldApi.middleware),
})

//export the persisted store
export const persistor = persistStore(store)