var app = app || {};

app.adminEventCalender = (function () {
    'use strict';
    var adminCalendarEventModel = (function () {
        var organisationID;
        var eventDataToSend;
        var upload_type;
        var groupAllEvent = [];
        var device_type;
        var groupDataShow = [];
        var pbEvent;
        var disabledDaysBefore = [];
        var ft;
        var EditGroupArrayMember = [];
        var adminAllGroupArray = [];
        var customerGroupArray = [];
        var photo_split;
        var countVal = 0;
        var multipleEventArrayAdmin = [];
        var page = 0;
        var totalListView = 0;
        var dataReceived = 0;
        
        var init = function() {
        }
        
        var mapLocationShow;
        var eventDetailShow = function(e) {
            eventPid = e.data.id;
            mapLocationShow = e.data.location;
            app.ADMIN_IFRAME_OPEN = 0;
            multipleEventArrayAdmin.push({
                                             id: e.data.id,
                                             add_date: e.data.add_date,
                                             event_date: e.data.event_date,
                                             event_show_day : e.data.event_show_day,
                                             event_below_day : e.data.event_below_day,
                                             event_desc: e.data.event_desc,
                                             location:e.data.location,
                                             event_image : e.data.event_image,
                                             event_name: e.data.event_name,
                                             upload_type: e.data.upload_type,
                                             event_time: e.data.event_time,                                                                                  										  
                                             mod_date: e.data.mod_date,
                                             org_id: e.data.org_id
                                         });

            setTimeout(function() {
                app.mobileApp.navigate('#adminEventCalendarDetail'); 
            }, 100);
            
            app.analyticsService.viewModel.trackFeature("User navigate to Event Detail in Admin");            
        }
        
        var iFrameLocUrl = function() { 
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {                                                                     
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                  
                }else {              
                    app.showAlert(app.INTERNET_ERROR , 'Offline');                   
                }              
            }else { 
                app.ADMIN_IFRAME_OPEN = 1;
                app.showAppLoader();
                var mapUrl = app.GEO_MAP_API + mapLocationShow;
                document.getElementById("setIFrame").innerHTML = '<iframe id="mapIframe" frameborder="0" style="border:0;margin-top:-150px;" src="' + mapUrl + '" onload="this.width=screen.width-20;this.height=screen.height"></iframe>';             
            }    
        }
        
        var detailShow = function() {
            $("#popover-eventAction").removeClass("km-widget km-popup");
            $('.km-popup-arrow').addClass("removeArrow");
            
            $(".km-scroll-container").css("-webkit-transform", "");
            
            var dateShow = multipleEventArrayAdmin[0].event_date;
                        
            $("#detailEventData").html("Event On " + dateShow);
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: multipleEventArrayAdmin
                                                                       });           
                
            $("#eventCalendarListAdmin").kendoMobileListView({
                                                                 template: kendo.template($("#calendarTemplateAdmin").html()),    		
                                                                 dataSource: organisationListDataSource
                                                             });
                
            $('#eventCalendarListAdmin').data('kendoMobileListView').refresh();
        }
        
        var addEventshow = function() {
            app.showAppLoader(true);
            device_type = localStorage.getItem("DEVICE_TYPE");

            $("#addEventName").val('');
            $("#addEventDesc").val('');
            $("#placeValue").val('');
            groupDataShow = [];
            
            $("#attachedImgEvent").hide();
            $("#attachedVidEvent").hide();  
            
            //$("#adddatePickerEvent").removeAttr('disabled');
            //$("#adddateTimePickerEvent").removeAttr('disabled');
            $('.km-popup-arrow').addClass("removeArrow");

            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.src = '';
            //$("#adddatePickerEvent").removeClass("k-input");
            //$("#adddateTimePickerEvent").removeClass("k-input");            

            $('#addEventDesc').css('height', '40px');

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
            
            $("#groupInAddEvent option:selected").removeAttr("selected");
            $('#groupInAddEvent').empty();
            
            /*var currentDate = app.getPresentDate();            
            disabledDaysBefore = [
                +new Date(currentDate)
            ];*/
            
            document.getElementById('adddatePickerEvent').valueAsDate = new Date();
            
            /*$("#adddatePickerEvent").kendoDatePicker({
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
                                                             if (new Date(value) < new Date(currentDate)) {                   
                                                                 var todayDate = new Date();
                                                                 $('#adddatePickerEvent').data("kendoDatePicker").value(todayDate);                                       
                                                             }    
                                                         }
                                                     }).data("kendoDatePicker");

            $("#adddateTimePickerEvent").kendoTimePicker({
                                                             value:"10:00 AM",
                                                             interval: 15,
                                                             format: "h:mm tt",
                                                             timeFormat: "HH:mm", 
                
                                                             change: function() {
                                                             }                
                                                         });
            
            
            $('#adddatePickerEvent').attr('disabled', 'disabled');
            $('#adddateTimePickerEvent').attr('disabled', 'disabled');
            */
            
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
                                                                                 app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                             }                                                                             
                                                                         },       
                                                                         sort: { field: 'add', dir: 'desc' }    	     
                                                                     });
            
            comboGroupListDataSource.fetch(function() {                                                       
                groupDataShow = [];
                var data = this.data();                
                                            
                if (data[0]['status'][0].Msg==='No Group list') {
                    groupDataShow = [];
                    app.noGroupAvailable();
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    goToEventListPage();
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
                $('#groupInAddEvent').append($('<option/>', { 
                                                   value: value.pid,
                                                   text : value.group_name 
                                               }));
            });
        }
        
        var eventNameEdit;
        var eventDescEdit;
        var eventDateEdit;
        var eventTimeEdit;
        var eventImageEdit;
        var eventPid;
        var eventLocEdit;
        var eventUploadType;
        
        var editEvent = function(e) {
            app.analyticsService.viewModel.trackFeature("User navigate to Edit Event Detail in Admin");            
            app.mobileApp.navigate('#adminEditEventCalendar');
        }
        
        var deleteEvent = function(e) {
            navigator.notification.confirm(app.DELETE_CONFIRM, function (confirmed) {           
                if (confirmed === true || confirmed === 1) {
                    organisationID = localStorage.getItem("orgSelectAdmin");            
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
                                                                                   app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                               }
                                                                           }               
          
                                                                       });  
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            if (addGroupData.status[0].Msg==='Deleted Successfully') {         
                                app.mobileApp.navigate("#adminEventList");
                        
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.EVENT_DELETED_MSG);   
                                }else {
                                    app.showAlert(app.EVENT_DELETED_MSG , "Notification");  
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
                }else {
                }
            }, app.APP_NAME, ['Yes', 'No']);
        }

        var upload_type_edit;        
        var editEventshow = function() {              
            eventDataToSend = '';
            $(".km-scroll-container").css("-webkit-transform", "");
            $('.km-popup-arrow').addClass("removeArrow");
            $('#editEventDesc').css('height', '80px');
            var txt = $('#editEventDesc'),
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
            
            document.getElementById("imgDownloaderEvent").innerHTML = "";
            
            pbEvent = new ProgressBar.Circle('#imgDownloaderEvent', {
                                                 color: '#e7613e',
                                                 strokeWidth: 8,
                                                 fill: '#f3f3f3'
                                             });
            
            $("#groupInEditEvent option:selected").removeAttr("selected");
            $('#groupInEditEvent').empty();
            
            app.showAppLoader(true);
            $("#wrapp_content").hide();
            
            /*$("#editdatePicker").removeAttr('disabled');
            $("#editdateTimePicker").removeAttr('disabled');            
            $("#editdatePicker").removeClass("k-input");
            $("#editdateTimePicker").removeClass("k-input");*/            
                                                
            var org_id = localStorage.getItem("orgSelectAdmin");
            
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
                        return [data];
                    }
                },
                                                                       error: function (e) {
                                                                           app.hideAppLoader();
                                                                           $("#adminEditCustomer").hide();            
                                                                           $("#editOrgMemberContent").show();
                                                                           
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
                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                           }
                                                                       }               
                                                                   });  
	            
            dataSourceMemberDetail.fetch(function() {
                var data = this.data();                        

                if (data[0]['status'][0].Msg==='Success') {
                    EditGroupArrayMember = [];
                    adminAllGroupArray = [];
                    customerGroupArray = [];
                        
                    eventNameEdit = data[0]['status'][0].eventDetail[0].event_name;
                    eventDescEdit = data[0]['status'][0].eventDetail[0].event_desc;
                    eventDateEdit = data[0]['status'][0].eventDetail[0].event_date;
                    eventTimeEdit = data[0]['status'][0].eventDetail[0].event_time;
                    eventImageEdit = data[0]['status'][0].eventDetail[0].event_image; 
                    eventUploadType = data[0]['status'][0].eventDetail[0].upload_type; 
                    eventLocEdit = data[0]['status'][0].eventDetail[0].location;
                    eventPid = data[0]['status'][0].eventDetail[0].id;
                                                
                    /*var values = eventDateEdit.split('-');            
                    var year = values[0]; // globle variable            
                    var month = values[1];            
                    var day = values[2];          
                    
                    eventDateEdit = day + "/" + month + "/" + year;
                    console.log(eventDateEdit);*/                

                    document.getElementById('editdatePicker').value = eventDateEdit;
                    document.getElementById('editdateTimePicker').value = eventTimeEdit;
                    

                    $("#editEventName").val(app.htmlDecode(eventNameEdit)); 
                    $("#editEventDesc").html(app.htmlDecode(eventDescEdit));
                    $("#editPlaceValue").val(eventLocEdit);
                                    
                    if (eventImageEdit!==undefined && eventImageEdit!=="undefined" && eventImageEdit!=='' && eventUploadType==="image") {
                        var largeImage = document.getElementById('attachedImgEditEvent');
                        largeImage.style.display = 'block';
                        largeImage.src = eventImageEdit;
                        upload_type_edit = "image";                
                
                        var largeImageVid = document.getElementById('attachedEditVidEvent');
                        largeImageVid.style.display = 'none';
                        largeImageVid.src = '';
                    }else if (eventImageEdit!==undefined && eventImageEdit!=="undefined" && eventImageEdit!=='' && eventUploadType==="video") {
                        var largeImageVid = document.getElementById('attachedEditVidEvent');
                        largeImageVid.style.display = 'block';
                        largeImageVid.src = "styles/images/videoPlayIcon.png";
                        upload_type_edit = "video";
                
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
                    }
                        
                    /*var currentDate = app.getPresentDate();            
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
                                                             }
                                                         });
                         
                    $("#editdateTimePicker").kendoTimePicker({
                                                                 value: eventTimeEdit,
                                                                 interval: 15,
                                                                 format: "h:mm tt",
                                                                 timeFormat: "HH:mm",                
                                                                 change: function() {
                                                                 }                
                                                             });            
            
                    $('#editdatePicker').attr('disabled', 'disabled');
                    $('#editdateTimePicker').attr('disabled', 'disabled');*/
                                                          
                    if (data[0]['status'][0].AdminGroup!==false) {  
                        if (data[0]['status'][0].AdminGroup.length!==0 && data[0]['status'][0].AdminGroup.length!==undefined) {
                            adminAllGroupArray = [];
                            for (var i = 0 ; i < data[0]['status'][0].AdminGroup.length;i++) {
                                adminAllGroupArray.push({
                                                            group_name: data[0]['status'][0].AdminGroup[i].group_name,
                                                            pid: data[0]['status'][0].AdminGroup[i].pid
                                                        });
                            }
                        }
                        
                        if (data[0]['status'][0].eventGroup !== null) {  
                            if (data[0]['status'][0].eventGroup.length!==0 && data[0]['status'][0].eventGroup.length!==undefined) {
                                customerGroupArray = [];
                                for (var i = 0 ; i < data[0]['status'][0].eventGroup.length;i++) {
                                    customerGroupArray.push({
                                                                pid: data[0]['status'][0].eventGroup[i].group_id
                                                            });
                                }
                            }
                        
                            var allGroupLength = adminAllGroupArray.length;
                            var allCustomerLength = customerGroupArray.length;                        
                        
                            for (var i = 0;i < allGroupLength;i++) {       
                                adminAllGroupArray[i].pid = parseInt(adminAllGroupArray[i].pid);
                                var check = ''; 
                            
                                for (var j = 0;j < allCustomerLength;j++) {
                                    if (parseInt(adminAllGroupArray[i].pid)===parseInt(customerGroupArray[j].pid)) {              
                                        check = 'selected';
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
                        }else {
                            var allGroupLength = adminAllGroupArray.length;                         
                            for (var i = 0;i < allGroupLength;i++) {       
                                EditGroupArrayMember.push({
                                                              group_name: adminAllGroupArray[i].group_name,
                                                              pid: adminAllGroupArray[i].pid,
                                                              check:''
                                                          });
                            }
                        }    
                          
                        $.each(EditGroupArrayMember, function (index, value) {                            
                            if (value.check==='') {
                                $('#groupInEditEvent').append($('<option/>', { 
                                                                    value: value.pid,
                                                                    text : value.group_name                                   
                                                                }));   
                            }else {
                                $('#groupInEditEvent').append($('<option/>', { 
                                                                    value: value.pid,
                                                                    text : value.group_name ,
                                                                    selected:"selected"
                                                                }));   
                            }                                
                        });
                    }else {
                        app.noGroupAvailable();
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
                $("#wrapp_content").show();
            });
        }
                      
        var addNewEventFunction = function() {
            var event_name = $("#addEventName").val();     
            var event_description = $("#addEventDesc").val();
            var event_Date = $("#adddatePickerEvent").val();
            var event_Time = $("#adddateTimePickerEvent").val();
            //console.log(event_Date);
            //console.log(event_Time);
            var event_Location = $("#placeValue").val();
            var currentDate = app.newGetCurrentDateTime();
            var values = currentDate.split('||');            
            var compareDate = values[0];
            var compareTime = values[1];

            //console.log(compareDate);
            //console.log(compareTime);
            
            /*var compTimeVal = compareTime.split(' ');
            var compTime = compTimeVal[0];
            console.log(compTime);
            var compAP = compTimeVal[1];
            console.log(compAP);
            
            var eventTimeVal = event_Time.split(' ');
            var evtTime = eventTimeVal[0];
            var evtAP = eventTimeVal[1];
            
            var compVal = compTime.split(':'); 
            var cPart1 = compVal[0];
            var cPart2 = compVal[1];
            if (compAP==='PM') {                
                if (cPart1!=='12') {
                    cPart1 = parseInt(cPart1) + 12 ;
                }    
            }else if (compAP==='AM') {
                if (cPart1==='12') {
                    cPart1 = parseInt(cPart1) - 12 ;
                }
            }
            
            var evtVal = evtTime.split(':'); 
            var ePart1 = evtVal[0];
            var ePart2 = evtVal[1];            
            if (evtAP==='PM') {
                if (ePart1!=='12') {
                    ePart1 = parseInt(ePart1) + 12 ;
                }    
            }else if (evtAP==='AM') {
                if (ePart1==='12') {
                    ePart1 = parseInt(ePart1) - 12 ;
                }
            }*/

            var group = [];
            
            $('#groupInAddEvent :selected').each(function(i, selected) { 
                group[i] = $(selected).val(); 
            });
            
            group = String(group);
            
            if (event_name === "Enter New Event Name" || event_name === "") {
                app.showAlert("Please enter Event Name.", app.APP_NAME);
            }else if (event_description === "Write Event description here (Optional) ?" || event_description === "") {
                app.showAlert("Please enter Event Description.", app.APP_NAME);
            }else if (group.length===0 || group.length==='0') {
                app.showAlert("Please select Group.", app.APP_NAME);
            }else if ((event_Date === "")) {
                app.showAlert("Please enter Event date.", app.APP_NAME);
            }else if ((event_Time ==="")) {
                app.showAlert("Please enter Event time.", app.APP_NAME);
            }else if ((event_Date < compareDate)) {
                app.showAlert("Event Can not be add in back date.", app.APP_NAME);    
            }else if ((event_Date===compareDate) && (event_Time < compareTime)) {
                app.showAlert("Event Can not be add in back time.", app.APP_NAME);                
            }else {
                var values = event_Date.split('-');            
                var year = values[0]; // globle variable            
                var month = values[1];            
                var day = values[2];
             
                /*if (day < 10) {
                    day = "0" + day;
                }*/
            
                var valueTime = event_Time.split(':');            
                var Hour = valueTime[0]; // globle variable            
                var Min = valueTime[1];        
            
                /*var valueTimeMin = Min.split(' '); 
                var minute = valueTimeMin[0];
                var AmPm = valueTimeMin[1];
                if (AmPm==='PM') {
                    if (Hour!=='12' && Hour!==12) {
                        Hour = parseInt(Hour) + 12;
                    }
                }*/
            
                var eventTimeSend = Hour + ":" + Min + ":00";
                
                event_Date = year + "-" + month + "-" + day;
                var actionval = "Add";
                var vidFmAndroid = 0;
                
                if (eventDataToSend!==undefined && eventDataToSend!=="undefined" && eventDataToSend!=='') { 
                    pbEvent.animate(0);
                    countVal = 0;

                    if ((eventDataToSend.substring(0, 21)==="content://com.android") && (upload_type==="image")) {
                        photo_split = eventDataToSend.split("%3A");
                        eventDataToSend = "content://media/external/images/media/" + photo_split[1];
                        vidFmAndroid = 1;  
                    }else if ((eventDataToSend.substring(0, 21)==="content://com.android") && (upload_type==="video")) {
                        photo_split = eventDataToSend.split("%3A");
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
                    $("#event-upload-file").data("kendoMobileModalView").open();
                    
                    if (upload_type==="image" && vidFmAndroid===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.jpg';
                        }                
                    }else if (upload_type==="video" && vidFmAndroid===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.mp4';
                        }
                    }
                    
                    var params = new Object();
                    params.org_id = organisationID;  //you can send additional info with the file
                    params.txtEventName = event_name;
                    params.txtEventDesc = event_description;
                    params.txtEventDate = event_Date;                            
                    params.eventStartTime = eventTimeSend;
                    params.action = actionval;
                    params.upload_type = upload_type;
                    params.cmbGroup = group;
                    params.location = event_Location;
                                               
                    var options = new FileUploadOptions();
                    options.fileKey = "event_image";
                    options.fileName = filename;
              
                    options.mimeType = mimeTypeVal;
                    options.chunkedMode = false;
                    options.params = params;
                    options.headers = {
                        Connection: "close"
                    }

                    ft = new FileTransfer();
                    
                    ft.onprogress = function(progressEvent) {
                        if (progressEvent.lengthComputable) {
                            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                            countVal = perc;
                            var j = countVal / 100;                        
                            pbEvent.animate(j, function() {
                                pbEvent.animate(j);
                            });
                        }else {
                            pbEvent.animate(0);
                            countVal = 0;
                        }
                    };                                     
                    ft.upload(eventDataToSend, app.serverUrl() + 'event/Add', win, fail, options , true);
                }else {
                    var jsonDataSaveGroup = {"org_id":organisationID,"txtEventName":event_name,"txtEventDesc":event_description,"txtEventDate":event_Date,"eventStartTime":eventTimeSend,"action":actionval,"cmbGroup":group ,"location":event_Location}
            
                    app.showAppLoader(true);
                    
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
                                                                                   app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                               }
                                                                           }               
          
                                                                       });  
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            if (addGroupData.status[0].Msg==='Event added successfully') {         
                                app.mobileApp.navigate("#adminEventList");                                
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.EVENT_ADDED_MSG);  
                                }else {
                                    app.showAlert(app.EVENT_ADDED_MSG, "Notification");  
                                }    
                                app.hideAppLoader();
                            }else if (addGroupData.status[0].Msg==="You don't have access") {                                    
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }
                    
                                goToEventListPage();
                            }else {
                                app.hideAppLoader();
                                app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                            }
                        });
                    });
                }   
            }      
        }
         
        var transferFileAbort = function() {
            if (countVal < 90) {
                pbEvent.animate(0); 
                app.hideAppLoader();
                ft.abort(); 
                $("#event-upload-file").data("kendoMobileModalView").close();                        
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.CANNOT_CANCEL);  
                }else {
                    app.showAlert(app.CANNOT_CANCEL , 'Notification');  
                } 
            }    
        }
        
        function win(r) {
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom(app.EVENT_ADDED_MSG);  
            }else {
                app.showAlert(app.EVENT_ADDED_MSG , 'Notification');  
            }
            
            pbEvent.animate(0);  
            countVal = 0;

            $("#event-upload-file").data("kendoMobileModalView").close();
              
            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.src = '';            
            
            var largevid = document.getElementById('attachedVidEvent');
            largevid.src = '';
            
            $("#removeEventAttachment").hide();

            app.hideAppLoader();

            app.mobileApp.navigate("#adminEventList");
        }
         
        function fail(error) {
            pbEvent.animate(0);
            countVal = 0;

            $("#event-upload-file").data("kendoMobileModalView").close();
             
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.NEWS_EVENT_FAIL);  
                }else {
                    app.showAlert(app.NEWS_EVENT_FAIL , 'Notification');  
                }
            }
            
            app.hideAppLoader();
            
            app.analyticsService.viewModel.trackFeature("Event Add or Update fail" + JSON.stringify(error));            
        }

        var attachedImgFilename;
        var imgFile;
        var imgNotiFi;

        var imageDownlaodClick = function(e) {
            var data = e.button.data();           
            imgFile = data.imgpath;  
            imgNotiFi = data.notiid;
            attachedImgFilename = imgFile.replace(/^.*[\\\/]/, '');
            attachedImgFilename = attachedImgFilename + '.jpg';
            var vidPathData = app.getfbValue();                    
            var fp = vidPathData + app.SD_NAME + "/" + 'Zaffio_event_img_' + attachedImgFilename;             
            window.resolveLocalFileSystemURL(fp, imgPathExist, imgPathNotExist);                                    
        }
                
        var imgPathExist = function() {                    
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + app.SD_NAME + "/" + 'Zaffio_event_img_' + attachedImgFilename;   
            
            if (device_type==="AP") {
                window.open(fp, '_blank', 'location=no,enableViewportScale=yes,closebuttoncaption=Close');
            }else {
                window.plugins.fileOpener.open(fp);
            }
        }
        
        var imgPathNotExist = function() {
            $("#img_Adm_Div_Event_" + imgNotiFi).show();
            
            var attachedImg = imgFile;                        
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + app.SD_NAME + "/" + 'Zaffio_event_img_' + attachedImgFilename;

            var fileTransfer = new FileTransfer();              
            fileTransfer.download(attachedImg, fp, 
                                  function(entry) {
                                      $("#img_Adm_Div_Event_" + imgNotiFi).hide();

                                      if (device_type==="AP") {
                                          window.open(fp, "_blank", 'location=no,enableViewportScale=yes,closebuttoncaption=Close');
                                      }else {
                                          window.plugins.fileOpener.open(fp);
                                      }
                                  },
    
                                  function(error) {
                                      $("#img_Adm_Div_Event_" + imgNotiFi).hide();
                                  }
                );                
        }

        var saveEditEventData = function() {
            var event_name = $("#editEventName").val();     
            var event_description = $("#editEventDesc").val();
            var event_Date = $("#editdatePicker").val();
            var event_Time = $("#editdateTimePicker").val();
            var edit_Location = $("#editPlaceValue").val();
            
            var groupEdit = [];		    
            
            $('#groupInEditEvent :selected').each(function(i, selected) { 
                groupEdit[i] = $(selected).val(); 
            });
                         
            groupEdit = String(groupEdit);             
            
            if (event_name === "Enter New Event Name" || event_name === "") {
                app.showAlert("Please enter Event Name.", app.APP_NAME);
            }else if (event_description === "Write Event description here (Optional) ?" || event_description === "") {
                app.showAlert("Please enter Event Description.", app.APP_NAME);
            }else if (groupEdit.length===0 || groupEdit.length==='0') {
                app.showAlert("Please select Group.", app.APP_NAME);
            }else if ((event_Date === "")) {
                app.showAlert("Please enter Event date.", app.APP_NAME);
            }else if ((event_Time ==="")) {
                app.showAlert("Please enter Event time.", app.APP_NAME);
            }else {    
                var values = event_Date.split('-');            
                var year = values[0]; // globle variable            
                var month = values[1];            
                var day = values[2];
             
                /*if (day < 10) {
                    day = "0" + day;
                }*/
            
                event_Date = year + "-" + month + "-" + day;
            
                var actionval = "Edit";
                                               
                var vidFmAndroidEdit = 0;
                                          
                if (eventDataToSend!==undefined && eventDataToSend!=="undefined" && eventDataToSend!=='') { 
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
                   
                    pbEvent.animate(0);
                    countVal = 0;

                    $("#event-upload-file").data("kendoMobileModalView").open();
                    
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
                    params.location = edit_Location;
       
                    var options = new FileUploadOptions();
                    options.fileKey = "event_image";
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
                            countVal = perc;
                            var j = countVal / 100;                        
                            pbEvent.animate(j, function() {
                                pbEvent.animate(j);
                            });
                        }else {
                            pbEvent.animate(0);
                            countVal = 0;
                        }
                    };

                    ft.upload(eventDataToSend, app.serverUrl() + 'event/edit', winEdit, fail, options , true);
                }else {
                    app.showAppLoader(true);
                    
                    var jsonDataSaveGroup = {"org_id":organisationID ,"txtEventName":event_name,"txtEventDesc":event_description,"txtEventDate":event_Date,"eventStartTime":event_Time,"pid":eventPid,"action":actionval,"cmbGroup":groupEdit,"upload_type":upload_type_edit,"location":edit_Location}
            
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
                                                                                   app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                               }
                                                                           }               
          
                                                                       });  
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            if (addGroupData.status[0].Msg==='Event updated successfully') {         
                                app.mobileApp.navigate("#adminEventList");
                                app.hideAppLoader();

                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.EVENT_UPDATED_MSG);   
                                }else {
                                    app.showAlert(app.EVENT_UPDATED_MSG, "Notification"); 
                                }
                            }else if (addGroupData.status[0].Msg==="You don't have access") {                                    
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }
                    
                                goToCalendarPageDetail();
                            }else {
                                app.hideAppLoader();
                                app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                            }
                        });
                    });
                }   
            }      
        }
        
        function winEdit(r) {
            app.hideAppLoader();

            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom(app.EVENT_UPDATED_MSG);  
            }else {
                app.showAlert(app.EVENT_UPDATED_MSG , 'Notification');  
            }
         
            app.mobileApp.navigate("#adminEventList");
        }
        
        var goToManageOrgPage = function() {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');
        }
        
        var goToCalendarPage = function() {
            app.mobileApp.navigate('#adminEventCalendar');
        }
        
        var goToCalendarPageDetail = function() {
            app.mobileApp.navigate('#adminEventCalendarDetail');
        }
        
        var addNewEvent = function() {
            app.mobileApp.navigate('#adminAddEventCalendar');
        }
        
        var upcommingEventList = function() {
            app.mobileApp.navigate('#adminEventList');
        }
        
        var goToAddEventPage = function() {
            app.mobileApp.navigate('#adminEventCalendarDetail');
        }
        
        var eventListShow = function() {
            app.ADMIN_IFRAME_OPEN = 0;
            $("#showMoreEventBtnEvent").hide();
            app.showAppLoader();
            $(".km-scroll-container").css("-webkit-transform", "");            
                        
            countVal = 0;
            eventDataToSend = '';
            upload_type = '';
            
            page = 0;
            dataReceived = 0;
            totalListView = 0;
            multipleEventArrayAdmin = [];
            groupAllEvent = [];

            organisationID = localStorage.getItem("orgSelectAdmin");

            document.getElementById("imgDownloaderEvent").innerHTML = "";
            
            pbEvent = new ProgressBar.Circle('#imgDownloaderEvent', {
                                                 color: '#e7613e',
                                                 strokeWidth: 8,
                                                 fill: '#f3f3f3'
                                             });
             
            getLiveData();
        }
        
        var getLiveData = function() {
            var jsonDataLogin = {"org_id":organisationID,"page":page}
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
                        return [data];
                    }
                },
                                                                error: function (e) {                                                                    
                                                                    app.hideAppLoader();
                                                                    $("#eventCalendarAllList").show();

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
                                                                        app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                    }
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var data = this.data(); 
                var loginDataView = dataSourceLogin.data();               
                               
                if (data[0]['status'][0].Msg==='No Event list') {
                    groupAllEvent = [];
                        
                    groupAllEvent.push({
                                           id:0 ,
                                           add_date:'',
                                           event_date:'',
                                           event_desc: 'This Organization has no event.',                                                                                 										  
                                           event_name: 'No Event', 
                                           event_image:'',
                                           event_time: '',
                                           location:'',
                                           mod_date: '',                                     
                                           org_id: ''
                                       });
                }else if (data[0]['status'][0].Msg==='Session Expired') {
                    app.LogoutFromAdmin();                         
                }else if (data[0]['status'][0].Msg==="You don't have access") {                                                           
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }                       
                    goToManageOrgPage();
                }else if (data[0]['status'][0].Msg==='Success') {
                    totalListView = data[0]['status'][0].Total;
                    
                    if (data[0].status[0].eventData.length!==0) {
                        var eventListLength = data[0].status[0].eventData.length;
                        var preDateVal = 0 ;                            
                        for (var i = 0 ; i < eventListLength ;i++) {         
                            var eventDateString = data[0].status[0].eventData[i].event_date;
                            var eventTimeString = data[0].status[0].eventData[i].event_time;
                            var eventDate = app.formatDate(eventDateString);
                            var eventTime = app.formatTime(eventTimeString);
                            
                            var belowData = app.getMonthData(eventDateString);
                                
                            var eventDaya = data[0].status[0].eventData[i].event_date
                            var values = eventDaya.split('-');
                            var year = values[0]; // globle variable
                            var month = values[1];
                            var day = values[2];
                                                                                 
                            if (day < 10) {
                                day = day.replace(/^0+/, '');                                     
                            }
                            var saveData = month + "/" + day + "/" + year;
                            var locationToShow = data[0].status[0].eventData[i].location;
                            if (locationToShow==="0" || locationToShow===0) {
                                locationToShow = '';
                            }
                            
                            groupAllEvent.push({
                                                   id: data[0].status[0].eventData[i].id,
                                                   add_date: data[0].status[0].eventData[i].add_date,
                                                   event_date:saveData,
                                                   event_show_day:day,
                                                   preDateVal:preDateVal,
                                                   event_date_To_Show:eventDate,
                                                   location:locationToShow,
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
        }
        
        var showInListView = function() {
            app.hideAppLoader();
            $("#eventCalendarAllList").show();
            
            //$("#adddatePickerEvent").removeAttr('disabled');
            //$("#adddateTimePickerEvent").removeAttr('disabled');
            $(".km-scroll-container").css("-webkit-transform", "");
             
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupAllEvent
                                                                       });           
                
            $("#eventCalendarAllList").kendoMobileListView({
                                                               template: kendo.template($("#calendarAdminEventListTemplate").html()),    		
                                                               dataSource: organisationListDataSource
                                                           });
                
            $('#eventCalendarAllList').data('kendoMobileListView').refresh();
            if ((totalListView > 10) && (totalListView >= dataReceived + 10)) {
                $("#showMoreEventBtnEvent").show();
            }else { 
                $("#showMoreEventBtnEvent").hide();
            }
        }
        
        var getTakePhoto = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            correctOrientation: true
                                        });
        };
        
        var getPhotoVal = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };
        
        var getVideoVal = function() {            
            navigator.camera.getPicture(onVideoURISuccessData, onFail, { 
                                            quality: 50,
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
            
            var videoAttached = document.getElementById('attachedVidEvent');
            videoAttached.style.display = 'block';
            
            videoAttached.src = 'styles/images/videoPlayIcon.png';
            eventDataToSend = videoURI;    
            upload_type = "video";
            
            $("#removeEventAttachment").show(); 
            $("#attachedVidEvent").show();
        }
        
        function onPhotoURISuccessData(imageURI) {
            var videoAttached = document.getElementById('attachedVidEvent');
            videoAttached.src = '';
            
            $("#removeEventAttachment").hide(); 
            $("#attachedVidEvent").hide();
            
            var largeImage = document.getElementById('attachedImgEvent');
            largeImage.style.display = 'block';
               
            largeImage.src = imageURI;
               
            eventDataToSend = imageURI;              
            upload_type = "image";

            $("#removeEventAttachment").show(); 
            $("#attachedImgEvent").show();
        }
         
        function onFail(message) {
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
            eventDataToSend = '';             
        }
        
        var goToEventListPage = function() {
            app.mobileApp.navigate('#adminEventList');
        }
                
        var getTakePhotoEdit = function() {
            navigator.camera.getPicture(onPhotoURISuccessDataEdit, onFailEdit, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            correctOrientation: true
                                        });
        };
        
        var getPhotoValEdit = function() {
            navigator.camera.getPicture(onPhotoURISuccessDataEdit, onFailEdit, { 
                                            quality: 50,
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

            var largeImage = document.getElementById('attachedImgEditEvent');
            largeImage.style.display = 'block';
            largeImage.src = imageURI;
            upload_type_edit = "image";   

            eventDataToSend = imageURI;  
            
            $("#attachedImgEditEvent").show();
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
                
        var open = 0;
        var clickToSelectGroup = function() {
            if (open===0) {
                $("#groupInAddEvent").hide().slideDown({duration: 500});
                open = 1;
            }else {
                $("#groupInAddEvent").slideUp("slow");
                open = 0
            }
        }
                
        var selectAllCheckBox = function() {
            if ($("#selectAllEvent").prop('checked')===true) { 
                $('.largerCheckbox').prop('checked', false);
                document.getElementById("selectAllEvent").checked = false;
            }else {
                $('.largerCheckbox').prop('checked', true); 
                document.getElementById("selectAllEvent").checked = true;
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
                dataReceived = dataReceived + 10;
                getLiveData();            
            }
        }
         
        var checkClick = function() {
            if ($("#selectAllEvent").prop('checked')===true) {
                $('.largerCheckboxSelectAll').prop('checked', false);
                document.getElementById("selectAllEvent").checked = false;
            }
        }
        
        /*var onBackClsPicker = function(dataForm) {                             
            if (dataForm==='add') {
                //$("#adddatePickerEvent").data("kendoDatePicker").close();
                //$("#adddateTimePickerEvent").data("kendoTimePicker").close();
            }else {
                //$("#editdatePicker").data("kendoDatePicker").close();
                //$("#editdateTimePicker").data("kendoTimePicker").close();
            }
        }*/
        
        var closeParentPopover = function() {
            var popover = e.sender.element.closest('[data-role=popover]').data('kendoMobilePopOver');
            popover.close();
        }
        
        var placeArray = [];
        var getlocationGoogle = function(txtVal) {
            var txtBxVal = txtVal.value;
            if (txtBxVal.length!==0) {
                var dataSourceLogin = new kendo.data.DataSource({
                                                                    transport: {
                        read: {
                                                                                url: app.GEO_PLACE_API + txtBxVal,
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
                                                                        console.log(e);
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
                                                                            app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                        }
                                                                    }                                    
                                                                });  
	            
                dataSourceLogin.fetch(function() {                
                    var data = this.data();   
                    placeArray = [];
                    if (data[0]['status']==='ZERO_RESULTS') {
                        placeArray.push({                                          
                                            placeName: 'Just use "' + txtBxVal + '"',
                                            valueGot:'NO'  
                                        });
                    }else if (data[0]['status']==='OK') {
                        var eventListLength = data[0]['predictions'].length;
                            
                        for (var i = 0 ; i < eventListLength ;i++) {
                            placeArray.push({
                                                placeName: data[0]['predictions'][i].description,
                                                valueGot:'YES'
                                            });
                        }
                    }else{
                           placeArray.push({                                          
                                            placeName: 'Just use "' + txtBxVal + '"',
                                            valueGot:'NO'  
                                        }); 
                    }  
                    showPlaceInListView();  
                });
            }            
        }
        
        function showPlaceInListView() {
            $("#location-listview").kendoMobileListView({
                                                            dataSource:placeArray,
                                                            template: kendo.template($("#placeTemplate").html())
                                                        });

            $('#location-listview').data('kendoMobileListView').refresh();     
        }
                
        var placeArrayEdit = [];
        var getlocationGoogleEdit = function(txtVal) {
            var txtBxVal = txtVal.value;
            if (txtBxVal.length!==0) {
                var dataSourceLogin = new kendo.data.DataSource({
                                                                    transport: {
                        read: {
                                                                                url: app.GEO_PLACE_API + txtBxVal,
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
                                                                            app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                        }
                                                                    }                                    
                                                                });  
	            
                dataSourceLogin.fetch(function() {                
                    var data = this.data();   
                    placeArrayEdit = [];
                    if (data[0]['status']==='ZERO_RESULTS') {
                        placeArrayEdit.push({                                          
                                                placeName: 'Just use "' + txtBxVal + '"',
                                                valueGot:'NO'  
                                            });
                    }else if (data[0]['status']==='OK') {
                        var eventListLength = data[0]['predictions'].length;
                            
                        for (var i = 0 ; i < eventListLength ;i++) {
                            placeArrayEdit.push({
                                                    placeName: data[0]['predictions'][i].description,
                                                    valueGot:'YES'
                                                });
                        }
                    }else{
                        placeArrayEdit.push({                                          
                                                placeName: 'Just use "' + txtBxVal + '"',
                                                valueGot:'NO'  
                                            });
                    }  
                    showPlaceInEditListView();  
                });
            }            
        }
        
        function showPlaceInEditListView() {
            $("#edit-location-listview").kendoMobileListView({
                                                                 dataSource:placeArrayEdit,
                                                                 template: kendo.template($("#editPlaceTemplate").html())
                                                             });

            $('#edit-location-listview').data('kendoMobileListView').refresh();     
        }
        
        var clickOnSelectLOC = function(e) {
            var nameReceiv = e.data.placeName;
            if (e.data.valueGot==='NO') {
                var gotVal = nameReceiv.split('"');
                nameReceiv = gotVal[1];
            }
            $("#placeValue").val(nameReceiv);
            closeModalViewLogin();
        }
        
        var clickOnSelectLOCEdit = function(e) {
            var nameReceiv = e.data.placeName;
            if (e.data.valueGot==='NO') {
                var gotVal = nameReceiv.split('"');
                nameReceiv = gotVal[1];
            }
            $("#editPlaceValue").val(nameReceiv);
            editCloseModalViewLogin();
        }
        
        var closeModalViewLogin = function() {
            $("#modalview-login").kendoMobileModalView("close");
        }
        
        var editCloseModalViewLogin = function() {
            $("#editEventLocation").kendoMobileModalView("close");
        }
        
        var closeLocationMap = function() {
            app.ADMIN_IFRAME_OPEN = 0;
            $("#location_Map").kendoMobileModalView("close");
        }
                      
        return {
            init: init,
            getTakePhoto:getTakePhoto,
            getPhotoVal:getPhotoVal,
            getVideoVal:getVideoVal,
            checkClick:checkClick,
            addEventByAdmin:addEventByAdmin,
            getTakePhotoEdit:getTakePhotoEdit,
            getPhotoValEdit:getPhotoValEdit,
            getVideoValEdit:getVideoValEdit,
            closeLocationMap:closeLocationMap,
            clickOnSelectLOCEdit:clickOnSelectLOCEdit,
            editCloseModalViewLogin:editCloseModalViewLogin,
            clickOnSelectLOC:clickOnSelectLOC,
            closeModalViewLogin:closeModalViewLogin,
            getlocationGoogleEdit:getlocationGoogleEdit,
            getlocationGoogle:getlocationGoogle,
            removeImage:removeImage,
            closeParentPopover:closeParentPopover,
            goToAddEventPage:goToAddEventPage,
            removeImageEdit:removeImageEdit,
            editEvent:editEvent,
            goToEventListPage:goToEventListPage,
            eventListShow:eventListShow,
            getLiveData:getLiveData,
            addNewEvent:addNewEvent,
            //onBackClsPicker:onBackClsPicker,
            deleteEvent:deleteEvent,
            editEventshow:editEventshow,
            goToCalendarPage:goToCalendarPage,
            iFrameLocUrl:iFrameLocUrl,
            showMoreButtonPress:showMoreButtonPress,
            goToManageOrgPage:goToManageOrgPage,
            imageDownlaodClick:imageDownlaodClick,
            addNewEventFunction:addNewEventFunction,
            addEventshow:addEventshow,
            eventDetailShow:eventDetailShow,
            transferFileAbort:transferFileAbort,
            selectAllCheckBox:selectAllCheckBox,
            goToCalendarPageDetail:goToCalendarPageDetail,
            clickToSelectGroup:clickToSelectGroup,
            saveEditEventData:saveEditEventData,
            upcommingEventList:upcommingEventList,
            detailShow:detailShow
        };
    }());
        
    return adminCalendarEventModel;
}());