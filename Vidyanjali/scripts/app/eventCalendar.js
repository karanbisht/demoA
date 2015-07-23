
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
        var imageSourceOrg;
        var orgin;

        var init = function() {
        }
    
        var show = function(e) {

            device_type = localStorage.getItem("DEVICE_TYPE"); 

            $("#showMoreEventBtn").hide();
            $(".km-scroll-container").css("-webkit-transform", ""); 
            tasks = [];
            multipleEventArray = [];
            $("#CalProcess").show();                         
            
            account_Id = localStorage.getItem("ACCOUNT_ID");
            eventOrgId = localStorage.getItem("selectedOrgId");            
            imageSourceOrg = localStorage.getItem("selectedOrgLogo");
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
            
            getLiveData();
        }
        
        
        
        var getLiveData = function(){

            var jsonDataLogin = {"org_id":eventOrgId,"account_id":account_Id,"page":page}
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
                        //console.log(data);
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    //console.log(JSON.stringify(e));               
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
                                                                }                              
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var data = this.data();
                                              
                    if (data[0]['status'][0].Msg==='No Event list') {
                        tasks = [];
                        groupAllEvent = [];
                    }else if (data[0]['status'][0].Msg==='Success') {
                        tasks = [];
                             
                        totalListView = data[0]['status'][0].Total;
                        var orgNameToShow = localStorage.getItem("selectedOrgName");

                        if (data[0].status[0].eventData.length!==0) {
                            var eventListLength = data[0].status[0].eventData.length;
                              //console.log(loginData.status[0].eventData);    
                            for (var i = 0 ; i < eventListLength ;i++) {
                                
                                 //alert(data[0].status[0].eventData[i].event_date);                                
                                 var eventDaya = data[0].status[0].eventData[i].event_date;                                
                                 var eventDateString = data[0].status[0].eventData[i].event_date;
                                 var eventTimeString = data[0].status[0].eventData[i].event_time;
                                 var eventDate = app.formatDate(eventDateString);
                                 var eventTime = app.formatTime(eventTimeString);   
                               
                                //var aboveDay = app.getDateDays(eventDateString);   
                                //alert(aboveDay);
                                var belowData = app.getMonthData(eventDateString);
                                //alert(belowData);
                                
                                var values = eventDaya.split('-');
                                var year = values[0]; // globle variable
                                var month = values[1];
                                var day = values[2];
                                  
                                
                                //console.log('------------------date=---------------------');
                                //console.log(year + "||" + month + "||" + day);
                                  
                                //tasks[+new Date(year + "/" + month + "/" + day)] = "ob-done-date";
                                  
                                //console.log(tasks);
                                  
                                //tasks[+new Date(2014, 11, 8)] = "ob-done-date";
                                 
                                if (day < 10) {
                                    day = day.replace(/^0+/, '');                                     
                                }
                                var saveData = month + "/" + day + "/" + year;
                                                               
                                    groupAllEvent.push({
                                                       id: data[0].status[0].eventData[i].id,
                                                       add_date: data[0].status[0].eventData[i].add_date,
                                                       event_date: saveData,
                                                       event_show_day:day,
                                                       org_name_to_show:orgNameToShow,
                                                       //preDateVal:preDateVal,
                                                       //event_above_day:aboveDay,
                                                       event_date_To_Show:eventDate,
                                                       event_below_day:belowData,
                                                       calandar_Date:eventDaya,
                                                       calandar_Time:eventTimeString,
                                                       location:data[0].status[0].eventData[i].location,
                                                       upload_type:data[0].status[0].eventData[i].upload_type,
                                                       event_desc: data[0].status[0].eventData[i].event_desc,                                                                                 										  
                                                       event_name: data[0].status[0].eventData[i].event_name, 
                                                       event_image : data[0].status[0].eventData[i].event_image,
                                                       event_time: eventTime,                                                                              										  
                                                       mod_date: data[0].status[0].eventData[i].mod_date,                                     
                                                       org_id: data[0].status[0].eventData[i].org_id
                                                   });
                             
                            }
                        } 
                    }                
                   
                    eventListFirstShow();
                });

        }
        /*function showEventInCalendar() {
            //console.log(tasks);
            
            multipleEventArray = [];            

            //document.getElementById("calendar").innerHTML = "";
            
            $("#calendar").kendoCalendar({
                                             value:new Date(),
                                             dates:tasks,
                 month:{
                    content:'# if (typeof data.dates[+data.date] === "string") { #' +
                            '<div style="color:rgb(53,152,219);"><u>' +
                            '#= data.value #' +
                            '</u></div>' +
                            '# } else { #' +
                            '#= data.value #' +
                            '# } #'
                },
                                             //footer: false,
                                             change: selectedDataByUser,              
              
                                             navigate:function () {
                                                 $(".ob-done-date", "#calendar").parent().addClass("ob-done-date-style k-state-hover k-state");
                                                 $(".ob-not-done-date", "#calendar").parent().addClass("ob-not-done-date-style k-state-hover k-state");
                                             }
                                         }).data("kendoCalendar");            

            $("#CalProcess").hide();
        }*/

        //var date2;

        /*function selectedDataByUser() {
            console.log("Change :: " + kendo.toString(this.value(), 'd'));
            var date = kendo.toString(this.value(), 'd');                 
            
            var date2 = kendo.toString(this.value(), 'd'); 

            $("#eventDetailDiv").hide();
 
            multipleEventArray = [];
            document.getElementById("eventTitle").innerHTML = "";

            //console.log(groupAllEvent);
            
            var dateExist = 0;
            
            for (var i = 0;i < groupAllEvent.length;i++) {
                var dateFmLive = groupAllEvent[i].event_date;                
                var values = dateFmLive.split('/');
                var monthShow = values[0]; // globle variable
                var dayShow = values[1];
                var yearShow = values[2];
                
                if (monthShow < 10) {
                    monthShow = monthShow.replace(/^0+/, '');                                                         
                }
                
                var dateToCom = monthShow + '/' + dayShow + '/' + yearShow;

                if (date===dateToCom) {
                    $("#eventDate").html(date);
                    document.getElementById("eventTitle").innerHTML += '<ul><li style="color:rgb(147,147,147);">' + groupAllEvent[i].event_name + ' at ' + groupAllEvent[i].event_time + '</li></ul>'                     
                                                                                        
                    multipleEventArray.push({
                                                id: groupAllEvent[i].id,
                                                add_date: groupAllEvent[i].add_date,
                                                event_date: groupAllEvent[i].event_date,
                                                event_desc: groupAllEvent[i].event_desc,                                                                                 										  
                                                event_name: groupAllEvent[i].event_name,
                                                event_show_date:groupAllEvent[i].event_show_date,
                                                event_image:groupAllEvent[i].event_image,
                                                upload_type:groupAllEvent[i].upload_type,
                                                event_time: groupAllEvent[i].event_time,                                                                                  										  
                                                mod_date: groupAllEvent[i].mod_date,                                     
                                                org_id: groupAllEvent[i].org_id
                                            });

                    //$("#eventTitle").html(groupAllEvent[i].event_name);
                    //$("#eventTime").html(groupAllEvent[i].event_time);
                    dateExist = 1;
                    $("#eventDetailDiv").show();
                }   
            }
            
            if (dateExist!==0) {                
                //$("#eventDetailDiv").show();
                eventMoreDetailClick();
                //$("#eventCalendarFirstAllList").hide();
            }else {
                $("#eventCalendarFirstAllList").show();
                //$("#eventDetailDiv").hide();
            }
        }*/
        
        /*var eventMoreDetailClick = function() {

            app.analyticsService.viewModel.trackFeature("User navigate to Event Detail in Admin");            

            app.mobileApp.navigate('#eventCalendarDetail');
        }*/
        
        var gobackToCalendar = function() {
            app.mobileApp.navigate('#eventCalendar');
        }
    
        var detailShow = function() {
                      
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
        }
        
        var upcommingEventList = function() {
            app.mobileApp.navigate('#CustomerEventList');
        }
        
        /*var eventListShow = function() {
            $(".km-scroll-container").css("-webkit-transform", "");
            
            var allEventLength = groupAllEvent.length;
            
            if (allEventLength===0) {
                groupAllEvent.push({
                                       id:0 ,
                                       add_date:'',
                                       event_date:'',
                                       event_desc: 'This Organization has no event.',                                                                                 										  
                                       event_name: 'No Event',                                                                                  										  
                                       event_time: '', 
                                       event_image:'',
                                       mod_date: '',                                     
                                       org_id: ''
                                   });
            }
 
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupAllEvent
                                                                       });           
                
            $("#eventCalendarAllList").kendoMobileListView({
                                                               template: kendo.template($("#calendarEventListTemplate").html()),    		
                                                               dataSource: organisationListDataSource
                                                           });
                
            $('#eventCalendarAllList').data('kendoMobileListView').refresh();
        }*/
        
        var eventListFirstShow = function() {
            $(".km-scroll-container").css("-webkit-transform", "");           
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
                                                org_name_to_show:e.data.org_name_to_show,
                                                upload_type:e.data.upload_type,
                                                calandar_Date:e.data.calandar_Date,
                                                calandar_Time:e.data.calandar_Time,
                                                location:e.data.location,
                                                //event_above_day:e.data.event_above_day,
                                                event_below_day:e.data.event_below_day,
                                                event_image:e.data.event_image,
                                                event_time: e.data.event_time,                                                                                  										  
                                                mod_date: e.data.mod_date,
                                                imageSourceOrg:imageSourceOrg,
                                                org_id: e.data.org_id
                                            });
            //console.log(multipleEventArray);
            
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
            //console.log(data);            
            videoFile = data.someattribute;  
            //console.log(videoFile);            
            notiFi = data.notiid;
            //alert(notiFi);
            attachedFilename = videoFile.replace(/^.*[\\\/]/, '');
            var vidPathData = app.getfbValue();                    
            var fp = vidPathData + "Zaffio/" + 'Zaffio_event_video_' + attachedFilename;             
            window.resolveLocalFileSystemURL(fp, videoPathExist, videoPathNotExist);                        
        }
        
        var videoPathExist = function() {                      
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Zaffio/" + 'Zaffio_event_video_' + attachedFilename;

            /*var vid = $('<video  width="300" height="300" controls><source></source></video>'); //Equivalent: $(document.createElement('img'))
            vid.attr('src', fp);
            vid.appendTo('#video_Div_'+notiFi);*/
            

            if(device_type==="AP"){
                  window.open(fp, "_blank" ,'EnableViewPortScale=yes');
            }else{
                  window.plugins.fileOpener.open(fp);
            }
            
        }
        
        var videoPathNotExist = function() {
            $("#video_Div_Event_"+notiFi).show();
            //$("videoToDownloadEvent_"+notiFi).text('Downloading..');
            var attachedVid = videoFile;                        
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Zaffio/" + 'Zaffio_event_video_' + attachedFilename;
            
            var fileTransfer = new FileTransfer();              
            fileTransfer.download(attachedVid, fp, 
                                  function(entry) {
                                      

                                      if(device_type==="AP"){
                                          window.open(fp, "_blank",'EnableViewPortScale=yes');
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }

                                      $("#video_Div_Event_"+notiFi).hide();
                                      //$("videoToDownloadEvent_"+notiFi).text('View');

                                  },
    
                                  function(error) {
                                      $("#video_Div_Event_"+notiFi).hide();
                                      //$("videoToDownloadEvent_"+notiFi).text('View');
                                      //$("#progressChat").hide();
                                  }
                );                
        }
        

        var attachedImgFilename;
        var imgFile;
        var imgNotiFi;

        var imageDownlaodClick = function(e){
            var data = e.button.data();            
            //console.log(data);            
            imgFile = data.imgpath;  
            //console.log(imgFile);            
            imgNotiFi = data.notiid;
            attachedImgFilename = imgFile.replace(/^.*[\\\/]/, '');
            attachedImgFilename=attachedImgFilename+'.jpg';
            var vidPathData = app.getfbValue();                    
            var fp = vidPathData + "Zaffio/" + 'Zaffio_event_img_' + attachedImgFilename;             
            //console.log(vidPathData);
            //console.log(fp);
            window.resolveLocalFileSystemURL(fp, imgPathExist, imgPathNotExist);                                    
            //$("#img_Div_"+imgNotiFi).show();
            
            //alert("#img_Div_"+imgNotiFi);
            
            //alert('click');
            //console.log(JSON.stringify(window.plugins));
            //window.plugins.fileOpener.open("file:///storage/emulated/0/Aptifi/Aptifi_74.jpg");
        }
        
                
        var imgPathExist = function() {                    
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Zaffio/" + 'Zaffio_event_img_' + attachedImgFilename;   
            //fp=fp+'.jpg';
            //console.log(fp);
            
                                      if(device_type==="AP"){
                                          //alert('Show');
                                          //window.open("www.google.com", "_system");
                                          window.open(fp, '_blank','location=no,enableViewportScale=yes,closebuttoncaption=Close');
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }

        }
        
        var imgPathNotExist = function() {

            $("#img_Div_Event_"+imgNotiFi).show();
            //$("#imgToDownloadEvent_"+imgNotiFi).text('Downloading..');
            
            var attachedImg = imgFile;                        
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Zaffio/" + 'Zaffio_event_img_' + attachedImgFilename;
                        //console.log(fp);


            var fileTransfer = new FileTransfer();              
            fileTransfer.download(attachedImg, fp, 
                                  function(entry) {

                                      //$("#imgToDownloadEvent_"+imgNotiFi).text('View');
                                      $("#img_Div_Event_"+imgNotiFi).hide();


                                      if(device_type==="AP"){
                                          //alert('1');
                                          window.open(fp, "_blank",'location=no,enableViewportScale=yes,closebuttoncaption=Close');
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }
                                      
                                  },
    
                                  function(error) {
                                      //$("#imgToDownloadEvent_"+imgNotiFi).text('View');
                                      $("#img_Div_Event_"+imgNotiFi).hide();
                                  }
                );                
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
        }
        
         var iFrameLocUrl = function(){    
            $("#userIFrameLoader").show();
            var mapUrl = "https://www.google.com/maps/embed/v1/place?key=AIzaSyBNTSIiae6uNUtrZlpxVdGVsDxQ65xZ2O4&q="+mapLocationShow;
            document.getElementById("setIFrame_UserSide").innerHTML='<iframe id="mapIframe" frameborder="0" style="border:0;margin-top:-150px;" src="'+mapUrl+'" onload="this.width=screen.width;this.height=screen.height"></iframe>';             
            setTimeout(function(){
                $("#userIFrameLoader").hide();
            },5000);             
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
        
        return {
            init: init,
            show: show,
            //eventListShow:eventListShow,
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
            //eventMoreDetailClick:eventMoreDetailClick,
            imageDownlaodClick:imageDownlaodClick,
            videoDownlaodClick:videoDownlaodClick,
            detailShow:detailShow
        };
    }());
        
    return calendarEventModel;
}());