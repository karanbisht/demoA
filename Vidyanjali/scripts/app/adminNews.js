var app = app || {};

app.adminNews = (function () {
      'use strict';

    var adminNewsEventModel = (function () {
        var organisationID;
        var groupAllEvent = [];
        var tasks = [];
        var newsDataToSend;
        var upload_type;
        var groupDataShow = [];
        var pbNews;
        var disabledDaysBefore=[];
        var ft;
        var photo_split;
        var countVal=0;
        

        var page=0;
        var totalListView=0;
        var dataReceived=0;

        
        var init = function() {

        }
    
        var show = function() {            

            $("#showMoreEventBtnNews").hide();

            $("#adminNewsListLoader").show();
            $("#orgAllNewsList").hide();            
            $(".km-scroll-container").css("-webkit-transform", "");            
            organisationID = localStorage.getItem("orgSelectAdmin");
            
            //$("#removeNewsAttachment").hide(); 
            $("#attachedImgNews").hide();
            $("#attachedVidNews").hide();


            newsDataToSend = '';
            upload_type = '';   

            groupAllEvent = [];


            page=0;
            dataReceived=0;
            totalListView=0;

            pbNews = $("#profileCompletenessNews").kendoProgressBar({
                                                                type: "chunk",
                                                                chunkCount: 100,
                                                                min: 0,
                                                                max: 100,
                                                                value: 0
                                                            }).data("kendoProgressBar");    
            
            getLiveData();
        }
        
        
        var getLiveData = function(){
            
            var jsonDataLogin = {"org_id":organisationID,"page":page}
            
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "news/index",
                                                                            type:"POST",
                                                                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests         
                                                                            data: jsonDataLogin
                                                                        }
                },
                                                                schema: {
                    data: function(data) {	
                        //console.log(data);
                        //console.log(JSON.stringify(data));
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    
                                                                    $("#adminNewsListLoader").hide();
                                                                    $("#orgAllNewsList").show();
                                                                    
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
                //var loginDataView = dataSourceLogin.data();               
                //console.log(loginDataView);
                var data = this.data();   
                               
                if (data[0]['status'][0].Msg==='No News list') {
                    groupAllEvent = [];                          
                    groupAllEvent.push({
                                           id: 0,
                                           add_date: 0,
                                           news_date: 0,
                                           news_desc: 'No News from this Organization',                                                                                 										  
                                           news_name: 'No News',                                                                                  										  
                                           news_time: '', 
                                           news_image:'',
                                           mod_date: '',                                     
                                           org_id: ''
                                       });
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    //app.showAlert(app.SESSION_EXPIRE , 'Notification');
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

                    if (data[0].status[0].newsData.length!==0) {
                        var eventListLength = data[0].status[0].newsData.length;
                            
                        for (var i = 0 ; i < eventListLength ;i++) {
                            var newsDateString = data[0].status[0].newsData[i].news_date;
                            var newsTimeString = data[0].status[0].newsData[i].news_time;
                            var newsDate = app.formatDate(newsDateString);
                            var newsTime = app.formatTime(newsTimeString);
                                 
                            groupAllEvent.push({
                                                   id: data[0].status[0].newsData[i].id,
                                                   add_date: data[0].status[0].newsData[i].add_date,
                                                   news_date: newsDate,
                                                   upload_type:data[0].status[0].newsData[i].upload_type,
                                                   news_desc: data[0].status[0].newsData[i].news_desc,                                                                                 										  
                                                   news_name: data[0].status[0].newsData[i].org_name,
                                                   news_image : data[0].status[0].newsData[i].news_image,
                                                   news_time: newsTime,                                                                                  										  
                                                   mod_date: data[0].status[0].newsData[i].mod_date,                                     
                                                   org_id: data[0].status[0].newsData[i].org_id
                                               });
                        }
                    } 
                }
                showInListView();
            });
        }
        
        /*function showEventInCalendar() {                         
            //console.log(tasks);            
            multipleEventArray = [];

            //class="#= data.dates[+data.date] #"
            
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
        }*/

        //var multipleEventArray = [];
        //var date2;

        /*function selectedDataByUser() {
            //console.log("Change :: " + kendo.toString(this.value(), 'd'));
            var date = kendo.toString(this.value(), 'd'); 
            
            date2 = kendo.toString(this.value(), 'd'); 

            $("#eventDetailDiv").hide();
 
            multipleEventArray = [];
            document.getElementById("eventTitle").innerHTML = "";
             
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
                
                //date=date.trim();//replace(/^"(.*)"$/, '$1');
                //dateToCom=dateToCom.trim();//.replace(/^"(.*)"$/, '$1');
                
                //date=date.replace(/"/g, "");
                //dateToCom = dateToCom.replace(/"/g, "");

                //console.log(JSON.stringify(date));
                //console.log(JSON.stringify(dateToCom));

                //alert(date+"||"+dateToCom);
                
                if (date===dateToCom) {
                    $("#eventDetailDiv").show();
                    $("#eventDate").html(date);
                    
                    document.getElementById("eventTitle").innerHTML += '<ul><li style="color:rgb(53,152,219);">' + groupAllEvent[i].event_name + ' at ' + groupAllEvent[i].event_time + '</li></ul>' 
                                                                                        
                    multipleEventArray.push({
                                                id: groupAllEvent[i].id,
                                                add_date: groupAllEvent[i].add_date,
                                                event_date: groupAllEvent[i].event_date,
                                                event_desc: groupAllEvent[i].event_desc,                                                                                 										  
                                                event_name: groupAllEvent[i].event_name,
                                                upload_type :groupAllEvent[i].upload_type,
                                                event_time: groupAllEvent[i].event_time,                                                                                  										  
                                                mod_date: groupAllEvent[i].mod_date,                                     
                                                org_id: groupAllEvent[i].org_id
                                            });

                    //$("#eventTitle").html(groupAllEvent[i].event_name);
                    //$("#eventTime").html(groupAllEvent[i].event_time);
                    
                    checkGotevent = 1;
                    //break;
                }   
            }
            
            if (checkGotevent===0) {
                app.mobileApp.navigate('#adminAddEventCalendar');
            }else {
                $("#eventDetailDiv").show();
            }
        }*/
        
        /*var eventMoreDetailClick = function() {
            app.mobileApp.navigate('#adminEventCalendarDetail');
        }*/
        
        var showInListView = function() {
            $(".km-scroll-container").css("-webkit-transform", "");

            $("#adminNewsListLoader").hide();
            $("#orgAllNewsList").show();
            
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupAllEvent
                                                                       });           
                
            $("#orgAllNewsList").kendoMobileListView({
                                                         template: kendo.template($("#newsListTemplate").html()),    		
                                                         dataSource: organisationListDataSource
                                                     });
                
            $('#orgAllNewsList').data('kendoMobileListView').refresh();
            
            //console.log(totalListView+'||'+dataReceived);
            
            if((totalListView > 10) && (totalListView >=dataReceived+10)){
                //console.log('show');
                $("#showMoreEventBtnNews").show();
            }else{
                $("#showMoreEventBtnNews").hide();
                                //console.log('hide');

            }

        }
        
        var addNewsshow = function() {
                        
            $(".km-scroll-container").css("-webkit-transform", "");           
            groupDataShow = [];
                        
            $("#adddatePickerNews").removeAttr('disabled');           
            $("#adddateTimePickerNews").removeAttr('disabled');

            $("#addNewsName").val('');
            $("#addNewsDesc").val('');
            
            $("#adddatePickerNews").parent().css('width', "160px");
            $("#adddateTimePickerNews").parent().css('width', "160px");
            $("#adddatePickerNews").removeClass("k-input");
            $("#adddateTimePickerNews").removeClass("k-input");            
            
            $('#addNewsDesc').css('height', '40px');

            var txt = $('#addNewsDesc'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
    
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv common');

            //document.getElementById('groupInAddNews').style.display="none";
            
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = '';
            
            
            $("#sendNewsLoader").show();
            
            $('body').append(hiddenDiv);

            txt.on('keyup', function () {
                content = $(this).val();
    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
    
                $(this).css('height', hiddenDiv.height());
            });
            
            $("#groupInAddNews option:selected").removeAttr("selected");
            $('#groupInAddNews').empty();

            //$('#groupInAddNews').find('input[type=checkbox]:checked').removeAttr('checked');

            var currentDate = app.getPresentDate();
            
            disabledDaysBefore = [
                +new Date(currentDate)
            ];

            
            $("#adddatePickerNews").kendoDatePicker({
                                                        value: new Date(),
                                                        dates: disabledDaysBefore,    
                                                        month:{
                    content:'# if (data.date > data.dates) { #' + 
                            '<div class="disabledDay">' +
                            '#= data.value #' +
                            '</div>' +
                            '# } else { #' +
                            '#= data.value #' +
                            '# } #'
                },
                  
                                                        open: function(e) {
                                                            $(".disabledDay").parent().removeClass("k-link")
                                                            $(".disabledDay").parent().removeAttr("href")
                                                        },

                 
                                                        change: function() {
                                                            var value = this.value();
                                                            if(new Date(value) > new Date(currentDate)){                   
                                                                var todayDate = new Date();
                                                                $('#adddatePickerNews').data("kendoDatePicker").value(todayDate);
                                                            }
                                                            
                                                            //console.log(value); 
                                                            /*if(new Date(value) < new Date(currentDate)){                   
                                                            if(!app.checkSimulator()){
                                                            window.plugins.toast.showShortBottom('You Cannot Add Event on Back Date');  
                                                            }else{
                                                            app.showAlert('You Cannot Add Event on Back Date',"Event");  
                                                            }                                
                                                            }*/    
                                                        }
                                                    }).data("kendoDatePicker");
                         
                                 $("#adddateTimePickerNews").kendoTimePicker({
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
            
            $('#adddatePickerNews').attr('disabled', 'disabled');
            $('#adddateTimePickerNews').attr('disabled', 'disabled');

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
                        //console.log(data);
                        return [data];                       
                    }
                },
                                                                         error: function (e) {
                  
                                                                             $("#sendNewsLoader").hide();
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
                                                                             
                                                                         },       
                                                                         sort: { field: 'add', dir: 'desc' }    	     
                                                                     });
            
            comboGroupListDataSource.fetch(function() {                                                       
                groupDataShow = [];
                var data = this.data();                
                                            
                if (data[0]['status'][0].Msg==='No Group list') {
                    groupDataShow=[];
                                           /*groupDataShow.push({
                                               group_name: 'No Group Found , To Add Event First Add Group',
                                               pid:'0'
                                           });*/
                    $("#sendNewsLoader").hide(); 
                    app.noGroupAvailable();
                    
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    goToNewsListPage();
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    //app.showAlert(app.SESSION_EXPIRE , 'Notification');
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
             $("#sendNewsLoader").hide(); 
        };
        
        var showGroupDataInTemplate = function() {
            //alert('hello');
            //console.log(groupDataShow);
            $("#sendNewsLoader").hide();

            
            $(".km-scroll-container").css("-webkit-transform", "");
           
            /*var comboGroupListDataSource = new kendo.data.DataSource({
                                                                         data: groupDataShow
                                                                     });          
            
            $("#groupInAddNews").kendoListView({
                                                   template: kendo.template($("#groupNameShowTemplateNews").html()),    		
                                                   dataSource: comboGroupListDataSource
                                               });
            
            $("#groupInAddNews li:eq(0)").before('<li id="selectAll" class="getGroupCombo"><label><input type="checkbox" class="largerCheckboxSelectAll" value="" onclick="app.adminNews.selectAllCheckBox()"/><span class="groupName_Select">Select All</span></label></li>');*/
            
            $.each(groupDataShow, function (index, value) {
                $('#groupInAddNews').append($('<option/>', { 
                    value: value.pid,
                    text : value.group_name 
                }));
            });
        }
        
        
        var checked=0;
        var selectAllCheckBox = function(){
             //$("#groupInAddNews input[type='checkbox']").prop('checked', $(this).prop('checked'));
            
            /*$('#groupInAddNews input:checked').each(function() {
                group.push($(this).val());
            });*/

             if ($("#selectAll").prop('checked')===true){ 
                    $('.largerCheckbox').prop('checked', false);
                    document.getElementById("selectAll").checked=false;
                }else{
                    $('.largerCheckbox').prop('checked', true); 
                    document.getElementById("selectAll").checked=true;
                }
        }
        
        var newsDescEdit;
        var newsDateEdit;
        var newsTimeEdit;
        var newsImageEdit;
        var newsUploadType;
        var newsPid;
        
        var editNews = function(e) {
            //console.log(e.data.uid);
            //console.log(e.data);
            newsDescEdit = e.data.news_desc;
            newsDateEdit = e.data.news_date;
            newsTimeEdit = e.data.news_time;
            newsImageEdit = e.data.news_image;
            newsUploadType = e.data.upload_type;
            newsPid = e.data.id;

            app.analyticsService.viewModel.trackFeature("User navigate to Edit News in Admin");            

            app.mobileApp.navigate('#adminEditNews');
        }
        
        var deleteNews = function(e) {
            //console.log(e.data.uid);
            //console.log(e.data);
            
       navigator.notification.confirm(app.DELETE_CONFIRM, function (confirmed) {           
        if (confirmed === true || confirmed === 1) {

            organisationID = localStorage.getItem("orgSelectAdmin");
            
            //console.log('orgID=' + organisationID + "pid=" + newsPid)

            var jsonDataSaveGroup = {"orgID":organisationID,"pid":newsPid}
            
            var dataSourceaddGroup = new kendo.data.DataSource({
                                                                   transport: {
                    read: {
                                                                               url: app.serverUrl() + "news/delete/",
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
	            
            dataSourceaddGroup.fetch(function() {
                var loginDataView = dataSourceaddGroup.data();
                $.each(loginDataView, function(i, addGroupData) {
                    //console.log(addGroupData.status[0].Msg);           
                    if (addGroupData.status[0].Msg==='Deleted Successfully') {         
                        app.mobileApp.navigate("#adminOrgNewsList");
                        
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom(app.NEWS_DELETED_MSG);  
                        }else {
                            app.showAlert(app.NEWS_DELETED_MSG, "Notification");  
                        }
                    }else if (addGroupData.status[0].Msg==="You don't have access") {                                           
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }                  
                                goToNewsListPage();
                    }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }
                });
            });
            
           }else {

           }

          }, app.APP_NAME, ['Yes', 'No']);
        }
        
        var adminAllGroupArray = [];
        var customerGroupArray = [];
        var EditGroupArrayMember = [];
        
        var editNewsshow = function() {

            $("#popover-editNews").removeClass("km-widget km-popup");
            $('.km-popup-arrow').addClass("removeArrow");

            EditGroupArrayMember = [];
            adminAllGroupArray = [];
            customerGroupArray = [];                                                
            newsDataToSend='';
            
            $(".km-scroll-container").css("-webkit-transform", "");                                    
            $('#editNewsDesc').css('height', '80px');
            
            pbNews = $("#profileCompletenessNews").kendoProgressBar({
                                                                type: "chunk",
                                                                chunkCount: 100,
                                                                min: 0,
                                                                max: 100,
                                                                value: 0
                                                            }).data("kendoProgressBar");
            

            $("#groupInEditNews option:selected").removeAttr("selected");
            $('#groupInEditNews').empty();

            var txt = $('#editNewsDesc'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
            
    
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv common');
            
            $("#editdatePickerNews").removeAttr('disabled');
            $("#editdateTimePickerNews").removeAttr('disabled');
            $("#editdatePickerNews").parent().css('width', "160px");
            $("#editdateTimePickerNews").parent().css('width', "160px");
            $("#editdatePickerNews").removeClass("k-input");
            $("#editdateTimePickerNews").removeClass("k-input");        
            $('body').append(hiddenDiv);            
            $("#sendEditNewsLoader").show();
            $("#wrappe_news").hide();
            
            
            txt.on('keyup', function () {
                content = $(this).val();
    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
    
                $(this).css('height', hiddenDiv.height());
            });

            /*newsDescEdit = e.data.news_desc;
            newsDateEdit = e.data.news_date;
            newsTimeEdit = e.data.news_time;
            newsImageEdit = e.data.news_image;
            newsUploadType = e.data.upload_type;
            newsPid = e.data.id;*/

            var org_id = localStorage.getItem("orgSelectAdmin");
            
            //alert(org_id+"||"+newsPid);
            
            var dataSourceMemberDetail = new kendo.data.DataSource({
                                                                       transport: {
                    read: {
                                                                                   url: app.serverUrl() + "news/newsdetail/" + org_id + "/" + newsPid,
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
                                                                           //apps.hideLoading();
                                                                           //console.log(JSON.stringify(e));
                                                                           
                                                                           $("#sendEditNewsLoader").hide();
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
	            
            dataSourceMemberDetail.fetch(function() {
                //var loginDataView = dataSourceMemberDetail.data();                                    

                var data = this.data();                        
 
                if (data[0]['status'][0].Msg==='Success') {
                        EditGroupArrayMember = [];
                        adminAllGroupArray = [];
                        customerGroupArray = [];
                        
                      
                        
                        newsDescEdit = data[0]['status'][0].newsDetail[0].news_desc;
                        newsDateEdit = data[0]['status'][0].newsDetail[0].news_date;
                        newsTimeEdit = data[0]['status'][0].newsDetail[0].news_time;
                        newsImageEdit = data[0]['status'][0].newsDetail[0].news_image;
                        newsUploadType = data[0]['status'][0].newsDetail[0].upload_type;
                        newsPid = data[0]['status'][0].newsDetail[0].id;
                                   
                    

                            var values = newsDateEdit.split('-');            
                            var year = values[0]; // globle variable            
                            var month = values[1];            
                            var day = values[2];                                
                         newsDateEdit = month + "/" + day + "/" + year;

                        $("#editNewsDesc").html(app.htmlDecode(newsDescEdit));                

                        if (newsImageEdit!==undefined && newsImageEdit!=="undefined" && newsImageEdit!=='' && newsUploadType==="image") {

                            var largeImage = document.getElementById('attachedImgEditNews');
                            largeImage.style.display = 'block';
                            largeImage.src = newsImageEdit;
                            upload_type_Edit = "image";
                
                            var largeVid = document.getElementById('attachedVidNewsEdit');        
                            largeVid.style.display = 'none';
                            largeVid.src = '';
                            //newsDataToSend = newsImageEdit ; 

                        }else if (newsImageEdit!==undefined && newsImageEdit!=="undefined" && newsImageEdit!=='' && newsUploadType==="video") {

                            var largeImageVid = document.getElementById('attachedVidNewsEdit');
                            largeImageVid.style.display = 'block';
                            largeImageVid.src = "styles/images/videoPlayIcon.png";
                            upload_type_Edit = "video";

                            var largeImage = document.getElementById('attachedImgEditNews');        
                            largeImage.style.display = 'none';
                            largeImage.src = '';                    
                            //newsDataToSend = newsImageEdit ; 
                        }else {            
                            var largeImage = document.getElementById('attachedImgEditNews');        
                            largeImage.style.display = 'none';
                            largeImage.src = '';

                            var largeVid = document.getElementById('attachedVidNewsEdit');        
                            largeVid.style.display = 'none';
                            largeVid.src = '';
                
                            newsDataToSend = '';
                            upload_type_Edit = '';
                        }
            
                        var currentDate = app.getPresentDate();
            
                        disabledDaysBefore = [
                            +new Date(currentDate)
                        ];

                        $("#editdatePickerNews").kendoDatePicker({                
                                                                     value: newsDateEdit,
                                                                     dates: disabledDaysBefore,    
                                                                     month:{
                                content:'# if (data.date > data.dates) { #' + 
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
                                                                         window.plugins.toast.showShortBottom('You Cannot Add Event on Back Date');  
                                                                         }else{
                                                                         app.showAlert('You Cannot Add Event on Back Date',"Event");  
                                                                         }                                
                                                                         }*/    
                                                                     }
                                                                 }).data("kendoDatePicker");
                         
                        $("#editdateTimePickerNews").kendoTimePicker({
                                                                         value:newsTimeEdit,
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
                      $('#editdatePickerNews').attr('disabled', 'disabled');
                      $('#editdateTimePickerNews').attr('disabled', 'disabled');
                                   
                    if(data[0]['status'][0].AdminGroup!==false){
                        if (data[0]['status'][0].AdminGroup.length!==0 && data[0]['status'][0].AdminGroup.length!==undefined) {
                            adminAllGroupArray = [];
                            for (var i = 0 ; i < data[0]['status'][0].AdminGroup.length;i++) {
                                adminAllGroupArray.push({
                                                            group_name: data[0]['status'][0].AdminGroup[i].group_name,
                                                            pid: data[0]['status'][0].AdminGroup[i].pid
                                                        });
                            }
                        }

                     if(data[0]['status'][0].newsGroup !== null){
                        if (data[0]['status'][0].newsGroup.length!==0 && data[0]['status'][0].newsGroup.length!==undefined) {
                            customerGroupArray = [];
                            for (var i = 0 ; i < data[0]['status'][0].newsGroup.length;i++) {
                                customerGroupArray.push({
                                                            pid: data[0]['status'][0].newsGroup[i].group_id
                                                        });
                            }
                        }
                        
                        var allGroupLength = adminAllGroupArray.length;
                        var allCustomerLength = customerGroupArray.length;  

                        EditGroupArrayMember = [];
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
                      }else{
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
                            if(value.check===''){
                                $('#groupInEditNews').append($('<option/>', { 
                                    value: value.pid,
                                    text : value.group_name                                   
                                }));   
                            }else{
                                $('#groupInEditNews').append($('<option/>', { 
                                    value: value.pid,
                                    text : value.group_name ,
                                    selected:"selected"
                                }));   
   
                            }                                
                        });
                     }else{
                          /*EditGroupArrayMember.push({
                                                                  group_name: 'No Group Available , First Add Group',
                                                                  pid:'0',
                                                                  check:''
                                                              });*/
                           app.noGroupAvailable();
                     }   
                    }else if (data[0]['status'][0].Msg==="Session Expired") {
                        //app.showAlert(app.SESSION_EXPIRE , 'Notification');
                        app.LogoutFromAdmin(); 
                    }else {
                        app.showAlert(data[0]['status'][0].Msg , 'Notification'); 
                    }                               
                    //console.log('------------------');
                    //console.log(EditGroupArrayMember);
                    
                    /*var comboEditGroupListDataSource = new kendo.data.DataSource({
                    data: EditGroupArrayMember
                    }); */                        
            
                    /*$("#groupInEditNews").kendoListView({
                                                            template: kendo.template($("#groupNameEditShowTemplate").html()),    		
                                                            dataSource: EditGroupArrayMember
                                                        });*/
                    $("#sendEditNewsLoader").hide();
                    $("#wrappe_news").show();

            });
        }
        
        var addNewNewsFunction = function() {
            organisationID = localStorage.getItem("orgSelectAdmin");
            
            var event_description = $("#addNewsDesc").val();

            var event_Date = $("#adddatePickerNews").val();
            var event_Time = $("#adddateTimePickerNews").val();

            var group = [];		    
            /*$(':checkbox:checked').each(function(i) {
                group[i] = $(this).val();
            });*/            
            
            /*$('#groupInAddNews input:checked').each(function() {
                group.push($(this).val());
            });*/
            
             $('#groupInAddNews :selected').each(function(i, selected){ 
                  group[i] = $(selected).val(); 
            });
            
            group = String(group);       
            
            //console.log(group);
            
            if (event_description === "Please Enter News Here" || event_description === "") {
                app.showAlert("Please enter News.", app.APP_NAME);
            }else if (group.length===0 || group.length==='0') {
                app.showAlert("Please select Group.", app.APP_NAME);    
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
            
                //console.log(Hour + "||" + minute + "||" + AmPm);
            
                var eventTimeSend = Hour + ":" + minute + ":00";
                //eventTimeSend=eventTimeSend.toString();
             
                event_Date = year + "-" + month + "-" + day;
                //event_Date=event_Date.toString();

                var actionval = "Add";

                //alert(upload_type);
                
                var vidFmAndroid = 0;
                if (newsDataToSend!==undefined && newsDataToSend!=="undefined" && newsDataToSend!=='') { 
                    pbNews.value(0);
                    countVal=0;
                    if ((newsDataToSend.substring(0, 21)==="content://com.android") && (upload_type==="image")) {
                        //alert('1');
                        photo_split = newsDataToSend.split("%3A");
                        //console.log(photo_split);
                        newsDataToSend = "content://media/external/images/media/" + photo_split[1];
                        vidFmAndroid = 1;
                    }else if ((newsDataToSend.substring(0, 21)==="content://com.android") && (upload_type==="video")) {
                        //alert('2');
                        photo_split = newsDataToSend.split("%3A");
                        //console.log(photo_split);
                        newsDataToSend = "content://media/external/video/media/" + photo_split[1];
                        vidFmAndroid = 1;  
                    }
                        
                    var mimeTypeVal;

                    if (upload_type==="image") {
                        mimeTypeVal = "image/jpeg"
                    }else {
                        mimeTypeVal = "video/mpeg"
                    }    

                    //console.log("org_id=" + organisationID + "txtNewsDesc=" + event_description + "txtNewsDate=" + event_Date + "txtNewsTime=" + eventTimeSend);                            
                    //alert(newsDataToSend);
                            
                    var filename = newsDataToSend.substr(newsDataToSend.lastIndexOf('/') + 1);                            

                    if (upload_type==="image" && vidFmAndroid===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.jpg';
                        }                
                    }else if (upload_type==="video" && vidFmAndroid===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.mp4';
                        }
                    }
                            
                    var path = newsDataToSend;
                    //console.log(path);                    
                    var openView = $("#tabstrip-upload-file").data("kendoMobileModalView");
                    openView.shim.popup.options.animation.open.duration = 400;
                    openView.open();
                    
                    
                    var params = new Object();
                    params.org_id = organisationID;  //you can send additional info with the file
                    params.txtNewsDesc = event_description;
                    params.txtNewsDate = event_Date;
                    params.txtNewsTime = eventTimeSend;
                    params.upload_type = upload_type;
                    params.cmbGroup = group;                            
                    ft = new FileTransfer();
                    var options = new FileUploadOptions();
                    options.fileKey = "news_image";
                    options.fileName = filename;              
                    //console.log(options.fileName);
              
                    options.mimeType = mimeTypeVal;
                    options.params = params;
                    options.chunkedMode = false;
                    options.headers = {
                        Connection: "close"
                    }
                    
                    ft.onprogress = function(progressEvent) {
                        if (progressEvent.lengthComputable) {
                            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                            pbNews.value(perc); 
                            countVal=perc;
                        }else {
                            pbNews.value('');                            
                            countVal=0;
                        }
                    };
       
                    //console.log(tasks);

                    ft.upload(newsDataToSend, app.serverUrl() + "news/add", win, fail, options , true);                    
                }else {

                    $("#sendNewsLoader").show();

                    //console.log("org_id=" + organisationID + "txtNewsDesc=" + event_description + "txtNewsDate=" + event_Date + "txtNewsTime=" + eventTimeSend);
                    var jsonDataSaveGroup = {"org_id":organisationID,"txtNewsDesc":event_description,"txtNewsDate":event_Date,"txtNewsTime":eventTimeSend,"cmbGroup":group}
                
                    //console.log(jsonDataSaveGroup);
                    
                    var dataSourceaddGroup = new kendo.data.DataSource({
                                                                           transport: {
                            read: {
                                                                                       url: app.serverUrl() + "news/add",
                                                                                       type:"POST",
                                                                                       dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                  
                                                                                       data: jsonDataSaveGroup
                                                                                   }
                        },
                                                                           schema: {
                            data: function(data) {
                                //console.log(data);
                                //console.log(JSON.stringify(data))
                                return [data];
                            }
                        },
                                                                           error: function (e) {
                                                                               //apps.hideLoading();
                                                                               //console.log(JSON.stringify(e));
                                                                               $("#sendNewsLoader").hide();
                                                                            
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
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            //console.log(addGroupData.status[0].Msg);           
                            if (addGroupData.status[0].Msg==='News added successfully') {  
                                $(".km-scroll-container").css("-webkit-transform", "");                           
                                $("#addNewsDesc").val('');                   
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NEWS_ADDED_MSG);  
                                }else {
                                    app.showAlert(app.NEWS_ADDED_MSG, "Notification");  
                                }                                                        
                                $("#sendNewsLoader").hide();
                                app.mobileApp.navigate("#adminOrgNewsList");
                            }else if (addGroupData.status[0].Msg==="You don't have access") {                                           
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }                  
                                goToNewsListPage();
                            }else {
                                app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                                $("#sendNewsLoader").hide();
                            }
                        });
                    });
                }
            }      
        }
        

        
        var transferFileAbort = function() {    
            //console.log(countVal +"||"+pbNews.value());            
            if(countVal < 90){
                pbNews.value(0);
                $("#sendNewsLoader").hide();
                $("#sendEditNewsLoader").hide();              
                ft.abort(); 
                $("#tabstrip-upload-file").data("kendoMobileModalView").close();
            }else{
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.CANNOT_CANCEL);  
                }else {
                    app.showAlert(app.CANNOT_CANCEL , 'Notification');  
                } 
            }    
        }
        
        function win(r) {
            pbNews.value(0);
            countVal=0;
            $("#tabstrip-upload-file").data("kendoMobileModalView").close();
            //console.log('win');
            //console.log("Code = " + r.responseCode);
            //console.log("Response = " + r.response);
            //console.log("Sent = " + r.bytesSent);

            $("#sendNewsLoader").hide();

            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom(app.NEWS_ADDED_MSG);   
            }else {
                app.showAlert(app.NEWS_ADDED_MSG, "Notification"); 
            }
            
            $("#addNewsDesc").val('');             
            
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = '';
            
            var largevid = document.getElementById('attachedVidNews');
            largevid.src = '';
            
            $("#attachedImgNews").hide();
            $("#removeNewsAttachment").hide();            
            app.mobileApp.navigate("#adminOrgNewsList");
        }
                
        function fail(error) {
            pbNews.value(0);
            countVal=0;            
            //console.log(error);          
            console.log(JSON.stringify(error));           
            $("#tabstrip-upload-file").data("kendoMobileModalView").close();
                //console.log(error);
                //console.log(JSON.stringify(error));
            //console.log("An error has occurred: Code = " + error.code);
            //console.log("upload error source " + error.source);
                //console.log("upload error target " + error.target);
            $("#sendNewsLoader").hide();
            $("#sendEditNewsLoader").hide();
 
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Notification');  
                } 
            }else{                
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.NEWS_EVENT_FAIL);  
                }else {
                    app.showAlert(app.NEWS_EVENT_FAIL , 'Notification');  
                }
            }
            app.analyticsService.viewModel.trackFeature("News Add or Update fail"+JSON.stringify(error));            
        }

        var saveEditNewsData = function() {
            var event_description = $("#editNewsDesc").val();
            var event_Date = $("#editdatePickerNews").val();
            var event_Time = $("#editdateTimePickerNews").val();

            var groupEdit = [];		  
            
            /*$('#groupInEditNews input:checked').each(function() {
                groupEdit.push($(this).val());
            });*/
            
            /*$(':checkbox:checked').each(function(i) {
                groupEdit[i] = $(this).val();
            });*/
            
            $('#groupInEditNews :selected').each(function(i, selected){ 
                  groupEdit[i] = $(selected).val(); 
            });
                        
            groupEdit = String(groupEdit);             
            //console.log(groupEdit);
            
            if (event_description === "Please Enter News Here" || event_description === "") {
                app.showAlert("Please Enter News .", app.APP_NAME);
            }else if (groupEdit.length===0 || groupEdit.length==='0') {
                app.showAlert("Please select Group.", app.APP_NAME);    
            }else {                    
                var values = event_Date.split('/');            
                var month = values[0]; // globle variable            
                var day = values[1];            
                var year = values[2];
             
                if (day < 10) {
                    day = "0" + day;
                }
            
                event_Date = year + "-" + month + "-" + day;
                
                var vidFmAndroidEdit = 0;
                
                if (newsDataToSend!==undefined && newsDataToSend!=="undefined" && newsDataToSend!=='') { 
                    if ((newsDataToSend.substring(0, 21)==="content://com.android") && (upload_type_Edit==="image")) {
                        photo_split = newsDataToSend.split("%3A");
                        newsDataToSend = "content://media/external/images/media/" + photo_split[1];
                        vidFmAndroidEdit = 1;
                    }else if ((newsDataToSend.substring(0, 21)==="content://com.android") && (upload_type_Edit==="video")) {
                        photo_split = newsDataToSend.split("%3A");
                        newsDataToSend = "content://media/external/video/media/" + photo_split[1];
                        vidFmAndroidEdit = 1;  
                    }

                    var mimeTypeVal;
                    if (upload_type_Edit==="image") {
                        mimeTypeVal = "image/jpeg"
                    }else {
                        mimeTypeVal = "video/mpeg"
                    }                    
        
                    var filename = newsDataToSend.substr(newsDataToSend.lastIndexOf('/') + 1);                            
                    
                    if (upload_type_Edit==="image" && vidFmAndroidEdit===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.jpg';
                        }                
                    }else if (upload_type_Edit==="video" && vidFmAndroidEdit===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.mp4';
                        }
                    }
                   
                    var path = newsDataToSend;

                    pbNews.value(0);
                    countVal=0;
                     
                    var params = new Object();
                    params.org_id = organisationID;  //you can send additional info with the file
                    params.txtNewsDesc = event_description;
                    params.txtNewsDate = event_Date;
                    params.txtNewsTime = event_Time;
                    params.pid = newsPid;    
                    params.upload_type = upload_type_Edit;
                    params.cmbGroup = groupEdit;
                     
                    var options = new FileUploadOptions();
                    options.fileKey = "news_image";
                    options.fileName = filename;
              
                    //console.log(options.fileName);
              
                    options.mimeType = mimeTypeVal;
                    options.params = params;
                    options.headers = {
                        Connection: "close"
                    }
                    options.chunkedMode = false;
             
                    $("#tabstrip-upload-file").data("kendoMobileModalView").open();
                     
                    ft = new FileTransfer();                    
                    ft.onprogress = function(progressEvent) {
                        if (progressEvent.lengthComputable) {
                            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                            pbNews.value(perc);
                            countVal=perc;
                        }else {
                            pbNews.value('');
                            countVal=0;
                        }
                    };

                    //dataToSend = '//C:/Users/Gaurav/Desktop/R_work/keyy.jpg';
                    ft.upload(newsDataToSend, app.serverUrl() + "news/edit", winEdit, fail, options , true);
                }else {
                    $("#sendEditNewsLoader").show();                

                    //alert(upload_type_Edit);
                    //console.log(organisationID + "||" + event_description + "||" + event_Date + "||" + event_Time + "||" + newsPid);
                    var jsonDataSaveGroup = {"org_id":organisationID ,"txtNewsDesc":event_description,"txtNewsDate":event_Date,"txtNewsTime":event_Time,"pid":newsPid,"cmbGroup":groupEdit,"upload_type":upload_type_Edit}
            
                    var dataSourceaddGroup = new kendo.data.DataSource({
                                                                           transport: {
                            read: {
                                                                                       url: app.serverUrl() + "news/edit",
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
                                                                               //console.log(JSON.stringify(e));
                                                                               $("#sendEditNewsLoader").hide();
                                                                              
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
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            //console.log(addGroupData.status[0].Msg);           
                            if (addGroupData.status[0].Msg==='News updated successfully') {         
                                app.mobileApp.navigate("#adminOrgNewsList");
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NEWS_UPDATED_MSG);  
                                }else {
                                    app.showAlert(app.NEWS_UPDATED_MSG, "Notification");  
                                }
                                $("#sendEditNewsLoader").hide();
                            }else if (addGroupData.status[0].Msg==="Session Expired") {
                                //app.showAlert(app.SESSION_EXPIRE , 'Notification');
                                app.LogoutFromAdmin(); 
                            }else if (addGroupData.status[0].Msg==="You don't have access") {
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                    }else {
                                        app.showAlert(app.NO_ACCESS , 'Offline');  
                                    }
                     
                                goToNewsListPage();
                            } else {
                                $("#sendEditNewsLoader").hide();
                                app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                            }
                        });
                    });
                }   
            }
        }
        
        function winEdit(r) {
            pbNews.value(0)
            countVal=0;
            $("#tabstrip-upload-file").data("kendoMobileModalView").close();
            
            //console.log('karan');
            //console.log("Response = " + r.response);
            //console.log("Response = " + r.response.status);
            //console.log("Response = " + r.response.status['0'].Msg);
          
            $("#sendEditNewsLoader").hide();

                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.NEWS_UPDATED_MSG);  
                }else {
                    app.showAlert(app.NEWS_UPDATED_MSG , 'Notification');  
                }
                        
            app.mobileApp.navigate("#adminOrgNewsList");
        }
        
        var goToManageOrgPage = function() {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');
            //app.slide('rigth', 'green' ,'3' ,'#views/groupDetailView.html');
            //app.slide('right', 'green' ,'3' ,'#view-all-activities-GroupDetail');
        }
        
        var goToAddNewsPage = function() {
            app.mobileApp.navigate('#adminAddNews');

            app.analyticsService.viewModel.trackFeature("User navigate to Add News in Admin");            
            //app.slide('rigth', 'green' ,'3' ,'#adminAddNews');
        }
        
        var goToNewsListPage = function() {
            app.mobileApp.navigate('#adminOrgNewsList');

            app.analyticsService.viewModel.trackFeature("User navigate to News List in Admin");            
            //app.slide('rigth', 'green' ,'3' ,'#adminOrgNewsList');
        }
        
        var orgAllNewsList = function() {
            app.mobileApp.navigate('#adminOrgNewsList');
             
            $("#adddatePickerNews").removeAttr('disabled');
            $("#adddateTimePickerNews").removeAttr('disabled');

            app.analyticsService.viewModel.trackFeature("User navigate to News List in Admin");            
            //app.slide('left', 'green' ,'3' ,'#adminOrgNewsList');
        }
        
        var addNewEvent = function() {
            app.mobileApp.navigate('#adminAddEventCalendar');
            app.analyticsService.viewModel.trackFeature("User navigate to Add Event in Admin");            
            //app.slide('left', 'green' ,'3' ,'#adminAddEventCalendar');
        }
        
        var upcommingEventList = function() {
            app.mobileApp.navigate('#adminEventList');
            //app.slide('left', 'green' ,'3' ,'#adminEventList');    
        }
        
        var eventListShow = function() {
            //var dateShow = multipleEventArray[0].event_date;
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
        
        //PHOTOLIBRARY
        
        var getVideoVal = function() {            
            //navigator.device.capture.captureVideo(captureSuccess, captureError, {limit: 1});                      
            navigator.camera.getPicture(onVideoURISuccessData, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            mediaType: navigator.camera.MediaType.VIDEO
                                        });
        }
        
        // Called when capture operation is finished
        //

        function captureSuccess(mediaFiles) {
            //console.log(mediaFiles);
            //console.log(mediaFiles[fullPath]);
            //console.log("path : " + mediaFiles.fullPath + ", name : " + mediaFiles.name + ", type : " + mediaFiles.type + ", size : " + mediaFiles.size);
            //var i, path,len;
            //for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            //    path = mediaFiles[i].fullPath;
            //}       
            // Uncomment to view the image file URI
            // console.log(imageURI);
            // Get image handle
        }

        // Called if something bad happens.
        function captureError(error) {
            var msg = 'An error occurred during capture: ' + error.code;
            navigator.notification.alert(msg, null, 'Uh oh!');
        }
                
        function onPhotoURISuccessData(imageURI) {        
           console.log('news image selected---'+imageURI);
            var videoAttached = document.getElementById('attachedVidNews');
            videoAttached.src = '';    
            $("#attachedVidNews").hide();
            
            var largeImage = document.getElementById('attachedImgNews');
            
            largeImage.style.display = 'block';
            
            largeImage.src = imageURI;
            newsDataToSend = imageURI;
            upload_type = "image";
            
            $("#attachedImgNews").show();

            //console.log(imageURI);
        }
        
        function onVideoURISuccessData(videoURI) {             
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = ''; 
            $("#removeNewsAttachment").hide(); 
            $("#attachedImgNews").hide();            
            
            var videoAttached = document.getElementById('attachedVidNews');
            videoAttached.style.display = 'block';            
            
            videoAttached.src = 'styles/images/videoPlayIcon.png';
            
            newsDataToSend = videoURI;    
            upload_type = "video";
            
            $("#removeNewsAttachment").show(); 
            $("#attachedVidNews").show();

            //alert(imageURI);
            //console.log(videoURI);
            //newsDataToSend = imageURI;
        }
         
        function onFail(message) {
            //console.log('Failed because: ' + message);
            $("#removeNewsAttachment").hide(); 
            $("#attachedImgNews").hide();
        }
         
        var removeImage = function() {
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = '';
            var videoAttached = document.getElementById('attachedVidNews');
            videoAttached.src = '';            

            $("#removeNewsAttachment").hide(); 
            $("#attachedImgNews").hide();
            $("#attachedVidNews").hide();            
            newsDataToSend = ''; 
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
        
        var upload_type_Edit;
                
        var getVideoValEdit = function() {
            navigator.camera.getPicture(onVideoURISuccessDataEdit, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            mediaType: navigator.camera.MediaType.VIDEO
                                        }); 
        }
        
        function onPhotoURISuccessDataEdit(imageURI) {
            var imageAttached = document.getElementById('attachedVidNewsEdit');
            imageAttached.src = '';
            $("#attachedVidNewsEdit").hide();
               
            var largeImage = document.getElementById('attachedImgEditNews');
            largeImage.style.display = 'block';
            largeImage.src = imageURI;
            newsDataToSend = imageURI;              
            $("#attachedImgEditNews").show();

            upload_type_Edit = "image";   
            //console.log(imageURI);
        }
        
        function onVideoURISuccessDataEdit(videoURI) {
            var imageAttached = document.getElementById('attachedImgEditNews');
            imageAttached.src = '';
            $("#attachedImgEditNews").hide();
            
            var largeImage = document.getElementById('attachedVidNewsEdit');
            largeImage.style.display = 'block';
            largeImage.src = 'styles/images/videoPlayIcon.png';
            newsDataToSend = videoURI;
            
            upload_type_Edit = "video";
            
            $("#attachedVidNewsEdit").show();           
        }
        
        function onFailEdit(message) {
            //console.log('Failed because: ' + message);
        }
         
        var removeImageEdit = function() {
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = '';            
            $("#attachedImgEditNews").hide();
            
            
            var largeVid = document.getElementById('attachedVidNewsEdit');
            largeVid.src = '';            
            $("#attachedVidNewsEdit").hide();

            newsDataToSend = ''; 
            upload_type_Edit = '';
        }
        
        var open=0;
        var clickToSelectGroup = function(){

            
             /*var ele = document.getElementById(groupInAddNews);          
              
            if(ele.style.display === "block") {*/                  
            /*
          	}*/
            
            if(open===0){
                $("#groupInAddNews").hide().slideDown({duration: 500});
                open=1;
            }else{
                $("#groupInAddNews" ).slideUp("slow");
                open=0
            }

        }
        
        
        var showMoreButtonPress = function(){
          if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
          }else{ 
            page++;
            dataReceived=dataReceived+10;
            getLiveData();            
          }
        }
        
         
        var checkClick = function(){
            if ($("#selectAll").prop('checked')===true){
                    $('.largerCheckboxSelectAll').prop('checked', false);
                    document.getElementById("selectAll").checked=false;
            }
        }
        
         var getDataToPost = function(e){
            //console.log(e.data);
            var message = e.data.news_desc;
            var title = '';
            var attached = e.data.news_image;
            var type = e.data.upload_type;            

            if (attached!== null && attached!=='' && attached!=="0"){
                 localStorage.setItem("shareImg", attached);
            }else{
                localStorage.setItem("shareImg", null);
            }
            
            localStorage.setItem("shareMsg", message);
            localStorage.setItem("shareTitle", title);            
            //console.log(message+"||"+title+"||"+attached+"||"+type);
        }
        
        var onBackClsPicker = function(dataForm){                             
            if(dataForm==='add') {
                $("#adddatePickerNews").data("kendoDatePicker").close();
                $("#adddateTimePickerNews").data("kendoTimePicker").close();
            }else{
                $("#editdatePickerNews").data("kendoDatePicker").close();
                $("#editdateTimePickerNews").data("kendoTimePicker").close();
            }
        }     
        
        return {
            init: init,
            show: show,
            editNews:editNews,
            checkClick:checkClick,
            eventListShow:eventListShow,
            getTakePhoto:getTakePhoto,
            getVideoValEdit:getVideoValEdit,
            getPhotoValEdit:getPhotoValEdit,
            getTakePhotoEdit:getTakePhotoEdit,
            getPhotoVal:getPhotoVal,
            getVideoVal:getVideoVal,
            onBackClsPicker:onBackClsPicker,
            getDataToPost:getDataToPost,
            removeImage:removeImage,
            removeImageEdit:removeImageEdit,
            addNewEvent:addNewEvent,
            deleteNews:deleteNews,
            getLiveData:getLiveData,
            clickToSelectGroup:clickToSelectGroup,
            editNewsshow:editNewsshow,
            goToAddNewsPage:goToAddNewsPage,
            goToNewsListPage:goToNewsListPage,
            goToManageOrgPage:goToManageOrgPage,
            showMoreButtonPress:showMoreButtonPress,
            //eventMoreDetailClick:eventMoreDetailClick,
            addNewNewsFunction:addNewNewsFunction,
            addNewsshow:addNewsshow,
            orgAllNewsList:orgAllNewsList,
            transferFileAbort:transferFileAbort,
            saveEditNewsData:saveEditNewsData,
            upcommingEventList:upcommingEventList,
            selectAllCheckBox:selectAllCheckBox,
            showInListView:showInListView
        };
    }());
        
    return adminNewsEventModel;
}());