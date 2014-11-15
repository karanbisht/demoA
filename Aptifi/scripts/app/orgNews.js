var app = app || {};

app.orgNews = (function () {

    var orgNewsModel = (function () {

        var eventOrgId;
        var groupAllEvent=[];
        var tasks = [];

        var init = function(){
                        
        }
    
         var show = function(e){
               
             console.log('asd');

             $(".km-scroll-container").css("-webkit-transform", "");
 
             tasks = [];
             multipleEventArray=[];
                         
             $("#eventDetailDiv").hide();
             //eventOrgId = e.view.params.orgManageID;
             

             eventOrgId = localStorage.getItem("selectedOrgId");

             document.getElementById("calendar").innerHTML = "";
             
             

             

             var jsonDataLogin = {"org_id":eventOrgId}

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
                            
                          } 
                    }                
                });
  		 }); 
                                                 
                //tasks[+new Date(2014, 8 - 1, 5)] = "ob-not-done-date";*/

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
        
        
        
        var gobackOrgPage = function(){
                        
            app.mobileApp.navigate('views/userOrgManage.html');            

        }
        
    	 return {
        	   init: init,
           	show: show,
               gobackOrgPage:gobackOrgPage,
               detailShow:detailShow
          };
           
    }());
        
    return orgNewsModel;
    
}());