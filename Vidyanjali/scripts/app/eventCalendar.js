var app = app || {};
app.eventCalender = (function () {
   'use strict';
    var calendarEventModel = (function () {
        var eventOrgId;
        var account_Id;
        var groupAllEvent = [];
        var tasks = [];
        var multipleEventArray=[];
        var page=0;
        var totalListView=0;
        var dataReceived=0;
        var device_type; 
        //var imageSourceOrg;
        var orgin;
        var sdcardPath;
        var evtImgFileName;

        var init = function() {
        };
    
        var show = function(e) {
            $(".km-scroll-container").css("-webkit-transform", ""); 
            app.USER_IFRAME_OPEN=0;
            device_type = localStorage.getItem("DEVICE_TYPE"); 
            $("#showMoreEventBtn").hide();
            tasks = [];
            multipleEventArray = [];
            $("#CalProcess").show();                                     
            account_Id = localStorage.getItem("ACCOUNT_ID");
            eventOrgId = localStorage.getItem("selectedOrgId");            
            //imageSourceOrg = localStorage.getItem("selectedOrgLogo");
            sdcardPath = localStorage.getItem("sdCardPath");
            orgin = e.view.params.orgin;
            if(orgin===1 || orgin==='1' ){
                $("#idBackHome").show();
                $("#idBackOrg").hide();
            }else{
                $("#idBackHome").hide();
                $("#idBackOrg").show();               
            }
            
            page=0;
            dataReceived=0;
            totalListView=0;
            groupAllEvent = [];
            
          if (!app.checkConnection()) {
            if (!app.checkSimulator()) {                                                                     
                window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                  
            }else {              
                app.showAlert(app.INTERNET_ERROR , 'Offline');                   
            }              
            getLocalData();  
          }else{
            getLiveData();  
          }            
        };
        
        
        var getLiveData = function(){
            var jsonDataLogin = {"org_id":eventOrgId,"account_id":account_Id,"page":page};
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "event/customerEvent",
                                                                            type:"POST",
                                                                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                            data: jsonDataLogin
                                                                        }
                    },
                                                                schema: {
                    data: function(data) {	
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                   $("#CalProcess").hide();                                                                    
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
                                                                    getLocalData();
                                                                }                              
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                    var data = this.data();                                          
                    if (data[0]['status'][0].Msg==='No Event list') {
                        tasks = [];
                        groupAllEvent = [];
                        eventListFirstShow();
                    }else if (data[0]['status'][0].Msg==='Success') {
                         tasks = [];                             
                        totalListView = data[0]['status'][0].Total;
                        var orgNameToShow = localStorage.getItem("selectedOrgName");
                        if (data[0].status[0].eventData.length!==0) {
                          $
			              .each(
					      data[0].status[0].eventData,
			              function(i, eventData) {  
                                 var eventDaya = eventData.event_date;                                
                                 var eventDateString = eventData.event_date;
                                 var eventTimeString = eventData.event_time;                                 
                                 var eventDate = app.formatDate(eventDateString);
                                 var eventTime = app.formatTime(eventTimeString);   
                                 var belowData = app.getMonthData(eventDateString);                                
                                 var values = eventDaya.split('-');
                                 var year = values[0]; 
                                 var month = values[1];
                                 var day = values[2];                                  
                                 if (day < 10) {
                                    day = day.replace(/^0+/, '');                                     
                                 }                              
                                var saveData = month + "/" + day + "/" + year;                                 
                                var Filename;
                                var fp;
                                var downloadedImg;                                  
                                var attachedData = eventData.event_image;  
                             if (attachedData!== null && attachedData!=='' && attachedData!=="0"){     
                                Filename = attachedData.replace(/^.*[\\\/]/, '');
                                var ext = app.getFileExtension(Filename);
                                if (ext==='') {
                                    Filename = Filename + '.jpg'; 
                                }
                                fp = sdcardPath + app.SD_NAME+"/" + 'Zaffio_event_img_' + Filename;                                                                 
                                window.resolveLocalFileSystemURL(fp, 
                                function(entry)
                                {
                                      console.log('sdcard');
                                      downloadedImg = sdcardPath + app.SD_NAME+"/" + 'Zaffio_event_img_' + Filename;                        
                                      pushDataInArray(eventData,saveData,day,orgNameToShow,eventDate,belowData,eventDaya,eventTimeString,eventTime,i,downloadedImg);  
                                },function(error)
                                {
                                      console.log('not in sdcard');  
                                      downloadedImg = eventData.event_image;
                                      pushDataInArray(eventData,saveData,day,orgNameToShow,eventDate,belowData,eventDaya,eventTimeString,eventTime,i,downloadedImg);  
                                });
                             }else{
                                      downloadedImg = '';
                                      pushDataInArray(eventData,saveData,day,orgNameToShow,eventDate,belowData,eventDaya,eventTimeString,eventTime,i,downloadedImg);
                             }                                                             
                          });
                        }else{
                            groupAllEvent = [];
                            eventListFirstShow();
                        } 
                    }                                  
                    //eventListFirstShow();
                });

        }
        
        
        function pushDataInArray(eventData,saveData,day,orgNameToShow,eventDate,belowData,eventDaya,eventTimeString,eventTime,i,downloadedImg){             
            var indexVal; 
            if(page!==0){
                indexVal= parseInt(page+'0')+i+1;
            }else{
                indexVal=i+1;
            }            
            var locationToShow = eventData.location;
                if(locationToShow==="0" || locationToShow===0){
                      locationToShow='';
                }
            
                                                  groupAllEvent.push({
                                                       id: eventData.id,
                                                       add_date: eventData.add_date,
                                                       event_date: saveData,
                                                       event_show_day:day,
                                                       org_name_to_show:orgNameToShow,
                                                       event_date_To_Show:eventDate,
                                                       event_below_day:belowData,
                                                       calandar_Date:eventDaya,
                                                       calandar_Time:eventTimeString,
                                                       location:locationToShow,
                                                       upload_type:eventData.upload_type,
                                                       event_desc: eventData.event_desc,                                                                                 										  
                                                       event_name: eventData.event_name, 
                                                       event_image : eventData.event_image,
                                                       event_image_show : downloadedImg,
                                                       event_time: eventTime,                                                                              										  
                                                       mod_date: eventData.mod_date,                                     
                                                       org_id: eventData.org_id,
                                                       index:indexVal
                                                   });            
      
           // console.log(totalListView+"||"+indexVal);                           
            if(totalListView===indexVal){
                     eventListFirstShow(); 
                     setTimeout(function(){
                         callEventSaving();
                     },100);    
            }else if(indexVal % 10 ===0){                     
                     eventListFirstShow();
                     setTimeout(function(){     
                        callEventSaving();
                     },100);     
            }                       
        }               
        
        function callEventSaving(){
            var db = app.getDb();
            db.transaction(saveEventOffline, app.errorCB, app.successCB); 
        }
                
        function saveEventOffline(tx){
              var length = groupAllEvent.length;      
              //console.log(groupAllEvent);
              var queryDelete = "DELETE FROM ORG_EVENT";
              app.deleteQuery(tx, queryDelete);               
              if(length!==null && length!=='null' && length!==0 && length!=='0'){                                    
                  for(var i=0;i<length;i++){
                      /*console.log(groupAllEvent[i].id+"||"+groupAllEvent[i].org_id+"||"+groupAllEvent[i].event_name+"||"+groupAllEvent[i].event_desc+"||"+groupAllEvent[i].event_image_show+"||"+
                      groupAllEvent[i].upload_type+"||"+groupAllEvent[i].calandar_Date+"||"+groupAllEvent[i].calandar_Time+"||"+groupAllEvent[i].location);*/
                      
                      var query = 'INSERT INTO ORG_EVENT(id,org_id,event_name,event_desc,event_image,event_image_DB,upload_type,event_date,event_time,location) VALUES ("'
                                    + groupAllEvent[i].id
                                    + '","'
                                    + groupAllEvent[i].org_id
                                    + '","'
                                    + groupAllEvent[i].event_name
                                    + '","'
                                    + groupAllEvent[i].event_desc
                                    + '","'
                                    + groupAllEvent[i].event_image
                                    + '","'
                                    + groupAllEvent[i].event_image_show
                                    + '","'
                                    + groupAllEvent[i].upload_type
                                    + '","'
                                    + groupAllEvent[i].calandar_Date
                                    + '","'
                                    + groupAllEvent[i].calandar_Time
                                    + '","'
                                    + groupAllEvent[i].location                                    
                                    + '")';                                      
                                    app.insertQuery(tx, query);
                  }                                                                        
              }    
        }       
            
        var gobackToCalendar = function() {
            app.mobileApp.navigate('#eventCalendar');
        }
    
        var detailShow = function() {
            app.USER_IFRAME_OPEN=0;                      
            $("#popover-usereventAction").removeClass("km-widget km-popup");
            $('.km-popup-arrow').addClass("removeArrow");            
            $(".km-scroll-container").css("-webkit-transform", "");            
            $("#detailEventData").html("Event On " + multipleEventArray[0].event_date);
            
            var organisationListDataSource = new kendo.data.DataSource({
                    data: multipleEventArray
            });     
            
            $("#eventCalendarList").kendoMobileListView({
                         template: kendo.template($("#calendarTemplate").html()),    		
                         dataSource: organisationListDataSource
            });                
            $('#eventCalendarList').data('kendoMobileListView').refresh();
            
            if(multipleEventArray[0].event_image!=='null' && multipleEventArray[0].event_image!==null && multipleEventArray[0].event_image!==''){
                evtImgFileName = multipleEventArray[0].event_image.replace(/^.*[\\\/]/, '');          
                var fp = sdcardPath + app.SD_NAME+"/" + 'Zaffio_event_img_'+evtImgFileName; 
                window.resolveLocalFileSystemURL(fp, imagePathExist, imagePathNotExist);
            }
        };
        
        var imagePathExist = function() {
             console.log('Event Image already exist');
        };
        
        var imagePathNotExist = function() {
            var fp = sdcardPath + app.SD_NAME+"/" + 'Zaffio_event_img_' + evtImgFileName;             	
            var fileTransfer = new FileTransfer();              
            fileTransfer.download(multipleEventArray[0].event_image, fp, 
                                  function(entry) {
                                      console.log('Event image downloaded');
                                  },
    
                                  function(error) {
                                      console.log('error in Event image downloaded');
                                  }
                );                
        };
        
        var upcommingEventList = function() {
            app.mobileApp.navigate('#CustomerEventList');
        };
        
        
        var eventListFirstShow = function() {
            var allEventLength = groupAllEvent.length;            
            if (allEventLength===0) {
                groupAllEvent.push({
                                       id:0,
                                       add_date:'',
                                       event_date:'',
                                       event_desc: 'This Organization has no event.',                                                                                 										  
                                       event_name: 'No Event',                                                                                  										  
                                       event_time: '',
                                       location:'',
                                       event_image:'',
                                       mod_date: '',                                     
                                       org_id: ''
                                   });
            }
           
          setTimeout(function(){            
            groupAllEvent = groupAllEvent.sort(function(a, b) {
                  return parseInt(a.index) - parseInt(b.index);
            });
 
            var organisationListDataSourceFirst = new kendo.data.DataSource({
                                                                               data: groupAllEvent
                                                                           });           
                
            $("#eventCalendarFirstAllList").kendoMobileListView({
                                                                 template: kendo.template($("#calendarEventListTemplate").html()),  		
                                                                 dataSource: organisationListDataSourceFirst
                                                                });
             
            $('#eventCalendarFirstAllList').data('kendoMobileListView').refresh();           
              $("#CalProcess").hide();
            
             if((totalListView > 10) && (totalListView >=dataReceived+10)){
                $("#showMoreEventBtn").show();
            }else{
                $("#showMoreEventBtn").hide();
            }
          },300);     
        }
        

        var mapLocationShow;
        var eventSelected = function(e){
            //console.log(e);           
            
            mapLocationShow = e.data.location;
                               multipleEventArray.push({
                                                id: e.data.id,
                                                add_date: e.data.add_date,
                                                event_date: e.data.event_date,
                                                event_desc: e.data.event_desc,
                                                event_show_day:e.data.event_show_day,
                                                event_name: e.data.event_name,
                                                upload_type:e.data.upload_type,
                                                location:e.data.location,
                                                calandar_Date:e.data.calandar_Date,
                                                calandar_Time:e.data.calandar_Time,
                                                org_name_to_show:e.data.org_name_to_show,
                                                //event_above_day:e.data.event_above_day,
                                                event_below_day:e.data.event_below_day,
                                                event_image:e.data.event_image,
                                                event_image_show : e.data.event_image_show,
                                                event_time: e.data.event_time,                                                                                  										  
                                                mod_date: e.data.mod_date,
                                                org_id: e.data.org_id
                                            });            
            setTimeout(function(){
                app.mobileApp.navigate('#eventCalendarDetail');            
            },100);   
        }
        
        var gobackOrgPage = function(){
            app.mobileApp.navigate('#userOrgManage');            
        }
                
        var attachedFilename;
        var videoFile;
        var notiFi;
        
        var videoDownlaodClick = function(e){            
            var data = e.button.data();
            videoFile = data.someattribute;  
            notiFi = data.notiid;
            attachedFilename = videoFile.replace(/^.*[\\\/]/, '');
            var vidPathData = app.getfbValue();                    
            var fp = vidPathData + app.SD_NAME+"/" + 'Zaffio_event_video_' + attachedFilename;             
            window.resolveLocalFileSystemURL(fp, videoPathExist, videoPathNotExist);                        
        }
        
        var videoPathExist = function() {                      
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + app.SD_NAME+"/" + 'Zaffio_event_video_' + attachedFilename;
            if(device_type==="AP"){
                  window.open(fp, "_blank" ,'EnableViewPortScale=yes');
            }else{
                  window.plugins.fileOpener.open(fp);
            }            
        }
        
        var videoPathNotExist = function() {
            $("#video_Div_Event_"+notiFi).show();
            var attachedVid = videoFile;                        
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + app.SD_NAME+"/" + 'Zaffio_event_video_' + attachedFilename;            
            var fileTransfer = new FileTransfer();              
            fileTransfer.download(attachedVid, fp, 
                                  function(entry) {
                                      if(device_type==="AP"){
                                          window.open(fp, "_blank",'EnableViewPortScale=yes');
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }
                                      $("#video_Div_Event_"+notiFi).hide();
                                  },    
                                  function(error) {
                                      $("#video_Div_Event_"+notiFi).hide();
                                  }
                );                
        }
        
        var attachedImgFilename;
        var imgFile;
        var imgNotiFi;

        var imageDownlaodClick = function(e){
            var data = e.button.data();            
            imgFile = data.imgpath;  
            imgNotiFi = data.notiid;
            attachedImgFilename = imgFile.replace(/^.*[\\\/]/, '');
            var ext = app.getFileExtension(attachedImgFilename);
            if (ext==='') {
                attachedImgFilename = attachedImgFilename + '.jpg'; 
            }
            var fp = sdcardPath + app.SD_NAME+"/" + 'Zaffio_event_img_' + attachedImgFilename;             
            window.resolveLocalFileSystemURL(fp, imgPathExist, imgPathNotExist);                                    
        }
                
        var imgPathExist = function() {                    
               var fp = sdcardPath + app.SD_NAME+"/" + 'Zaffio_event_img_' + attachedImgFilename;               
                                      if(device_type==="AP"){
                                         window.open(fp, '_blank','location=no,enableViewportScale=yes,closebuttoncaption=Close');
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }
        }
        
        var imgPathNotExist = function() {
          if (!app.checkConnection()) {
                window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                  
          }else{
            $("#img_Div_Event_"+imgNotiFi).show();            
            var attachedImg = imgFile;                        
            var fp = sdcardPath + app.SD_NAME+"/" + 'Zaffio_event_img_' + attachedImgFilename;
            var fileTransfer = new FileTransfer();              
            fileTransfer.download(attachedImg, fp, 
                                  function(entry) {
                                      $("#img_Div_Event_"+imgNotiFi).hide();
                                      /*if(device_type==="AP"){
                                          window.open(fp, "_blank",'location=no,enableViewportScale=yes,closebuttoncaption=Close');
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }*/              
                                      window.plugins.toast.showShortBottom(app.DOWNLOAD_COMPLETED);
                                  },    
                                  function(error) {
                                      $("#img_Div_Event_"+imgNotiFi).hide();
                                      window.plugins.toast.showShortBottom(app.DOWNLOAD_NOT_COMPLETE);
                                  }
                );                
          }   
        }        
        
        var showMoreButtonPress = function() {
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
        
        var closeLocationMap = function() {
            $("#location_Map_UserSide").kendoMobileModalView("close");
            app.USER_IFRAME_OPEN=0;
        }
        
        var iFrameLocUrl = function(){  
          if (!app.checkConnection()) {
            if (!app.checkSimulator()) {                                                                     
                window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                  
            }else {              
                app.showAlert(app.INTERNET_ERROR , 'Offline');                   
            }              
          }else{ 
            app.USER_IFRAME_OPEN=1;  
            $("#userIFrameLoader").show();          
            var mapUrl = app.GEO_MAP_API+mapLocationShow;
            document.getElementById("setIFrame_UserSide").innerHTML='<iframe id="mapIframe" frameborder="0" style="border:0;margin-top:-150px;" src="'+mapUrl+'" onload="this.width=screen.width;this.height=screen.height"></iframe>';             
            /*setTimeout(function(){
                $("#userIFrameLoader").hide();
            },7000);*/ 
          }    
        }
        
        
         var DeleteEventFromCalendar = function(){            
                    var title = multipleEventArray[0].event_name ;
                    var location = multipleEventArray[0].location ;
                    var notes = multipleEventArray[0].event_desc ;
                    var eventDaya = multipleEventArray[0].calandar_Date ;
                    var eventTime = multipleEventArray[0].calandar_Time ;
                                             
                    var values = eventDaya.split('-');
                    var year = values[0]; // globle variable
                    var month = values[1];
                    var day = values[2];
                                  
                    var valueTime = eventTime.split(':');            
                    var Hour = valueTime[0]; // globle variable            
                    var Min = valueTime[1];        
                    var sec = valueTime[2];
            
                    var endHour = 23;
                    var endMin = 59;
                    var endSec = 0;
            
                                                                                                                         
                    var start = new Date(year + "/" + month + "/" + day + " " + Hour + ":" + Min + ":" + sec);      
                    //var start = new Date(2015,0,1,20,0,0,0,0);
                    var end = new Date(year + "/" + month + "/" + day + " " + endHour + ":" + endMin + ":" + endSec);
                    window.plugins.calendar.deleteEvent(title, location, notes, start, end, deleteSuccess, error);
        }

        
        function fromCalDeleteEvent(){
                    var title = multipleEventArray[0].event_name ;
                    var location = multipleEventArray[0].location ;
                    var notes = multipleEventArray[0].event_desc ;
                    var eventDaya = multipleEventArray[0].calandar_Date ;
                    var eventTime = multipleEventArray[0].calandar_Time ;
                                             
                    var values = eventDaya.split('-');
                    var year = values[0]; // globle variable
                    var month = values[1];
                    var day = values[2];
                                  
                    var valueTime = eventTime.split(':');            
                    var Hour = valueTime[0]; // globle variable            
                    var Min = valueTime[1];        
                    var sec = valueTime[2];
            
                    var endHour = 23;
                    var endMin = 59;
                    var endSec = 0;
            
                                                                                                                         
                    var start = new Date(year + "/" + month + "/" + day + " " + Hour + ":" + Min + ":" + sec);      
                    //var start = new Date(2015,0,1,20,0,0,0,0);
                    var end = new Date(year + "/" + month + "/" + day + " " + endHour + ":" + endMin + ":" + endSec);
                    window.plugins.calendar.deleteEvent(title, location, notes, start, end, delSuccess, error);
        }

        

        var AddEventToCalender = function() {
            fromCalDeleteEvent();            
                var deviceName = app.devicePlatform();                  
                var cal = window.plugins.calendar;
            
            /*if (deviceName==='iOS') {
                cal.deleteCalendar(calendarName, success, error);    
                var options = cal.getCreateCalendarOptions();
                options.calendarName = calendarName;
                options.calendarColor = "#FF0000"; // passing null make iOS pick a color for you
                cal.createCalendar(options, success, error);         
            }*/            
        
            
                    var title = multipleEventArray[0].event_name ;
                    var location = multipleEventArray[0].location ;
                    var notes = multipleEventArray[0].event_desc ;
                    var eventDaya = multipleEventArray[0].calandar_Date ;
                    var eventTime = multipleEventArray[0].calandar_Time ;

                                var values = eventDaya.split('-');
                                var year = values[0]; // globle variable
                                var month = values[1];
                                var day = values[2];

                                var valueTime = eventTime.split(':');            
                                var Hour = valueTime[0]; // globle variable            
                                var Min = valueTime[1];        
                                var sec = valueTime[2];
            
                                var endHour = 23;
                                var endMin = 59;
                                var endSec = 0;
                                                                                                             
                                var start = new Date(year + "/" + month + "/" + day + " " + Hour + ":" + Min + ":" + sec);      
                                //var start = new Date(2015,0,1,20,0,0,0,0);
                                var end = new Date(year + "/" + month + "/" + day + " " + endHour + ":" + endMin + ":" + endSec);
                                //var end = new Date(2015,0,1,22,0,0,0,0); 
            
                                if (deviceName==='Android') {
                                    cal.createEvent(title, location, notes, start, end, success, error);
                                }else if (deviceName==='iOS') {
                                    //console.log("-----------------insert--------------------");
                                    cal.createEvent(title, location, notes, start, end, success, error);
                                    //cal.createEventInNamedCalendar(title,location,notes,start,end,calendarName,success,error);            
                                }
        }

        function delSuccess(){
            console.log('success');
        }
        
        var success = function(message) {
            window.plugins.toast.showShortBottom('Event synced to your device calendar');
        };
        
        var deleteSuccess = function(message) {
            window.plugins.toast.showShortBottom('Event deleted from your device calendar');
        };
        
        var error = function(message) {

        };

        function getLocalData(){
            var db = app.getDb();
            db.transaction(getDatafromDB, app.errorCB, eventListFirstShow);         
        }
        
        function getDatafromDB(tx){
            var query = "SELECT * FROM ORG_EVENT";
            app.selectQuery(tx, query, dataFromEventDB);
        }
        
        function dataFromEventDB(tx, results){
            var count = results.rows.length;
             console.log(count);
               if (count !== 0) {
                     var orgNameToShow = localStorage.getItem("selectedOrgName");
                     for(var i=0;i<count;i++){
                                 var eventDaya = results.rows.item(i).event_date;                                
                                 var eventDateString = results.rows.item(i).event_date;
                                 var eventTimeString = results.rows.item(i).event_time;                                 
                                 var eventDate = app.formatDate(eventDateString);
                                 var eventTime = app.formatTime(eventTimeString);   
                                 var belowData = app.getMonthData(eventDateString);                                
                                 var values = eventDaya.split('-');
                                 var year = values[0]; 
                                 var month = values[1];
                                 var day = values[2];                                  
                                 if (day < 10) {
                                    day = day.replace(/^0+/, '');                                     
                                 }
                                 var saveData = month + "/" + day + "/" + year;
                         
                                 groupAllEvent.push({
                                                       id: results.rows.item(i).id,
                                                       event_date: saveData,
                                                       event_show_day:day,
                                                       org_name_to_show:orgNameToShow,
                                                       event_date_To_Show:eventDate,
                                                       event_below_day:belowData,
                                                       calandar_Date:eventDaya,
                                                       calandar_Time:eventTimeString,
                                                       location:results.rows.item(i).location,
                                                       upload_type:results.rows.item(i).upload_type,
                                                       event_desc: results.rows.item(i).event_desc,                                                                                 										  
                                                       event_name: results.rows.item(i).event_name, 
                                                       event_image : results.rows.item(i).event_image,
                                                       event_image_show : results.rows.item(i).event_image_DB,
                                                       event_time: eventTime,                                                                              										  
                                                       org_id: results.rows.item(i).org_id                                                       
                                                   });
                     }
              } 
        }
        
        return {
            init: init,
            show: show,
            eventSelected:eventSelected,
            DeleteEventFromCalendar:DeleteEventFromCalendar,
            AddEventToCalender:AddEventToCalender,
            eventListFirstShow:eventListFirstShow,
            closeLocationMap:closeLocationMap,
            iFrameLocUrl:iFrameLocUrl,
            gobackOrgPage:gobackOrgPage,
            gobackToCalendar:gobackToCalendar,
            showMoreButtonPress:showMoreButtonPress,
            upcommingEventList:upcommingEventList,
            getLiveData:getLiveData,
            imageDownlaodClick:imageDownlaodClick,
            videoDownlaodClick:videoDownlaodClick,
            detailShow:detailShow
        };
    }());
        
    return calendarEventModel;
}());