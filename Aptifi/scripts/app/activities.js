var app = app || {};

app.Activities = (function () {
 
  var activitiesDataSource;   
  var validator;
  var loginType,groupId,userId;
  var userlName;
  var organisationID;  
  var account_Id;  
            var bagCount;
   		 var groupDataShow = [];
            var lastNotificationPID;
    		var DBGETDATAVALUE;
    var orgName;
    var orgId = localStorage.getItem("UserOrgID");                              
    


    var activitiesViewModel = (function () {
            
         var init = function(){
             
         }   
        
         var show = function(e){             
           //console.log("plugin test");  
           //console.log(window.plugins);
            
           $("#progressNotification").show();
           $(".km-scroll-container").css("-webkit-transform", "");  
           groupDataShow=[];
           $('#activities-listview').data('kendoMobileListView').refresh();
             
           //var scroller = e.view.scroller;
           //scroller.reset();
             
             
           //app.mobileApp.pane.loader.show();  
           app.MenuPage=false;
           app.userPosition=false;                                      

           organisationID = e.view.params.organisationID;
       	account_Id = e.view.params.account_Id;
           bagCount = e.view.params.bagCount; 
           orgName = e.view.params.orgName;
           
           //alert(bagCount);
             
           console.log(organisationID+"||"+orgName+"||"+ account_Id+"||"+bagCount);
             
          // $("#fav-list-navbar").data("kendoMobileNavBar").title("foo");
             
           $("#navBarHeader").html(orgName);

             
           var db = app.getDb();
		   db.transaction(getLastOrgNoti, app.errorCB, showDBNotification);         
       };
        
                    
        var getLastOrgNoti = function(tx){
            var query = "SELECT MAX(pid) as pid FROM ORG_NOTIFICATION where org_id="+organisationID;
			app.selectQuery(tx, query, getOrgLastNotiDataSuccess);
        };    

        
                    
        function getOrgLastNotiDataSuccess(tx, results) {
			var count = results.rows.length;
            //alert(count);
            var lastNotificationPID = results.rows.item(0).pid;
             //alert(lastNotificationPID);
            if(lastNotificationPID===null){
                lastNotificationPID=0;
            }
            //alert(lastNotificationPID);

          if (count !== 0) {
            //alert('inside');
            
          var organisationALLNewListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/getCustomerNotification/"+ organisationID+"/"+account_Id+"/"+lastNotificationPID,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {
                 data: function(data)
  	             {
                       console.log(data);
               
                        var orgNotificationData; 
                                  $.each(data, function(i, groupValue) {
                                  console.log(groupValue);
                                     
                                   $.each(groupValue, function(i, orgVal) {
                                     console.log();

                   	                 if(orgVal.Msg ==='No notification'){     
                	                         //alert('NO notification');    
                                             var db = app.getDb();
                                    		 db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         

	                                    }else if(orgVal.Msg==='Success'){
                                             //alert('success');    
                                            console.log(orgVal.notificationList.length);  
                                            orgNotificationData = orgVal.notificationList;
                                            console.log('dattttttttttttttttttttttttttttttttttaaaaaaaaa');
                                            console.log(orgNotificationData);
                                            saveOrgNotification(orgNotificationData);                                                                                     
                                        
                                        }
                                                                            
                                   });    
                                 });
                       
		                         console.log(groupDataShow);
                                 return groupDataShow;
                   }                       
            },
	            error: function (e) {
                
                    console.log(e);
                    
                    var db = app.getDb();
		            db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         

           	}	        
    	    });        
               organisationALLNewListDataSource.read();

           }else{
                                    var db = app.getDb();
		            db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         
           } 
        }                      

        
        var orgNotiDataVal;
        
        function saveOrgNotification(data) {
            orgNotiDataVal = data;      
			var db = app.getDb();
			db.transaction(insertOrgNotiData, app.errorCB, showDBNotification);
		};
            
            
     function insertOrgNotiData(tx){
        //var query = "DELETE FROM ORG_NOTIFICATION";
		//app.deleteQuery(tx, query);

        var dataLength = orgNotiDataVal.length;
         
        //alert('LiveDataVal'+dataLength);

         var orgData;        
         var orgLastMsg;
 
       for(var i=0;i<dataLength;i++){    
           
           orgData = orgNotiDataVal[i].org_id;
           orgLastMsg = orgNotiDataVal[i].message;
          
    	   var query = 'INSERT INTO ORG_NOTIFICATION(org_id ,pid ,attached ,message ,title,comment_allow,send_date,type) VALUES ("'
				+ orgNotiDataVal[i].org_id
				+ '","'
				+ orgNotiDataVal[i].pid
				+ '","'
				+ orgNotiDataVal[i].attached
           	 + '","'
				+ orgNotiDataVal[i].message
    	        + '","'
			    + orgNotiDataVal[i].title
                + '","'
				+ orgNotiDataVal[i].comment_allow
                + '","'
				+ orgNotiDataVal[i].send_date
                + '","'
				+ orgNotiDataVal[i].type
				+ '")';              
                app.insertQuery(tx, query);
        }   

         updateJoinOrgTable(orgData,orgLastMsg,dataLength);

      }
                         
        var GlobalDataOrgId;
        var GlobalDataLastMsg;
        var GlobalDataCount;
        
        var updateJoinOrgTable= function(orgData,orgLastMsg,dataLength){
            GlobalDataOrgId=orgData;
            GlobalDataLastMsg=orgLastMsg;
            GlobalDataCount=dataLength;
            var db = app.getDb();
            db.transaction(updateLoginStatus, app.errorCB,app.successDB);
        }
        
        function updateLoginStatus(tx) {
	           //alert(GlobalDataOrgId+"||"+GlobalDataLastMsg+"||"+GlobalDataCount);     
               var query = "UPDATE JOINED_ORG SET count='"+GlobalDataCount+"',bagCount='"+GlobalDataCount+"', lastNoti='"+GlobalDataLastMsg+"' where org_id='" +GlobalDataOrgId +"' and role='C'";
               app.updateQuery(tx, query);
        }
        
        
        function showDBNotification(){
           var db = app.getDb();
		   db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         
        }
            
        var getDataOrgNoti = function(tx){
            var query = "SELECT * FROM ORG_NOTIFICATION where org_id="+organisationID+" ORDER BY pid DESC" ;
			app.selectQuery(tx, query, getOrgNotiDataSuccess);
        };    
                        
            
        function getOrgNotiDataSuccess(tx, results) {
            groupDataShow=[];
            
			var count = results.rows.length;
            //alert(count);
            //var current = new Date();   
            DBGETDATAVALUE = count;           
            
            var previousDate='';
            //alert(count);
			if (count !== 0) {
                groupDataShow=[];
            	for(var i =0 ; i<count ; i++){
                  
                       var dateString = results.rows.item(i).send_date;
                   //alert(dateString);
                       var split = dateString .split(' ');
                           console.log(split[0]+" || "+split[1]);
                       var notiDate= app.formatDate(split[0]);
                           console.log(notiDate);
                    
                       var splitTime =split[1].split(':');
                            console.log(splitTime);
                       var timeVal = splitTime[0]+':'+splitTime[1];
                            console.log(timeVal);

                       var notiTime=app.timeConvert(timeVal);
                       console.log(notiTime);
                    
                    
                      //var currentDate = app.currentDataFormate();
                      //console.log(currentDate);
                      //alert(results.rows.item(i).title);
                      groupDataShow.push({
												 message: results.rows.item(i).message,
        		                                 org_id: results.rows.item(i).org_id,
                                                 date:notiDate,
                                                 time:notiTime,
                                                 title:results.rows.item(i).title,
                                                 pid :results.rows.item(i).pid ,
                                                 comment_allow:results.rows.item(i).comment_allow ,
		                                         bagCount : 'C',
                                                 attached :results.rows.item(i).attached,
                                                 previousDate:previousDate,
                                                 attachedImg :'http://54.85.208.215/assets/attachment/'+results.rows.item(i).attached
                       });
                    
                  previousDate= notiDate;
                    
                  lastNotificationPID=results.rows.item(i).pid;
        	    }    
                 console.log(lastNotificationPID);
            }else{
                lastNotificationPID=0;

                           groupDataShow.push({
                                         title: ' No Notification ',
                                         message: 'No Notification from this Organisation',
                                         date:'0',  
                                         comment_allow : 'Y',
                                         org_id:'0', 
                                         pid:'',
                                         bagCount : '',
                                         attachedImg :'',  
                                         attached:''  
    	                               });                   

            }                       
         };       

        var afterShow = function(){
              var db = app.getDb();
		  	db.transaction(insertBagCount, app.errorCB, app.successCB);  
        };    
            
         var insertBagCount = function(tx){             
             //alert('ssss'+bagCount);
             //alert('ssss'+organisationID);

             var query = "UPDATE JOINED_ORG SET bagCount='" +bagCount +"' WHERE org_id='" +organisationID+"'" ;
		     app.updateQuery(tx, query);
         };   
            
            
         var showLiveData = function(){
           
          /*   
            var organisationAllNotificationModel = {
            id: 'Id',
            fields: {
                title: {
                    field: 'title',
                    defaultValue: ''
                },
                message :{
                    field: 'message',
                    defaultValue: ''  
                },
                notificationID: {
                    field: 'notificationID',
                    defaultValue: null
                },
                CreatedAt: {
                    field: 'date',
                    defaultValue: new Date()
                }                  
            },            
                 
            CreatedAtFormatted: function () {
                return app.helper.formatDate(this.get('CreatedAt'));
            }
            
          };
             
          console.log(lastNotificationPID);
             
          var organisationALLListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/getCustomerNotification/"+ organisationID+"/"+account_Id+"/"+lastNotificationPID,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {
               model: organisationAllNotificationModel,                                
                 data: function(data)
  	             {
                       console.log(data);
               
                        var orgNotificationData; 
                                  $.each(data, function(i, groupValue) {
                                  console.log(groupValue);
                                     
                                   $.each(groupValue, function(i, orgVal) {
                                     console.log();

                   	             if(orgVal.Msg ==='No notification' && DBGETDATAVALUE===0){     
                	                   groupDataShow.push({
                                         title: ' No Notification ',
                                         message: 'No Notification from this Organisation',
                                         date:'0',  
                                         comment_allow : 'Y',
                                         org_id:'0', 
                                         pid:'',
                                         bagCount : '',
                                         attachedImg :'',  
                                         attached:''  
    	                               });                   
                                        
	                                }else if(orgVal.Msg==='Success'){

                                        

                                        console.log(orgVal.notificationList.length);  
                                        orgNotificationData = orgVal.notificationList;
                                        
                                        for(var i=0;i<orgVal.notificationList.length;i++){
                                            groupDataShow.push({
												 message: orgVal.notificationList[i].message,
        		                                 org_id: orgVal.notificationList[i].org_id,
                                                 date:orgVal.notificationList[i].send_date,
                                                 title:orgVal.notificationList[i].title,
                                                 pid :orgVal.notificationList[i].pid ,
                                                 comment_allow:orgVal.notificationList[i].comment_allow ,
		                                         bagCount : 'C',
                                                 attached :orgVal.notificationList[i].attached,
                                                 attachedImg :'http://54.85.208.215/assets/attachment/'+orgVal.notificationList[i].attached
                                            });
                                        }
                                        saveOrgNotification(orgNotificationData);                                                                                     
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
                    
                $("#activities-listview").kendoMobileListView({
  		      template: kendo.template($("#errorTemplate").html()),
                dataSource: dataSource  
     		   });
                
           	}
	        
    	    });         
              */           
              
              var organisationALLListDataSource = new kendo.data.DataSource({
                  data: groupDataShow
              });
             
             organisationALLListDataSource.fetch(function() {
                
 		    });
           

             $("#activities-listview").kendoMobileListView({
  		    template: kendo.template($("#activityTemplate").html()),    		
     		 dataSource: organisationALLListDataSource
              //pullToRefresh: true,   

             });
            
             $('#activities-listview').data('kendoMobileListView').refresh();          
             //setTimeout(function(){
             $("#progressNotification").hide();
                 
             //app.mobileApp.pane.loader.hide();
             //},10); 
             
             if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               }
         };
   
        
        /*var offlineQueryDB = function(tx){
            var query = 'SELECT * FROM GetNotification';
			app.selectQuery(tx, query, offlineTestQuerySuccess);
        };
        
        var offlineTestQuerySuccess = function(tx, results) {
            $("#activities-listview").empty();
			var count = results.rows.length;
			if (count !== 0) {
				for (var i = 0; i < count; i++) {
					var Title = results.rows.item(i).Title;
					var Message = results.rows.item(i).Message;
					var CreatedAt = results.rows.item(i).CreatedAt; 
                    var template;
                    
                    //if(i===0){
                      //  template = kendo.template($("#activityTemplate").html());
       			//	 $("#activities-listview").html(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
                    //    $("#activities-listview").on('click', offlineActivitySelected);
       			 //}else{

	                template = kendo.template($("#activityTemplate").html());
					$("#activities-listview").append(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
					kendo.bind($('#activityTemplate'), activitiesDataSource);
                    //}
                 }
       		}else{
                   	$("#activities-listview").html("You are Currently Offline and data not available in local storage");
               }
        };
        */         
       
            var CreatedAtFormatted = function(value){
                 return app.helper.formatDate(value);
            };

       /*     
		var offlineQueryDBSuccess = function(){
            console.log("Query Success");
        };
        */
            
        var activitySelected = function (e) {
            console.log(e.data.uid);
            console.log(e.data);
            var message = e.data.message;
            var title = e.data.title;
            var org_id = e.data.org_id;
            console.log(org_id);
            var notiId=e.data.pid;
            var comment_allow=e.data.comment_allow;//: "1"
            var attached = e.data.attached;
            var type= e.data.type;
        
			app.MenuPage=false;	
    
            //alert(message +'&title='+title+'&org_id='+org_id+'&notiId='+notiId+'&account_Id='+account_Id+'&comment_allow='+comment_allow+'&attached='+attached);
            
            var messageVal=app.urlEncode(message); 
            var titleVal=app.urlEncode(title);
            
            //alert(messageVal);
            
            app.mobileApp.navigate('views/activityView.html?message=' + messageVal +'&title='+titleVal+'&org_id='+org_id+'&notiId='+notiId+'&account_Id='+account_Id+'&comment_allow='+comment_allow+'&attached='+attached+'&type='+type);
        };
        
        var groupSelected = function (e) {
            console.log("karan Bisht"+e);
			app.MenuPage=false;	
            app.mobileApp.navigate('views/groupDetailView.html?uid=' + e.data.uid);
        };
         
        var offlineActivitySelected = function (i) {
            console.log(i);
			app.MenuPage=false;	
            console.log("click");
            //app.mobileApp.navigate('views/activityView.html?uid=' + e.data.uid);
        };
        
        
        var notificationSelected = function (e) {
			app.MenuPage=false;	
            //alert(e.data.uid);
            app.mobileApp.navigate('views/notificationView.html?uid=' + e.data.uid);
        };

        // Navigate to app home
        var navigateHome = function () {
            app.MenuPage=false;
            app.mobileApp.navigate('#welcome');
        };
        
        var inAppBrowser= function() {
            app.MenuPage=false;
            window.open('http://www.sakshay.in','_blank');
        };
                        
        var makeCall = function(){
            app.MenuPage=false;
            document.location.href = 'tel:+91-971-781-8898';
        };
       
        var about = function(){
             app.MenuPage=false;
             //document.location.href="#view-all-notification";
             //document.location.href="views/MessageChatLayout.html";
             document.location.href="#infoDiv";
        };
        
        var replyUser = function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/userReplyView.html');                         
        };
        
        var manageGroup =function(){
            app.MenuPage=false;	
            //app.mobileApp.pane.loader.show();
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        var setting = function(){
             app.MenuPage=false;
             document.location.href="#settingDiv";
        };       
        
        var sendNotification = function(){
            app.MenuPage=false;
            //document.location.href="#sendNotificationDiv";
            app.mobileApp.navigate('views/sendNotification.html');           
        };
        
        var refreshButton = function(){
            
        };
        
         
        
        var info = function(){
            
        };
        
               
        var onAdminComboChange = function(){
       		  var selectData = $("#groupSelectAdmin").data("kendoComboBox");    
           	  var groupSelected = selectData.value();
    		              //var query = new Everlive.Query().where().equal('Group',groupSelected);
                  		//notificationModel();
        
            			   if(groupSelected==='All'){
    			             app.Activities.activities.filter({
							                	
        	    								});
                           }else{		
                                                app.Activities.activities.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: groupSelected
        	    								});
                                }

                      kendo.bind($('#activityTemplate'), activitiesDataSource);                              
			};
        
        
	    var onComboChange = function(){
                 //$("#activities-listview").empty();
            	 //var activities;
       		  var selectData = $("#groupSelect").data("kendoComboBox");    
           	  var groupSelected = selectData.value();
    		              //var query = new Everlive.Query().where().equal('Group',groupSelected);
                  		//notificationModel();
        
            			   if(groupSelected==='All'){
    			              app.Activities.activities.filter({
							                	
                                 
        	    			  });
                           }else{		
                                                app.Activities.activities.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: groupSelected
        	    								});
                                }

                      kendo.bind($('#activityTemplate'), activitiesDataSource);
                                    	         
   		 //var $notificationContainer = $('#activities-listview');
            //$notificationContainer.empty();
           // var notificationModel1 = (function () { 

             /*   var notiCModel = {
            				id: 'Id',
            				fields: {
				                CreatedAt: {
                					    field: 'CreatedAt',
        					            defaultValue: new Date()
		                					},
                                   Message: {
					                    field: 'Message',
                    					defaultValue: ''
               							 },
				                   Title :{
                   					 field: 'Title',
					                    defaultValue: ''  
                							}
            					    },
	            					CreatedAtFormatted: function () {
        	        						return app.helper.formatDate(this.get('CreatedAt'));
					    	        }
	        			};
                
					
                
			   if(groupSelected==='All'){
		                dataSource = new kendo.data.DataSource({
                                            type: 'everlive',
        						            schema: {
          									      model: notiCModel
        										    },

									            transport: {
								                // Required by Backend Services
								                typeName: 'GetNotification'
    									        },
            									                pageSize: '100',
                    					    				    page: 1,
											    				serverPaging: true,
                            
                                            change: function (e) {
									                if (e.items && e.items.length > 0) {
                    										$('#no-activities-span').hide();
									                } else {
										                    $('#no-activities-span').show();
                									}
           									 }    
   						  			  });
                  
               }else{
	            	        dataSource = new kendo.data.DataSource({
                                            type: 'everlive',
                                            filter: { field: "Group", value:groupSelected },
 									       schema: {
          									      model: notiCModel
        										    },

									        transport: {
									            typeName: 'GetNotification'
    									    },
												                pageSize: '100',
                                								page: 1,
															    serverPaging: true,
                                            change: function (e) {
									                if (e.items && e.items.length > 0) {
                    										$('#no-activities-span').hide();
									                } else {
										                    $('#no-activities-span').show();
                									}
           									 }    
   						  			  });
					}               
                
               	 console.log(dataSource);
                    $("#activities-listview").kendoMobileListView({
                	style: "inset",    
           		 dataSource: dataSource,
	                template: kendo.template($("#activityTemplate").html()),
            		endlessScroll: true,
            		scrollTreshold: 30,
            			click: function (e) {
	
                        }
        			});
                	$("#activities-listview").data("kendoMobileListView").dataSource.fetch();
                    $("#activities-listview").data("kendoMobileListView").refresh();
             */   
				//	}());             

