var app = app || {};

app.adminUserActivity = (function () {
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
    var admReceiverID;
    var type;
    var frmWhere;
    var senderType;
    var msgCount;
    
    var userAdmViewModel = (function () {
        var data;                  
        var init = function () {
        };
        
        function deleteData(tx){
            var query = "DELETE FROM USER_TO_ADM";
            app.deleteQuery(tx, query);
        }
        
        var show = function (e) {
            //var db = app.getDb();
            //db.transaction(deleteData, app.errorCB, app.successCB);                          
            
            app.mobileApp.pane.loader.hide();
            $(".km-scroll-container").css("-webkit-transform", "");              
            device_type = localStorage.getItem("DEVICE_TYPE"); 
            sdcardPath = localStorage.getItem("sdCardPath");
            frmWhere = localStorage.getItem("frmWhere");
            msgCount = localStorage.getItem("msgCount");
            if(frmWhere==='Admin'){
                senderType='A';
            }else{
                senderType='C';
            }
            groupDataShow = [];  
            $('#uAnotiImage').html('');
            $('#uAnewComment').val(' '); 
            $commentsContainer = $('#uAcomments-listview');
            $commentsContainer.empty();                    
            $('#uAnewComment').css('height', '35px');
            var txt = $('#uAnewComment'),
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
            
            var notiImageShow = document.getElementById('uAnotiDetailVid');
            notiImageShow.style.display = 'none';
            
            message = localStorage.getItem("shareMsg");
            title = localStorage.getItem("shareTitle");
            org_id = localStorage.getItem("shareOrgId");
            notiId = localStorage.getItem("shareNotiID");
            account_Id = localStorage.getItem("ACCOUNT_ID");
            comment_allow = localStorage.getItem("shareComAllow");
            attached = localStorage.getItem("shareImg");
            type = localStorage.getItem("msgType");
            date = localStorage.getItem("shareDate");
            upload_type = localStorage.getItem("shareUploadType");
            admReceiverID = localStorage.getItem("shareReceiverID");
            
            //alert(admReceiverID);
            
            message = app.proURIDecoder(message);
            title = app.proURIDecoder(title);
             
            app.mobileApp.pane.loader.hide();
            
            //alert(account_Id+"--------"+admReceiverID);
            if ((title==='' || title==='null' || title===null) && (message==='' || message==='null' || message===null)) {
                $('#uAtitleContainer').hide();
            }
            
            if (attached!== null && attached!== 'null' && attached!=='' && attached!=="0" && upload_type==="other") {
                $("#uAnotiImageDiv").show();                
                app.mobileApp.pane.loader.hide();
                $('#uAnotiImage').css({"max-height":"200px"});
                $('#uAnotiImage').css({"margin-top":"10px"});
                attachedImgFilename = attached.replace(/^.*[\\\/]/, '');
                var ext = app.getFileExtension(attachedImgFilename);
                if (ext==='') {
                    attachedImgFilename = attachedImgFilename + '.jpg'; 
                }
                var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename; 
                window.resolveLocalFileSystemURL(fp, imagePathExist, imagePathNotExist);                
            }else if (attached!== null && attached!== 'null' && attached!=='' && attached!=="0" && upload_type==="video") {
                $("#uAnotiImageDiv").hide();
                var notiImageShow = document.getElementById('uAnotiDetailVid');
                notiImageShow.style.display = 'block';
            }
                        
            if (comment_allow===1 || comment_allow==='1') {
                $("#uAcommentPanel").show();
                $("#uAcommentPanel").css("z-index", "1");
                $("#uAcommentPanel").css("opacity", 1);	                
                $("#uAnewComment").val('');
                $("#uAnewComment").attr("placeholder", "Reply");
            }else {                
                $("#uAcommentPanel").css("z-index", "-1");
                $("#uAcommentPanel").css("opacity", .4);	
                $("#uAnewComment").val('');
                $("#uAnewComment").attr("placeholder", "Reply not allowed.");
            }
            
            $("#uApersonName").html(title);
            $("#activityText").html(message);
            $("#userAdmNotiDate").html(date);
                                       
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
            img.appendTo('#uAnotiImage'); 
        }
        
        var imagePathNotExist = function() {             
            if (!app.checkConnection()) {
            }else {                
                app.mobileApp.pane.loader.hide();
                var attachedImg = attached;                        
                var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename;
            
                var img = $('<img id="imgShow" style="max-height:150px;margin:-2px -6px -6px -6px"/>'); //Equivalent: $(document.createElement('img'))      
                img.attr('src', attachedImg);
                img.appendTo('#uAnotiImage'); 
 	
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
            app.showAppLoader(); 
            console.log("notification/chatHistory/" + account_Id + "/" + admReceiverID + "/" + org_id +"/" + lastNotiCommentID);
            commentsDataSource = new kendo.data.DataSource({
                                                               transport: {
                    read: {
                                                                           url: app.serverUrl() + "notification/chatHistory/" + account_Id + "/" + admReceiverID + "/" + org_id +"/" + lastNotiCommentID,
                                                                           type:"POST",
                                                                           dataType: "json"                                                                                           
                                                                       }
                },
                                                               schema: {
                                
                    data: function(data) {      
                        console.log(JSON.stringify(data));
                        return [data];
                    }                       
                },
                                                               error: function (e) {

                                                                   console.log(JSON.stringify(e));

                                                                   app.hideAppLoader();
                                                                              
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
                                                                       //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                   }                                                                  
                                                               }
	        
                                                           });         

            commentsDataSource.fetch(function() {
                var data = this.data();
                var orgNotiCommentData;
                app.mobileApp.pane.loader.hide();

                if (data[0]['status'][0].Msg ==='No Message') {
                    
                }else if (data[0]['status'][0].Msg==='Success') {
                    var commentLength = data[0]['status'][0].AllMessage.length;                              
                    orgNotiCommentData = data[0]['status'][0].AllMessage;                               
                    totalComment = totalComment + commentLength;

                    for (var j = 0;j < commentLength;j++) {
                        var dateString = data[0]['status'][0].AllMessage[j].date;
                        var split = dateString .split(' ');
                        var commentDate = app.formatDate(split[0]);
                        var commentTime = app.formatTime(split[1]);
                                         
                        groupDataShow.push({
                                               org_id: data[0]['status'][0].AllMessage[j].org_id,
                                               id:data[0]['status'][0].AllMessage[j].pid,
                                               comment: data[0]['status'][0].AllMessage[j].message,
                                               add_date: commentDate,
                                               add_time: commentTime,
                                               user_id: account_Id,
                                               frmWhere:frmWhere,
                                               sender_id : data[0]['status'][0].AllMessage[j].sender_id,
                                               reveiver_id : data[0]['status'][0].AllMessage[j].receiver_id
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
            app.mobileApp.pane.loader.hide();

            $("#uAcomments-listview").kendoMobileListView({
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

            $("#uAcomments-listview").kendoMobileListView({
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

            $("#uAcomments-listview").kendoMobileListView({
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
        
        function saveCommentCount() {
            var db = app.getDb();
            db.transaction(insertTotalCommentCount, app.errorCB, app.successCB);            
        }
        
        var dbName;
        function insertTotalCommentCount(tx) {
          var type = localStorage.getItem("frmWhere");
          if(type==='Admin'){  
            dbName='ADMIN_OTO';  
            var query = "SELECT id FROM ADMIN_OTO where org_id=" + org_id +" and id ="+admReceiverID;
            app.selectQuery(tx, query, insertCountVal);
          }else{
            dbName='USER_OTO';  
            var query1 = "SELECT id FROM USER_OTO where org_id=" + org_id +" and id ="+admReceiverID;
            app.selectQuery(tx, query1, insertCountVal);  
          }  
            //var query = "UPDATE ORG_NOTIFICATION SET adminReply='" + totalComment + "' where org_id='" + org_id + "' and receiver_id='" + admReceiverID + "'";
            //app.updateQuery(tx, query);
        }
        
        
        function insertCountVal(tx, results) {
            var count = results.rows.length; 
                if(count===0){
                            var query = 'INSERT INTO '+dbName+'(org_id ,id , count) VALUES ("'
                            + org_id
                            + '","'
                            + admReceiverID
                            + '","'
                            + msgCount                                                       
                            + '")';              
                 app.insertQuery(tx, query);
                }else{
                    var query2 = "UPDATE "+dbName+" SET count='" + msgCount + "' where org_id='" + org_id + "' and id="+admReceiverID;
                    app.updateQuery(tx, query2);
                }
        }
        
        
        function insertOrgNotiCommentData(tx) {
            var dataLength = orgNotiCommentDataVal.length; 
            //alert(dataLength);
            for (var i = 0;i < dataLength;i++) {       
                var query = 'INSERT INTO USER_TO_ADM(org_id,id,message,add_date,receiver,sender,user_id) VALUES ("'
                            + orgNotiCommentDataVal[i].org_id
                            + '","'
                            + orgNotiCommentDataVal[i].pid
                            + '","'
                            + orgNotiCommentDataVal[i].message
                            + '","'
                            + orgNotiCommentDataVal[i].date
                            + '","'
                            + orgNotiCommentDataVal[i].receiver_id
                            + '","'
                            + orgNotiCommentDataVal[i].sender_id
                            + '","'
                            + account_Id
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
            
            var query = "SELECT * FROM USER_TO_ADM where org_id='"+org_id+"' and ((receiver='"+ admReceiverID+"' and sender='"+ account_Id+"') OR (receiver='"+ account_Id+"' and sender='"+admReceiverID+"'))" ;
            app.selectQuery(tx, query, getOrgNotiCommentDataSuccess);
            
        };    
        
        var totalComment = 0
            
        function getOrgNotiCommentDataSuccess(tx, results) {
            var count = results.rows.length;
            //alert(count);
            totalComment = count;           
            if (count !== 0) {
                groupDataShow = [];
                for (var i = 0 ; i < count ; i++) {    
                    var dateString = results.rows.item(i).add_date;
                    var split = dateString .split(' ');                    
                    var commentDate = app.formatDate(split[0]);                    
                    var commentTime = app.formatTime(split[1]);                    
                    groupDataShow.push({
                                           org_id: results.rows.item(i).org_id,
                                           id:results.rows.item(i).id,
                                           comment: results.rows.item(i).message,
                                           add_date: commentDate,
                                           add_time: commentTime,
                                           user_id: results.rows.item(i).user_id,
                                           frmWhere:frmWhere,
                                           sender_id : results.rows.item(i).sender,
                                           reveiver_id : results.rows.item(i).receiver
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
                var comment = $("#uAnewComment").val(); 
                if (comment!=='' && comment!=='Reply') {                
                    app.showAppLoader();
                    $("#uAcomments-listview").append('<li id="tryingComment"><div class="user-comment-List"  id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a>' + comment + '</a><br/><span class="user-time-span"> Sending.. </span></div></div></li>');                                
                    $('#uAnewComment').css('height', '35px');
                    $("#uAnewComment").val('');

                    console.log('---------------------------'+senderType);
                    var jsonDatacomment = {"sender":account_Id,"receiver":admReceiverID ,"message":comment,"org_id":org_id,"sender_type":senderType};
                   
                    var saveCommentDataSource = new kendo.data.DataSource({
                                                                              transport: {
                            read: {
                                                                                          url: app.serverUrl() + "notification/onetwoone",
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
                                                                                  console.log(JSON.stringify(e));
                                                                                  app.hideAppLoader();
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
                                                                                      //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                                  }
                                                                              }               
                                                                          });  
	            
                    saveCommentDataSource.fetch(function() {
                        var commentDataView = saveCommentDataSource.data();
                        $.each(commentDataView, function(i, commentData) {           
                            if (commentData.status[0].Msg === 'Success') {
                                app.hideAppLoader();
                                lastNotiCommentID = lastNotiCommentID + 1;
                                $('#uAnewComment').css('height', '35px');
                                
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NOTIFICATION_MSG_SENT);   
                                }else {
                                    app.showAlert(app.NOTIFICATION_MSG_SENT, "Notification");                                      
                                }
                                
                                $('#tryingComment').remove();
                                var commentDate = app.formatDate(new Date());
                                $("#uAcomments-listview").append('<li><div class="user-comment-List"  id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a>' + comment + '</a><br/><span class="user-time-span">' + commentDate + ' just now </span></div></div></li>');                                
                                 
                                $("#uAnewComment").val('');
                                app.Activities.getAdminSentMsg();
                                //increaseCommentCount();
                            }else if (data[0]['status'][0].Msg==='No Admin') {
                               $('#adminTryingComment').remove();
                               app.noAdminAvailableOTO();
                               //app.callUserLogin(); 
                            }else if (data[0]['status'][0].Msg==="You don't have access") {
                               
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }
                                $('#adminTryingComment').remove();
                                app.callUserLogin();
                            }else {
                                app.hideAppLoader();
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
        
        function increaseCommentCount() {
            var db = app.getDb();
            db.transaction(insertCommentCount, app.errorCB, app.successCB);            
        }
        
        function insertCommentCount(tx) {
            var query = "UPDATE ORG_NOTIFICATION SET adminReply= adminReply+1 where org_id='" + org_id + "' and receiver_id='" + admReceiverID + "'";
            app.updateQuery(tx, query);
        }
        
        var goToBackPage = function() {
            var gotNoti = localStorage.getItem("gotNotification");             
            var type = localStorage.getItem("frmWhere");
            if(type==='Admin'){
                app.mobileApp.navigate('#replyUserNotification');  
            }else{
                if (gotNoti===1 || gotNoti==='1') {
                    app.onLoad();
                }else {
                    app.mobileApp.navigate('#view-all-activities');  
                }
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
    
    return userAdmViewModel;
}());