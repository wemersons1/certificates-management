import reducer from "./reducer";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: reducer,
  // No need to explicitly pass middleware
});

export default store;