/*                $("#activities-listview").kendoMobileListView({
				 	dataSource: dataSource,
	                 template: kendo.template($("#activityTemplate").html()),
				 	//template: $("#activityTemplate").html(),
     				endlessScroll: true,
					 scrollTreshold: 30
    			});
*/                
                
               // if ($("#activities-listview").data("kendoMobileListView") == undefined) {
     	
				/*}else {
                                        console.log("hello2");
    				$("#activities-listview").data("kendoMobileListView").dataSource = dataSource;
    				$("#activities-listview").data("kendoMobileListView").refresh();
				}*/
                
            };
        



        return {
            //activities: activitiesModel.activities,
            //groupData:GroupsModel.groupData,
            //userData:UsersModel.userData,
            activitySelected: activitySelected,
            groupSelected:groupSelected,
            notificationSelected:notificationSelected,
            CreatedAtFormatted:CreatedAtFormatted,          
            inAppBrowser:inAppBrowser,          
            manageGroup:manageGroup,
            showLiveData:showLiveData,
            makeCall:makeCall,
            replyUser:replyUser,
            sendNotification:sendNotification,
			about:about,
            setting:setting,
            info:info,
            init:init,
            show:show,
            afterShow:afterShow,
            refreshButton:refreshButton
        };

    }());

    return activitiesViewModel;

}());
