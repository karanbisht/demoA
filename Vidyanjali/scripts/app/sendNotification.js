var app = app || {};

app.sendNotification = (function () {
    'use strict';    
    var dataToSend ;
    var noGroup = 0;
    var noCustomer = 0;
    var schedule = 0 ; 
    //var scheduleDate;
    //var scheduleTime;
    var sending_option = 'now';
    var pb;
    var ft;
    var tasks;
    var tasks1;
    var upload_type;
    var scheduleDiv = 0;
    var dataCheckVal = 0;

    var groupChecked = [];
    var sendNotificationViewModel = (function () {
        var init = function () {				                 
        };
                                       
        var show = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");
            $('.km-popup-arrow').addClass("removeArrow");
            $('#notificationDesc').css('height', '40px');
            $("#notificationType option:selected").removeAttr("selected");

            var txt = $('#notificationDesc'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
    
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv common');

            $('body').append(hiddenDiv);

            txt.on('keyup', function () {
                content = $(this).val();
    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
    
                $(this).css('height', hiddenDiv.height());
            });

            $("#groupInSendMsg option:selected").removeAttr("selected");
            $('#groupInSendMsg').empty();

            $("#memberInSendMsg option:selected").removeAttr("selected");
            $('#memberInSendMsg').empty();
            
            document.getElementById("imgDownloaderSendNoti").innerHTML = "";
            
            pb = new ProgressBar.Circle('#imgDownloaderSendNoti', {
                                            color: '#7FBF4D',
                                            strokeWidth: 8,
                                            fill: '#f3f3f3'
                                        });

            pb.animate(0);
            dataCheckVal = 0;
            noGroup = 0;
            noCustomer = 0;
            schedule = 0;
            //scheduleDate = '';
            //scheduleTime = '';
            sending_option = 'now';
            
            $("#removeAttachment").hide(); 
            $("#largeImage").hide();
            $("#attachedVidNoti").hide();

            upload_type = '';
            dataToSend = '';
           
            closeSchedule();
            
            $("#notificationTitleValue").val('');            
            $("#notificationDesc").val('');
            
            var largeImage = document.getElementById('largeImage');
            largeImage.src = '';
            document.getElementById('comment_allow').checked = false;
            
            document.getElementById('scheduleDatePicker').valueAsDate = new Date();
            
            sendNotificationOrg();
        };    
        
        var getPhotoVal = function() {
            navigator.camera.getPicture(onPhotoURISuccess, onFail, { 
                                            quality: 50,                                            
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };
                  
        var getTakePhoto = function() {
            navigator.camera.getPicture(onPhotoURISuccess, onFail, { 
                                            quality: 50,                                            
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            correctOrientation: true
                                        });
        };
        
        var getVideoValNoti = function() {            
            navigator.camera.getPicture(onVideoURISuccessDataNoti, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            mediaType: navigator.camera.MediaType.VIDEO,
                                            correctOrientation: true
                                        });
        }
        
        var selectedType = 'P';        
        $("select[name='msgTypeNoti']").on("change", function(e) {
            selectedType = $(e.target).val();
        });
        
        var lastClickTime11 = 0;                
        var sendNotificationMessage = function () {                 
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {     
                var org_id = localStorage.getItem("SELECTED_ORG");    
                
                var cmbGroup = [];
                var cmbCust = [];
                $('#groupInSendMsg :selected').each(function(i, selected) { 
                    cmbGroup[i] = $(selected).val(); 
                });  
                $('#memberInSendMsg :selected').each(function(i, selected) { 
                    cmbCust[i] = $(selected).val(); 
                });
                cmbGroup = String(cmbGroup);
                cmbCust = String(cmbCust);
               
                var type = selectedType;
             
                var cmmt_allow ;
                if ($("#comment_allow").prop('checked')) {
                    cmmt_allow = 1;  // checked
                }else {
                    cmmt_allow = 0;
                }
             
                var notificationValue = $("#notificationDesc").val();
                var titleValue = $("#notificationTitleValue").val();
               
                if (scheduleDiv===1) {
                    sending_option = 'later';    
                    var schedule_Date = $("#scheduleDatePicker").val();               
                    
                    var values = schedule_Date.split('-');
               
                    var year = values[0]; // globle variable
                    var month = values[1];
                    var day = values[2];
               
                    var schedule_Time = $("#scheduleTimePicker").val();
               
                    var valueTime = schedule_Time.split(':');            
                    var Hour = valueTime[0]; // globle variable            
                    var Min = valueTime[1];        
                     
                    schedule_Time = Hour + ":" + Min + ":00";               
                    var second = "00";                                                 
                    tasks = +new Date(year + "/" + month + "/" + day + " " + Hour + ":" + Min + ":" + second);
                                        
                    tasks1 = +new Date(app.getSendNotiDateTime());                    
                }else {
                    tasks = '';  
                    tasks1 = '';
                    sending_option = 'now';    
                }  
               
                if (org_id===null) {
                    app.showAlert('Please select Organization', app.APP_NAME);
                }else if (cmbGroup==='' && cmbCust==='') {
                    app.showAlert('Please select Group or Member to send Message.', app.APP_NAME);
                }else if (titleValue==='') {
                    app.showAlert('Please enter Message Title', app.APP_NAME);    
                }else if (notificationValue==='') {
                    app.showAlert('Please enter Message', app.APP_NAME);    
                }else if (type==='') {
                    app.showAlert('Please select Message Type', app.APP_NAME);
                }else if (tasks1 > tasks) {
                    app.showAlert('Message Can not be schedule in back time', app.APP_NAME);
                }else { 
                    var vidFmAndroid = 0; 
                    var photo_split;
                    if ((dataToSend!==undefined && dataToSend!=="undefined" && dataToSend!=='')) { 
                        pb.animate(0);
                        dataCheckVal = 0;
                        if ((dataToSend.substring(0, 21)==="content://com.android") && (upload_type==="other")) {
                            photo_split = dataToSend.split("%3A");
                            dataToSend = "content://media/external/images/media/" + photo_split[1];
                            vidFmAndroid = 1;
                        }else if ((dataToSend.substring(0, 21)==="content://com.android") && (upload_type==="video")) {
                            photo_split = dataToSend.split("%3A");
                            dataToSend = "content://media/external/video/media/" + photo_split[1];
                            vidFmAndroid = 1;  
                        }

                        var mimeTypeVal;

                        if (upload_type==="image") {
                            mimeTypeVal = "image/jpeg"
                        }else {
                            mimeTypeVal = "video/mpeg"
                        }    
                                                
                        var filename = dataToSend.substr(dataToSend.lastIndexOf('/') + 1);
                        
                        if (upload_type==="image" && vidFmAndroid===1) {
                            if (filename.indexOf('.') === -1) {
                                filename = filename + '.jpg';
                            }                
                        }else if (upload_type==="video" && vidFmAndroid===1) {
                            if (filename.indexOf('.') === -1) {
                                filename = filename + '.mp4';
                            }
                        }

                        $("#sendNotifcation-upload-file").data("kendoMobileModalView").open();
                                            
                        var params = new Object();
                        params.cmbGroup = cmbGroup;  //you can send additional info with the file
                        params.cmbCust = cmbCust;
                        params.type = type;
                        params.title = titleValue;
                        params.message = notificationValue;
                        params.org_id = org_id;
                        params.comment_allow = cmmt_allow;
                        params.sending_option = sending_option;
                        params.send_date = tasks;
                        params.upload_type = upload_type;
                   
                        var options = new FileUploadOptions();
                        options.fileKey = "attached";
                        options.fileName = filename;
              
                        options.mimeType = mimeTypeVal;
                        options.params = params;
                        options.headers = {
                            Connection: "close"
                        }
                        options.chunkedMode = false;
                         
                        ft = new FileTransfer();
                                             
                        ft.onprogress = function(progressEvent) {
                            if (progressEvent.lengthComputable) {
                                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                                dataCheckVal = perc;
                                var j = perc / 100;                        
                                pb.animate(j, function() {
                                    pb.animate(j);
                                }); 
                            }else {
                                pb.animate(0);
                                dataCheckVal = 0;
                            }
                        };
                        
                        ft.upload(dataToSend, app.serverUrl() + "notification/sendNotification", win, fail, options , true);
                    }else {
                        app.showAppLoader(true);
                        var current = new Date().getTime();
                        var delta = current - lastClickTime11;
                        lastClickTime11 = current;
                        if (delta < 1000) {                          
                        }else {
                            var notificationData = {"cmbGroup":cmbGroup,"cmbCust":cmbCust ,"type":type,"title":titleValue, "message":notificationValue ,"org_id" : org_id,"comment_allow":cmmt_allow,"sending_option":sending_option,"send_date":tasks ,"attached":0}                            
                            var dataSourceSendNotification = new kendo.data.DataSource({
                                                                                           transport: {
                                    read: {
                                                                                                       url: app.serverUrl() + "notification/sendNotification",
                                                                                                       type:"POST",
                                                                                                       dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                                                                                                                                                                  
                                                                                                       data: notificationData
                                    
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
                                                                                                   //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                                               }
                   
                                                                                               $("#notificationTitleValue").val('');            
                                                                                               $("#notificationDesc").val('');
                                                                                               document.getElementById('comment_allow').checked = false;
                                                                                               var largeImage = document.getElementById('largeImage');
                                                                                               largeImage.src = '';
                                                                                               app.hideAppLoader();
                                                                                               app.mobileApp.navigate('#view-all-activities-GroupDetail'); 
                                                                                           }               
                                                                                       });  
           
                            dataSourceSendNotification.fetch(function() {                   
                                var sendNotificationDataView = dataSourceSendNotification.data();
                                $.each(sendNotificationDataView, function(i, notification) {
                                    if (notification.status[0].Msg==='Notification Sent') {
                                        if (!app.checkSimulator()) {
                                            window.plugins.toast.showShortBottom(app.NOTIFICATION_MSG_SENT);   
                                        }else {
                                            app.showAlert(app.NOTIFICATION_MSG_SENT, "Message"); 
                                        }
  
                                        $("#notificationTitleValue").val('');            
                                        $("#notificationDesc").val('');
                                        document.getElementById('comment_allow').checked = false;
                                        var largeImage = document.getElementById('largeImage');
                                        largeImage.src = '';
                                        app.hideAppLoader();

                                        app.mobileApp.navigate('#view-all-activities-GroupDetail'); 
                                   
                                        app.callAdminOrganisationList();
                                    }else if (notification.status[0].Msg==='Notification Sheduled') {
                                        if (!app.checkSimulator()) {
                                            window.plugins.toast.showShortBottom(app.NOTIFICATION_MSG_SCHEDULED);   
                                        }else {
                                            app.showAlert(app.NOTIFICATION_MSG_SCHEDULED, "Notification"); 
                                        }  
                                        $("#notificationTitleValue").val('');            
                                        $("#notificationDesc").val('');
                                        document.getElementById('comment_allow').checked = false;
                                        app.hideAppLoader();
                                        app.mobileApp.navigate('#view-all-activities-GroupDetail');                                    
                                        app.callAdminOrganisationList();
                                    }else if (notification.status[0].Msg==="Session Expired") {
                                        app.LogoutFromAdmin(); 
                                    }else {
                                        app.showAlert(notification.status[0].Msg , 'Notification'); 
                                        app.hideAppLoader();
                                    }
                                });               
                            });
                        }
                    }  
                }
            }   
        };
        
        var transferFileAbort = function() {     
            if (dataCheckVal!==100) {
                pb.animate(0);
                dataCheckVal = 0; 
                ft.abort(); 
                $("#sendNotifcation-upload-file").data("kendoMobileModalView").close();
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.CANNOT_CANCEL);  
                }else {
                    app.showAlert(app.CANNOT_CANCEL , 'Notification');  
                }     
            }
        }
         
        function win(r) {
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom(app.NOTIFICATION_MSG_SENT);  
            }else {
                app.showAlert(app.NOTIFICATION_MSG_SENT , 'Notification');  
            }
              
            pb.animate(0);
            dataCheckVal = 0;
            $("#sendNotifcation-upload-file").data("kendoMobileModalView").close();
            
            $("#notificationTitleValue").val('');            
            $("#notificationDesc").val('');
            document.getElementById('comment_allow').checked = false;
            var largeImage = document.getElementById('largeImage');
            largeImage.src = '';
            
            var largeVid = document.getElementById('attachedVidNoti');
            largeVid.src = '';
            app.hideAppLoader();
            app.mobileApp.navigate('#view-all-activities-GroupDetail');
        }
         
        function fail(error) {
            app.hideAppLoader();
            pb.animate(0);
            dataCheckVal = 0;
            $("#sendNotifcation-upload-file").data("kendoMobileModalView").close();
 
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.NOTIFICATION_MSG_NOT_SENT);  
                }else {
                    app.showAlert(app.NOTIFICATION_MSG_NOT_SENT , 'Notification');  
                }
            }
        }
         
        var groupDataShow;        
        var sendNotificationOrg = function(e) {
            app.showAppLoader(true);
            var org = localStorage.getItem("orgSelectAdmin");
            localStorage.setItem("SELECTED_ORG", org);
             
            var comboGroupListDataSource = new kendo.data.DataSource({
                                                                         transport: {
                    read: {
                                                                                     url: app.serverUrl() + "group/adminGroup/" + org + "/A",
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
                                                                                 }else {roup
                                                                                     app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                 }
                                                                                 //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                             }                         
                                                                         },       
                                                                         
                                                                     });
            
            comboGroupListDataSource.fetch(function() {                                                       
                groupDataShow = [];
                var data = this.data();                                                            
                if (data[0]['status'][0].Msg==='No Group list') {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_GROUP_AVAILABLE);  
                    }else {
                        app.showAlert(app.NO_GROUP_AVAILABLE , 'Offline');  
                    }                    
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin();                                 
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    app.mobileApp.navigate('#view-all-activities-GroupDetail');
                }else {
                    var orgLength = data[0].status[0].groupData.length;
                    for (var j = 0;j < orgLength;j++) {
                        groupDataShow.push({
                                               group_desc: data[0].status[0].groupData[j].group_desc,
                                               group_name: data[0].status[0].groupData[j].group_name,
                                               group_status:data[0].status[0].groupData[j].group_status,
                                               org_id:data[0].status[0].groupData[j].org_id,
                                               pid:data[0].status[0].groupData[j].pid
                                           });
                    }
                }  
                
                showDataInTemplate();
            });
        };
        
        var clickOnSelectGroup = function() {
            if (noGroup===0) {
                if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                    } 
                }else {                
                    $("#selectGroupDiv").show();
                    $("#selectGroupFooter").show();
                    $("#whatToDo").hide();
                }
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom("No Group in this Organization");  
                }else {
                    app.showAlert("No Group in this Organization" , 'Offline');  
                } 
            }   
        }
        
        var clickOnSelectCustomer = function() {
            if (noCustomer===0) {            
                if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                    } 
                }else {                
                    $("#selectCustomerToSend").show();                            
                    $("#selectCustomerFooter").show();    
                    $("#whatToDo").hide();
                }
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom("No Customer in this Organization");  
                }else {
                    app.showAlert("No Customer in this Organization" , 'Offline');  
                } 
            }  
        }
        
        var showDataInTemplate = function() {
            $.each(groupDataShow, function (index, value) {
                $('#groupInSendMsg').append($('<option/>', { 
                                                  value: value.pid,
                                                  text : value.group_name 
                                              }));
            });
            
            getCustomerForOrg();
        }

        var groupDataShowCustomer = [];        
        
        var getCustomerForOrg = function() {
            app.showAppLoader(true);

            var org = localStorage.getItem("orgSelectAdmin");

            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             url: app.serverUrl() + "customer/getOrgCustomer/" + org,
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
                                                                         //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                     }
                                                                 }	        
                                                             });         
            
            MemberDataSource.fetch(function() {
                groupDataShowCustomer = [];
                var data = this.data();
                     
                if (data[0]['status'][0].Msg ==='No Customer in this organisation') {     
                    noCustomer = 1;                     
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_MEMBER_AVAILABLE);  
                    }else {
                        app.showAlert(app.NO_MEMBER_AVAILABLE , 'Offline');  
                    }
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.showAlert(app.SESSION_EXPIRE , 'Notification');
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg==='Success') {
                    for (var i = 0;i < data[0].status[0].allCustomer.length;i++) {
                        groupDataShowCustomer.push({
                                                       mobile: data[0].status[0].allCustomer[i].uacc_username,
                                                       first_name: data[0].status[0].allCustomer[i].user_fname,
                                                       email:data[0].status[0].allCustomer[i].user_email,  
                                                       last_name : data[0].status[0].allCustomer[i].user_lname,
                                                       customerID:data[0].status[0].allCustomer[i].custID,
                                                       account_id:data[0].status[0].allCustomer[i].account_id,
                                                       orgID:data[0].status[0].allCustomer[i].orgID
                                                   });
                    }     
                    noCustomer = 0;                      
                    $("#selectCustomerLI").show();
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }                                     
                    app.mobileApp.navigate('#view-all-activities-GroupDetail');
                }                     
                showCustomerInTemplate();
            });
        }
        
        var showCustomerInTemplate = function() {
            $(".km-scroll-container").css("-webkit-transform", "");
           
            $.each(groupDataShowCustomer, function (index, value) {
                $('#memberInSendMsg').append($('<option/>', { 
                                                   value: value.customerID,
                                                   text : value.first_name + ' ' + value. last_name
                                               }));
            });
            
            app.hideAppLoader();
        }

        var groupCheckData = function() {
            $(':checkbox:checked').each(function(i) {
                groupChecked[i] = $(this).val();
            });
            
            groupChecked = String(groupChecked);        
        };
                  
        function onPhotoURISuccess(imageURI) {
            var largeImage = document.getElementById('largeImage');
            largeImage.style.display = 'block';
            
            largeImage.src = imageURI;
            dataToSend = imageURI;              
            $("#removeAttachment").show(); 
            $("#largeImage").show();
            upload_type = "other";

            var addedVideo = document.getElementById('attachedVidNoti');
            addedVideo.src = ''; 
            $("#attachedVidNoti").hide();            
        }
        
        function onVideoURISuccessDataNoti(videoURI) {             
            var largeImage = document.getElementById('largeImage');
            largeImage.src = ''; 
            $("#largeImage").hide();            
            
            var videoAttached = document.getElementById('attachedVidNoti');
            videoAttached.style.display = 'block';
                        
            videoAttached.src = 'styles/images/videoPlayIcon.png';
            dataToSend = videoURI;    
            upload_type = "video";            
            $("#attachedVidNoti").show();
        }
         
        function onFail(message) {
            $("#removeAttachment").hide(); 
            $("#largeImage").hide();
        }
         
        var removeImage = function() {
            var largeImage = document.getElementById('largeImage');
            largeImage.src = '';
            
            var largeImage1 = document.getElementById('attachedVidNoti');
            largeImage1.src = '';
            
            $("#removeAttachment").hide(); 
            $("#attachedVidNoti").hide();
            $("#largeImage").hide();
            
            dataToSend = ''; 
        }

        var scheduleNotification = function() {
            scheduleDiv = 1;             
            if (schedule > 0) {            
                sendNotificationMessage();
                sending_option = 'now';                 
            }else {           
                $("#selectScheduleDT").show();
                $("#sendButton").hide();
                sending_option = 'later';
                document.getElementById("scheduleButton").value = "Send Schedule";
                $("#scheduleButton").css("width", "150");
                $("#scheduleButton").attr("data-bind", "sendNotificationMessage()");
                schedule++;
            }
        }
         
        var closeSchedule = function() {
            scheduleDiv = 0;
            schedule = 0;
            //scheduleDate = '';
            //scheduleTime = '';
            tasks = '';
            tasks1 = '';
            sending_option = 'now';
            $("#selectScheduleDT").hide();
            $("#sendButton").show();
            document.getElementById("scheduleButton").value = "Schedule";
            $("#scheduleButton").css("width", "100");  
        }
                 
        return {
            init: init,
            show: show,
            closeSchedule:closeSchedule,
            scheduleNotification:scheduleNotification,
            sendNotificationOrg:sendNotificationOrg,
            groupCheckData:groupCheckData,
            transferFileAbort:transferFileAbort,
            clickOnSelectGroup:clickOnSelectGroup,
            clickOnSelectCustomer:clickOnSelectCustomer,
            getPhotoVal:getPhotoVal,
            getVideoValNoti:getVideoValNoti,
            getTakePhoto:getTakePhoto,
            removeImage:removeImage,
            sendNotificationMessage:sendNotificationMessage
        };
    }());
     
    return sendNotificationViewModel;
}());