const express = require('express')
const path = require('path')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')
const app = express()
const compression = require('compression')

// CORS middleware
app.use(cors())

// Compression
app.use(compression())

// Set the view engine to EJS
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Serve static files
app.use(express.static(path.join(__dirname, 'public')))

// Define routes
app.get('/', (req, res) => {
    res.render('index')
});

// Add a route for the favicon
app.get('/favicon.ico', (req, res) => res.status(204))

app.use('/api', createProxyMiddleware({
    target: 'http://api.jolpi.ca',
    changeOrigin: true,
    pathRewrite: {
        '^/api': ''
    }
}))

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});