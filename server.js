// Require necessary NPM packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize express application
const app = express();

// Enable CORS for all requests
app.use(cors());

// Enable parsing of json bodies in requests
app.use(express.json());

// Require the MoviesDB module
const MoviesDB = require('./modules/moviesDB');
const moviesDB = new MoviesDB();

// Define PORT
const PORT = process.env.PORT || 8080;

// Initialize the MoviesDB instance and start the server if successful
moviesDB.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    console.log('Database connection successful!');

    // Define a simple route to get started
    app.get('/', (req, res) => {
      res.json({ message: "API Listening" });
    });

    // Start listening for requests after a successful database connection
    app.listen(PORT, () => {
      console.log(`server listening on: ${PORT}.`);
    });
  })
  .catch((err) => {
    console.log('Database connection failed:', err);
  });

  // POST route to add a new movie
app.post('/api/movies', async (req, res) => {
    try {
        const newMovie = await moviesDB.addNewMovie(req.body);
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET route to retrieve movies with optional pagination and title filtering
app.get('/api/movies', async (req, res) => {
    const { page, perPage, title } = req.query;
    try {
        const movies = await moviesDB.getAllMovies(parseInt(page), parseInt(perPage), title);
        res.status(200).json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET route to retrieve a single movie by id
app.get('/api/movies/:id', async (req, res) => {
    try {
        const movie = await moviesDB.getMovieById(req.params.id);
        if (movie) {
            res.status(200).json(movie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT route to update a movie by id
app.put('/api/movies/:id', async (req, res) => {
    try {
        const updateResult = await moviesDB.updateMovieById(req.body, req.params.id);
        if (updateResult.modifiedCount === 1) {
            res.status(200).json({ message: 'Movie updated successfully' });
        } else {
            res.status(404).json({ message: 'Movie not found or no changes made' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE route to delete a movie by id
app.delete('/api/movies/:id', async (req, res) => {
    try {
        const deleteResult = await moviesDB.deleteMovieById(req.params.id);
        if (deleteResult.deletedCount === 1) {
            res.status(200).json({ message: 'Movie deleted successfully' });
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});