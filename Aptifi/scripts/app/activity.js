/**
 * Activity view model
 */

var app = app || {};

app.Activity = (function () {
    'use strict'
    
    var $commentsContainer,listScroller;    
    var org_id;
    var notiId;
    var account_Id;
    var commentsDataSource;        
    var message;
    var title;
    var comment_allow;
    var attached;
    var groupDataShow = [];
    var lastNotiCommentID;
    
    var activityViewModel = (function () {
        
      var activityUid,activity;
           // $activityPicture;
        
      var init = function () {
                 if (app.checkConnection()) {  
		 			 getuserName();
                  }             
      };
                
        var data;          
        var len = null;
        var userFirstName;
        var myScroll;

        var getuserName = function(){
            var db = app.getDb();             
			db.transaction(getProfileInfo, app.onError, app.onSuccess);
    	};
                        
        
        var getProfileInfo = function(tx){
			var query = "select first_name FROM PROFILE_INFO";
		    app.selectQuery(tx, query, orgDataProfileSuccess);
       };
        
        
        var orgDataProfileSuccess = function(tx, results){
         var count = results.rows.length;
			if (count !== 0) {
		 		userFirstName = results.rows.item(0).first_name;
			}
        }
        
        var getUserName = function(idValue){
                var userId = idValue;
                var user = $.grep(app.Users.users(), function (e) {
                    return e.Id === userId;
                })[0];
                return user ? user.DisplayName : 'Anonymous';
        };
        
        var befShow = function(){    
                if (app.checkConnection()) {
                    console.log("online");
                } else {
                    console.log("offline");
                    //var db = app.getDb();
					//db.transaction(offlineQueryReplyDB, app.onError, offlineQueryReplyDBSuccess);
                }
        };
      
        var replyButton = function(){
         if (app.checkConnection()) {
             console.log(activity);
             var notificationId = activity.notification_id;             
             app.mobileApp.navigate('views/addCommentView.html?notificationId='+notificationId);            
             
         } else {
              app.showAlert("You are currently offline , can't reply to post " , "Offline Mode");
                }
        };
        
        function loaded() {
        setTimeout(function() {    
            myScroll = new iScroll('notiImage', {
			bounce : false,
			zoom : true,
            zoomMax: 4,
            momentum: false,
			hScrollbar: false,
			vScrollbar: false    
		   });
         }, 100);
            
		}

		//document.addEventListener('DOMContentLoaded', loaded, false);
  
        document.addEventListener('touchmove', function(e) {
			e.preventDefault();
		}, false);

        var show = function (e) {
            groupDataShow = [];            
            //var cUserId = app.Users.currentUser.get('data').Id;
            //var adminId = localStorage.getItem("adminId");

            //var userIype = localStorage.getItem("UserType");
            //var userName = localStorage.getItem("userfName");	
            //var userOrgName = localStorage.getItem("userOrgName");	

            /*if(userIype==="O"){
                $("#replyButton").hide();
            }*/
             
            $commentsContainer = $('#comments-listview');
            $commentsContainer.empty();        
            listScroller = e.view.scroller;
            listScroller.reset();
            

            message =e.view.params.message;
            title =e.view.params.title;
            org_id =e.view.params.org_id;
            notiId =e.view.params.notiId;
            account_Id =e.view.params.account_Id;
            comment_allow = e.view.params.comment_allow;
            attached = e.view.params.attached;
            var attachedImg ='http://54.85.208.215/assets/attachment/'+attached;
            
            console.log(attached);
            
            if(attached!== null && attached!==''){

            $('#notiImage').css({"height":"200px"});
            $('#notiImage').css({"width":'auto'});
            $('#notiImage').css({"margin-top":"10px"});    

            loaded();
            var img = $('<img id="imgShow" style="width:100%;height:100%" />'); //Equivalent: $(document.createElement('img'))
			img.attr('src', attachedImg);
			img.appendTo('#notiImage'); 
                
            console.log('Image Saving Process');    
            console.log(attachedImg);
            app.mobileApp.pane.loader.show();                
    
            var imgPathData = app.getfbValue();    
            var fp = imgPathData+"/Aptifi/"+attached;
                //alert(fp);
    		var fileTransfer = new FileTransfer();
   		 
                
                fileTransfer.download(attachedImg,fp,  
        			function(entry) {
                        app.mobileApp.pane.loader.hide();
            			//alert("download complete: " + entry.fullPath);
	        		},
    
    		        function(error) {
                        app.mobileApp.pane.loader.hide();
            			//alert("download error source " + error.source);
            			//alert("download error target " + error.target);
            			//alert("upload error code" + error.code);
	        		}
	    		);    
            }
            
            
            
           // $("#notiImage").attr('src', attachedImg);
            
            if(comment_allow===1 || comment_allow==='1'){
                $("#commentPanel").show();                
            }else{
                $("#commentPanel").hide();
            }
            
            
            console.log(org_id+"||"+notiId+"||"+account_Id);
            
            $("#personName").html(title);
            $("#activityText").html(message);
            
            //console.log(activityUid);
            //console.log(activityUid.message);
            //activity = app.OragnisationList.organisationSelected.getByUid(activityUid);
            //console.log(activity);
            // $activityPicture[0].style.display = activity.Picture ? 'block' : 'none';
            //kendo.bind(e.view.element, activity, kendo.mobile.ui);
            
            //var userId = localStorage.getItem("UserID");
            
            //var notificationId = activity.notification_id; 
            
               
           var db = app.getDb();
		   db.transaction(getDataOrgNotiComment, app.errorCB, commentShow);         
 
        };
        
        var commentShow = function(){
            var commentModel = {
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
                //console.log(this.get('user_id'));                
                //var serUserId = this.get('user_id');
                if(this.get('user_type')==="Customer"){
					return userFirstName;                    
                }else{
                    return 'Admin';
                }
                //return user ? user.DisplayName : 'Anonymous';    
            }
        };
            
            console.log(org_id+"/"+notiId+"/"+account_Id+"/"+lastNotiCommentID);

            
            commentsDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/getNotificationComment/"+org_id+"/"+notiId+"/"+account_Id+"/"+lastNotiCommentID,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {
               model: commentModel,
                                
                 data: function(data)
  	             {
                       console.log(data);
               
                                 $.each(data, function(i, groupValue) {
                                    console.log(groupValue);
                                     
                                     var returnMsg =groupValue[0].Msg;
                                     var orgNotiCommentData;
                                     console.log(returnMsg);//No Comments 
                                     if(returnMsg==='Success'){
                                     var commentLength=groupValue[0].AllComment.length;
                                         orgNotiCommentData=groupValue[0].AllComment;
                                         console.log(commentLength);
                              
                                     for(var j=0;j<commentLength;j++){
                                      groupDataShow.push({
                                         comment: groupValue[0].AllComment[j].comment,
                                         add_date: groupValue[0].AllComment[j].add_date,
                                         user_id : groupValue[0].AllComment[j].user_id,
                                         user_type : groupValue[0].AllComment[j].user_type
                                      });
                                     }
                                     saveOrgNotiComment(orgNotiCommentData);    
                                  } 
                                 });
                       
		                        // console.log(groupDataShow);
                                   return groupDataShow;
                       
                       }                       
            },
	            error: function (e) {
    	           //apps.hideLoading();
        	       console.log(e);
            	   /*navigator.notification.alert("Please check your internet connection.",
               	function () { }, "Notification", 'OK');
                   */
           	}
	        
    	    });         
         
            
            
            //commentsDataSource.fetch(function() {               
 		   //});

             $("#comments-listview").kendoMobileListView({
  		    template: kendo.template($("#commentsTemplate").html()),    		
     		 dataSource: commentsDataSource,
              pullToRefresh: true,   
        		schema: {
           		model:  commentModel
				}			 
		     });

        };
        
        
        
       var orgNotiCommentDataVal;
        
      function saveOrgNotiComment(data) {
            orgNotiCommentDataVal = data;      
			var db = app.getDb();
			db.transaction(insertOrgNotiCommentData, app.errorCB, app.successCB);
      };
            
            
     function insertOrgNotiCommentData(tx){
        //var query = "DELETE FROM ORG_NOTIFICATION";
		//app.deleteQuery(tx, query);

        var dataLength = orgNotiCommentDataVal.length;
        //alert('LiveDataVal'+dataLength);
         
 
       for(var i=0;i<dataLength;i++){       
    	   var query = 'INSERT INTO ORG_NOTI_COMMENT(id,notification_id, comment, add_date, reply_to, reply_to_id, user_id, user_type) VALUES ("'
				+ orgNotiCommentDataVal[i].id
				+ '","'
				+ orgNotiCommentDataVal[i].notification_id
				+ '","'
				+ orgNotiCommentDataVal[i].comment
           	 + '","'
				+ orgNotiCommentDataVal[i].add_date
    	        + '","'
			    + orgNotiCommentDataVal[i].reply_to
                + '","'
				+ orgNotiCommentDataVal[i].reply_to_id
                + '","'
				+ orgNotiCommentDataVal[i].user_id
                + '","'
				+ orgNotiCommentDataVal[i].user_type
				+ '")';              
                app.insertQuery(tx, query);
        }                               
      }
        
        
      var getDataOrgNotiComment = function(tx){
            var query = 'SELECT * FROM ORG_NOTI_COMMENT where notification_id='+notiId ;
			app.selectQuery(tx, query, getOrgNotiCommentDataSuccess);
        };    
                        
            
      function getOrgNotiCommentDataSuccess(tx, results) {
			var count = results.rows.length;  
            //lastNotiCommentID = count;
            //alert(count);
			if (count !== 0) {
                groupDataShow=[];
            	for(var i =0 ; i<count ; i++){    
                    groupDataShow.push({
                                         comment: results.rows.item(i).comment,
                                         add_date: results.rows.item(i).add_date,
                                         user_id : results.rows.item(i).user_id,
                                         user_type : results.rows.item(i).user_type
                                      });
                    
                  lastNotiCommentID=results.rows.item(i).id;
        	    }    
                 console.log(lastNotiCommentID);
            }else{
                lastNotiCommentID=0;
            }                       
        };       

  
        
        
        var offlineQueryReplyDB = function(tx){
            var query = 'SELECT ReplyText , CreatedAt FROM NotificationReply';
			app.selectQuery(tx, query, offlineReplyQuerySuccess);
        };
        
        
        var offlineReplyQuerySuccess = function(tx, results) {
			var count = results.rows.length;
            console.log("karan bisht" + count);
			if (count !== 0) {
				for (var i = 0; i < count; i++) {
					var ReplyText = results.rows.item(i).ReplyText;
					var CreatedAt = results.rows.item(i).CreatedAt;
                    var UserNameofflineValue = results.rows.item(i).UserNameField;
                    console.log(UserNameofflineValue); 
					//var NotificationId = results.rows.item(i).NotificationId; 
                    //var UserId = results.rows.item(i).UserId;
                    
                    var template;
                    //if(i===0){
                     //   template = kendo.template($("#commentsTemplate").html());
       				// $("#comments-listview").html(template({User:function(){return UserNameofflineValue;} ,CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,ReplyText: ReplyText}));
       			 //}else{
                        template = kendo.template($("#commentsTemplate").html());
						$("#comments-listview").append(template({User:function(){return UserNameofflineValue;} ,CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,ReplyText: ReplyText}));
                    //}
                 }
       		}else{
                   	$("#comments-listview").html("You are Currently Offline and data not available in local storage");
               }
        };
        
 
		var offlineReplyDBSuccess = function(){
            console.log("Query Success");
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
        
        
        var saveComment = function () {    
            console.log('click save');
            // Validating of the required fields
            //if (validator.validate()) {
                
                // Adding new comment to Comments model
                //var comments = app.Comments.comments;
                //var comment = comments.add();                
                var comment =$("#newComment").val();
                //var org_id = localStorage.getItem("UserOrgID");
 			   //var customer_id = localStorage.getItem("UserID");
                
                console.log("SHOWING DATA" + notiId +"||"+account_Id+"||"+org_id);
                
          var jsonDatacomment = {"notification_id":notiId ,"customer_id":account_Id,"comment":comment, "org_id":org_id}
                   
          var saveCommentDataSource = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/userReply",
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
                                  refreshComment(); 
                             if(commentData.status[0].Msg === 'Reply sent successfully'){
                                 //app.showAlert("Reply sent successfully","Notification");
                                 $("#newComment").val('');
                             }else{
                                 app.showAlert(commentData.status[0].Msg ,'Notification'); 
                             }
                         });
               });


                         
                                
  /*            comment.ReplyText  = $newComment.val();
                comment.UserId = app.Users.currentUser.get('data').Id;
                comment.NotificationId = app.Activity.activity().Id;
                
                comments.one('sync', function () {
                    app.mobileApp.navigate('#:back');
                });
                
                comments.sync();
  */
            //}
            
          
        };

        function refreshComment() {
            console.log('refButton');
            //console.log('save button click');
            //app.mobileApp.navigate('views/activityView.html?message=' + message +'&title='+title+'&org_id='+org_id+'&notiId='+notiId+'&account_Id='+account_Id+'&comment_allow='+comment_allow);
 			   //var certificateList = $('#comments-listview').data('kendoMobileListView');
    			//certificateList.commentsDataSource.read();   // added line
    			//certificateList.refresh();
  
            app.Activity.commentShow();
            
             /*setTimeout(function () {
                 app.mobileApp.navigate('views/activityView.html?message=' + message +'&title='+title+'&org_id='+org_id+'&notiId='+notiId+'&account_Id='+account_Id+'&comment_allow='+comment_allow);
              	$("#comments-listview").kendoMobileListView({            
                  	dataSource: commentsDataSource,
                  	template:  $("#commentsTemplate").text()
              	});
              }, 100);*/
		};
        
                
		
        return {
           init: init,
           show: show,
           saveComment:saveComment,
           commentShow:commentShow, 
           befShow: befShow,
           remove: removeActivity,
           replyButton:replyButton,
           activity: function () {
            return activity;
           },
        };
        
    }());
    
    return activityViewModel;
    
}());
