import { AnimatePresence, motion } from 'framer-motion';
import { Clock, FileText, Folder, Menu, Share2, X } from 'lucide-react';
import React, { useEffect, useState, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const SideBar = () => {
  const location = useLocation();
  const { darkMode, currentTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const sidebarItems = [
    { path: '/dashboard', label: 'Recently used', icon: Clock },
    { path: '/folders', label: 'My notes', icon: FileText },
    { path: '/shared-folders', label: 'Shared Folders', icon: Folder },
    { path: '/shared-notes', label: 'Shared Notes', icon: Share2 },
    { path: '/templates', label: 'Templates', icon: FileText }
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const sidebarContent = (
    <div>
      <nav className="space-y-2 mb-6">
        {sidebarItems.map((item) => (
          <Link key={item.path} to={item.path} onClick={() => isMobile && setIsOpen(false)}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`sidebar-btn ${location.pathname === item.path
                ? `${currentTheme.primary} text-white`
                : `${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`
                }`}
            >
              <item.icon className="sidebar-icon" />
              {item.label}
            </motion.button>
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <div>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`open-sidebar ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}
      <AnimatePresence>
        {(!isMobile || (isMobile && isOpen)) && (
          <motion.aside
            initial={isMobile ? { x: -300, opacity: 0 } : { opacity: 0 }}
            animate={isMobile ? { x: 0, opacity: 1 } : { opacity: 1 }}
            exit={isMobile ? { x: -300, opacity: 0 } : { opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`${isMobile? 'sidebar-mobile' : ''}  ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(SideBar);
