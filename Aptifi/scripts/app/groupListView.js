var app = app || {};

app.GroupList = (function () {

 var groupListDataSource;   
 var orgId = localStorage.getItem("UserOrgID");

 var organisationID;  
                
     
var activityListViewModel = (function () {
     var GroupDataSource;           
    	     
     		 var init = function () {
				  //console.log('helloasda');
                  $('#newGroup').val('');
              };
                
              var show = function(e){
                organisationID = e.view.params.organisationId;  
                  console.log(organisationID);
                  
				$('#newGroup').val('');
                  
                  
                var OrgGroupModel ={
            id: 'Id',
            fields: {
                groupName: {
                    field: 'groupName',
                    defaultValue: ''
                },
                groupDesc: {
                    field: 'groupDesc',
                    defaultValue: ''
                },
                addDate: {
                    field: 'addDate',
                    defaultValue: ''
                } /*,
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
                }*/

               },                    
               CreatedAtFormatted: function () {
        	        return app.helper.formatDate(this.get('addDate'));
    	       }     
             };
            

            GroupDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/index/"+organisationID,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
              	}
              },
       	 schema: {
               model: OrgGroupModel,
                
                
                 data: function(data)
  	             {
                       console.log(data);
                       
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
									console.log(groupValue);
                                     
                                 $.each(groupValue, function(i, orgVal) {
                                    console.log(orgVal);
                                     if(orgVal.Msg ==='No Group list'){                                        
                                     groupDataShow.push({
 									 	groupName:'No Group',       
                                      	groupDesc:'No Group in this Organisation',
                                          groupStatus:'',  
                 		                 orgID : '',
                        		          OrgName:'',
                                		  groupID:'',
                                      	addDate:'0'
    	                             });
	                                 }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.groupData.length);  
                                        for(var i=0;i<orgVal.groupData.length;i++){
                                            groupDataShow.push({
                                                 groupName: orgVal.groupData[i].group_desc,
		                                         groupDesc: orgVal.groupData[i].group_name,
        		                                 groupStatus:orgVal.groupData[i].group_status,  
                		                         orgID : orgVal.groupData[i].org_id,
                        		                 OrgName:orgVal.groupData[i].org_name,
                                		         groupID:orgVal.groupData[i].pid,
                                                 addDate:orgVal.groupData[i].add
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
            	   navigator.notification.alert("Please check your internet connection.",
               	function () { }, "Notification", 'OK');
           	}
	        
    	    });         
         
            
            GroupDataSource.fetch(function() {
                
 		   });
            
            
             $("#group-listview").kendoMobileListView({
  		    template: kendo.template($("#groupTemplate").html()),    		
     		 dataSource: GroupDataSource,
              pullToRefresh: true,
        		schema: {
           		model:  OrgGroupModel
				}			 
		     });              

        };  
                
         var groupSelected = function (e) {
            		console.log(e.data);
             	   console.log(e.data.groupID);
                    console.log(e.data.orgID);//groupName//groupDesc
					app.MenuPage=false;	
            		app.mobileApp.navigate('views/subGroupDetailView.html?groupID=' + e.data.groupID +'&orgID='+e.data.orgID+'&groupName='+e.data.groupName+'&groupDesc='+e.data.groupDesc);
        };
                
        var addGroup = function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/addGroup.html');    
        };
        
        var deleteGroup = function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/deleteGroup.html');    
        };
                
         
        var addGroupFunc = function(){            
                      
            var group_name = $("#newGroup").val();     
            var group_description = $("#newGroupDesc").val();
            
            console.log(group_name);
            console.log(group_description);
             console.log(organisationID);
            

		 //var group_status = 'A';
         //var org_id=1; 
            
         var jsonDataSaveGroup = {"org_id":organisationID ,"txtGrpName":group_name,"txtGrpDesc":group_description}
                      
            
         var dataSourceaddGroup = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/add",
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
				        	        app.mobileApp.navigate('views/groupListPage.html');
                                    $("#newGroup").val('');     
            						$("#newGroupDesc").val('');
        							app.showAlert("Group Added Successfully","Notification");
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });
            
                        
        };
 
        

                
        var deleteGroupFunc = function(){
            //var orgId = localStorage.getItem("UserOrgID"); 
            //var data = $('input:checkbox:checked').val();
			
            var groupID = [];
		        $(':checkbox:checked').each(function(i){
          	  groupID[i] = $(this).val();
        	});
            
            groupID=String(groupID);
            
            console.log(groupID +"||"+ organisationID);
            
             var jsonDataDelete = {"group_id":groupID ,"orgID":organisationID}
            
             var dataSourceDeleteMember = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/delete",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataDelete
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
                               if(deleteGroupData.status[0].Msg==='Success'){                                
				        	        app.mobileApp.navigate('views/groupListPage.html');
    								app.showAlert("Group Deleted Successfully","Notification");

                               }else{
                                  app.showAlert(deleteGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });

            
            
          /*$.each(val,function(i,dataValue){  
            var data = el.data('Group');
			data.destroySingle({ Id: dataValue },    		
	        
              function(){
				  delVal++;
   			 },
 		
              function(error){
			    });
          
          });*/
            
         };
                
          
         var showGroup = function(){
              
             $("#deleteGroupData").kendoListView({
  		    template: kendo.template($("#Group-Delete-template").html()),    		
     		 dataSource: GroupDataSource        				 
		     });    
                    
         }; 
                
                
    	 return {
        	   init: init,
           	show: show,
               groupSelected:groupSelected,
	           deleteGroupFunc:deleteGroupFunc,
               addGroup:addGroup,
               deleteGroup:deleteGroup,
               showGroup:showGroup,
               addGroupFunc:addGroupFunc                        
               //groupListData:GroupsListModel.groupListData
          };
           
    }());
        
    return activityListViewModel;
    
}());