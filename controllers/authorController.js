var Author = require('../models/author');
var Book = require('../models/book');
var async = require('async')

// display list of all authors
exports.author_list = function (req, res, next) {

    Author.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_authors) {
            if (err) { return next(err) }
            //success
            res.render('author_list', { title: 'Author List', author_list: list_authors });
        });

};

///dispaly detail page for a specicfin author
exports.author_detail = function (req, res, next) {

    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id)
                .exec(callback)
        },
        authors_books: function (callback) {
            Book.find({ 'author': req.params.id }, 'title summary')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        //succele
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books });
    })

};

// display author create form on GET
exports.author_create_get = function (req, res, next) {
    res.render('author_form', { title: 'Create Author' });
};

// handle author create form on POST
exports.author_create_post = function (req, res, next) {
    //check
    req.checkBody('first_name', 'First name must be specified.').notEmpty();
    req.checkBody('family_name', 'Last name must be specified').notEmpty();
    req.checkBody('family_name', 'Last name must be alphanumeric text.').isAlpha();
    req.checkBody('date_of_birth', 'Invalid date.').optional({ checkFalsy: true }).isDate();
    req.checkBody('date_of_death', 'Invalid date.').optional({ checkFalsy: true }).isDate();
    //sanitize
    req.sanitize('first_name').escape();
    req.sanitize('first_name').trim();
    req.sanitize('family_name').escape();
    req.sanitize('family_name').trim();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();

    var errors = req.validationErrors();

    var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
    });

    if (errors) {
        res.render('author_form', { titl: 'Create Author', author: author, errors: errors });
        return;
    }
    else {
        // datea is validationErrors
        author.save(function (err) {
            if (err) { return next(err); }
            res.redirect(author.url);
        })
    }
};

// display author delete form on GET
exports.author_delete_get = function (req, res, next) {
    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id).exec(callback);
        },
        author_books: function (callback) {
            Book.find({ 'author': req.params.id }).exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.author_books });
    });
};

// handle author delete form on POST
exports.author_delete_post = function (req, res, next) {
    req.checkBody('authorid', 'Author id must exist.').notEmpty();
    async.parallel({
        author: function (callback) {
            Author.findById(req.body.authorid).exec(callback);
        },
        author_books: function (callback) {
            Book.find({ 'author': req.body.authorid }, 'title summary').exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.author_books.length > 0) {
            //author has books. render in same way as get route.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.author_books });
            return;
        }
        else {
            // author has no books; delete object and redirect to list of authors
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                res.redirect('/catalog/authors');
            });
        }
    });
};

// display author update form on GET
exports.author_update_get = function (req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    Author.findById(req.params.id)
        .exec(function (err, author) {
            if (err) { return next(err); }
            // successful, so render
            console.log(author);
            res.render('author_form', { title: 'Update Author', author: author })
        });
};

// handle author update form on POST
exports.author_update_post = function (req, res, next) {
    req.checkBody('first_name', 'First name must not be empty.').notEmpty();
    req.checkBody('family_name', 'Last name must not be empty.').notEmpty();
    req.checkBody('family_name', 'Last name must be alphanumeric text.').isAlpha();
    req.checkBody('date_of_birth', 'Invalid date.').optional({ checkFalsy: true }).isDate();
    req.checkBody('date_of_death', 'Invalid date.').optional({ checkFalsy: true }).isDate();
    //sanitize
    req.sanitize('first_name').escape();
    req.sanitize('first_name').trim();
    req.sanitize('family_name').escape();
    req.sanitize('family_name').trim();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();
    
    var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id//THIS IS REQUIRED OR A NEW ID WILL BE ASSIGNED!
    });

    var errors = req.validationErrors();

    if(errors){
        //rerender the damn formr!
        res.render('author_form', { title: 'Update Author', author: author, errors: errors })
    }
    else {
        // data from form isvalid; udpate the rekkid
        Author.findByIdAndUpdate(req.params.id, author, {}, function (err, theauthor) {
            if (err) { return next(err); }
            //subbeed!
            res.redirect(theauthor.url);
        });
    }
};

