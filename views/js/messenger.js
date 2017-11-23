$(document).ready(function () {
    function getLeftListTemplate (anotherUserUsername, anotherUserUserid, isUserSame, message, conversationId) {
        return $('<div></div>', {
            'class': 'leftListUserContainer',
            'anotherUserUserid': anotherUserUserid,
            'anotherUserUsername': anotherUserUsername,
            'conversationId': conversationId
        }).append(
            $('<div></div>', {
                'class': 'leftListProfilePicContainer',
                'onload': function () {
                    loadProfilePic($(this), anotherUserUserid, anotherUserUsername);
                }
            }).append(
                $('<img>', {
                    'class': 'leftListProfilePic'
                })
            )
        ).append(
            $('<div></div>', {
                'class': 'restContentContainer'
            }).append(
                $('<div></div>', {
                    'class': 'anotherUserUsername',
                    'text': anotherUserUsername
                })
            ).append(
                $('<div></div>', {
                    'class': 'leftListMessageContainer'
                }).append(
                    $('<i></i>', {
                        'class': isUserSame
                    })
                ).append(
                    $('<div></div>', {
                        'class': 'leftListMessage',
                        'text': message
                    })
                )
            )
        );
    }
    var usersChatList = [];
    var usersChatListContainer = $('#messegedPeopleListContainer');
    getUsersList(function () {
        displayUsersChatList();
    });
    function getUsersList (callback) {
        $.ajax({
            url: '/messeges/differentchats',
            type: 'GET',
            success: function (data) {
                if(data != 'unsuccessfull') {
                    for( var i = 1 ; i <= data[0] ; i++ ) {
                        var userChatObject = new UserChatObject(data[i]);
                        usersChatList.push(userChatObject);
                        if(i == data[0]) {
                            callback();
                        }
                    }
                }
            }
        });
    }
    function UserChatObject (data) {
        this.chat = [];
        this.chat.push(data);
        this.currentUserUsername = data.currentUserUsername;
        this.currentUserUserid = data.currentUserUserid;
        this.anotherUserUsername = data.anotherUserUsername;
        this.anotherUserUserid = data.anotherUserUserid;
        this.conversationId = data.conversationId;
    }
    function displayUsersChatList () {
        for( var i = 0 ; i < usersChatList.length ; i++ ) {
            var isUserSame = 'fa fa-angle-down';
            if(usersChatList[i].currentUserUsername == usersChatList[i].chat[usersChatList[i].chat.length-1].fromUsername) {
                isUserSame = 'fa fa-angle-up';
            }
            usersChatListContainer.append(getLeftListTemplate(usersChatList[i].anotherUserUsername, usersChatList[i].anotherUserUserid, isUserSame, usersChatList[i].chat[usersChatList[i].chat.length-1].message, usersChatList[i].conversationId));
        }
    }
    var chatContainer = $('#chatContainer');
    function displayChat (conversationId) {
        alert('here');
        chatContainer.text('');
        chatContainer.append(
            $('<div></div>', {
                'class': 'btn btn-primary',
                'text': 'load previous'
            })
        );

    }
    $('#messegedPeopleListContainer').on('click', '.leftListUserContainer', function () {
        var conversationId = $(this).attr('conversationId');
        displayChat(conversationId);
    });
});
