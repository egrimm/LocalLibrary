var express = require('express');
var router = express.Router();

// require controller modules
var book_controller = require('../controllers/bookController');
var author_controller = require('../controllers/authorController');
var genre_controller = require('../controllers/genreController');
var book_instance_controller = require('../controllers/bookInstanceController');

// BOOK ROUTES //
// GET catalog home page
router.get('/', book_controller.index);

// GET request for createing a book_controller
router.get('/book/create', book_controller.book_create_get);

// POST request for creating book
router.post('/book/create', book_controller.book_create_post);

// GET request to delte book
router.get('/book/:id/delete', book_controller.book_delete_get);

// PoST request to delte book
router.post('/book/:id/delete', book_controller.book_delete_post);

// GET request to update book
router.get('/book/:id/update', book_controller.book_update_get);

// PoST request to update book
router.post('/book/:id/update', book_controller.book_update_post);

// GET request for one book
router.get('/book/:id', book_controller.book_detail);

// GET request for list of all book items
router.get('/books', book_controller.book_list);

// AUTHOR ROUTES //

// GET request for createing a author_controller
router.get('/author/create', author_controller.author_create_get);

// POST request for creating author
router.post('/author/create', author_controller.author_create_post);

// GET request to delte author
router.get('/author/:id/delete', author_controller.author_delete_get);

// PoST request to delte author
router.post('/author/:id/delete', author_controller.author_delete_post);

// GET request to update author
router.get('/author/:id/update', author_controller.author_update_get);

// PoST request to update author
router.post('/author/:id/update', author_controller.author_update_post);

// GET request for one author
router.get('/author/:id', author_controller.author_detail);

// GET request for list of all author items
router.get('/authors', author_controller.author_list);

// GENRE ROUTES //

// GET request for createing a genre_controller
router.get('/genre/create', genre_controller.genre_create_get);

// POST request for creating genre
router.post('/genre/create', genre_controller.genre_create_post);

// GET request to delte genre
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// PoST request to delte genre
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET request to update genre
router.get('/genre/:id/update', genre_controller.genre_update_get);

// PoST request to update genre
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET request for one genre
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all genre items
router.get('/genres', genre_controller.genre_list);

// BOOKINSTANCE ROUTES //

// GET request for createing a book_instance_controller
router.get('/bookinstance/create', book_instance_controller.bookinstance_create_get);

// POST request for creating bookinstance
router.post('/bookinstance/create', book_instance_controller.bookinstance_create_post);

// GET request to delte bookinstance
router.get('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_get);

// PoST request to delte bookinstance
router.post('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_post);

// GET request to update bookinstance
router.get('/bookinstance/:id/update', book_instance_controller.bookinstance_update_get);

// PoST request to update bookinstance
router.post('/bookinstance/:id/update', book_instance_controller.bookinstance_update_post);

// GET request for one bookinstance
router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);

// GET request for list of all bookinstance items
router.get('/bookinstances', book_instance_controller.bookinstance_list);

module.exports = router;