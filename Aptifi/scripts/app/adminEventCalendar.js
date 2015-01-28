var app = app || {};

app.adminEventCalender = (function () {
    var adminCalendarEventModel = (function () {
        var organisationID;
        var account_Id;
        var eventDataToSend;
        var upload_type;
        var groupAllEvent = [];
        var tasks = [];
        var groupDataShow = [];
        
        var init = function() {
            
        }
    
        var show = function() {
            $("#adminCalProcess").show();                                                  
            $("#removeEventAttachment").hide(); 
            $("#attachedImgEvent").hide();
            $("#attachedVidEvent").hide();
            
            eventDataToSend = '';
            upload_type = '';

            $(".km-scroll-container").css("-webkit-transform", "");

            tasks = [];
            multipleEventArray = [];

            organisationID = localStorage.getItem("orgSelectAdmin");
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
                                                                    $("#adminCalProcess").hide();

                                                                    if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                    }else {
                                                                        app.showAlert('Network unavailable . Please try again later' , 'Notification');  
                                                                    }           
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var loginDataView = dataSourceLogin.data();               
						   
                $.each(loginDataView, function(i, loginData) {
                    //console.log(loginData.status[0].Msg);
                    if (loginData.status[0].Msg==='No Event list') {
                        tasks = [];
                        groupAllEvent = [];
                        showEventInCalendar();
                    }else if (loginData.status[0].Msg==='Session Expired') {
                            app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                            app.LogoutFromAdmin();                         
                    }else if (loginData.status[0].Msg==="You don't have access") {
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showLongBottom("You don't have access");  
                        }else {
                            app.showAlert("You don't have access" , 'Offline');  
                        }
                        goToEventListPage();
                    }else if (loginData.status[0].Msg==='Success') {
                        groupAllEvent = [];
                        tasks = [];
                          
                        if (loginData.status[0].eventData.length!==0) {
                            var eventListLength = loginData.status[0].eventData.length;
                              
                            //console.log(eventListLength);
                              
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
                                                        
                                groupAllEvent.push({
                                                       id: loginData.status[0].eventData[i].id,
                                                       add_date: loginData.status[0].eventData[i].add_date,
                                                       event_date: saveData,
                                                       event_show_date:eventDate,
                                                       event_desc: loginData.status[0].eventData[i].event_desc,
                                                       event_image : loginData.status[0].eventData[i].event_image,
                                                       event_name: loginData.status[0].eventData[i].event_name,
                                                       upload_type:loginData.status[0].eventData[i].upload_type,
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
            //console.log(tasks);            
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
            //console.log("Change :: " + kendo.toString(this.value(), 'd'));
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
            //document.getElementById("eventTitle").innerHTML = "";

            $("#eventDate").html(date2);

            //console.log(groupAllEvent);
             
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

                var currentDate = app.getPresentDate();
                
                if (date===dateToCom) {                    
                    //$("#eventDate").html(date);                    
                    //document.getElementById("eventTitle").innerHTML += '<ul><li style="color:rgb(147,147,147);">' + groupAllEvent[i].event_name + ' at ' + groupAllEvent[i].event_time + '</li></ul>' 
                    //console.log(groupAllEvent[i]);                    
                    multipleEventArray.push({
                                                id: groupAllEvent[i].id,
                                                add_date: groupAllEvent[i].add_date,
                                                event_date: groupAllEvent[i].event_date,
                                                event_desc: groupAllEvent[i].event_desc,
                                                event_show_date:groupAllEvent[i].event_show_date,
                                                event_image : groupAllEvent[i].event_image,
                                                event_name: groupAllEvent[i].event_name,
                                                upload_type: groupAllEvent[i].upload_type,
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
            }else if (checkGotevent===0) {                   
                app.mobileApp.navigate('#adminAddEventCalendar');
                app.analyticsService.viewModel.trackFeature("User navigate to Add New Calendar in Admin");            
            }else {
                eventMoreDetailClick();
            }
        }
        
        var eventMoreDetailClick = function() {
            app.analyticsService.viewModel.trackFeature("User navigate to Event Detail in Admin");            

            app.mobileApp.navigate('#adminEventCalendarDetail');           
        }
        
        var eventDetailShow = function(e) {
            //console.log(e.data);
            //alert(e.data.event_name);
            eventPid = e.data.id;
            multipleEventArray.push({
                                        id: e.data.id,
                                        add_date: e.data.add_date,
                                        event_date: e.data.event_date,
                                        event_show_day : e.data.event_show_day,
                                        event_below_day : e.data.event_below_day,
                                        event_desc: e.data.event_desc,
                                        event_image : e.data.event_image,
                                        event_name: e.data.event_name,
                                        upload_type: e.data.upload_type,
                                        event_time: e.data.event_time,                                                                                  										  
                                        mod_date: e.data.mod_date,
                                        page:2,
                                        org_id: e.data.org_id
                                    });

            app.mobileApp.navigate('#adminEventCalendarDetail');           
            app.analyticsService.viewModel.trackFeature("User navigate to Event Detail in Admin");            
        }
        
        var detailShow = function() {
            var dateShow = multipleEventArray[0].event_date;
            $(".km-scroll-container").css("-webkit-transform", "");
            
            $("#detailEventData").html("Event On " + dateShow);
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
        
        var addEventshow = function() {
            
            $("#sendEventLoader").show();            
            //$(".km-scroll-container").css("-webkit-transform", "");
            $(".km-native-scroller").scrollTop(0);

            $("#addEventName").val('');
            $("#addEventDesc").val('');
            //console.log(date2);
            groupDataShow = [];
            
            $("#attachedImgEvent").hide();
            $("#attachedVidEvent").hide();  
            
            $("#adddatePickerEvent").removeAttr('disabled');
            $("#adddateTimePickerEvent").removeAttr('disabled');

            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.src = '';
            
            $("#adddatePickerEvent").parent().css('width', "160px");
            $("#adddateTimePickerEvent").parent().css('width', "160px");
            $("#adddatePickerEvent").removeClass("k-input");
            $("#adddateTimePickerEvent").removeClass("k-input");            
            
                       
            var currentDate = app.getPresentDate();
            
            disabledDaysBefore = [
                +new Date(currentDate)
            ];
            
            $("#adddatePickerEvent").kendoDatePicker({
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
                                                             //console.log(value); 
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
                                                                 //console.log(value); //value is the selected date in the timepicker
                                                             }                
                                                         });

            //var addEventDatePicker = $("#adddatePickerEvent").data("kendoDatePicker");            
            
            //$(".k-datepicker input").prop("readonly", true);
            
            /* $('#adddatePickerEvent').attr("readonly","readonly");

            $('#adddateTimePickerEvent').attr("readonly","readonly");

            */
            
            $('#adddatePickerEvent').attr('disabled', 'disabled');
            $('#adddateTimePickerEvent').attr('disabled', 'disabled');
            /*var addEventTimePicker = $("#adddateTimePickerEvent").data("kendoTimePicker"); 
            addEventTimePicker.input.focus(function() {
            //$( "#orgforNotification" ).blur();
            addEventTimePicker.input.blur();
            });  */ 
            
            getGroupToShowInCombo();
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
                        console.log(data);
                        return [data];                       
                    }
                },
                                                                         error: function (e) {
                                                                             console.log(JSON.stringify(e));
                                                                             $("#sendEventLoader").hide();
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
            
            comboGroupListDataSource.fetch(function() {                                                       
                groupDataShow = [];
                var data = this.data();                
                                            
                if (data[0]['status'][0].Msg==='No Group list') {
                    groupDataShow=[];
                                            groupDataShow.push({
                                               group_name: 'No Group Found , To Add Event First Add Group',
                                               pid:'0'
                                           });

                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom("You don't have access");  
                    }else {
                        app.showAlert("You don't have access" , 'Offline');  
                    }
                    goToEventListPage();
                }else if (data[0]['status'][0].Msg==='Session Expired') {
                            app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                            app.LogoutFromAdmin();                         
                    }else {
                    var orgLength = data[0].status[0].groupData.length;
                    for (var j = 0;j < orgLength;j++) {
                        groupDataShow.push({
                                               //group_desc: data[0].status[0].groupData[j].group_desc,
                                               group_name: data[0].status[0].groupData[j].group_name,
                                               //group_status:data[0].status[0].groupData[j].group_status,
                                               //org_id:data[0].status[0].groupData[j].org_id,
                                               pid:data[0].status[0].groupData[j].pid
                                           });
                    }                                
                }  
                
                showGroupDataInTemplate();
            });
        };
        
        var showGroupDataInTemplate = function() {
            //alert('hello');
            console.log(groupDataShow);
            $("#sendEventLoader").hide();
            
            $(".km-scroll-container").css("-webkit-transform", "");
           
            var comboGroupListDataSource = new kendo.data.DataSource({
                                                                         data: groupDataShow
                                                                     });              
            
            $("#groupInAddEvent").kendoListView({
                                                    template: kendo.template($("#groupNameShowTemplate").html()),    		
                                                    dataSource: comboGroupListDataSource
                                                });
        }
        
        var eventNameEdit;
        var eventDescEdit;
        var eventDateEdit;
        var eventTimeEdit;
        var eventImageEdit;
        var eventPid;
        var pageToGo;
        var eventUploadType;
        
        var editEvent = function(e) {
            //console.log(e.data.uid);
            //console.log(e.data);
            eventNameEdit = e.data.event_name;
            eventDescEdit = e.data.event_desc;
            eventDateEdit = e.data.event_date;
            eventTimeEdit = e.data.event_time;
            eventImageEdit = e.data.event_image;
            eventUploadType = e.data.upload_type;
            eventPid = e.data.id;
            pageToGo = e.data.page;
            app.analyticsService.viewModel.trackFeature("User navigate to Edit Event Detail in Admin");            
            app.mobileApp.navigate('#adminEditEventCalendar');
        }
        
        var deleteEvent = function(e) {
            //console.log(e.data.uid);
            //console.log(e.data);
            //var eventPid = e.data.id;
            organisationID = localStorage.getItem("orgSelectAdmin");
            
            //console.log('orgID=' + organisationID + "pid=" + eventPid)
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
                        //console.log(data);
                        return [data];
                    }
                },
                                                                   error: function (e) {
                                                                       //apps.hideLoading();
                                                                       //console.log(JSON.stringify(e));
                                                                       if (!app.checkSimulator()) {
                                                                           window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                       }else {
                                                                           app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                       }
                                                                   }               
          
                                                               });  
	            
            dataSourceaddGroup.fetch(function() {
                var loginDataView = dataSourceaddGroup.data();
                $.each(loginDataView, function(i, addGroupData) {
                    //console.log(addGroupData.status[0].Msg);           
                    if (addGroupData.status[0].Msg==='Deleted Successfully') {         
                        app.mobileApp.navigate("#adminEventList");
                        //app.showAlert("Event Deleted Successfully", "Notification");
                        
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom('Event Deleted Successfully');   
                        }else {
                            app.showAlert("Event Deleted Successfully", "Notification");  
                        }
                    }else if (addGroupData.status[0].Msg==="You don't have access") {                                    
                    
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom("You don't have access");  
                    }else {
                        app.showAlert("You don't have access" , 'Offline');  
                    }
                    
                    
                        
                }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }
                });
            });
        }

        var upload_type_edit;
        
        var editEventshow = function() {  
            $(".km-scroll-container").css("-webkit-transform", "");
            //console.log(eventNameEdit);            
            $('#editEventDesc').css('height', '80px');
            var txt = $('#editEventDesc'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv common');

            /*if (pageToGo===1) {
            $("#backCalender").hide();
            $("#backEventList").show();               
            }else {
            $("#backEventList").hide();
            $("#backCalender").show();
            }*/
            
            $('body').append(hiddenDiv);
            txt.on('keyup', function () {
                content = $(this).val();
    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
    
                $(this).css('height', hiddenDiv.height());
            });
            
            $('#groupInEditEvent').find('input[type=checkbox]:checked').remove();

            $("#sendEditEventLoader").show();
            $("#wrapp_content").hide();
            $("#editdatePicker").removeAttr('disabled');
            $("#editdateTimePicker").removeAttr('disabled');            
            $("#editdatePicker").parent().css('width', "160px");
            $("#editdateTimePicker").parent().css('width', "160px");
            $("#editdatePicker").removeClass("k-input");
            $("#editdateTimePicker").removeClass("k-input");            
                                                
            var org_id = localStorage.getItem("orgSelectAdmin");
            
            //alert(org_id+"||"+newsPid);
            
            var dataSourceMemberDetail = new kendo.data.DataSource({
                                                                       transport: {
                    read: {
                                                                                   url: app.serverUrl() + "event/eventdetail/" + org_id + "/" + eventPid,
                                                                                   type:"POST",
                                                                                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                               }
                },
                                                                       schema: {
                    data: function(data) {
                        console.log(data);
                        return [data];
                    }
                },
                                                                       error: function (e) {
                                                                           $("#sendEditEventLoader").hide(); 
                                                                           console.log(JSON.stringify(e));
                                                                           
                                                                           $("#adminEditCustomer").hide();            
                                                                           $("#editOrgMemberContent").show();
                                                                           
                                                                           if (!app.checkSimulator()) {
                                                                               window.plugins.toast.showShortBottom('Please check your internet connection.');
                                                                           }else {
                                                                               app.showAlert("Please check your internet connection.", "Notification"); 
                                                                           }
                                                                       }               
                                                                   });  
	            
            dataSourceMemberDetail.fetch(function() {
                var loginDataView = dataSourceMemberDetail.data();                                    
                $.each(loginDataView, function(i, addGroupData) {
                    console.log(addGroupData);
                    if (addGroupData.status[0].Msg==='Success') {
                        EditGroupArrayMember = [];
                        adminAllGroupArray = [];
                        customerGroupArray = [];
                        
                        /*eventNameEdit = e.data.event_name;
                        eventDescEdit = e.data.event_desc;
                        eventDateEdit = e.data.event_date;
                        eventTimeEdit = e.data.event_time;
                        eventImageEdit = e.data.event_image;
                        eventUploadType = e.data.upload_type;
                        eventPid = e.data.id;
                        */                        
                        
                        eventNameEdit = addGroupData.status[0].eventDetail[0].event_name;
                        eventDescEdit = addGroupData.status[0].eventDetail[0].event_desc;
                        eventDateEdit = addGroupData.status[0].eventDetail[0].event_date;
                        eventTimeEdit = addGroupData.status[0].eventDetail[0].event_time;
                        eventImageEdit = addGroupData.status[0].eventDetail[0].event_image; 
                        eventUploadType = addGroupData.status[0].eventDetail[0].upload_type; 
                        eventPid = addGroupData.status[0].eventDetail[0].id;
                        
                        $("#editEventName").val(app.htmlDecode(eventNameEdit)); 
                        $("#editEventDesc").html(app.htmlDecode(eventDescEdit));
                                    
                        if (eventImageEdit!==undefined && eventImageEdit!=="undefined" && eventImageEdit!=='' && eventUploadType==="image") {
                            var largeImage = document.getElementById('attachedImgEditEvent');
                            largeImage.style.display = 'block';
                            largeImage.src = eventImageEdit;
                            upload_type_edit = "image";
                
                            eventDataToSend = eventImageEdit ;
                
                            var largeImageVid = document.getElementById('attachedEditVidEvent');
                            largeImageVid.style.display = 'none';
                            largeImageVid.src = '';
                        }else if (eventImageEdit!==undefined && eventImageEdit!=="undefined" && eventImageEdit!=='' && eventUploadType==="video") {
                            var largeImageVid = document.getElementById('attachedEditVidEvent');
                            largeImageVid.style.display = 'block';
                            largeImageVid.src = eventImageEdit;
                            upload_type_edit = "video";
                
                            eventDataToSend = eventImageEdit ;
                
                            var largeImage = document.getElementById('attachedImgEditEvent');
                            largeImage.style.display = 'none';
                            largeImage.src = '';
                        }else {
                            var largeImage = document.getElementById('attachedImgEditEvent');
                            largeImage.style.display = 'none';
                            largeImage.src = '';
                
                            var largeImageVid = document.getElementById('attachedEditVidEvent');
                            largeImageVid.style.display = 'none';
                            largeImageVid.src = '';
                            upload_type_edit = " ";
                            //$("#removeEditEventAttachment").hide();    
                        }
            
                        //console.log(eventDateEdit);
                        
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
                                                                     //console.log(value); //value is the selected date in the timepicker
                                                                 }
                                                             });
                         
                        $("#editdateTimePicker").kendoTimePicker({
                                                                     value: eventTimeEdit,
                                                                     interval: 15,
                                                                     format: "h:mm tt",
                                                                     timeFormat: "HH:mm",                
                                                                     change: function() {
                                                                         var value = this.value();
                                                                         //console.log(value); //value is the selected date in the timepicker
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
            
                        $('#editdatePicker').attr('disabled', 'disabled');
                        $('#editdateTimePicker').attr('disabled', 'disabled');
                        /*$('#editdatePicker').attr("readonly","readonly");
                        $('#editdateTimePicker').attr("readonly","readonly");*/
                                                                                                
                        if (addGroupData.status[0].AdminGroup.length!==0 && addGroupData.status[0].AdminGroup.length!==undefined) {
                            adminAllGroupArray = [];
                            for (var i = 0 ; i < addGroupData.status[0].AdminGroup.length;i++) {
                                adminAllGroupArray.push({
                                                            group_name: addGroupData.status[0].AdminGroup[i].group_name,
                                                            pid: addGroupData.status[0].AdminGroup[i].pid
                                                        });
                            }
                        }
                        
                        if (addGroupData.status[0].eventGroup.length!==0 && addGroupData.status[0].eventGroup.length!==undefined) {
                            customerGroupArray = [];
                            for (var i = 0 ; i < addGroupData.status[0].eventGroup.length;i++) {
                                customerGroupArray.push({
                                                            pid: addGroupData.status[0].eventGroup[i].group_id
                                                        });
                            }
                        }
                        
                        console.log(adminAllGroupArray);
                        console.log(customerGroupArray);
                        
                        var allGroupLength = adminAllGroupArray.length;
                        var allCustomerLength = customerGroupArray.length;                        
                        
                        for (var i = 0;i < allGroupLength;i++) {       
                            adminAllGroupArray[i].pid = parseInt(adminAllGroupArray[i].pid);
                            var check = ''; 
                            
                            for (var j = 0;j < allCustomerLength;j++) {
                                if (parseInt(adminAllGroupArray[i].pid)===parseInt(customerGroupArray[j].pid)) {              
                                    check = 'checked';
                                    break;
                                }else {
                                    check = '';                                         
                                }  
                            }
                            
                            EditGroupArrayMember.push({
                                                          group_name: adminAllGroupArray[i].group_name,
                                                          pid: adminAllGroupArray[i].pid,
                                                          check:check
                                                      });
                        }
                    }else if (addGroupData.status[0].Msg==="Session Expired") {
                        app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                        app.LogoutFromAdmin(); 
                    }else if (addGroupData.status[0].Msg==="You don't have access") {
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showLongBottom("You don't have access");  
                        }else {
                            app.showAlert("You don't have access" , 'Offline');  
                        }
                    }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }                               
                    //console.log('------------------');
                    console.log(EditGroupArrayMember);                  
                                   
                    /*var comboEditGroupListDataSource = new kendo.data.DataSource({
                    data: EditGroupArrayMember
                    }); */                        
            
                    $("#groupInEditEvent").kendoListView({
                                                             template: kendo.template($("#groupNameEditShowTemplate").html()),    		
                                                             dataSource: EditGroupArrayMember
                                                         });
                    
                    $("#sendEditEventLoader").hide();
                    $("#wrapp_content").show();
                });
            });
             
        }
                      
        var addNewEventFunction = function() {
            var event_name = $("#addEventName").val();     
            var event_description = $("#addEventDesc").val();

            var event_Date = $("#adddatePickerEvent").val();
            var event_Time = $("#adddateTimePickerEvent").val();
            
            var group = [];		    
            $(':checkbox:checked').each(function(i) {
                group[i] = $(this).val();
            });            
            group = String(group);
            
            if (event_name === "Enter New Event Name" || event_name === "") {
                app.showAlert("Please enter Event Name.", "Validation Error");
            }else if (event_description === "Write Event description here (Optional) ?" || event_description === "") {
                app.showAlert("Please enter Event Description.", "Validation Error");
            }else if (group.length===0 || group.length==='0') {
                app.showAlert("Please select Group.", "Validation Error");    
            }else {
                $("#sendEventLoader").show();
                
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
            
                var eventTimeSend = Hour + ":" + minute + ":00";
                //eventTimeSend=eventTimeSend.toString();
             
                event_Date = year + "-" + month + "-" + day;
                //event_Date=event_Date.toString();
                var actionval = "Add";
                var vidFmAndroid = 0;

                if (eventDataToSend!==undefined && eventDataToSend!=="undefined" && eventDataToSend!=='') { 
                    //alert("1");
                    if ((eventDataToSend.substring(0, 21)==="content://com.android") && (upload_type==="image")) {
                        photo_split = eventDataToSend.split("%3A");
                        eventDataToSend = "content://media/external/images/media/" + photo_split[1];
                        vidFmAndroid = 1;  
                    }else if ((eventDataToSend.substring(0, 21)==="content://com.android") && (upload_type==="video")) {
                        //alert('2');
                        photo_split = eventDataToSend.split("%3A");
                        //console.log(photo_split);
                        eventDataToSend = "content://media/external/video/media/" + photo_split[1];
                        vidFmAndroid = 1;  
                    }
                                        
                    var mimeTypeVal;
                    if (upload_type==="image") {
                        mimeTypeVal = "image/jpeg"
                    }else {
                        mimeTypeVal = "video/mpeg"
                    }

                    var filename = eventDataToSend.substr(eventDataToSend.lastIndexOf('/') + 1);                            
                    
                    if (upload_type==="image" && vidFmAndroid===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.jpg';
                        }                
                    }else if (upload_type==="video" && vidFmAndroid===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.mp4';
                        }
                    }

                    var path = eventDataToSend;
                    //console.log(path);
                    
                    var params = new Object();
                    params.org_id = organisationID;  //you can send additional info with the file
                    params.txtEventName = event_name;
                    params.txtEventDesc = event_description;
                    params.txtEventDate = event_Date;                            
                    params.eventStartTime = eventTimeSend;
                    params.action = actionval;
                    params.upload_type = upload_type;
                    params.cmbGroup = group;
                                               
                    var options = new FileUploadOptions();
                    options.fileKey = "event_image";
                    options.fileName = filename;
              
                    //console.log(options.fileName);

                    options.mimeType = mimeTypeVal;
                    options.params = params;
                    options.headers = {
                        Connection: "close"
                    }
                    options.chunkedMode = true;
                    var ft = new FileTransfer();
                 
                    ft.upload(eventDataToSend, app.serverUrl() + 'event/Add', win, fail, options , true);
                }else {
                    //console.log("org_id=" + organisationID + "txtEventName=" + event_name + "txtEventDesc=" + event_description + "txtEventDate=" + event_Date + "eventStartTime=" + eventTimeSend + "action=" + actionval);
                    var jsonDataSaveGroup = {"org_id":organisationID,"txtEventName":event_name,"txtEventDesc":event_description,"txtEventDate":event_Date,"eventStartTime":eventTimeSend,"action":actionval,"cmbGroup":group}
            
                    console.log(jsonDataSaveGroup);
                    
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
                                                                               console.log(JSON.stringify(e));
                                                                               $("#sendEventLoader").hide();
                                                                               
                                                                               if (!app.checkSimulator()) {
                                                                                   window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                               }else {                                                                                   app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                               }
                                                                           }               
          
                                                                       });  
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            //console.log(addGroupData.status[0].Msg);           
                            if (addGroupData.status[0].Msg==='Event added successfully') {         
                                app.mobileApp.navigate("#adminEventList");
                                
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showLongBottom('Event Added Successfully');  
                                }else {
                                    app.showAlert('Event Added Successfully", "Notification');  
                                }    
                                
                                $("#sendEventLoader").hide();
                            }else if (addGroupData.status[0].Msg==="You don't have access") {                                    
                    
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom("You don't have access");  
                    }else {
                        app.showAlert("You don't have access" , 'Offline');  
                    }
                    
                            goToEventListPage();
                            }else {
                                $("#sendEventLoader").hide();
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
                    window.plugins.toast.showLongBottom('Event Added Successfully');  
                }else {
                    app.showAlert('Event Added Successfully' , 'Notification');  
                }
              
            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.src = '';            
            
            var largevid = document.getElementById('attachedVidEvent');
            largevid.src = '';
            
            $("#removeEventAttachment").hide();

            $("#sendEventLoader").hide();

            app.mobileApp.navigate("#adminEventList");
        }
         
        function fail(error) {
            console.log(error);
            console.log("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
             
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }else{                
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Event Not Added/Updated Successfully');  
                }else {
                    app.showAlert('Event Not Added/Updated Successfully' , 'Notification');  
                }
            }

            
            $("#sendEventLoader").hide();
            $("#sendEditEventLoader").show();
        }

        var saveEditEventData = function() {
            var event_name = $("#editEventName").val();     
            var event_description = $("#editEventDesc").val();
            var event_Date = $("#editdatePicker").val();
            var event_Time = $("#editdateTimePicker").val();
            
            var groupEdit = [];		    
            $(':checkbox:checked').each(function(i) {
                groupEdit[i] = $(this).val();
            });            
            groupEdit = String(groupEdit);             
            console.log(groupEdit);
            
            if (event_name === "Enter New Event Name" || event_name === "") {
                app.showAlert("Please enter Event Name.", "Validation Error");
            }else if (event_description === "Write Event description here (Optional) ?" || event_description === "") {
                app.showAlert("Please enter Event Description.", "Validation Error");
            }else if (groupEdit.length===0 || groupEdit.length==='0') {
                app.showAlert("Please select Group.", "Validation Error");    
            }else {    
                $("#sendEditEventLoader").show();
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
                                               
                var vidFmAndroidEdit = 0;
                          
                if (eventDataToSend!==undefined && eventDataToSend!=="undefined" && eventDataToSend!=='') { 
                    //alert(eventDataToSend);
                    //console.log("image sending function");
                    if ((eventDataToSend.substring(0, 21)==="content://com.android") && (upload_type_edit==="image")) {
                        photo_split = eventDataToSend.split("%3A");
                        eventDataToSend = "content://media/external/images/media/" + photo_split[1];
                        vidFmAndroidEdit = 1;  
                    }else if ((eventDataToSend.substring(0, 21)==="content://com.android") && (upload_type_edit==="video")) {
                        photo_split = eventDataToSend.split("%3A");
                        eventDataToSend = "content://media/external/video/media/" + photo_split[1];
                        vidFmAndroidEdit = 1;  
                    }

                    var mimeTypeVal;

                    if (upload_type_edit==="image") {
                        mimeTypeVal = "image/jpeg"
                    }else {
                        mimeTypeVal = "video/mpeg"
                    }

                    var filename = eventDataToSend.substr(eventDataToSend.lastIndexOf('/') + 1);                            
                    
                    if (upload_type_edit==="image" && vidFmAndroidEdit===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.jpg';
                        }                
                    }else if (upload_type_edit==="video" && vidFmAndroidEdit===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.mp4';
                        }
                    }
                   
                    var path = eventDataToSend;
                    //console.log(path);
                    
                    //console.log("org_id=" + organisationID + "txtEventName=" + event_name + "txtEventDesc=" + event_description + "txtEventDate=" + event_Date + "eventStartTime=" + event_Time + "pid=" + eventPid + "action=" + actionval);

                    var params = new Object();
                    params.org_id = organisationID;  //you can send additional info with the file
                    params.txtEventName = event_name;
                    params.txtEventDesc = event_description;
                    params.txtEventDate = event_Date;                            
                    params.eventStartTime = event_Time;
                    params.pid = eventPid;    
                    params.action = actionval;    
                    params.upload_type = upload_type_edit;
                    params.cmbGroup = groupEdit;
       
                    var options = new FileUploadOptions();
                    options.fileKey = "event_image";
                    options.fileName = filename;
              
                    //console.log("-------------------------------------------");
                    //console.log(options.fileName);
              
                    options.mimeType = mimeTypeVal;
                    options.params = params;
                    options.headers = {
                        Connection: "close"
                    }
                    options.chunkedMode = true;
                    
                    var ft = new FileTransfer();
                    //console.log(tasks);
                 
                    //console.log("----------------------------------------------check-----------");
                    //dataToSend = '//C:/Users/Gaurav/Desktop/R_work/keyy.jpg';
                    ft.upload(eventDataToSend, app.serverUrl() + 'event/edit', winEdit, fail, options , true);
                }else {
                    //alert(eventDataToSend);
                    //console.log("org_id=" + organisationID + "txtEventName=" + event_name + "txtEventDesc=" + event_description + "txtEventDate=" + event_Date + "eventStartTime=" + event_Time + "pid=" + eventPid + "action=" + actionval);
                    var jsonDataSaveGroup = {"org_id":organisationID ,"txtEventName":event_name,"txtEventDesc":event_description,"txtEventDate":event_Date,"eventStartTime":event_Time,"pid":eventPid,"action":actionval,"cmbGroup":groupEdit}
            
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
                                //console.log(data);
                                return [data];
                            }
                        },
                                                                           error: function (e) {
                                                                               //apps.hideLoading();
                                                                               console.log(e);
                                                                               console.log(JSON.stringify(e));
                                                                               
                                                                               $("#sendEditEventLoader").hide();

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
                                /*if (pageToGo===1) {
                                app.mobileApp.navigate("#adminEventList");
                                }else {*/
                                app.mobileApp.navigate("#adminEventList");

                                //}
                            
                                $("#sendEditEventLoader").hide();

                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom('Event updated successfully');   
                                }else {
                                    app.showAlert("Event updated successfully", "Notification"); 
                                }
                            }else if (addGroupData.status[0].Msg==="You don't have access") {                                    
                    
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom("You don't have access");  
                    }else {
                        app.showAlert("You don't have access" , 'Offline');  
                    }
                    
                    goToCalendarPageDetail();
                }else {
                                $("#sendEditEventLoader").hide();
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

            $("#sendEditEventLoader").hide();

                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Event Updated Successfully');  
                }else {
                    app.showAlert('Event Updated Successfully' , 'Notification');  
                }
         
            //if (pageToGo===1) {
            app.mobileApp.navigate("#adminEventList");
            /*}else {
            app.mobileApp.navigate("#adminEventCalendar");
            }*/
        }
        
        var goToManageOrgPage = function() {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');
            //app.slide('right', 'green' ,'3' ,'#views/groupDetailView.html');    
            //app.slide('right', 'green' , '3' , '#view-all-activities-GroupDetail');
        }
        
        var goToCalendarPage = function() {
            app.mobileApp.navigate('#adminEventCalendar');
            //app.slide('right', 'green' , '3' , '#adminEventCalendar');    
        }
        
        var goToCalendarPageDetail = function() {
            app.mobileApp.navigate('#adminEventCalendarDetail');
            //app.slide('right', 'green' , '3' , '#adminEventCalendarDetail');    
        }
        
        var addNewEvent = function() {
            app.mobileApp.navigate('#adminAddEventCalendar');
            //app.slide('left', 'green' , '3' , '#adminAddEventCalendar');    
        }
        
        var upcommingEventList = function() {
            app.mobileApp.navigate('#adminEventList');
            //app.slide('left', 'green' , '3' , '#adminEventList');    
        }
        
        var goToAddEventPage = function() {
            app.mobileApp.navigate('#adminEventCalendarDetail');
        }
        
        var eventListShow = function() {
            $("#adminEventListLoader").show();
            $("#eventCalendarAllList").hide();
            
            $(".km-scroll-container").css("-webkit-transform", "");            
            
            tasks = [];
            multipleEventArray = [];

            organisationID = localStorage.getItem("orgSelectAdmin");
            
            //alert(organisationID);
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
                                                                                                                                                console.log(JSON.stringify(e));
                                                                    console.log(JSON.stringify(e));
                                                                    
                                                                    $("#adminEventListLoader").hide();
                                                                    $("#eventCalendarAllList").show();

                                                                    if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                    }else {
                                                                        app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                    }   
                                                                    
                                                                    app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response from API fetching Organization Event List in Admin Panel.');
                         
                                                                    var showNotiTypes = [
                                                                        { message: "Please Check Your Internet Connection"}
                                                                    ];
                       
                                                                    var dataSource = new kendo.data.DataSource({
                                                                                                                   data: showNotiTypes
                                                                                                               });
                    
                                                                    $("#eventCalendarAllList").kendoMobileListView({
                                                                                                                       template: kendo.template($("#errorTemplate").html()),
                                                                                                                       dataSource: dataSource  
                                                                                                                   });
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var data = this.data(); 
                var loginDataView = dataSourceLogin.data();               
						   
                //$.each(loginDataView, function(i, loginData) {
                //console.log(loginData.status[0].Msg);
                               
                if (data[0]['status'][0].Msg==='No Event list') {
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
                }else if (data[0]['status'][0].Msg==='Session Expired') {
                            app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                            app.LogoutFromAdmin();                         
                    
                }else if (data[0]['status'][0].Msg==="You don't have access") {                                           
                
                    if(!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom("You don't have access");  
                    }else {
                        app.showAlert("You don't have access" , 'Offline');  
                    }                       
                        goToManageOrgPage();
                }else if (data[0]['status'][0].Msg==='Success') {
                    groupAllEvent = [];
                    tasks = [];
                          
                    if (data[0].status[0].eventData.length!==0) {
                        var eventListLength = data[0].status[0].eventData.length;
                        var preDateVal = 0 ;
                            
                        console.log(eventListLength);
                              
                        for (var i = 0 ; i < eventListLength ;i++) {         
                            var eventDateString = data[0].status[0].eventData[i].event_date;
                            var eventTimeString = data[0].status[0].eventData[i].event_time;
                            var eventDate = app.formatDate(eventDateString);
                            var eventTime = app.formatTime(eventTimeString);
                          
                            var aboveDay = app.getDateDays(eventDateString);   
                            var belowData = app.getDateMonth(eventDateString);
                                
                            var eventDaya = data[0].status[0].eventData[i].event_date
                            var values = eventDaya.split('-');
                            var year = values[0]; // globle variable
                            var month = values[1];
                            var day = values[2];
                                                                                 
                            if (day < 10) {
                                day = day.replace(/^0+/, '');                                     
                            }
                            var saveData = month + "/" + day + "/" + year;

                            groupAllEvent.push({
                                                   id: data[0].status[0].eventData[i].id,
                                                   add_date: data[0].status[0].eventData[i].add_date,
                                                   event_date:saveData,
                                                   event_show_day:day,
                                                   preDateVal:preDateVal,
                                                   event_above_day:aboveDay,
                                                   event_below_day:belowData,
                                                   event_desc: data[0].status[0].eventData[i].event_desc,
                                                   upload_type: data[0].status[0].eventData[i].upload_type,
                                                   event_image : data[0].status[0].eventData[i].event_image,
                                                   event_name: data[0].status[0].eventData[i].event_name,                                                                                  										  
                                                   event_time: eventTime,                                                                                  										  
                                                   mod_date: data[0].status[0].eventData[i].mod_date,
                                                   page:1,
                                                   org_id: data[0].status[0].eventData[i].org_id
                                               });        
                            preDateVal = saveData;
                        }
                    } 
                }
                    
                showInListView();
            });
            //}); 
        }
        
        var showInListView = function() {
            $("#adminEventListLoader").hide();
            $("#eventCalendarAllList").show();
            
            $(".km-scroll-container").css("-webkit-transform", "");
             
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupAllEvent
                                                                       });           
                
            $("#eventCalendarAllList").kendoMobileListView({
                                                               template: kendo.template($("#calendarAdminEventListTemplate").html()),    		
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
                                            correctOrientation: true,
                                            saveToPhotoAlbum:true
                                        });
        };
        
        var getPhotoVal = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };
        
        var getVideoVal = function() {            
            navigator.camera.getPicture(onVideoURISuccessData, onFail, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            mediaType: navigator.camera.MediaType.VIDEO
                                        });
        }
        
        function onVideoURISuccessData(videoURI) {             
            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.src = ''; 
            
            $("#removeEventAttachment").hide(); 
            $("#attachedImgEvent").hide();            
            //console.log(imageURI);            
            // Uncomment to view the image file URI
            // console.log(imageURI);
            // Get image handle
            
            var videoAttached = document.getElementById('attachedVidEvent');
            // Unhide image elements
            //
            videoAttached.style.display = 'block';
            // Show the captured photo
            // The inline CSS rules are used to resize the image
            
            videoAttached.src = 'styles/images/videoPlayIcon.png';
            eventDataToSend = videoURI;    
            upload_type = "video";
            
            $("#removeEventAttachment").show(); 
            $("#attachedVidEvent").show();

            //alert(imageURI);
            console.log(videoURI);
            //newsDataToSend = imageURI;
        }
        
        function onPhotoURISuccessData(imageURI) {
            var videoAttached = document.getElementById('attachedVidEvent');
            videoAttached.src = '';
            
            $("#removeEventAttachment").hide(); 
            $("#attachedVidEvent").hide();
            
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
            upload_type = "image";

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
            var videoAttached = document.getElementById('attachedVidEvent');
            videoAttached.src = '';            
            $("#removeEventAttachment").hide(); 
            $("#attachedImgEvent").hide();
            $("#attachedVidEvent").hide();            
            newsDataToSend = '';             
        }
        
        var goToEventListPage = function() {
            app.mobileApp.navigate('#adminEventList');
        }
                
        var getTakePhotoEdit = function() {
            navigator.camera.getPicture(onPhotoURISuccessDataEdit, onFailEdit, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            correctOrientation: true,
                                            saveToPhotoAlbum:true
                                        });
        };
        
        var getPhotoValEdit = function() {
            navigator.camera.getPicture(onPhotoURISuccessDataEdit, onFailEdit, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };
        
        var getVideoValEdit = function() {        
            navigator.camera.getPicture(onVideoURISuccessDataEdit, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            mediaType: navigator.camera.MediaType.VIDEO
                                        });
        }
        
        function onPhotoURISuccessDataEdit(imageURI) {
            var largeImageVid = document.getElementById('attachedEditVidEvent');
            largeImageVid.src = ''; 
            $("#attachedEditVidEvent").hide();            
            
            // Uncomment to view the image file URI
            // console.log(imageURI);
            // Get image handle

            var largeImage = document.getElementById('attachedImgEditEvent');
            largeImage.style.display = 'block';
            
            // Show the captured photo
            // The inline CSS rules are used to resize the image
            
            largeImage.src = imageURI;
            upload_type_edit = "image";   

            eventDataToSend = imageURI;  
            
            //$("#removeEditEventAttachment").show(); 
            $("#attachedImgEditEvent").show();

            //alert(imageURI);
            console.log(imageURI);
            //eventDataToSend = imageURI;
        }
        
        function onVideoURISuccessDataEdit(videoURI) {
            var largeImage = document.getElementById('attachedImgEditEvent');
            largeImage.src = ''; 
            $("#attachedImgEditEvent").hide();            

            var videoAttachedEdit = document.getElementById('attachedEditVidEvent');
            videoAttachedEdit.style.display = 'block';
            videoAttachedEdit.src = 'styles/images/videoPlayIcon.png';
            
            eventDataToSend = videoURI;    
            upload_type_edit = "video";
            
            $("#attachedEditVidEvent").show();
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
            
            var largeImageVid = document.getElementById('attachedEditVidEvent');
            largeImageVid.src = '';
            $("#attachedEditVidEvent").hide();
            
            eventDataToSend = ''; 
            upload_type_edit = "";
        }
        
        var addEventByAdmin = function() {
            app.mobileApp.navigate('#adminAddEventCalendar');
        }
        
        return {
            init: init,
            show: show,
            getTakePhoto:getTakePhoto,
            getPhotoVal:getPhotoVal,
            getVideoVal:getVideoVal,
            addEventByAdmin:addEventByAdmin,
            getTakePhotoEdit:getTakePhotoEdit,
            getPhotoValEdit:getPhotoValEdit,
            getVideoValEdit:getVideoValEdit,
            removeImage:removeImage,
            goToAddEventPage:goToAddEventPage,
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
            eventDetailShow:eventDetailShow,
            goToCalendarPageDetail:goToCalendarPageDetail,
            saveEditEventData:saveEditEventData,
            upcommingEventList:upcommingEventList,
            detailShow:detailShow
        };
    }());
        
    return adminCalendarEventModel;
}());