package com.acml.gucnotify;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import java.net.HttpURLConnection;
import java.net.URL;

import me.pushy.sdk.Pushy;

public class MainActivity extends AppCompatActivity {

    private class RegisterForPushNotificationsAsync extends AsyncTask<Void, Void, Exception> {
        protected Exception doInBackground(Void... params) {
            try {
                // Assign a unique token to this device
                String deviceToken = Pushy.register(getApplicationContext());

                // Log it for debugging purposes
                Log.d("MyApp", "Pushy device token: " + deviceToken);

                // Send the token to your backend server via an HTTP GET request
                HttpURLConnection httpURLConnection = (HttpURLConnection) new URL("http://10.0.2.2:3000/register/device/" + deviceToken).openConnection();
                httpURLConnection.getResponseCode();
            }
            catch (Exception exc) {
                return exc;
            }

            return null;
        }

        @Override
        protected void onPostExecute(Exception exc) {
            if (exc != null) {
                Toast.makeText(getApplicationContext(), exc.toString(), Toast.LENGTH_LONG).show();
            } else {
                Toast.makeText(getApplicationContext(), "Success", Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Pushy.listen(this);

        if (ContextCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE}, 0);
        }

        if (!Pushy.isRegistered(getApplicationContext())) {
            new RegisterForPushNotificationsAsync().execute();
        }
    }
}
