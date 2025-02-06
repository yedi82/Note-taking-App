import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Edit3, Lock, Moon, Palette, Share2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import Header from '../components/Header';

const FeatureCard = ({ icon: Icon, title, description }) => {
    const { darkMode, currentTheme } = useTheme();

    return (
        <motion.div
            className={`p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Icon className={`w-12 h-12 mb-4 ${currentTheme.text}`} />
            <h3 className={`text-xl font-semibold mb-2 ${currentTheme.text}`}>{title}</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
        </motion.div>
    );
};

const Features = () => {
    const { darkMode, currentTheme } = useTheme();
    const navigate = useNavigate();

    const features = [
        {
            icon: Edit3,
            title: 'Rich Text Editing',
            description: 'Create and edit notes with our powerful rich text editor, supporting formatting, lists, and more.'
        },
        {
            icon: Share2,
            title: 'Collaboration',
            description: 'Share your notes and collaborate in real-time with team members or friends.'
        },
        {
            icon: Moon,
            title: 'Dark Mode',
            description: 'Easy on the eyes, our dark mode ensures comfortable usage in low-light environments.'
        },
        {
            icon: Palette,
            title: 'Customizable Themes',
            description: 'Personalize your experience with a variety of color themes to suit your style.'
        },
        {
            icon: Lock,
            title: 'Secure Encryption',
            description: 'Your notes are protected with end-to-end encryption, ensuring your data remains private.'
        },
        {
            icon: CheckCircle,
            title: 'Task Management',
            description: 'Turn your notes into actionable tasks with our integrated to-do list feature.'
        }
    ];

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <Header islanding={true}/>

            <div className="container mx-auto px-4 py-16">
                <motion.button
                    onClick={() => navigate("/")}
                    className={`btn ${currentTheme.primary}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Main
                </motion.button>

                <motion.h1
                    className={`${currentTheme.text}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Our Features
                </motion.h1>

                <motion.h3
                    className={`mb-6 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Discover the powerful features that make Marker the ultimate note-taking and productivity tool
                </motion.h3>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <FeatureCard {...feature} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;