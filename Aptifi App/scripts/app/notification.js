var app = app || {};

app.Noti = (function () {
    'use strict'

    var notificationsViewModel = (function () {

        var notiModel = {
            id: 'Id',
            fields: {
                ReplyText: {
                    field: 'ReplyText',
                    defaultValue: ''
                },
                CreatedAt: {
                    field: 'CreatedAt',
                    defaultValue: new Date()
                },
                NotificationId: {
                    field: 'NotificationId',
                    defaultValue: null
                },
                UserId: {
                    field: 'UserId',
                    defaultValue: null
                }
            },
            
            CreatedAtFormatted: function () {
                return app.helper.formatDate(this.get('CreatedAt'));
            }
        };
        
        	var notificationDataSource = new kendo.data.DataSource({
            type: 'everlive',
            schema: {
                model: notiModel
            },
            transport: {
                typeName: 'NotificationReply'
            },
            serverFiltering: true,
          	  change: function (e) {
              	  if (e.items && e.items.length > 0) {
                  	  	$('#notification-listview').kendoMobileListView({
                    		    dataSource: e.items,
                	        	template: kendo.template($('#notificationTemplate').html())
            	       	 });
                		} else {
        	          	  $('#notification-listview').empty();
               	 	}
           	 },
            	sort: { field: 'CreatedAt', dir: 'desc' }
        	});
       	 
        return { 
            notifis: notificationDataSource
        };
        
    }());
    
    return notificationsViewModel;

}());
