import { ChevronRight, FileText, Folder } from 'lucide-react';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideBar from '../components/SideBar';
import { useTheme } from '../ThemeContext';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Dashboard() {
    const [isSidebarOpen] = useState(false);
    const [recentFolders, setRecentFolders] = useState([]);
    const [recentNotes, setRecentNotes] = useState([]);
    const [sortOrder, setSortOrder] = useState('DESC'); // New state for sort order
    const { darkMode, currentTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecentFolders = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/folders/recent?order=${sortOrder}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true'  }
                });
                const data = await response.json();
                if (response.ok) {
                    setRecentFolders(data);
                } else {
                    console.error('Error fetching folders:', data.error);
                }
            } catch (error) {
                console.error('Error fetching folders:', error);
            }
        };

        // Fetch recent notes
        const fetchRecentNotes = async () => {
            try {
                const token = sessionStorage.getItem('token');
                console.log('Token:', token);
                const response = await fetch(`${API_URL}/notes/recent?order=${sortOrder}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true'  }
                });
                const data = await response.json();
                if (response.ok) {
                    setRecentNotes(data);
                } else {
                    console.error('Error fetching notes:', data.error);
                }
            } catch (error) {
                console.error('Error fetching recent items:', error);
            }
        };

        fetchRecentFolders();
        fetchRecentNotes();
    }, [sortOrder]);

    // Handler for changing sort order
    const handleSortOrderChange = (event) => {
        setSortOrder(event.target.value);
    };

    return (
        <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <Header  islanding={false}/>

            <div className="flex flex-1">
                <SideBar isOpen={isSidebarOpen} />

                <main className="flex-1 p-6">
                    <h1 className={`${currentTheme.text}`}>Recently Used</h1>

                    {/*Dropdown for sorting order */}
                    <div className="mb-4">
                        <label htmlFor="sortOrder" className="mr-2">Sort Order:</label>
                        <select
                            id="sortOrder"
                            value={sortOrder}
                            onChange={handleSortOrderChange}
                            className="p-2 border rounded"
                        >
                            <option value="DESC">Descending</option>
                            <option value="ASC">Ascending</option>
                        </select>
                    </div>

                    <section className="mb-12">
                        <h2 className="mb-4">Notes</h2>
                        <div className="recently-used-grid">
                            {recentNotes.slice(0, 3).map(note => (
                                <Link to={`/folders/${note.folder_id}/note/${note.id}`} key={note.id} className={`grid-item ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
                                    <div className="flex items-center mb-2">
                                        <FileText className={`mr-2 ${currentTheme.text}`} />
                                        <h3 className="truncate">{note.name}</h3>
                                    </div>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                                        Last modified: {new Date(note.updatedAt).toLocaleString()}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="mb-4">Folders</h2>
                        <div className="recently-used-grid">
                            {recentFolders.slice(0, 3).map(folder => (
                                <Link to={`/folders/${folder.id}`} key={folder.id} className={`grid-item ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
                                    <div className="flex items-center mb-2">
                                        <Folder className={`mr-2 ${currentTheme.text}`} />
                                        <h3 className="truncate">{folder.name}</h3>
                                    </div>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {folder.noteCount || 0} notes
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-center">
                        <motion.button
                            onClick={() => navigate("/folders")}
                            className={`btn ${currentTheme.primary}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View More
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </motion.button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
