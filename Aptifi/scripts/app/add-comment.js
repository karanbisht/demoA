/**
 * AddActivity view model
 */

var app = app || {};

app.AddComment = (function () {
    'use strict'

    var AddCommentViewModel = (function () {
        
        var $newComment;
        var validator;
        var notificationId;
        
        var init = function () {    
            validator = $('#enterComment').kendoValidator().data('kendoValidator');
            $newComment = $('#newComment');
        };
        
        var show = function (e) {    
            // Clear field on view show
            $newComment.val('');
            validator.hideMessages();     
            notificationId = e.view.params.notificationId; 
            console.log("NOTIFICATION"+ notificationId);
            
        };
        
        var saveComment = function () {    
            // Validating of the required fields
            if (validator.validate()) {
                
                // Adding new comment to Comments model
                //var comments = app.Comments.comments;
                //var comment = comments.add();                
                var comment =$newComment.val();
                var org_id = localStorage.getItem("UserOrgID");
 			   var customer_id = localStorage.getItem("UserID");
                
                console.log("SHOWING DATA" + notificationId +"||"+customer_id);
                
          var jsonDatacomment = {"notification_id":notificationId ,"customer_id":customer_id,"comment":comment, "org_id":org_id}
                   
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
                             if(commentData.status[0].Msg === 'Reply sent successfully'){
                                 app.showAlert("Reply sent successfully","Notification");
                                 $("#newComment").val('');
                             }else{
                                 app.showAlert(loginData.status[0].Msg ,'Notification'); 
                             }
                               
                         });
               });

                         
                                
  /*              comment.ReplyText  = $newComment.val();
                comment.UserId = app.Users.currentUser.get('data').Id;
                comment.NotificationId = app.Activity.activity().Id;
                
                comments.one('sync', function () {
                    app.mobileApp.navigate('#:back');
                });
                
                comments.sync();

            */
            }
        };
        
        return {
            init: init,
            show: show,
            me: app.Users.currentUser,
            saveComment: saveComment
        };
        
    }());
    
    return AddCommentViewModel;
    
}());
