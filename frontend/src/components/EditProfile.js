import { AnimatePresence, motion } from "framer-motion";
import { Camera, CheckCircle, Pen, Save, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useUser } from "../UserContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Main component for editing the user's profile
export default function EditProfile({ onClose }) {
  // Local state to manage user data, edit modes, active tab, loading status, and notifications
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    avatar: "",
  });
  const [editMode, setEditMode] = useState({ username: false, email: false });
  // Keeps track of active tabs
  const [activeTab, setActiveTab] = useState("profile");
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  // For showing notification
  const [notification, setNotification] = useState(null);

  // Obtain themes and modes
  const { darkMode, currentTheme, setCurrentTheme, themes } = useTheme();
  const { updateAvatarUrl } = useUser();
  const navigate = useNavigate();


  useEffect(() => {
    fetchUserData();
    // Disable scrolling
    document.body.style.overflow = "hidden";
    return () => {
      // Re-enable scrolling
      document.body.style.overflow = "auto";
    };
  }, []);

  // Fetch user data from the API
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Getting the user's token from session storage
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");
      const data = await response.json();
      setUserData({
        username: data.username,
        email: data.email,
        avatar: data.avatar_url
          ? `${API_URL}${data.avatar_url}`
          // Fallback avatar
          : "https://via.placeholder.com/150",
      });
    } catch (err) {
      // Error notification
      setNotification({
        type: "error",
        message: "Failed to load user data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle changes in input fields
  const handleInputChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggling edit mode
  const toggleEditMode = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Function to handle profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/me`, {
        // Sending a PUT request
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          'ngrok-skip-browser-warning': 'true'
        },
        // This sends the updated username
        body: JSON.stringify({ username: userData.username }),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      setNotification({
        type: "success",
        message: "Profile updated successfully!",
      });
      onClose();
    } catch (err) {
      // Error notification
      setNotification({
        type: "error",
        message: "Failed to update profile. Please try again.",
      });
    } finally {
      // Stops loading
      setIsLoading(false);
    }
  };


  // Handle profile deletion with user confirmation
  const handleDeleteProfile = () => {
    setNotification({
      // Confirmation prompt
      type: "confirmation",
      message: "Are you sure you want to delete your profile?",
      onConfirm: async () => {
        try {
          const token = sessionStorage.getItem("token");
          const response = await fetch(`${API_URL}/auth/delete-user`, {
            // Sending a DELETE request
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
          });
          if (response.ok) {
            setNotification({
              type: "success",
              message: "Your account has been deleted.",
            });
            // Clear the token from session storage
            sessionStorage.removeItem("token");
            setTimeout(() => navigate("/"), 1500);
          } else {
            setNotification({
              type: "error",
              message: "Failed to delete account.",
            });
          }
        } catch (error) {
          setNotification({
            type: "error",
            message: "Error deleting account. Please try again.",
          });
        }
      },
    });
  };

  // Handling avatar change
  const handleAvatarChange = async (e) => {
    // Obtains the input from file
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/upload-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload avatar");
      const data = await response.json();
      //This updates the URL
      const newAvatarUrl = `${API_URL}${data.avatarUrl}`;
      setUserData((prev) => ({ ...prev, avatar: newAvatarUrl }));
      //This will update the avatar globally
      updateAvatarUrl(newAvatarUrl);
      setNotification({
        type: "success",
        message: "Avatar updated successfully!",
      });
    } catch (err) {
      setNotification({
        type: "error",
        message: "Failed to update avatar. Please try again.",
      });
    }
  };

  // Nothing will happen if it is loading
  if (isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        className={`w-11/12 max-w-lg p-6 rounded-lg relative ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${darkMode
            ? "text-gray-400 hover:text-white"
            : "text-gray-500 hover:text-gray-700"
            }`}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className={`mb-6 text-xl font-semibold ${currentTheme.text}`}>
          Edit Profile
        </h2>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300 dark:border-gray-600">
          <div className="flex space-x-4">
            {["Profile", "Preferences"].map((tab) => (
              <button
                key={tab.toLowerCase()}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`pb-2 ${activeTab === tab.toLowerCase()
                  ? `border-b-2 ${currentTheme.primary} text-${currentTheme.text}`
                  : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.form
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSaveProfile}
              className="space-y-6"
            >
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={userData.avatar}
                  alt="Avatar Preview"
                  className="w-32 h-32 rounded-full object-cover"
                />

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatarInput"
                  />
                  <label
                    htmlFor="avatarInput"
                    className={`cursor-pointer btn ${currentTheme.primary} hover:bg-opacity-90`}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Change Avatar
                  </label>
                </div>
              </div>

              {/* Username and Email Fields */}
              <div className="space-y-4">
                {/* Username */}
                <div className="relative">
                  <label htmlFor="username" className="block mb-1">
                    Username
                  </label>
                  <div className="flex items-center">
                    <input
                      id="username"
                      type="text"
                      value={userData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      disabled={!editMode.username}
                      className={`w-full px-3 py-2 border rounded ${darkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleEditMode("username")}
                      className={`ml-2 p-2 rounded ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                        }`}
                      aria-label="Edit Username"
                    >
                      <Pen className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Email - Not Editable */}
                <div className="relative">
                  <label htmlFor="email" className="block mb-1">
                    Email
                  </label>
                  <div className="flex items-center">
                    <input
                      id="email"
                      type="email"
                      value={userData.email}
                      disabled
                      className={`w-full px-3 py-2 border rounded ${darkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                        }`}
                    />
                  </div>
                </div>
              </div>

              {/* Save Profile Button */}
              <motion.button
                type="submit"
                className={`btn w-full ${currentTheme.primary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-5 h-5 mr-2" /> Save Profile
              </motion.button>


              {/* Delete Profile Button */}
              <motion.button
                type="button"
                onClick={handleDeleteProfile}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-5 h-5 mr-2" /> Delete Profile
              </motion.button>
            </motion.form>
          )}

          {activeTab === "preferences" && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Theme</label>
                  <div className="flex flex-wrap gap-4">
                    {themes.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => setCurrentTheme(theme)}
                        className={`theme-chooser flex items-center justify-center w-12 h-12 rounded-full ${currentTheme.name === theme.name
                          ? `ring-2 ring-offset-2 ${theme.primary}`
                          : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        aria-label={`Select ${theme.name} theme`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full ${theme.primary}`}
                        ></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Component */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
            onConfirm={notification.onConfirm}
            darkMode={darkMode}
          />
        )}
      </motion.div>
    </div>
  );
}

// Notification component used for displaying messages
function Notification({ type, message, onClose, onConfirm, darkMode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-60">
      <div
        className={`notification p-4 rounded-lg shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
      >
        <div className="flex items-start">
          {type === "success" && (
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
          )}
          {type === "error" && <X className="w-6 h-6 text-red-500 mr-2" />}
          <div className="flex-1">
            <p
              className={`notification-text ${type === "error" ? "text-red-500" : "text-green-500"
                }`}
            >
              {message}
            </p>
          </div>
          <button onClick={onClose} className="ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {type === "confirmation" && (
          <div className="mt-4 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded ${darkMode
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-red-700 text-white hover:bg-red-800"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
