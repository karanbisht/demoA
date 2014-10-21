var app = app || {};

app.GroupList = (function () {

 var groupListDataSource;   
 var orgId = localStorage.getItem("UserOrgID");

 var organisationID;  
 var account_Id;
 var orgName;
 var orgDesc;
    
    
var activityListViewModel = (function () {
     var GroupDataSource;           
    	     
     		 var init = function () {
				  //console.log('helloasda');
                  $('#newGroup').val('');
              };
                
              var show = function(e){
                  
                   $(".km-scroll-container").css("-webkit-transform", "");
                   var tabStrip = $("#addGroupTabStrip").data("kendoMobileTabStrip");
                   tabStrip.clear();
  
                organisationID = e.view.params.organisationId;  
                account_Id = e.view.params.account_Id;
                orgName= e.view.params.orgName;
                orgDesc= e.view.params.orgDesc;
  
                  
                console.log('Organisation ID'+organisationID);
                  
				$('#newGroup').val('');
                groupDataShow=[];      
                  
         
    
             var organisationGroupDataSource = new kendo.data.DataSource({                
             transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/index/"+organisationID,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
                 
        	 schema: {
                 data: function(data)
                   {
                       console.log("---------------------------");
                       console.log(JSON.stringify(data));
                       
                       var orgNotificationData; 
                           $.each(data, function(i, groupValue) {
                                  console.log(groupValue);
    
                               $.each(groupValue, function(i, orgVal) {
                                   
                                     console.log();
                   	            
                                   if(orgVal.Msg ==='No Group list'){
                                       console.log("--------------------------No Group");
                                  	   groupDataShow.push({
                                                 orgName: '',
        		                                 groupID:'',
                                                 groupName:'No Group',
                                                 organisationID:'',
                                                 groupDesc:'No Group in this Organisation',
                                                 addDate:''  
    	                                });   
                    
                                        $("#tabDeleteGroup").hide();
                                            showLiveData();
                                        
	                                }else if(orgVal.Msg==='Success'){
                                                        console.log("--------------------------Success");

                                        console.log(orgVal.groupData.length);
                                        console.log('karan Bisht');
                                        orgNotificationData = orgVal.groupData;                                                                               
                                        console.log(orgNotificationData);                                       
                                        saveOrgGroupNotification(orgNotificationData);                                                                                                                                                                      
                                    }
                                 });    
                            });       
                                                     
                    	return [data]; 
                   }                                                            
              },
                 
    	       error: function (e) {
                        e.preventDefault();
    	               //apps.hideLoading();
        	           console.log(e);
                   
                                      //$("#progress1").hide();  

                                       if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                      }else{
                                      app.showAlert("Network problem . Please try again later","Notification");  
                                       }
                     getGroupDataDB();

           	    }	        
     	      });         

                  organisationGroupDataSource.read();
            
         };  
    
       var orgNotiGroupDataVal;         
       function saveOrgGroupNotification(data) {                      
            orgNotiGroupDataVal = data;
            //alert('dataaaaaaaaa');
            console.log(orgNotiGroupDataVal);            
			var db = app.getDb();
			db.transaction(insertOrgGroupNotiData, app.errorCB, getGroupDataDB);
	   };
                        
      function insertOrgGroupNotiData(tx){
        var queryDelete = "DELETE FROM ADMIN_ORG_GROUP";
        app.deleteQuery(tx, queryDelete);
          
        var dataLength = orgNotiGroupDataVal.length;         
          //alert(dataLength);
    
        var orgGroupData;
          
        for(var i=0;i<dataLength;i++){   
           orgGroupData = orgNotiGroupDataVal[i].org_id;
           
    	   var query = 'INSERT INTO ADMIN_ORG_GROUP(org_id ,groupID ,org_name ,group_name ,group_desc,addDate) VALUES ("'
				+ orgNotiGroupDataVal[i].org_id
				+ '","'
				+ orgNotiGroupDataVal[i].pid
				+ '","'
				+ orgNotiGroupDataVal[i].org_name
           	 + '","'
				+ orgNotiGroupDataVal[i].group_name
    	        + '","'
			    + orgNotiGroupDataVal[i].group_desc
                + '","'
				+ orgNotiGroupDataVal[i].add
				+ '")';              
                app.insertQuery(tx, query);
        }                                                 
      }
    
    
        var getGroupDataDB = function(){
             var db = app.getDb();
		     db.transaction(getDataOrg, app.errorCB, showLiveData);     
        }
        
    
        var getDataOrg = function(tx){
            	var query = "SELECT * FROM ADMIN_ORG_GROUP where org_id="+organisationID;
				app.selectQuery(tx, query, getDataSuccess);
        };
            
            
        var groupDataShow=[];            
        function getDataSuccess(tx, results) {                        
            groupDataShow=[]; 
            var tempArray= [];
 		   var count = results.rows.length;
            
                       
               if (count !== 0) {                
            	    for(var i =0 ; i<count ; i++){
                         var pos = $.inArray(results.rows.item(i).groupID, tempArray);
                         console.log(pos);
                        //alert(results.rows.item(i).addDate);
		                 if (pos === -1) {
                               tempArray.push(results.rows.item(i).groupID); 
                                       groupDataShow.push({
												 orgName: results.rows.item(i).org_name,
        		                                 groupID: results.rows.item(i).groupID,
                                                 groupName: results.rows.item(i).group_name,
                                                 orgID:results.rows.item(i).org_id,
                                                 groupDesc:results.rows.item(i).group_desc,
                                                 addDate:results.rows.item(i).addDate
	                                    });
                         }
                    }               
                }else{                    
                                     groupDataShow.push({
                                                 orgName: '',
        		                                 groupID:'',
                                                 groupName:'No Group',
                                                 organisationID:'',
                                                 groupDesc:'No Group in this Organisation',
                                                 addDate:''  
    	                               });   
                    
                            $("#tabDeleteGroup").hide();
                }
             
        }
            
            
             var showLiveData = function(){
                //console.log('Hello');                 
                console.log(JSON.stringify(groupDataShow));
                
             var organisationListDataSource = new kendo.data.DataSource({
                  data: groupDataShow
              });           

                              
                           
             $("#group-listview").kendoMobileListView({
  		      template: kendo.template($("#groupTemplate").html()),    		
     		   dataSource: organisationListDataSource,
                pullToRefresh: true
             });        
                
                 
 
              $('#group-listview').data('kendoMobileListView').refresh();
                
              app.mobileApp.pane.loader.hide();

            };

            var backToOrgDetail = function(){
                 groupDataShow=[];         
                app.mobileApp.navigate('views/groupDetailView.html?organisationId='+organisationID+'&account_Id='+account_Id+'&orgName='+orgName+'&orgDesc='+orgDesc);                
 
            }
    
    
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
    
    
        var goToGroupList = function(){
           app.mobileApp.navigate('views/groupListPage.html?organisationId='+organisationID);                
        }
                
         
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
                               if(addGroupData.status[0].Msg==='Group added successfully'){                                
				        	        app.mobileApp.navigate('views/groupListPage.html?organisationId='+organisationID);
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
                               if(deleteGroupData.status[0].Msg==='Deleted Successfully'){                                
				        	        app.mobileApp.navigate('views/groupListPage.html?organisationId='+organisationID);

                                if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Group Deleted Successfully');   
                                 }else{
                                      app.showAlert("Group Deleted Successfully","Notification");  
                                 }

                                   
    						    //app.showAlert("Group Deleted Successfully","Notification");

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
               goToGroupList:goToGroupList,
               deleteGroup:deleteGroup,
               backToOrgDetail:backToOrgDetail,
               showGroup:showGroup,
               addGroupFunc:addGroupFunc                        
               //groupListData:GroupsListModel.groupListData
          };
           
    }());
        
    return activityListViewModel;
    
}());