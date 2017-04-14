var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');

// display list of all genres
exports.genre_list = function (req, res, next) {

    Genre.find()
        .sort([['name', 'ascending']])
        .exec(function (err, list_genres) {
            if (err) { return next(err) }
            //success
            res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
        });

};

///dispaly detail page for a specicfin genre
exports.genre_detail = function (req, res, next) {

    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.params.id })
                .sort([['title', 'ascending']])
                .exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err) }
        //success
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
    })

};

// display genre create form on GET
exports.genre_create_get = function (req, res, next) {
    res.render('genre_form', { title: 'Create Genre' });
};

// handle genre create form on POST
exports.genre_create_post = function (req, res, next) {
    //check that the name field is not empty
    req.checkBody('name', 'Genre name required').notEmpty();
    //trim and expape the name field (does not work if you chain them)
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    //run the validators
    var errors = req.validationErrors();
    //create a genre object with excapted and triemem data
    var genre = new Genre({ name: req.body.name });
    if (errors) {
        //if there are errors, render the form again passing the previously entered datums
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors });
        return;
    }
    else {
        //data from form is valid
        // check if gnere with same name already exists
        Genre.findOne({ 'name': req.body.name })
            .exec(function (err, found_genre) {
                //console.log('found_genre: ' + found_genre);
                if (err) { return next(err); }
                if (found_genre) {
                    //genere exists redierct to detail page
                    res.redirect(found_genre.url);
                }
                else {
                    genre.save(function (err) {
                        if (err) { return next(err); }
                        //genere saved redirect to detail pge
                        res.redirect(genre.url);
                    });
                }
            })
    }
};

// display genre delete form on GET
exports.genre_delete_get = function (req, res, next) {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.params.id })
                .sort([['title', 'ascending']])
                .exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err) }
        //success
        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
    })
};

// handle genre delete form on POST
exports.genre_delete_post = function (req, res, next) {
    req.checkBody('genreid', 'Genre Id is required.').notEmpty();
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.body.genreid).exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.body.genreid }, 'title summary').exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.genre_books.length > 0) {
            //genre has books. render in same way as get route.
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
            return;
        }
        else {
            // genre has no books; delete object and redirect to list of genres
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                if (err) { return next(err); }
                res.redirect('/catalog/genres');
            });
        }
    })
};

// display genre update form on GET
exports.genre_update_get = function (req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    Genre.findById(req.params.id)
        .exec(function (err, genre) {
            if (err) { return next(err); }
            // successful, so render
            res.render('genre_form', { title: 'Update Genre', genre: genre })
        });
};

// handle genre update form on POST
exports.genre_update_post = function (req, res, next) {
    req.checkBody('name', 'Genre name must not be empty.').notEmpty();
    //sanitize
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    
    var genre = new Genre({
        name: req.body.name,
        _id: req.params.id//THIS IS REQUIRED OR A NEW ID WILL BE ASSIGNED!
    });

    var errors = req.validationErrors();

    if(errors){
        //rerender the damn formr!
        res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors })
    }
    else {
        // data from form isvalid; udpate the rekkid
        Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, thegenre) {
            if (err) { return next(err); }
            //subbeed!
            res.redirect(thegenre.url);
        });
    }
};

