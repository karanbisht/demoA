
var app = app || {};

app.eventCalender = (function () {
    var calendarEventModel = (function () {
        var eventOrgId;
        var account_Id;
        var groupAllEvent = [];
        var tasks = [];

        var init = function() {
        }
    
        var show = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");
 
            tasks = [];
            multipleEventArray = [];
             
            $("#CalProcess").show();                         
            $("#eventDetailDiv").hide();
            
            account_Id = localStorage.getItem("ACCOUNT_ID");

            eventOrgId = localStorage.getItem("selectedOrgId");
             
            $("#eventCalendarFirstAllList").show();

            var jsonDataLogin = {"org_id":eventOrgId,"account_id":account_Id}

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
                        console.log(data);
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    console.log(e);               
                                                                    $("#CalProcess").hide();

                                                                    if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                    }else {
                                                                        app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                    }               
                                                                }                              
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                //var loginDataView = dataSourceLogin.data();               
                var data = this.data();
                
          						   
                //$.each(loginDataView, function(i, loginData) {
                    //console.log(loginData.status[0].Msg);
                               
                    if (data[0]['status'][0].Msg==='No Event list') {
                        tasks = [];
                        groupAllEvent = [];
                        //$("#eventDetailDiv").hide();
                        //showEventInCalendar();
                    }else if (data[0]['status'][0].Msg==='Success') {
                        groupAllEvent = [];
                        tasks = [];
                             
                        var preDateVal = 0 ;00

                        if (data[0].status[0].eventData.length!==0) {
                            var eventListLength = data[0].status[0].eventData.length;
                              //console.log(loginData.status[0].eventData);    
                            for (var i = 0 ; i < eventListLength ;i++) {
                                var eventDaya = data[0].status[0].eventData[i].event_date;
                                
                                 var eventDateString = data[0].status[0].eventData[i].event_date;
                                 var eventTimeString = data[0].status[0].eventData[i].event_time;
                                 var eventDate = app.formatDate(eventDateString);
                                 var eventTime = app.formatTime(eventTimeString);
                                
                                 var aboveDay = app.getDateDays(eventDateString);   
                                 var belowData = app.getDateMonth(eventDateString);
                                
                                var values = eventDaya.split('-');
                                var year = values[0]; // globle variable
                                var month = values[1];
                                var day = values[2];
                                  
                                //alert(day+"||"+aboveDay+"||"+belowData);
                                
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
                                                       preDateVal:preDateVal,
                                                       event_above_day:aboveDay,
                                                       event_below_day:belowData,
                                                       upload_type:data[0].status[0].eventData[i].upload_type,
                                                       event_desc: data[0].status[0].eventData[i].event_desc,                                                                                 										  
                                                       event_name: data[0].status[0].eventData[i].event_name, 
                                                       event_image : data[0].status[0].eventData[i].event_image,
                                                       event_time: eventTime,                                                                              										  
                                                       mod_date: data[0].status[0].eventData[i].mod_date,                                     
                                                       org_id: data[0].status[0].eventData[i].org_id
                                                   });
                             
                                preDateVal=saveData;
                            }
                            //showEventInCalendar();
                        } 
                    }                
                   
                    eventListFirstShow();
                });
            //}); 
            //tasks[+new Date(2014, 8 - 1, 5)] = "ob-not-done-date";*/
        }
        
        function showEventInCalendar() {
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
        }

        var multipleEventArray = [];
        var date2;

        function selectedDataByUser() {
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
        }
        
        var eventMoreDetailClick = function() {

            app.analyticsService.viewModel.trackFeature("User navigate to Event Detail in Admin");            

            app.mobileApp.navigate('#eventCalendarDetail');
        }
        
        var gobackToCalendar = function() {
            app.mobileApp.navigate('#eventCalendar');
        }
    
        var detailShow = function() {
                        
            $(".km-scroll-container").css("-webkit-transform", "");            
            $("#detailEventData").html("Event On " + multipleEventArray[0].event_date);
            //console.log(multipleEventArray);                
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
        
        var eventListShow = function() {
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
        }
        
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
        }
        
        var eventSelected = function(e){
            //console.log(e);           
            
                               multipleEventArray.push({
                                                id: e.data.id,
                                                add_date: e.data.add_date,
                                                event_date: e.data.event_date,
                                                event_desc: e.data.event_desc,
                                                event_show_day:e.data.event_show_day,
                                                event_name: e.data.event_name,
                                                upload_type:e.data.upload_type,
                                                event_above_day:e.data.event_above_day,
                                                event_below_day:e.data.event_below_day,
                                                event_image:e.data.event_image,
                                                event_time: e.data.event_time,                                                                                  										  
                                                mod_date: e.data.mod_date,                                     
                                                org_id: e.data.org_id
                                            });
            
            app.mobileApp.navigate('#eventCalendarDetail');            
        }
        
        var gobackOrgPage = function(){
            app.mobileApp.navigate('views/userOrgManage.html');            
        }
        
        return {
            init: init,
            show: show,
            eventListShow:eventListShow,
            eventSelected:eventSelected,
            eventListFirstShow:eventListFirstShow,
            gobackOrgPage:gobackOrgPage,
            gobackToCalendar:gobackToCalendar,
            upcommingEventList:upcommingEventList,
            eventMoreDetailClick:eventMoreDetailClick,
            detailShow:detailShow
        };
    }());
        
    return calendarEventModel;
}());