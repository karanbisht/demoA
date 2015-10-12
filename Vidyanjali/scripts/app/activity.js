var app = app || {};
app.Activity = (function () {
    'use strict';
    
    var $commentsContainer;    
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
    var upload_type;
    var attachedImgFilename;
    var device_type;
    var sdcardPath;
    
    
    var activityViewModel = (function () {
        var activityUid;
        var data;          
        
        var init = function () {

        };
        var show = function (e) {
            app.mobileApp.pane.loader.hide();
            $(".km-scroll-container").css("-webkit-transform", "");              
            device_type = localStorage.getItem("DEVICE_TYPE"); 
            sdcardPath = localStorage.getItem("sdCardPath");
            groupDataShow = [];  
            $('#notiImage').html('');
            $('#newComment').val(' '); 
            $commentsContainer = $('#comments-listview');
            $commentsContainer.empty();                    
            $('#newComment').css('height', '35px');
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
            
            var notiImageShow = document.getElementById('notiDetailVid');
            notiImageShow.style.display = 'none';
            
    		message = localStorage.getItem("shareMsg");
            title = localStorage.getItem("shareTitle");
            org_id = localStorage.getItem("shareOrgId");
            notiId = localStorage.getItem("shareNotiID");
            account_Id = localStorage.getItem("ACCOUNT_ID");
            comment_allow = localStorage.getItem("shareComAllow");
            attached = localStorage.getItem("shareImg");
            type = localStorage.getItem("shareType");
            date = localStorage.getItem("shareDate");
            upload_type = localStorage.getItem("shareUploadType");
            
            message = app.proURIDecoder(message);
            title = app.proURIDecoder(title);
             
            app.mobileApp.pane.loader.hide();

            
            if ((title==='' || title==='null' || title===null) && (message==='' || message==='null' || message===null)) {
                $('#titleContainer').hide();
            }
            if (attached!== null && attached!== 'null' && attached!=='' && attached!=="0" && upload_type==="other") {
                $("#notiImageDiv").show();                
                app.mobileApp.pane.loader.hide();
                $('#notiImage').css({"max-height":"200px"});
                $('#notiImage').css({"margin-top":"10px"});
                attachedImgFilename = attached.replace(/^.*[\\\/]/, '');
                var ext = app.getFileExtension(attachedImgFilename);
                if (ext==='') {
                   attachedImgFilename = attachedImgFilename + '.jpg'; 
                }
                var fp = sdcardPath + app.SD_NAME+"/" + 'Zaffio_img_'+attachedImgFilename; 
                window.resolveLocalFileSystemURL(fp, imagePathExist, imagePathNotExist);                
            }else if(attached!== null && attached!== 'null' && attached!=='' && attached!=="0" && upload_type==="video"){
               $("#notiImageDiv").hide();
                var notiImageShow = document.getElementById('notiDetailVid');
                notiImageShow.style.display = 'block';
            }
                        
            if (comment_allow===1 || comment_allow==='1') {
                $("#commentPanel").show();
                $("#commentPanel").css("z-index", "1");
                $("#commentPanel").css("opacity", 1);	                
                $("#newComment").val('');
                $("#newComment").attr("placeholder","Reply");
            }else {                
                $("#commentPanel").css("z-index", "-1");
                $("#commentPanel").css("opacity", .4);	
                $("#newComment").val('');
                $("#newComment").attr("placeholder", "Reply not allowed.");
            }
            
            $("#personName").html(title);
            $("#activityText").html(message);
            $("#notiDate").html(date);
                                       
            var db = app.getDb();		                 
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
                db.transaction(getDataOrgNotiComment, app.errorCB, showOfflineData);      
            }else {
                db.transaction(getDataOrgNotiComment, app.errorCB, firstShowOfflineData);      
            }      
        };
        
        var imagePathExist = function() {
            app.mobileApp.pane.loader.hide();
            console.log('Image already Downloaded');
            var fp = sdcardPath + app.SD_NAME+"/" + 'Zaffio_img_' + attachedImgFilename;            
            var img = $('<img id="imgShow" style="max-height:150px;margin:-2px -6px -6px -6px"/>');
            img.attr('src', fp);
            img.appendTo('#notiImage'); 
            //console.log(fp);              
        }
        
        var imagePathNotExist = function() {             
            if (!app.checkConnection()) {
            
            }else{                
                app.mobileApp.pane.loader.hide();
                var attachedImg = attached;                        
                var fp = sdcardPath + app.SD_NAME+"/" + 'Zaffio_img_' + attachedImgFilename;
            
                var img = $('<img id="imgShow" style="max-height:150px;margin:-2px -6px -6px -6px"/>'); //Equivalent: $(document.createElement('img'))      
                img.attr('src', attachedImg);
                img.appendTo('#notiImage'); 
 	
                var fileTransfer = new FileTransfer();              
                fileTransfer.download(attachedImg, fp, 
                                  function(entry) {
                                      app.mobileApp.pane.loader.hide();
                                      console.log('Image Downloaded');
                                  },
    
                                  function(error) {
                                      $("#progressChat").hide();
                                      console.log('Error in Image Downloading');
                                  }
                );                
            }


        }
        
    
        
        var storeImageClick = function(){

            var fp = sdcardPath + app.SD_NAME+"/" + 'Zaffio_img_' + attachedImgFilename;   
            
                                      if(device_type==="AP"){
                                          window.open(fp, '_blank' , 'EnableViewPortScale=yes');
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }            
        }
        
        
        var commentShow = function() {            
            app.mobileApp.pane.loader.hide();
            $("#progressChat").show();

            
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
                                
                    data: function(data) {               
                        return [data];
                    }                       
                },
                                                               error: function (e) {
                                                                   $("#progressChat").hide();                                                                   
                                                                              
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }                                                                  
                                                                   
                                                               }
	        
                                                           });         
            
            

            commentsDataSource.fetch(function() {
                        var data = this.data();
                        var orgNotiCommentData;
                        app.mobileApp.pane.loader.hide();


                              if (data[0]['status'][0].Msg ==='No Comments') { 

                              }else if (data[0]['status'][0].Msg==='Success') {
                                var commentLength = data[0]['status'][0].AllComment.length;                              
                                orgNotiCommentData = data[0]['status'][0].AllComment;
                                //console.log(commentLength);

                                  app.mobileApp.pane.loader.hide();

                               
                                totalComment=totalComment+commentLength;

                                for (var j = 0;j < commentLength;j++) {
                                    var dateString = data[0]['status'][0].AllComment[j].add_date;
                                    var split = dateString .split(' ');
                                    var commentDate = app.formatDate(split[0]);
                                    var commentTime = app.formatTime(split[1]);
                                         
                                    groupDataShow.push({
                                                           comment: data[0]['status'][0].AllComment[j].comment,
                                                           add_date: commentDate,
                                                           add_time: commentTime,
                                                           user_id : data[0]['status'][0].AllComment[j].user_id,
                                                           user_type : data[0]['status'][0].AllComment[j].user_type
                                                       });
                                }
                                showAllData();
                                saveOrgNotiComment(orgNotiCommentData);                                                                                                                         
                              }
                saveCommentCount();

            });
                                    
            $("#progressChat").hide();
            
            app.mobileApp.pane.loader.hide();
            

        };
        
        
        
        var showOfflineData = function() {
            
            var offlineDBData = new kendo.data.DataSource({
                                 data: groupDataShow
                                                                         });                        
                        app.mobileApp.pane.loader.hide();

            $("#comments-listview").kendoMobileListView({
                                           template: kendo.template($("#commentsTemplate").html()),    		
                                           dataSource: offlineDBData                                                            
            });
                        app.mobileApp.pane.loader.hide();

                        
        };
        
        
        var firstShowOfflineData = function() {
            
            var offlineDBData = new kendo.data.DataSource({
                                 data: groupDataShow
                                                                         });                        
                        app.mobileApp.pane.loader.hide();

            $("#comments-listview").kendoMobileListView({
                                           template: kendo.template($("#commentsTemplate").html()),    		
                                           dataSource: offlineDBData                                                            
            });
                        app.mobileApp.pane.loader.hide();

            
            commentShow();
        };
        
        
        var showAllData = function() {
            
            var offlineDBData = new kendo.data.DataSource({
                                 data: groupDataShow
                                                                         });                        
                        app.mobileApp.pane.loader.hide();

            $("#comments-listview").kendoMobileListView({
                                           template: kendo.template($("#commentsTemplate").html()),    		
                                           dataSource: offlineDBData                                                            
            });
                        app.mobileApp.pane.loader.hide();

        };
        
        
         
        var orgNotiCommentDataVal;
        function saveOrgNotiComment(data) {
            orgNotiCommentDataVal = data;      
            var db = app.getDb();
            db.transaction(insertOrgNotiCommentData, app.errorCB, app.successCB);            
        };
        
        function saveCommentCount(){
            var db = app.getDb();
            db.transaction(insertTotalCommentCount, app.errorCB, app.successCB);            
        }
        
        function insertTotalCommentCount(tx) {
            var query = "UPDATE ORG_NOTIFICATION SET adminReply='" + totalComment + "' where org_id='" + org_id + "' and pid='"+notiId+"'";
            app.updateQuery(tx, query);
        }
        
        function insertOrgNotiCommentData(tx) {
            var dataLength = orgNotiCommentDataVal.length; 
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
            orgLogoToShow = results.rows.item(0).imageSource
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
        
        var totalComment = 0
            
        function getOrgNotiCommentDataSuccess(tx, results) {
            var count = results.rows.length;  
            totalComment=count;
            
            if (count !== 0) {
                groupDataShow = [];
                for (var i = 0 ; i < count ; i++) {    
                    var dateString = results.rows.item(i).add_date;
                    var split = dateString .split(' ');                    
                    var commentDate = app.formatDate(split[0]);                    
                    var commentTime = app.formatTime(split[1]);
                    
                    groupDataShow.push({
                                           comment: results.rows.item(i).comment,
                                           add_date: commentDate,
                                           add_time: commentTime,
                                           user_id : results.rows.item(i).user_id,
                                           user_type : results.rows.item(i).user_type
                                       });                    
                    lastNotiCommentID = results.rows.item(i).id;
                }    
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
              //  console.log("karan bisht" + count);
            if (count !== 0) {
                for (var i = 0; i < count; i++) {
                    var ReplyText = results.rows.item(i).ReplyText;
                    var CreatedAt = results.rows.item(i).CreatedAt;
                    var UserNameofflineValue = results.rows.item(i).UserNameField;
                    
                    var template;
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
           // console.log("Query Success");
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
  
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {  
                
                var comment = $("#newComment").val();
                

 
                if (comment!=='' && comment!=='Reply') {
                
                    $("#progressChat").show();
                    
                    
                    $("#comments-listview").append('<li id="tryingComment"><div class="user-comment-List"  id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a>'+comment+'</a><br/><span class="user-time-span"> Sending.. </span></div></div></li>');                                
                    $('#newComment').css('height', '35px');
                    $("#newComment").val('');


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
                                return [data];
                            }
                        },
                                                                               error: function (e) {
                                                                                  //console.log(JSON.stringify(e));
                                                                                  $("#progressChat").hide();
                                                                              
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }

                                                                              }               
                                                                          });  
	            
                    saveCommentDataSource.fetch(function() {
                        var commentDataView = saveCommentDataSource.data();
                        $.each(commentDataView, function(i, commentData) {           
                            if (commentData.status[0].Msg === 'Reply sent successfully') {
                                $("#progressChat").hide();
                                lastNotiCommentID = lastNotiCommentID + 1;
                                $('#newComment').css('height', '35px');
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.COMMENT_REPLY);   
                                }else {
                                    app.showAlert(app.COMMENT_REPLY, "Notification");                                      
                                }
                                
                                $('#tryingComment').remove();
                                var commentDate = app.formatDate(new Date());
                                $("#comments-listview").append('<li><div class="user-comment-List"  id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a>'+comment+'</a><br/><span class="user-time-span">'+commentDate+' just now </span></div></div></li>');                                
                                 
                                $("#newComment").val('');
                                increaseCommentCount();
                            }else {
                                $("#progressChat").hide();
                                $('#adminTryingComment').remove();
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
        
        function increaseCommentCount(){
            var db = app.getDb();
            db.transaction(insertCommentCount, app.errorCB, app.successCB);            
        }
        
        function insertCommentCount(tx) {
            var query = "UPDATE ORG_NOTIFICATION SET adminReply= adminReply+1 where org_id='" + org_id + "' and pid='"+notiId+"'";
            app.updateQuery(tx, query);
        }
        
         var goToBackPage = function(){
            var gotNoti = localStorage.getItem("gotNotification");             
             if(gotNoti===1 || gotNoti==='1'){
                 app.onLoad();
             }else{
               app.mobileApp.navigate('#view-all-activities');  
             }
        }

		
        return {
            init: init,
            show: show,
            goToBackPage:goToBackPage,
            saveComment:saveComment,
            storeImageClick:storeImageClick,
            commentShow:commentShow
        };
    }());
    
    return activityViewModel;
}());