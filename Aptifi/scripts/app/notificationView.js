/**
 * Activity view model
 */

var app = app || {};

app.Notification = (function () {
    'use strict'
    
    var $notificationContainer;
      //  listScroller;
    
    var notificationViewModel = (function () {
        
        var notificationUid,
            activityNotification;
            //$activityPicture;
        
        var init = function () {
           $notificationContainer = $('#notification-listview');
           // $activityPicture = $('#picture');
        };
        
        var show = function (e) {
            
            $notificationContainer.empty();  
            //listScroller = e.view.scroller;
            //listScroller.reset();
            
            notificationUid = e.view.params.uid;
            // Get current activity (based on item uid) from Activities model
            
            activityNotification = app.Activities.notifyMe.getByUid(notificationUid);
            
            //$activityPicture[0].style.display = activity.Picture ? 'block' : 'none';
           
            
            app.Noti.notifis.filter({
                field: 'NotificationId',
                operator: 'eq',
                value: activityNotification.Id
            });
            
            kendo.bind(e.view.element, activityNotification, kendo.mobile.ui);
            
        };
        
        /*var removeActivity = function () {
            
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
        };*/
        
        return {
            init: init,
            show: show,
            //remove: removeActivity,
            activityNotification: function () {
                return activityNotification;
            },
        };
        
    }());
    
    return notificationViewModel;
    
}());
