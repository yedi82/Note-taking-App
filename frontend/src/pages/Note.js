import { AnimatePresence, motion } from "framer-motion";
import { Download, Edit, Eye, Loader, Save, Trash2 } from 'lucide-react';
import { marked } from "marked";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../App.css';
import { useTheme } from '../ThemeContext';
import AddContributor from "../components/AddContributor";
import Header from "../components/Header";
import SideBar from "../components/SideBar";
import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const socket = io(API_URL);

export default function Note() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [, setRefresh] = useState(false);
  const [isSidebarOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [noteOwnerId, setNoteOwnerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [collaborators, setCollaborators] = useState([]);
  const { darkMode, currentTheme } = useTheme();


  const togglePreviewMode = () => {
    if (!isPreviewMode) {
      setIsPreviewLoading(true);
      setIsPreviewMode(true);
      setTimeout(() => {
        setIsPreviewLoading(false);
      }, 2000);
    } else {
      setIsPreviewMode(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true'  };

        const [userResponse, noteResponse] = await Promise.all([
          fetch(`${API_URL}/users/me`, { headers }),
          fetch(`${API_URL}/notes/${noteId}`, { headers })
        ]);

        const userData = await userResponse.json();
        const noteData = await noteResponse.json();

        if (userResponse.ok) {
          setCurrentUserId(userData.id);
        } else {
          console.error("Error fetching current user:", userData.error);
        }

        if (noteResponse.ok) {
          setName(noteData.name);
          setContent(noteData.content);
          setNoteOwnerId(noteData.user_id);
          setCollaborators(noteData.noteUserCollaborators);
        } else {
          console.error("Error fetching note:", noteData.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    socket.emit('joinNote', noteId);

    socket.on('noteUpdated', (data) => {
      if (data.noteId === noteId) {
        setContent(data.content);
      }
    });

    return () => {
      socket.emit('leaveNote', noteId);
      socket.off('userEditing');
    };

  }, [noteId]);

  const deleteNote = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true'  },
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Note deleted successfully!");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        console.error("Error deleting note:", data.error);
        setMessage(data.error);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      setMessage("Error deleting note");
    }
  };

  const saveNote = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ content, name }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Note updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Error updating note");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      setMessage("Error updating note");
    }
  };

  const downloadNote = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${name}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Header islanding={false}/>

      <div className="flex flex-1">
        <SideBar isOpen={isSidebarOpen} />

        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`${currentTheme.text}`}>{name}</h1>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className={`animate-spin h-12 w-12 ${currentTheme.text}`} />
            </div>
          ) : (
            <div>
              {/* top buttons */}
              <div className="mb-4 flex flex-wrap space-x-2">
                <motion.button
                  onClick={togglePreviewMode}
                  className={`btn mt-2 ${currentTheme.primary}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPreviewMode ? <Edit size={18} className="mr-2" /> : <Eye size={18} className="mr-2" />}
                  {isPreviewMode ? 'Edit' : 'Preview'}
                </motion.button>

                <motion.button
                  onClick={saveNote}
                  className={`btn mt-2 bg-green-600`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save size={18} className="mr-2" />
                  Save
                </motion.button>

                {noteOwnerId === currentUserId && (
                  <motion.button
                    onClick={deleteNote}
                    className="btn mt-2 bg-red-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 size={18} className="mr-2" />
                    Delete
                  </motion.button>
                )}
                
                <motion.button
                  onClick={downloadNote}
                  className={`btn mt-2 bg-blue-600`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={18} className="mr-2" />
                  Download
                </motion.button>
              </div>

              {/* note taking area */}
              <AnimatePresence mode="wait">
                {isPreviewLoading ? (
                  <motion.div
                    key="loading"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="flex justify-center items-center h-[calc(100vh-300px)]"
                  >
                    <div className="flex flex-col text-center items-center">
                      <Loader className={`animate-spin h-12 w-12 ${currentTheme.text} mb-4`} />
                      <p className={`${currentTheme.text} text-lg font-semibold`}>Loading preview...</p>
                    </div>
                  </motion.div>
                ) : isPreviewMode ? (
                  <motion.div
                    // ref={previewRef}
                    key="preview"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={`preview-text ${darkMode ? 'prose-invert bg-gray-800' : 'bg-white'}`}
                    dangerouslySetInnerHTML={{ __html: marked(content) }}
                  />
                ) : (
                  <motion.textarea
                    key="edit"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`text-area ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                  />
                )}
              </AnimatePresence>

              <div className="mt-6">
                <h3 className={`${currentTheme.text}`}>Share this note</h3>
                <AddContributor
                  type="note"
                  id={noteId}
                  onShare={() => setRefresh(prev => !prev)}
                />
              </div>
              <div className="mt-6">
                <h3 className={`${currentTheme.text}`}>Collaborators</h3>
                <div className="flex flex-wrap gap-2">
                  {collaborators.map((collaborator) => (
                    collaborator && collaborator.email ? (
                      <div key={collaborator.id} className="px-4 py-2 rounded-md bg-gray-300 text-gray-700">
                        {collaborator.email}
                      </div>
                    ) : (
                      <div key={collaborator.id} className="px-4 py-2 rounded-md bg-red-300 text-red-700">
                        Invalid collaborator data
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}