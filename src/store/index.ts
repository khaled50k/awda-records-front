import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './slices/authSlice';
import staticDataReducer from './slices/staticDataSlice';
import uiReducer from './slices/uiSlice';
import usersReducer from './slices/userSlice';
import patientsReducer from './slices/patientSlice';
import medicalRecordsReducer from './slices/medicalRecordSlice';
import transfersReducer from './slices/transferSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    patients: patientsReducer,
    medicalRecords: medicalRecordsReducer,
    transfers: transfersReducer,
    
    staticData: staticDataReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
