import { Shield, Sun, Users, Zap } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import Header from '../components/Header';
import Footer from "../components/Footer";
import '../App.css';

function Landing() {

    const navigate = useNavigate();
    const { darkMode, currentTheme } = useTheme();


    const features = [
        { icon: <Zap className="h-6 w-6" />, title: 'Lightning Fast', description: 'Instant note-taking and retrieval for maximum productivity.' },
        { icon: <Shield className="h-6 w-6" />, title: 'Secure', description: 'Your notes are encrypted and protected with industry-leading security.' },
        { icon: <Users className="h-6 w-6" />, title: 'Collaborative', description: 'Share and collaborate on notes with your team in real-time.' },
        { icon: <Sun className="h-6 w-6" />, title: 'Toggle Mode', description: 'Switch to dark/light mode for a comfortable note-taking experience.' },
    ];
    const testimonials = [
        { name: 'Alex Johnson', role: 'Product Manager', content: 'Marker has revolutionized the way our team collaborates on projects. It\'s an indispensable tool for us.' },
        { name: 'Sarah Lee', role: 'Freelance Writer', content: 'As a writer, I need a reliable place to store my ideas. Marker is my go-to app for all my note-taking needs.' },
        { name: 'Michael Chen', role: 'Student', content: 'Marker has been a game-changer for my studies. It helps me organize my thoughts and ace my exams.' },
    ];

    return (
        <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
            <Header islanding={true}/>

            <main className={`flex-grow transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                    <div className="text-center">
                        <h1 className={`text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl`}>
                            <span className="block">Capture Your Thoughts</span>
                            <span className={`block ${currentTheme.text}`}>Anywhere, Anytime</span>
                        </h1>
                        <p className={`p-landing ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Marker helps you organize your ideas, boost productivity, and never forget a thing.
                            Start taking smarter notes today.
                        </p>
                        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                            <div className="rounded-md shadow">
                                <motion.button
                                    onClick={() => navigate("/signup")}
                                    className={`btn ${currentTheme.primary}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Get started
                                </motion.button>
                            </div>
                            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                                <motion.button
                                    onClick={() => navigate("/features")}
                                    className={`btn ${currentTheme.primary}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Learn more
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className={`py-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:text-center">
                            <h2 className={`emphasis-landing text-${currentTheme.text.split('-')[1]}`}>Features</h2>
                            <p className="h2-landing">
                                A better way to take notes
                            </p>
                            <p className={`p-landing ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Marker provides all the tools you need to capture, organize, and share your ideas effectively.
                            </p>
                        </div>

                        <div className="mt-10">
                            <dl className="feature-grid">
                                {features.map((feature) => (
                                    <div key={feature.title} className="relative">
                                        <dt>
                                            <div className={`feature-icon ${currentTheme.primary}`}>
                                                {feature.icon}
                                            </div>
                                            <p className="feature-title">{feature.title}</p>
                                        </dt>
                                        <dd className={`feature-text ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{feature.description}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:text-center">
                        <h2 className="h2-landing">
                            Loved by users everywhere
                        </h2>
                        <div className="mt-10">
                            <div className="testimonial-grid">
                                {testimonials.map((testimonial, index) => (
                                    <div key={index} className={`p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                        <p className={`testimonial-text ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>"{testimonial.content}"</p>
                                        <div className="mt-4">
                                            <p className={`testimonial-name ${currentTheme.text}`}>{testimonial.name}</p>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={`py-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-xl overflow-hidden`}>
                            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
                                <div>
                                    <h2 className={`h2-landing ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <span className="block">Ready to dive in?</span>
                                        <span className={`block ${currentTheme.text}`}>Start taking notes for free today.</span>
                                    </h2>
                                    <p className={`p-landing ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Join thousands of satisfied users who have transformed their note-taking experience with Marker.
                                    </p>
                                </div>
                                <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                                    <div className="inline-flex rounded-md shadow">
                                        <motion.button
                                            onClick={() => navigate("/signup")}
                                            className={`btn ${currentTheme.primary}`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Get started
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Landing;