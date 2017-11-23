const express = require('express');
const router = express.Router();
const mysql = require('mysql');
var path = require('path');
const fs = require('fs');
const util = require('util');
var canvasDirectory = path.join(__dirname, '/../../canvasDirectory');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'drimdb'
});



var returnRouter = function (io) {
    router.get('likes/number', function (req, res) {
        if(req.session.username) {
            connection.query(`select count(which_user_liked) as noOfLikes from post_likes where whose_post_liked = '${req.sesssion.userid}' and seen_time = '0'`, function (error, result) {
                if(error) throw error;
                res.send({
                    noOfLikes: result[0].noOfLikes
                })
            });
        } else {
            res.send('unsuccessfull');
        }
    });

    return router
}
module.exports = returnRouter;
