var app = app || {};

app.groupDetail = (function () {

    var orgName;
    var selectedGroupId;
    var orgDesc;
    var custFromGroup= [];
    //var orgId = localStorage.getItem("UserOrgID");
    
    var organisationID;
    var account_Id;
       
    var groupDetailViewModel = (function () {

       var init = function () {
    	         
                      
       };
           
        var show = function (e) {
            app.MenuPage=false;
            app.mobileApp.pane.loader.hide();            
            organisationID = e.view.params.organisationID;
            account_Id = e.view.params.account_Id;
            orgName= e.view.params.orgName;
            orgDesc= e.view.params.orgDesc;
            $("#adminOrgHeader").html(orgName);
         };
           
           
        var showGroupNotification = function(){
        	 app.MenuPage=false;
             app.mobileApp.navigate('views/orgNotificationList.html?organisationID=' + organisationID +'&account_Id='+account_Id);
             //app.mobileApp.navigate('#groupNotificationShow');
         };   
          
                        
        var showGroupMembers = function(){            
            app.MenuPage=false;
            app.mobileApp.navigate('#groupMemberShow');         
            console.log("karaasa"+organisationID)
                           
                     
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
                   url: "http://54.85.208.215/webservice/customer/getOrgCustomer/"+organisationID,
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

                   	             if(orgVal.Msg ==='No Customer in this organisation'){     
                                     groupDataShow.push({
                                         mobile: '',
                                         first_name: '',
                                         email:'No Customer in this Organisation',  
                                         last_name : '',
                                         customerID:'0',
                                         account_id:'0',
                                         orgID:'0'
    	                               });                                      
	                                }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.allCustomer.length);  
                                        for(var i=0;i<orgVal.allCustomer.length;i++){
                                            groupDataShow.push({
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
                    
                    $("#groupMember-listview").kendoMobileListView({
  		          template: kendo.template($("#errorTemplate").html()),
                    dataSource: dataSource  
     		       });
           	}
	        
    	    });         
         
            
            //MemberDataSource.fetch(function() {
                
 		   //});
	         
            
    	    $("#groupMember-listview").kendoMobileListView({
        		dataSource: MemberDataSource,
       		 template: kendo.template($("#groupMemberTemplate").html()),
                pullToRefresh: true, 
			});
            
             $("#deleteMemberData").kendoListView({
  		    template: kendo.template($("#Member-Delete-template").html()),    		
     		 dataSource: MemberDataSource,
        		schema: {
           		model:  UserModel
				}			 
		     });
            
        };
        
        
                
        var showUpdateGroupView = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('#updateGroupInfo');                     
            $("#editOrgName").val(orgName);
            $("#editOrgDesc").val(orgDesc);
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
            console.log(selectedGroupId);
         var group_status = 'A';
         var org_id=1; 
         var group_name = $("#editOrgName").val();     
         var group_description = $("#editOrgDesc").val();
            
         var jsonDataSaveGroup = {"org_id":org_id ,"group_name":group_name,"group_description":group_description, "group_status":group_status}
                      console.log(selectedGroupId);
            
         var dataSourceaddGroup = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/saveGroup/"+selectedGroupId,
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
                               if(addGroupData.status[0].Msg==='Success'){                                
									app.showAlert("Group Updated Successfully","Notification");
				        	        app.mobileApp.navigate('views/groupListPage.html');
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }                               
                  });
  		 });
        };
        
        var addMemberToGroup = function(){
            app.MenuPage=false;
            //app.mobileApp.navigate('#addMemberToGroup');
            app.mobileApp.navigate('views/addCustomerByAdmin.html?organisationID=' + organisationID);
           		
        };

        
     
        

        
        /*var addMemberToGroupFunc = function(){
			var successFlag = false;
            
            var val = [];
		        $(':checkbox:checked').each(function(i){
          	  val[i] = $(this).val();
                    //console.log(val[i]);
        	});
            
            
            var jsonDataAddMember = {"customer":val ,"organisation":orgId,"group":selectedGroupId}
                    
            var dataSourceAddMember = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/addCustomertoGroup",
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
                               if(addGroupData.status[0].Msg==='Customer saved to group'){                                
									app.showAlert("Member Added Successfully","Notification");
				        	        app.mobileApp.navigate('#groupMemberShow');
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });        
                        
                                   
            /*$.each(val,function(i,dataValue){  
            console.log(dataValue);
                  
                var data = el.data('Users');
	
                data.update({ 'Group': 'Testing' }, // data
					    { 'Id': dataValue }, // filter
                  
                function(data){      
                      successFlag=true;
                },

                 function(error){
 					successFlag=false;
                 });
                
        	  });	
            
    	       if(successFlag){
        		  	app.showAlert("Member Added to Group","Notification");               
	           }else{
             		 app.showAlert("Error ","Notification");
               }*/
            
        //};
        
        

        
        var removeMemberFromGroup = function(){           
            app.MenuPage=false;
            app.mobileApp.navigate('#removeMemberFromGroup');
            /*
            app.groupDetail.userData.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: GroupName   	    				        	
        	    								});
            kendo.bind($('#Member-Delete-template'), MemberDataSource); 
            */
        };
        
        
                 
        var removeMemberClick = function(){
	         //var orgId = localStorage.getItem("UserOrgID"); 
             //console.log(orgId);    
             var customer = [];
		    
            $(':checkbox:checked').each(function(i){
          	  customer[i] = $(this).val();
        	});
            
			console.log('Delete Button');
            customer = String(customer);        
            console.log(customer);            
			console.log(organisationID);
            
            var jsonDataDeleteMember = {'customer_id':customer ,'orgID':organisationID}
                        
            var dataSourceDeleteMember = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/customer/removeCustomer",
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
					  console.log('karan bisht');
                      console.log(deleteGroupData.status[0].Msg);
                      console.log(deleteGroupData.status[0].Code);
                      
                               if(deleteGroupData.status[0].Msg==='Deleted successfully' || deleteGroupData.status[0].Code===2 ){                                
									app.showAlert("Member Deleted Successfully","Notification");
                            		app.mobileApp.navigate('#groupMemberShow');
                                    refreshOrgMember();
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
        };
        
 
        function refreshOrgMember(){  
             console.log('go to member');
             app.groupDetail.showGroupMembers();
 		};
               
		        
        var clickOnOrgMember = function(e){
            console.log('member click'); 
            console.log(e.data);
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
               manageGroup:manageGroup,
               clickOnOrgMember:clickOnOrgMember,     
               sendNotification:sendNotification,    
               removeMemberClick:removeMemberClick,
               addMemberToGroup:addMemberToGroup,
           	userMessageTab:userMessageTab,    
          	 //addMemberToGroupFunc:addMemberToGroupFunc,
           	removeMemberFromGroup:removeMemberFromGroup,    
           	showGroupNotification:showGroupNotification,
           	showGroupMembers:showGroupMembers,
               showUpdateGroupView:showUpdateGroupView ,
               showOrgGroupView:showOrgGroupView,        
               saveUpdatedGroupVal:saveUpdatedGroupVal    
           	};
            
           }());
    
    return groupDetailViewModel;
}());  