$(document).ready(function () {
  loadPosts('latestPosts', $('#post-container'));

  function loadPosts (postsType, container) {
    switch(postsType) {
      case 'latestPosts' :
        $.ajax({
          type: 'GET',
          url: '/get-posts',
          data: {
            postsType: 'latestPosts'
          },
          success: function (data) {
            postCardTemplate(data, container);
          }
        });
        break;
    }
  }

  function reloadLikeContainer (postLikeContainer, postId) {
      postLikeContainer.text('');
      loadLikes(postId, function (likeData) {
          if(likeData.noOfUsers != 0) {
              if(likeData.didUserLiked) {
                  postLikeContainer.append(
                      $('<span></span>', {
                          'text': 'unlike',
                          'class': 'unlike'

                      })
                  );
              } else {
                  postLikeContainer.append(
                      $('<span></span>', {
                          'text': 'like',
                          'class': 'like'
                      })
                  );
              }
              postLikeContainer.append(
                  $('<span></span>', {
                      'text': likeData.noOfUsers+' liked this'
                  })
              );
          } else {
              postLikeContainer.append(
                  $('<span></span>', {
                      'text': 'like',
                      'class': 'like'
                  })
              );
          }
      });
  }
  function reloadCommentsContainer (commentsContainer, postId) {
      commentsContainer.text('');
      loadComments(postId, 'number', function (commentData) {
          if(commentData.noOfUsers == 0) {
            //   console.log('here');
              commentsContainer.append(
                  $('<span></span>', {
                      'class': 'comment',
                      'text': 'comment',
                      'data-toggle': 'modal',
                      'data-target': '#commentModal'
                  })
              );
          } else {
              commentsContainer.append(
                  $('<span></span>', {
                      'class': 'comment',
                      'text': 'comment',
                      'data-toggle': 'modal',
                      'data-target': '#commentModal'
                  })
              ).append(
                  $('<span></span>', {
                      'class': 'noOfComments'
                  }).append(
                      $('<label></label>', {
                          'text': commentData.noOfUsers
                      })
                  )
              );
          }
      });
  }
  function postCardTemplate (data, container) {
    if(data === 'no-new-post') {
      container.append('thats all folks');
    } else
    for(var i = 0 ; i < data.length ; i++ ) {
      container.append(
        $('<div></div>', {
          'class': 'card card-modified',
          'post-id': data[i].postId,
          'user-id': data[i].userId,
          'username': data[i].username
        }).append(
          $('<div></div>', {
            'class': 'card-header'
        }).append(
            $('<div></div>', {
                'class': 'postProfilePicContainer',
                'user-id': data[i].userId,
                'username': data[i].username,
                'onload': function () {
                    loadProfilePic($(this), $(this).attr('user-id'), $(this).attr('username'));
                }
            }).append(
                $('<img>', {
                    'class': 'postProfilePic'
                })
            )
        ).append(
            $('<span></span>', {
                'class': 'postUsername',
                'text': data[i].username
            })
        ).append(
            $('<span></span>', {
                'class': 'post-time',
                'text': data[i].postTime
            })
        )
        ).append(
          $('<div></div>', {
            'class': 'card-block card-block-modified'
          }).append(
            $('<h6></h6>', {
              'class': 'card-text',
              'text': '> '+data[i].postText
            })
          ).append(
            $('<img>', {
              'src': '/'+data[i].username+'/'+data[i].image,
              'alt': 'image',
              'class': 'card-img'
            })
          )
        ).append(
          $('<div></div>', {
            'class': 'card-footer'
        }).append(
            $('<span></span>', {
                'class': 'postLikeContainer',
                'user-id': data[i].userId,
                'post-id': data[i].postId,
                'onload': function () {
                    var postLikeContainer1 = $(this);
                    reloadLikeContainer(postLikeContainer1, data[i].postId);
                }
            })
        ).append(
            $('<span></span>', {
                'class': 'commentsContainer',
                'user-id': data[i].userId,
                'post-id': data[i].postId,
                'onload': function () {
                    var commentsContainer1 = $(this);
                    reloadCommentsContainer(commentsContainer1, data[i].postId);
                }
            })
        )
        )
      );
    }
  }

  $('#post-container').on('click', '.like', function () {
      var likeContainer = $(this).parent();
      var postId = likeContainer.attr('post-id');
      var whosePostLiked = likeContainer.attr('user-id');
      $.ajax({
          'type': 'POST',
          'url': '/like',
          'data': {
              postId: postId,
              whosePostLiked: whosePostLiked
          },
          success: function (data) {
              if(data == 'successfull') {
                  reloadLikeContainer(likeContainer, postId);
              } else if (data == 'already-liked') {
                  reloadLikeContainer(likeContainer, postId);
              }
          }
      });
  });
  $('#post-container').on('click', '.unlike', function () {
      var likeContainer = $(this).parent();
      var postId = likeContainer.attr('post-id');
      var whosePostLiked = likeContainer.attr('user-id');
      $.ajax({
          type: 'DELETE',
          url: '/unlike',
          data: {
              postId: postId,
              whosePostLiked: whosePostLiked
          },
          success: function (data) {
              if(data == 'successfull') {
                  reloadLikeContainer(likeContainer, postId);
              }
          }
      });

  });
  $('#post-container').on('click', '.comment', function () {
      var commentContainer = $(this).parent();
      var postId = commentContainer.attr('post-id');
      var userId = commentContainer.attr('user-id');
      $('#commentModalTextInput').attr('post-id', postId);
      $('#commentModalTextInput').attr('user-id', userId);
      loadComments(postId, 'all-comments', function (data) {
          var modalCommentsContainer = $('#modalCommentsContainer');
          var noOfComments = data[0];
          modalCommentsContainer.text('');
          for(var i = 1 ; i <= noOfComments ; i++ ) {
              console.log(data[i]);
              modalCommentsContainer.append(
                  $('<div></div>', {
                      'class': 'modalSubCommentContainer'
                  }).append(
                      $('<div></div>', {
                          'class': 'modalSubCommentContainerHeader'
                      }).append(
                          $('<div></div>', {
                              'class': 'commentModalProfilePicContainer',
                              'user-id': data[i].whoComment,
                              'username': data[i].username,
                              'onload': function () {
                                  loadProfilePic($(this), $(this).attr('user-id'), $(this).attr('username'));
                              }
                          }).append(
                              $('<img>', {
                                  'class': 'commentModalProfilePic'
                              })
                          )
                      ).append(
                          $('<span></span>', {
                              'class': 'commentModalUsername',
                              'text': data[i].username
                          })
                      ).append(
                          $('<span></span>', {
                              'class': 'commentModalCommentTime',
                              'text': data[i].timeOfComment
                          })
                      )
                  ).append(
                      $('<div></div>', {
                          'class': 'modalSubCommentContainerBody',
                          'text': ">"+data[i].commentText
                      })
                  )
              );
          }
      });
  });
  $('#commentModalForm').on('submit', function (event) {
      event.preventDefault();
      var commentText = $('#commentModalTextInput').val();
      postId = $('#commentModalTextInput').attr('post-id');
      userId = $('#commentModalTextInput').attr('user-id');
      $('#commentModalTextInput').val('');
      $.ajax({
          type: 'POST',
          url: '/post-comment',
          data: {
              commentText: commentText,
              postId: postId,
              userId: userId
          },
          success: function (data) {
              alert(data);
              
          }
      });
  });
});
