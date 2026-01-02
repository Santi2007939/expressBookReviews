const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    const found = users.find((user) => user.username === username);
    return found;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    const user = users.filter((userF) => userF.username === username);
    return user[0].password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const user = req.body.user;
  const pwd = req.body.pwd;
  if (!user) {
    return res.status(404).json({message: "Body Empty"});
  }
  if (!isValid(user)) {
    return res.status(404).json({message: "Username doesn't exist"});
  }
  if (!authenticatedUser(user, pwd)) {
    return res.status(404).json({message: "Invalid credentials"});
  }

  let accessToken = jwt.sign({
    data: user
  }, 'access', {expiresIn: 60 * 60});

  req.session.authorization = {
    accessToken
  }

  return res.status(200).send("User successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
  
    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }
  
    if (!req.session.authorization) {
      return res.status(401).json({ message: "Not logged in" });
    }
  
    let username;
    try {
      const token = req.session.authorization.accessToken;
      const decoded = jwt.verify(token, "access");
      username = decoded.data;
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const book = Object.values(books).find(book => book.isbn === isbn);
    if (!book) return res.status(404).json({message: "Book not found"});

    book.reviews[username] = review;

    return res.status(200).json({message: "Review added/updated successfully"});
});

regd_users.delete("/auth/review/:isbn", (req,res) => {
    const isbn = req.params.isbn;
  
    if (!req.session.authorization) {
      return res.status(401).json({ message: "Not logged in" });
    }
  
    let username;
    try {
      const token = req.session.authorization.accessToken;
      const decoded = jwt.verify(token, "access");
      username = decoded.data;
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const book = Object.values(books).find(book => book.isbn === isbn);
    if (!book) return res.status(404).json({message: "Book not found"});

    const finded = username in book.reviews;
    if (finded) {
        delete book.reviews[username];
        return res.status(200).json({message: "Your review has been deleted."});
    }
    return res.status(404).json({message: "You don't have a review for this book."});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
