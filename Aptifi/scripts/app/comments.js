/**
 * Comments view model
 */
var app = app || {};

 /*app.Comments = (function () {
   
	var data;
    var commentsViewModel = (function () {
        var profileUserId;
        //var adminId = app.getAdminId();
        var commentModel = {
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
            },
            User: function () {
                var userId = this.get('UserId');
                profileUserId= userId;
                var user = $.grep(app.Users.users(), function (e) {
                    return e.Id === userId;
                })[0];
                return user ? user.DisplayName : 'Anonymous';    
            }
        };
        
        var commentsDataSource = new kendo.data.DataSource({
            type: 'everlive',
            schema: {
                model: commentModel
            },
            transport: {
                typeName: 'NotificationReply'
            },
            //serverFiltering: true,
            change: function (e) {

                if (e.items && e.items.length > 0) {
                    $('#comments-listview').kendoMobileListView({
                        dataSource: e.items,
                        template: kendo.template($('#commentsTemplate').html())
                    });
                } else {
                    $('#comments-listview').empty();
                }

            },
            sort: { field: 'CreatedAt', dir: 'desc' }
        });
    	
        console.log(commentsDataSource.data().length);
        
        return {
            comments: commentsDataSource
        };
        
    }());
    
    
    
    return commentsViewModel;
*/
}());
