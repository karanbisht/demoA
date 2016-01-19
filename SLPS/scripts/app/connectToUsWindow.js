var app = app || {};
app.connectToUsWindow = (function () {
    'use strict';
    var connectWindowModel = (function () {
        var device_type;
        var account_Id;
        var userOrgId;        
        var admName;
        var admPid;
        var admPhoto;
        var admAccId;  
        var lastMsgId;   
        var attachImageData;
        var allOTOMsg = [];
        var ft;
        var countVal=0;
        var pbConnect;
        var totalComment = 0
        
        var init = function() {
            
        };
    
        var show = function(e) {
            device_type = localStorage.getItem("DEVICE_TYPE"); 
            account_Id = localStorage.getItem("ACCOUNT_ID");
            userOrgId = localStorage.getItem("selectedOrgId");
            lastMsgId=0;
            allOTOMsg=[];
            attachImageData='';
            admName = localStorage.getItem("selAdmFulName");
            admPid = localStorage.getItem("selAdmPid");
            admPhoto = localStorage.getItem("selAdmPhoto"); 
            admAccId = localStorage.getItem("selAdmAccId");
            
            $("#popover-connect2us").removeClass("km-widget km-popup");
            $('.km-popup-arrow').addClass("removeArrow");            
             
            $("#admNameShow").html(admName);
            $('#otoNewComment').val(' ');
            $("#otoNewComment").attr("placeholder","Type a message");

            $('#otoNewComment').css('height', '35px');
            var txt = $('#otoNewComment'),
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
            
            document.getElementById("imgDownloaderConnect").innerHTML = "";            
            pbConnect = new ProgressBar.Circle('#imgDownloaderConnect', {
                   color: '#7FBF4D',
                   strokeWidth: 8,
                   fill: '#f3f3f3'
            });
            
            //getDataFromLive();         
            
            var db = app.getDb();		                 
            db.transaction(getDataFrmDB, app.errorCB, getLiveDataAlso);      
        };
        
        var getDataFrmDB = function(tx) {

            //var queryDelete = "DELETE FROM ONE_TO_ONE";
            //app.deleteQuery(tx, queryDelete);               
            
            var query = "SELECT * FROM ONE_TO_ONE where receiver='"+ admAccId+"' OR sender='"+admAccId+"'" ;
            app.selectQuery(tx, query, getOrgNotiCommentDataSuccess);
        };    
                    
        function getOrgNotiCommentDataSuccess(tx, results) {
            var count = results.rows.length;  
            totalComment=count;            
            if (count !== 0) {
                allOTOMsg = [];
                for (var i = 0 ; i < count ; i++) {    
                    var dateString = results.rows.item(i).add_date;
                    var split = dateString .split(' ');                    
                    var commentDate = app.formatDate(split[0]);                    
                    var commentTime = app.formatTime(split[1]);
                    
                    var stringType = results.rows.item(i).message.substring(0, 4);
                    var showMegType;
                    if(stringType==="http"){
                        showMegType='image';
                    }else{
                        showMegType='text';
                    }                    
                    
                    allOTOMsg.push({                   
                                           comment: results.rows.item(i).message,
                                           add_date: commentDate,
                                           add_time: commentTime,
                                           account_Id : parseInt(account_Id),
                                           type:showMegType,
                                           receiver : results.rows.item(i).receiver,
                                           sender : parseInt(results.rows.item(i).sender) 
                                       });                    
                    lastMsgId = results.rows.item(i).id;
                }    
            }else {
                lastMsgId = 0;
            }                       
        };
        
                
        var getLiveDataAlso = function() {                       
            var dataSourceDB = new kendo.data.DataSource({
                                 data: allOTOMsg
                               });                        

            $("#oneToOneChat-listview").kendoMobileListView({
                                           template: kendo.template($("#oneToOneChatTemplate").html()),    		
                                           dataSource: dataSourceDB                                                            
            });
            
            //$('#oneToOneChat-listview').data('kendoMobileListView').refresh();
            

            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {            
                getDataFromLive();
            }
        };

        
        var getDataFromLive = function(){

            $("#connectUsWinLoader").show(); 
            $("#oneToOneChat-listview").hide();
            var OTODataSource = new kendo.data.DataSource({
                                                               transport: {
                                            read: {
                                                                           url: app.serverUrl() + "notification/getOnetoOnemsg/" + account_Id + "/" + admAccId + "/" + userOrgId + "/" + lastMsgId,
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
                                                                   console.log(JSON.stringify(e));
                                                                   $("#connectUsWinLoader").hide(); 
                                                                   $("#oneToOneChat-listview").hide();
                                                                              
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
            
            

            OTODataSource.fetch(function() {
                        var data = this.data();
                        var orgNotiCommentData;

                              if (data[0]['status'][0].Msg ==='No Comments') { 

                              }else if (data[0]['status'][0].Msg==='Success') {
                                var commentLength = data[0]['status'][0].AllMessage.length;                              
                                orgNotiCommentData = data[0]['status'][0].AllMessage;
                               
                                for (var j = 0;j < commentLength;j++) {
                                    var dateString = data[0]['status'][0].AllMessage[j].add_date;
                                    var split = dateString .split(' ');
                                    var commentDate = app.formatDate(split[0]);
                                    var commentTime = app.formatTime(split[1]);
                                    
                                    var stringType = data[0]['status'][0].AllMessage[j].message.substring(0, 4);
                                    var showMegType;
                                    if(stringType==="http"){
                                        showMegType='image';
                                    }else{
                                        showMegType='text';
                                    }
                                         
                                    allOTOMsg.push({
                                                           comment: data[0]['status'][0].AllMessage[j].message,
                                                           add_date: commentDate,
                                                           add_time: commentTime,
                                                           type:showMegType,
                                                           account_Id : account_Id,
                                                           receiver : data[0]['status'][0].AllMessage[j].receiver,
                                                           sender : data[0]['status'][0].AllMessage[j].sender
                                                       });
                                }
                                showAllData();
                                saveOrgOneToOnesComment(orgNotiCommentData);  
                              }
            });
                                    
            $("#connectUsWinLoader").hide();   
            $("#oneToOneChat-listview").show();
        };

        var orgNotiCommentDataVal;
        function saveOrgOneToOnesComment(data) {
            orgNotiCommentDataVal = data;      
            var db = app.getDb();
            db.transaction(insertOrgNotiCommentData, app.errorCB, app.successCB);            
        }
            
        function insertOrgNotiCommentData(tx) {
            var dataLength = orgNotiCommentDataVal.length; 
            for (var i = 0;i < dataLength;i++) {       
                var query = 'INSERT INTO ONE_TO_ONE(org_id, id, message, add_date , receiver , sender) VALUES ("'
                            + orgNotiCommentDataVal[i].org_id
                            + '","'
                            + orgNotiCommentDataVal[i].id
                            + '","'
                            + orgNotiCommentDataVal[i].message
                            + '","'
                            + orgNotiCommentDataVal[i].add_date
                            + '","'
                            + orgNotiCommentDataVal[i].receiver
                            + '","'
                            + orgNotiCommentDataVal[i].sender
                            + '")';              
                app.insertQuery(tx, query);
            }                               
        }
        
        var showAllData = function() {
            
            var dataSourceDB = new kendo.data.DataSource({
                                 data: allOTOMsg
                               });                        

            $("#oneToOneChat-listview").kendoMobileListView({
                                           template: kendo.template($("#oneToOneChatTemplate").html()),    		
                                           dataSource: dataSourceDB                                                            
            });
            
            $('#oneToOneChat-listview').data('kendoMobileListView').refresh();
            
            
            //scrollToBottom();
        };

        var goToBackPage = function(){
            app.mobileApp.navigate('views/connectToUS.html');
        };
        
        var saveoToComment = function(){
          if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                  
                var comment = $("#otoNewComment").val();
                if (comment!=='' && comment!=='Type a message') {                
                    $("#connectUsWinLoader").show();                    
                    
                    $("#oneToOneChat-listview").append('<li id="tryingComment"><div class="user-comment-List" id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a>'+comment+'</a><br/><span class="user-time-span"> Sending.. </span></div></div></li>');                                
                    $('#otoNewComment').css('height', '35px');
                    $("#otoNewComment").val('');
                    $("#otoNewComment").attr("placeholder","Type a message");



                    var jsonDatacomment = {"message":comment ,"sender":account_Id,"receiver":admAccId,"org_id":userOrgId};
                   
                    var saveCommentDataSource = new kendo.data.DataSource({
                            transport: {
                            read: {
                                                                                          url: app.serverUrl() + "notification/oneTwoOne",
                                                                                          type:"POST",
                                                                                          dataType: "json",
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
                                                                                  console.log(JSON.stringify(e));
                                                                                  $("#connectUsWinLoader").hide();
                                                                              
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
                            if (commentData.status[0].Msg === 'Success') {
                                $("#connectUsWinLoader").hide();
                                $('#otoNewComment').css('height', '35px');
                                
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.COMMENT_REPLY);   
                                }else {
                                    app.showAlert(app.COMMENT_REPLY, "Notification");                                      
                                }
                                
                                $('#tryingComment').remove();
                                var commentDate = app.formatDate(new Date());
                                $("#oneToOneChat-listview").append('<li><div class="user-comment-List"  id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a>'+comment+'</a><br/><span class="user-time-span">'+commentDate+' just now </span></div></div></li>');                                                                 
                                $("#otoNewComment").val('');
                                $("#otoNewComment").attr("placeholder","Type a message");
                            }else {
                                $("#connectUsWinLoader").hide();
                                $('#tryingComment').remove();
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
        
         function scrollToBottom() {
             
            var scroller = app.mobileApp.scroller();
            console.log("scrollheight " + scroller.scrollHeight() + " height: " + scroller.height());
            var offset = scroller.height();
            if (offset === 0)
                offset = 100;
            scroller.scrollTo(0, scroller.scrollHeight() * -1 + offset);
          }
        
        var getTakePhoto = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,                                     
                                            correctOrientation: true
                                        });
        };
        
        var getPhotoVal = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };


        function onPhotoURISuccessData(imageURI) {            
            $("#modelViewPhotoVerify").data("kendoMobileModalView").open();              
            //$("#recName").html(localStorage.getItem("selAdmFulName"));
            var imageAttached = document.getElementById('selectedImgByUser');
            imageAttached.src = imageURI;
            attachImageData = imageURI;
        }
        
        function onFail(){
            
        }
        
        var clickToCancelPhoto = function(){
            var imageAttached = document.getElementById('selectedImgByUser');
            imageAttached.src = '';
            $("#modelViewPhotoVerify").kendoMobileModalView("close");
        };
        
        
        var sendPhotoToLive = function(){
                    pbConnect.animate(0);
                    countVal=0;
                    if ((attachImageData.substring(0, 21)==="content://com.android")) {
                        var photo_split = attachImageData.split("%3A");
                        attachImageData = "content://media/external/images/media/" + photo_split[1];
                    }

                    $("#modelViewPhotoVerify").kendoMobileModalView("close");
                    $("#oneToOneChat-listview").append('<li id="tryingImgComment"><div class="user-comment-List" id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a><img src='+attachImageData+' style="width:180px;height:180px;"/></a><br/><span class="user-time-span"> Sending.. </span></div></div></li>');                                
                    var filename = attachImageData.substr(attachImageData.lastIndexOf('/') + 1);                            

                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.jpg';
                        }                
                            
                    var openView = $("#connect-upload-file").data("kendoMobileModalView");
                    openView.shim.popup.options.animation.open.duration = 400;
                    openView.open();
                    
                    
                    var params = new Object();
                    params.org_id = userOrgId; 
                    params.sender = account_Id;
                    params.receiver = admAccId;
                    params.message = '';

                    ft = new FileTransfer();
                    var options = new FileUploadOptions();
                    options.fileKey = "attached";
                    options.fileName = filename;              
              
                    options.mimeType = 'image/jpeg';
                    options.params = params;
                    options.chunkedMode = false;
                    options.headers = {
                        Connection: "close"
                    }
                    
                    ft.onprogress = function(progressEvent) {
                        if (progressEvent.lengthComputable) {
                            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                            countVal=perc;
                            var j = countVal/100;                        
                            pbConnect.animate(j, function() {
                                pbConnect.animate(j);
                            });
                        }else {
                            pbConnect.animate(0);
                            countVal=0;
                        }
                    };
       
                    ft.upload(attachImageData, app.serverUrl() + "notification/oneTwoOne", win, fail, options , true);     
        };
            
            
        var transferFileAbort = function() {    
            if(countVal < 90){
                pbConnect.animate(0);
                ft.abort(); 
                $("#connect-upload-file").data("kendoMobileModalView").close();
            }else{
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.CANNOT_CANCEL);  
                }else {
                    app.showAlert(app.CANNOT_CANCEL , 'Notification');  
                } 
            }    
        }
        
        function win(r) {
            console.log('success');
            pbConnect.animate(0);
            countVal=0;
            $('#tryingImgComment').remove();
            var commentDate = app.formatDate(new Date());
            $("#oneToOneChat-listview").append('<li><div class="user-comment-List"  id="userCommentContainer"><div class="user-comment-content" style="padding-top:10px;"><a><img src='+attachImageData+' style="width:180px;height:180px;"/></a><br/><span class="user-time-span">'+commentDate+' just now </span></div></div></li>');                                           
            $("#connect-upload-file").data("kendoMobileModalView").close();
            window.plugins.toast.showShortBottom(app.COMMENT_REPLY);   
            clickToCancelPhoto();
        }
                
        function fail(error) {
            pbConnect.animate(0);
            countVal=0;            
            console.log(JSON.stringify(error));           
            clickToCancelPhoto();
 
            if (!app.checkConnection()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
            }else{                
                    window.plugins.toast.showShortBottom("Operation Failed. Please try again.");  
            }
        }     
        
        return {
            init: init,
            show: show,
            getTakePhoto:getTakePhoto,
            getPhotoVal:getPhotoVal,
            transferFileAbort:transferFileAbort,
            clickToCancelPhoto:clickToCancelPhoto,
            sendPhotoToLive:sendPhotoToLive,
            saveoToComment:saveoToComment,
            goToBackPage:goToBackPage
        };
    }());        
    return connectWindowModel;
}());