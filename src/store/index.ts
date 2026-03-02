/**
 * GDS Driving School — Redux Store
 * ===================================
 */

import { createStore, combineReducers } from 'redux';
import adminReducer from './admin/reducer';
import studentReducer from './student/reducer';

const rootReducer = combineReducers({
  admin: adminReducer,
  student: studentReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

const store = createStore(rootReducer);

export default store;
