var app = app || {};
app.adminTimeTable = (function () {
     'use strict';
    var adminTimeTableModel = (function () {
        var organisationID;
        var TimeTableDataToSend;
        var groupAllTimeTable = [];
        var device_type;
        var groupDataShow = [];
        var pbTimeTable;
        var ft;
        var photo_split;
        var countVal=0;
        var page=0;
        var totalListView=0;
        var dataReceived=0;
        var sysFilePage=0;
        var exportInnerPage=false;
        var historyPath=[];
        var parentDir;
        var sdcardPath;
        
        var init = function() {
            
        }
           
        var TimeTableEditShow = function(e) {
            var data = e.button.data();
            TimeTablePid = data.timetableid;
            app.mobileApp.navigate('#adminEditTimeTable');                        
            //app.analyticsService.viewModel.trackFeature("User navigate to TimeTable Edit in Admin");            
        }
        
        
        var addTimeTableshow = function() {
          $(".km-scroll-container").css("-webkit-transform", "");  
          $('.km-popup-arrow').addClass("removeArrow");  
          exportInnerPage=false;            
          if(sysFilePage!==1){
            app.showAppLoader(true);  
            device_type = localStorage.getItem("DEVICE_TYPE");
            $(".km-native-scroller").scrollTop(0);

            $("#addTimeTableName").val('');

            groupDataShow = [];
            
            $("#attachedPdfTimeTable").hide();
            $("#attachedPdfTimeTableImage").hide();  

            var largeImage = document.getElementById('attachedPdfTimeTableImage');
            largeImage.src = '';
            $("#attachedPdfName").hide();  
            $("attachedPdfName").html('');
            
            $("#groupInAddTimeTable option:selected").removeAttr("selected");
            $('#groupInAddTimeTable').empty();
                        
            getGroupToShowInCombo();
          }     
        }
        
        var getGroupToShowInCombo = function(e) {
            var org = localStorage.getItem("orgSelectAdmin");
             
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
                                                                                         }else {
                                                                                             app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                         }
                                                                                         //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                                     }    
                                                                         
                                                                         },       
                                                                         sort: { field: 'add', dir: 'desc' }    	     
                                                                     });
            
            comboGroupListDataSource.fetch(function() {                                                       
                groupDataShow = [];
                var data = this.data();                
                                            
                if (data[0]['status'][0].Msg==='No Group list') {
                    groupDataShow=[];
                    app.noGroupAvailable();

                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    goToTimeTableListPage();
                }else if (data[0]['status'][0].Msg==='Session Expired') {
                            app.LogoutFromAdmin();                         
                }else {
                    var orgLength = data[0].status[0].groupData.length;
                    for (var j = 0;j < orgLength;j++) {
                        groupDataShow.push({
                                               group_name: data[0].status[0].groupData[j].group_name,
                                               pid:data[0].status[0].groupData[j].pid
                                           });
                    }
                    showGroupDataInTemplate();
                }  
                
                app.hideAppLoader();
            });
        };
        
        var showGroupDataInTemplate = function() {
            app.hideAppLoader();
            
            $(".km-scroll-container").css("-webkit-transform", "");
           
            
            $.each(groupDataShow, function (index, value) {
                $('#groupInAddTimeTable').append($('<option/>', { 
                    value: value.pid,
                    text : value.group_name 
                }));
            });
        }
        
        var TimeTableNameEdit;
        var TimeTableImageEdit;
        var TimeTablePid;
        var TimeTableGroupid;
        
        
        
        var deleteTimeTable = function(e) {            
          navigator.notification.confirm(app.DELETE_CONFIRM, function (confirmed) {           
           if (confirmed === true || confirmed === 1) {                        
             if (!app.checkConnection()) {
                                                      if (!app.checkSimulator()) {
                                                            window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                      }else {
                                                            app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                      } 
             }else {
                    organisationID = localStorage.getItem("orgSelectAdmin");                        
                    var dataSourceaddGroup = new kendo.data.DataSource({
                                                                   transport: {
                    read: {
                                                                               url: app.serverUrl() + "timetable/deleteTimetable/"+ organisationID + "/" + TimeTablePid,
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
                                                                                               //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                   }               
          
                                                               });  
	            
                  dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            if (addGroupData.status[0].Msg==='Success') {         
                                app.mobileApp.navigate("#adminTimeTableList");                        
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom(app.TIMETABLE_DELETED_MSG);   
                            }else {
                                app.showAlert(app.TIMETABLE_DELETED_MSG ,"Notification");  
                            }
                            }else if (addGroupData.status[0].Msg==="You don't have access") {                                    
                     
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                            }else {
                                app.showAlert(app.NO_ACCESS , 'Offline');  
                            }
                                
                        }else {
                            app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                        }
                    });                    
                  });
             }    
           }else {

           }
          }, app.APP_NAME, ['Yes', 'No']);            
        }
        
        var editTimeTableshow = function() {            
          $("#popover-editTimeTable").removeClass("km-widget km-popup");
          $('.km-popup-arrow').addClass("removeArrow");            
          $(".km-scroll-container").css("-webkit-transform", "");                    
            
          if(sysFilePage!==2){
            TimeTableDataToSend='';
            sysFilePage=0;
                          

              document.getElementById("imgDownloaderATT").innerHTML = "";
            
              pbTimeTable = new ProgressBar.Circle('#imgDownloaderATT', {
                    color: '#7FBF4D',
                    strokeWidth: 8,
                    fill: '#f3f3f3'
              });
  
            
              app.showAppLoader(true);
            $("#wrapp_content_admTimeTable").hide();  
                                                
            var org_id = localStorage.getItem("orgSelectAdmin");
            var dataSourceMemberDetail = new kendo.data.DataSource({
                                                                       transport: {
                    read: {
                                                                                   url: app.serverUrl() + "timetable/getTimeTableByID/" + org_id + "/" + TimeTablePid,
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
                                                                           $("#wrapp_content_admTimeTable").show();  
                                                                           
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
                                                                                               //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                
                                                                       }               
                                                                   });  
	            
            dataSourceMemberDetail.fetch(function() {
                var data = this.data();                        

                    if (data[0]['status'][0].Msg==='Success') {
                        
                        TimeTableNameEdit = data[0]['status'][0].Timetable[0].group_name;
                        TimeTableImageEdit = data[0]['status'][0].Timetable[0].timetable; 
                        TimeTablePid = data[0]['status'][0].Timetable[0].id;
                        TimeTableGroupid = data[0]['status'][0].Timetable[0].group_id;                        
                        
                        $("#timeTableGroup").val(data[0]['status'][0].Timetable[0].group_name); 
                        
                                    
                        if (TimeTableImageEdit!==undefined && TimeTableImageEdit!=="undefined" && TimeTableImageEdit!=='') {
                            var largeImage = document.getElementById('attachedImgEditTimeTableImage');
                            largeImage.style.display = 'block';
                            var getType = app.getFileExtension(TimeTableImageEdit);
                            if(getType==="pdf"){
                                largeImage.src = "";
                                $("#attachedImgEditTimeTable").show();
                                $("#attachedImgEditTimeTableImage").hide();
                            }else{
                                $("#attachedImgEditTimeTable").hide();
                                $("#attachedImgEditTimeTableImage").show();
                              largeImage.src = TimeTableImageEdit;    
                            }
                            TimeTableDataToSend=TimeTableImageEdit;
                            $("#editAttachedPdfName").show();
                            $("#editAttachedPdfName").html(app.proURIDecoder(TimeTableImageEdit.replace(/^.*[\\\/]/, '')));                            
                        }else {
                            var largeImage = document.getElementById('attachedImgEditTimeTableImage');
                            largeImage.style.display = 'none';
                            largeImage.src = '';
                            $("#attachedImgEditTimeTable").hide();
                            $("#editAttachedPdfName").hide();
                            TimeTableImageEdit='';
                        }                           
            
                    }else if (data[0]['status'][0].Msg==="Session Expired") {
                        app.LogoutFromAdmin(); 
                    }else if (data[0]['status'][0].Msg==="You don't have access") {
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                        }else {
                            app.showAlert(app.NO_ACCESS , 'Offline');  
                        }
                    }else {
                        app.showAlert(data[0]['status'][0].Msg , 'Notification'); 
                    }                               
                    app.hideAppLoader();
                    $("#wrapp_content_admTimeTable").show(); 
                    
            });
          }    
        }
                      
        var addNewTimeTableFunction = function() {            
            var group = [];            
            $('#groupInAddTimeTable :selected').each(function(i, selected){ 
                  group[i] = $(selected).val(); 
            });                        
            group = String(group);
            
            if (group.length===0 || group.length==='0') {
                app.showAlert("Please select Group.", app.APP_NAME);
            }else if(TimeTableDataToSend=== undefined || TimeTableDataToSend==="undefined" || TimeTableDataToSend==='') { 
                app.showAlert("Please attach file.", app.APP_NAME); 
            }else{   
                    pbTimeTable.animate(0);
                    countVal=0;
                
                    if ((TimeTableDataToSend.substring(0, 21)==="content://com.android")) {
                        photo_split = TimeTableDataToSend.split("%3A");
                        TimeTableDataToSend = "content://media/external/images/media/" + photo_split[1];
                    }
                                        
                    
                    var filename = TimeTableDataToSend.substr(TimeTableDataToSend.lastIndexOf('/') + 1);
                    var ext = app.getFileExtension(filename);
                    var ranNum = app.genRandNumber();
                    if(ext===''){
                       filename = 'img_'+ranNum+'.jpg';  
                    }else if(ext==='pdf'){
                      filename = 'pdf_'+ranNum+'.pdf'; 
                    }else{
                      filename = 'img_'+ranNum+'.'+ext;  
                    }
                    
                
                    $("#admTimeTable-upload-file").data("kendoMobileModalView").open();                    
                

                    var params = new Object();
                    params.org_id = organisationID;  //you can send additional info with the file
                    params.group_id = group;
                                               
                    var options = new FileUploadOptions();
                    options.fileKey = "upload_file";
                    options.fileName = filename;
                    options.chunkedMode = false;
                    options.params = params;
                    options.headers = {
                        Connection: "close"
                    }
                    ft = new FileTransfer();                    
                    ft.onprogress = function(progressTimeTable) {
                        if (progressTimeTable.lengthComputable) {
                            var perc = Math.floor(progressTimeTable.loaded / progressTimeTable.total * 100);
                            countVal=perc;
                             var j = countVal/100;                        
                                pbTimeTable.animate(j, function() {
                                    pbTimeTable.animate(j);
                                });

                        }else {
                            pbTimeTable.animate(0);
                            countVal=0;
                        }
                    };                                     
                    ft.upload(TimeTableDataToSend, app.serverUrl() + 'timetable/addtimetable', win, fail, options , true);
                }                
         }
        
        var transferAdmTimeTableAbort = function() {
          if(countVal < 90){
            countVal = 0; 
            pbTimeTable.animate(0); 
              app.hideAppLoader();
            ft.abort(); 
            $("#admTimeTable-upload-file").data("kendoMobileModalView").close();                        
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
                    window.plugins.toast.showShortBottom(app.TIMETABLE_ADDED_MSG);  
                }else {
                    app.showAlert(app.TIMETABLE_ADDED_MSG , 'Notification');  
                }            
            pbTimeTable.animate(0);
            countVal=0;
            
            $("#admTimeTable-upload-file").data("kendoMobileModalView").close();              
            var largeImage = document.getElementById('attachedPdfTimeTableImage');
            largeImage.src = '';            
            app.hideAppLoader();
            app.mobileApp.navigate("#adminTimeTableList");
        }
         
        function fail(error) {
            pbTimeTable.animate(0);
            countVal=0;
            $("#admTimeTable-upload-file").data("kendoMobileModalView").close();
             
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.TIMETABLE_EVENT_FAIL);  
                }else {
                    app.showAlert(app.TIMETABLE_EVENT_FAIL , 'Notification');  
                }
            }            
            app.hideAppLoader();
            //app.analyticsService.viewModel.trackFeature("TimeTable Add or Update fail"+JSON.stringify(error));            
        }


        var attachedImgFilename;
        var imgFile;
        var imgNotiFi;
        var fp;
        var downloadName;
        
        var imageDownlaodClick = function(e){
            var data = e.button.data();           
            imgFile = data.imgpath;  
            imgNotiFi = data.timetableid;
            downloadName = 'timetable_'+imgNotiFi;
            attachedImgFilename = imgFile.replace(/^.*[\\\/]/, '');
            var ext = app.getFileExtension(attachedImgFilename);
            
            if (ext==='') {                
                attachedImgFilename = attachedImgFilename + '.jpg'; 
                downloadName = downloadName+ '.jpg'; 
            }else if (ext==='pdf'){
                downloadName = downloadName+ '.pdf';
            }else{
                downloadName = downloadName+ '.jpg';
            }
          
            fp = sdcardPath + app.SD_NAME+"/" + 'timeTable/' + attachedImgFilename;     
            window.resolveLocalFileSystemURL(fp, imgPathExist, imgPathNotExist);
        }
                        
        var imgPathExist = function() { 
            if (device_type==="AN") {                                      
                window.plugins.fileOpener.open(fp);
            }else {
                window.open(fp, "_blank", 'location=no,enableViewportScale=yes,closebuttoncaption=Close');                                   
            }
        }
        
        var imgPathNotExist = function() {
          if (!app.checkConnection()) {
                window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                                                                           
          }else {
                var attachedImg = imgFile;
                countVal=0;  
                ft = new FileTransfer();  
                $("#admTimeTable-upload-file").data("kendoMobileModalView").open();

                ft.onprogress = function(progresstimeTable) {
                    if (progresstimeTable.lengthComputable) {
                        var perc = Math.floor(progresstimeTable.loaded / progresstimeTable.total * 100);
                        countVal = perc;                        
                          var j = countVal/100;                        
                                pbTimeTable.animate(j, function() {
                                    pbTimeTable.animate(j);
                                });
                    }else {
                        pbTimeTable.animate(0);
                        countVal = 0;
                    }
                };
              
                        ft.download(attachedImg, fp, 
                                      function(entry) {                                                                                                                      
                                          countVal = 0;                                               
                                          $("#admTimeTable-upload-file").data("kendoMobileModalView").close();
                                          pbTimeTable.animate(0);
                                          //if (device_type==="AN") {                                      
                                              //window.open(fp, "_system", 'location=yes');
                                              //window.plugins.fileOpener.open(fp);
                                          //}else {
                                              //window.open(fp, "_blank", 'location=no,enableViewportScale=yes,closebuttoncaption=Close');                                   
                                          //}
                                          window.plugins.toast.showShortBottom(app.DOWNLOAD_COMPLETED);                                               
                                      }, 
                                      function(error) {
                                          pbTimeTable.animate(0);
                                          countVal = 0;
                                          $("#admTimeTable-upload-file").data("kendoMobileModalView").close();                                   
                                      }
                    );  
  
             }  
        }

        var saveEditTimeTableData = function() {
            var TimeTable_name = $("#editTimeTableName").val();                 
            if (TimeTable_name === "Enter New TimeTable Name" || TimeTable_name === "") {
                app.showAlert("Please enter TimeTable Name.", app.APP_NAME);
            }else if(TimeTableDataToSend===undefined || TimeTableDataToSend==="undefined" || TimeTableDataToSend===''){ 
                app.showAlert("Please attach file.", app.APP_NAME);
            }else{    
                
                    if ((TimeTableDataToSend.substring(0, 21)==="content://com.android")) {
                        photo_split = TimeTableDataToSend.split("%3A");
                        TimeTableDataToSend = "content://media/external/images/media/" + photo_split[1];
                    }


                    var filename = TimeTableDataToSend.substr(TimeTableDataToSend.lastIndexOf('/') + 1);    
                    var ext = app.getFileExtension(filename);
                    var ranNum = app.genRandNumber();
                                    
                    if(ext===''){
                       filename = 'img_'+ranNum+'.jpg';  
                    }else if(ext==='pdf'){
                      filename = 'pdf_'+ranNum+'.pdf'; 
                    }else{
                      filename = 'img_'+ranNum+'.'+ext;  
                    }
                
                    pbTimeTable.animate(0);
                    countVal=0;

                    $("#admTimeTable-upload-file").data("kendoMobileModalView").open();
                    
                    var params = new Object();
                    params.org_id = organisationID;  //you can send additional info with the file
                    params.id = TimeTablePid;    
                    
                    var options = new FileUploadOptions();
                    options.fileKey = "upload_file";
                    options.fileName = filename;              
                    options.params = params;
                    options.headers = {
                        Connection: "close"
                    }
                    options.chunkedMode = false;
                    
                    ft = new FileTransfer();
                    ft.onprogress = function(progressTimeTable) {
                        if (progressTimeTable.lengthComputable) {
                            var perc = Math.floor(progressTimeTable.loaded / progressTimeTable.total * 100);
                                countVal=perc;                            
                                var j = countVal/100;                        
                                pbTimeTable.animate(j, function() {
                                    pbTimeTable.animate(j);
                                });
                        }else {
                            pbTimeTable.animate(0);
                                        countVal=0;

                        }
                    };

                    ft.upload(TimeTableDataToSend, app.serverUrl() + 'timetable/editTimetable', winEdit, fail, options , true);
                }      
        }
        
        function winEdit(r) {

            app.hideAppLoader();
            pbTimeTable.animate(0);
            countVal=0;
            $("#admTimeTable-upload-file").data("kendoMobileModalView").close();              
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.TIMETABLE_UPDATED_MSG);  
                }else {
                    app.showAlert(app.TIMETABLE_UPDATED_MSG , 'Notification');  
                }
         
            app.mobileApp.navigate("#adminTimeTableList");
        }
        
        var goToManageOrgPage = function() {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');
        }
        
        var goToCalendarPage = function() {
            app.mobileApp.navigate('#adminTimeTableCalendar');
        }
                
        var addNewTimeTable = function() {
            app.mobileApp.navigate('#adminAddTimeTable');
        }
        
        var upcommingTimeTableList = function() {
            app.mobileApp.navigate('#adminTimeTableList');
        }
        
        var goToAddTimeTablePage = function() {
            app.mobileApp.navigate('#adminTimeTableCalendarDetail');
        }
        
        var TimeTableListShow = function() {        
            sysFilePage=0;
            $("#showMoreBrochurBtn").hide();
            app.showAppLoader();
            $(".km-scroll-container").css("-webkit-transform", "");            
            
            sdcardPath = localStorage.getItem("sdCardPath");     
            device_type = localStorage.getItem("DEVICE_TYPE");
            countVal=0;
            TimeTableDataToSend = '';
            
            
            page=0;
            dataReceived=0;
            totalListView=0;
            groupAllTimeTable = [];
            organisationID = localStorage.getItem("orgSelectAdmin");            
            
            
            document.getElementById("imgDownloaderATT").innerHTML = "";
            
            pbTimeTable = new ProgressBar.Circle('#imgDownloaderATT', {
                   color: '#7FBF4D',
                   strokeWidth: 8,
                   fill: '#f3f3f3'
            });
            
            
             
           getLiveData();
        }
        
        
        var getLiveData = function(){
                        
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                                    read: {
                                                                            url: app.serverUrl() + "timetable/index/"+organisationID,
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
                                                                    $("#TimeTableAllList").show();

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
                                                                                               //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                     
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var data = this.data(); 
                var loginDataView = dataSourceLogin.data();               
						                                  
                if (data[0]['status'][0].Msg==='Session Expired') {
                            app.LogoutFromAdmin();                         
                    
                }else if (data[0]['status'][0].Msg==="You don't have access") {                                                           
                    
                    if(!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }                       
                        goToManageOrgPage();
                }else if (data[0]['status'][0].Msg==='Success') { 
                    
                  if(data[0]['status'][0].Timetable !== false) {
                      var TimeTableListLength = data[0].status[0].Timetable.length;
                        for (var i = 0 ; i < TimeTableListLength ;i++) {  
                            groupAllTimeTable.push({
                                                   id: data[0].status[0].Timetable[i].id,
                                                   sNo:1+1,
                                                   added_by: data[0].status[0].Timetable[i].added_by,
                                                   timetable_url : data[0].status[0].Timetable[i].timetable,
                                                   timetable_group: data[0].status[0].Timetable[i].group_name,                                                                                  										  
                                                   timetable_groupID: data[0].status[0].Timetable[i].group_id,
                                                   org_id: data[0].status[0].Timetable[i].org_id
                                               });        
                        }
                    showInListView();
                  }else{
                      
                            groupAllTimeTable=[];
                            groupAllTimeTable.push({
                                                   id:0,
                                                   added_by: '',
                                                   timetable_url : '',
                                                   timetable_group: 'No Timetable from this Organization',                                                                                  										  
                                                   timetable_groupID: '',
                                                   org_id: ''
                                               });
                      showInListView();                      
                  }                    
                }
                
            });
        }
        
        var showInListView = function() {
            app.hideAppLoader();
            $("#TimeTableAllList").show();
            
            $(".km-scroll-container").css("-webkit-transform", "");
             
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupAllTimeTable
                                                                       });           
                
            $("#TimeTableAllList").kendoMobileListView({
                                                               template: kendo.template($("#adminTimeTableListTemplate").html()),    		
                                                               dataSource: organisationListDataSource
                                                           });
                
            $('#TimeTableAllList').data('kendoMobileListView').refresh();            
            if((totalListView > 10) && (totalListView >=dataReceived+10)){
                $("#showMoreBrochurBtn").show();
            }else{ 
                $("#showMoreBrochurBtn").hide();
            }
        }
        
        
        var removeImage = function() {                        
            $("#attachedPdfTimeTable").hide();
            $("#attachedPdfTimeTableImage").hide();
            $("#attachedPdfName").hide();
            $("#attachedPdfName").html('');         
            TimeTableDataToSend = '';             
        }
        
        var goToTimeTableListPage = function() {
            app.mobileApp.navigate('#adminTimeTableList');
        }

        var removeTimeTableEdit = function() {

            var largeImage = document.getElementById('attachedImgEditTimeTableImage');
            largeImage.src = "";
            $("#attachedImgEditTimeTable").hide();
            $("#attachedImgEditTimeTableImage").hide();
            
            $("#editAttachedPdfName").hide();
            $("#editAttachedPdfName").html('');         
            TimeTableDataToSend = ''; 
        }
        
        var addTimeTableByAdmin = function() {
            app.mobileApp.navigate('#adminAddTimeTable');
        }
                
        var open=0;
        var clickToSelectGroup = function(){
            
            if(open===0){
                $("#groupInAddTimeTable").hide().slideDown({duration: 500});
                open=1;
            }else{
                $("#groupInAddTimeTable" ).slideUp("slow");
                open=0
            }

        }

                
        var selectAllCheckBox = function(){

            if ($("#selectAllTimeTable").prop('checked')===true){ 
                    $('.largerCheckbox').prop('checked', false);
                    document.getElementById("selectAllTimeTable").checked=false;
                }else{
                    $('.largerCheckbox').prop('checked', true); 
                    document.getElementById("selectAllTimeTable").checked=true;
                }

        }
        
        var showMoreButtonPress = function(){
          if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
          }else { 
            page++;
            dataReceived=dataReceived+10;
            getLiveData();            
          }
        }
        
         
        var checkClick = function(){
            if ($("#selectAllTimeTable").prop('checked')===true){
                    $('.largerCheckboxSelectAll').prop('checked', false);
                    document.getElementById("selectAllTimeTable").checked=false;
            }
        }
        
        
        var closeParentPopover = function(){
            var popover = e.sender.element.closest('[data-role=popover]').data('kendoMobilePopOver');
            popover.close();
        }
        
                       
        var closeModalViewLogin = function() {
            $("#modalview-login").kendoMobileModalView("close");
        }
        
      
        
      
        
        var checkFileExt = function(){
             var fileName = document.getElementById("addedPdf").value
            if (fileName == "") {
                alert("Browse to upload a valid File with png extension");
                return false;
            }
            else if (fileName.split(".")[1].toUpperCase() == "PNG")
                return true;
            else {
                alert("File with " + fileName.split(".")[1] + " is invalid. Upload a validfile with png extensions");
                return false;
            }
            return true;
        }
        
        
        var actionTypePdf;
        var getPdfFile = function(e){
            actionTypePdf= e.sender.element[0].attributes['actionType'].value;            
            sysFilePage = e.sender.element[0].attributes['actionFrom'].value;
            app.mobileApp.navigate('#systemPDFList');
        }
                      
        var systemPDFshow = function(){
            historyPath=[];
            getFileSystem();
        }
        
        var root;
        function getFileSystem(){
          setTimeout(function(){
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                function(fileSystem){ // success get file system
               	 root = fileSystem.root;
                	listDir(root);
                }, 
                function(evt){ // error get file system
                }
            );
          },100);     
        }
 
           var currentDir        
            function listDir(directoryEntry){             

            if(historyPath[historyPath.length-1] !== directoryEntry.name){
            	historyPath.push(directoryEntry.name);
            }
            
            if(historyPath.length === 1)
            {
                $('#systemPDFList .inner-docs-back').addClass("hidedocsback");
                $('#systemPDFList .inner-docs-back span.exportDocs').addClass("hidedocsback");
            }else
            {
                $('#systemPDFList .inner-docs-back').removeClass("hidedocsback");
                $('#systemPDFList .inner-docs-back span.exportDocs').removeClass("hidedocsback");
            }
            
            currentDir = directoryEntry; // set current directory
             
            directoryEntry.getParent(function(par){ // success get parent
                 parentDir = par; // set parent directory
            	 if( currentDir.name === root.name) setExportRootPage();
            }, function(error){ // error get parent
            });

            var directoryReader = directoryEntry.createReader();
            directoryReader.readEntries(function(entries){
              var dirContent = $('#dirContentUpload');
              dirContent.empty();
              var dirArr = new Array();
              var filsArr = new Array();
                
              for(var i=0; i<entries.length;i++){ // sort entries
                  
                var newdirArr = new Array();
                newdirArr.fullPath= entries[i].fullPath;
                newdirArr.isFile= entries[i].isFile;
                newdirArr.name= entries[i].name;
                newdirArr.nativeURL= entries[i].nativeURL;
                newdirArr.isDirectory= entries[i].isDirectory;
                newdirArr.isPdf = app.getFileExtension(entries[i].nativeURL);  
                  
            	if(newdirArr.name[0] !== '.' && newdirArr.isDirectory===true){ 
                    dirArr.push(newdirArr);
                }  
                if(newdirArr.name[0] !== '.' && newdirArr.isDirectory!==true && (newdirArr.isPdf==='pdf')){
                    filsArr.push(newdirArr);                
                } 
              }
                

              dirArr.sort(function(obj1, obj2) {
                var aName = obj1.name.toLowerCase();
                var bName = obj2.name.toLowerCase();
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
              });
                

              filsArr.sort(function(obj1, obj2) {
                var aName = obj1.name.toLowerCase();
                var bName = obj2.name.toLowerCase();
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
              });   
              $.merge( dirArr, filsArr );                   
              setExportDocs(dirArr);  
 
            }, function(error){
              
           });
        }
                
        function setExportDocs(data)
        {
            var that = this;          
            if(typeof $(".dirContentUpload").data("kendoMobileListView") !=='undefined' )
            {
                $(".dirContentUpload").data("kendoMobileListView").destroy();
            }
            $(".dirContentUpload").kendoMobileListView({
                dataSource: data,
                template: $("#docs-upload-template").html(),
                }).kendoTouch({ 
                	filter: ">li",
                  	tap: function (e) { 
                            if(e.touch.initialTouch.dataset.id==="folder")
                            {
                                setExportInnerPage();
                                getActiveItem(e.touch.initialTouch.dataset.name);

                            }
                            if(e.touch.initialTouch.dataset.id==="files")
                            {
                                var fileNativeUrl = e.touch.initialTouch.dataset.url;
                                getAttachedFile(fileNativeUrl);
                            }
                	},                
            });
            $("#tabstrip-file-upload").find(".km-scroll-container").css("-webkit-transform", "");            
        }
        
        function getActiveItem(name)
        {   
            var activeItem ='';
            if(currentDir !== null ){
                currentDir.getDirectory(name, {create:false},
                    function(dir){ // success find directory
                    	activeItem = dir;
                        listDir(activeItem);
                    }, 
                    function(error){ // error find directory
                    }
                );
            } 
        }
        
        function getAttachedFile(imageURI) {           
            TimeTableDataToSend = imageURI;
            var getType = app.getFileExtension(TimeTableDataToSend);
            var largeImage = document.getElementById('attachedPdfTimeTableImage');
            largeImage.src = '';
            var largeImage1 = document.getElementById('attachedImgEditTimeTableImage');
            largeImage1.src = '';
            exportInnerPage=false;
            if(actionTypePdf==="add"){ 
                $("#attachedPdfName").show();
                $("#attachedPdfName").html(app.proURIDecoder(imageURI.replace(/^.*[\\\/]/, '')));
                sysFilePage=1;
                if(getType==="pdf"){
                    largeImage.src = "";
                    $("#attachedPdfTimeTable").show();
                    $("#attachedPdfTimeTableImage").hide();
                }else{
                    $("#attachedPdfTimeTableImage").show();
                    $("#attachedPdfTimeTable").hide();

                    largeImage.src = imageURI;    
                }
                app.mobileApp.navigate('#adminAddTimeTable');
            }else{
                $("#editAttachedPdfName").show();
                $("#editAttachedPdfName").html(app.proURIDecoder(imageURI.replace(/^.*[\\\/]/, '')));
                sysFilePage=2;
                if(getType==="pdf"){
                    largeImage.src = "";
                    $("#attachedImgEditTimeTable").show();
                    $("#attachedImgEditTimeTableImage").hide();                    
                }else{
                    $("#attachedImgEditTimeTable").hide();
                    $("#attachedImgEditTimeTableImage").show();                                     
                    largeImage1.src = imageURI;    
                }
                app.mobileApp.navigate('#adminEditTimeTable');                
            }                 
        }
        
        var mimeType;        

        function getMimeType(file_URI)
        {
            mimeType ='';
            window.resolveLocalFileSystemURL(file_URI, function(fileEntry) {
                fileEntry.file(function(filee) {
                        options.mimeType= filee.type; //THIS IS MIME TYPE
                    }, function() {
                        alert('error getting MIME type');
                });
            }, getMimeTypeOnError);
            return;
        }
        
        function getMimeTypeOnError()
        {
        }        
        
        function setExportRootPage(){
            exportInnerPage=false;
        }
        
        function setExportInnerPage()
        {
           exportInnerPage=true;
        }
        
        var gobackFileExportPage=function(e)
        {
            if(exportInnerPage===true){
                 historyPath.pop(currentDir.name);
                 listDir(parentDir);
            }else{
                if(actionTypePdf==="add"){                
                    sysFilePage=1;
                    app.mobileApp.navigate('#adminAddTimeTable');
                }else{
                    sysFilePage=2;
                    app.mobileApp.navigate('#adminEditTimeTable');                    
                }    
                 exportInnerPage=false;
                 
            }    
        }
        
        var jumpBackToTimeTable = function(){
                if(actionTypePdf==="add"){                
                    sysFilePage=1;
                    app.mobileApp.navigate('#adminAddTimeTable');
                }else{
                    sysFilePage=2;
                    app.mobileApp.navigate('#adminEditTimeTable');                    
                }    
                 exportInnerPage=false;
                    
        }
        
         var getPhotoVal = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
                                        });
        };
        
        function onPhotoURISuccessData(imageURI) {            
            var largeImage = document.getElementById('attachedPdfTimeTableImage');            
            largeImage.style.display = 'block';            
            largeImage.src = imageURI;
            
            TimeTableDataToSend = imageURI;            
            $("#attachedPdfTimeTable").hide();
            $("#attachedPdfTimeTableImage").show();
            $("#attachedPdfName").show();
            $("#attachedPdfName").html(app.proURIDecoder(imageURI.replace(/^.*[\\\/]/, '')));
            

        }
        
        function onFail(message) {
            $("#attachedPdfTimeTable").hide();
            $("#attachedPdfTimeTableImage").hide();
            $("#attachedPdfName").hide();
        }

        var getPhotoValEdit = function() {
            navigator.camera.getPicture(onPhotoURISuccessDataEdit, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };
              
        function onPhotoURISuccessDataEdit(imageURI) {
            var largeImage = document.getElementById('attachedImgEditTimeTableImage');
            largeImage.style.display = 'block';
            largeImage.src = imageURI;
            
            TimeTableDataToSend = imageURI;              
            $("#attachedImgEditTimeTable").hide();
            $("#attachedImgEditTimeTableImage").show();
            

            $("#editAttachedPdfName").show();
            $("#editAttachedPdfName").html(app.proURIDecoder(imageURI.replace(/^.*[\\\/]/, '')));
            
        }
        
        return {
            init: init,
            getPdfFile:getPdfFile,
            systemPDFshow:systemPDFshow,
            checkClick:checkClick,
            gobackFileExportPage:gobackFileExportPage,
            addTimeTableByAdmin:addTimeTableByAdmin,
            jumpBackToTimeTable:jumpBackToTimeTable,          
            closeModalViewLogin:closeModalViewLogin,
            getPhotoVal:getPhotoVal,   
            getPhotoValEdit:getPhotoValEdit,
            removeImage:removeImage,
            closeParentPopover:closeParentPopover,
            goToAddTimeTablePage:goToAddTimeTablePage,
            removeTimeTableEdit:removeTimeTableEdit,
            
            goToTimeTableListPage:goToTimeTableListPage,
            TimeTableListShow:TimeTableListShow,
            getLiveData:getLiveData,
            addNewTimeTable:addNewTimeTable,
            deleteTimeTable:deleteTimeTable,
            editTimeTableshow:editTimeTableshow,
            goToCalendarPage:goToCalendarPage,
            showMoreButtonPress:showMoreButtonPress,
            goToManageOrgPage:goToManageOrgPage,
            imageDownlaodClick:imageDownlaodClick,
            addNewTimeTableFunction:addNewTimeTableFunction,
            addTimeTableshow:addTimeTableshow,
            TimeTableEditShow:TimeTableEditShow,
            transferAdmTimeTableAbort:transferAdmTimeTableAbort,
            selectAllCheckBox:selectAllCheckBox,
            clickToSelectGroup:clickToSelectGroup,
            saveEditTimeTableData:saveEditTimeTableData,
            upcommingTimeTableList:upcommingTimeTableList,
            checkFileExt:checkFileExt
         
        };
    }());
        
    return adminTimeTableModel;
}());