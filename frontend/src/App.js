import React, { useState, useEffect } from "react";
import api from "./api";
import nineBallImage from "./images/9-ball.jpg";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [threads, setThreads] = useState([]); 
    const [newThread, setNewThread] = useState({ title: "", content: "" });
    const [newComment, setNewComment] = useState("");
    
    // Fetch threads and their comments on load
    useEffect(() => {
        if (isLoggedIn) fetchThreads();
    }, [isLoggedIn]);

    // Fetch all threads and their comments
    const fetchThreads = async () => {
        try {
            const response = await api.get("/threads");
            const threadsData = response.data || [];

            // Fetch comments for each thread and add them to the thread object
            const threadsWithComments = await Promise.all(
                threadsData.map(async (thread) => {
                    try {
                        const commentsResponse = await api.get(`/threads/${thread.id}/comments`);
                        return { ...thread, comments: commentsResponse.data || [] };
                    } catch (error) {
                        console.error(`Error fetching comments for thread ${thread.id}:`, error);
                        return { ...thread, comments: [] };
                    }
                })
            );

            setThreads(threadsWithComments);
        } catch (error) {
            console.error("Error fetching threads:", error);
            setThreads([]); // Fallback to empty array on failure
        }
    };

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await api.post("/users/login", { username });
            setIsLoggedIn(true);
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please try again.");
        }
    };

    // Submit a new thread
    const handleSubmitThread = async (e) => {
        e.preventDefault();
        if (!newThread.title || !newThread.content) {
            alert("Thread title and content cannot be empty.");
            return;
        }

        try {
            const response = await api.post("/threads", { 
                title: newThread.title, 
                content: newThread.content, 
                author: username 
            });
            setThreads([...threads, { ...response.data, comments: [] }]);
            setNewThread({ title: "", content: "" });
        } catch (error) {
            console.error("Error creating thread:", error);
            alert("Failed to create thread. Please try again.");
        }
    };

    // Submit a new comment
    const handleSubmitComment = async (threadId, e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert("Comment cannot be empty.");
            return;
        }

        try {
            const response = await api.post(`/threads/${threadId}/comments`, {
                author: username,
                content: newComment,
            });

            // Update the threads list with the new comment
            setThreads((prevThreads) =>
                prevThreads.map((thread) =>
                    thread.id === threadId
                        ? { ...thread, comments: [...(thread.comments || []), response.data] }
                        : thread
                )
            );

            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Failed to add comment. Please try again.");
        }
    };

    // If user is not logged in, show login form
    if (!isLoggedIn) {
        return (
            <div className="container mt-5">
                <h1 className="text-center">Welcome to Ninegeek</h1>
                <form onSubmit={handleLogin} className="mt-4">
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <button className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="d-flex align-items-center justify-content-center mt-4">
                <img
                    src={nineBallImage}
                    alt="9-Ball Logo"
                    style={{ width: "50px", height: "50px", marginRight: "10px" }}
                />
                <h1>Ninegeek Forum</h1>
            </div>

            <div className="mt-4">
                <h2>Create a Thread</h2>
                <form onSubmit={handleSubmitThread} className="mt-3">
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Thread title"
                            value={newThread.title}
                            onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <textarea
                            className="form-control"
                            placeholder="Thread content"
                            rows="3"
                            value={newThread.content}
                            onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    <button className="btn btn-success w-100">Post Thread</button>
                </form>
            </div>

            <div className="mt-5">
                <h2>Threads</h2>
                <div className="list-group mt-3">
                    {threads.length > 0 ? (
                        threads.map((thread) => (
                            <div key={thread.id} className="list-group-item">
                                <h5>{thread.title}</h5>
                                <p>{thread.content}</p>
                                <small className="text-muted">Posted by: {thread.author}</small>

                                <div className="mt-3">
                                    <h6>Comments:</h6>
                                    {thread.comments.length > 0 ? (
                                        thread.comments.map((comment) => (
                                            <div key={comment.id} className="card mb-2">
                                                <div className="card-body">
                                                    <p className="card-text">{comment.content}</p>
                                                    <small className="text-muted">- {comment.author}</small>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No comments yet.</p>
                                    )}
                                </div>

                                <form onSubmit={(e) => handleSubmitComment(thread.id, e)} className="mt-3">
                                    <div className="mb-3">
                                        <textarea
                                            className="form-control"
                                            placeholder="Add a comment"
                                            rows="2"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <button className="btn btn-primary w-100">Post Comment</button>
                                </form>
                            </div>
                        ))
                    ) : (
                        <p>No threads available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
