var app = app || {};

app.adminEventCalender = (function () {
    var adminCalendarEventModel = (function () {
        var organisationID;
        var account_Id;
        var eventDataToSend;
        var groupAllEvent = [];
        var tasks = [];
        
        var init = function() {
        }
    
        var show = function() {
            //$('#addEventDesc').removeClass('txtstuff');
            /*hiddenDiv = $(document.createElement('div')),
            hiddenDiv.removeClass('hiddendiv common');
            $('body').remove(hiddenDiv);*/
            $("#adminCalProcess").show();
            //$("#eventDetailDiv").hide();
                                                  
            $("#removeEventAttachment").hide(); 
            $("#attachedImgEvent").hide();
            eventDataToSend = '';
            
            
            /*$("#addEventDesc").kendoEditor({
            tools: [

            ]
            });*/
             
            /*$("#editor").kendoEditor();*/
             
            document.getElementById("eventDetailDiv").style.display = "none";

            $(".km-scroll-container").css("-webkit-transform", "");

            tasks = [];
            multipleEventArray = [];

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
                                                                            url: app.serverUrl() + "event/index",
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

                                                                    $("#adminCalProcess").hide();

                                                                    if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                    }else {
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
                               
                    if (loginData.status[0].Msg==='No Event list') {
                        tasks = [];
                        groupAllEvent = [];
                        //$("#eventDetailDiv").hide();

                        document.getElementById("eventDetailDiv").style.display = "none";

                        showEventInCalendar();
                    }else if (loginData.status[0].Msg==='Success') {
                        groupAllEvent = [];
                        tasks = [];
                          
                        if (loginData.status[0].eventData.length!==0) {
                            var eventListLength = loginData.status[0].eventData.length;
                              
                            console.log(eventListLength);
                              
                            for (var i = 0 ; i < eventListLength ;i++) {         
                                 var eventDateString = loginData.status[0].eventData[i].event_date;
                                 var eventTimeString = loginData.status[0].eventData[i].event_time;
                                 var eventDate = app.formatDate(eventDateString);
                                 var eventTime = app.formatTime(eventTimeString);
                                
                                var eventDaya = loginData.status[0].eventData[i].event_date
                                var values = eventDaya.split('-');
                                var year = values[0]; // globle variable
                                var month = values[1];
                                var day = values[2];
                                  
                                tasks[+new Date(year + "/" + month + "/" + day)] = "ob-done-date";
                                  
                                //tasks[+new Date(2014, 11, 8)] = "ob-done-date";
                                 
                                if (day < 10) {
                                    day = day.replace(/^0+/, '');                                     
                                }
                                var saveData = month + "/" + day + "/" + year;
                                                        
                                $("#eventDetailDiv").hide();            

                                groupAllEvent.push({
                                                       id: loginData.status[0].eventData[i].id,
                                                       add_date: loginData.status[0].eventData[i].add_date,
                                                       event_date: saveData,
                                                       event_show_date:eventDate,
                                                       event_desc: loginData.status[0].eventData[i].event_desc,
                                                       event_image : loginData.status[0].eventData[i].event_image,
                                                       event_name: loginData.status[0].eventData[i].event_name,                                                                                  										  
                                                       event_time: eventTime,
                                                       page:2,
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
        
        function showEventInCalendar() {                         
            console.log(tasks);            
            multipleEventArray = [];

            //class="#= data.dates[+data.date] #"
            
            document.getElementById("admincalendar").innerHTML = "";

            $("#admincalendar").kendoCalendar({
                                                  //value:new Date(),
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
                                                  change: selectedDataByUser,              
              
                                                  navigate:function () {
                                                      $(".ob-done-date", "#admincalendar").parent().addClass("ob-done-date-style k-state-hover");
                                                      $(".ob-not-done-date", "#admincalendar").parent().addClass("ob-not-done-date-style k-state-hover");
                                                  }
                                              }).data("kendoCalendar");                         

            $("#adminCalProcess").hide();
        }

        var multipleEventArray = [];
        var date2;

        function selectedDataByUser() {
            console.log("Change :: " + kendo.toString(this.value(), 'd'));
            var date = kendo.toString(this.value(), 'd'); 
            
            date2 = kendo.toString(this.value(), 'd'); 
 
            $('#addEventDesc').css('height', '80px');

            var txt = $('#addEventDesc'),
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
 
            multipleEventArray = [];
            document.getElementById("eventTitle").innerHTML = "";

            $("#eventDate").html(date2);

            console.log(groupAllEvent);
             
            var checkGotevent = 0;
            
            for (var i = 0;i < groupAllEvent.length;i++) {
                //date=date.toString();
                //groupAllEvent[i].event_date=groupAllEvent[i].event_date.toString();
                //console.log(date);
                //console.log(groupAllEvent[i].event_date);
                var dateFmLive = groupAllEvent[i].event_date;
                
                var values = dateFmLive.split('/');
                var monthShow = values[0]; // globle variable
                var dayShow = values[1];
                var yearShow = values[2];
                
                if (monthShow < 10) {
                    monthShow = monthShow.replace(/^0+/, '');                                                         
                }
                
                var dateToCom = monthShow + '/' + dayShow + '/' + yearShow;

                //console.log(dateToCom);
                
                //date=date.trim();//replace(/^"(.*)"$/, '$1');
                //dateToCom=dateToCom.trim();//.replace(/^"(.*)"$/, '$1');
                
                //date=date.replace(/"/g, "");
                //dateToCom = dateToCom.replace(/"/g, "");

                //console.log(JSON.stringify(date));
                //console.log(JSON.stringify(dateToCom));

                //alert(date+"||"+dateToCom);

                var currentDate = app.getPresentDate();

                console.log(date + '------------------date------------------' + dateToCom);
                
                if (date===dateToCom) {                    
                    document.getElementById("eventDetailDiv").style.display = "block";
                    console.log('inside');
                    
                    //$("#eventDate").html(date);                    
                    document.getElementById("eventTitle").innerHTML += '<ul><li style="color:rgb(147,147,147);">' + groupAllEvent[i].event_name + ' at ' + groupAllEvent[i].event_time + '</li></ul>' 
                    
                    console.log(groupAllEvent[i]);
                    
                    multipleEventArray.push({
                                                id: groupAllEvent[i].id,
                                                add_date: groupAllEvent[i].add_date,
                                                event_date: groupAllEvent[i].event_date,
                                                event_desc: groupAllEvent[i].event_desc,
                                                event_show_date:groupAllEvent[i].event_show_date,
                                                event_image : groupAllEvent[i].event_image,
                                                event_name: groupAllEvent[i].event_name,                                                                                  										  
                                                event_time: groupAllEvent[i].event_time,                                                                                  										  
                                                mod_date: groupAllEvent[i].mod_date,
                                                page:2,
                                                org_id: groupAllEvent[i].org_id
                                            });

                    //$("#eventTitle").html(groupAllEvent[i].event_name);
                    //$("#eventTime").html(groupAllEvent[i].event_time);
                    
                    checkGotevent = 1;
                    //break;
                }   
            }
            
            if (new Date(date) >= new Date(currentDate) && (checkGotevent===0)) {
                app.mobileApp.navigate('#adminAddEventCalendar');

                app.analyticsService.viewModel.trackFeature("User navigate to Add New Calendar in Admin");            

            }else if (new Date(date) < new Date(currentDate) && (checkGotevent===0)) {                   
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('You Cannot Add Event on Back Date');  
                }else {
                    app.showAlert('You Cannot Add Event on Back Date', "Event");  
                }                                

                document.getElementById("eventDetailDiv").style.display = "none";
            }else {
                eventMoreDetailClick();
                //document.getElementById("eventDetailDiv").style.display = "block";
                //$("#eventDetailDiv").show();
            }
        }
        
        var eventMoreDetailClick = function() {

            app.analyticsService.viewModel.trackFeature("User navigate to Event Detail in Admin");            

            app.mobileApp.navigate('#adminEventCalendarDetail');           
        }
        
        var detailShow = function() {
            var dateShow = multipleEventArray[0].event_date;

            $(".km-scroll-container").css("-webkit-transform", "");
            
            $("#detailEventData").html("Event On " + dateShow);
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
        
        var addEventshow = function() {
            //$(".km-scroll-container").css("-webkit-transform", "");
            $(".km-native-scroller").scrollTop(0);

            $("#addEventName").val('');
            $("#addEventDesc").val('');
            console.log(date2);
            
            $("#adddatePickerEvent").removeAttr('disabled');
            $("#adddateTimePickerEvent").removeAttr('disabled');

            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.src = '';
            
            $("#adddatePickerEvent").parent().css('width',"160px");
            $("#adddateTimePickerEvent").parent().css('width',"160px");
            $("#adddatePickerEvent").removeClass( "k-input" );
            $("#adddateTimePickerEvent").removeClass( "k-input" );            

            
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
            
            $("#adddatePickerEvent").kendoDatePicker({
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
                                                    open: function(e) {
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
                         
            $("#adddateTimePickerEvent").kendoTimePicker({
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

            //var addEventDatePicker = $("#adddatePickerEvent").data("kendoDatePicker");            
            
            //$(".k-datepicker input").prop("readonly", true);
            
            /* $('#adddatePickerEvent').attr("readonly","readonly");

            $('#adddateTimePickerEvent').attr("readonly","readonly");

            */
            

            
              $('#adddatePickerEvent').attr('disabled','disabled');
              $('#adddateTimePickerEvent').attr('disabled','disabled');
            

            
            /*var addEventTimePicker = $("#adddateTimePickerEvent").data("kendoTimePicker"); 
            addEventTimePicker.input.focus(function() {
            //$( "#orgforNotification" ).blur();
            addEventTimePicker.input.blur();
            });  */ 
        }
        
        var eventNameEdit;
        var eventDescEdit;
        var eventDateEdit;
        var eventTimeEdit;
        var eventImageEdit;
        var eventPid;
        var pageToGo;
        
        var editEvent = function(e) {
            console.log(e.data.uid);
            console.log(e.data);
            eventNameEdit = e.data.event_name;
            eventDescEdit = e.data.event_desc;
            eventDateEdit = e.data.event_date;
            eventTimeEdit = e.data.event_time;
            eventImageEdit = e.data.event_image;
            eventPid = e.data.id;
            pageToGo = e.data.page;
            

            app.analyticsService.viewModel.trackFeature("User navigate to Edit Event Detail in Admin");            

            app.mobileApp.navigate('#adminEditEventCalendar');
        }
        
        var deleteEvent = function(e) {
            console.log(e.data.uid);
            console.log(e.data);

            var eventPid = e.data.id;
            
            console.log('orgID=' + organisationID + "pid=" + eventPid)

            var jsonDataSaveGroup = {"orgID":organisationID,"pid":eventPid}
            
            var dataSourceaddGroup = new kendo.data.DataSource({
                                                                   transport: {
                    read: {
                                                                               url: app.serverUrl() + "event/delete/",
                                                                               type:"POST",
                                                                               dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                               data: jsonDataSaveGroup
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
                                                                       console.log(JSON.stringify(e));
                                                                       navigator.notification.alert("Please check your internet connection.",
                                                                                                    function () {
                                                                                                    }, "Notification", 'OK');
                                                                   }               
          
                                                               });  
	            
            dataSourceaddGroup.fetch(function() {
                var loginDataView = dataSourceaddGroup.data();
                $.each(loginDataView, function(i, addGroupData) {
                    console.log(addGroupData.status[0].Msg);           
                    if (addGroupData.status[0].Msg==='Deleted Successfully') {         
                        app.mobileApp.navigate("#adminEventCalendar");
                        app.showAlert("Event Deleted Successfully", "Notification");
                    }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }
                });
            });
        }
        
        var editEventshow = function() {
            
            //alert(eventDataToSend);
            
            
            $(".km-scroll-container").css("-webkit-transform", "");

            console.log(eventNameEdit);            

            $('#editEventDesc').css('height', '80px');

            var txt = $('#editEventDesc'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
    
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv common');

            if(pageToGo===1){
                $("#backCalender").hide();
                $("#backEventList").show();               
            }else{
                $("#backEventList").hide();
                $("#backCalender").show();
            }
            $('body').append(hiddenDiv);

            txt.on('keyup', function () {
                content = $(this).val();
    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
    
                $(this).css('height', hiddenDiv.height());
            });
            
            $("#editEventName").val(eventNameEdit);            
            $("#editEventDesc").html(eventDescEdit);

            $("#editdatePicker").removeAttr('disabled');
            $("#editdateTimePicker").removeAttr('disabled');
            
            $("#editdatePicker").parent().css('width',"160px");
            $("#editdateTimePicker").parent().css('width',"160px");
            $("#editdatePicker").removeClass( "k-input" );
            $("#editdateTimePicker").removeClass( "k-input" );            

            
            
            console.log(eventImageEdit);
            
            if(eventImageEdit!==undefined && eventImageEdit!=="undefined" && eventImageEdit!==''){
            var largeImage = document.getElementById('attachedImgEditEvent');
            largeImage.style.display = 'block';
            largeImage.src = eventImageEdit;
            //$("#removeEditEventAttachment").show(); 
            }else{
            var largeImage = document.getElementById('attachedImgEditEvent');
            largeImage.style.display = 'none';
            largeImage.src = '';
            //$("#removeEditEventAttachment").hide();    
            }
            
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
                                                     open: function(e) {
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
            
            
            
             $('#editdatePicker').attr('disabled','disabled');
             $('#editdateTimePicker').attr('disabled','disabled');
            
            
            /*$('#editdatePicker').attr("readonly","readonly");
            $('#editdateTimePicker').attr("readonly","readonly");*/
        }
        
        var addNewEventFunction = function() {
            var event_name = $("#addEventName").val();     
            var event_description = $("#addEventDesc").val();

            var event_Date = $("#adddatePickerEvent").val();
            var event_Time = $("#adddateTimePickerEvent").val();
            
            if (event_name === "Enter New Event Name" || event_name === "") {
                app.showAlert("Please enter Event Name.", "Validation Error");
            }else if (event_description === "Write Event description here (Optional) ?" || event_description === "") {
                app.showAlert("Please enter Event Description.", "Validation Error");
            }else {    
                var values = event_Date.split('/');            
                var month = values[0]; // globle variable            
                var day = values[1];            
                var year = values[2];
             
                if (day < 10) {
                    day = "0" + day;
                }
            
                var valueTime = event_Time.split(':');            
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
            
                var eventTimeSend = Hour + ":" + minute + ":00";
                //eventTimeSend=eventTimeSend.toString();
             
                event_Date = year + "-" + month + "-" + day;
                //event_Date=event_Date.toString();
                var actionval = "Add";

                
                
                
                        if (eventDataToSend!==undefined && eventDataToSend!=="undefined" && eventDataToSend!=='') { 
                        //alert("1");
                        if (eventDataToSend.substring(0, 21)==="content://com.android") {
                            photo_split = eventDataToSend.split("%3A");
                            eventDataToSend = "content://media/external/images/media/" + photo_split[1];
                        }
                        var params = new Object();
                        params.org_id = organisationID;  //you can send additional info with the file
                        params.txtEventName = event_name;
                        params.txtEventDesc = event_description;
                        params.txtEventDate = event_Date;                            
                        params.eventStartTime = eventTimeSend;
                        params.action = actionval;    
                                               
                        var options = new FileUploadOptions();
                        options.fileKey = "event_image";
                        options.fileName = eventDataToSend.substr(eventDataToSend.lastIndexOf('/') + 1);
              
                        console.log("-------------------------------------------");
                        console.log(options.fileName);
              
                        options.mimeType = "image/jpeg";
                        options.params = params;
                        options.headers = {
                            Connection: "close"
                        }
                        options.chunkedMode = false;
                        var ft = new FileTransfer();

                        console.log(tasks);
                 
                        console.log("----------------------------------------------check-----------");
                        //dataToSend = '//C:/Users/Gaurav/Desktop/R_work/keyy.jpg';
                        ft.upload(eventDataToSend, 'http://54.85.208.215/webservice/event/Add', win, fail, options , true);
                    
                    }else {

                
                
                console.log(event_name);
                console.log(event_description);
                console.log(event_Date);
                console.log(event_Time);
            
                console.log("org_id=" + organisationID + "txtEventName=" + event_name + "txtEventDesc=" + event_description + "txtEventDate=" + event_Date + "eventStartTime=" + eventTimeSend + "action=" + actionval);

                var jsonDataSaveGroup = {"org_id":organisationID,"txtEventName":event_name,"txtEventDesc":event_description,"txtEventDate":event_Date,"eventStartTime":eventTimeSend,"action":actionval}
            
                var dataSourceaddGroup = new kendo.data.DataSource({
                                                                       transport: {
                        read: {
                                                                                   url: app.serverUrl() + "event/Add",
                                                                                   type:"POST",
                                                                                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                   data: jsonDataSaveGroup
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
                                                                           console.log(JSON.stringify(e));
                                                                           navigator.notification.alert("Please check your internet connection.",
                                                                                                        function () {
                                                                                                        }, "Notification", 'OK');
                                                                       }               
          
                                                                   });  
	            
                dataSourceaddGroup.fetch(function() {
                    var loginDataView = dataSourceaddGroup.data();
                    $.each(loginDataView, function(i, addGroupData) {
                        console.log(addGroupData.status[0].Msg);           
                        if (addGroupData.status[0].Msg==='Event added successfully') {         
                            app.mobileApp.navigate("#adminEventCalendar");
                            app.showAlert("Event Added Successfully", "Notification");
                        }else {
                            app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
            }   
                
          }      
        }
        
        
        function win(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
          
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('News Added Successfully');   
            }else {
                app.showAlert("Event Added Successfully", "Notification"); 
            }
              
            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.src = '';
            
            $("#removeEventAttachment").hide();

            app.mobileApp.navigate("#adminEventCalendar");
        }
         
        function fail(error) {
            console.log(error);
            console.log("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);

 
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('Network problem . Please try again later');   
            }else {
                app.showAlert("Network problem . Please try again later", "Notification");  
            }
        }



        var saveEditEventData = function() {
            var event_name = $("#editEventName").val();     
            var event_description = $("#editEventDesc").val();

            var event_Date = $("#editdatePicker").val();
            var event_Time = $("#editdateTimePicker").val();
            
            if (event_name === "Enter New Event Name" || event_name === "") {
                app.showAlert("Please enter Event Name.", "Validation Error");
            }else if (event_description === "Write Event description here (Optional) ?" || event_description === "") {
                app.showAlert("Please enter Event Description.", "Validation Error");
            }else {    
                var values = event_Date.split('/');            
                var month = values[0]; // globle variable            
                var day = values[1];            
                var year = values[2];
             
                if (day < 10) {
                    day = "0" + day;
                }
            
                event_Date = year + "-" + month + "-" + day;
            
                var actionval = "Edit";
            
                console.log(event_name);
                console.log(event_description);
                console.log(event_Date);
                console.log(event_Time);
                
                if (eventDataToSend!==undefined && eventDataToSend!=="undefined" && eventDataToSend!=='') { 
                    //alert(eventDataToSend);
                        console.log("image sending function");
                        if (eventDataToSend.substring(0, 21)==="content://com.android") {
                            photo_split = eventDataToSend.split("%3A");
                            eventDataToSend = "content://media/external/images/media/" + photo_split[1];
                        }
                    
                console.log("org_id=" + organisationID + "txtEventName=" + event_name + "txtEventDesc=" + event_description + "txtEventDate=" + event_Date + "eventStartTime=" + event_Time + "pid=" + eventPid + "action=" + actionval);

                        var params = new Object();
                        params.org_id = organisationID;  //you can send additional info with the file
                        params.txtEventName = event_name;
                        params.txtEventDesc = event_description;
                        params.txtEventDate = event_Date;                            
                        params.eventStartTime = event_Time;
                        params.pid = eventPid;    
                        params.action = actionval;    
                                               
                        var options = new FileUploadOptions();
                        options.fileKey = "event_image";
                        options.fileName = eventDataToSend.substr(eventDataToSend.lastIndexOf('/') + 1);
              
                        console.log("-------------------------------------------");
                        console.log(options.fileName);
              
                        options.mimeType = "image/jpeg";
                        options.params = params;
                        options.headers = {
                            Connection: "close"
                        }
                        options.chunkedMode = false;
                        var ft = new FileTransfer();

                        console.log(tasks);
                 
                        console.log("----------------------------------------------check-----------");
                        //dataToSend = '//C:/Users/Gaurav/Desktop/R_work/keyy.jpg';
                        ft.upload(eventDataToSend, 'http://54.85.208.215/webservice/event/edit', winEdit, fail, options , true);
                    
                    }else {
            
                     //alert(eventDataToSend);

                console.log("org_id=" + organisationID + "txtEventName=" + event_name + "txtEventDesc=" + event_description + "txtEventDate=" + event_Date + "eventStartTime=" + event_Time + "pid=" + eventPid + "action=" + actionval);
                        
                var jsonDataSaveGroup = {"org_id":organisationID ,"txtEventName":event_name,"txtEventDesc":event_description,"txtEventDate":event_Date,"eventStartTime":event_Time,"pid":eventPid,"action":actionval}
            
                var dataSourceaddGroup = new kendo.data.DataSource({
                                                                       transport: {
                        read: {
                                                                                   url: app.serverUrl() + "event/edit",
                                                                                   type:"POST",
                                                                                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                   data: jsonDataSaveGroup
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
                                                                           navigator.notification.alert("Please check your internet connection.",
                                                                                                        function () {
                                                                                                        }, "Notification", 'OK');
                                                                       }               
          
                                                                   });  
	            
                dataSourceaddGroup.fetch(function() {
                    var loginDataView = dataSourceaddGroup.data();
                    $.each(loginDataView, function(i, addGroupData) {
                        console.log(addGroupData.status[0].Msg);           
                        if (addGroupData.status[0].Msg==='Event updated successfully') {         
                                        if(pageToGo===1){
                                         app.mobileApp.navigate("#adminEventList");
                                        }else{
                                          app.mobileApp.navigate("#adminEventCalendar");
                                        }
                            
                                        if (!app.checkSimulator()) {
                                                window.plugins.toast.showShortBottom('Event updated successfully');   
                                        }else {
                                                app.showAlert("Event updated successfully", "Notification"); 
                                        }


                        }else {
                            app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
            }   
          }      
        }
        
        
        function winEdit(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
          
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('Event updated successfully');   
            }else {
                app.showAlert("Event updated successfully", "Notification"); 
            }
         
                                        if(pageToGo===1){
                                         app.mobileApp.navigate("#adminEventList");
                                        }else{
                                          app.mobileApp.navigate("#adminEventCalendar");
                                        }
        }
        
        
        var goToManageOrgPage = function() {
            //app.mobileApp.navigate('views/groupDetailView.html');
            //app.slide('right', 'green' ,'3' ,'#views/groupDetailView.html');    
              app.slide('right', 'green' ,'3' ,'#view-all-activities-GroupDetail');
        }
        
        var goToCalendarPage = function() {
            //app.mobileApp.navigate('#adminEventCalendar');
                                                app.slide('right', 'green' ,'3' ,'#adminEventCalendar');    

        }
        
        var goToCalendarPageDetail = function() {
            //app.mobileApp.navigate('#adminEventCalendarDetail');
                                    app.slide('right', 'green' ,'3' ,'#adminEventCalendarDetail');    

        }
        
        var addNewEvent = function() {
            //app.mobileApp.navigate('#adminAddEventCalendar');
                        app.slide('left', 'green' ,'3' ,'#adminAddEventCalendar');    

        }
        
        var upcommingEventList = function() {
            //app.mobileApp.navigate('#adminEventList');
            app.slide('left', 'green' ,'3' ,'#adminEventList');    

        }
        
        var eventListShow = function() {


            $("#adminEventListLoader").show();
            $("#eventCalendarAllList").hide();

            
            $(".km-scroll-container").css("-webkit-transform", "");            
            
            tasks = [];
            multipleEventArray = [];

            organisationID = localStorage.getItem("orgSelectAdmin");
            account_Id = localStorage.getItem("ACCOUNT_ID");
             
            var jsonDataLogin = {"org_id":organisationID}

            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "event/index",
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
                                                                                $("#adminEventListLoader").hide();
                                                                                $("#eventCalendarAllList").show();

                                                                    if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                    }else {
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
                               
                    if (loginData.status[0].Msg==='No Event list') {
                        tasks = [];
                        groupAllEvent = [];
                        
                                  groupAllEvent.push({
                                       id:0 ,
                                       add_date:'',
                                       event_date:'',
                                       event_desc: 'This Organization has no event.',                                                                                 										  
                                       event_name: 'No Event', 
                                       event_image:'',
                                       event_time: '',                                                                                  										  
                                       mod_date: '',                                     
                                       org_id: ''
                                   });

                    }else if (loginData.status[0].Msg==='Success') {
                        groupAllEvent = [];
                        tasks = [];
                          
                        if (loginData.status[0].eventData.length!==0) {
                            var eventListLength = loginData.status[0].eventData.length;
                              
                            console.log(eventListLength);
                              
                            for (var i = 0 ; i < eventListLength ;i++) {         
                                 var eventDateString = loginData.status[0].eventData[i].event_date;
                                 var eventTimeString = loginData.status[0].eventData[i].event_time;
                                 var eventDate = app.formatDate(eventDateString);
                                 var eventTime = app.formatTime(eventTimeString);
                                
                                var eventDaya = loginData.status[0].eventData[i].event_date
                                var values = eventDaya.split('-');
                                var year = values[0]; // globle variable
                                var month = values[1];
                                var day = values[2];
                                                                                 
                                if (day < 10) {
                                    day = day.replace(/^0+/, '');                                     
                                }
                                var saveData = month + "/" + day + "/" + year;
                        
                                

                                groupAllEvent.push({
                                                       id: loginData.status[0].eventData[i].id,
                                                       add_date: loginData.status[0].eventData[i].add_date,
                                                       event_date:saveData,
                                                       event_show_date:eventDate,
                                                       event_desc: loginData.status[0].eventData[i].event_desc,
                                                       event_image : loginData.status[0].eventData[i].event_image,
                                                       event_name: loginData.status[0].eventData[i].event_name,                                                                                  										  
                                                       event_time: eventTime,                                                                                  										  
                                                       mod_date: loginData.status[0].eventData[i].mod_date,
                                                       page:1,
                                                       org_id: loginData.status[0].eventData[i].org_id
                                                   });
                            }
 
                            
                        } 
                    }
                    
                    showInListView();
                });
            }); 

            
        }
        
        
        var showInListView = function(){
            
          $("#adminEventListLoader").hide();
          $("#eventCalendarAllList").show();

            
             $(".km-scroll-container").css("-webkit-transform", "");

             
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupAllEvent
                                                                       });           
                
            $("#eventCalendarAllList").kendoMobileListView({
                                                               template: kendo.template($("#calendarEventListTemplate").html()),    		
                                                               dataSource: organisationListDataSource
                                                           });
                
            $('#eventCalendarAllList').data('kendoMobileListView').refresh();

            
        }
        
                    var getTakePhoto = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            saveToPhotoAlbum:true
                                        });
        };
        
        
           var getPhotoVal = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
                                        });
        };
        
        
           function onPhotoURISuccessData(imageURI) {
            // Uncomment to view the image file URI
            // console.log(imageURI);
            // Get image handle
            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.style.display = 'block';
               
            // Show the captured photo
            // The inline CSS rules are used to resize the image
            //
            largeImage.src = imageURI;
               
            eventDataToSend = imageURI;              
            $("#removeEventAttachment").show(); 
            $("#attachedImgEvent").show();

            //alert(imageURI);
            console.log(imageURI);
            //eventDataToSend = imageURI;
        }
         
        function onFail(message) {
            console.log('Failed because: ' + message);
            $("#removeEventAttachment").hide(); 
            $("#attachedImgEvent").hide();
        }
         
        var removeImage = function() {
            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.src = '';
            $("#removeEventAttachment").hide(); 
            $("#attachedImgEvent").hide();
            eventDataToSend = ''; 
        }
        
        
        
        
        var goToEventListPage = function(){
         
                            app.mobileApp.navigate('#adminEventList');

        }
        
        
        
        
                
                    var getTakePhotoEdit = function() {
            navigator.camera.getPicture(onPhotoURISuccessDataEdit, onFailEdit, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            saveToPhotoAlbum:true
                                        });
        };
        
        
           var getPhotoValEdit = function() {
            navigator.camera.getPicture(onPhotoURISuccessDataEdit, onFailEdit, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
                                        });
        };
        
        
           function onPhotoURISuccessDataEdit(imageURI) {
            // Uncomment to view the image file URI
            // console.log(imageURI);
            // Get image handle
            var largeImage = document.getElementById('attachedImgEditEvent');
            // Unhide image elements
            //
            largeImage.style.display = 'block';
            // Show the captured photo
            // The inline CSS rules are used to resize the image
            //
            largeImage.src = imageURI;
               
            eventDataToSend = imageURI;              
            //$("#removeEditEventAttachment").show(); 
            $("#attachedImgEditEvent").show();

            //alert(imageURI);
            console.log(imageURI);
            //eventDataToSend = imageURI;
        }
         
        function onFailEdit(message) {
            console.log('Failed because: ' + message);
            //$("#removeEditEventAttachment").hide(); 
            //$("#attachedImgEditEvent").hide();
        }
         
        var removeImageEdit = function() {
            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.src = '';
            $("#removeEditEventAttachment").hide(); 
            $("#attachedImgEditEvent").hide();
            eventDataToSend = ''; 
        }
        
        
        return {
            init: init,
            show: show,
            getTakePhoto:getTakePhoto,
            getPhotoVal:getPhotoVal,
            getTakePhotoEdit:getTakePhotoEdit,
            getPhotoValEdit:getPhotoValEdit,
            removeImage:removeImage,
            removeImageEdit:removeImageEdit,
            editEvent:editEvent,
            goToEventListPage:goToEventListPage,
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