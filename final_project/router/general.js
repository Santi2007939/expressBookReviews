const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
    let username = req.query.username;
    let password = req.query.password;

    if (!username) {
        return res.status(202).send("No name provided");
    }
    if (!password) {
        return res.status(202).send("No password provided");
    }

    let userFinded = users.filter((user) => user.username === username);
    if (userFinded.length > 0) {
        return res.status(202).send("The username already exists");
    }

    users.push({
        "username": username,
        "password": password
    });
    return res.status(200).send(`${username}'s account has been registered`);
});



// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
    const getBooks = new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("No books found");
        }
    });

    getBooks.then(
        (bookList) => {
            res.status(200).send(bookList);
        }
    ).catch(
        (error) => {
            res.status(500).send({message: error});
        }
    );
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    const getBook = new Promise((resolve, reject) => {
        const isbn = req.params.isbn;
        const book = Object.values(books).find(book => book.isbn === isbn);

        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }

    });

    getBook.then((book) => {
        res.status(200).send(book);
    }).catch((error) => {
        res.status(500).send({message:error});
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
        const author = req.params.author.toLowerCase();
        let author_Books = Object.values(books).filter((book) => book.author.toLowerCase() === author);
        if (author_Books) {
            resolve(author_Books);
        } else {
            reject("No books found");
        }
    });

    getBooks.then(
        (bookList) => {
            res.status(200).send(bookList);
        }
    ).catch(
        (error) => {
            res.status(500).send({message: error});
        }
    );
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
        const title = req.params.title.toLowerCase();
        let bookFound = Object.values(books).filter((book) => book.title.toLowerCase() === title);

        if (bookFound) {
            resolve(bookFound[0]);
        } else {
            reject("No books found");
        }
    });

    getBooks.then(
        (bookFound) => {
            res.status(200).send(bookFound);
        }
    ).catch(
        (error) => {
            res.status(500).send({message: error});
        }
    );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    //Write your code here
    const isbn = req.params.isbn;
    let book = {};
    let encontrado = false;
    Object.values(books).forEach((bookF) => {
        if (bookF.isbn === isbn) {
            book = bookF;
            encontrado = true;
        }
    });

    if (encontrado) {
        return res.status(200).send(book.reviews);
    }
    return res.status(202).send("Book not finded");
});

module.exports.general = public_users;
