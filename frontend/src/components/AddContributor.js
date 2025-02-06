import { AnimatePresence, motion } from 'framer-motion';
import debounce from 'lodash.debounce';
import { Check, Loader, Search, UserPlus, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../ThemeContext';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function AddContributor({ type, id, onShare }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { darkMode, currentTheme } = useTheme();
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
        if (!isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setSelectedUser(null);
            setMessage('');
            setMessageType('');
        }
    };

    const debouncedSearch = useCallback(
        debounce(async (query) => {
            if (query.length === 0) {
                setSearchResults([]);
                setIsLoading(false);
                return;
            }

            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true'  }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                } else {
                    const errorData = await response.json();
                    console.error('Error searching users:', errorData.error);
                }
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    const handleSearch = (e) => {
        const query = e.target.value.trim();
        setSearchQuery(query);
        setIsLoading(true);
        debouncedSearch(query);
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setMessage('');
        setMessageType('');
    };

    const handleAddContributor = async () => {
        if (!selectedUser) {
            setMessage('Please select a user to add');
            setMessageType('error');
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            const endpoint = type === 'folder' ? `/folders/${id}/share` : `/notes/${id}/share`;

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true' 
                },
                body: JSON.stringify({ collab_user_emails: [selectedUser.email] })
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Contributor added successfully!');
                setMessageType('success');
                setSearchQuery('');
                setSearchResults([]);
                setSelectedUser(null);
                onShare && onShare();
            } else {
                console.error('Error adding contributor:', data.error);
                setMessage(data.error || 'Failed to add contributor');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error adding contributor:', error);
            setMessage('Error adding contributor');
            setMessageType('error');
        }
    };

    return (
        <div className="mt-4">
            <motion.button
                onClick={toggleOpen}
                className={`btn ${currentTheme.primary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? (
                    <>
                        <X size={18} className="mr-2" />
                        Cancel
                    </>
                ) : (
                    <>
                        <UserPlus size={18} className="mr-2" />
                        {`Add a contributor to ${type}`}
                    </>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`add-contributor ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search by email..."
                                className={`input ${darkMode
                                        ? 'bg-gray-700 text-white placeholder-gray-400'
                                        : 'bg-gray-100 text-gray-900 placeholder-gray-500'}`}
                            />
                            <Search className={`search ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>

                        {isLoading && (
                            <div className="mt-2 flex items-center justify-center">
                                <Loader className={`animate-spin h-5 w-5 ${currentTheme.text}`} />
                                <span className="ml-2 text-sm">Searching...</span>
                            </div>
                        )}

                        <ul className="mt-2 max-h-40 overflow-y-auto">
                            <AnimatePresence>
                                {searchResults.map(user => (
                                    <motion.li
                                        key={user.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => handleSelectUser(user)}
                                        className={`list-item ${selectedUser && selectedUser.id === user.id
                                                ? `${currentTheme.primary} text-white`
                                                : darkMode
                                                    ? 'hover:bg-gray-700'
                                                    : 'hover:bg-gray-200'
                                                }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="font-semibold">{user.username}</span>
                                            <span className="ml-2 text-sm opacity-75">{user.email}</span>
                                            {selectedUser && selectedUser.id === user.id && (
                                                <Check className="ml-auto h-5 w-5" />
                                            )}
                                        </div>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                            {!isLoading && searchQuery.length > 0 && searchResults.length === 0 && (
                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No users found</p>
                            )}
                        </ul>

                        <motion.button
                            onClick={handleAddContributor}
                            disabled={!selectedUser}
                            className={`contributor-btn ${selectedUser
                                    ? `${currentTheme.primary} text-white hover:bg-opacity-90`
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            whileHover={selectedUser ? { scale: 1.05 } : {}}
                            whileTap={selectedUser ? { scale: 0.95 } : {}}
                        >
                            Add Contributor
                        </motion.button>

                        <AnimatePresence>
                            {message && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className={`mt-2 text-sm ${messageType === 'success' ? 'text-green-500' : 'text-red-500'
                                        }`}
                                >
                                    {message}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AddContributor;