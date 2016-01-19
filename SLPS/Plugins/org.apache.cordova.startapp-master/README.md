cordova-plugin-startapp
===========================================================================

Phonegap 3.*.* plugin for check or launch other application in android device.


This is a fork of https://github.com/lampaa/org.apache.cordova.startapp which PRINCIPAL DIFFERENCE IS THAT SCHEME IS SUPPORTED


Install: ```cordova plugin add https://github.com/code4jhon/org.apache.cordova.startapp.git```

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


**Start application **

```js
navigator.startApp.start([
	"com.android.vending", // package name
	"com.google.android.finsky.activities.LaunchUrlHandlerActivity", // activity
	"market://details?id=com.facebook.katana" // URI
], function(message) { /* success */
	console.log(message); // => OK
}, 
function(error) { /* error */
	console.log('47', error);
});
```

// you can get package name and activities from the AndroidManifest.xml

**Start application in iOS**

```js
navigator.startApp.start("twitter://", function(message) { /* success */
	console.log(message); // => OK
}, 
function(error) { /* error */
	console.log('47', error);
});
```

**Check application in iOS**

```js
navigator.startApp.check("twitter://", function(message) { /* success */
	console.log(message); // => OK
},
function(error) { /* error */
	console.log('47', error);
});
