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
    var date;
    var upload_type;
    var attachedImgFilename;
    var device_type;
    var sdcardPath;
    var msgCount;
    var topOffset;
    
    var activityViewModel = (function () {
        var data;          
        
        var init = function () {
            
        };
        
        var show = function (e) {            
            $(".km-scroll-container").css("-webkit-transform", ""); 
            app.mobileApp.pane.loader.hide();
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
            //type = localStorage.getItem("shareType");
            date = localStorage.getItem("shareDate");
            upload_type = localStorage.getItem("shareUploadType");
            msgCount = localStorage.getItem("msgCount");
            
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
                var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename; 
                window.resolveLocalFileSystemURL(fp, imagePathExist, imagePathNotExist);                
            }else if (attached!== null && attached!== 'null' && attached!=='' && attached!=="0" && upload_type==="video") {
                $("#notiImageDiv").hide();
                var notiImageShow = document.getElementById('notiDetailVid');
                notiImageShow.style.display = 'block';
            }
                        
            if (comment_allow===1 || comment_allow==='1') {
                $("#commentPanel").show();
                $("#commentPanel").css("z-index", "1");
                $("#commentPanel").css("opacity", 1);	                
                $("#newComment").val('');
                $("#newComment").attr("placeholder", "Reply");
            }else {                
                $("#commentPanel").css("z-index", "-1");
                $("#commentPanel").css("opacity", .4);	
                $("#newComment").val('');
                $("#newComment").attr("placeholder", "Reply not allowed.");
            }
            
            $("#personName").html(title);
            $("#activityText").html(message);
            $("#notiDate").html(date);
                   
            //topOffset = scroller.find(".km-scroll-container").position().top;
            

            app.showAppLoader(true);
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
            var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename;            
            var img = $('<img id="imgShow" style="max-height:150px;margin:-2px -6px -6px -6px"/>');
            img.attr('src', fp);
            img.appendTo('#notiImage'); 
        }
        
        var imagePathNotExist = function() {             
            if (!app.checkConnection()) {
            }else {                
                app.mobileApp.pane.loader.hide();
                var attachedImg = attached;                        
                var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename;
            
                var img = $('<img id="imgShow" style="max-height:150px;margin:-2px -6px -6px -6px"/>'); //Equivalent: $(document.createElement('img'))      
                img.attr('src', attachedImg);
                img.appendTo('#notiImage'); 
 	
                var fileTransfer = new FileTransfer();              
                fileTransfer.download(attachedImg, fp, 
                                      function(entry) {
                                          app.mobileApp.pane.loader.hide();
                                      },
    
                                      function(error) {
                                          app.hideAppLoader();
                                      }
                    );                
            }
        }
        
        var storeImageClick = function() {
            var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename;               
            if (device_type==="AP") {
                window.open(fp, '_blank' , 'EnableViewPortScale=yes');
            }else {
                window.plugins.fileOpener.open(fp);
            }            
        }
        
        var commentShow = function() {            
            app.showAppLoader(true); 
            commentsDataSource = new kendo.data.DataSource({
                                                               transport: {
                    read: {
                                                                           url: app.serverUrl() + "notification/getNotificationComment/" + org_id + "/" + notiId + "/" + account_Id + "/" + lastNotiCommentID,
                                                                           type:"POST",
                                                                           dataType: "json"                                                                                           
                                                                       }
                },
                                                               schema: {
                                
                    data: function(data) { 
                        //console.log(JSON.stringify(data));
                        return [data];
                    }                       
                },
                                                               error: function (e) {
                                                                   app.hideAppLoader();
                                                                   //console.log(JSON.stringify(e));                                                                              
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

            commentsDataSource.fetch(function() {
                var data = this.data();
                var orgNotiCommentData;
                app.mobileApp.pane.loader.hide();

                if (data[0]['status'][0].Msg ==='No Comments') { 
                }else if (data[0]['status'][0].Msg==='Success') {
                    var commentLength = data[0]['status'][0].AllComment.length;                              
                    orgNotiCommentData = data[0]['status'][0].AllComment;                               
                    totalComment = totalComment + commentLength;

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
            app.hideAppLoader();
        };
        
        var showOfflineData = function() {
            var offlineDBData = new kendo.data.DataSource({
                                                              data: groupDataShow
                                                          });                        
            //app.mobileApp.pane.loader.hide();

            $("#comments-listview").kendoMobileListView({
                                                            template: kendo.template($("#commentsTemplate").html()),    		
                                                            dataSource: offlineDBData                                                            
                                                        });
            //app.mobileApp.pane.loader.hide();
            app.hideAppLoader();
            //scrollToBottom();
        };
        
        var firstShowOfflineData = function() {
            var offlineDBData = new kendo.data.DataSource({
                                                              data: groupDataShow
                                                          });                        
            //app.mobileApp.pane.loader.hide();

            $("#comments-listview").kendoMobileListView({
                                                            template: kendo.template($("#commentsTemplate").html()),    		
                                                            dataSource: offlineDBData                                                            
                                                        });
            //app.mobileApp.pane.loader.hide();
            //scrollToBottom();
            commentShow();
        };
        
        var showAllData = function() {
            var offlineDBData = new kendo.data.DataSource({
                                                              data: groupDataShow
                                                          });                        
            //app.mobileApp.pane.loader.hide();

            $("#comments-listview").kendoMobileListView({
                                                            template: kendo.template($("#commentsTemplate").html()),    		
                                                            dataSource: offlineDBData                                                            
                                                        });
            //app.mobileApp.pane.loader.hide();
            //scrollToBottom();
            app.hideAppLoader();
        };
         
        var orgNotiCommentDataVal;
        function saveOrgNotiComment(data) {
            orgNotiCommentDataVal = data;      
            var db = app.getDb();
            db.transaction(insertOrgNotiCommentData, app.errorCB, app.successCB);            
        };
        
        function saveCommentCount() {
            var db = app.getDb();
            db.transaction(insertTotalCommentCount, app.errorCB, app.successCB);            
        }
        
        function insertTotalCommentCount(tx) {
            var query = "UPDATE ORG_NOTIFICATION SET adminReply='" + totalComment + "' where org_id='" + org_id + "' and pid='" + notiId + "'";
            app.updateQuery(tx, query);
            
            var query1 = "SELECT id FROM ADMIN_MSG_RPY where org_id='" + org_id +"' and id ='"+notiId+"'";
            app.selectQuery(tx, query1, commentCountVal);
        }
        
         
        function commentCountVal(tx, results) {
            var count = results.rows.length; 
                if(count===0){
                            var query = 'INSERT INTO ADMIN_MSG_RPY(org_id ,id , count) VALUES ("'
                            + org_id
                            + '","'
                            + notiId
                            + '","'
                            + msgCount                                                       
                            + '")';              
                 app.insertQuery(tx, query);
                }else{
                    var query2 = "UPDATE ADMIN_MSG_RPY SET count='" + msgCount + "' where org_id='" + org_id + "' and id='"+notiId+"'";
                    app.updateQuery(tx, query2);
                }
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
        
        function getOrgLogoDataSuccess(tx, results) {
            orgLogoToShow = results.rows.item(0).imageSource
        }  
      
        function orgLogoShow() {
            if (orgLogoToShow!==null && orgLogoToShow!=='null' && orgLogoToShow!=='') {
                $("#orgLogoImg").attr('src', orgLogoToShow);
            }else {
                $("#orgLogoImg").attr('src', 'styles/images/habicon.png');
            }
        }  
        
        var getDataOrgNotiComment = function(tx) {
            var query = 'SELECT * FROM ORG_NOTI_COMMENT where notification_id=' + notiId ;
            app.selectQuery(tx, query, getOrgNotiCommentDataSuccess);
        };    
        
        var totalComment = 0
            
        function getOrgNotiCommentDataSuccess(tx, results) {
            var count = results.rows.length;  
            totalComment = count;
            
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
                    app.showAppLoader();
                    $("#comments-listview").append('<li id="tryingComment1"><div class="user-comment-List"  id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a>' + comment + '</a><br/><span class="user-time-span"> Sending.. </span></div></div></li>');                                
                    $('#newComment').css('height', '35px');
                    $("#newComment").val('');

                    var jsonDatacomment = {"notification_id":notiId ,"customer_id":account_Id,"comment":comment, "org_id":org_id};                   
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
                                                                                  app.hideAppLoader();
                                                                                  $('#tryingComment1').remove();
                                                                                  $("#comments-listview").append('<li id="errorMsgComment1"><div class="user-comment-List"  id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a>' + comment + '</a><br/><span class="user-time-span"> Error , message not sent </span></div></div></li>');                                                                                                                  
                                                                                  document.getElementById("comments-listview").value=comment;
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
                            if (commentData.status[0].Msg === 'Reply sent successfully') {
                                app.hideAppLoader();
                                lastNotiCommentID = lastNotiCommentID + 1;
                                $('#newComment').css('height', '35px');
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.COMMENT_REPLY);   
                                }else {
                                    app.showAlert(app.COMMENT_REPLY, "Notification");                                      
                                }
                                
                                $('#tryingComment1').remove();
                                $('#errorMsgComment1').remove();
                                var commentDate = app.formatDate(new Date());
                                $("#comments-listview").append('<li><div class="user-comment-List"  id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a>' + comment + '</a><br/><span class="user-time-span">' + commentDate + ' just now </span></div></div></li>');                                
                                 
                                $("#newComment").val('');
                                increaseCommentCount();
                            }else {
                                app.hideAppLoader();
                                $('#tryingComment1').remove();
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
        
        function increaseCommentCount() {
            var db = app.getDb();
            db.transaction(insertCommentCount, app.errorCB, app.successCB);            
        }
        
        function insertCommentCount(tx) {
            var query = "UPDATE ORG_NOTIFICATION SET adminReply= adminReply+1 where org_id='" + org_id + "' and pid='" + notiId + "'";
            app.updateQuery(tx, query);
        }
        
        var goToBackPage = function() {
            var gotNoti = localStorage.getItem("gotNotification");             
            if (gotNoti===1 || gotNoti==='1') {
                app.onLoad();
            }else {
                app.mobileApp.navigate('#view-all-activities');  
            }
        }
        
        
        function scrollToBottom() {
            
            /*//var listview = $("#comments-listview").data("kendoMobileListView"); 
            //var scroller = listview.scroller();
            var docHeight = $(document).height();
            //$("#comments-listview").data("kendoMobileScroller").scrollTo(-30, -30);
            var scrollHeight = $("#status-container").data("kendoMobileScroller").scrollHeight();
            var showHeight = scrollHeight - docHeight+100;
            console.log(showHeight);
            
            $("#status-container").data("kendoMobileScroller").scrollTo(0, -showHeight);
            //$('#status-container').scrollTop($('#status-container')[0].scrollHeight);

            //$(".km-scroll-container").css("-webkit-transform", "translate3d(0px, -"+showHeight+"px, 0px) scale(1)");            
            */
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