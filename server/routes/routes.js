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
  router.get('/', function (req, res) {
    if(req.session.username) {
      res.redirect('/wall');
    } else {
      res.render('index.hbs', {
        label: 'New User ?',
        signinSignupPageUrl: 'signup',
        urlContent: 'Sign Up'
      });

    }
  });
  router.get('/wall', function (req, res) {
    if(req.session.username) {
      res.render('wall.hbs', {
        username: req.session.username
      });
    } else {
      res.redirect('/');
    }
    // res.render('wall.hbs', {
    //   username: "demo"
    // });
  });
  router.get('/home', function (req, res) {
    res.redirect('/home/'+req.session.username);
  });
  router.get('/home/:username', function (req, res) {
    // res.render('home.hbs', {
    //   isUserSame: true,
    //   username: req.params.username
    // });
    if (req.session.username) {
      if(req.session.username == req.params.username) {
        //   console.log(req.session.userId);
        res.render('home.hbs', {
          isUserSame: true,
          username: req.params.username,
          anotherPersonUsername: req.params.username,
          userId: req.session.userid
        });
      } else {
        connection.query(`select * from users where username = '${req.params.username}'`, function (error, usersResult) {
          if(error) {
            throw error;
          }
          if(usersResult.length == 0) {
            res.redirect('/home/'+req.session.username);
          } else {
            connection.query(`select * from followers,users where users.username = '${req.params.username}' and users.user_id = followers.following_id and followers.follower_id = '${req.session.userid}' `, function (error, result) {
              if(error) throw error;
              if(result.length == 0) {
                //   console.log(usersResult[0].user_id);
                res.render('home.hbs', {
                  isUserSame: false,
                  username: req.session.username,
                  anotherPersonUsername: req.params.username,
                  followStatusButtonType: 'info',
                  followStatus: 'follow',
                  userId: usersResult[0].user_id
                });
              } else {
                //   console.log(usersResult[0].user_id);
                res.render('home.hbs', {
                  isUserSame: false,
                  username: req.session.username,
                  anotherPersonUsername: req.params.username,
                  followStatusButtonType: 'success',
                  followStatus: 'following',
                  userId: usersResult[0].user_id
                })
              }
            });
          }
        });
      }
    }
    else {
      res.redirect('/');
    }
  });
  router.get('/check-signin', function (req, res) {
    if(req.query.username && req.query.password) {
        // console.log(connection);
      connection.query(`select user_id, username, user_password from users where username ='${req.query.username}' and user_password ='${req.query.password}'`, function (error, result) {
          if(error){
              console.log(result);
              throw error;
          }
          else {
            if(result.length == 0) {
              res.send('Wrong credentials');
            } else if(result.length == 1) {
                req.session.username = result[0].username;
                req.session.userid = result[0].user_id;
                res.send("successfull");
            }
          }
        });
    } else {
      res.send('Wrong credentials');
    }
    // connection.query(`select user_id, username, user_password from users where username = '${req.query.username}' and user_password = '${req.query.password}'`, function (error, result) {
    //     if(error) throw error;
    //     console.log(result);
    //     res.send(result);
    // });
  });

  router.get('/logout', function (req, res) {
      if(req.session.username) {
        req.session.destroy(function(error){
          if(error) throw error;
        });
      }
      res.redirect('/');
  });
  // router.get('/messeges/differentchats', function (req, res) {
  //     if(req.session.username) {
  //         connection.query(`select chat_id, who_send, to_whom, chat_content, time_of_send, conversation_id, u2.username as who_send_username, u1.username as to_whom_username from chats, users u1, users u2 where chat_id in (select max(chat_id) from chats GROUP by conversation_id HAVING conversation_id in(select conversation_id from conversation_ids where user1 = '${req.session.userid}' or user2 = '${req.session.userid}')) and u1.user_id = chats.to_whom and u2.user_id = chats.who_send ORDER by time_of_send desc `, function (error, result) {
  //             if(error) throw error;
  //             var data = [];
  //             data.push(result.length);
  //             for( var i = 0 ; i < result.length ; i++ ) {
  //                 var anotherUserUserid;
  //                 var anotherUserUsername;
  //                 if(result[i].who_send == req.session.userid){
  //                     anotherUserUserid = result[i].to_whom;
  //                     anotherUserUsername = result[i].to_whom_username;
  //                 } else {
  //                     anotherUserUserid = result[i].who_send;
  //                     anotherUserUsername = result[i].who_send_username;
  //                 }
  //                 console.log(anotherUserUsername, anotherUserUserid);
  //                 data.push({
  //                     chatId: result[i].chat_id,
  //                     fromId: result[i].who_send,
  //                     fromUsername: result[i].who_send_username,
  //                     toId: result[i].to_whom,
  //                     toUsername: result[i].to_whom_username,
  //                     message: result[i].chat_content,
  //                     timeOfSend: result[i].time_of_send,
  //                     conversationId: result[i].conversation_id,
  //                     currentUserUsername: req.session.username,
  //                     currentUserUserid: req.session.userid,
  //                     anotherUserUsername: anotherUserUsername,
  //                     anotherUserUserid: anotherUserUserid
  //                 });
  //
  //             }
  //             res.send(data);
  //         });
  //     } else {
  //         res.send('unsuccessfull');
  //     }
  // });
  // router.get('/loadOldChat', function (req, res) {
  //     if(req.session.username) {
  //         if(req.query.conversationId && req.query.chatId) {
  //             connection.query(`select chat_id, who_send, u1.username as who_send_username, chats.to_whom, u2.username as to_whom_username, chats.time_of_send, chats.chat_content from chats, users u1, users u2 where conversation_id = '${req.query.conversationId}' and chats.who_send = u1.user_id and chats.to_whom = u2.user_id and chats.chat_id < ${req.query.chatId} ORDER by chats.time_of_send desc limit 25 `, function (req, res) {
  //                 if(error) throw error;
  //                 var dataToSend = [];
  //
  //             });
  //         } else {
  //             res.send('unsuccessfull');
  //         }
  //     } else {
  //         res.send('unsuccessfull');
  //     }
  // });
  router.get('/signup', function (req, res) {
    // give signup page.
    if(req.session.username) {
      res.redirect('/');
    } else {
      res.render('signup.hbs', {
        label: 'Already register',
        signinSignupPageUrl: '/',
        urlContent: 'Sign In'
      });
    }
  });
  router.post('/register-user', function (req, res) {
    var processLog = [];
    if(req.body.username && req.body.email && req.body.password) {
      req.body.email = req.body.email.toLowerCase();
      connection.query(`select * from users where username ='${req.body.username}' or user_email ='${req.body.email}'`,
      function (error, result) {
        if(error) throw error;
        else {
          if(result.length > 1) {
            processLog.push('username already registered');
            processLog.push('email already registered');
            res.send(processLog);
          } else if(result.length == 1) {
            processLog.push('either username or email already registered');
            res.send(processLog);
          } else {
            var currentTime = new Date().getTime();
            connection.query(`insert into users (username, user_email, user_password, joining_time) values ('${req.body.username}', '${req.body.email}', '${req.body.password}', '${currentTime}')`,
            function (error, result) {
              if(error) throw error;
              else {
                processLog.push('successfull');
                res.send(processLog);
              }
            });
          }
        }
      });
    } else {
      processLog.push('all entries not valid');
      processLog.push('unsuccessfull');
      res.send(processLog);
    }
  });
  router.post('/new-post', function (req, res) {
      if(req.session.username) {
          if(req.body.postText && req.body.canvasFile) {
              var base64ImageData = req.body.canvasFile;
              var postText = req.body.postText;
              var postTime = new Date().getTime();
              var canvasName = `${req.session.username}_${postTime}.png`
              var fileName = `${canvasDirectory}/${req.session.username}/${canvasName}`;
              var imageData = base64ImageData.replace(/^data:image\/\w+;base64,/, "");
              connection.query(`insert into posts (posted_by, post_time, post_resource_reference, post_text) values ('${req.session.userid}', '${postTime}', '${canvasName}', '${postText}')`, function(error, result){
                  if(error) {
                      throw error;
                  }
                  var buff = new Buffer(imageData, 'base64');
                  if(!fs.existsSync(canvasDirectory)) {
                      fs.mkdirSync(canvasDirectory);
                  }
                  if(!fs.existsSync(canvasDirectory+`/${req.session.username}`)) {
                      fs.mkdir(canvasDirectory+`/${req.session.username}`);
                  }
                  fs.writeFile(fileName, buff);
                  res.send('successfull');
              });
          } else {
              res.send('unsuccessfull');
          }
      } else {
          res.send('unsuccessfull');
      }
  });
  router.post('/new-profile-pic', function (req, res) {
      if(req.session.username) {
          if(req.body.profilePicText && req.body.profilePicImageData) {
              var base64ImageData = req.body.profilePicImageData;
              var profilePicText = req.body.profilePicText;
              var profilePicUploadTime = new Date().getTime();
              var canvasName = `${req.session.username}_${profilePicUploadTime}.png`
              var fileName = `canvasDirectory/${req.session.username}/profilePics/${canvasName}`;
              var imageData = base64ImageData.replace(/^data:image\/\w+;base64,/, "");
              connection.query(`insert into profile_pics (user_id, time_of_upload, profile_pic_resource_reference, profile_pic_text) values('${req.session.userid}', '${profilePicUploadTime}', '${canvasName}', '${profilePicText}')`, function(error, result){
                  if(error) {
                      throw error;
                  }
                  var buff = new Buffer(imageData, 'base64');
                  if(!fs.existsSync(`canvasDirectory`)) {
                      fs.mkdirSync(`canvasDirectory`);
                  }
                  if(!fs.existsSync(`canvasDirectory/${req.session.username}`)) {
                      fs.mkdir(`canvasDirectory/${req.session.username}`);
                  }
                  if(!fs.existsSync(`canvasDirectory/${req.session.username}/profilePics`)) {
                      fs.mkdir(`canvasDirectory/${req.session.username}/profilePics`);
                  }
                  fs.writeFile(fileName, buff);
                  res.send('successfull');
              });
          } else {
              res.send('unsuccessfull');
          }
      } else {
          res.send('unsuccessfull');
      }
  });
  router.post('/new-wall-painting', function (req, res) {
    //   console.log('successfully got new wall painting');
      if(req.session.username) {
          if(req.body.wallPaintingText && req.body.wallPaintingImageData) {
              var base64ImageData = req.body.wallPaintingImageData;
              var wallPaintingText = req.body.wallPaintingText;
              var wallPaintingUploadTime = new Date().getTime();
              var canvasName = `${req.session.username}_${wallPaintingUploadTime}.png`
              var fileName = `canvasDirectory/${req.session.username}/wallPaintings/${canvasName}`;
              var imageData = base64ImageData.replace(/^data:image\/\w+;base64,/, "");
              connection.query(`insert into wall_paintings (user_id, time_of_upload, wall_painting_resource_reference, wall_painting_text) values('${req.session.userid}', '${wallPaintingUploadTime}', '${canvasName}', '${wallPaintingText}')`, function(error, result){
                  if(error) {
                      throw error;
                  }
                  var buff = new Buffer(imageData, 'base64');
                  if(!fs.existsSync(`canvasDirectory`)) {
                      fs.mkdirSync(`canvasDirectory`);
                  }
                  if(!fs.existsSync(`canvasDirectory/${req.session.username}`)) {
                      fs.mkdir(`canvasDirectory/${req.session.username}`);
                  }
                  if(!fs.existsSync(`canvasDirectory/${req.session.username}/wallPaintings`)) {
                      fs.mkdir(`canvasDirectory/${req.session.username}/wallPaintings`);
                  }
                  fs.writeFile(fileName, buff);
                  res.send('successfull');
              });
          } else {
              res.send('unsuccessfull');
          }
      } else {
          res.send('unsuccessfull');
      }
  });
  router.get('/search', function (req, res) {
      if(req.session.username) {
          if(req.query.searchType && req.query.searchBarValue) {
              switch(req.query.searchType) {
                  case 'username':
                    connection.query(`select username, user_id from users where username like '${req.query.searchBarValue}%'`, function (error, result) {
                        if(error) throw error;
                        var data = [];
                        for( var i = 0 ; i < result.length ; i++ ) {
                            data.push({
                                username: result[i].username,
                                userId: result[i].user_id
                            });
                        }
                        res.send(data);
                    });
                    break;
              }
          } else {
              res.send('unsuccessfull');
          }
      } else {
          res.send('unsuccessfull');
      }
  });
  router.get('/get-posts', function (req, res) {
    if(req.session.username) {
      if(req.query.postsType) {
        switch(req.query.postsType) {
          case 'latestPosts' :
          connection.query(`select user_id, username, post_id, post_time, post_text,post_resource_reference from users, followers, posts where followers.follower_id='${req.session.userid}' and followers.following_id = posts.posted_by and users.user_id = posts.posted_by UNION select user_id, username ,post_id, post_time, post_text, post_resource_reference from users, posts where users.user_id='${req.session.userid}' and users.user_id = posts.posted_by order by post_time desc limit 10 offset 0`, function (error, result) {
            if(error) throw error;
            if(result.length == 0) {
              res.send('no-new-post');
            } else {
              var posts =[];
              for( var i = 0 ; i < result.length ; i++ ) {
                posts.push({
                  userId: result[i].user_id,
                  postId: result[i].post_id,
                  username: result[i].username,
                  postTime: result[i].post_time,
                  postText: result[i].post_text,
                  image: result[i].post_resource_reference
                });
              }
              res.send(posts);
            }
          });
          break;
        }
      } else {
        res.send('unsuccessfull');
      }
    } else  {
      res.send('unsuccessfull');
    }
  });
  router.get('/get-profile-pic', function (req, res) {
      if(req.session.username) {
          connection.query(`select profile_pic_resource_reference from profile_pics where user_id = ${req.query.userId} order by time_of_upload desc limit 1`, function(error, result) {
             if(error) throw error;
             if(result.length > 0) {
                 res.send(result[0].profile_pic_resource_reference);
             } else {
                 res.send('unsuccessfull');
             }
          });
      } else {
          res.send('unsuccessfull');
      }
  });
  router.get('/get-wall-painting', function (req, res) {
      if(req.session.username) {
          connection.query(`select wall_painting_resource_reference from wall_paintings where user_id = ${req.query.userId} order by time_of_upload desc limit 1`, function(error, result) {
             if(error) throw error;
             if(result.length > 0) {
                 res.send(result[0].wall_painting_resource_reference);
             } else {
                 res.send('unsuccessfull');
             }
          });
      } else {
          res.send('unsuccessfull');
      }
  });
  router.get('/get-post-likes', function (req, res) {
      if(req.session.username) {
          if(req.query.postId) {
              connection.query(`select count(which_user_liked) as no_of_users from post_likes where post_id_liked = '${req.query.postId}'`, function (error, result) {
                  if(error) throw error;
                  connection.query(`select count(which_user_liked) as user from post_likes where which_user_liked = '${req.session.userid}' and post_id_liked = '${req.query.postId}'`, function (error, result2) {
                      if(result2[0].user == 1) {
                          res.send({
                              noOfUsers: result[0].no_of_users,
                              didUserLiked: true
                          });
                      } else {
                          res.send({
                              noOfUsers: result[0].no_of_users,
                              didUserLiked: false
                          });
                      }
                  });
              });
          } else {
              res.send('unsuccessfull');
          }
      } else {
          res.send('unsuccessfull');
      }
  });
  router.post('/like', function (req, res) {
      if(req.session.username) {
          if(req.body.postId && req.body.whosePostLiked) {
              connection.beginTransaction (function (error) {
                  if(error) throw error;
                  connection.query(`select count(which_user_liked) as user from post_likes where post_id_liked = '${req.body.postId}' and which_user_liked = '${req.session.userid}'`, function (error, result) {
                      if(error)
                      return connection.rollback(function() {
                            throw error;
                        });
                      if(result[0].user == 0) {
                          var likeTime = new Date().getTime();
                          connection.query(`insert into post_likes (which_user_liked, whose_post_liked, post_id_liked, time_of_like) values ('${req.session.userid}', '${req.body.whosePostLiked}', '${req.body.postId}', '${likeTime}')`, function (error, result2) {
                              if(error)
                              return connection.rollback(function() {
                                throw error;
                              });
                              connection.commit(function (error) {
                                  if(error) {
                                      return connection.rollback(function () {
                                          throw error;
                                      })
                                  }
                                  res.send('successfull');
                              });
                          });
                      } else {
                          connection.commit(function (error) {
                              if(error) {
                                  return connection.rollback(function () {
                                      throw error;
                                  });
                              }
                              res.send('already-liked');
                          });
                      }
                  });
              });
          } else {
              res.send('unsuccessfull');
          }
      } else {
          res.send('unsuccessfull');
      }
  });
  router.delete('/unlike', function (req, res) {
      if(req.session.username) {
          if(req.body.postId && req.body.whosePostLiked) {
              connection.query(`delete from post_likes where post_id_liked = '${req.body.postId}' and which_user_liked = '${req.session.userid}'`, function (error, result) {
                  if(error) throw error;
                  res.send('successfull');
              });
          } else {
              res.send('unsuccessfull');
          }
      } else {
          res.send('unsuccessfull');
      }
  });
  router.get('/get-comments', function (req, res) {
      if(req.session.username) {
          if(req.query.postId && req.query.type) {
            //   console.log(req.query.postId);
              switch (req.query.type) {
                  case 'number':
                      connection.query(`select count(which_user_comment) as users from post_comments where post_id_comment = '${req.query.postId}'`, function (error, result) {
                          if(error) {
                              throw error;
                          }
                          res.send({
                              noOfUsers: result[0].users
                          });
                      });
                  break;
                  case 'all-comments':
                    connection.query(`select post_comments.comment_id, post_comments.comment_text, users.user_id, post_comments.post_id_comment, post_comments.whose_post_comment, post_comments.time_of_comment, users.username from post_comments, users where post_comments.post_id_comment = '${req.query.postId}' and post_comments.which_user_comment = users.user_id`, function (error, result) {
                        if(error) {
                            throw error;
                        }
                        var dataToSend = [];
                        if(result.length > 0) {

                            dataToSend.push(result.length);
                            for( var i = 0 ; i < result.length ; i++ ) {
                                dataToSend.push({
                                    commentId: result[i].comment_id,
                                    commentText: result[i].comment_text,
                                    whoComment: result[i].user_id,
                                    timeOfComment: result[i].time_of_comment,
                                    username: result[i].username,
                                    profilePicResourceReference: result[i].profile_pic_resource_reference
                                });
                            }
                            res.send(dataToSend);
                        } else {
                            dataToSend.push(0);
                            res.send(dataToSend);
                        }
                    });
                  break;
              }
          } else {
              res.send('unsuccessfull');
          }
      } else {
          res.send('unsuccessfull');
      }
  });
  router.post('/post-comment', function (req, res) {
      if(req.session.username) {
          if(req.body.commentText && req.body.postId && req.body.userId) {
              var timeOfComment = new Date().getTime();
              connection.query(`insert into post_comments (which_user_comment, whose_post_comment, post_id_comment, time_of_comment, comment_text) values ('${req.session.userid}', '${req.body.userId}', '${req.body.postId}', '${timeOfComment}', '${req.body.commentText}')`, function (error, result) {
                  if(error) {
                      throw error;
                  }
                  res.send('successfull');
              });
          } else {
              res.send('unsuccessfull');
          }
      } else {
          res.send('unsuccessfull');
      }
  });
  router.get('/:postid', function (req, res) {
    // display the post with id postid.
  });
  router.post('/follow', function (req, res) {
    if(req.session.username) {
      if(req.body.following) {
        var currentTime = new Date().getTime();
        connection.query(`insert into followers (following_id, follower_id, follow_time) values ('${req.body.following}', '${req.session.userid}', ${currentTime})`, function (error, result) {
          if(error) {
            throw error;
          }
          res.send('successfull');
        });
      } else {
        res.send('unsuccessfull');
      }
    } else {
      res.redirect('/');
    }
  });


  return router;
}
// router.post('/:postid/:like')
module.exports = returnRouter;
