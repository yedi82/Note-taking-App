import { AnimatePresence, motion } from "framer-motion";
import { Calendar, FileText, Loader, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import Header from "../components/Header";
import SideBar from "../components/SideBar";
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SharedNotes() {
  const [isSidebarOpen] = useState(false);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [message] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode, currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSharedNotes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${API_URL}/notes/shared`, {
          headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true'  },
        });
        const data = await response.json();
        if (response.ok) {
          setSharedNotes(data);
        } else {
          throw new Error(data.error || "Failed to fetch shared notes");
        }
      } catch (error) {
        console.error("Error fetching shared notes:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedNotes();
  }, []);

  const filteredSharedNotes = sharedNotes.filter(note =>
    note.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Header islanding={false}/>

      <div className="flex flex-1">
        <SideBar isOpen={isSidebarOpen}/>

        <main className="flex-1 p-6">
          <h1 className={`${currentTheme.text}`}>
            Shared Notes
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

          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-center mb-4 ${
                message.includes("Error") ? "text-red-500" : "text-green-500"
              }`}
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
          ) : filteredSharedNotes.length > 0 ? (
            <AnimatePresence>
              {filteredSharedNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`note ${darkMode ? "bg-gray-800" : "bg-white"}`}
                >
                  <Link
                    to={
                      note.folder_id
                        ? `/folders/${note.folder_id}/note/${note.id}`
                        : `/notes/${note.id}`
                    }
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <FileText
                        size={24}
                        className={`${currentTheme.text} mr-4`}
                      />
                      <div>
                        <h2
                          className={`text-lg font-semibold ${currentTheme.text}`}
                        >
                          {note.name}
                        </h2>
                        {note.owner && (
                          <p
                            className={`text-sm flex items-center ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            <User size={14} className="mr-1" />
                            Shared by: {note.owner}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-sm flex items-center ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <Calendar size={14} className="mr-1" />
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <p
              className={`text-center ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No shared notes found.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

export default SharedNotes;
