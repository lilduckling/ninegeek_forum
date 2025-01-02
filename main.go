package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    // Define a test route
    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Welcome to Ninegeek!",
        })
    })

    // Start the server on http://localhost:8080
    r.Run(":8080")
}
