/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */
package org.apache.cordova.startapp;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.net.Uri;
import android.content.Context;
import android.content.Intent;
import android.content.ComponentName;
import android.content.pm.PackageManager;

/**
 * This class provides access to vibration on the device.
 */
public class startApp extends CordovaPlugin {
    
    /**
     * Constructor.
     */
    public startApp() {
    }
    
    /**
     * Executes the request and returns PluginResult.
     *
     * @param action          The action to execute.
     * @param args            JSONArray of arguments for the plugin.
     * @param callbackContext The callback context used when calling back into JavaScript.
     * @return True when the action was valid, false otherwise.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("start")) {
            this.start(args, callbackContext);
        } else if (action.equals("check")) {
            this.check(
                       args.getString(0),
                       callbackContext,
                       this.cordova.getActivity().getApplicationContext()
                       );
        }
        
        return true;
    }
    
    
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
            packageName = args.getString(0);
            activity    = args.getString(1);
            uri         = args.getString(2);
            
            launchIntent = this.cordova.getActivity().getPackageManager().getLaunchIntentForPackage(packageName);
            
            launchIntent.setData(Uri.parse(uri));
            launchIntent.addCategory(Intent.CATEGORY_DEFAULT);
            launchIntent.addCategory(Intent.CATEGORY_BROWSABLE);
            launchIntent.addCategory(Intent.CATEGORY_LAUNCHER);
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            launchIntent.setClassName(packageName, activity);
            launchIntent.setAction(Intent.ACTION_VIEW);
            launchIntent.putExtra(Intent.EXTRA_TEXT, uri);
            
            this.cordova.getActivity().startActivity(launchIntent);
            callback.success();
        } catch (Exception e) {
            callback.error(e.toString());
        }
    }
    
    /**
     * This method check is a specific aplication ins installed.
     */
    public void check(String component, CallbackContext callback, Context context) {
        PackageManager pm = context.getPackageManager();
        try {
            pm.getPackageInfo(component, PackageManager.GET_ACTIVITIES);
            callback.success();
        } catch (Exception e) {
            callback.error(e.toString());
        }
    }
}
