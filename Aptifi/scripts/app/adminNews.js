var app = app || {};

app.adminNews = (function () {

    
    var adminNewsEventModel = (function () {

        var organisationID;
        var account_Id;
        var groupAllEvent=[];
        var tasks = [];

        var init = function(){
    
        }
    
         var show = function(){
            

             $(".km-scroll-container").css("-webkit-transform", "");


             organisationID = localStorage.getItem("orgSelectAdmin");
             //alert(organisationID);
             account_Id = localStorage.getItem("ACCOUNT_ID");
             

             var jsonDataLogin = {"org_id":organisationID}

             var dataSourceLogin = new kendo.data.DataSource({
                transport: {
                read: {
                    url: app.serverUrl()+"news/index",
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
                               
                      if(loginData.status[0].Msg==='No News list'){
                          
                          groupAllEvent=[];
                          
                          groupAllEvent.push({
                                          id: 0,
                                          add_date: 0,
									      news_date: 0,
										  news_desc: 'No News from this Organization',                                                                                 										  
                                          news_name: 'No News',                                                                                  										  
                                          news_time: '',                                                                                  										  
                                          mod_date: '',                                     
                                          org_id: ''
   	                    });

                      }else if(loginData.status[0].Msg==='Success'){

                          groupAllEvent=[];

                          if(loginData.status[0].newsData.length!==0){
                                                            
                              var eventListLength = loginData.status[0].newsData.length;
                              
                              for(var i=0 ; i<eventListLength ;i++){
                                                                   
                                  var newsDate = loginData.status[0].newsData[i].news_date;
                                  console.log("-------karan---------------");
                                  console.log(newsDate);
                                  
                                  var values = newsDate.split('-');
                              	var year = values[0]; // globle variable
                              	var month = values[1];
                              	var day = values[2];
                                  
                                  console.log('------------------date=---------------------');
                                  console.log(year+"||"+month+"||"+day);
                                  
                                  //tasks[+new Date(2014, 11, 8)] = "ob-done-date";
                                 
                                  if(day<10){
                                     day = day.replace(/^0+/, '');                                     
                                  }
                                  var saveData = month+"/"+day+"/"+year;

                                 
                                      groupAllEvent.push({
                                          id: loginData.status[0].newsData[i].id,
                                          add_date: loginData.status[0].newsData[i].add_date,
									      news_date: saveData,
										  news_desc: loginData.status[0].newsData[i].news_desc,                                                                                 										  
                                          news_name: loginData.status[0].newsData[i].org_name,                                                                                  										  
                                          news_time: loginData.status[0].newsData[i].news_time,                                                                                  										  
                                          mod_date: loginData.status[0].newsData[i].mod_date,                                     
                                          org_id: loginData.status[0].newsData[i].org_id
   	                               });
                              }
                            
                          } 
                          
                    }
                   

                   showInListView();

                });
  		 }); 
                                                 
                //tasks[+new Date(2014, 8 - 1, 5)] = "ob-not-done-date";*/

         }
        
        
        function showEventInCalendar(){                         
             console.log(tasks);            
             multipleEventArray=[];

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
        }

        var multipleEventArray=[];
        var date2;

        function selectedDataByUser(){

            console.log("Change :: " + kendo.toString(this.value(), 'd'));
            var date = kendo.toString(this.value(), 'd'); 
            
            date2 = kendo.toString(this.value(), 'd'); 

            $("#eventDetailDiv").hide();
 
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

                console.log(dateToCom);
                
                //date=date.trim();//replace(/^"(.*)"$/, '$1');
                //dateToCom=dateToCom.trim();//.replace(/^"(.*)"$/, '$1');
                
                //date=date.replace(/"/g, "");
                //dateToCom = dateToCom.replace(/"/g, "");

                //console.log(JSON.stringify(date));
                //console.log(JSON.stringify(dateToCom));

                //alert(date+"||"+dateToCom);
                
                if(date===dateToCom){
                    
                    console.log('inside');
                    
                    $("#eventDetailDiv").show();
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
                    
                    checkGotevent=1;
                    //break;
                }   
            }
            
            if(checkGotevent===0){
                app.mobileApp.navigate('#adminAddEventCalendar');
            }else{
                $("#eventDetailDiv").show();
            }
        }
        
        
        var eventMoreDetailClick = function(){
             app.mobileApp.navigate('#adminEventCalendarDetail');
        }
    
        
        var showInListView = function(){
            $(".km-scroll-container").css("-webkit-transform", "");
            
             var organisationListDataSource = new kendo.data.DataSource({
                  data: groupAllEvent
             });           

                
            $("#orgAllNewsList").kendoMobileListView({
  		    template: kendo.template($("#newsListTemplate").html()),    		
     		 dataSource: organisationListDataSource
            });
                
            $('#orgAllNewsList').data('kendoMobileListView').refresh();
            
        }
        
        
        var addEventshow = function(){

            $(".km-scroll-container").css("-webkit-transform", "");
          
            $("#addNewsName").val('');
            $("#addNewsDesc").val('');
         

            var currentDate = app.getPresentDate();
            
            disabledDaysBefore = [
              +new Date(currentDate)
            ];
            
            
            $("#adddatePickerNews").kendoDatePicker({
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
                        console.log(value); //value is the selected date in the timepicker
                }                
            });

            
            

                /*addEventDatePicker.focus(function() {
	                //$( "#orgforNotification" ).blur();
                    addEventDatePicker.input.blur();
				});*/
            
            setTimeout(function(){
                $("#adddatePickerNews").bind("focus", function() {
                    $("#adddatePickerNews").blur();                    
                });
            },100); 

            
            setTimeout(function(){            
                $("#adddateTimePickerNews").bind("focus", function() {
                    $("#adddateTimePickerNews").blur();
                }); 
            },100); 

            
                 /*var addEventTimePicker = $("#adddateTimePickerNews").data("kendoTimePicker"); 
				addEventTimePicker.input.focus(function() {
	                //$( "#orgforNotification" ).blur();
                    addEventTimePicker.input.blur();
				});  */ 
            
            
                        
        }

        
        var newsDescEdit;
        var newsDateEdit;
        var newsTimeEdit;
        var newsPid;
        
        var editNews = function(e){
             console.log(e.data.uid);
             console.log(e.data);
            
             newsDescEdit = e.data.news_desc;
             newsDateEdit = e.data.news_date;
             newsTimeEdit = e.data.news_time;
             newsPid = e.data.id;
             app.mobileApp.navigate('#adminEditNews');
        }
        
        
        var deleteNews = function(e){
             console.log(e.data.uid);
             console.log(e.data);

            organisationID = localStorage.getItem("orgSelectAdmin");
            
            console.log('orgID='+organisationID+"pid="+newsPid)

            var jsonDataSaveGroup = {"orgID":organisationID,"pid":newsPid}
            
            var dataSourceaddGroup = new kendo.data.DataSource({
               transport: {
               read: {
                   url: app.serverUrl()+"news/delete/",
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
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  }               

           }               
          
         });  
	            
           dataSourceaddGroup.fetch(function() {
              var loginDataView = dataSourceaddGroup.data();
				  $.each(loginDataView, function(i, addGroupData) {
                      console.log(addGroupData.status[0].Msg);           
                               if(addGroupData.status[0].Msg==='Deleted Successfully'){         
				        	        app.mobileApp.navigate("#adminOrgNewsList");
        							app.showAlert("News Deleted Successfully","Notification");
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });

        }
        
        
        var editNewsshow = function(){

            $(".km-scroll-container").css("-webkit-transform", "");
                        
            $("#editNewsDesc").html(newsDescEdit); 
                       
            
            $("#editdatePickerNews").kendoDatePicker({                
            value: newsDateEdit,
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
                        console.log(value); //value is the selected date in the timepicker
                }                
            });
            
                        


            setTimeout(function(){
                $("#editdatePickerNews").bind("focus", function() {
                    $("#editdatePickerNews").blur();                    
                });
            },100); 

            
            setTimeout(function(){            
                $("#editdateTimePickerNews").bind("focus", function() {
                    $("#editdateTimePickerNews").blur();
                }); 
            },100); 
            
        }
        

        
        
        var addNewNewsFunction = function(){
                       
            organisationID = localStorage.getItem("orgSelectAdmin");
            
            var event_description = $("#addNewsDesc").val();

            var event_Date = $("#adddatePickerNews").val();
            var event_Time = $("#adddateTimePickerNews").val();
            
         if (event_description === "Please Enter News Here" || event_description === "") {
				app.showAlert("Please enter News.","Validation Error");
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

            
            console.log(event_description);
            console.log(event_Date);
            console.log(event_Time);

                
            
           console.log("org_id="+organisationID +"txtNewsDesc="+event_description+"txtNewsDate="+event_Date+"txtNewsTime="+eventTimeSend);
                        

             var jsonDataSaveGroup ={"org_id":organisationID,"txtNewsDesc":event_description,"txtNewsDate":event_Date,"txtNewsTime":eventTimeSend}
            
             var dataSourceaddGroup = new kendo.data.DataSource({
               transport: {
               read: {
                   url: app.serverUrl()+"news/add",
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
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  }               
           }               
          
         });  
	            
           dataSourceaddGroup.fetch(function() {
              var loginDataView = dataSourceaddGroup.data();
				  $.each(loginDataView, function(i, addGroupData) {
                      console.log(addGroupData.status[0].Msg);           
                               if(addGroupData.status[0].Msg==='News added successfully'){  
                                    $(".km-scroll-container").css("-webkit-transform", "");
                        
                                     $("#addNewsDesc").val(''); 
   				        	        app.mobileApp.navigate("#adminAddNews");
                                    
        							app.showAlert("News Added Successfully","Notification");
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });
          
          }   

        }
        

        var saveEditNewsData = function(){
         
            var event_description = $("#editNewsDesc").val();
            var event_Date = $("#editdatePickerNews").val();
            var event_Time = $("#editdateTimePickerNews").val();
            
          if (event_description === "Please Enter News Here" || event_description === "") {
		    		app.showAlert("Please Enter News .","Validation Error");
          }else {    
                                  
            var values = event_Date.split('/');            
            var month = values[0]; // globle variable            
            var day = values[1];            
            var year  = values[2];
             
            if(day<10){
                day="0"+day;
            }
            
            event_Date= year+"-"+month+"-"+day;
            
            console.log(event_description);
            console.log(event_Date);
            console.log(event_Time);

                
              console.log(organisationID+"||"+event_description+"||"+event_Date+"||"+event_Time+"||"+newsPid);
              
                                    
             var jsonDataSaveGroup = {"org_id":organisationID ,"txtNewsDesc":event_description,"txtNewsDate":event_Date,"txtNewsTime":event_Time,"pid":newsPid}
            
             var dataSourceaddGroup = new kendo.data.DataSource({
               transport: {
               read: {
                   url: app.serverUrl()+"news/edit",
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
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  }               
           }               
          
         });  
	            
           dataSourceaddGroup.fetch(function() {
              var loginDataView = dataSourceaddGroup.data();
				  $.each(loginDataView, function(i, addGroupData) {
                      console.log(addGroupData.status[0].Msg);           
                               if(addGroupData.status[0].Msg==='News updated successfully'){         
				        	        app.mobileApp.navigate("#adminOrgNewsList");
                                    app.showAlert("News Updated Successfully","Notification");
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
        
        var goToAddNewsPage = function(){
                        
            app.mobileApp.navigate('#adminAddNews');

        }
        
        
        var goToNewsListPage = function(){

            app.mobileApp.navigate('#adminOrgNewsList');

        }
        
        var orgAllNewsList = function(){

            app.mobileApp.navigate('#adminOrgNewsList');

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
               editNews:editNews,
               eventListShow:eventListShow,
               addNewEvent:addNewEvent,
               deleteNews:deleteNews,
               editNewsshow:editNewsshow,
               goToAddNewsPage:goToAddNewsPage,
               goToNewsListPage:goToNewsListPage,
               goToManageOrgPage:goToManageOrgPage,
               eventMoreDetailClick:eventMoreDetailClick,
               addNewNewsFunction:addNewNewsFunction,
               addEventshow:addEventshow,
               orgAllNewsList:orgAllNewsList,
               saveEditNewsData:saveEditNewsData,
               upcommingEventList:upcommingEventList,
               showInListView:showInListView
          };
           
    }());
        
    return adminNewsEventModel;
    
}());