/**
 * Activity view model
 */

var app = app || {};

app.userNotiComment = (function () {
    'use strict'
    
    var $commentsContainer,
        listScroller;
    var attached;    
    var userActivityViewModel = (function () {
        var activityUid, activity;
        // $activityPicture;
        var org_id;
        var notiId;  
        var customerID;
        var userCommentsDataSource; 
        var userName;
        var notification_id;     
        var message;
        var title;
        var myScroll;
        var attached;
        var comment_allow;
        var pid;
        var upload_type;
        var attachedImgFilename;
        var date;
        
        var init = function () {
        };
                
        var data;          
        
        var replyButton = function() {
            if (app.checkConnection()) {
                //console.log(activity);
                var notificationId = activity.notification_id;             
                app.mobileApp.navigate('views/addCommentView.html?notificationId=' + notificationId);                         
            } else {
                app.showAlert("You are currently offline, can't reply to post " , "Offline Mode");
            }
        };
        
        function loaded() {
            setTimeout(function() {    
                myScroll = new iScroll('notiAdminImage', {
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
            $("#adminCommentPage").show();
            $("#status-container-adminComment").hide();

            $('#newAdminComment').val('');

            app.mobileApp.pane.loader.hide();
            title = ''
            message = '';
            $(".km-scroll-container").css("-webkit-transform", "");

            $commentsContainer = $('#comments-listview');
            $commentsContainer.empty();        

            listScroller = e.view.scroller;
            listScroller.reset();
            
            $('#newAdminComment').css('height', '35px');

            var txt = $('#newAdminComment'),
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
            
            //message = e.view.params.message;
            //title = e.view.params.title;
            org_id = e.view.params.org_id;
            //notiId = e.view.params.notiId;
            //var comment_allow = e.view.params.comment_allow;
            customerID = e.view.params.customerID;
            userName = e.view.params.userName;
            //alert(userName);         
            //attached = e.view.params.attached;
            notiId = e.view.params.notification_id;
            date = e.view.params.date;
            
            var userCommentedNotification = new kendo.data.DataSource({
                                                                          transport: {
                    read: {
                                                                                      url: app.serverUrl() + "notification/notificationDetail/" + notiId + "/" + org_id,
                                                                                      type:"POST",
                                                                                      dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                  }
                },
                                                                          schema: {
                    data: function(data) {
                        console.log(data);
                        return [data];
                    }                   
                },
                                                                          error: function (e) {
                                                                              //apps.hideLoading();
                                                                              //console.log(e);
                                                                              //console.log(JSON.stringify(e));
                                                                             
                                                                              if (!app.checkConnection()) {
                                                                                             if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.INTERNET_ERROR);
                                                                                             }else {
                                                                                                app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                                             } 
                                                                                        }else {
                                                                              
                                                                                            if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.ERROR_MESSAGE);
                                                                                            }else {
                                                                                                app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                            }
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                              
                                                                          }
	        
                                                                      });         
            
            userCommentedNotification.fetch(function() {
                var notificationData = userCommentedNotification.data();
                
                $.each(notificationData, function(i, loginData) {
                    if (loginData.status[0].Msg==='Success') {
                        attached = loginData.status[0].notificationList[0].attached;
                        comment_allow = loginData.status[0].notificationList[0].comment_allow;
                        message = loginData.status[0].notificationList[0].message;
                        pid = loginData.status[0].notificationList[0].pid;
                        title = loginData.status[0].notificationList[0].title;
                        upload_type = loginData.status[0].notificationList[0].upload_type; 
                        moreDataToLoad();            
                    }

                    $("#personNameTitle").html(title);
                    $("#activityTextMessage").html(message);
                    $("#notiDateadmin").html(date);
                    app.mobileApp.pane.loader.hide();
                    //console.log(attached + "||" + comment_allow + "||" + message + "||" + s + "||" + title);
                });
            });
        };
        
        var moreDataToLoad = function() {
            
            var attachedImg = attached;
            
            //console.log(message+"||"+title+'||'+userName);
            
            document.getElementById("notiAdminImage").innerHTML = "";
            
            /*if (attached!== null && attached!=='' && attached!==undefined && attached!=='0') {             
                //loaded(); 
                $('#notiAdminImage').css({"max-height":"300px"});
                //$('#notiAdminImage').css({"height":"auto"});
                //$('#notiAdminImage').css({"width":'auto'});
                $('#notiAdminImage').css({"margin-top":"10px"}); 

                var imgPathData = app.getfbValue();    
                var fp = imgPathData + "Zaffio/" + 'Zaffio_img_' + notiId + '.jpg';                
                //console.log(attachedImg);
                window.resolveLocalFileSystemURL(fp, imagePathExist, imagePathNotExist);                
            }*/
            
             $("#notiAdminDetailVid").hide();
             $("#notiAdminImage").hide();
            if (attached!== null && attached!=='' && attached!=="0" && upload_type==="other") {
                $("#notiAdminDetailVid").hide();
                $("#notiAdminImage").show();                
                app.mobileApp.pane.loader.hide();
                $('#notiAdminImage').css({"max-height":"200px"});
                $('#notiAdminImage').css({"margin-top":"10px"});
                attachedImgFilename = attached.replace(/^.*[\\\/]/, '');
                //attachedImgFilename=attachedImgFilename+'.jpg';
                var imgPathData = app.getfbValue();                    
                var fp = imgPathData + "Zaffio/" + 'Zaffio_img_'+attachedImgFilename; 
                window.resolveLocalFileSystemURL(fp, imagePathExist, imagePathNotExist);                
            }else if(attached!== null && attached!=='' && attached!=="0" && upload_type==="video"){
               $("#notiAdminImage").hide();
                var notiImageShow = document.getElementById('notiAdminDetailVid');
                notiImageShow.style.display = 'block';
                //notiImageShow.src = attached;*/ 
            }
            
            if (comment_allow===0) {
                $("#commentPanel").css("z-index", "-1");
                $("#commentPanel").css("opacity", .4);	
                document.getElementById('commentPanel').style.pointerEvents = 'none';
            }
                       
            $("#personName").html(title);
            $("#activityText").html(message);
                      
            // kendo.bind(e.view.element, datasource, kendo.mobile.ui);
            //  var notificationId = activity.notification_id;          
            adminComment();
        }
        
        /*var imagePathExist = function() {
            var imgPathData = app.getfbValue();    
            var fp = imgPathData + "Zaffio/" + 'Zaffio_img_' + notiId + '.jpg';
            var img = $('<img id="imgShowAdmin" style="max-height:300px" />');
            img.attr('src', fp);
            img.appendTo('#notiAdminImage');
            app.mobileApp.pane.loader.hide();
        };
        
        var imagePathNotExist = function() {
            var attachedImg = attached;
            var imgPathData = app.getfbValue();    
            var fp = imgPathData + "Zaffio/" + 'Zaffio_img_' + notiId + '.jpg';
            
            var img = $('<img id="imgShowAdmin" style="max-height:300px"/>'); //Equivalent: $(document.createElement('img'))
            img.attr('src', attachedImg);
            img.appendTo('#notiAdminImage'); 
            app.mobileApp.pane.loader.hide();
 	
            var fileTransfer = new FileTransfer();    
            fileTransfer.download(attachedImg, fp, 
                                  function(entry) {
                                      app.mobileApp.pane.loader.hide();
                                  }, 
                                  function(error) {
                                      app.mobileApp.pane.loader.hide();
                                  }
                );                
        };
        */
        
        var imagePathExist = function() {
            var imgPathData = app.getfbValue();    
            var fp = imgPathData + "Zaffio/" + 'Zaffio_img_' + attachedImgFilename;                        
            var img = $('<img id="imgShowAdmin" style="max-height:200px" />');
            img.attr('src', fp);
            img.appendTo('#notiAdminImage');
            console.log(fp);              
        }
        
        var imagePathNotExist = function() {
            if (!app.checkConnection()) {
            
            }else{                
                var attachedImg = attached;                        
                var imgPathData = app.getfbValue();    
                var fp = imgPathData + "Zaffio/" + 'Zaffio_img_' + attachedImgFilename;
            
                var img = $('<img id="imgShowAdmin" style="max-height:300px"/>'); //Equivalent: $(document.createElement('img'))
                img.attr('src', attachedImg);
                img.appendTo('#notiAdminImage'); 
                app.mobileApp.pane.loader.hide();
 	
                var fileTransfer = new FileTransfer();              
                fileTransfer.download(attachedImg, fp, 
                                  function(entry) {
                                      app.mobileApp.pane.loader.hide();
                                  },
    
                                  function(error) {
                                       app.mobileApp.pane.loader.hide();
                                 }
                );                
            }
        }
        
        
        
        
        var adminComment = function() {
            var userCommentModel = {
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
                    //console.log(this.get('add_date'));
                    return app.helper.formatDate(this.get('add_date'));
                },
                User: function () {
                    //console.log(this.get('user_id'));                
                    if (this.get('user_type')==="Customer") {
                        return userName;                    
                    }else {
                        return 'Admin';
                    }
                }
            };
           
            userCommentsDataSource = new kendo.data.DataSource({
                                                                   transport: {
                    read: {
                                                                               url: app.serverUrl() + "notification/getComment/" + org_id + "/" + notiId + "/" + customerID,
                                                                               type:"POST",
                                                                               dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                           }
                },
                                                                   schema: {
                    model: userCommentModel,
                                
                    data: function(data) {
                        //console.log(data);
                        var groupDataShow = [];
                        $.each(data, function(i, groupValue) {
                            //console.log(groupValue);
                            var returnMsg = groupValue[0].Msg;
                            //console.log(returnMsg);
                            if (returnMsg==='Success') {
                                var commentLength = groupValue[0].AllComment.length;                                    
                                //console.log(commentLength);                            
                                for (var j = 0;j < commentLength;j++) {
                                    var dateString = groupValue[0].AllComment[j].add_date;
                                    var split = dateString .split(' ');
                                    //console.log(split[0] + " || " + split[1]);
                                    var commentDate = app.formatDate(split[0]);
                                    var commentTime = app.formatTime(split[1]);
                                         
                                    groupDataShow.push({
                                                           comment: groupValue[0].AllComment[j].comment,
                                                           add_date: commentDate,
                                                           add_time: commentTime,
                                                           user_type: groupValue[0].AllComment[j].user_type,
                                                           user_id: groupValue[0].AllComment[j].user_id,
                                                           userName:userName
                                                           //notification_id: groupValue[0].replyData[j].notification_id,
                                                           //send_date:groupValue[0].replyData[j].send_date,
                                                           //title:groupValue[0].replyData[j].title,
                                                           //type:groupValue[0].replyData[j].type

                                                       });
                                    // console.log(groupValue[0].replyData[j].comment); 
                                }
                            } 
                        });
                       
                        // console.log(groupDataShow);
                        return groupDataShow;
                    }                       
                },
                                                                   error: function (e) {
                                                                       //apps.hideLoading();
                                                                       //console.log(e);
                                                                       //console.log(JSON.stringify(e));
                                                                       
                                                                       if (!app.checkConnection()) {
                                                                                             if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.INTERNET_ERROR);
                                                                                             }else {
                                                                                                app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                                             } 
                                                                                        }else {
                                                                              
                                                                                            if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.ERROR_MESSAGE);
                                                                                            }else {
                                                                                                app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                            }
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                   }
	        
                                                               });         
            
            //userCommentsDataSource.fetch(function() {
                
            //});

            $("#userComments-listview").kendoMobileListView({
                                                                template: kendo.template($("#userCommentsTemplate").html()),    		
                                                                dataSource: userCommentsDataSource,
                                                                schema: {
                    model:  userCommentModel
                }			 
                 
                                                            });                                

            $("#adminCommentPage").hide();
            $("#status-container-adminComment").show();
        }
        
        var lastClickTime = 0;
        var saveAdminComment = function () {    
            var current = new Date().getTime();
            var delta = current - lastClickTime;
            lastClickTime = current;
         
            if (delta < 500) {
            } else {
                if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                    } 
                }else {  
                    var comment = $("#newAdminComment").val();
                    

                    if (comment!=='' && comment!=='Reply') {
                        $("#adminCommentPage").show();
                

                        $('#newAdminComment').css('height', '35px');
                        $("#userComments-listview").append('<li id="adminTryingComment"><div class="Org-admin-comment-List"><div class="Org-admin-comment-content" style="padding-top:10px;"><a>' + comment + '</a><br/><span class="user-time-span"> Sending..</span></div></div></li>');
                        $("#newAdminComment").val('');
                        
                        var jsonDatacomment = {"org_id":org_id,"notification_id":notiId, "comment":comment,"customer_id":customerID}
                   
                        var saveCommentDataSource = new kendo.data.DataSource({
                                                                                  transport: {
                                read: {
                                                                                              url: app.serverUrl() + "notification/orgReply",
                                                                                              type:"POST",
                                                                                              dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                              data: jsonDatacomment
                                                                                          }
                            },
                                                                                  schema: {
                                data: function(data) {
                                    return [data];
                                }
                            },
                                                                                  error: function (e) {
                                                                          
                                                                                      console.log(JSON.stringify(e));
                                                                                      $("#adminCommentPage").hide();
                                                                                      app.mobileApp.pane.loader.hide();
                                                                                      
                                                                                      if (!app.checkConnection()) {
                                                                                             if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.INTERNET_ERROR);
                                                                                             }else {
                                                                                                app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                                             } 
                                                                                        }else {
                                                                              
                                                                                            if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.ERROR_MESSAGE);
                                                                                            }else {
                                                                                                app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                            }
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                                 
                                                                                  }               
                                                                              });  
	            
                        saveCommentDataSource.fetch(function() {
                            var commentDataView = saveCommentDataSource.data();
                            //console.log(commentDataView);
                            $.each(commentDataView, function(i, commentData) {           
                                app.mobileApp.pane.loader.hide();

                                //console.log(commentData.status[0].Msg);
                                if (commentData.status[0].Msg === 'Reply sent successfully') {
                                    $("#adminCommentPage").hide();
                           
                                    $('#newAdminComment').css('height', '35px');
   
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.COMMENT_REPLY);   
                                    }else {
                                        app.showAlert(app.COMMENT_REPLY, "Notification");  
                                    }
                        
                                                         $('#adminTryingComment').remove();

                                    var commentDate = app.formatDate(new Date());
                                    $("#userComments-listview").append('<li><div class="Org-admin-comment-List"><div class="Org-admin-comment-content" style="padding-top:10px;"><a>' + comment + '</a><br/><span class="user-time-span">' + commentDate + ' just now </span></div></div></li>');
                        
                                    //refreshComment();
                                    $("#newAdminComment").val('');
                                }else {
                                    $('#adminTryingComment').remove();
                                    $("#adminCommentPage").hide();
                                    app.showAlert(commentData.status[0].Msg , 'Notification'); 
                                }
                    
                                app.mobileApp.pane.loader.hide();
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
            }
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
        
        function refreshComment() {
            app.userNotiComment.adminComment();
        };
        
        return {
            init: init,
            show: show,
            remove: removeActivity,
            adminComment:adminComment,
            saveAdminComment:saveAdminComment, 
            replyButton:replyButton
        };
    }());
    
    return userActivityViewModel;
}());