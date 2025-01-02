package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// Thread structure
type Thread struct {
	ID      int       `json:"id"`
	Title   string    `json:"title" binding:"required"`
	Content string    `json:"content" binding:"required"`
	Author  string    `json:"author"`
	Comments []Comment `json:"comments"`
}

// Comment structure
type Comment struct {
	ID      int    `json:"id"`
	Author  string `json:"author" binding:"required"`
	Content string `json:"content" binding:"required"`
}

// In-memory store
var threads = []Thread{}
var nextThreadID = 1
var nextCommentID = 1

func main() {
	r := gin.Default()

	// Enable CORS
	r.Use(cors.Default())

	// User login route
	r.POST("/users/login", func(c *gin.Context) {
		var json struct {
			Username string `json:"username" binding:"required"`
		}

		if err := c.ShouldBindJSON(&json); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User logged in", "username": json.Username})
	})

	// Create a new thread
	r.POST("/threads", func(c *gin.Context) {
		var newThread Thread
		if err := c.ShouldBindJSON(&newThread); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		newThread.ID = nextThreadID
		nextThreadID++
		newThread.Comments = []Comment{}
		threads = append(threads, newThread)
		c.JSON(http.StatusCreated, newThread)
	})

	// Get all threads
	r.GET("/threads", func(c *gin.Context) {
		c.JSON(http.StatusOK, threads)
	})

	// Get a single thread by ID
	r.GET("/threads/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
			return
		}
		for _, thread := range threads {
			if thread.ID == id {
				c.JSON(http.StatusOK, thread)
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Thread not found"})
	})

	// Add a comment to a thread
	r.POST("/threads/:id/comments", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
			return
		}
		var newComment Comment
		if err := c.ShouldBindJSON(&newComment); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		newComment.ID = nextCommentID
		nextCommentID++

		for i, thread := range threads {
			if thread.ID == id {
				threads[i].Comments = append(threads[i].Comments, newComment)
				c.JSON(http.StatusCreated, newComment)
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Thread not found"})
	})

	// Fetch all comments for a thread
	r.GET("/threads/:id/comments", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
			return
		}
		for _, thread := range threads {
			if thread.ID == id {
				c.JSON(http.StatusOK, thread.Comments)
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Thread not found"})
	})

	r.Run(":8080")
}
