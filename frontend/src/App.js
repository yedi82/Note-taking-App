import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import EditProfile from './components/EditProfile';
import Dashboard from './pages/Dashboard';
import Features from './pages/Features';
import Files from './pages/Files';
import Folders from './pages/Folders';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Note from './pages/Note';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword';
import SharedFolders from './pages/SharedFolders';
import SharedNotes from './pages/SharedNotes';
import Signup from './pages/Signup';
import Templates from './pages/Templates';
import { ThemeProvider } from './ThemeContext';
import { UserProvider } from './UserContext'; // Import UserProvider

import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const socket = io(API_URL);

function App() {
  const [, setNote] = useState('');
  const [, setNotifications] = useState([]);
  const [, setLockError] = useState('');
  const [, setConflictError] = useState('');

  useEffect(() => {
    socket.on('noteUpdated', (updatedNote) => {
      console.log('Note updated:', updatedNote);
      setNote(updatedNote);
    });

    socket.on('userJoined', (message) => {
      console.log('User joined:', message);
      setNotifications((prev) => [...prev, message]);
    });

    socket.on('userLeft', (message) => {
      console.log('User left:', message);
      setNotifications((prev) => [...prev, message]);
    });

    socket.on('editingStarted', (message) => {
      setNotifications((prev) => [...prev, message]);
    });

    socket.on('editingStopped', (message) => {
      console.log('Editing stopped:', message);
      setNotifications((prev) => [...prev, message]);
    });

    socket.on('lockError', (message) => {
      setLockError(message);
    });

    socket.on('conflictError', (message) => {
      setConflictError(message);
    });

    return () => {
      socket.off('noteUpdated');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('editingStarted');
      socket.off('editingStopped');
      socket.off('lockError');
      socket.off('conflictError');
    };
  }, []);

  return (
    <UserProvider> {/* Wrap the app with UserProvider (for avatars) */}
      <ThemeProvider> {/* Wrap the app with ThemeProvider (for themes) */}
        <Router>
          <div className="font-sans">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/features" element={<Features />} />

              {/* Request Password Reset Page */}
              <Route path="/request-password-reset" element={<RequestPasswordReset />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Main App Pages */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/folders" element={<Folders />} />
              <Route path="/folders/:folderId" element={<Files />} />
              <Route path="/folders/:folderId/note/:noteId" element={<Note />} />
              <Route path="/notes/:noteId" element={<Note />} />
              <Route path="/editprofile" element={<EditProfile />} />

              {/* Shared Folders and Notes Pages */}
              <Route path="/shared-folders" element={<SharedFolders />} />
              <Route path="/shared-notes" element={<SharedNotes />} />

              {/* Templates Page */}
              <Route path="/templates" element={<Templates />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
