/*********************************************************************************
 * WEB422 – Assignment 1* I declare that this assignment is my own work in accordance 
 * with Seneca Academic Policy. No part of this assignment has been copied 
 * manually or electronically from any other source* (including web sites) 
 * or distributed to other students.*
 * * Name: ____Luqman_Dirie_____ Student ID: ____108737222_____ Date: ___1/19/2024____
 * * Cyclic Link: _________https://ill-jay-kilt.cyclic.app____________
 * *********************************************************************************/

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path'); // Add this line

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, ''))); // Add this line

const MoviesDB = require('./modules/moviesDB');
const moviesDB = new MoviesDB();

const PORT = process.env.PORT || 8080;

moviesDB.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    console.log('Database connection successful!');

    app.get('/', (req, res) => {
      res.json({ message: "API Listening" });
    });

    app.listen(PORT, () => {
      console.log(`server listening on: ${PORT}.`);
    });
  })
  .catch((err) => {
    console.log('Database connection failed:', err);
  });

app.post('/api/movies', async (req, res) => {
    try {
        const newMovie = await moviesDB.addNewMovie(req.body);
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.get('/api/movies', async (req, res) => {
    const { page, perPage, title } = req.query;
    try {
        const movies = await moviesDB.getAllMovies(parseInt(page), parseInt(perPage), title);
        res.status(200).json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
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