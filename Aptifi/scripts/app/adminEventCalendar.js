var app = app || {};

app.adminEventCalender = (function () {

    
    var adminCalendarEventModel = (function () {

        var organisationID;
        var account_Id;
        var groupAllEvent=[];
        var tasks = [];

        var init = function(){
    
        }
    
         var show = function(){
                                      
             $("#adminCalProcess").show();
             //$("#eventDetailDiv").hide();
             
                         
             $("#adddatePicker").kendoDatePicker();
             $("#adddateTimePicker").kendoTimePicker();


             
             document.getElementById("eventDetailDiv").style.display = "none";

             $(".km-scroll-container").css("-webkit-transform", "");

             tasks = [];
             multipleEventArray=[];

             //organisationId = e.view.params.organisationId;
             //account_Id =e.view.params.account_Id;

             organisationID = localStorage.getItem("orgSelectAdmin");
             //alert(organisationID);
             account_Id = localStorage.getItem("ACCOUNT_ID");

             
             document.getElementById("admincalendar").innerHTML = "";
             

             var jsonDataLogin = {"org_id":organisationID}

             var dataSourceLogin = new kendo.data.DataSource({
                transport: {
                read: {
                    url: app.serverUrl()+"event/index",
                    type:"POST",
                    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                    data: jsonDataLogin
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

               $("#adminCalProcess").hide();

                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
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
                          //$("#eventDetailDiv").hide();
                          

                          document.getElementById("eventDetailDiv").style.display = "none";

                          showEventInCalendar();

                      }else if(loginData.status[0].Msg==='Success'){
                          groupAllEvent=[];
                          tasks = [];

                          
                          if(loginData.status[0].eventData.length!==0){
                                                            
                              var eventListLength = loginData.status[0].eventData.length;
                              
                              console.log(eventListLength);
                              
                              for(var i=0 ; i<eventListLength ;i++){                                 

                                  var eventDaya = loginData.status[0].eventData[i].event_date
                                  var values = eventDaya.split('-');
                              	var year = values[0]; // globle variable
                              	var month = values[1];
                              	var day = values[2];
                                  
                                  
                                  tasks[+new Date(year+"/"+month+"/"+day)] = "ob-done-date";
                                  
                                  //tasks[+new Date(2014, 11, 8)] = "ob-done-date";
                                 
                                  if(day<10){
                                     day = day.replace(/^0+/, '');                                     
                                  }
                                  var saveData = month+"/"+day+"/"+year;
                                  
                                                          
                                              $("#eventDetailDiv").hide();            

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
        
        
        function showEventInCalendar(){                         
             console.log(tasks);            
             multipleEventArray=[];

            //class="#= data.dates[+data.date] #"
            
            document.getElementById("admincalendar").innerHTML = "";

            $("#admincalendar").kendoCalendar({
             //value:new Date(),
             dates:tasks,
             month:{
             content:'# if (typeof data.dates[+data.date] === "string") { #' +
                '<div style="color:rgb(53,152,219);">' +
                '#= data.value #' +
                '</div>' +
                '# } else { #' +
                '#= data.value #' +
                '# } #'
            },
              change: selectedDataByUser,              
              
              navigate:function () {
                $(".ob-done-date", "#admincalendar").parent().addClass("ob-done-date-style k-state-hover");
                $(".ob-not-done-date", "#admincalendar").parent().addClass("ob-not-done-date-style k-state-hover");
              }
            }).data("kendoCalendar");                         

            $("#adminCalProcess").hide();
        }

        var multipleEventArray=[];
        var date2;

        function selectedDataByUser(){

            console.log("Change :: " + kendo.toString(this.value(), 'd'));
            var date = kendo.toString(this.value(), 'd'); 
            
            date2 = kendo.toString(this.value(), 'd'); 

 
            multipleEventArray=[];
            document.getElementById("eventTitle").innerHTML = "";


            console.log(groupAllEvent);
             
            var checkGotevent=0;
            
            for(var i=0;i<groupAllEvent.length;i++){

                //date=date.toString();
                //groupAllEvent[i].event_date=groupAllEvent[i].event_date.toString();
                
                //console.log(date);
                //console.log(groupAllEvent[i].event_date);
                
                var dateFmLive = groupAllEvent[i].event_date;
                
                 var values = dateFmLive.split('/');
                              	var monthShow  = values[0]; // globle variable
                              	var dayShow = values[1];
                              	var yearShow = values[2];
                
                if(monthShow<10){
                    monthShow = monthShow.replace(/^0+/, '');                                                         
                }
                
                var dateToCom= monthShow+'/'+dayShow+'/'+yearShow;

                //console.log(dateToCom);
                
                //date=date.trim();//replace(/^"(.*)"$/, '$1');
                //dateToCom=dateToCom.trim();//.replace(/^"(.*)"$/, '$1');
                
                //date=date.replace(/"/g, "");
                //dateToCom = dateToCom.replace(/"/g, "");

                //console.log(JSON.stringify(date));
                //console.log(JSON.stringify(dateToCom));

                //alert(date+"||"+dateToCom);
                

                var currentDate = app.getPresentDate();

                console.log(date+'------------------date------------------'+dateToCom);
                
                if(date===dateToCom){                    

                    document.getElementById("eventDetailDiv").style.display = "block";
                    console.log('inside');
                    
                    //$("#eventDate").html(date);                    
                    document.getElementById("eventTitle").innerHTML += '<ul><li style="color:rgb(53,152,219);">' + groupAllEvent[i].event_name + ' at ' +groupAllEvent[i].event_time+'</li></ul>' 
                    
                    console.log(groupAllEvent[i]);
                    
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
                    
                    checkGotevent=1;
                    //break;
                }   
            }
            
            
            if(new Date(date) >= new Date(currentDate) && (checkGotevent===0)){
                app.mobileApp.navigate('#adminAddEventCalendar');
            }else if(new Date(date) < new Date(currentDate) && (checkGotevent===0)){                   
                if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('You Cannot Add Event on Back Date');  
              }else{
                    app.showAlert('You Cannot Add Event on Back Date',"Event");  
                  }                                

                document.getElementById("eventDetailDiv").style.display = "none";
  
            }else{

                document.getElementById("eventDetailDiv").style.display = "block";

                //$("#eventDetailDiv").show();
            }
        }
        
        
        var eventMoreDetailClick = function(){
             app.mobileApp.navigate('#adminEventCalendarDetail');
        }
    
        
        var detailShow = function(){
            var dateShow = multipleEventArray[0].event_date;

            $(".km-scroll-container").css("-webkit-transform", "");
            
            $("#detailEventData").html("Event On "+dateShow);
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
        
        
        var addEventshow = function(){
         
            
            //$(".km-scroll-container").css("-webkit-transform", "");
         
                        
            $(".km-native-scroller").scrollTop(0);

            $("#addEventName").val('');
            $("#addEventDesc").val('');
            console.log(date2);
         
            
             /*$("#admincalendar").kendoCalendar({
             //value:new Date(),
             dates:tasks,
             month:{
             content:'# if (typeof data.dates[+data.date] === "string") { #' +
                '<div style="color:rgb(53,152,219);">' +
                '#= data.value #' +
                '</div>' +
                '# } else { #' +
                '#= data.value #' +
                '# } #'
            },
              change: selectedDataByUser,              
              
              navigate:function () {
                $(".ob-done-date", "#admincalendar").parent().addClass("ob-done-date-style k-state-hover");
                $(".ob-not-done-date", "#admincalendar").parent().addClass("ob-not-done-date-style k-state-hover");
              }
            }).data("kendoCalendar");*/                         

            
            var currentDate = app.getPresentDate();
            
            disabledDaysBefore = [
              +new Date(currentDate)
            ];
            
            
            $("#adddatePicker").kendoDatePicker({
            value: date2,
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
                open: function(e){
                  $(".disabledDay").parent().removeClass("k-link")
                  $(".disabledDay").parent().removeAttr("href")
              },

                 
                change: function() {
                        var value = this.value();
                        console.log(value); 
                    
               
                    /*if(new Date(value) < new Date(currentDate)){                   
                
                        if(!app.checkSimulator()){
                             window.plugins.toast.showLongBottom('You Cannot Add Event on Back Date');  
                      }else{
                            app.showAlert('You Cannot Add Event on Back Date',"Event");  
                      }                                
                    
                    }*/    
                }
            }).data("kendoDatePicker");
            
                         
            $("#adddateTimePicker").kendoTimePicker({
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
                }                
            });
            

                //var addEventDatePicker = $("#adddatePicker").data("kendoDatePicker");            
            
                //$(".k-datepicker input").prop("readonly", true);
            
            

            
                       /* $('#adddatePicker').attr("readonly","readonly");

                        $('#adddateTimePicker').attr("readonly","readonly");

            */
                

            
            
            
            setTimeout(function(){
                $("#adddatePicker").bind("focus", function() {
                    $("#adddatePicker").blur();                    
                });
            },100); 

            
            setTimeout(function(){            
                $("#adddateTimePicker").bind("focus", function() {
                    $("#adddateTimePicker").blur();
                }); 
            },100); 
            
            
            
            
                 /*var addEventTimePicker = $("#adddateTimePicker").data("kendoTimePicker"); 
				addEventTimePicker.input.focus(function() {
	                //$( "#orgforNotification" ).blur();
                    addEventTimePicker.input.blur();
				});  */ 
            
            
                        
        }
        

        
        var eventNameEdit;
        var eventDescEdit;
        var eventDateEdit;
        var eventTimeEdit;
        var eventPid;
        
        var editEvent = function(e){
             console.log(e.data.uid);
              console.log(e.data);
            
             eventNameEdit = e.data.event_name;
             eventDescEdit = e.data.event_desc;
             eventDateEdit = e.data.event_date;
             eventTimeEdit = e.data.event_time;
             eventPid = e.data.id;
             app.mobileApp.navigate('#adminEditEventCalendar');
        }
        
        
        var deleteEvent = function(e){
             console.log(e.data.uid);
             console.log(e.data);

            var eventPid = e.data.id;
            
            console.log('orgID='+organisationID+"pid="+eventPid)

            var jsonDataSaveGroup = {"orgID":organisationID,"pid":eventPid}
            
            var dataSourceaddGroup = new kendo.data.DataSource({
               transport: {
               read: {
                   url: app.serverUrl()+"event/delete/",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataSaveGroup
           	}
           },
           schema: {
               data: function(data)
               {	console.log(data);
               	return [data];
               }
           },
           error: function (e) {
               //apps.hideLoading();
               console.log(JSON.stringify(e));
               navigator.notification.alert("Please check your internet connection.",
               function () { }, "Notification", 'OK');
           }               
          
         });  
	            
           dataSourceaddGroup.fetch(function() {
              var loginDataView = dataSourceaddGroup.data();
				  $.each(loginDataView, function(i, addGroupData) {
                      console.log(addGroupData.status[0].Msg);           
                               if(addGroupData.status[0].Msg==='Deleted Successfully'){         
				        	        app.mobileApp.navigate("#adminEventCalendar");
        							app.showAlert("Event Deleted Successfully","Notification");
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });

        }
        
        
        var editEventshow = function(){

            $(".km-scroll-container").css("-webkit-transform", "");

            console.log(eventNameEdit);
            
            $("#editEventName").val(eventNameEdit);
            
            $("#editEventDesc").html(eventDescEdit);

            console.log(eventDateEdit);
                        
            var currentDate = app.getPresentDate();
            
            disabledDaysBefore = [
              +new Date(currentDate)
            ];
            

            $("#editdatePicker").kendoDatePicker({
            value: eventDateEdit,
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
                open: function(e){
                  $(".disabledDay").parent().removeClass("k-link")
                  $(".disabledDay").parent().removeAttr("href")
              },            
                change: function() {
                        var value = this.value();
                        console.log(value); //value is the selected date in the timepicker
                }
            });
            
                         
            $("#editdateTimePicker").kendoTimePicker({
                value: eventTimeEdit,
                interval: 15,
                format: "h:mm tt",
                timeFormat: "HH:mm",                
                change: function() {
                        var value = this.value();
                        console.log(value); //value is the selected date in the timepicker
                }                
            });            

            
            
               /*var editEventDatePicker = $("#editdatePicker").data("kendoDatePicker"); 
    				editEventDatePicker.input.focus(function() {
	                //$( "#orgforNotification" ).blur();
                    editEventDatePicker.input.blur();
				});
            
            
                 var editEventTimePicker = $("#editdateTimePicker").data("kendoTimePicker"); 
			    	editEventTimePicker.input.focus(function() {
	                //$( "#orgforNotification" ).blur();
                    editEventTimePicker.input.blur();
				 }); */
            
            setTimeout(function(){            
                $("#editdatePicker").bind("focus", function() {
                    $("#editdatePicker").blur();
                });
            },100);    

            
            setTimeout(function(){            
                $("#editdateTimePicker").bind("focus", function() {
                    $("#editdateTimePicker").blur();
                });
            },100);    
    
            
            
                        /*$('#editdatePicker').attr("readonly","readonly");

                        $('#editdateTimePicker').attr("readonly","readonly");*/

            

            
        }
        

        
        
        var addNewEventFunction = function(){
           
            
            var event_name = $("#addEventName").val();     
            var event_description = $("#addEventDesc").val();

            var event_Date = $("#adddatePicker").val();
            var event_Time = $("#adddateTimePicker").val();
            
            
         if (event_name === "Enter New Event Name" || event_name === "") {
				app.showAlert("Please enter Event Name.","Validation Error");
         }else if (event_description === "Write Event description here (Optional) ?" || event_description === "") {
				app.showAlert("Please enter Event Description.","Validation Error");
         }else {    


                                  
            var values = event_Date.split('/');            
            var month = values[0]; // globle variable            
            var day = values[1];            
            var year  = values[2];
             
            if(day<10){
                day="0"+day;
            }
            
            
            var valueTime = event_Time.split(':');            
            var Hour = valueTime[0]; // globle variable            
            var Min = valueTime[1];        
            
            
            var valueTimeMin = Min.split(' '); 
            var minute = valueTimeMin[0];
            var AmPm  = valueTimeMin[1];
            if(AmPm==='PM'){
                if(Hour!=='12' && Hour!==12){
                    Hour=parseInt(Hour)+12;
                }
            }
            
            
            console.log(Hour+"||"+minute+"||"+AmPm);
            
            var eventTimeSend = Hour+":"+minute+":00";
            //eventTimeSend=eventTimeSend.toString();
             
            event_Date= year+"-"+month+"-"+day;
            //event_Date=event_Date.toString();
            var actionval = "Add";

            
            console.log(event_name);
            console.log(event_description);
            console.log(event_Date);
            console.log(event_Time);

                
            
           console.log("org_id="+organisationID +"txtEventName="+event_name+"txtEventDesc="+event_description+"txtEventDate="+event_Date+"eventStartTime="+eventTimeSend+"action="+actionval);
                        

             var jsonDataSaveGroup ={"org_id":organisationID,"txtEventName":event_name,"txtEventDesc":event_description,"txtEventDate":event_Date,"eventStartTime":eventTimeSend,"action":actionval}
            
             var dataSourceaddGroup = new kendo.data.DataSource({
               transport: {
               read: {
                   url: app.serverUrl()+"event/Add",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataSaveGroup
           	}
           },
           schema: {
               data: function(data)
               {	console.log(data);
               	return [data];
               }
           },
           error: function (e) {
               //apps.hideLoading();
               console.log(e);
               console.log(JSON.stringify(e));
               navigator.notification.alert("Please check your internet connection.",
               function () { }, "Notification", 'OK');
           }               
          
         });  
	            
           dataSourceaddGroup.fetch(function() {
              var loginDataView = dataSourceaddGroup.data();
				  $.each(loginDataView, function(i, addGroupData) {
                      console.log(addGroupData.status[0].Msg);           
                               if(addGroupData.status[0].Msg==='Event added successfully'){         
				        	        app.mobileApp.navigate("#adminEventCalendar");
        							app.showAlert("Event Added Successfully","Notification");
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });
          
          }   

        }
        

        var saveEditEventData = function(){
         
            var event_name = $("#editEventName").val();     
            var event_description = $("#editEventDesc").val();

            var event_Date = $("#editdatePicker").val();
            var event_Time = $("#editdateTimePicker").val();
            
            
         if (event_name === "Enter New Event Name" || event_name === "") {
				app.showAlert("Please enter Event Name.","Validation Error");
         }else if (event_description === "Write Event description here (Optional) ?" || event_description === "") {
				app.showAlert("Please enter Event Description.","Validation Error");
         }else {    

            
                                  
            var values = event_Date.split('/');            
            var month = values[0]; // globle variable            
            var day = values[1];            
            var year  = values[2];
             
            if(day<10){
                day="0"+day;
            }
            
            event_Date= year+"-"+month+"-"+day;
            
            var actionval = "Edit";
            
            console.log(event_name);
            console.log(event_description);
            console.log(event_Date);
            console.log(event_Time);

                
            
           console.log("org_id="+organisationID +"txtEventName="+event_name+"txtEventDesc="+event_description+"txtEventDate="+event_Date+"eventStartTime="+event_Time+"pid="+eventPid+"action="+actionval);
                        
             var jsonDataSaveGroup = {"org_id":organisationID ,"txtEventName":event_name,"txtEventDesc":event_description,"txtEventDate":event_Date,"eventStartTime":event_Time,"pid":eventPid,"action":actionval}
            
             var dataSourceaddGroup = new kendo.data.DataSource({
               transport: {
               read: {
                   url: app.serverUrl()+"event/edit",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataSaveGroup
           	}
           },
           schema: {
               data: function(data)
               {	console.log(data);
               	return [data];
               }
           },
           error: function (e) {
               //apps.hideLoading();
               console.log(e);
               navigator.notification.alert("Please check your internet connection.",
               function () { }, "Notification", 'OK');
           }               
          
         });  
	            
           dataSourceaddGroup.fetch(function() {
              var loginDataView = dataSourceaddGroup.data();
				  $.each(loginDataView, function(i, addGroupData) {
                      console.log(addGroupData.status[0].Msg);           
                               if(addGroupData.status[0].Msg==='Event updated successfully'){         
				        	        app.mobileApp.navigate("#adminEventCalendar");
                               }else{
                                    app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });
            
          }   
        }
        
        var goToManageOrgPage = function(){

            app.mobileApp.navigate('views/groupDetailView.html');
   
        }
        
        var goToCalendarPage = function(){
                        
            app.mobileApp.navigate('#adminEventCalendar');

        }
        
        var goToCalendarPageDetail = function(){

            app.mobileApp.navigate('#adminEventCalendarDetail');

        }
        
        var addNewEvent = function(){
                            
            app.mobileApp.navigate('#adminAddEventCalendar');

        }
        
        var upcommingEventList = function(){
            app.mobileApp.navigate('#adminEventList');
        }
        
        var eventListShow = function(){
            //var dateShow = multipleEventArray[0].event_date;

            $(".km-scroll-container").css("-webkit-transform", "");
            
            var allEventLength = groupAllEvent.length;
            
            if(allEventLength===0){
                groupAllEvent.push({
                                          id:0 ,
                                          add_date:'',
									      event_date:'',
										  event_desc: 'This Organization has no event.',                                                                                 										  
                                          event_name: 'No Event',                                                                                  										  
                                          event_time: '',                                                                                  										  
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
        
    	 return {
        	   init: init,
           	show: show,
               editEvent:editEvent,
               eventListShow:eventListShow,
               addNewEvent:addNewEvent,
               deleteEvent:deleteEvent,
               editEventshow:editEventshow,
               goToCalendarPage:goToCalendarPage,
               goToManageOrgPage:goToManageOrgPage,
               eventMoreDetailClick:eventMoreDetailClick,
               addNewEventFunction:addNewEventFunction,
               addEventshow:addEventshow,
               goToCalendarPageDetail:goToCalendarPageDetail,
               saveEditEventData:saveEditEventData,
               upcommingEventList:upcommingEventList,
               detailShow:detailShow
          };
           
    }());
        
    return adminCalendarEventModel;
    
}());