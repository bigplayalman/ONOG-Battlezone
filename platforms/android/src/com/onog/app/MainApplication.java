package com.onog.app;  //REPLACE THIS WITH YOUR package name

import android.app.Application;
import com.parse.Parse;
import com.parse.ParseInstallation;

public class MainApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        Parse.initialize(this, "nYsB6tmBMYKYMzM5iV9BUcBvHWX89ItPX5GfbN6Q", "rocr0YBaRQ1GiNFdX5mwfdp3OauhRXypXtO7GvaC");
        ParseInstallation.getCurrentInstallation().saveInBackground();
    }
}
