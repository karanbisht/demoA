var app = app || {};

app.eventCalender = (function () {

    
    var calendarEventModel = (function () {

        var eventOrgId;
        var groupAllEvent=[];
        var tasks = [];

        var init = function(){
                        
        }
    
         var show = function(e){
               var startDate = new Date(2014,10,15,18,30,0,0,0); // beware: month 0 = january, 11 = december
               var endDate = new Date(2014,10,15,19,30,0,0,0);
               var title = "My nice event";
               var location = "Home";
               var notes = "Some notes about this event.";
               var calendarName = "MyCal";
             
             
             tasks = [];
             multipleEventArray=[];
                         
             $("#eventDetailDiv").hide();
             eventOrgId = e.view.params.orgManageID;             
             document.getElementById("calendar").innerHTML = "";
             
/*             
  window.plugins.calendar.createCalendar(calendarName,success,error);
  // if you want to create a calendar with a specific color, pass in a JS object like this:
  var createCalOptions = window.plugins.calendar.getCreateCalendarOptions();
  createCalOptions.calendarName = "My Cal Name";
  createCalOptions.calendarColor = "#FF0000"; // an optional hex color (with the # char), default is null, so the OS picks a color
  window.plugins.calendar.createCalendar(createCalOptions,success,error);

  // delete a calendar (iOS only for now)
  window.plugins.calendar.deleteCalendar(calendarName,success,error);

  // create an event silently (on Android < 4 an interactive dialog is shown)
  window.plugins.calendar.createEvent(title,location,notes,startDate,endDate,success,error);

  // create an event silently (on Android < 4 an interactive dialog is shown which doesn't use this options) with options:
  var calOptions = window.plugins.calendar.getCalendarOptions(); // grab the defaults
  calOptions.firstReminderMinutes = 120; // default is 60, pass in null for no reminder (alarm)
  calOptions.secondReminderMinutes = 5;

  // Added these options in version 4.2.4:
  calOptions.recurrence = "monthly"; // supported are: daily, weekly, monthly, yearly
  calOptions.recurrenceEndDate = new Date(2015,6,1,0,0,0,0,0); // leave null to add events into infinity and beyond
  calOptions.calendarName = "MyCreatedCalendar"; // iOS only
  window.plugins.calendar.createEventWithOptions(title,location,notes,startDate,endDate,calOptions,success,error);

  // create an event interactively (only supported on Android)
  window.plugins.calendar.createEventInteractively(title,location,notes,startDate,endDate,success,error);

  // create an event in a named calendar (iOS only for now)
  window.plugins.calendar.createEventInNamedCalendar(title,location,notes,startDate,endDate,calendarName,success,error);

  // find events (on iOS this includes a list of attendees (if any))
  window.plugins.calendar.findEvent(title,location,notes,startDate,endDate,success,error);

  // list all events in a date range (only supported on Android for now)
  window.plugins.calendar.listEventsInRange(startDate,endDate,success,error);

  // list all calendar names - returns this JS Object to the success callback: [{"id":"1", "name":"first"}, ..]
  window.plugins.calendar.listCalendars(success,error);

  // find all events in a named calendar (iOS only for now, this includes a list of attendees (if any))
  window.plugins.calendar.findAllEventsInNamedCalendar(calendarName,success,error);

  // change an event (iOS only for now)
  var newTitle = "New title!";
  window.plugins.calendar.modifyEvent(title,location,notes,startDate,endDate,newTitle,location,notes,startDate,endDate,success,error);

  // delete an event (you can pass nulls for irrelevant parameters, note that on Android `notes` is ignored). The dates are mandatory and represent a date range to delete events in.
  // note that on iOS there is a bug where the timespan must not be larger than 4 years, see issue 102 for details.. call this method multiple times if need be
  window.plugins.calendar.deleteEvent(newTitle,location,notes,startDate,endDate,success,error);

  // open the calendar app (added in 4.2.8):
  // - open it at 'today'
  window.plugins.calendar.openCalendar();
  // - open at a specific date, here today + 3 days
  var d = new Date(new Date().getTime() + 3*24*60*60*1000);
  window.plugins.calendar.openCalendar(d, success, error); // callbacks are optional
*/
             
             
             var dataSourceLogin = new kendo.data.DataSource({
                transport: {
                read: {
                    url: "http://54.85.208.215/webservice/event/index/"+eventOrgId,
                    type:"POST",
                    dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
           	}
            },
            schema: {
               data: function(data)
               {	
                   console.log(data);
               	return [data];
               }
            },
           error: function (e) {
               console.log(e);               
               if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  }               
               }                              
           }               
          });  
	            
           dataSourceLogin.fetch(function() {
               var loginDataView = dataSourceLogin.data();               
               var orgDataId = [];
               var userAllGroupId = [];
						   
               $.each(loginDataView, function(i, loginData) {
                      console.log(loginData.status[0].Msg);
                               
                      if(loginData.status[0].Msg==='No Event list'){
                          
                          tasks = [];
                          groupAllEvent=[];
                          $("#eventDetailDiv").hide();
                          showEventInCalendar();

                      }else if(loginData.status[0].Msg==='Success'){

                          groupAllEvent=[];
                          tasks = [];

                          
                          if(loginData.status[0].eventData.length!==0){
                                                            
                              var eventListLength = loginData.status[0].eventData.length;
                              
                              for(var i=0 ; i<eventListLength ;i++){
                                 

                                  var eventDaya = loginData.status[0].eventData[i].event_date;
                                  console.log("-------karan---------------");
                                  console.log(eventDaya);
                                  
                                  var values = eventDaya.split('-');
                              	var year = values[0]; // globle variable
                              	var month = values[1];
                              	var day = values[2];
                                  
                                  console.log('------------------date=---------------------');
                                  console.log(year+"||"+month+"||"+day);
                                  
                                   tasks[+new Date(year+"/"+month+"/"+day)] = "ob-done-date";
                                  
                                    console.log(tasks);
                                  
                                     //tasks[+new Date(2014, 11, 8)] = "ob-done-date";
                                 
                                  if(day<10){
                                     day = day.replace(/^0+/, '');                                     
                                  }
                                  var saveData = month+"/"+day+"/"+year;
                                  
                                                                    
                                      groupAllEvent.push({
                                          id: loginData.status[0].eventData[i].id,
                                          add_date: loginData.status[0].eventData[i].add_date,
									      event_date: saveData,
										  event_desc: loginData.status[0].eventData[i].event_desc,                                                                                 										  
                                          event_name: loginData.status[0].eventData[i].event_name,                                                                                  										  
                                          event_time: loginData.status[0].eventData[i].event_time,                                                                                  										  
                                          mod_date: loginData.status[0].eventData[i].mod_date,                                     
                                          org_id: loginData.status[0].eventData[i].org_id
   	                               });

                                  

                              }
 
                              showEventInCalendar();
                              
                          } 
                    }                
                });
  		 }); 
                                                 
                //tasks[+new Date(2014, 8 - 1, 5)] = "ob-not-done-date";*/

         }
        
        
        var success = function(message) { alert("Success: " + JSON.stringify(message)); };
        
        var error = function(message) { alert("Error: " + message); };

        
        
        
        function showEventInCalendar(){
                         
             console.log(tasks);
            
             multipleEventArray=[];            
              	
             $("#calendar").kendoCalendar({
             //value:new Date(),
             dates:tasks,
             month:{
             content:
                //'#console.log(data.date);#' +
                //'#console.log(data.dates);#' +
                //'#console.log(typeof data.dates[+data.date]);#' +                 
                '# if (typeof data.dates[+data.date] === "string" ) { #' +
                '<div style="color:rgb(53,152,219);">' +
                '#= data.value #' +
                '</div>'+
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
             
         }

        var multipleEventArray=[];
        var date2;
        function selectedDataByUser(){

            console.log("Change :: " + kendo.toString(this.value(), 'd'));
            var date = kendo.toString(this.value(), 'd'); 
                
            
            var date2 = kendo.toString(this.value(), 'd'); 

            $("#eventDetailDiv").hide();
 
            multipleEventArray=[];
            document.getElementById("eventTitle").innerHTML = "";


            console.log(groupAllEvent);
            
            for(var i=0;i<groupAllEvent.length;i++){

                if(date===groupAllEvent[i].event_date){

                    $("#eventDate").html(date);
                    document.getElementById("eventTitle").innerHTML += '<ul><li style="color:rgb(53,152,219);">' + groupAllEvent[i].event_name + ' at ' +groupAllEvent[i].event_time+'</li></ul>' 
                    
                                                                                        
                                      multipleEventArray.push({
                                          id: groupAllEvent[i].id,
                                          add_date: groupAllEvent[i].add_date,
									      event_date: groupAllEvent[i].event_date,
										  event_desc: groupAllEvent[i].event_desc,                                                                                 										  
                                          event_name: groupAllEvent[i].event_name,                                                                                  										  
                                          event_time: groupAllEvent[i].event_time,                                                                                  										  
                                          mod_date: groupAllEvent[i].mod_date,                                     
                                          org_id: groupAllEvent[i].org_id
   	                               });


                    //$("#eventTitle").html(groupAllEvent[i].event_name);
                    //$("#eventTime").html(groupAllEvent[i].event_time);
                    $("#eventDetailDiv").show();

                }   
            }
        }
        
        
        var eventMoreDetailClick = function(){
             app.mobileApp.navigate('#eventCalendarDetail');
        }
    
        var detailShow = function(){

            $(".km-scroll-container").css("-webkit-transform", "");

            
            $("#detailEventData").html("Event On "+multipleEventArray[0].event_date);
             console.log(multipleEventArray);                
             var organisationListDataSource = new kendo.data.DataSource({
                  data: multipleEventArray
             });           

                
            $("#eventCalendarList").kendoMobileListView({
  		    template: kendo.template($("#calendarTemplate").html()),    		
     		 dataSource: organisationListDataSource
            });
                
            $('#eventCalendarList').data('kendoMobileListView').refresh();
            
        }
        
        
    	 return {
        	   init: init,
           	show: show,
               eventMoreDetailClick:eventMoreDetailClick,
               detailShow:detailShow
          };
           
    }());
        
    return calendarEventModel;
    
}());