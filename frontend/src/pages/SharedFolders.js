import { AnimatePresence, motion } from "framer-motion";
import { Folder, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import Header from "../components/Header";
import SideBar from "../components/SideBar";
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SharedFolders() {
  const [isSidebarOpen] = useState(false);
  const [sharedFolders, setSharedFolders] = useState([]);
  const [message] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode, currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSharedFolders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${API_URL}/folders/shared`, {
          headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true'  },
        });
        const data = await response.json();
        if (response.ok) {
          setSharedFolders(data);
        } else {
          throw new Error(data.error || "Failed to fetch shared folders");
        }
      } catch (error) {
        console.error("Error fetching shared folders:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedFolders();
  }, []);

  const filteredSharedFolders = sharedFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Header islanding={false}/>

      <div className="flex flex-1">
        <SideBar isOpen={isSidebarOpen} />
        
        <main className="flex-1 p-6">
          <h1 className={`${currentTheme.text}`}>
            Shared Folders
          </h1>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shared folders"
            className={`input mb-4 ${darkMode ? "bg-gray-800 text-white" : ""}`}
          />

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
          ) : filteredSharedFolders.length > 0 ? (
            <div className="folders-grid">
              <AnimatePresence>
                {filteredSharedFolders.map((folder) => (
                  <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`folder ${darkMode ? "bg-gray-800" : "bg-white"}`}
                  >
                    <Link
                      to={`/folders/${folder.id}`}
                      className="flex flex-col items-center"
                    >
                      <Folder size={48} className={currentTheme.text} />
                      <p className={`text-center mt-2 ${currentTheme.text}`}>
                        {folder.name}
                      </p>
                    </Link>

                    {folder.owner && (
                      <p
                        className={`text-sm mt-2 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Shared by: {folder.owner}
                      </p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <p
              className={`text-center ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No shared folders found.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

export default SharedFolders;
