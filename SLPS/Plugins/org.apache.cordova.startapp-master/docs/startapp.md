cordova-plugin-startapp
===========================================================================

Phonegap 3.*.* plugin for check or launch other application in android device.


Install: ```cordova plugin add https://github.com/lampaa/org.apache.cordova.startapp.git```

Delete:  ```cordova plugin rm org.apache.cordova.startapp```

use: 

**Check the application is installed**

```js
navigator.startApp.check("com.example.hello", function(message) { /* success */
	console.log(message); // => OK
}, 
function(error) { /* error */
	console.log('47', error);
});
```
/**
 * This method opens an aplication.
 * The JSONArray is expected as follows:
 * arg[0] package name
 * arg[1] Activity Name
 * arg[2] URI
 * The second argument of the method is a Callbackcontext.
 */
public void start(JSONArray args, CallbackContext callback) {

    Intent launchIntent;
    String packageName;
    String activity;
    String uri;
    ComponentName comp;

    try {
        packageName = args.getString(0); //com.android.vending
        activity    = args.getString(1); //com.google.android.finsky.activities.LaunchUrlHandlerActivity
        uri         = args.getString(2); //'market://details?id=com.triplingo.enterprise'

        launchIntent = this.cordova.getActivity().getPackageManager().getLaunchIntentForPackage(packageName);
        comp = new ComponentName(packageName, activity);
        launchIntent.setComponent(comp);
        launchIntent.setData(Uri.parse(uri));

        this.cordova.getActivity().startActivity(launchIntent);
        callback.success();
    } catch (Exception e) {
        callback.error(e.toString());
    }
}