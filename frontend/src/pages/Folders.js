import { AnimatePresence, motion } from "framer-motion";
import {File, Folder, Plus, Trash2, Loader} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../App.css';
import { useTheme } from "../ThemeContext";
import Header from "../components/Header";
import SideBar from "../components/SideBar";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Folders() {
  const [isSidebarOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newNoteName, setNewNoteName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { darkMode, currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);


  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  useEffect(() => {
    fetchCategories(); // Fetch categories on mount
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true'  };

        const [userResponse, foldersResponse, notesResponse] =
          await Promise.all([
            fetch(`${API_URL}/users/me`, { headers }),
            fetch(`${API_URL}/folders`, { headers }),
            fetch(`${API_URL}/notes/standalone`, { headers }),
          ]);

        const userData = await userResponse.json();
        const foldersData = await foldersResponse.json();
        const notesData = await notesResponse.json();

        if (userResponse.ok) {
          setCurrentUserId(userData.id);
        } else {
          throw new Error(userData.error || "Failed to fetch user data");
        }

        if (foldersResponse.ok) {
          setFolders(foldersData);
        } else {
          throw new Error(foldersData.error || "Failed to fetch folders");
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
  }, []);

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      setMessage("Folder name cannot be empty");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      console.log(selectedCategory)
      const response = await fetch(`${API_URL}/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ name: newFolderName, category_id: selectedCategory || null }),
      });

      const data = await response.json();
      if (response.ok) {
        setFolders((prevFolders) => [...prevFolders, data]);
        setNewFolderName("");
        setMessage("Folder created successfully!");
      } else {
        throw new Error(data.error || "Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      setMessage(error.message);
    }
  };

  const createNote = async () => {
    console.log(selectedCategory)
    console.log(newNoteName)
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
        body: JSON.stringify({ name: newNoteName, content: "", category_id: selectedCategory || null}),
      });

      const data = await response.json();
      if (response.ok) {
        setNotes((prevNotes) => [...prevNotes, data]);
        setNewNoteName("");
        setMessage("Standalone note created successfully!");
      } else {
        throw new Error(data.error || "Failed to create note");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      setMessage(error.message);
    }
  };

  const deleteFolder = async (folderId) => {
    if (!window.confirm("Are you sure you want to delete this folder?")) return;

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/folders/${folderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        },
      });

      if (response.ok) {
        setFolders((prevFolders) =>
          prevFolders.filter((folder) => folder.id !== folderId)
        );
        setMessage("Folder deleted successfully!");
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete folder");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      setMessage(error.message);
    }
  };

  const filteredFolders = folders.filter((folder) => {
    const category = categories.find(cat => cat.id === folder.category_id);
    const categoryName = category ? category.name.toLowerCase() : '';

    return (
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.includes(searchTerm.toLowerCase())
    );
  });

  const filteredNotes = notes.filter((note) => {
    const category = categories.find(cat => cat.id === note.category_id);
    const categoryName = category ? category.name.toLowerCase() : '';
    return (
      note.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      //(!selectedCategory || note.category_id === selectedCategory)
      categoryName.includes(searchTerm.toLowerCase())
      //(note.category_id && note.category_id.toString().includes(searchTerm))
    );
  });


  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      setMessage("Category name cannot be empty");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/categories/add-category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Category added successfully!");
        setCategories((prevCategories) => [...prevCategories, data]); // Update state
        setNewCategoryName("");
      } else {
        throw new Error(data.error || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      setMessage(error.message);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
    >
      <Header islanding={false}/>

      <div className="flex flex-1">
        <SideBar isOpen={isSidebarOpen} />

        <main className="flex-1 p-6">
          <h1 className={`mb-4 ${currentTheme.text}`}>
            My Notes
          </h1>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search folders or notes"
            className={`input mb-4 ${darkMode ? "bg-gray-800 text-white" : ""}`}
          />

          <div className="grid gap-7 md:grid-cols-2">
            <div>
              <h3 className={`mb-2 ${currentTheme.text}`}>
                Create New Folder
              </h3>
              <div className="flex">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder name"
                  className={`flex-1 input ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
                />
                <motion.button
                  onClick={createFolder}
                  className={`btn ml-4 ${currentTheme.primary}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={18} className="mr-2" />
                  Create Folder
              </motion.button>
              </div>
            </div>

            <div>
              <h3 className={`mb-2 ${currentTheme.text}`}>
                Create New Note
              </h3>
              <div className="flex">
                <input
                  type="text"
                  value={newNoteName}
                  onChange={(e) => setNewNoteName(e.target.value)}
                  placeholder="New note name"
                  className={`flex-1 input ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
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
            </div>
          </div>

          {message && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-center mt-4 ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}
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
          ) : (
            <div>
              <h2 className={`mt-4 ${currentTheme.text}`}>
                Folders
              </h2>

              {filteredFolders.length > 0 ? (
                <div className="folders-grid">
                  <AnimatePresence>
                    {filteredFolders.map((folder) => (
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
                        {folder.user_id === currentUserId && (
                          <motion.button
                            onClick={() => deleteFolder(folder.id)}
                            className="trash"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <p
                  className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  No folders available.
                </p>
              )}

              <h2 className={`mt-4 ${currentTheme.text}`}>
                Standalone Notes
              </h2>
              {filteredNotes.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredNotes.map((note) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`note ${darkMode ? "bg-gray-800" : "bg-white"}`}
                      >
                        <Link
                          to={`/notes/${note.id}`}
                          className="flex items-center"
                        >
                          <File
                            size={24}
                            className={`${currentTheme.text} mr-4`}
                          />
                          <div>
                            <h3 className={`${currentTheme.text}`}>
                              {note.name}
                            </h3>
                            <p
                              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                              {new Date(note.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <p
                  className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  No standalone notes available.
                </p>
              )}
            </div>
          )}

          <div className="flex">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className={`flex-1 input mt-4 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
            />
            <motion.button
              onClick={addCategory}
              className={`btn ml-4 mt-4 ${currentTheme.primary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} className="mr-2" />
              Add Category
            </motion.button>
          </div>
          <div className="mt-6">
            <div className="flex">
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value === "" ? null : e.target.value)}
                className="select"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <br/>
          <div>
            <h5>
              create a category, select it in the list, then the next note or folder you create will have that category.
            </h5>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Folders;