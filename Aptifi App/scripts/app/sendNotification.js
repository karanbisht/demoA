var app = app || {};

app.sendNotification = (function () {
    var validator;
    
	 var sendNotificationViewModel = (function () {

      var orgId = localStorage.getItem("UserOrgID"); 
         console.log(orgId);
      var $notificationDesc;          
                
    	var init = function () {				                 
           app.MenuPage=false;
           app.userPosition=false;
           validator = $('#enterNotification').kendoValidator().data('kendoValidator');
           $notificationDesc = $('#notificationDesc'); 
             
         
            
               $("#notificationType").kendoComboBox({
                        dataTextField: "text",
                        dataValueField: "value",
                        dataSource: [
                            { text: "Promotion", value: "P" },
                            { text: "Invitaion", value: "V" },
                            { text: "Information", value: "I" },
                            { text: "Reminder", value: "R" },
                            { text: "Alert", value: "A" }
                        ],
                        filter: "contains",
                        placeholder: "Select Notification Type",
                        suggest: true
                        //index: 0
                    });

           //$("#groupSelectNotification").kendoComboBox();
        };
                                
        var show = function(){
             $notificationDesc.val('');
             validator.hideMessages();
            
			$("#notificationTitleValue").val('');            
            $("#notificationDesc").val('');
            
          var comboGroupListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/getGroupByOrgID/"+orgId,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                  
              	}
              },
       	 schema: {               
                  data: function(data)
  	             {	console.log(data);
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
                                     var orgLength=groupValue[0].grpData.length;
                                   for(var j=0;j<orgLength;j++){
                                     groupDataShow.push({
                                         pid: groupValue[0].grpData[j].pid,
                                         group_name: groupValue[0].grpData[j].group_name,
                                         add:groupValue[0].grpData[j].add,
                                         group_desc:groupValue[0].grpData[j].group_desc
                                     });
                                   }
                                 });
                       
                       console.log(groupDataShow);
                       return groupDataShow;                       
	               }
            },
            error: function (e) {
               //apps.hideLoading();
               console.log(e);
               navigator.notification.alert("Please check your internet connection.",
               function () { }, "Notification", 'OK');
           },       
             sort: { field: 'add', dir: 'desc' }    	     
          });
                       
               
            $("#groupforNotification").kendoComboBox({
  				dataSource: comboGroupListDataSource,
  				dataTextField: "group_name",
  				dataValueField: "pid",
                  change: onChangeNotiGroup	  	
            });            
        };
                
          
         var onChangeNotiGroup = function(){
            	 var selectDataNoti = $("#groupforNotification").data("kendoComboBox");    
             	var groupSelectedNoti = selectDataNoti.value();
             	return groupSelectedNoti;
       	 
         };
         
                 
         var sendNotificationMessage = function () {    
         var cmbGroup = [];
             
            //if (validator.validate()) {
                var group=onChangeNotiGroup();
                cmbGroup.push(group);
                console.log(cmbGroup);
				
                var selectedType = $("#notificationType").data("kendoComboBox");
                var type=selectedType.value();
             
                var cmmt_allow = 0;
                var notificationValue = $notificationDesc.val();
                var titleValue = $("#notificationTitleValue").val();
                
                console.log(notificationValue +"||"+titleValue+"||"+type+"||"+cmmt_allow+"||"+cmbGroup);
                          
             
          var notificationData = {"cmbGroup":cmbGroup ,"type":type,"title":titleValue, "message":notificationValue ,"comment_allow":cmmt_allow}
                      
            
          var dataSourceSendNotification = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/sendnotification/"+orgId,
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: notificationData
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
               //apps.hideLoading();
               console.log(e);
               navigator.notification.alert("Please check your internet connection.",
               function () { }, "Notification", 'OK');
           }               
          });  
	            
           
           dataSourceSendNotification.fetch(function() {
                   
           var sendNotificationDataView = dataSourceSendNotification.data();
						   $.each(sendNotificationDataView, function(i, notification) {
                               console.log(notification.status[0].Msg);
                               
                               if(notification.status[0].Msg==='Success'){
                                 app.showAlert("Notification Send Successfully ","Notification");  
                               }else{
                                  app.showAlert(notification.status[0].Msg ,'Notification'); 
                               }
                           });
               
               
           });

                
        };
        
         
                                                            
    	 return {
        	   init: init,
           	show: show,
               onChangeNotiGroup:onChangeNotiGroup,
               sendNotificationMessage:sendNotificationMessage
         };
           
    }());
        
    return sendNotificationViewModel;
    
}());