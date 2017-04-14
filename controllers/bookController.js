var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookInstance');

var async = require('async');

exports.index = function (req, res, next) {

    async.parallel({
        book_count: function (callback) {
            Book.count(callback);
        },
        book_instance_count: function (callback) {
            BookInstance.count(callback);
        },
        book_instance_available_count: function (callback) {
            BookInstance.count({ status: 'Available' }, callback);
        },
        author_count: function (callback) {
            Author.count(callback);
        },
        genre_count: function (callback) {
            Genre.count(callback);
        },
    }, function (err, results) {
        //console.log(results);
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });

};

// display list of all books
exports.book_list = function (req, res, next) {

    Book.find({}, 'title author ')
        .populate('author')
        .sort([['title', 'ascending']])
        .exec(function (err, list_books) {
            if (err) { return next(err); }
            // successful, so render
            res.render('book_list', { title: 'Book List', book_list: list_books })
        });
};

///dispaly detail page for a specicfin book
exports.book_detail = function (req, res, next) {

    async.parallel({
        book: function (callback) {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        book_instance: function (callback) {
            BookInstance.find({ 'book': req.params.id })
                //.populate('book)
                .exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        //successed!
        res.render('book_detail', { title: 'Book Detail', book: results.book, book_instances: results.book_instance });
    });

};

// display book create form on GET
exports.book_create_get = function (req, res, next) {
    // get authors and genres to populate pulldowns
    async.parallel({
        authors: function (callback) {
            Author.find(callback);
        },
        genres: function (callback) {
            Genre.find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });
};

// handle book create form on POST
exports.book_create_post = function (req, res, next) {
    //validate
    req.checkBody('title', 'Title must not be empty.').notEmpty();
    req.checkBody('author', 'Author must not be empty.').notEmpty();
    req.checkBody('summary', 'Summary must not be empty.').notEmpty();
    req.checkBody('isbn', 'ISBN must not be empty.').notEmpty();
    //sanit
    req.sanitize('title').escape();
    req.sanitize('title').trim();
    req.sanitize('author').escape();
    req.sanitize('author').trim();
    req.sanitize('summary').escape();
    req.sanitize('summary').trim();
    req.sanitize('isbn').escape();
    req.sanitize('isbn').trim();
    req.sanitize('genre').escape();

    var book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre.split(','),
    });

    //console.log('BOOK: ' + book);

    var errors = req.validationErrors();
    if (errors) {
        // some problems re-erender the boooook
        //get all the authors and generer for from
        async.parallel({
            authors: function (callback) {
                Author.find(callback);
            },
            genres: function (callback) {
                Genre.find(callback);
            },
        }, function (err, results) {
            if (err) { return next(err); }
            //mark our selected generes as checkecd
            for (i = 0; i < results.genres.length; i++) {
                if (book.genre.indexOf(results.genres[i]._id) > -1) {
                    //current genre is selected; set flag
                    results.genres[i].checked = 'true';
                }
            }
            res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors })
        });
    }
    else {
        // data balid
        // could gcheck if book exists but fuckit
        book.save(function (err) {
            if (err) { return next(err); }
            res.redirect(book.url);
        })
    }
};

// display book delete form on GET
exports.book_delete_get = function (req, res, next) {
    async.parallel({
        book: function (callback) {
            Book.findById(req.params.id).exec(callback);
        },
        book_instances: function (callback) {
            BookInstance.find({ 'book': req.params.id }).exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_instances });
    });
};

// handle book delete form on POST
exports.book_delete_post = function (req, res, next) {
    req.checkBody('bookid', 'Book id must exist.').notEmpty();
    async.parallel({
        book: function (callback) {
            Book.findById(req.body.bookid).exec(callback);
        },
        book_instances: function (callback) {
            BookInstance.find({ 'book': req.body.bookid }).exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }

        if (results.book_instances.length > 0) {
            for (i in results.book_instances) {
                BookInstance.findByIdAndRemove(results.book_instances[i]._id, function deleteBookInstance(err) {
                    if (err) { return next(err); }
                    return next;
                });
            }
        }

        Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
            if (err) { return next(err); }
            res.redirect('/catalog/books');
        });

    });
};

// display book update form on GET
exports.book_update_get = function (req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    // get book, genres, and authors for form
    async.parallel({
        book: function (callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function (callback) {
            Author.find(callback);
        },
        genres: function (callback) {
            Genre.find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // mark our selected genres as beeing checkbinb
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                if (results.genres[all_g_iter]._id.toString() == results.book.genre[book_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked = 'true';
                }
            }
        }
        res.render(
            'book_form', {
                title: 'Update Book',
                authors: results.authors,
                genres: results.genres,
                book: results.book
            });
    });
};

// handle book update form on POST
exports.book_update_post = function (req, res, next) {
    //sanitize id passed in
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    //check other datums
    req.checkBody('title', 'Title must not be empty.').notEmpty();
    req.checkBody('author', 'Author must not be empty.').notEmpty();
    req.checkBody('summary', 'Summary must not be empty.').notEmpty();
    req.checkBody('isbn', 'ISBN must not be empty.').notEmpty();
    //more sanitizer
    req.sanitize('title').escape();
    req.sanitize('title').trim();
    req.sanitize('author').escape();
    req.sanitize('author').trim();
    req.sanitize('summary').escape();
    req.sanitize('summary').trim();
    req.sanitize('isbn').escape();
    req.sanitize('isbn').trim();
    req.sanitize('genre').escape();
    //bookit, dan-o!
    var book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre.split(','),
        _id: req.params.id//THIS IS REQUIRED OR A NEW ID WILL BE ASSIGNED!
    });
    var errors = req.validationErrors();
    if (errors) {
        //re-render book with error infors
        //get all authors and whatnots
        async.parallel({
            authors: function (callback) {
                Author.find(callback);
            },
            genres: function (callback) {
                Genre.find(callback);
            },
        }, function (err, results) {
            if (err) { return next(err); }
            // mark our selected genres as beeing checkbinb
            for (var i = 0; i < results.genres.length; i++) {
                if (book.genre.indexOf(results.genres[i]._id) > -1) {
                    results.genres[i].checked = 'true';
                }
            }
            res.render(
                'book_form', {
                    title: 'Update Book',
                    authors: results.authors,
                    genres: results.genres,
                    book: book,
                    errors: errors
                });
        });
    }
    else {
        // data from form isvalid; udpate the rekkid
        Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
            if (err) { return next(err); }
            //subbeed!
            res.redirect(thebook.url);
        });
    }
};

