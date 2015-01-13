var app = app || {};

app.sendNotification = (function () {
    var validator;
    var notificationTypeSelected;
    var dataToSend ;
    var noGroup = 0;
    var noCustomer = 0;
    var schedule = 0 ; 
    var scheduleDate;
    var scheduleTime;
    var sending_option = 'now';
    var tasks;
    var upload_type;
    var scheduleDiv = 0;

    var groupChecked = [];
    var sendNotificationViewModel = (function () {
        var orgId = localStorage.getItem("UserOrgID"); 
        console.log(orgId);
                  
        var pictureSource;   // picture source
        var destinationType; // sets the format of returned value
   
        var init = function () {				                 
            app.MenuPage = false;
            app.userPosition = false;
            //validator = $('#enterNotification').kendoValidator().data('kendoValidator');                                 

            /*var showNotiTypes = [
                { text: "Promotion", value: "P" },
                { text: "Invitaion", value: "V" },
                { text: "Information", value: "I" },
               { text: "Reminder", value: "R" },
                { text: "Alert", value: "A" }      
            ];
            
            var dataSource = new kendo.data.DataSource({
                                                           data: showNotiTypes
                                                       });
            
            $("#type-Name-listview").kendoMobileListView({
                                                             template: kendo.template($("#typeNameTemplate").html()),    		
                                                             dataSource: dataSource,
                                                             click : function(e) {
                                                                 console.log(e.dataItem.value);
                                                                 notificationTypeSelected = e.dataItem.value;
                                                                 $("#selectTypeDiv").hide();
                                                                 $("#sendNotificationDivMsg").show();
                                                                 $("#sendNotiDiv").show();
                                                                 app.mobileApp.pane.loader.hide();     
                                                             }
                                                         });
            */


            $("#notificationType").kendoComboBox({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: [
            { text: "Promotion", value: "P" },
            { text: "Invitaion", value: "V" },
            { text: "Information", value: "I" },
            { text: "Reminder", value: "R" },
            { text: "Alert", value: "A" }
            ],
            filter: "contains",
            placeholder: "Select Type",
            suggest: true
            //index: 0
            });
                        
            
            var input = $("#notificationType").data("kendoComboBox").input;
            input.attr("readonly", "readonly");
            
            /*$('#notificationType').attr('readonly','readonly');
            
            var combobox = $("#notificationType").data("kendoComboBox"); 
            combobox.input.focus(function() {
                combobox.input.blur();
            });*/

            /*$("#type-Name-listview").kendoMobileListView({
            template: kendo.template($("#typeNameTemplate").html()),    		
            dataSource: dataSource,
            pullToRefresh: true
            });
            */
            //$("#groupSelectNotification").kendoComboBox();
            /*$("#groupforNotification").kendoComboBox({
            });
            var comboboxGroup = $("#groupforNotification").data("kendoComboBox"); 
            comboboxGroup.input.focus(function() {
            //$( "#orgforNotification" ).blur();
            comboboxGroup.input.blur();
            });
            var combobox = $("#notificationType").data("kendoComboBox"); 
            combobox.input.focus(function() {
            //$( "#orgforNotification" ).blur();
            combobox.input.blur();
            });*/                             
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
            console.log(groupDataShowOffline);
                
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupDataShowOffline
                                                                       });                           
             
            console.log(organisationListDataSource);
             
            $("#organisation-Name-listview").kendoMobileListView({
                                                                     template: kendo.template($("#orgNameTemplate").html()),    		
                                                                     dataSource: organisationListDataSource
                                                                 });
                
            console.log('showwwwwwwwwww');
            $('#organisation-Name-listview').data('kendoMobileListView').refresh();                
            //app.mobileApp.pane.loader.hide();
            $("#selectOrgDiv").show();
        };
                                       
        var show = function(e) {
            
            $(".km-scroll-container").css("-webkit-transform", "");
            $('#notificationDesc').css('height', '80px');
            

            $("#notificationType").data("kendoComboBox").value("");

            $("#scheduleDatePicker").parent().css('width',"160px");
            $("#scheduleTimePicker").parent().css('width',"160px");
            $("#scheduleDatePicker").removeClass( "k-input" );
            $("#scheduleTimePicker").removeClass( "k-input" );

            //$('#notificationType').attr('disabled','disabled');


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

            upload_type='';
            dataToSend = '';
           
            pictureSource = navigator.camera.PictureSourceType;
            destinationType = navigator.camera.DestinationType;
           
            closeSchedule();
            
            //$notificationDesc.val('');
            // validator.hideMessages();
            
            //var scroller = e.view.scroller;
            //scroller.reset();
            

            localStorage.setItem("SELECTED_GROUP", '');
            localStorage.setItem("SELECTED_CUSTOMER", '');
            
            $("#notificationTitleValue").val('');            
            $("#notificationDesc").val('');
            
            var largeImage = document.getElementById('largeImage');
            largeImage.src = '';
            document.getElementById('comment_allow').checked = false;
            
            $("#selectGroupDiv").hide();
            $("#selectGroupFooter").hide();
            //$("#selectTypeDiv").hide();
            $("#sendNotificationDivMsg").hide();
            $("#sendNotiDiv").hide();
            $("#selectCustomerToSend").hide();
            $("#selectCustomerFooter").hide();

            var currentDate = app.getPresentDate();            
            disabledDaysBefore = [
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
                                                             console.log(value); 

                                                             scheduleDate = value;
                                                             /*if(new Date(value) < new Date(currentDate)){                   
                                                             if(!app.checkSimulator()){
                                                             window.plugins.toast.showLongBottom('You Cannot Add Event on Back Date');  
                                                             }else{
                                                             app.showAlert('You Cannot Add Event on Back Date',"Event");  
                                                             }                                
                                                             }*/    
                                                         }
                                                     }).data("kendoDatePicker");
                         
            $("#scheduleTimePicker").kendoTimePicker({
                                                         value:"10:00 AM",
                                                         interval: 15,
                                                         format: "h:mm tt",
                                                         timeFormat: "HH:mm", 
                                                         /*open: function(e) {
                                                         e.preventDefault(); //prevent popup opening
                                                         },*/
                
                                                         change: function() {
                                                             var value = this.value();
                                                             console.log(value); //value is the selected date in the timepicker

                                                             scheduleTime = value;
                                                         }                
                                                     });
            
            setTimeout(function() {
                $("#scheduleDatePicker").bind("focus", function() {
                    $("#scheduleDatePicker").blur();                    
                });
            }, 100); 
            
            setTimeout(function() {            
                $("#scheduleTimePicker").bind("focus", function() {
                    $("#scheduleTimePicker").blur();
                }); 
            }, 100); 
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }            
            

            sendNotificationOrg();

            
        };    
                              
        var onChangeNotiGroup = function() {
            var selectDataNoti = $("#groupforNotification").data("kendoComboBox");    
            var groupSelectedNoti = selectDataNoti.value();
            console.log(groupSelectedNoti);
            return groupSelectedNoti;
        };
         
        var getPhotoVal = function() {
            navigator.camera.getPicture(onPhotoURISuccess, onFail, { 
                                            quality: 50,
                                            destinationType: destinationType.FILE_URI,
                                            sourceType: pictureSource.SAVEDPHOTOALBUM
                                        });
        };
                  
        var getTakePhoto = function() {
            navigator.camera.getPicture(onPhotoURISuccess, onFail, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: destinationType.FILE_URI,
                                            sourceType: pictureSource.CAMERA,
                                            saveToPhotoAlbum:true
                                        });
        };
        
        var getVideoValNoti = function(){            
            //navigator.device.capture.captureVideo(captureSuccess, captureError, {limit: 1});                      
              navigator.camera.getPicture(onVideoURISuccessDataNoti, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            mediaType: navigator.camera.MediaType.VIDEO
              });
        }

        
        

        var sendNotificationMessage = function () {    
            //alert(dataToSend);undefined
            console.log(dataToSend);
             
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
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
             
                var selectedType = $("#notificationType").data("kendoComboBox");
                var type=selectedType.value();
             
                //var type = notificationTypeSelected;
                //alert(type);
             
                var cmmt_allow ;
                if ($("#comment_allow").prop('checked')) {
                    cmmt_allow = 1;  // checked
                }else {
                    cmmt_allow = 0;
                }
             
                console.log(cmmt_allow);
                var notificationValue = $("#notificationDesc").val();
                var titleValue = $("#notificationTitleValue").val();
                //alert(titleValue +"||"+notificationValue);            
             
                console.log(notificationValue + "||" + titleValue + "||" + type + "||" + cmmt_allow + "||" + cmbGroup + "||" + cmbCust + "||" + org_id);
                   
                //alert(cmbGroup);
                //alert(cmbCust);

                console.log(scheduleDate + "||" + scheduleTime + "||" + sending_option);
               
                if (scheduleDiv===1) {
                    sending_option = 'later';    
                    console.log('later div open');
                    var schedule_Date = $("#scheduleDatePicker").val();
               
                    var values = schedule_Date.split('/');
               
                    var month = values[0]; // globle variable
                    var day = values[1];
                    var year = values[2];
                                  
                    console.log('------------------date=---------------------');
                    console.log(year + "||" + month + "||" + day);
               
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
            
                    console.log(Hour + "||" + minute + "||" + AmPm);
            
                    schedule_Time = Hour + ":" + minute + ":00";
               
                    var second = "00";
                                                 
                    tasks = +new Date(year + "/" + month + "/" + day + " " + Hour + ":" + minute + ":" + second);
                                  
                    console.log(tasks);
 
                    console.log(schedule_Date + "||" + schedule_Time);
                                  
                    /*console.log('------------------date=---------------------');
                    console.log(year+"||"+month+"||"+day);
                                  
                    tasks[+new Date(year+"/"+month+"/"+day)] = "ob-done-date";
                                  
                    console.log(tasks);
                                  
                    //tasks[+new Date(2014, 11, 8)] = "ob-done-date";
                                 
                    if(day<10){
                    day = day.replace(/^0+/, '');                                     
                    }
                    var saveData = month+"/"+day+"/"+year;
                    */

                    console.log('1');
                    var sendNotificationTime = new Date(schedule_Date + " " + schedule_Time);     
                   
                    //var unixtime = Date.parse(schedule_Date+" "+schedule_Time).getTime()/1000
                    console.log(sendNotificationTime);
                }else {
                    tasks = '';  
                    sending_option = 'now';    
                }  
               
                if (org_id===null) {
                    app.showAlert('Please select Organization', 'Validation Error');
                }else if (cmbGroup ==='' && (cmbCust==='' || cmbCust==="null")) {
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
                }else if (type==='') {
                    app.showAlert('Please select Notification Type', 'Validation Error');     
                }else if (titleValue==='') {
                    app.showAlert('Please select Notification Title', 'Validation Error');       
                }else if (notificationValue==='') {
                    app.showAlert('Please select Notification Message', 'Validation Error');           
                }else { 
                    $("#progressSendNotification").show();
                    //var url = "http://54.85.208.215/webservice/notification/sendNotification";              
                    var vidFmAndroid=0;                    
                    //alert(upload_type);
                    if ((dataToSend!==undefined && dataToSend!=="undefined" && dataToSend!=='')) { 
                        //alert("1");
                        if ((dataToSend.substring(0, 21)==="content://com.android") &&(upload_type==="other")) {
                            photo_split = dataToSend.split("%3A");
                            dataToSend = "content://media/external/images/media/" + photo_split[1];
                             vidFmAndroid=1;
                        }else if((dataToSend.substring(0, 21)==="content://com.android")&&(upload_type==="video")){
                                //alert('2');
                              photo_split = dataToSend.split("%3A");
                              console.log(photo_split);
                              dataToSend = "content://media/external/video/media/" + photo_split[1];
                              vidFmAndroid=1;  
                            }

                        var mimeTypeVal;

                        if(upload_type==="image"){
                           mimeTypeVal="image/jpeg"
                        }else{
                            mimeTypeVal="video/mpeg"
                        }    
                                                
                        var filename = dataToSend.substr(dataToSend.lastIndexOf('/') + 1);
                            console.log(filename);
                            //alert(filename);      
                        var path =  dataToSend;
                            console.log(path);
                            //alert(path);
                        
                            //alert(upload_type);
                        
                        if(upload_type==="image" && vidFmAndroid===1){
                                 if(filename.indexOf('.') === -1)
                             {
                                  filename =filename+'.jpg';
                             }                
                        }else if(upload_type==="video" && vidFmAndroid===1){
                                 if(filename.indexOf('.') === -1)
                             {
                                  filename =filename+'.mp4';
                             }
                        }
                                            
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
              
                        console.log("-------------------------------------------");
                        console.log(options.fileName);
              
                        options.mimeType = mimeTypeVal;
                        options.params = params;
                        options.headers = {
                            Connection: "close"
                        }
                        options.chunkedMode = true;
                        
                        var ft = new FileTransfer();
                        console.log(tasks);
                  
                        /* 
                        var deviceName = app.devicePlatform();             
                        if(deviceName==='Android'){
                        console.log("upload file from Android");
                        window.resolveLocalFileSystemURL(dataToSend, function(fileEntry) {
                        fileEntry.file(function(fileObj) {
                        var fileName;
                        fileName = fileObj.fullPath;
                        console.log("-------------------------------------------");
                        console.log(fileName);
                        options.fileName = fileName.substr(fileName.lastIndexOf('/') + 1);
                        ft.upload(fileName,encodeURI("http://54.85.208.215/webservice/notification/sendNotification"), win, fail, options, true);
                        });
                        });
                        } else {
                        console.log("upload file from other device");
                        ft.upload(dataToSend, 'http://54.85.208.215/webservice/notification/sendNotification', win, fail, options, true);
                        }
                        */
                   
                        /*window.resolveLocalFileSystemURI(dataToSend
                        , function(entry){

                        console.log("****************HERE YOU WILL GET THE NAME AND OTHER PROPERTIES***********************");
                        console.log("IMAGE NAME-"+entry.name);
                        console.log("PATH NAME"+entry.fullPath);

                        }, function(e){

                        }); 
                        */ 
                 
                        console.log("----------------------------------------------check-----------");
                        //dataToSend = '//C:/Users/Gaurav/Desktop/R_work/keyy.jpg';
                        ft.upload(dataToSend, 'http://54.85.208.215/webservice/notification/sendNotification', win, fail, options , true);
                    }else {
                       console.log(tasks);                 
                        var notificationData = {"cmbGroup":cmbGroup,"cmbCust":cmbCust ,"type":type,"title":titleValue, "message":notificationValue ,"org_id" : org_id,"comment_allow":cmmt_allow,"sending_option":sending_option,"send_date":tasks ,"attached":0}                            
                        var dataSourceSendNotification = new kendo.data.DataSource({
                                                                                       transport: {
                                read: {
                                                                                                   url: app.serverUrl() + "notification/sendNotification",
                                                                                                   type:"POST",
                                                                                                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                                   async: false,                                                               
                                                                                                   data: notificationData
                                    
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
                                                                                           console.log(e);
               
                                                                                           //alert(JSON.stringify(e));
               
                                                                                           //navigator.notification.alert("Please check your internet connection.",
                                                                                           //function () { }, "Notification", 'OK');
               
                                                                                           if (!app.checkSimulator()) {
                                                                                               window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                                                                           }else {
                                                                                               app.showAlert("Network problem . Please try again later","Notification");  
                                                                                           }
                   
                                                                                           if (!app.checkSimulator()) {
                                                                                               //window.plugins.toast.showShortBottom('Notification Send Successfully');   
                                                                                           }else {
                                                                                               //app.showAlert("Notification Send Successfully", "Notification"); 
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
                                console.log(notification.status[0].Msg);
                               
                                if (notification.status[0].Msg==='Notification Sent') {
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom('Notification Send Successfully');   
                                    }else {
                                        app.showAlert("Notification Send Successfully", "Notification"); 
                                    }
  
                                    $("#notificationTitleValue").val('');            
                                    $("#notificationDesc").val('');
                                    document.getElementById('comment_allow').checked = false;
                                    var largeImage = document.getElementById('largeImage');
                                    largeImage.src = '';
                                    $("#progressSendNotification").hide();

                                    app.mobileApp.navigate('#view-all-activities-GroupDetail'); 

                                    //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 
                                   
                                    app.callAdminOrganisationList();
                                    //$("#notificationType").data("kendoComboBox").value("");
                                    //$("#groupforNotification").data("kendoComboBox").value("");
                                    //$("#orgforNotification").data("kendoComboBox").value("");
                                }else if (notification.status[0].Msg==='Notification Sheduled') {
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom('Notification Scheduled Successfully');   
                                    }else {
                                        app.showAlert("Notification Scheduled Successfully", "Notification"); 
                                    }
  
                                    $("#notificationTitleValue").val('');            
                                    $("#notificationDesc").val('');

                                    document.getElementById('comment_allow').checked = false;
                                    //var largeImage = document.getElementById('largeImage');
                                    //largeImage.src ='';
                                    $("#progressSendNotification").hide();

                                    app.mobileApp.navigate('#view-all-activities-GroupDetail'); 

                                    //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 
                                   
                                    app.callAdminOrganisationList();
                                }else {
                                    app.showAlert(notification.status[0].Msg , 'Notification'); 
                                    $("#progressSendNotification").hide();
                                }
                            });               
                        });                
                    }  
                }
            }   
        };
         
        function win(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
          
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('Notification Send Successfully');   
            }else {
                app.showAlert("Notification Send Successfully", "Notification"); 
            }
              
            $("#notificationTitleValue").val('');            
            $("#notificationDesc").val('');
            document.getElementById('comment_allow').checked = false;
            var largeImage = document.getElementById('largeImage');
            largeImage.src = '';
            $("#progressSendNotification").hide();

            app.mobileApp.navigate('#view-all-activities-GroupDetail');
            //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 
        }
         
        function fail(error) {
            console.log(error);
            console.log("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);

            $("#progressSendNotification").hide();
 
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('Network problem . Please try again later');   
            }else {
                app.showAlert("Network problem . Please try again later", "Notification");  
            }
        }
         
        var sendNotificationOrg = function(e) {
            
            $("#selectOrgLoader").show();
            //console.log(e.data.org_id);
            //var org = e.data.org_id;       


            var org = localStorage.getItem("orgSelectAdmin");

            localStorage.setItem("SELECTED_ORG", org);
             
            var comboGroupListDataSource = new kendo.data.DataSource({
                                                                         transport: {
                    read: {
                                                                                     url: app.serverUrl() + "group/index/" + org,
                                                                                     type:"POST",
                                                                                     dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                  
                                                                                    async: false
                                                                                 }
                },
                                                                         schema: {               
                    data: function(data) {
                        console.log(data);
                        var groupDataShow = [];
                        $.each(data, function(i, groupValue) {
                            console.log(groupValue);

                            console.log(groupValue[0].Msg);
                            
                            if (groupValue[0].Msg==='No Group list') {
                                $("#selectGroupDiv").hide();
                                $("#selectGroupFooter").hide();

                                $("#selectOrgDiv").hide();
                                noGroup = 1;        
                                         
                                localStorage.setItem("SELECTED_GROUP", 0); 
                                escapeGroupGoCustClick();
                                
                            }else if(groupValue[0].Msg==="You don't have access"){
                                    app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                                    app.mobileApp.navigate('views/organisationLogin.html');   
                                    localStorage.setItem("loginStatusCheck", 1);                                
                            }else {
                                var orgLength = groupValue[0].groupData.length;
                                for (var j = 0;j < orgLength;j++) {
                                    groupDataShow.push({
                                                           group_desc: groupValue[0].groupData[j].group_desc,
                                                           group_name: groupValue[0].groupData[j].group_name,
                                                           group_status:groupValue[0].groupData[j].group_status,
                                                           org_id:groupValue[0].groupData[j].org_id,
                                                           pid:groupValue[0].groupData[j].pid

                                                       });
                                }
                                
                                console.log(groupDataShow);
                                
                                $("#selectOrgDiv").hide();
                                $("#selectGroupDiv").show();
                                $("#selectGroupFooter").show();
                                $("#selectOrgLoader").hide();

                            }
                        });
                       
                        console.log(groupDataShow);
                        return groupDataShow;                       
                    }
                },
                                                                         error: function (e) {
                                                                             //apps.hideLoading();
                                                                             console.log(e);
                                                                             
                                                                             $("#selectOrgLoader").hide();
                                                                             app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response from API fetching Organization Group for Send Notification in Admin Panel.');
                         
                                                                     var showNotiTypes = [
                                                                         { message: "Please Check Your Internet Connection"}
                                                                     ];
                       
                                                                     var dataSource = new kendo.data.DataSource({
                                                                                                                    data: showNotiTypes
                                                                                                     });
                    
                                                                     $("#group-Name-listview").kendoMobileListView({
                                                                                                                        template: kendo.template($("#errorTemplate").html()),
                                                                                                                        dataSource: dataSource  
                                                                                                                    });
                
                                                                         },       
                                                                         sort: { field: 'add', dir: 'desc' }    	     
                                                                     });
                          

            $("#group-Name-listview").kendoListView({
                                                        template: kendo.template($("#groupNameTemplate").html()),    		
                                                        dataSource: comboGroupListDataSource
                                                    });
             
            app.mobileApp.pane.loader.hide();
             
            var UserModel = {
                id: 'Id',
                fields: {
                    mobile: {
                            field: 'mobile',
                            defaultValue: ''
                        },
                    first_name: {
                            field: 'first_name',
                            defaultValue: ''
                        },
                    email: {
                            field: 'email',
                            defaultValue:''
                        },
                    last_name: {
                            field: 'last_name',
                            defaultValue:''
                        },
                    customerID: {
                            field: 'customerID',
                            defaultValue:''
                        }

                }
            };
             
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             url: app.serverUrl() + "customer/getOrgCustomer/" + org,
                                                                             type:"POST",
                                                                             dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                  
                                                                             async: false,
                                                                         }
                },
                                                                 schema: {
                    model: UserModel,
                    data: function(data) {
                        console.log(data);                      
                        var groupDataShowCustomer = [];
                        $.each(data, function(i, groupValue) {
                            console.log(groupValue);
                                     
                            $.each(groupValue, function(i, orgVal) {
                                console.log(orgVal);

                                if (orgVal.Msg ==='No Customer in this organisation') {     
                                    noCustomer = 1;
                                    escapeGroupClick();
                                }else if (orgVal.Msg==='Success') {
                                    console.log(orgVal.allCustomer.length);  
                                    for (var i = 0;i < orgVal.allCustomer.length;i++) {
                                        groupDataShowCustomer.push({
                                                                       mobile: orgVal.allCustomer[i].uacc_username,
                                                                       first_name: orgVal.allCustomer[i].user_fname,
                                                                       email:orgVal.allCustomer[i].user_email,  
                                                                       last_name : orgVal.allCustomer[i].user_lname,
                                                                       customerID:orgVal.allCustomer[i].custID,
                                                                       account_id:orgVal.allCustomer[i].account_id,
                                                                       orgID:orgVal.allCustomer[i].orgID
                                                                   });
                                    }     
                                }else if(orgVal.Msg==="You don't have access"){
                                    app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                                    app.mobileApp.navigate('views/organisationLogin.html');                                     
                                } 
                            });
                        });
                       
                        console.log(groupDataShowCustomer);
                        return groupDataShowCustomer;
                    }

                },
                                                                 error: function (e) {
                                                                     console.log(e);                    
                                                                     if (!app.checkSimulator()) {
                                                                         window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                     }else {
                                                                         app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                     }                                                                      
                                                                     app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response from API fetching Organization Customer for Send Notification in Admin Panel.');
                         
                                                                     var showNotiTypes = [
                                                                         { message: "Please Check Your Internet Connection"}
                                                                     ];
                       
                                                                     var dataSource = new kendo.data.DataSource({
                                                                                                                    data: showNotiTypes
                                                                                                     });
                    
                                                                     $("#customer-Name-listview").kendoMobileListView({
                                                                                                                        template: kendo.template($("#errorTemplate").html()),
                                                                                                                        dataSource: dataSource  
                                                                                                                    });               
                                                                 }	        
                                                             });         
                     	                     
                $("#customer-Name-listview").kendoListView({
                                                           dataSource: MemberDataSource,
                                                           template: kendo.template($("#customerNameTemplate").html()),
                                                           schema: {
                    model:  UserModel
                }			
                                                       });
        };
         
        var skipToSeletType = function() {
            $("#selectCustomerToSend").hide();
            $("#selectCustomerFooter").hide();
            escapeGroupClick();
        };
         
        var goBackToGroup = function(){
         
                $("#selectGroupDiv").show();
                $("#selectGroupFooter").show();

                $("#selectCustomerToSend").hide();
                $("#selectCustomerFooter").hide();

        }
        
        
        var NextToSeletType = function() {
          
            var customer = [];
		    
            $(':checkbox:checked').each(function(i) {
                customer[i] = $(this).val();
            });
            
            customer = String(customer);        
            console.log(customer);
                        
         if(customer.length!==0 && customer.length!=='0'){

            $("#selectCustomerToSend").hide();
            $("#selectCustomerFooter").hide();
          
            localStorage.setItem("SELECTED_CUSTOMER", customer);  
            escapeGroupClick();
         }else{
             
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom('Select Atleast One Customer.');   
                        }else {
                            app.showAlert("Select Atleast One Customer.", "Notification");  
                        }
             
         }   
        };
         
        var skipToCustomerType = function() {
            $("#selectGroupDiv").hide();
            $("#selectGroupFooter").hide();
            $("#selectCustomerToSend").show();
            $("#selectCustomerFooter").show();   
        };
         
        var NextToCustomerType = function() {

                        var group = [];
		    
            $(':checkbox:checked').each(function(i) {
                group[i] = $(this).val();
            });
            
            group = String(group);        
            console.log(group);      
              
         if(group.length!==0 && group.length!=='0'){
                         
            $("#selectGroupDiv").hide();
            $("#selectGroupFooter").hide();

            localStorage.setItem("SELECTED_GROUP", group); 
            $("#selectCustomerToSend").show();                            
            $("#selectCustomerFooter").show();    
         
         }else{
             
                       if (!app.checkSimulator()) {
                              window.plugins.toast.showShortBottom('Select Atleast One Group.');   
                        }else {
                            app.showAlert("Select Atleast One Group.", "Notification");  
                        }

         }    
        };
         
        var sendNotificationGroup = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");
            console.log(e.data.pid);
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
                    window.plugins.toast.showShortBottom('No Group and Customer to Send Notification');   
                }else {
                    app.showAlert("No Group and Customer to Send Notification", "Notification");  
                }
                app.mobileApp.navigate('#view-all-activities-GroupDetail');
            }else if (noGroup===0 && noCustomer===1) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('No Customer to Send Notification');   
                }else {
                    app.showAlert("No Customer to Send Notification", "Notification");  
                }
                app.mobileApp.navigate('#view-all-activities-GroupDetail');    
            }else {
                //$("#selectTypeDiv").show();
                $("#sendNotificationDivMsg").show();
                $("#sendNotiDiv").show();   
                
            }
             
            $(".km-scroll-container").css("-webkit-transform", "");

            app.mobileApp.pane.loader.hide();    
        };
         
        var escapeGroupGoCustClick = function() {                 
            $(".km-scroll-container").css("-webkit-transform", "");
            $("#customerBackButton").hide();
            $("#customerNextButton").css("width","90%");
            $("#selectGroupDiv").hide();
            $("#selectGroupFooter").hide();

            $("#selectCustomerToSend").show();
            $("#selectCustomerFooter").show();
            $("#selectOrgLoader").hide();

            app.mobileApp.pane.loader.hide();    
        };
        
        goBackToGroupCustomer = function(){
            $(".km-scroll-container").css("-webkit-transform", "");
            
            if(noGroup===1){

                $("#selectGroupDiv").hide();
                $("#selectGroupFooter").hide();

                $("#selectCustomerToSend").show();
                $("#selectCustomerFooter").show();

                
            }else{

                $("#selectGroupDiv").show();
                $("#selectGroupFooter").show();

                $("#selectCustomerToSend").hide();
                $("#selectCustomerFooter").hide();


            }
            
            $("#sendNotificationDivMsg").hide();
            $("#sendNotiDiv").hide(); 
        }

        var groupCheckData = function() {
            $(':checkbox:checked').each(function(i) {
                groupChecked[i] = $(this).val();
            });
            
            groupChecked = String(groupChecked);        
            console.log(groupChecked);
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
            upload_type="other";


            //alert(imageURI);
            console.log(imageURI);
            //dataToSend = imageURI;
        }
        
        function onVideoURISuccessDataNoti(videoURI) {             
            var largeImage = document.getElementById('largeImage');
            largeImage.src = ''; 
            $("#removeAttachment").hide(); 
            $("#largeImage").hide();            
            //console.log(imageURI);            
            // Uncomment to view the image file URI
            // console.log(imageURI);
            // Get image handle
            
            var videoAttached = document.getElementById('attachedVidNoti');
            videoAttached.style.display = 'block';
            
            // Show the captured photo
            // The inline CSS rules are used to resize the image
            
            videoAttached.src = videoURI;
            dataToSend = videoURI;    
            upload_type= "video";
            
            $("#removeAttachment").show(); 
            $("#attachedVidNoti").show();

            //alert(imageURI);
            console.log(videoURI);
            //newsDataToSend = imageURI;
        }
         
        function onFail(message) {
            console.log('Failed because: ' + message);
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
            goBackToGroupCustomer:goBackToGroupCustomer,
            onChangeNotiGroup:onChangeNotiGroup,
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