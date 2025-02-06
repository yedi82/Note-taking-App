import { AnimatePresence, motion } from "framer-motion";
import {Calendar, FileText, Loader, Plus, Trash2,} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import '../App.css';
import { useTheme } from "../ThemeContext";
import AddContributor from "../components/AddContributor";
import Header from "../components/Header";
import SideBar from "../components/SideBar";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Files() {
  const { folderId } = useParams();
  const [folderName, setFolderName] = useState(""); // New state for folder name
  const [notes, setNotes] = useState([]);
  const [newNoteName, setNewNoteName] = useState("");
  const [message, setMessage] = useState("");
  const [isSidebarOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { darkMode, currentTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true'  };

        // Fetch user data, folder details, and notes simultaneously
        const [userResponse, folderResponse, notesResponse] = await Promise.all([
          fetch(`${API_URL}/users/me`, { headers }),
          fetch(`${API_URL}/folders/${folderId}`, { headers }), // Fetch folder details
          fetch(`${API_URL}/folders/${folderId}/notes`, { headers }),
        ]);

        const userData = await userResponse.json();
        const folderData = await folderResponse.json(); // Folder data
        const notesData = await notesResponse.json();

        if (userResponse.ok) {
          setCurrentUserId(userData.id);
        } else {
          throw new Error(userData.error || "Failed to fetch user data");
        }

        if (folderResponse.ok) {
          setFolderName(folderData.name); // Set folder name
        } else {
          throw new Error(folderData.error || "Failed to fetch folder data");
        }

        if (notesResponse.ok) {
          setNotes(notesData);
        } else {
          throw new Error(notesData.error || "Failed to fetch notes");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [folderId, refresh]);

  const deleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        },
      });

      if (response.ok) {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
        setMessage("Note deleted successfully!");
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      setMessage(error.message);
    }
  };

  const createNote = async () => {
    if (!newNoteName.trim()) {
      setMessage("Note name cannot be empty");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({
          name: newNoteName,
          folder_id: folderId,
          content: "",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setNotes((prevNotes) => [...prevNotes, data]);
        setNewNoteName("");
        setMessage("Note created successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        throw new Error(data.error || "Failed to create note");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      setMessage(error.message);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <Header islanding={false} />

      <div className="flex flex-1">
        <SideBar isOpen={isSidebarOpen} />
        
        <main className="flex-1 p-6">
          <h1 className={`mb-4 ${currentTheme.text}`}>
            Notes in {folderName}:
          </h1>

          <div className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={`input ${darkMode ? "bg-gray-800 text-white" : ""}`}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex mb-4">
              <input
                type="text"
                value={newNoteName}
                onChange={(e) => setNewNoteName(e.target.value)}
                placeholder="New note name"
                className={`input flex-1 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
              />

              <motion.button
                onClick={createNote}
                className={`btn ml-4 ${currentTheme.primary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} className="mr-2" />
                Create Note
              </motion.button>
            </div>

            <AddContributor
              type="folder"
              id={folderId}
              onShare={() => setRefresh((prev) => !prev)}
            />
          </div>

          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-center mb-4 ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}
            >
              {message}
            </motion.p>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader
                className={`animate-spin h-12 w-12 ${currentTheme.text}`}
              />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center mt-4">{error}</p>
          ) : filteredNotes.length > 0 ? (
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`note ${darkMode ? "bg-gray-800" : "bg-white"}`}
                >
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/folders/${folderId}/note/${note.id}`}
                      className="flex items-center"
                    >
                      <FileText
                        size={24}
                        className={`${currentTheme.text} mr-4`}
                      />
                      <div>
                        <h3
                          className={`${currentTheme.text}`}
                        >
                          {note.name}
                        </h3>
                        <p
                          className={`text-sm flex items-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          <Calendar size={14} className="mr-1" />
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    {note.user_id === currentUserId && (
                      <motion.button
                        onClick={() => deleteNote(note.id)}
                        className="trash"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <p
              className={`text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              No notes found in this folder.
            </p>
          )}
        </main>
      </div >
    </div >
  );
}

export default Files;
