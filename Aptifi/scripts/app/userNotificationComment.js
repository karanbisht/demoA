/**
 * Activity view model
 */

var app = app || {};

app.userNotiComment = (function () {
    'use strict'
    
    var $commentsContainer,
        listScroller;
    
    var userActivityViewModel = (function () {
        
      var activityUid,activity,custId;
         // $activityPicture;
      var org_id;
      var notiId;  
      var customerID;
        
      var init = function () {
			
      };
                
        var data;          
        
        var replyButton = function(){
         if (app.checkConnection()) {
             console.log(activity);
             var notificationId = activity.notification_id;             
             app.mobileApp.navigate('views/addCommentView.html?notificationId='+notificationId);            
             
         } else {
              app.showAlert("You are currently offline , can't reply to post " , "Offline Mode");
                }
        };
        

        var show = function (e) {
            //var cUserId = app.Users.currentUser.get('data').Id;
            //var adminId = localStorage.getItem("adminId");

            var userName = localStorage.getItem("userfName");	
             
            $commentsContainer = $('#comments-listview');
            $commentsContainer.empty();        
            listScroller = e.view.scroller;
            listScroller.reset();
            
            var message = e.view.params.message;
  		  var title = e.view.params.title;
            org_id = e.view.params.org_id;
            notiId = e.view.params.notiId;
            var comment_allow = e.view.params.comment_allow;
            customerID = e.view.params.customerID;
			var userName = e.view.params.userName;
            
            console.log(message+"||"+title);
            
            if(comment_allow===0){
                $("#commentPanel").hide();
            }
                       
            $("#personName").html(title);
            $("#activityText").html(message);
                      
           // kendo.bind(e.view.element, datasource, kendo.mobile.ui);
            
                        
          //  var notificationId = activity.notification_id; 
            
            var userCommentModel = {
            id: 'Id',
            fields: {
                comment: {
                    field: 'comment',
                    defaultValue: ''
                },
                user_id: {
                    field: 'user_id',
                    defaultValue:''
                }, 
                add_date: {
                    field: 'add_date',
                    defaultValue: new Date()
                }
            },
            CreatedAtFormatted: function () {
                console.log(this.get('add_date'));
                return app.helper.formatDate(this.get('add_date'));
            },
            User: function () {
                console.log(this.get('user_id'));                
                 if(this.get('user_type')==="Customer"){
					return userName;                    
                }else{
                    return 'Admin';
                }
            }
        };
            
           
            var userCommentsDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/getComment/"+org_id+"/"+notiId+"/"+customerID,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {
               model: userCommentModel,
                                
                 data: function(data)
  	             {
                       console.log(data);
               
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
                                    console.log(groupValue);
                                     
                                     var returnMsg =groupValue[0].Msg;
                                     console.log(returnMsg);
                                     if(returnMsg==='Success'){
                                     var commentLength=groupValue[0].AllComment.length;                                    
                                     console.log(commentLength);                            
                                     for(var j=0;j<commentLength;j++){
                                     groupDataShow.push({
                                         comment: groupValue[0].AllComment[j].comment,
                                         add_date: groupValue[0].AllComment[j].add_date,
									     user_type: groupValue[0].AllComment[j].user_type,
										 user_id: groupValue[0].AllComment[j].user_id
                                         //notification_id: groupValue[0].replyData[j].notification_id,
                                         //send_date:groupValue[0].replyData[j].send_date,
                                         //title:groupValue[0].replyData[j].title,
                                         //type:groupValue[0].replyData[j].type

                                     });
                                        // console.log(groupValue[0].replyData[j].comment); 

                                   }
                                  } 
                                 });
                       
		                        // console.log(groupDataShow);
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
         
            
            userCommentsDataSource.fetch(function() {
                
 		   });

             $("#userComments-listview").kendoMobileListView({
  		    template: kendo.template($("#userCommentsTemplate").html()),    		
     		 dataSource: userCommentsDataSource,
        		schema: {
           		model:  userCommentModel
				}			 
		     });                                
        };
        
        
        
        
        
        
         var saveAdminComment = function () {    
            console.log('click save');
                   
            var comment =$("#newAdminComment").val();
              
            console.log("SHOWING DATA" + org_id +"||"+notiId+"||"+comment+"||"+customerID);
                
          var jsonDatacomment = {"org_id":org_id,"notification_id":notiId, "comment":comment,"customer_id":customerID}
                   
          var saveCommentDataSource = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/orgReply",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDatacomment
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
	            
         	  saveCommentDataSource.fetch(function() {
                         var commentDataView = saveCommentDataSource.data();
						 console.log(commentDataView);
               		  $.each(commentDataView, function(i, commentData) {           
                               console.log(commentData.status[0].Msg);
                             if(commentData.status[0].Msg === 'Reply sent successfully'){
                                 //app.showAlert("Reply sent successfully","Notification");
                                 $("#newAdminComment").val('');
                             }else{
                                 app.showAlert(commentData.status[0].Msg ,'Notification'); 
                             }
                               
                         });
               });
  
        };

        
        
        
        
        
        
        var removeActivity = function () {
            
            var activities = app.Activities.activities;
            var activity = activities.getByUid(activityUid);
            
            app.showConfirm(
                appSettings.messages.removeActivityConfirm,
                'Delete Activity',
                function (confirmed) {
                    if (confirmed === true || confirmed === 1) {
                        
                        activities.remove(activity);
                        activities.one('sync', function () {
                            app.mobileApp.navigate('#:back');
                        });
                        activities.sync();
                    }
                }
            );
        };
        
        return {
           init: init,
           show: show,
           remove: removeActivity,
           saveAdminComment:saveAdminComment, 
           replyButton:replyButton
        };
        
    }());
    
    return userActivityViewModel;
    
}());
