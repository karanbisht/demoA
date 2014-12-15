/**
 * Activity view model
 */

var app = app || {};

app.Activity = (function () {
    'use strict'
    
    var $commentsContainer, listScroller;    
    var org_id;
    var notiId;
    var account_Id;
    var commentsDataSource;        
    var message;
    var title;
    var comment_allow;
    var attached;
    var groupDataShow = [];
    var lastNotiCommentID;
    var orgLogoToShow;
    var type;
    var date;
    
    var activityViewModel = (function () {
        var activityUid, activity;
        // $activityPicture;
        
        var init = function () {
            if (app.checkConnection()) {  
                getuserName();
            }             
        };
                
        var data;          
        var len = null;
        var userFirstName;
        var myScroll;

        var getuserName = function() {
            var db = app.getDb();             
            db.transaction(getProfileInfo, app.onError, app.onSuccess);
        };
        
        var getProfileInfo = function(tx) {
            var query = "select first_name FROM PROFILE_INFO";
            app.selectQuery(tx, query, orgDataProfileSuccess);
        };
        
        var orgDataProfileSuccess = function(tx, results) {
            var count = results.rows.length;
            if (count !== 0) {
                userFirstName = results.rows.item(0).first_name;
            }
        }
        
        var getUserName = function(idValue) {
            var userId = idValue;
            var user = $.grep(app.Users.users(), function (e) {
                return e.Id === userId;
            })[0];
            return user ? user.DisplayName : 'Anonymous';
        };
        
        var befShow = function() {    
            if (app.checkConnection()) {
                console.log("online");
            } else {
                console.log("offline");
                //var db = app.getDb();
                //db.transaction(offlineQueryReplyDB, app.onError, offlineQueryReplyDBSuccess);
            }
        };
      
        var replyButton = function() {
            if (app.checkConnection()) {
                console.log(activity);
                var notificationId = activity.notification_id;             
                app.mobileApp.navigate('views/addCommentView.html?notificationId=' + notificationId);            
            } else {
                app.showAlert("You are currently offline , can't reply to post " , "Offline Mode");
            }
        };

        function loaded() {
        setTimeout(function() {    
        myScroll = new iScroll('notiImage', {
        bounce : false,
        zoom : true,
        zoomMax: 4,
        momentum: false,
        hScrollbar: false,
        vScrollbar: false    
        });
        }, 100);            
        }

        //document.addEventListener('DOMContentLoaded', loaded, false);
  
        document.addEventListener('touchmove', function(e) {
        e.preventDefault();
        }, false);
        
       

        var show = function (e) {
            app.mobileApp.pane.loader.hide();
            groupDataShow = [];            


            $('#newComment').val(' ');

            //console.log('TESTINGGGGGG');
            //console.log(window);
            //console.log(window.plugins);
 
            $commentsContainer = $('#comments-listview');
            $commentsContainer.empty();        
            listScroller = e.view.scroller;
            listScroller.reset();

            
            
            $('#newComment').css('height', '30px');

            var txt = $('#newComment'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
    
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv replyTextArea');

            $('body').append(hiddenDiv);

            txt.on('keyup', function () {
                content = $(this).val();
    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
    
                $(this).css('height', hiddenDiv.height());
            });

            
            
            
            message = e.view.params.message;
            title = e.view.params.title;
            org_id = e.view.params.org_id;
            notiId = e.view.params.notiId;
            account_Id = e.view.params.account_Id;
            comment_allow = e.view.params.comment_allow;
            attached = e.view.params.attached;
            type = e.view.params.type;
            date = e.view.params.date;
            
            message = app.proURIDecoder(message);
            title = app.proURIDecoder(title);
            
            //alert('dataValue');
            
            console.log(org_id + '||' + notiId + '||' + account_Id + '||' + comment_allow + '||' + attached);
            //alert(attached);
            
            //var attachedImg ='http://54.85.208.215/assets/attachment/'+attached;            
            //console.log(attached);
            
            if ((title==='' || title==='null' || title===null) && (message==='' || message==='null' || message===null)) {
                $('#titleContainer').hide();
            }

            if (attached!== null && attached!=='' && attached!=="0") {
                loaded(); 
                //$('#notiImage').css({"height":"200px"});
                $('#notiImage').css({"max-height":"200px"});
                //$('#notiImage').css({"width":'auto'});
                $('#notiImage').css({"margin-top":"10px"}); 
                var imgPathData = app.getfbValue();                    
                var fp = imgPathData + "/Aptifi/" + 'Aptifi_' + notiId + '.jpg';                
                
                //alert(fp);                
                console.log('Image Saving Process');    
                //console.log(attachedImg);    
                window.resolveLocalFileSystemURI(fp, imagePathExist, imagePathNotExist);                
            }
                        
            if (comment_allow===1 || comment_allow==='1') {
                $("#commentPanel").show();                
            }else {
                $("#commentPanel").css("z-index", "-1");
                $("#commentPanel").css("opacity", .4);	
                document.getElementById('commentPanel').style.pointerEvents = 'none';
                $("#newComment").val('');
                $("#newComment").attr("placeholder", "Reply not allow.");
            }
            console.log(org_id + "||" + notiId + "||" + account_Id);            
            $("#personName").html(title);
            $("#activityText").html(message);
            $("#notiDate").html(date);
                                       
            var db = app.getDb();
		                 
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
                db.transaction(getDataOrgNotiComment, app.errorCB, app.successDB);      
            }else {
                db.transaction(getDataOrgNotiComment, app.errorCB, commentShow);      
            }
            
            db.transaction(getOrgImgLogo, app.errorCB, orgLogoShow);  
        };
        
        var imagePathExist = function() {
            //alert('1');
            var imgPathData = app.getfbValue();    
            var fp = imgPathData + "/Aptifi/" + 'Aptifi_' + notiId + '.jpg';
            var img = $('<img id="imgShow" style="max-height:200px"/>'); //Equivalent: $(document.createElement('img'))
            img.attr('src', fp);
            img.appendTo('#notiImage'); 
        }
        
        var imagePathNotExist = function() {
            //alert('2');
            $("#progressChat").show();
            //alert(attached);
            var attachedImg = attached;
            
            var imgPathData = app.getfbValue();    
            var fp = imgPathData + "/Aptifi/" + 'Aptifi_' + notiId + '.jpg';
            
            var img = $('<img id="imgShow" style="max-height:200px"/>'); //Equivalent: $(document.createElement('img'))
            
            //alert(attachedImg);
            
            img.attr('src', attachedImg);
            img.appendTo('#notiImage'); 
 	
            var fileTransfer = new FileTransfer();    
            fileTransfer.download(attachedImg, fp, 
                                  function(entry) {
                                      $("#progressChat").hide();
                                  },
    
                                  function(error) {
                                      $("#progressChat").hide();
                                  }
                );                
        }
        
    
        
        var commentShow = function() {            
            app.mobileApp.pane.loader.hide();
            $("#progressChat").show();

            var commentModel = {
                id: 'Id',
                fields: {
                    comment: {
                            field: 'comment',
                            defaultValue: ''
                        },
                    user_id: {
                            field: 'user_id',
                            defaultValue:''
                        }, 
                    add_date: {
                            field: 'add_date',
                            defaultValue: new Date()
                        }
                },
                CreatedAtFormatted: function () {
                    console.log(this.get('add_date'));
                    return app.helper.formatDate(this.get('add_date'));
                },
                User: function () {
                    //console.log(this.get('user_id'));                
                    //var serUserId = this.get('user_id');
                    if (this.get('user_type')==="Customer") {
                        return userFirstName;                    
                    }else {
                        return 'Admin';
                    }
                    //return user ? user.DisplayName : 'Anonymous';    
                }
            };
            
            console.log(org_id + "/" + notiId + "/" + account_Id + "/" + lastNotiCommentID);
            
            app.mobileApp.pane.loader.hide();
 
            commentsDataSource = new kendo.data.DataSource({
                                                               transport: {
                    read: {
                                                                           url: app.serverUrl() + "notification/getNotificationComment/" + org_id + "/" + notiId + "/" + account_Id + "/" + lastNotiCommentID,
                                                                           type:"POST",
                                                                           dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                       }
                },
                                                               schema: {
                    model: commentModel,
                                
                    data: function(data) {
                        console.log(data);
               
                        $.each(data, function(i, groupValue) {
                            console.log(groupValue);
                                     
                            var returnMsg = groupValue[0].Msg;
                            var orgNotiCommentData;
                            console.log(returnMsg);
                            if (returnMsg==='Success') {
                                var commentLength = groupValue[0].AllComment.length;
                              
                                orgNotiCommentData = groupValue[0].AllComment;
                                console.log(commentLength);
                               
                                for (var j = 0;j < commentLength;j++) {
                                    var dateString = groupValue[0].AllComment[j].add_date;
                                    var split = dateString .split(' ');
                                    console.log(split[0] + " || " + split[1]);
                                    var commentDate = app.formatDate(split[0]);
                                    var commentTime = app.formatTime(split[1]);

                                    //var commentTime = app.timeConvert(split[1]);
                                    //alert(commentTime);
                                         
                                    groupDataShow.push({
                                                           comment: groupValue[0].AllComment[j].comment,
                                                           add_date: commentDate,
                                                           add_time: commentTime,
                                                           user_id : groupValue[0].AllComment[j].user_id,
                                                           user_type : groupValue[0].AllComment[j].user_type
                                                       });
                                }
                                saveOrgNotiComment(orgNotiCommentData);    
                            } 
                        });
                       
                        console.log(groupDataShow);
                        //alert(JSON.stringify(groupDataShow));
                        return groupDataShow;
                    }                       
                },
                                                               error: function (e) {
                                                                   $("#progressChat").hide();

                                                                   console.log(e);
                                                                   /*navigator.notification.alert("Please check your internet connection.",
                                                                   function () { }, "Notification", 'OK');
                                                                   */
                    
                                                                   if (!app.checkConnection()) {
                                                                       if (!app.checkSimulator()) {
                                                                           window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                       }else {
                                                                           app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                       } 
                                                                   }
                                                               }
	        
                                                           });         
            
            //commentsDataSource.fetch(function() {               
            //});
            
            app.mobileApp.pane.loader.hide();

            $("#comments-listview").kendoMobileListView({
                                                            template: kendo.template($("#commentsTemplate").html()),    		
                                                            dataSource: commentsDataSource,
                                                            //pullToRefresh: true,   
                                                            schema: {
                    model:  commentModel
                }			 
                                                        });

            $("#progressChat").hide();
            
            app.mobileApp.pane.loader.hide();
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }
        };
         
        var orgNotiCommentDataVal;
        
        function saveOrgNotiComment(data) {
            orgNotiCommentDataVal = data;      
            var db = app.getDb();
            db.transaction(insertOrgNotiCommentData, app.errorCB, app.successCB);
        };
            
        function insertOrgNotiCommentData(tx) {
            //var query = "DELETE FROM ORG_NOTIFICATION";
            //app.deleteQuery(tx, query);
            var dataLength = orgNotiCommentDataVal.length;
            //alert('LiveDataVal'+dataLength);
 
            for (var i = 0;i < dataLength;i++) {       
                var query = 'INSERT INTO ORG_NOTI_COMMENT(id,notification_id, comment, add_date, reply_to, reply_to_id, user_id, user_type) VALUES ("'
                            + orgNotiCommentDataVal[i].id
                            + '","'
                            + orgNotiCommentDataVal[i].notification_id
                            + '","'
                            + orgNotiCommentDataVal[i].comment
                            + '","'
                            + orgNotiCommentDataVal[i].add_date
                            + '","'
                            + orgNotiCommentDataVal[i].reply_to
                            + '","'
                            + orgNotiCommentDataVal[i].reply_to_id
                            + '","'
                            + orgNotiCommentDataVal[i].user_id
                            + '","'
                            + orgNotiCommentDataVal[i].user_type
                            + '")';              
                app.insertQuery(tx, query);
            }                               
        }
        
        var getOrgImgLogo = function(tx) {
            var query = 'SELECT * FROM JOINED_ORG where org_id=' + org_id ;
            app.selectQuery(tx, query, getOrgLogoDataSuccess);  
        }  
      
        function getOrgLogoDataSuccess(tx, results) {
            var count = results.rows.length;    
            //for(var i =0 ; i<count ; i++){                       
            orgLogoToShow = results.rows.item(0).imageSource
            //alert(orgLogoToShow);
            //}
        }  
      
        function orgLogoShow() {
            if (orgLogoToShow!==null && orgLogoToShow!=='null' && orgLogoToShow!=='') {
                var imgPath = orgLogoToShow;
                $("#orgLogoImg").attr('src', imgPath);
            }else {
                var imgPath = 'styles/images/habicon.png';
                $("#orgLogoImg").attr('src', imgPath);
            }
        }  
        
        var getDataOrgNotiComment = function(tx) {
            var query = 'SELECT * FROM ORG_NOTI_COMMENT where notification_id=' + notiId ;
            app.selectQuery(tx, query, getOrgNotiCommentDataSuccess);
        };    
            
        function getOrgNotiCommentDataSuccess(tx, results) {
            var count = results.rows.length;  
            //lastNotiCommentID = count;
            //alert(count);
            if (count !== 0) {
                groupDataShow = [];
                for (var i = 0 ; i < count ; i++) {    
                    var dateString = results.rows.item(i).add_date;
                    var split = dateString .split(' ');
                    console.log(split[0] + " || " + split[1]);
                    var commentDate = app.formatDate(split[0]);
                    
                    var commentTime = app.formatTime(split[1]);

                    //alert(commentTime);
                    //alert(commentDate);
                    
                    groupDataShow.push({
                                           comment: results.rows.item(i).comment,
                                           add_date: commentDate,
                                           add_time: commentTime,
                                           user_id : results.rows.item(i).user_id,
                                           user_type : results.rows.item(i).user_type
                                       });
                    
                    lastNotiCommentID = results.rows.item(i).id;
                }    
                console.log(lastNotiCommentID);
            }else {
                lastNotiCommentID = 0;
            }                       
        };       
        
        var offlineQueryReplyDB = function(tx) {
            var query = 'SELECT ReplyText , CreatedAt FROM NotificationReply';
            app.selectQuery(tx, query, offlineReplyQuerySuccess);
        };
        
        var offlineReplyQuerySuccess = function(tx, results) {
            var count = results.rows.length;
            console.log("karan bisht" + count);
            if (count !== 0) {
                for (var i = 0; i < count; i++) {
                    var ReplyText = results.rows.item(i).ReplyText;
                    var CreatedAt = results.rows.item(i).CreatedAt;
                    var UserNameofflineValue = results.rows.item(i).UserNameField;
                    console.log(UserNameofflineValue); 
                    //var NotificationId = results.rows.item(i).NotificationId; 
                    //var UserId = results.rows.item(i).UserId;
                    
                    var template;
                    //if(i===0){
                    //   template = kendo.template($("#commentsTemplate").html());
                    // $("#comments-listview").html(template({User:function(){return UserNameofflineValue;} ,CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,ReplyText: ReplyText}));
                    //}else{
                    template = kendo.template($("#commentsTemplate").html());
                    $("#comments-listview").append(template({User:function() {
                        return UserNameofflineValue;
                    } ,CreatedAtFormatted: function () {
                        return app.helper.formatDate(CreatedAt);
                    } ,ReplyText: ReplyText}));
                    //}
                }
            }else {
                $("#comments-listview").html("You are Currently Offline and data not available in local storage");
            }
        };
 
        var offlineReplyDBSuccess = function() {
            console.log("Query Success");
        };
        
        var removeActivity = function () {
            var activities = app.Activities.activities;
            var activity = activities.getByUid(activityUid);
            
            app.showConfirm(
                appSettings.messages.removeActivityConfirm,
                'Delete Activity',
                function (confirmed) {
                    if (confirmed === true || confirmed === 1) {
                        activities.remove(activity);
                        activities.one('sync', function () {
                            app.mobileApp.navigate('#:back');
                        });
                        activities.sync();
                    }
                }
                );
        };
        
        var saveComment = function () {    
            console.log('click save');
            // Validating of the required fields
            //if (validator.validate()) {
                
            // Adding new comment to Comments model
            //var comments = app.Comments.comments;
            //var comment = comments.add();            
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }else {  
                var comment = $("#newComment").val();
                //var org_id = localStorage.getItem("UserOrgID");
                //var customer_id = localStorage.getItem("UserID");
             
                if (comment!=='Reply' && comment!=='') {
                    console.log("SHOWING DATA" + notiId + "||" + account_Id + "||" + org_id);
                
                    var jsonDatacomment = {"notification_id":notiId ,"customer_id":account_Id,"comment":comment, "org_id":org_id}
                   
                    var saveCommentDataSource = new kendo.data.DataSource({
                                                                              transport: {
                            read: {
                                                                                          url: app.serverUrl() + "notification/userReply",
                                                                                          type:"POST",
                                                                                          dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                          data: jsonDatacomment
                                                                                      }
                        },
                                                                              schema: {
                            data: function(data) {
                                console.log(data);
                                return [data];
                            }
                        },
                                                                              error: function (e) {
                                                                                  console.log(e);
                                                                                  navigator.notification.alert("Please check your internet connection.",
                                                                                                               function () {
                                                                                                               }, "Notification", 'OK');
               
                                                                                  if (!app.checkSimulator()) {
                                                                                      window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                                                                  }else {
                                                                                      app.showAlert("Network problem . Please try again later", "Notification");  
                                                                                  }
                                                                              }               
                                                                          });  
	            
                    saveCommentDataSource.fetch(function() {
                        var commentDataView = saveCommentDataSource.data();
                        console.log(commentDataView);
                        $.each(commentDataView, function(i, commentData) {           
                            console.log(commentData.status[0].Msg);
                            refreshComment(); 
                            if (commentData.status[0].Msg === 'Reply sent successfully') {
                                lastNotiCommentID = lastNotiCommentID + 1;
                                            $('#newComment').css('height', '30px');

                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom('Reply sent successfully');   
                                }else {
                                    app.showAlert("Reply sent successfully", "Notification");  
                                    
                                }
                                 
                                $("#newComment").val('');
                            }else {
                                //app.showAlert(commentData.status[0].Msg ,'Notification'); 
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(commentData.status[0].Msg);   
                                }else {
                                    app.showAlert("commentData.status[0].Msg", "Notification");  
                                }
                            }
                        });
                    });
                }else {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom("Please enter your Reply");   
                    }else {
                        app.showAlert("Please enter your Reply", "Notification");  
                    }
                }        
            }  
        };

        function refreshComment() {
            console.log('refButton');
            //console.log('save button click');
            //app.mobileApp.navigate('views/activityView.html?message=' + message +'&title='+title+'&org_id='+org_id+'&notiId='+notiId+'&account_Id='+account_Id+'&comment_allow='+comment_allow);
            //var certificateList = $('#comments-listview').data('kendoMobileListView');
            //certificateList.commentsDataSource.read();   // added line
            //certificateList.refresh();
  
            app.Activity.commentShow();
            /*setTimeout(function () {
            app.mobileApp.navigate('views/activityView.html?message=' + message +'&title='+title+'&org_id='+org_id+'&notiId='+notiId+'&account_Id='+account_Id+'&comment_allow='+comment_allow);
            $("#comments-listview").kendoMobileListView({            
            dataSource: commentsDataSource,
            template:  $("#commentsTemplate").text()
            });
            }, 100);*/
        };
		
        return {
            init: init,
            show: show,
            saveComment:saveComment,
            commentShow:commentShow, 
            befShow: befShow,
            remove: removeActivity,
            replyButton:replyButton,
            activity: function () {
                return activity;
            },
        };
    }());
    
    return activityViewModel;
}());