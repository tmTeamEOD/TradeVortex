import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import { DataCacheProvider } from "./contexts/DataCacheContext.jsx";
import './index.css';
import App from './App.jsx';
import store from './redux/store.js';

const GOOGLE_CLIENT_ID = '984280779923-a9lns1v2lqa2uk516q0r2eh0p1eivkgj.apps.googleusercontent.com';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <DataCacheProvider>
    <React.StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Provider store={store}>
          <Suspense fallback={<div>로딩 중입니다...</div>}>
            <App />
          </Suspense>
        </Provider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  </DataCacheProvider>
);
