var BookInstance = require('../models/bookInstance');
var Book = require('../models/book');
var async = require('async');

// display list of all BookInstances
exports.bookinstance_list = function (req, res, next) {

    BookInstance.find()
        .populate('book')
        //.sort([['book.title', 'ascending']])
        .exec(function (err, list_bookinstances) {
            if (err) { return next(err); }
            //successful, so render
            res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        });

};

///dispaly detail page for a specicfin bookinstance
exports.bookinstance_detail = function (req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) { return next(err) }
            res.render('bookinstance_detail', { title: 'Book:', bookinstance: bookinstance });
        });
};

// display bookinstance create form on GET
exports.bookinstance_create_get = function (req, res, next) {
    Book.find({}, 'title')
        .exec(function (err, books) {
            if (err) { return next(err); }
            res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books });
        })
};

// handle bookinstance create form on POST
exports.bookinstance_create_post = function (req, res, next) {
    //validate
    req.checkBody('book', 'Book must be specified.').notEmpty();
    req.checkBody('imprint', 'Imprint must be specified.').notEmpty();
    req.checkBody('due_back', 'Invalid date.').optional({ checkFalsy: true }).isDate();
    //sanitize
    req.sanitize('book').escape();
    req.sanitize('book').trim();
    req.sanitize('imprint').escape();
    req.sanitize('imprint').trim();
    req.sanitize('status').escape();
    req.sanitize('status').trim();
    req.sanitize('due_back').toDate();
    //save
    var bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
    });
    var errors = req.validationErrors();
    if (errors) {
        Book.find({}, 'title')
            .exec(function (err, books) {
                if (err) { return next(err); }
                res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, errors: errors });
            });
        return;
    } else {
        //valid form
        bookinstance.save(function (err) {
            if (err) { return next(err); }
            res.redirect(bookinstance.url);
        })
    }
};

// display bookinstance delete form on GET
exports.bookinstance_delete_get = function (req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) { return next(err) }
            res.render('bookinstance_delete', { title: 'Delete Copy', bookinstance: bookinstance });
        });
};

// handle bookinstance delete form on POST
exports.bookinstance_delete_post = function (req, res, next) {
    req.checkBody('bookinstanceid', 'Book Instance id must exist.').notEmpty();
    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
        if (err) { return next(err); }
        res.redirect('/catalog/bookinstances');
    });
};

// display bookinstance update form on GET
exports.bookinstance_update_get = function (req, res, next) {
    req.sanitize('id').escape();
    req.sanitize('id').trim();
    async.parallel({
        bookinstance: function (callback) {
            BookInstance.findById(req.params.id)
                .populate('book')
                .exec(callback);
        },
        book_list: function(callback){
             Book.find({}, 'title').exec(callback);
        },
    }, function(err, results){
        if(err) {return next(err);}
        res.render(
            'bookinstance_form',
            {
                title: 'Update Copy',
                bookinstance: results.bookinstance,
                book_list: results.book_list
            }
        );
    });
};

// handle bookinstance update form on POST
exports.bookinstance_update_post = function (req, res, next) {
    //check
    req.checkBody('book', 'Book must not be empty.').notEmpty();
    req.checkBody('imprint', 'Imprint must not be empty.').notEmpty();
    req.checkBody('due_back', 'Invalid date.').optional({ checkFalsy: true }).isDate();
    req.checkBody('status', 'Status must not be empty.').notEmpty();
    //sanitize
    req.sanitize('book').escape();
    req.sanitize('imprint').escape();
    req.sanitize('imprint').trim();
    req.sanitize('due_back').toDate();
    req.sanitize('status').escape();
    req.sanitize('status').trim();
    
    var bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        due_back: req.body.due_back,
        status: req.body.status,
        _id: req.params.id//THIS IS REQUIRED OR A NEW ID WILL BE ASSIGNED!
    });

    var errors = req.validationErrors();

    if(errors){
        //rerender the damn formr!
        //res.render('bookinstance_form', { title: 'Update Copy', bookinstance: bookinstance, errors: errors })

        Book.find({}, 'title')
            .exec(function (err, book_list) {
                if(err){return next(err);}
                res.render('bookinstance_form', {title: 'Update Copy', bookinstance: bookinstance, book_list: book_list, errors: errors});
            });

    }
    else {
        // data from form isvalid; udpate the rekkid
        BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, thebookinstance) {
            if (err) { return next(err); }
            //subbeed!
            res.redirect(thebookinstance.url);
        });
    }
};

