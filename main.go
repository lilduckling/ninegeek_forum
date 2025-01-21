package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
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

var db *sql.DB

// Connect to PostgreSQL database
func setupDatabase() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	connStr := fmt.Sprintf(
		"user=%s password=%s dbname=%s host=%s port=%s sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
	)

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatalf("Database not reachable: %v", err)
	}

	fmt.Println("Successfully connected to PostgreSQL")
}

func main() {
	setupDatabase()
	defer db.Close()

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
			log.Printf("Invalid thread input: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
	
		err := db.QueryRow(
			"INSERT INTO threads (title, content, author) VALUES ($1, $2, $3) RETURNING id",
			newThread.Title, newThread.Content, newThread.Author,
		).Scan(&newThread.ID)
	
		if err != nil {
			log.Printf("Error inserting thread: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create thread"})
			return
		}
	
		c.JSON(http.StatusCreated, newThread)
	})
	
	

	// Get all threads
	r.GET("/threads", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, title, content, author FROM threads")
		if err != nil {
			log.Printf("Error fetching threads: %v", err)
			c.JSON(500, gin.H{"error": "Failed to fetch threads"})
			return
		}
		defer rows.Close()
	
		var threads []Thread
		for rows.Next() {
			var thread Thread
			if err := rows.Scan(&thread.ID, &thread.Title, &thread.Content, &thread.Author); err != nil {
				log.Printf("Error scanning thread row: %v", err)
				c.JSON(500, gin.H{"error": "Failed to scan thread"})
				return
			}
			threads = append(threads, thread)
		}
		c.JSON(200, threads)
	})
	

	// Get a single thread by ID
	r.GET("/threads/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
			return
		}

		var thread Thread
		err = db.QueryRow("SELECT id, title, content, author FROM threads WHERE id = $1", id).
			Scan(&thread.ID, &thread.Title, &thread.Content, &thread.Author)

		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Thread not found"})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch thread"})
			return
		}

		c.JSON(http.StatusOK, thread)
	})

	// Add a comment to a thread
	r.POST("/threads/:id/comments", func(c *gin.Context) {
		threadID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			log.Printf("Invalid thread ID: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
			return
		}
	
		var newComment Comment
		if err := c.ShouldBindJSON(&newComment); err != nil {
			log.Printf("Invalid comment input: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
	
		err = db.QueryRow(
			"INSERT INTO comments (thread_id, content, author) VALUES ($1, $2, $3) RETURNING id",
			threadID, newComment.Content, newComment.Author,
		).Scan(&newComment.ID)
	
		if err != nil {
			log.Printf("Error inserting comment: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add comment"})
			return
		}
	
		c.JSON(http.StatusCreated, newComment)
	})
	
	

	// Fetch all comments for a thread
	r.GET("/threads/:id/comments", func(c *gin.Context) {
		threadID := c.Param("id")
	
		rows, err := db.Query("SELECT id, content, author FROM comments WHERE thread_id = $1", threadID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch comments"})
			return
		}
		defer rows.Close()
	
		var comments []Comment
		for rows.Next() {
			var comment Comment
			if err := rows.Scan(&comment.ID, &comment.Content, &comment.Author); err != nil {
				c.JSON(500, gin.H{"error": "Failed to scan comment"})
				return
			}
			comments = append(comments, comment)
		}
		c.JSON(200, comments)
	})
	
	r.Run(":8080")
}
