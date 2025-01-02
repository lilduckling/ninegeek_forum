import React, { useState, useEffect } from "react";
import api from "./api";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
    const [username, setUsername] = useState(""); // Store logged-in user's name
    const [threads, setThreads] = useState([]);
    const [newThread, setNewThread] = useState({ title: "", content: "", author: "" });

    // Fetch threads from backend
    useEffect(() => {
        if (isLoggedIn) {
            const fetchThreads = async () => {
                try {
                    const response = await api.get("/threads");
                    setThreads(response.data);
                } catch (error) {
                    console.error("Error fetching threads:", error);
                }
            };
            fetchThreads();
        }
    }, [isLoggedIn]);

    // Handle Login Submission
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/users/login", { username });
            console.log(response.data.message);
            setIsLoggedIn(true); // Set login state to true
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    // Handle new thread submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/threads", { ...newThread, author: username });
            setThreads([...threads, response.data]);
            setNewThread({ title: "", content: "", author: "" }); // Reset form
        } catch (error) {
            console.error("Error creating thread:", error);
        }
    };

    if (!isLoggedIn) {
        // Render Login Page if not logged in
        return (
            <div>
                <h1>Login to Ninegeek</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
            </div>
        );
    }

    // Render Threads Page if logged in
    return (
        <div>
            <h1>Welcome to Ninegeek</h1>
            <h2>Create a Thread</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Content"
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                    required
                />
                <button type="submit">Post Thread</button>
            </form>

            <h2>Threads</h2>
            {threads.length === 0 ? (
                <p>No threads available.</p>
            ) : (
                threads.map((thread) => (
                    <div key={thread.id}>
                        <h3>{thread.title}</h3>
                        <p>{thread.content}</p>
                        <p><strong>Author:</strong> {thread.author}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default App;
