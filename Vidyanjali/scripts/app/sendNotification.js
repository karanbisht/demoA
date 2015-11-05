var app = app || {};

app.sendNotification = (function () {
    'use strict';
    
    var dataToSend ;
    var noGroup = 0;
    var noCustomer = 0;
    var schedule = 0 ; 
    var scheduleDate;
    var scheduleTime;
    var sending_option = 'now';
    var pb;
    var ft;
    var tasks;
    var tasks1;
    var upload_type;
    var scheduleDiv = 0;
    var dataCheckVal=0;

    var groupChecked = [];
    var sendNotificationViewModel = (function () {
        //var orgId = localStorage.getItem("UserOrgID"); 
        //console.log(orgId);
        var init = function () {				                 
        };
         
        var beforeShow = function() {
            var db = app.getDb();
            db.transaction(getDataOrg, app.errorCB, showLiveData);   
        };
    
        var getDataOrg = function(tx) {
            var query = "SELECT * FROM ADMIN_ORG";
            app.selectQuery(tx, query, getDataSuccess);
        };
            
        var groupDataShowOffline = [];
            
        function getDataSuccess(tx, results) {                        
            groupDataShowOffline = [];
            
            var count = results.rows.length;                    			
            if (count !== 0) {                
                for (var i = 0 ; i < count ; i++) {                
                    groupDataShowOffline.push({
                                                  org_name: results.rows.item(i).org_name,
                                                  orgDesc: results.rows.item(i).orgDesc,
                                                  org_id:results.rows.item(i).org_id,
                                                  bagCount : 'C'					
                                              });
                }
            }else {
                groupDataShowOffline.push({
                                              org_name: 'No Notification',
                                              orgDesc: 'You are not a customer of any organisation',
                                              org_id:'0',
                                              bagCount : 'D'    
                                          });          
            }
        };
         
        var showLiveData = function() {
            //console.log('Hello');
            //console.log(groupDataShowOffline);
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupDataShowOffline
                                                                       });                           
             
            $("#organisation-Name-listview").kendoMobileListView({
                                         template: kendo.template($("#orgNameTemplate").html()),    		
                                         dataSource: organisationListDataSource
            });                
          
            $('#organisation-Name-listview').data('kendoMobileListView').refresh();                
            $("#selectOrgDiv").show();
        };
                                       
        var show = function(e) {
            
            $(".km-scroll-container").css("-webkit-transform", "");
            $('.km-popup-arrow').addClass("removeArrow");
            $('#notificationDesc').css('height', '40px');
            $("#notificationType option:selected").removeAttr("selected");
            //$("#scheduleDatePicker").parent().css('width', "160px");
            //$("#scheduleTimePicker").parent().css('width', "160px");
            $("#scheduleDatePicker").removeClass("k-input");
            $("#scheduleTimePicker").removeClass("k-input");

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
            
            
                        /*pb = $("#profileCompletenessNotification").kendoProgressBar({
                                                                type: "chunk",
                                                                chunkCount: 100,
                                                                min: 0,
                                                                max: 100,
                                                                value: 0
                                                            }).data("kendoProgressBar");*/
            

            
            
            document.getElementById("imgDownloaderSendNoti").innerHTML = "";
            
            pb = new ProgressBar.Circle('#imgDownloaderSendNoti', {
                   color: '#7FBF4D',
                   strokeWidth: 8,
                   fill: '#f3f3f3'
            });

            

            
            //pb.value(0);
            pb.animate(0);
            dataCheckVal=0;
            noGroup = 0;
            noCustomer = 0;
            schedule = 0;
            scheduleDate = '';
            scheduleTime = '';
            sending_option = 'now';
            
            $("#progressSendNotification").hide();            
            $("#removeAttachment").hide(); 
            $("#largeImage").hide();
            $("#attachedVidNoti").hide();

            upload_type = '';
            dataToSend = '';
           
            closeSchedule();

            localStorage.setItem("SELECTED_GROUP", '');
            localStorage.setItem("SELECTED_CUSTOMER", '');
            
            $("#notificationTitleValue").val('');            
            $("#notificationDesc").val('');
            
            var largeImage = document.getElementById('largeImage');
            largeImage.src = '';
            document.getElementById('comment_allow').checked = false;
            
            $("#selectGroupDiv").hide();
            $("#selectGroupFooter").hide();
            $("#sendNotificationDivMsg").hide();
            $("#sendNotiDiv").hide();
            $("#selectCustomerToSend").hide();
            $("#selectCustomerFooter").hide();

            var currentDate = app.getPresentDate();            
            var disabledDaysBefore = [
                +new Date(currentDate)
            ];

            $("#scheduleDatePicker").kendoDatePicker({
                                                         value: new Date(),
                                                         dates: disabledDaysBefore,    
                                                         month:{
                    content:'# if (data.date < data.dates) { #' + 
                            '<div class="disabledDay">' +
                            '#= data.value #' +
                            '</div>' +
                            '# } else { #' +
                            '#= data.value #' +
                            '# } #'
                },
                                                         position: "bottom left",
                                                         animation: {
                    open: {
                                                                     effects: "slideIn:up"
                                                                 }                
                },
                                                         open: function(e) {
                                                             $(".disabledDay").parent().removeClass("k-link")
                                                             $(".disabledDay").parent().removeAttr("href")
                                                         },

                 
                                                         change: function() {
                                                             var value = this.value();
                                                             if(new Date(value) < new Date(currentDate)){                   
                                                                    var todayDate = new Date();
                                                                    $('#scheduleDatePicker').data("kendoDatePicker").value(todayDate);                                       
                                                                    scheduleDate = todayDate;
                                                             }else{
                                                                 scheduleDate = value;
                                                             } 
                                                         }
                                                     }).data("kendoDatePicker");
            
            $("#scheduleTimePicker").kendoTimePicker({
                                                         value:"10:00 AM",
                                                         interval: 15,
                                                         format: "h:mm tt",
                                                         timeFormat: "HH:mm", 
                
                                                         change: function() {
                                                             var value = this.value();
                                                             scheduleTime = value;
                                                         }                
                                                     });  
            
            $('#scheduleDatePicker').attr('disabled', 'disabled');
            $('#scheduleTimePicker').attr('disabled', 'disabled');
            sendNotificationOrg();
        };    
                              
        var onChangeNotiGroup = function() {
            var selectDataNoti = $("#groupforNotification").data("kendoComboBox");    
            var groupSelectedNoti = selectDataNoti.value();
            //console.log(groupSelectedNoti);
            return groupSelectedNoti;
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
            //navigator.device.capture.captureVideo(captureSuccess, captureError, {limit: 1});                      
            navigator.camera.getPicture(onVideoURISuccessDataNoti, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            mediaType: navigator.camera.MediaType.VIDEO,
                                            correctOrientation: true
                                            });
        }
        
        
        var selectedType='P';        
        $("select[name='msgTypeNoti']").on("change", function(e){
		        	selectedType = $(e.target).val();
        });
        
        var lastClickTime11=0;                
        var sendNotificationMessage = function () {                 
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {     
                //var cmbGroup = [];
                var org_id = localStorage.getItem("SELECTED_ORG");    
         
                //if (validator.validate()) {
                //var group=onChangeNotiGroup();
                // cmbGroup.push(group);
            
                //cmbGroup = String(cmbGroup);
                //console.log(cmbGroup);
        
                var cmbGroup = localStorage.getItem("SELECTED_GROUP");
                cmbGroup = String(cmbGroup);
             
                
                var cmbCust = localStorage.getItem("SELECTED_CUSTOMER");
                cmbCust = String(cmbCust);
             
                //alert(cmbGroup);
             
                /*var selectedType = $("#notificationType").data("kendoComboBox");
                var type = selectedType.value();*/
             
                var type = selectedType;
                //var type = notificationTypeSelected;
                //alert(type);
             
                var cmmt_allow ;
                if ($("#comment_allow").prop('checked')) {
                    cmmt_allow = 1;  // checked
                }else {
                    cmmt_allow = 0;
                }
             
                //console.log(cmmt_allow);
                var notificationValue = $("#notificationDesc").val();
                var titleValue = $("#notificationTitleValue").val();
               
                if (scheduleDiv===1) {
                    sending_option = 'later';    
                    //console.log('later div open');
                    var schedule_Date = $("#scheduleDatePicker").val();               
                    var values = schedule_Date.split('/');
               
                    var month = values[0]; // globle variable
                    var day = values[1];
                    var year = values[2];
               
                    var schedule_Time = $("#scheduleTimePicker").val();
               
                    var valueTime = schedule_Time.split(':');            
                    var Hour = valueTime[0]; // globle variable            
                    var Min = valueTime[1];        
            
                    var valueTimeMin = Min.split(' '); 
                    var minute = valueTimeMin[0];
                    var AmPm = valueTimeMin[1];
            
                    if (AmPm==='PM') {
                        if (Hour!=='12' && Hour!==12) {
                            Hour = parseInt(Hour) + 12;
                        }
                    }
            
                    //console.log(Hour + "||" + minute + "||" + AmPm);
            
                    schedule_Time = Hour + ":" + minute + ":00";               
                    var second = "00";                                                 
                    tasks = +new Date(year + "/" + month + "/" + day + " " + Hour + ":" + minute + ":" + second);
                    
                    //alert(app.getSendNotiDateTime());
                    
                    tasks1 = +new Date(app.getSendNotiDateTime());                    
                    var sendNotificationTime = new Date(schedule_Date + " " + schedule_Time);  
                    
                }else {
                    tasks = '';  
                    tasks1= '';
                    sending_option = 'now';    
                }  
               
                //alert(tasks);
                //alert(tasks1);
                if (org_id===null) {
                    app.showAlert('Please select Organization', 'Validation Error');
                }/*else if (cmbGroup ==='' && (cmbCust==='' || cmbCust==="null")) {
                    app.showAlert('Please Organization Group or Customer.', 'Validation Error'); 
                    $("#selectGroupDiv").show(); 
                    $("#selectGroupFooter").show();

                    $("#sendNotificationDivMsg").hide();
                    $("#sendNotiDiv").hide();
                }else if (cmbGroup ==='0' && (cmbCust==='' || cmbCust==="null")) {
                    app.showAlert('Please Customer to Send Notification.', 'Validation Error'); 
                    $("#selectCustomerToSend").show();
                    $("#selectCustomerFooter").show();

                    $("#sendNotificationDivMsg").hide();
                    $("#sendNotiDiv").hide();
                }*/
            
                else if (titleValue==='') {
                    app.showAlert('Please enter Message Title', 'Validation Error');       
                }else if (notificationValue==='') {
                    app.showAlert('Please enter Message', 'Validation Error');    
                }else if (type==='') {
                    app.showAlert('Please select Message Type', 'Validation Error');
                }else if (tasks1 > tasks) {
                    app.showAlert('Message Can not be schedule in back time', 'Validation Error');
                }else { 
                    //var url = "http://54.85.208.215/webservice/notification/sendNotification";              
                    var vidFmAndroid = 0; 
                    var photo_split;
                    //alert(upload_type);
                    if ((dataToSend!==undefined && dataToSend!=="undefined" && dataToSend!=='')) { 
                        pb.animate(0);
                        dataCheckVal=0;
                        if ((dataToSend.substring(0, 21)==="content://com.android") && (upload_type==="other")) {
                            photo_split = dataToSend.split("%3A");
                            dataToSend = "content://media/external/images/media/" + photo_split[1];
                            vidFmAndroid = 1;
                        }else if ((dataToSend.substring(0, 21)==="content://com.android") && (upload_type==="video")) {
                            photo_split = dataToSend.split("%3A");
                            //console.log(photo_split);
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

                        var path = dataToSend;
                        
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
                            dataCheckVal=perc;
                            var j = perc/100;                        
                            pb.animate(j, function() {
                                pb.animate(j);
                            }); 
                         }else {
                             pb.animate(0);
                             dataCheckVal=0;
                         }
                       };
                        
                        ft.upload(dataToSend, app.serverUrl() + "notification/sendNotification", win, fail, options , true);
                    }else {
                        //console.log(tasks);                 

                        $("#progressSendNotification").show();
                        
                        var current = new Date().getTime();
  	                  var delta = current - lastClickTime11;
                  	  lastClickTime11 = current;
                  	  if (delta < 1000) {                          
                          console.log('multi click');    
                        }else{
                          console.log('hello');
                        //alert(cmbGroup+"||"+cmbCust+"||"+type+"||"+titleValue+"||"+notificationValue+"||"+org_id+"||"+cmmt_allow+"||"+sending_option+"||"+tasks+"||"+0);
                        
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
                                    //console.log(data);
                                    return [data];
                                }
                            },
                                                                                       error: function (e) {
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                          }
                   
                                                                                           $("#notificationTitleValue").val('');            
                                                                                           $("#notificationDesc").val('');
                                                                                           document.getElementById('comment_allow').checked = false;
                                                                                           var largeImage = document.getElementById('largeImage');
                                                                                           largeImage.src = '';
                                                                                           $("#progressSendNotification").hide();
                                                                                           //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 
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
                                    $("#progressSendNotification").hide();

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
                                    $("#progressSendNotification").hide();
                                    app.mobileApp.navigate('#view-all-activities-GroupDetail');                                    
                                    app.callAdminOrganisationList();
                                }else if (notification.status[0].Msg==="Session Expired") {
                                    //app.showAlert(app.SESSION_EXPIRE , 'Notification');
                                    app.LogoutFromAdmin(); 
                                }else {
                                    app.showAlert(notification.status[0].Msg , 'Notification'); 
                                    $("#progressSendNotification").hide();
                                }
                            });               
                        });
                      }
                    }  
                }
            }   
        };
        
        
        var transferFileAbort = function() {     
           if(dataCheckVal!==100){
                pb.animate(0);
                dataCheckVal=0; 
                ft.abort(); 
                $("#sendNotifcation-upload-file").data("kendoMobileModalView").close();
           }else{
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
            dataCheckVal=0;
            $("#sendNotifcation-upload-file").data("kendoMobileModalView").close();
            
            $("#notificationTitleValue").val('');            
            $("#notificationDesc").val('');
            document.getElementById('comment_allow').checked = false;
            var largeImage = document.getElementById('largeImage');
            largeImage.src = '';
            
            var largeVid = document.getElementById('attachedVidNoti');
            largeVid.src = '';
            
            $("#progressSendNotification").hide();

            app.mobileApp.navigate('#view-all-activities-GroupDetail');
            //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 
        }
         
        function fail(error) {
            $("#progressSendNotification").hide();            
            //console.log(error);          
            //console.log(JSON.stringify(error));
            pb.animate(0);
            dataCheckVal=0;
            $("#sendNotifcation-upload-file").data("kendoMobileModalView").close();
 
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.NOTIFICATION_MSG_NOT_SENT);  
                }else {
                    app.showAlert(app.NOTIFICATION_MSG_NOT_SENT , 'Notification');  
                }
            }

        }
         
        var groupDataShow;
        
        var sendNotificationOrg = function(e) {
            $("#selectOrgLoader").show();

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
                        //console.log(data);
                        return [data];                       
                    }
                },
                                                                         error: function (e) {
                                                                             $("#selectOrgLoader").hide();
                                                                             
                                                                             $("#selectOrgDiv").hide();
                                                                             $("#whatToDo").show();
                                                                             $("#selectGroupLI").show();
                                                                             $("#selectOrgLoader").hide();
                                                                             
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
                                                                         },       
                                                                         
                        });
            
            comboGroupListDataSource.fetch(function() {                                                       
                groupDataShow = [];
                var data = this.data();                
                                            
                if (data[0]['status'][0].Msg==='No Group list') {
                    
                    $("#selectGroupDiv").hide();
                    $("#selectGroupFooter").hide();
                    $("#selectOrgDiv").hide();
                    noGroup = 1;      
                    
                    //$("#selectGroupLI").hide();
                    $("#whatToDo").show();
                                         
                    localStorage.setItem("SELECTED_GROUP", 0); 
                    //escapeGroupGoCustClick();
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    //app.showAlert(app.SESSION_EXPIRE , 'Notification');
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
                                                               
                    noGroup = 0;
                    $("#selectOrgDiv").hide();
                    $("#whatToDo").show();
                    $("#selectGroupLI").show();
                    $("#selectOrgLoader").hide();
                }  
                
                showDataInTemplate();
            });
        };
        
        var clickOnSelectGroup = function(){

          if(noGroup===0){
                if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                    } 
                }else{                
                   $("#selectGroupDiv").show();
                   $("#selectGroupFooter").show();
                   $("#whatToDo").hide();
                }
           }else{
                   if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom("No Group in this Organization");  
                   }else {
                        app.showAlert("No Group in this Organization" , 'Offline');  
                   } 
           }   

        }
 
        
        var clickOnSelectCustomer = function(){

         if(noCustomer===0){            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                $("#selectCustomerToSend").show();                            
                $("#selectCustomerFooter").show();    
                $("#whatToDo").hide();
            }
         }else{

             if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom("No Customer in this Organization");  
             }else {
                        app.showAlert("No Customer in this Organization" , 'Offline');  
             } 

         }  

        }
        
        var showDataInTemplate = function() {
            //$(".km-scroll-container").css("-webkit-transform", "");
           
            var comboGroupListDataSource1 = new kendo.data.DataSource({
                                                                         data: groupDataShow
                                                                     });      
            
            $("#group-Name-listview").kendoListView({
                                            dataSource: comboGroupListDataSource1,                                        
                                            template: kendo.template($("#groupNameTemplate").html())    		
            });
             
            //app.mobileApp.pane.loader.hide();
            
            getCustomerForOrg();
        }

        var groupDataShowCustomer = [];        
        
        var getCustomerForOrg = function() {
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
                        //console.log(data);                                         
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                     
                                                                 }	        
                                                             });         
            
            MemberDataSource.fetch(function() {
                groupDataShowCustomer = [];
                var data = this.data();
                     
                if (data[0]['status'][0].Msg ==='No Customer in this organisation') {     
                    noCustomer = 1;
                    //$("#selectCustomerLI").hide();
                    //$("#whatToDo").show();
                    //escapeGroupClick();
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.showAlert(app.SESSION_EXPIRE , 'Notification');
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg==='Success') {
                    //console.log(orgVal.allCustomer.length);  
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
           
            var MemberDataSource = new kendo.data.DataSource({
                                                                 data: groupDataShowCustomer
                                                             });           

            $("#customer-Name-listview").kendoListView({
                                                           dataSource: MemberDataSource,
                                                           template: kendo.template($("#customerNameTemplate").html())
                                                       });
            
            $("#selectOrgLoader").hide();
        }
         
        var skipToSeletType = function() {
            $("#selectCustomerToSend").hide();
            $("#selectCustomerFooter").hide();
            escapeGroupClick();
        };
         
        var goBackToGroup = function() {

            $(".km-scroll-container").css("-webkit-transform", "");

            $("#whatToDo").show();            
            $("#selectCustomerToSend").hide();
            $("#selectCustomerFooter").hide();
            localStorage.setItem("SELECTED_CUSTOMER", '');
        }
        
        var NextToSeletType = function() {
            var customer = [];
		    
            /*$(':checkbox:checked').each(function(i) {
                customer[i] = $(this).val();
            });*/
            
            
            $('#customer-Name-listview input:checked').each(function() {
                customer.push($(this).val());
            });
            
            customer = String(customer);        
            //console.log(customer);
                        
            if (customer.length!==0 && customer.length!=='0') {
                $("#selectCustomerToSend").hide();
                $("#selectCustomerFooter").hide();
          

                $("#sendNotificationDivMsg").show();
                $("#sendNotiDiv").show();   
                $(".km-scroll-container").css("-webkit-transform", "");
                localStorage.setItem("SELECTED_CUSTOMER", customer); 
                localStorage.setItem("SELECTED_GROUP", '');

                //escapeGroupClick();
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Select customer to send message.');   
                }else {
                    app.showAlert("Select customer to send message.", "Notification");  
                }
            }   
        };
         
        var skipToCustomerType = function() {

            $(".km-scroll-container").css("-webkit-transform", "");
            $("#selectGroupDiv").hide();
            $("#selectGroupFooter").hide();
            localStorage.setItem("SELECTED_GROUP", '');
            $("#whatToDo").show();            
        };
         
        var NextToCustomerType = function() {
            var group = [];		                
            
            /*$(':checkbox:checked').each(function(i) {
                group[i] = $(this).val();
            });*/    
            
            $('#group-Name-listview input:checked').each(function() {
                group.push($(this).val());
            });

            group = String(group);        
            //console.log(group);      
              
            if (group.length!==0 && group.length!=='0') {
                $("#selectGroupDiv").hide();
                $("#selectGroupFooter").hide();                
                localStorage.setItem("SELECTED_GROUP", group);
                localStorage.setItem("SELECTED_CUSTOMER", '');
                
                //$("#selectCustomerToSend").show();                            
                //$("#selectCustomerFooter").show();                              
                $("#sendNotificationDivMsg").show();
                $("#sendNotiDiv").show();   
                $(".km-scroll-container").css("-webkit-transform", "");
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Select group to send message.');   
                }else {
                    app.showAlert("Select group to send message.", "Notification");  
                }
            }    
        };
         
        var sendNotificationGroup = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");
            //console.log(e.data.pid);
            var group = e.data.pid;
            localStorage.setItem("SELECTED_GROUP", group);
            $("#selectGroupDiv").hide();
            $("#selectGroupFooter").hide();

            //$("#selectTypeDiv").show();
            $("#selectCustomerToSend").show();
            $("#selectCustomerFooter").show();
            app.mobileApp.pane.loader.hide();              
        };
                  
        var escapeGroupClick = function() {                 
            $(".km-scroll-container").css("-webkit-transform", "");
            $("#selectGroupDiv").hide();
            $("#selectGroupFooter").hide();

            $("#selectCustomerToSend").hide();
            $("#selectCustomerFooter").hide();
             
            if (noGroup===1 && noCustomer===1) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('No Group and Member to Send Notification');   
                }else {
                    app.showAlert("No Group and Member to Send Notification", "Notification");  
                }
                app.mobileApp.navigate('#view-all-activities-GroupDetail');
            }else if (noGroup===0 && noCustomer===1) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('No Member to Send Notification');   
                }else {
                    app.showAlert("No Member to Send Notification", "Notification");  
                }
                app.mobileApp.navigate('#view-all-activities-GroupDetail');    
            }else {
                $("#sendNotificationDivMsg").show();
                $("#sendNotiDiv").show();   
                $(".km-scroll-container").css("-webkit-transform", "");
            }
             
            $(".km-scroll-container").css("-webkit-transform", "");
            app.mobileApp.pane.loader.hide();    
        };
         
        var escapeGroupGoCustClick = function() {                 
            $(".km-scroll-container").css("-webkit-transform", "");
            $("#customerBackButton").hide();
            $("#customerNextButton").css("width", "90%");
            $("#selectGroupDiv").hide();
            $("#selectGroupFooter").hide();

            $("#selectCustomerToSend").show();
            $("#selectCustomerFooter").show();
            $("#selectOrgLoader").hide();

            app.mobileApp.pane.loader.hide();    
        };
        
        var goBackToGroupCustomer = function() {
            $(".km-scroll-container").css("-webkit-transform", "");                        
            $("#whatToDo").show();
            $("#sendNotificationDivMsg").hide();
            $("#sendNotiDiv").hide(); 
        }

        var groupCheckData = function() {
            $(':checkbox:checked').each(function(i) {
                groupChecked[i] = $(this).val();
            });
            
            groupChecked = String(groupChecked);        
            //console.log(groupChecked);
        };
         
        /*var getPhoto =function() {
        //alert('123');
        // Retrieve image file location from specified source
              
        navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,
        correctOrientation: true,
        destinationType : navigator.camera.DestinationType.DATA_URI,
        sourceType : navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
        });                            
              
        }*/
                  
        function onPhotoURISuccess(imageURI) {
            // Uncomment to view the image file URI
            // console.log(imageURI);
            // Get image handle
            var largeImage = document.getElementById('largeImage');
            largeImage.style.display = 'block';
            
            // Show the captured photo
            // The inline CSS rules are used to resize the image
            //
            largeImage.src = imageURI;
            dataToSend = imageURI;              
            $("#removeAttachment").show(); 
            $("#largeImage").show();
            upload_type = "other";
            

            var addedVideo = document.getElementById('attachedVidNoti');
            addedVideo.src = ''; 
            $("#attachedVidNoti").hide();            

            //alert(imageURI);
            //console.log(imageURI);
            //dataToSend = imageURI;
        }
        
        function onVideoURISuccessDataNoti(videoURI) {             
            var largeImage = document.getElementById('largeImage');
            largeImage.src = ''; 
            $("#largeImage").hide();            
            //console.log(imageURI);            
            // Uncomment to view the image file URI
            // console.log(imageURI);
            // Get image handle
            
            var videoAttached = document.getElementById('attachedVidNoti');
            videoAttached.style.display = 'block';
            
            // Show the captured photo
            // The inline CSS rules are used to resize the image
            
            videoAttached.src = 'styles/images/videoPlayIcon.png';
            dataToSend = videoURI;    
            upload_type = "video";            
            $("#attachedVidNoti").show();
            //alert(imageURI);
            //console.log(videoURI);
            //newsDataToSend = imageURI;
        }
         
        function onFail(message) {
            //console.log('Failed because: ' + message);
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
            scheduleDate = '';
            scheduleTime = '';
            tasks = '';
            tasks1='';
            sending_option = 'now';
            $("#selectScheduleDT").hide();
            $("#sendButton").show();
            document.getElementById("scheduleButton").value = "Schedule";
            $("#scheduleButton").css("width", "100");  
        }
        
        var onBackClsPicker = function(){                             
                $("#scheduleTimePicker").data("kendoDatePicker").close();
                $("#scheduleDatePicker").data("kendoTimePicker").close();           
        }
        
         
        return {
            init: init,
            show: show,
            closeSchedule:closeSchedule,
            scheduleNotification:scheduleNotification,
            beforeShow:beforeShow,
            skipToSeletType:skipToSeletType,
            goBackToGroup:goBackToGroup,
            sendNotificationOrg:sendNotificationOrg,
            sendNotificationGroup:sendNotificationGroup,
            escapeGroupClick:escapeGroupClick,
            skipToCustomerType:skipToCustomerType,
            NextToCustomerType:NextToCustomerType,
            NextToSeletType:NextToSeletType,
            groupCheckData:groupCheckData,
            onBackClsPicker:onBackClsPicker,
            goBackToGroupCustomer:goBackToGroupCustomer,
            onChangeNotiGroup:onChangeNotiGroup,
            transferFileAbort:transferFileAbort,
            clickOnSelectGroup:clickOnSelectGroup,
            clickOnSelectCustomer:clickOnSelectCustomer,
            //getPhoto:getPhoto,
            getPhotoVal:getPhotoVal,
            getVideoValNoti:getVideoValNoti,
            getTakePhoto:getTakePhoto,
            removeImage:removeImage,
            sendNotificationMessage:sendNotificationMessage
        };
    }());
     
    return sendNotificationViewModel;
}());