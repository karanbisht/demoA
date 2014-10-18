package com.sakshay.aptifi;

import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;
import android.widget.Toast;

public class SmsListener extends BroadcastReceiver {

	private SharedPreferences preferences;
	Context currentContext = null;

	@Override
	public void onReceive(Context context, Intent intent) {
		// TODO Auto-generated method stub
		Log.i("SMS_Listener", "SMS_Listener");
		currentContext = context;
		if (intent.getAction()
			.equals("android.provider.Telephony.SMS_RECEIVED")) {
			Bundle bundle = intent.getExtras(); // ---get the SMS message passed
												// in---
			SmsMessage[] msgs = null;
			String msg_from;
			if (bundle != null) {
				// ---retrieve the SMS message received---
				try {
					Object[] pdus = (Object[]) bundle.get("pdus");
					msgs = new SmsMessage[pdus.length];
					for (int i = 0; i < msgs.length; i++) {
						msgs[i] = SmsMessage.createFromPdu((byte[]) pdus[i]);
						msg_from = msgs[i].getOriginatingAddress();
						String msgBody = msgs[i].getMessageBody();

						//if (msg_from.equals("DT-PARAMT")) {
							 Toast.makeText(context, msgBody,Toast.LENGTH_LONG).show();
						
							// Intent dialogIntent=new Intent(currentContext,SMSDialogActivity.class); 
							// dialogIntent.putExtra("message", msgBody);
							 //currentContext.startActivity(dialogIntent);
						//}
					}
				} catch (Exception e) {
					// Log.d("Exception caught",e.getMessage());
				}
			}
		}
	}
}