var app = app || {};

app.eventCalender = (function () {

    
    var calendarEventModel = (function () {

        var eventOrgId;
        var groupAllEvent=[];
        var tasks = [];

        var init = function(){
                        
        }
    
         var show = function(e){
             
             tasks = [];
             multipleEventArray=[];
                         $("#eventDetailDiv").hide();



             eventOrgId = e.view.params.orgManageID;
             
             document.getElementById("calendar").innerHTML = "";
             
             
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
                                  
                                  console.log(eventDaya);
                                  
                                  var values = eventDaya.split('-');
                              	var year = values[0]; // globle variable
                              	var month = values[1];
                              	var day = values[2];
                                  
                                  
                                   tasks[+new Date(year+","+month+","+day)] = "ob-done-date";
                                  

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
        
        
        function showEventInCalendar(){
                         
             console.log(tasks);
            
             multipleEventArray=[];

                          
             $("#calendar").kendoCalendar({
             //value:new Date(),
             dates:tasks,
             month:{
             content:'# if (typeof data.dates[+data.date] === "string") { #' +
                '<div class="#= data.dates[+data.date] #">' +
                '#= data.value #' +
                '</div>' +
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