import React, { useState, useEffect } from "react";
import { ChevronDown, LogOut, Moon, Sun, User, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useUser } from "../UserContext";
import EditProfile from "./EditProfile";
import SideBar from "./SideBar";
import logo from "../resources/logo.png";
import '../App.css';

function Header({ islanding }) {
    const [showPopup, setShowPopup] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const { toggleDarkMode, darkMode, currentTheme } = useTheme();
    const navigate = useNavigate();

    const { avatarUrl } = useUser();

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    const togglePopup = () => setShowPopup(!showPopup);
    const toggleMobileSidebar = () => setShowMobileSidebar(!showMobileSidebar);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        window.location.href = "http://localhost:3000";
    };

    return (
        <div>
            <header className={`${darkMode ? 'bg-gray-800' : 'bg-[#5B83A6]'}`}>
                <div className="flex mx-auto px-1 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        {isMobile && !islanding && !showMobileSidebar && (
                            <button
                                onClick={toggleMobileSidebar}
                                className={`open-sidebar ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                        <Link to="/dashboard">
                            <img src={logo} alt="Logo" className="small-logo ml-6" />
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleDarkMode}
                            className={`dark-mode-btn ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {islanding ? (
                            <div className="relative">
                                <button onClick={() => navigate('/login')} className={`login-btn ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                    Log In
                                </button>
                                <button onClick={() => navigate('/signup')} className={`login-btn signup-btn ${currentTheme.primary}`}>
                                    Sign Up
                                </button>
                            </div>
                        ) : (
                        <div className="relative">
                            <button
                                onClick={togglePopup}
                                className="flex items-center"
                                aria-label="User menu"
                            >
                                <img
                                    src={avatarUrl}
                                    alt="User Avatar"
                                    className="header-avatar"
                                />
                                <ChevronDown className="mr-6" />
                            </button>
                            {showPopup && (
                                <div className={`profile-popup ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                    <button
                                        onClick={() => {
                                            setShowEditProfile(true);
                                            setShowPopup(false);
                                        }}
                                        className={`profile-popup-btn ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <User className="profile-popup-icon" />
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className={`profile-popup-btn ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <LogOut className="profile-popup-icon" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>
                {isMobile && showMobileSidebar && <SideBar />}
                {showEditProfile && <EditProfile onClose={() => setShowEditProfile(false)} />}
            </header>
        </div>
    );
}

export default Header;
