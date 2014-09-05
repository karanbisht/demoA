var app = app || {};

app.sendNotification = (function () {
    var validator;
    
	 var sendNotificationViewModel = (function () {

      var orgId = localStorage.getItem("UserOrgID"); 
          console.log(orgId);
      var $notificationDesc;          
      var account_Id;          
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
                        placeholder: "Select Type",
                        suggest: true
                        //index: 0
                    });

           //$("#groupSelectNotification").kendoComboBox();
                       $("#groupforNotification").kendoComboBox({
                          
                       });

        };
         
                                
        var show = function(e){
            $notificationDesc.val('');
            validator.hideMessages();
            
			$("#notificationTitleValue").val('');            
            $("#notificationDesc").val('');
            
            var account_Id = localStorage.getItem("ACCOUNT_ID");
          
            var comboOrgListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/organisation/managableOrg/"+account_Id,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                  
              	}
              },
       	 schema: {               
                  data: function(data)
  	             {	console.log(data);
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
                                     console.log(groupValue);
                                     var orgLength=groupValue[0].orgData.length;
                                   for(var j=0;j<orgLength;j++){
                                     groupDataShow.push({
                                         org_id: groupValue[0].orgData[j].org_id,
                                         org_name: groupValue[0].orgData[j].org_name,
                                         organisationID:groupValue[0].orgData[j].organisationID,
                                         role:groupValue[0].orgData[j].role
                                     });
                                   }
                                 });                       
                       console.log(groupDataShow);
                       return groupDataShow;                       
	               }
            },
            error: function (e) {
               console.log(e);
               navigator.notification.alert("Please check your internet connection.",
               function () { }, "Notification", 'OK');
           },       
             sort: { field: 'add', dir: 'desc' }    	     
          });
                       
               
            $("#orgforNotification").kendoComboBox({
  				dataSource: comboOrgListDataSource,
  				dataTextField: "org_name",
  				dataValueField: "organisationID",
                  change: onChangeNotiOrg	  	
            });            
            
            
        };    
             
         var onChangeNotiOrg = function(){
             var org = this.value();       
             localStorage.setItem("SELECTED_ORG",org);
             
             var comboGroupListDataSource = new kendo.data.DataSource({
             transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/index/"+org,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                  
              	}
              },
       	 schema: {               
                  data: function(data)
  	             {	console.log(data);
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
                                     console.log(groupValue);
                                    
                                     var orgLength=groupValue[0].groupData.length;
                                     for(var j=0;j<orgLength;j++){
                                     groupDataShow.push({
                                         group_desc: groupValue[0].groupData[j].group_desc,
                                         group_name: groupValue[0].groupData[j].group_name,
                                         group_status:groupValue[0].groupData[j].group_status,
                                         org_id:groupValue[0].groupData[j].org_id,
                                         pid:groupValue[0].groupData[j].pid

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
                 console.log(groupSelectedNoti);
             	return groupSelectedNoti;
         };
         
                 
         var sendNotificationMessage = function () {    
         var cmbGroup = [];
         var org_id = localStorage.getItem("SELECTED_ORG");    
             
            //if (validator.validate()) {
                var group=onChangeNotiGroup();
                cmbGroup.push(group);
             	
                cmbGroup = String(cmbGroup);
                console.log(cmbGroup);
				
                var selectedType = $("#notificationType").data("kendoComboBox");
                var type=selectedType.value();
             
            
             var cmmt_allow ;
             if($("#comment_allow").prop('checked')){
    				cmmt_allow = 1;  // checked
	 		}else{
    				cmmt_allow = 0;
             }
             
             console.log(cmmt_allow);
                var notificationValue = $notificationDesc.val();
                var titleValue = $("#notificationTitleValue").val();
                
                
           console.log(notificationValue +"||"+titleValue+"||"+type+"||"+cmmt_allow+"||"+cmbGroup+"||"+org_id);
                          
             
          var notificationData = {"cmbGroup":cmbGroup ,"type":type,"title":titleValue, "message":notificationValue ,"org_id" : org_id,"comment_allow":cmmt_allow}
                      
            
          var dataSourceSendNotification = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/sendNotification",
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
                               
                               if(notification.status[0].Msg==='Notification Sent'){
                                 app.showAlert("Notification Send Successfully ","Notification");  
                                   $("#notificationTitleValue").val('');            
						           $("#notificationDesc").val('');
                                   document.getElementById('comment_allow').checked = false;
                                   $("#notificationType").data("kendoComboBox").value("");
             					  $("#groupforNotification").data("kendoComboBox").value("");
                                   $("#orgforNotification").data("kendoComboBox").value("");
                                                                                    
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