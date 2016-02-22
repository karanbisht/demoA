
var app = app || {};

app.userNotiComment = (function () {
    'use strict'
    
    var $commentsContainer,
        listScroller;
    var userActivityViewModel = (function () {      
        var org_id;
        var notiId;  
        var customerID;
        var userCommentsDataSource; 
        var userName;
        var message;
        var title;
        var attached;
        var comment_allow;
        //var pid;
        var type;
        var upload_type;
        var attachedImgFilename;
        var date;
        var msgCount;
        
        var init = function () {
        };
                
        var data;          
        
       
        var show = function (e) {
            app.showAppLoader(true);
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
            
            /*org_id = e.view.params.org_id;
            customerID = e.view.params.customerID;
            userName = e.view.params.userName;
            notiId = e.view.params.notification_id;
            date = e.view.params.date;*/
            
      
            userName = localStorage.getItem("shareTitle");
            org_id = localStorage.getItem("shareOrgId");
            notiId = localStorage.getItem("shareNotiID");
            type = localStorage.getItem("msgType");
            date = localStorage.getItem("shareDate");
            customerID = localStorage.getItem("shareReceiverID");
            msgCount = localStorage.getItem("msgCount");
      
            
            
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
                        return [data];
                    }                   
                },
                                                                          error: function (e) {
                                                                              if (!app.checkConnection()) {
                                                                                  if (!app.checkSimulator()) {
                                                                                      window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                                  }else {
                                                                                      app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                                  } 
                                                                              }else {
                                                                                  if (!app.checkSimulator()) {
                                                                                      window.plugins.toast.showShortBottom(app.ERROR_MESSAGE);
                                                                                  }else {
                                                                                      app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                  }
                                                                                  app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
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
                        //pid = loginData.status[0].notificationList[0].pid;
                        title = loginData.status[0].notificationList[0].title;
                        upload_type = loginData.status[0].notificationList[0].upload_type; 
                        moreDataToLoad();            
                    }

                    $("#personNameTitle").html(title);
                    $("#activityTextMessage").html(message);
                    $("#notiDateadmin").html(date);
                    app.mobileApp.pane.loader.hide();
                });
            });
        };
        
        var moreDataToLoad = function() {           
            document.getElementById("notiAdminImage").innerHTML = "";            
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
                var fp = imgPathData + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename; 
                window.resolveLocalFileSystemURL(fp, imagePathExist, imagePathNotExist);                
            }else if (attached!== null && attached!=='' && attached!=="0" && upload_type==="video") {
                $("#notiAdminImage").hide();
                var notiImageShow = document.getElementById('notiAdminDetailVid');
                notiImageShow.style.display = 'block';
            }
            
            if (comment_allow===0) {
                $("#commentPanel").css("z-index", "-1");
                $("#commentPanel").css("opacity", .4);	
                document.getElementById('commentPanel').style.pointerEvents = 'none';
            }
                       
            $("#personName").html(title);
            $("#activityText").html(message);
                      
            adminComment();
        }
        
        var imagePathExist = function() {
            var imgPathData = app.getfbValue();    
            var fp = imgPathData + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename;                        
            var img = $('<img id="imgShowAdmin" style="max-height:200px" />');
            img.attr('src', fp);
            img.appendTo('#notiAdminImage');
        }
        
        var imagePathNotExist = function() {
            if (!app.checkConnection()) {
            }else {                
                var attachedImg = attached;                        
                var imgPathData = app.getfbValue();    
                var fp = imgPathData + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename;
            
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
                    return app.helper.formatDate(this.get('add_date'));
                },
                User: function () {
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
                        var groupDataShow = [];
                        $.each(data, function(i, groupValue) {
                            var returnMsg = groupValue[0].Msg;
                            if (returnMsg==='Success') {
                                var commentLength = groupValue[0].AllComment.length;                                    
                                for (var j = 0;j < commentLength;j++) {
                                    var dateString = groupValue[0].AllComment[j].add_date;
                                    var split = dateString .split(' ');
                                    var commentDate = app.formatDate(split[0]);
                                    var commentTime = app.formatTime(split[1]);
                                         
                                    groupDataShow.push({
                                                           comment: groupValue[0].AllComment[j].comment,
                                                           add_date: commentDate,
                                                           add_time: commentTime,
                                                           user_type: groupValue[0].AllComment[j].user_type,
                                                           user_id: groupValue[0].AllComment[j].user_id,
                                                           userName:userName
                                                       });
                                }
                            } 
                        });
                       
                        return groupDataShow;
                    }                       
                },
                                                                   error: function (e) {
                                                                       if (!app.checkConnection()) {
                                                                           if (!app.checkSimulator()) {
                                                                               window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                           }else {
                                                                               app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                           } 
                                                                       }else {
                                                                           if (!app.checkSimulator()) {
                                                                               window.plugins.toast.showShortBottom(app.ERROR_MESSAGE);
                                                                           }else {
                                                                               app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                           }
                                                                           app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                       }
                                                                   }
	        
                                                               });         

            $("#userComments-listview").kendoMobileListView({
                                                                template: kendo.template($("#userCommentsTemplate").html()),    		
                                                                dataSource: userCommentsDataSource,
                                                                schema: {
                    model:  userCommentModel
                }			 
                 
                                                            });                                

            app.hideAppLoader();
            saveUserCommentCount();
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
                        window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                    } 
                }else {  
                    var comment = $("#newAdminComment").val();

                    if (comment!=='' && comment!=='Reply') {
                        app.showAppLoader(true);

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
                                    console.log(JSON.stringify(data));
                                    return [data];
                                }
                            },
                                                                                  error: function (e) {
                                                                                      app.hideAppLoader();
                                                                                      console.log(JSON.stringify(e));
                                                                                      app.mobileApp.pane.loader.hide();
                                                                                      
                                                                                      if (!app.checkConnection()) {
                                                                                          if (!app.checkSimulator()) {
                                                                                              window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                                          }else {
                                                                                              app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                                          } 
                                                                                      }else {
                                                                                          if (!app.checkSimulator()) {
                                                                                              window.plugins.toast.showShortBottom(app.ERROR_MESSAGE);
                                                                                          }else {
                                                                                              app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                          }
                                                                                          app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                                      }
                                                                                  }               
                                                                              });  
	            
                        saveCommentDataSource.fetch(function() {
                            var commentDataView = saveCommentDataSource.data();
                            $.each(commentDataView, function(i, commentData) {           
                                app.mobileApp.pane.loader.hide();
                                if (commentData.status[0].Msg === 'Reply sent successfully') {
                                    app.hideAppLoader();
                           
                                    $('#newAdminComment').css('height', '35px');
   
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.COMMENT_REPLY);   
                                    }else {
                                        app.showAlert(app.COMMENT_REPLY, "Notification");  
                                    }
                        
                                    $('#adminTryingComment').remove();

                                    var commentDate = app.formatDate(new Date());
                                    $("#userComments-listview").append('<li><div class="Org-admin-comment-List"><div class="Org-admin-comment-content" style="padding-top:10px;"><a>' + comment + '</a><br/><span class="user-time-span">' + commentDate + ' just now </span></div></div></li>');
                        
                                    $("#newAdminComment").val('');
                                }else {
                                    $('#adminTryingComment').remove();
                                    app.hideAppLoader();
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
        
        function refreshComment() {
            app.userNotiComment.adminComment();
        }
        
        function saveUserCommentCount(){
            var db = app.getDb();
            db.transaction(insertMemCount, app.errorCB, app.successCB); 
        }
        
        function insertMemCount(tx){
            var query = "SELECT id FROM ADMIN_MSG_MEM where org_id=" + org_id +" and id ="+notiId +" and customerID="+customerID;
            app.selectQuery(tx, query, insertMebCountVal);    
        }
        
        function insertMebCountVal(tx, results) {
            var count = results.rows.length; 
                if(count===0){
                            var query = 'INSERT INTO ADMIN_MSG_MEM (org_id ,id , count ,customerID) VALUES ("'
                            + org_id
                            + '","'
                            + notiId
                            + '","'
                            + msgCount 
                            + '","'
                            + customerID
                            + '")';              
                 app.insertQuery(tx, query);
                }else{
                    var query2 = "UPDATE ADMIN_MSG_MEM SET count='" + msgCount + "' where org_id='" + org_id + "' and id="+notiId+" and customerID="+customerID;
                    app.updateQuery(tx, query2);
                }

        }

        
        return {
            init: init,
            show: show,
            adminComment:adminComment,
            saveAdminComment:saveAdminComment
        };
    }());
    
    return userActivityViewModel;
}());