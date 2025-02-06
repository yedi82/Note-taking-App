import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    //const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const username = localStorage.getItem("username") || "User";
    const initials = username.substring(0, 2);

    // Initialize avatarUrl from localStorage or default
    const [avatarUrl, setAvatarUrl] = useState(
        localStorage.getItem("avatarUrl") ||
        `https://api.dicebear.com/6.x/initials/svg?seed=${initials}&backgroundColor=ff6347&textColor=ffffff`
    );

    useEffect(() => {
        // Sync with localStorage to persist data
        localStorage.setItem("avatarUrl", avatarUrl);
    }, [avatarUrl]);

    const updateAvatarUrl = (url) => {
        setAvatarUrl(url);
        localStorage.setItem("avatarUrl", url);
    };

    return (
        <UserContext.Provider value={{ avatarUrl, updateAvatarUrl }}>
            {children}
        </UserContext.Provider>
    );
};
