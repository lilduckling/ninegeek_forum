import React, { useState, useEffect } from "react";
import api from "./api";
import nineBallImage from "./images/9-ball.jpg"; 

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [threads, setThreads] = useState([]);
    const [newThread, setNewThread] = useState({ title: "", content: "", author: "" });
    const [selectedThread, setSelectedThread] = useState(null); // Current thread
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        if (isLoggedIn) fetchThreads();
    }, [isLoggedIn]);

    const fetchThreads = async () => {
        try {
            const response = await api.get("/threads");
            setThreads(response.data);
        } catch (error) {
            console.error("Error fetching threads:", error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await api.post("/users/login", { username });
            setIsLoggedIn(true);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const handleSubmitThread = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/threads", { ...newThread, author: username });
            setThreads([...threads, response.data]);
            setNewThread({ title: "", content: "" });
        } catch (error) {
            console.error("Error creating thread:", error);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/threads/${selectedThread.id}/comments`, {
                author: username,
                content: newComment,
            });
            setSelectedThread({
                ...selectedThread,
                comments: [...selectedThread.comments, response.data],
            });
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

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
                    {threads.map((thread) => (
                        <button
                            key={thread.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => setSelectedThread(thread)}
                        >
                            <h5>{thread.title}</h5>
                            <p>{thread.content}</p>
                            <small className="text-muted">Posted by: {thread.author}</small>
                        </button>
                    ))}
                </div>
            </div>

            {selectedThread && (
                <div className="mt-5">
                    <h2>Comments for: {selectedThread.title}</h2>
                    <form onSubmit={handleSubmitComment} className="mt-3">
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

                    <div className="mt-3">
                        {selectedThread.comments?.length > 0 ? (
                            selectedThread.comments.map((comment) => (
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
                </div>
            )}
        </div>
    );
}

export default App;
