/**
 * Activity view model
 */

var app = app || {};

app.Activity = (function () {
    'use strict'
    
    var $commentsContainer,
        listScroller;
    
    var activityViewModel = (function () {
        
      var activityUid,activity;
           // $activityPicture;
        
      var init = function () {
                 if (app.checkConnection()) {  
		 			 //getReplyPost();
                  }             
      };
        
        
        var data;          
        var len = null;
        var getReplyPost = function(){
    	//console.log(app.Comments.comments);
        //console.log(app.Comments.comments.data());
            
            app.Comments.comments.fetch(function(){
     		           data = app.Comments.comments.data();
                		console.log(data);
            			len = data.length;
            			console.log(data.length);
                        var db = app.getDb();             
						db.transaction(insertNotificationReply, app.onError, app.onSuccess);
        				//db.transaction(insertNotification, errorCB, successCB);
    		    });
           };              
        
        var insertNotificationReply = function(tx){
			var query = "DELETE FROM NotificationReply";
		    app.deleteQuery(tx, query);

           for (var i = 0; i < len; i++) {
            //console.log("DATA FROM INTERNAL DATABASE"+data[i].ReplyText+'","'+data[i].CreatedAt+'","'+ data[i].NotificationId +'","' + data[i].UserId);
     		var UserNameValue = getUserName(data[i].UserId);
            console.log(UserNameValue);                  
    	     var queryInsert = 'INSERT INTO NotificationReply (ReplyText,UserNameField ,CreatedAt,NotificationId,UserId) VALUES ("'+ data[i].ReplyText+'","'+UserNameValue+'","'+data[i].CreatedAt+'","'+ data[i].NotificationId +'","' + data[i].UserId+'")';
			 app.insertQuery(tx,queryInsert);  	
           }   
       };
        
        
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
             app.mobileApp.navigate('views/addCommentView.html');
         } else {
              app.showAlert("You are currently offline , can't reply to post " , "Offline Mode");
                }
        };
        

        var show = function (e) {
            //var cUserId = app.Users.currentUser.get('data').Id;
            //var adminId = localStorage.getItem("adminId");

            var userIype = localStorage.getItem("UserType");	
            if(userIype==="O"){
                $("#replyButton").hide();
            }
            
            $commentsContainer = $('#comments-listview');
            $commentsContainer.empty();        
            listScroller = e.view.scroller;
            listScroller.reset();
            
            activityUid = e.view.params.uid;
            console.log(activityUid);
            // Get current activity (based on item uid) from Activities model
            activity = app.Activities.activities.getByUid(activityUid);
            console.log(activity);
           // $activityPicture[0].style.display = activity.Picture ? 'block' : 'none';
            kendo.bind(e.view.element, activity, kendo.mobile.ui);
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
        
        return {
           init: init,
           show: show,
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
