

var app = app || {};

app.userMessageWindow = (function () {
    'use strict'
    
    var adminActivityViewModel = (function () {
        
      var activityUid,activity;

        
        
        var show = function (e) {
			console.log("Inner Page");           
            activityUid = e.view.params.uid;
            console.log(activityUid);
 
            activity = app.groupDetail.userData.getByUid(activityUid);
            console.log(activity);
         };
               
        
        
        return {
           show: show
        };
        
    }());
    
    return adminActivityViewModel;
    
}());
