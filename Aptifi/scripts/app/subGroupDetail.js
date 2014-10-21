var app = app || {};

app.subGroupDetail = (function () {

    var GroupName;
    var selectedGroupId;
    var selectedGroupDesc;
    var custFromGroup= [];

    //var orgId = localStorage.getItem("UserOrgID");
    
    var groupID;
    var organisationID;
       
    var groupDetailViewModel = (function () {

        
  	var init = function () {
             
                      
      };
           
           
        var show = function (e) {
            app.MenuPage=false;
            app.mobileApp.pane.loader.hide();            
            groupID = e.view.params.groupID;
            organisationID = e.view.params.orgID;
            GroupName= e.view.params.groupName;
            selectedGroupDesc= e.view.params.groupDesc;
            
            $("#adminGroupHeader").html(GroupName);           
         };
           
           
        var showSubGroupNotification = function(){
        	 app.MenuPage=false;
             app.mobileApp.navigate('views/subGroupNotificationList.html?organisationID=' + organisationID +'&group_ID='+groupID);
             //app.mobileApp.navigate('#groupNotificationShow');
         };   
          
                
        var groupMemberData=[];
        var showSubGroupMembers = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('#subGroupMemberShow');         
            console.log(organisationID);
            console.log(groupID);
                       
            var UserModel ={
            id: 'Id',
            fields: {
                mobile: {
                    field: 'mobile',
                    defaultValue: ''
                },
                first_name: {
                    field: 'first_name',
                    defaultValue: ''
                },
                email: {
                    field: 'email',
                    defaultValue:''
                },
                last_name: {
                    field: 'last_name',
                    defaultValue:''
                },
                customerID: {
                    field: 'customerID',
                    defaultValue:''
                }

               }
             };
            
        var MemberDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/getCustomerByGroupID/"+groupID+"/"+organisationID,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
              	}
              },
       	 schema: {
               model: UserModel,
                                
                 data: function(data)
  	             {
                       console.log(data);
                       
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
									console.log(groupValue);
                                     
                                 $.each(groupValue, function(i, orgVal) {
                                    console.log(orgVal);

                   	             if(orgVal.Msg ==='No member in group'){     
                                     groupDataShow.push({
                                         mobile: '',
                                         first_name: '',
                                         email:'No member in this group',  
                                         last_name : '',
                                         customerID:'0',
                                         orgID:0
    	                               }); 
                                        
                                      $("#deleteGroupMemberBtn").hide();  
	                                
                                    }else if(orgVal.Msg==='Success'){
                                    
                                        $("#deleteGroupMemberBtn").show();  
                                        console.log(orgVal.customerInfo.length);  
                                        for(var i=0;i<orgVal.customerInfo.length;i++){
                                            groupDataShow.push({
		                                         first_name: orgVal.customerInfo[i].first_name,
        		                                 email:orgVal.customerInfo[i].email,  
                		                         last_name : orgVal.customerInfo[i].last_name,
                        		                 customerID:orgVal.customerInfo[i].customerID,
                                		         mobile:orgVal.customerInfo[i].mobile,
                                                 orgID:orgVal.customerInfo[i].orgID
                                            });
                                        }     
                                        
                                        groupMemberData = groupDataShow ;
   
                                    } 
                                     
    							  });
                               });
                       
		                         console.log(groupDataShow);
                                 return groupDataShow;
	               }

            },
	            error: function (e) {
    	           //apps.hideLoading();
        	       console.log(e);
            	   //navigator.notification.alert("Please check your internet connection.",
               	//function () { }, "Notification", 'OK');
                    
                      var showNotiTypes=[
                      { message: "Please Check Your Internet Connection"}
                    ];
                        
                    var dataSource = new kendo.data.DataSource({
                          data: showNotiTypes
                    });
                    
                    $("#subGroupMember-listview").kendoMobileListView({
  		          template: kendo.template($("#errorTemplate").html()),
                    dataSource: dataSource  
     		       });
           	}
	        
    	    });         
         
            
            MemberDataSource.fetch(function() {
                
 		   });
	
                     
    	    $("#subGroupMember-listview").kendoMobileListView({
        		dataSource: MemberDataSource,
       		 template: kendo.template($("#subGroupMemberTemplate").html()),
                pullToRefresh: true, 
			});
            
             $("#deleteSubMemberData").kendoListView({
  		    template: kendo.template($("#sub-Member-Delete-template").html()),    		
     		 dataSource: MemberDataSource,
        		schema: {
           		model:  UserModel
				}			 
		     });
            
        };
        
        

        var showUpdateSubGroupView = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('#updateSubGroupInfo');      
               
            $("#editGroupName").val(GroupName);
            $("#editGroupDesc").val(selectedGroupDesc);
        };
        
        var manageGroup =function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        var sendNotification = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('views/sendNotification.html');
        };
        
        var saveUpdatedGroupVal = function(){
         //console.log(selectedGroupId);
         var group_status = 'A';
         //var org_id=1; 
         var group_name = $("#editGroupName").val();     
         var group_description = $("#editGroupDesc").val();
          console.log(organisationID +"||"+group_name+"||"+group_description+"||"+groupID+"||"+group_status);
            
         var jsonDataSaveGroup = {"org_id":organisationID ,"txtGrpName":group_name,"txtGrpDesc":group_description,"pid":groupID , "group_status":group_status}
                       
         var dataSourceaddGroup = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/edit",
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
                               if(addGroupData.status[0].Msg==='Group updated successfully'){  
                                 if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Group Updated Successfully');   
                                 }else{
                                      app.showAlert("Group Updated Successfully","Notification");  
                                 }
                                   
                                 app.mobileApp.navigate('views/groupListPage.html');  
								
                                   //app.showAlert("Group Updated Successfully","Notification");
		
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });
        };
        
        var addMemberToGroup = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('#addMemberToSubGroup');
            //app.mobileApp.navigate('views/addCustomerByAdmin.html?organisationID=' + organisationID);		
        };
        
        
        var initAddMember = function(){
            
        };

        
        
        
        var showAddMember = function(){
            
            var groupDataAllShow=[];
            var remDataValue =[];
            var MemberDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/customer/getOrgCustomer/"+organisationID,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
              	}
              },
       	 schema: {                              
                 data: function(data)
  	             {
                       console.log(data);
                       
                                 $.each(data, function(i, groupValue) {
									console.log(groupValue);
                                     
                                 $.each(groupValue, function(i, orgVal) {
                                    console.log(orgVal);

	                               if(orgVal.Msg==='Success'){
                                        console.log(orgVal.allCustomer.length);  
                                        for(var i=0;i<orgVal.allCustomer.length;i++){
                                            groupDataAllShow.push({
                                                 mobile: orgVal.allCustomer[i].uacc_username,
		                                         first_name: orgVal.allCustomer[i].user_fname,
        		                                 email:orgVal.allCustomer[i].user_email,  
                		                         last_name : orgVal.allCustomer[i].user_lname,
                        		                 customerID:orgVal.allCustomer[i].custID,
                                		         account_id:orgVal.allCustomer[i].account_id,
                                                 orgID:orgVal.allCustomer[i].orgID
                                            });
                                        }        
                                    }    
    							  });
                               });
                       
		                                                           
                                   var allData = groupDataAllShow.length;
                                   var groupData = groupMemberData.length;            
                 
                       
                       console.log(allData);
                       console.log(groupData);
                       
                       
                       for(var x=0;x < allData ; x++){                     
                           	var numCheck=0;
                            for(var y=0;y<groupData ;y++){
                              
                                if(groupDataAllShow[x].customerID=== groupMemberData[y].customerID){                                
                                  numCheck=1;
                                }
                                
                           }
                              if(numCheck!==1){
                                 remDataValue.push({
                                   mobile: groupDataAllShow[x].mobile,
	      	                     first_name: groupDataAllShow[x].first_name,
        	      	             email:groupDataAllShow[x].email,  
                	      	     last_name : groupDataAllShow[x].last_name,
                        	       customerID:groupDataAllShow[x].customerID,
                                   account_id:groupDataAllShow[x].account_id,
                                   orgID:groupDataAllShow[x].orgID
                                   });								                             
                              }
                            
                      }
                       return remDataValue;
                   }
            },
	            error: function (e) {
    	           //apps.hideLoading();
        	       console.log(e);
            	   navigator.notification.alert("Please check your internet connection.",
               	function () { }, "Notification", 'OK');
           	}	        
    	    });         
                  
                                                   
             $("#addMemberData-listview").kendoListView({
       		 template: kendo.template($("#Sub-Member-Add-template").html()),
        		dataSource: MemberDataSource
		     });
        
        };

        
        var addMemberToGroupFunc = function(){
			var successFlag = false;
            
            var customer = [];
		        $(':checkbox:checked').each(function(i){
          	  customer[i] = $(this).val();
                    //console.log(val[i]);
        	});
            
             var customer = String(customer);        
            
            var jsonDataAddMember = {"customer_id":customer ,"group_id":groupID,"org_id":organisationID}
            
              console.log(customer +"||"+ groupID +"||"+ organisationID);      
            var dataSourceAddMember = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/addUser",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataAddMember
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
	            
           dataSourceAddMember.fetch(function() {
              var loginDataView = dataSourceAddMember.data();
				  $.each(loginDataView, function(i, addGroupData) {
                      console.log(addGroupData.status[0].Msg);           
                               if(addGroupData.status[0].Msg==='Customer Added to group successfully'){  

                                 if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Member Added Successfully');   
                                 }else{
                                      app.showAlert("Member Added Successfully","Notification");  
                                 }
                                   
							    //app.showAlert("Member Added Successfully","Notification");
				        	        //app.mobileApp.navigate('#groupMemberShow');
                                    showSubGroupMembers();
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });        
        };

        
        var removeMemberFromGroup = function(){           
            app.MenuPage=false;
            app.mobileApp.navigate('#removeMemberFromSubGroup');            
        };
        
        
                 
        var removeMemberClick = function(){
	         //var orgId = localStorage.getItem("UserOrgID"); 
             //console.log(orgId);    
             var customer = [];
            $(':checkbox:checked').each(function(i){
          	  customer[i] = $(this).val();
        	});
            
			
            var customer = String(customer);        
            
            console.log(customer);            
			console.log(organisationID);
       
            var jsonDataDeleteMember = {"customer_id":customer ,"group_id":groupID,"org_id":organisationID}
            
            console.log("customer_id"+customer+"||"+groupID+"||"+organisationID);
            
            var dataSourceDeleteMember = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/removeUser",
                   type:"POST",
                   dataType: "json",// "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataDeleteMember
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
	            
           dataSourceDeleteMember.fetch(function() {
              var loginDataView = dataSourceDeleteMember.data();
				  $.each(loginDataView, function(i, deleteGroupData) {
                      console.log(deleteGroupData.status[0].Msg);           
                               if(deleteGroupData.status[0].Msg==='User removed successfully'){ 
                                   
                                   if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Member Deleted Successfully');   
                                 }else{
                                      app.showAlert("Member Deleted Successfully","Notification");  
                                 }
                                   
								//app.showAlert("Member Deleted Successfully","Notification");
				        	        //app.mobileApp.navigate('#groupMemberShow');
                                    showSubGroupMembers();
                               }else{
                                  app.showAlert(deleteGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });    
        };
       
        
        
        var showOrgGroupView = function(){
            app.MenuPage=false;
            console.log(organisationID);
            app.mobileApp.navigate('views/groupListPage.html?organisationId='+organisationID);                
            //app.mobileApp.navigate('#orgGroupShow');                        
        };
        
             
		var userMessageTab = function(e){
        		    var tempArray= [];
            		app.MenuPage=false;	
            		var activity;
                    var uniqueLength;
                    var activitiesDataSource;
                    
                    notificationId=[],notificationMessage=[],notificationTitle=[];

                    console.log(e.data.uid);
            		activity = app.groupDetail.userData.getByUid(e.data.uid);
            		console.log(activity);
            		console.log(activity.Id);
   	  	  
                                app.mobileApp.navigate('views/adminMessageReply.html');
    	                        app.Activities.userData.filter({
							                	field: 'UserId',
                								operator: 'eq',
                								value: activity.Id
        	    								});
                    
                 
                    	app.Activities.userData.fetch(function(){
					 		var view = app.Activities.userData.view();
                      	   console.log(view);
					  	   dataLength = view.length;
		                                  
                          for(var i=0;i<dataLength;i++){
                     	      var pos = $.inArray(view[i].NotificationId, tempArray);
                         	  console.log(pos);
								if (pos === -1) {
								   tempArray.push(view[i].NotificationId);
								} 
 					           console.log("hello"+tempArray);
                            	uniqueLength=tempArray.length;
 		                       console.log(uniqueLength);   
                            }                 
          		  	});

                    
						 for(var i=0;i<uniqueLength;i++){     		
				                 app.Activities.activities.filter({
							 	field: 'Id',
                			 	operator: 'eq',
                    			 value: tempArray[i]
					     		});

                                 // for(var i=0;i<dataLength;i++){
                           	  // var pos = $.inArray(view[i].UserId, tempArray);
                             	 
                                // template = kendo.template($("#userDetailTemplate").html());
								//$("#userDetail-listview").append(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
								//kendo.bind($('#userDetailTemplate'), activitiesDataSource);
                           }                                                                                                              
       			 };

	           
    	       return {
        	   init: init,
           	show: show,
               showAddMember:showAddMember,
               initAddMember:initAddMember,    
               manageGroup:manageGroup,    
               sendNotification:sendNotification,    
               removeMemberClick:removeMemberClick,
               addMemberToGroup:addMemberToGroup,
           	userMessageTab:userMessageTab,    
          	 addMemberToGroupFunc:addMemberToGroupFunc,
           	removeMemberFromGroup:removeMemberFromGroup,    
           	showSubGroupNotification:showSubGroupNotification,
           	showSubGroupMembers:showSubGroupMembers,
               showUpdateSubGroupView:showUpdateSubGroupView ,
               showOrgGroupView:showOrgGroupView,        
               saveUpdatedGroupVal:saveUpdatedGroupVal    
           	};
            
           }());
    
    return groupDetailViewModel;
}());  