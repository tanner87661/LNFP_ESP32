void establishWifiConnection(AsyncWebServer * webServer,DNSServer * dnsServer)
{
    AsyncWiFiManager wifiManager(webServer,dnsServer);
    //reset settings - for testing
    //wifiManager.resetSettings();

    if (useStaticIP) //set static IP information, if DHCP is not used for STA connection
    {
      Serial.println("Set Static IP Mode");
      wifiManager.setSTAStaticIPConfig(static_ip, static_gw, static_nm, static_dns);
    }

    if ((wifiCfgMode & 0x01) > 0)  //only STA mode is used, so wifiManager can handle AP selection and password
        wifiManager.autoConnect("IoTT_ESP32_");
     
    Serial.println(wifiCfgMode);
    if ((wifiCfgMode & 0x02) > 0) //if AP is needed, define the AP settings
    {
      wifiManager.setAPStaticIPConfig(ap_ip, ap_ip, ap_nm);
      WiFi.softAPConfig(ap_ip, ap_ip, ap_nm);
      WiFi.softAP(devName.c_str(), apPassword.c_str());
      Serial.println(" Set Access Point Mode");
    }
    switch (wifiCfgMode) //set the wifi mode, STA, AP or both
    {
      case 0x01 : WiFi.mode(WIFI_STA); break;
      case 0x02 : WiFi.mode(WIFI_AP); break;
      case 0x03 : WiFi.mode(WIFI_AP_STA); break;
      default: WiFi.mode(WIFI_AP_STA); break;
    }
}

void checkWifiTimeout() //check if wifi can be switched off
{
  if (!wifiCancelled)
    if (!wifiAlwaysOn)
      if (millis() > (lastWifiUse + wifiShutTimeout))
      {
        wifiCancelled = true;
        WiFi.disconnect(); 
        WiFi.mode(WIFI_OFF);
//        WiFi.forceSleepBegin();
        delay(1); 
        Serial.println("Wifi disabled. Reset device to re-enable");
      }
}

void getInternetTime(NTPtime * NTPch) //periodically connect to an NTP server and get the current time
{
  int thisIntervall = ntpIntervallDefault;
  if (!ntpOK)
    thisIntervall = ntpIntervallShort;
  if (millis() > (ntpTimer + thisIntervall))
  {
    if (WiFi.status() == WL_CONNECTED)
    {
      dateTime = NTPch->getNTPtime(ntpTimeZone, 2);
      if (!dateTime.valid)
      {
        ntpOK = false;
        return;
      }
      setTime(dateTime.hour, dateTime.minute, dateTime.second, dateTime.day, dateTime.month, dateTime.year);
      ntpTimer = millis();
      NTPch->printDateTime(dateTime);
      ntpOK = true;
    }
  }
}
