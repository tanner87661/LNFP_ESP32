const String BBVersion = "1.2.0";

//#define measurePerformance //uncomment this to display the number of loop cycles per second


//Arduino published libraries. Install using the Arduino IDE or download from Github and install manually
#include <arduino.h>
#include <WiFi.h>
#include <time.h>
#include <ESPAsyncWebServer.h>
#include <DNSServer.h>
#include <ESPAsyncWiFiManager.h>         //https://github.com/alanswx/ESPAsyncWiFiManager
#include <SPIFFS.h>
#define FORMAT_SPIFFS_IF_FAILED true
#include <ArduinoJson.h> //standard JSON library, can be installed in the Arduino IDE. Make sure to use version 6.x
#include <NmraDcc.h> //install via Arduino IDE
#include <M5StickC.h>

//following libraries can be downloaded from https://github.com/tanner87661?tab=repositories
#include <IoTT_DigitraxBuffers.h> //as introduced in video # 30
#include <IoTT_Mux64Buttons.h> //as introduced in video # 29
#include <IoTT_LocoNetButtons.h> //as introduced in video # 29
#include <IoTT_LEDChain.h> //as introduced in video # 30
#include <IoTT_LocoNetHBESP32.h> //this is a hybrid library introduced in video #29
#include <IoTT_MQTTESP32.h> //as introduced in video # 29
#include <IoTT_Gateway.h> //as introduced in video # 29
//#include <IoTT_SecurityElements.h> //not ready yet. This is the support for ABS/APB as described in Videos #20, 21, 23, 24

//library object pointers. Libraries will be dynamically initialized as needed during the setup() function
AsyncWebServer * myWebServer = NULL; //(80)
DNSServer * dnsServer = NULL;
//WiFiClientSecure * wifiClientSec = NULL;
WiFiClient * wifiClient = NULL;
AsyncWebSocket * ws = NULL; //("/ws");
AsyncWebSocketClient * globalClient = NULL;
uint16_t wsReadPtr = 0;
char wsBuffer[16384]; //should this by dynamic?

//global variables
bool useStaticIP = false;
IPAddress static_ip;
IPAddress static_gw;
IPAddress static_nm;
IPAddress static_dns;
IPAddress ap_ip;
IPAddress ap_nm(255,255,255,0);

uint8_t wifiCfgMode = 0x00; //1: STA, 2: AP, 3: STA+AP
String devName; //device name used for AP, will load from node.cfg
String apPassword; //AP password, will load from node.cfg

bool wifiAlwaysOn = true; //set to false to shut Wifi after some time of inactivity. Gateway and MQTT should be disabled, though
bool wifiCancelled = false; //true if Wifi was switched off due to no use
uint32_t lastWifiUse = millis();
#define wifiShutTimeout 120000 //after 2 Mins of not using, Wifi is closed
#define keepAliveInterval 30000 //send message every 30 secs to keep connection alive
uint32_t keepAlive = millis(); //timer used for periodic message sent over wifi to keep alive while browser is connected. Sent over websocket connection
#define dispStatusInterval 200 //refresh DCC Viewer every 200ms with circular commands
uint32_t dispStatusTimer = millis();

//more library object pointers. Libraries will be dynamically initialized as needed during the setup() function
IoTT_Mux64Buttons * myButtons = NULL;
IoTT_LocoNetButtonList * buttonHandler = NULL; 
//IoTT_SecurityElementList * secElHandlerList = NULL;
LocoNetESPSerial * lnSerial = NULL;
ln_mqttGateway * commGateway = NULL;
IoTT_ledChain * myChain = NULL;
MQTTESP32 * lnMQTT = NULL;
NmraDcc  * myDcc = NULL;

//some variables used for performance measurement
#ifdef measurePerformance
uint16_t loopCtr = 0;
uint32_t myTimer = millis() + 1000;
#endif

//********************************************************Hardware Configuration******************************************************
#define LED_DATA_PIN 12 //this is used to initialize the FastLED template
#define LED_CLOCK_PIN 13 //this is used to initialize the FastLED template
//***********************************************************************************************************************************

//global variables for the NTP module
int ntpTimeout = 5000; //ms timeout for NTP update request
char ntpServer[50] = "us.pool.ntp.org"; //default server for US. Change this to the best time server for your region, or set in node.cfg
char ntpTimeZone[100] = "EST5EDT";  // default for Eastern Time Zone. Enter your time zone from here: (https://remotemonitoringsystems.ca/time-zone-abbreviations.php) into node.cfg
bool ntpOK = false;
bool useNTP = false;
tm timeinfo;
time_t now;
const uint32_t ntpIntervallDefault = 86400000; //1 day in milliseconds
const uint32_t ntpIntervallShort = 10000; //10 Seconds in case something went wrong
uint32_t ntpTimer = millis();
//strDateTime dateTime;

//commMode: 0: DCC, 1: LocoNet, 2: MQTT, 3: Gateway
//workMode: 0: Decoder, 1: ALM
// Decoder Mode allows for commModes 0,1,2
// ALM Mode allows for commModes 1,2,3
uint8_t commMode = 0xFF;
uint8_t modMode = 0xFF;

File uploadFile; //used for web server to upload files

//this is the outgoing communication function for IoTT_DigitraxBuffers.h, routing the outgoing messages to the correct interface
uint16_t sendMsg(lnTransmitMsg txData)
{
  switch (commMode)
  {
    case 1: if (lnSerial) lnSerial->lnWriteMsg(txData); break;
    case 2: if (lnMQTT) lnMQTT->lnWriteMsg(txData); break;
    case 3: if (commGateway) 
            { 
              Serial.println("Calling Gateway"); 
              commGateway->lnWriteMsg(txData); 
            }
            break;
  }
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);

  Serial.println("Init SPIFFS");
  SPIFFS.begin(); //File System. Size is set to 1 MB during compile time and loaded with configuration data and web pages

  myWebServer = new AsyncWebServer(80);
  dnsServer = new DNSServer();
  wifiClient = new WiFiClient();
  uint16_t wsRequest = 0;
  ws = new AsyncWebSocket("/ws");

  DynamicJsonDocument * jsonConfigObj = NULL;
  DynamicJsonDocument * jsonDataObj = NULL;
  jsonConfigObj = getDocPtr("/configdata/node.cfg"); //read and decode the master config file. See ConfigLoader tab
  if (jsonConfigObj != NULL)
  {
    //first, read all Wifi Paramters
    if (jsonConfigObj->containsKey("wifiMode"))
      wifiCfgMode = (*jsonConfigObj)["wifiMode"];
    Serial.println(wifiCfgMode);
    if (jsonConfigObj->containsKey("useWifiTimeout"))
      wifiAlwaysOn =  (!(bool)(*jsonConfigObj)["useWifiTimeout"]);
    if (jsonConfigObj->containsKey("devName"))
    {
      String thisData = (*jsonConfigObj)["devName"];
      devName = thisData;
    }
    if ((*jsonConfigObj)["inclMAC"])
      devName += String((uint32_t)ESP.getEfuseMac());
    if ((*jsonConfigObj)["useStaticIP"])
      useStaticIP = (bool)(*jsonConfigObj)["useStaticIP"];
    if (useStaticIP && jsonConfigObj->containsKey("staticConfig"))
    {
      String thisIP = (*jsonConfigObj)["staticConfig"]["staticIP"];
      static_ip.fromString(thisIP);
      String thisGW = (*jsonConfigObj)["staticConfig"]["staticGateway"];
      static_gw.fromString(thisGW);
      String thisNM = (*jsonConfigObj)["staticConfig"]["staticNetmask"];
      static_nm.fromString(thisNM);
      String thisDNS = (*jsonConfigObj)["staticConfig"]["staticDNS"];
      static_dns.fromString(thisDNS);
    }

    if (((wifiCfgMode && 0x02) > 0) && jsonConfigObj->containsKey("apConfig"))
    {
      String thisIP = (*jsonConfigObj)["apConfig"]["apGateway"];
      ap_ip.fromString(thisIP);
      String thisPW = (*jsonConfigObj)["apConfig"]["apPassword"];
      apPassword = thisPW;
    }

    if (jsonConfigObj->containsKey("commMode"))
      commMode = (*jsonConfigObj)["commMode"];
    if (jsonConfigObj->containsKey("workMode"))
      modMode = (*jsonConfigObj)["workMode"];

    if ((commMode == 1) || ((commMode == 3) && (modMode == 1))) //LocoNet or Gateway/ALM
    {
      Serial.println("Init LocoNet");  
      lnSerial = new LocoNetESPSerial((*jsonConfigObj)["LnModConfig"]["pinRx"], (*jsonConfigObj)["LnModConfig"]["pinTx"], (*jsonConfigObj)["LnModConfig"]["invLogic"]); //true is inverted signals
      lnSerial->setBusyLED((*jsonConfigObj)["LnModConfig"]["busyLEDPin"]);
      lnSerial->setLNCallback(callbackLocoNetMessage);
    } 
    else 
      Serial.println("LocoNet not activated");

    if ((wifiAlwaysOn) && ((commMode == 2) || (commMode == 3) && (modMode == 1))) //MQTT or Gateway/ALM
    {
      Serial.println("Load MQTT Data");  
      jsonDataObj = getDocPtr("/configdata/mqtt.cfg");
      if (jsonDataObj != NULL)
      {
        lnMQTT = new MQTTESP32(*wifiClient); 
        lnMQTT->loadMQTTCfgJSON(*jsonDataObj);
        lnMQTT->setMQTTCallback(callbackLocoNetMessage);
        delete(jsonDataObj);
      }
    }
    else 
      Serial.println("MQTT not activated");

    if ((wifiAlwaysOn) && ((commMode == 3) && (modMode == 1))) //Gateway/ALM
    {
      Serial.println("Load Gateway");  
      commGateway = new ln_mqttGateway(lnSerial, lnMQTT, &callbackLocoNetMessage);
      commGateway->setCommMode(GW); //set to Gateway Mode. Could also be LN or MQTT if used as interface
    }
    else 
      Serial.println("Gateway not activated");

    if ((commMode == 0) && (modMode == 0)) //DCC/Decoder
    {
      Serial.println("Load DCC Interface");  
      myDcc = new NmraDcc();
      pinMode((*jsonConfigObj)["DccConfig"]["DccAckPin"], OUTPUT);
      // Setup which External Interrupt, the Pin it's associated with that we're using and enable the Pull-Up 
      myDcc->pin((*jsonConfigObj)["DccConfig"]["DccInPin"], 1);
      // Call the main DCC Init function to enable the DCC Receiver
      myDcc->init(MAN_ID_DIY, 10, FLAGS_CV29_BITS, 0 );
      Serial.println("DCC Init Done");
    }
    else 
      Serial.println("DCC Interface not activated");

    setTxFunction(&sendMsg); //defined in IoTT_DigitraxBuffers.h
    if (jsonConfigObj->containsKey("useBushby"))
      if ((bool)(*jsonConfigObj)["useBushby"])
        enableBushbyWatch(true); //defined in IoTT_DigitraxBuffers.h
      else
        enableBushbyWatch(false);
        
    if (jsonConfigObj->containsKey("useLEDModule"))
    {
      if ((bool)(*jsonConfigObj)["useLEDModule"])
      {
        Serial.println("Load LED Data"); 
        jsonDataObj = getDocPtr("/configdata/led.cfg");
        if (jsonDataObj != NULL)
        {
          myChain = new IoTT_ledChain(); // ... construct now, and call setup later
          myChain->loadLEDChainJSON(*jsonDataObj);
          char chainType[10];
          char colType[10];
          JsonObject * myParams = NULL;
          if (jsonDataObj->containsKey("ChainParams"))
          {
            Serial.println("Loading ChainParams");
            myParams = new JsonObject((*jsonDataObj)["ChainParams"]);
          }
          else
            Serial.println("No ChainParams");
          if (myParams != NULL)
          {
            Serial.println("Interpreting ChainParams");
            if (myParams->containsKey("ChainType"))
              strcpy(chainType, (*myParams)["ChainType"]);
            else
            {
              Serial.println("No Key ChainType");
              strcpy(chainType, "WS2812");
            }
            if (myParams->containsKey("ColorSeq"))
              strcpy(colType, (*myParams)["ColorSeq"]);
            else
            {
              Serial.println("No Key ColorSeq");
              strcpy(colType, "GRB");
            }
            delete myParams;
          }
          else
          {
            Serial.println("Default ChainParams");
            strcpy(chainType, "WS2812");
            strcpy(colType, "GRB");
          }
          delete(jsonDataObj);
          if (strcmp(chainType, "WS2812") == 0)
          {
            Serial.printf("Init LED Chain on Pin %i, %i LEDs long\n", LED_DATA_PIN, myChain->getChainLength());  
            if (strcmp(colType, "GRB") == 0)
            {
              Serial.println(colType);
              Serial.println(chainType);
              FastLED.addLeds<WS2811, LED_DATA_PIN, GRB>(myChain->getChain(), myChain->getChainLength()); 
            }
            if (strcmp(colType, "RGB") == 0)
            {
              Serial.println(colType);
              Serial.println(chainType);
              FastLED.addLeds<WS2811, LED_DATA_PIN, RGB>(myChain->getChain(), myChain->getChainLength()); 
            }
          } 
          if (strcmp(chainType, "WS2801") == 0)
          {
            Serial.printf("Init LED Chain on Pins %i %i, %i LEDs long\n", LED_DATA_PIN, LED_CLOCK_PIN, myChain->getChainLength());  
            if (strcmp(colType, "GRB") == 0)
            {
              Serial.println(colType);
              Serial.println(chainType);
              FastLED.addLeds<WS2801, LED_DATA_PIN, LED_CLOCK_PIN, GRB>(myChain->getChain(), myChain->getChainLength()); 
            }
            if (strcmp(colType, "RGB") == 0)
            {
              Serial.println(colType);
              Serial.println(chainType);
              FastLED.addLeds<WS2801, LED_DATA_PIN, LED_CLOCK_PIN, RGB>(myChain->getChain(), myChain->getChainLength()); 
            }
          } 
        }
      }
      else 
        Serial.println("LED Module not activated");
    }
    if (jsonConfigObj->containsKey("useButtonModule"))
    {
      if (((bool)(*jsonConfigObj)["useButtonModule"]) && (modMode == 1)) //must be ALM
      {
        Serial.println("Init Buttons");  
        JsonArray addrLines = (*jsonConfigObj)["BtnModConfig"]["AddrPins"];
        JsonArray dataLines = (*jsonConfigObj)["BtnModConfig"]["DataPins"];
        uint8_t analogPins[dataLines.size() + 1];
        analogPins[0] = dataLines.size();
        for (int i = 0; i < dataLines.size(); i++)
          analogPins[i+1] = dataLines[i];
        if ((addrLines.size() == 4) && (dataLines.size() > 0))
        {
          jsonDataObj = getDocPtr("/configdata/btn.cfg");
          if (jsonDataObj != NULL)
          {
            myButtons = new IoTT_Mux64Buttons();
            myButtons->initButtons(addrLines[0], addrLines[1],addrLines[2], addrLines[3], &analogPins[0], true); //use WiFi with buttons (always), this has limitations on ADC that can be used
            Serial.println("Load Button Data");  
            myButtons->loadButtonCfgJSON(*jsonDataObj);
            delete(jsonDataObj);
          }
        }
      }
      else 
        Serial.println("HW Button Module not activated");
    }

    if (jsonConfigObj->containsKey("useButtonHandler"))
    {
      if (((bool)(*jsonConfigObj)["useButtonHandler"])&& (modMode == 1)) //must be ALM
      {
        Serial.println("Load Button Data");  
        jsonDataObj = getDocPtr("/configdata/btnevt.cfg");
        if (jsonDataObj != NULL)
        {
          buttonHandler = new(IoTT_LocoNetButtonList);
          buttonHandler->loadButtonCfgJSON(*jsonDataObj);
          delete(jsonDataObj);
        }
      }
      else 
        Serial.println("Button Handler not activated");
    }
/*    
    if (jsonConfigObj->containsKey("useSecurityElements"))
    {
      if (((bool)(*jsonConfigObj)["useSecurityElements"]) && (modMode == 1)) //must be ALM
      {
        Serial.println("Load Security Element Data");  
        jsonDataObj = getDocPtr("/configdata/secel.cfg");
        if (jsonDataObj != NULL)
        {
          secElHandlerList = new(IoTT_SecurityElementList);
          secElHandlerList->loadSecElCfgJSON(*jsonDataObj);
          delete(jsonDataObj);
        }
      }
      else 
        Serial.println("Security Elements not activated");
    }    
*/
    Serial.println("Connect WiFi");  
    establishWifiConnection(myWebServer,dnsServer);
    if (lnMQTT)
    {
      Serial.println("Connect MQTT");  
      establishMQTTConnection();
      Serial.println("Connect MQTT done");  
    }
    if (jsonConfigObj->containsKey("useNTP"))
    {
      useNTP = (bool)(*jsonConfigObj)["useNTP"];
      if (useNTP)
      {
        Serial.println("Create NTP Time Access");  
        JsonObject ntpConfig = (*jsonConfigObj)["ntpConfig"];
        if (ntpConfig.containsKey("NTPServer"))
          strcpy(ntpServer, ntpConfig["NTPServer"]);
        if (ntpConfig.containsKey("ntpTimeZone"))
          if (ntpConfig["ntpTimeZone"].is<const char*>())
            strcpy(ntpTimeZone, ntpConfig["ntpTimeZone"]);
          else
            Serial.println("ntpTimeZone is wrong data type");
        configTime(0, 0, ntpServer);
        setenv("TZ", ntpTimeZone, 1);
      }
      else 
        Serial.println("NTP Module not activated");
    }
    delete(jsonConfigObj);
    if (useNTP) getInternetTime();
    startWebServer();
    Serial.println(String(ESP.getFreeHeap()));
  }
  randomSeed((uint32_t)ESP.getEfuseMac()); //initialize random generator with MAC
}

void loop() {
  // put your main code here, to run repeatedly:
#ifdef measurePerformance
  loopCtr++;
  if (millis() > myTimer)
  {
    Serial.printf("Timer Loop: %i\n", loopCtr);
    loopCtr = 0;
    myTimer += 1000;
  }
#endif  
  if (myButtons) myButtons->processButtons(); //checks if a button was pressed and sends button messages
  if (myChain) myChain->processChain(); //updates all LED's based on received status information for switches, inputs, buttons, etc.
//  if (secElHandlerList) secElHandlerList->processLoop(); //calculates speeds in all blocks and sets signals accordingly
  if (myDcc) myDcc->process(); //receives and decodes track signals
  if (buttonHandler) buttonHandler->processButtonHandler(); //drives the outgoing buffer and time delayed commands

  checkWifiTimeout(); //checks if wifi has been inactive and disables it after timeout
  if (!wifiCancelled) //handles keep alive updates as long connection is valid
  {
    if (WiFi.status() == WL_CONNECTED)
    { 
      sendKeepAlive();
      if (useNTP)
        getInternetTime(); //gets periodic updates of date and time from NTP server
    }
    else
    {
      Serial.println("Reconnect WiFi");
      establishWifiConnection(myWebServer,dnsServer);
    }
  }
  if ((!wifiCancelled) && ((commGateway) || (lnMQTT))) //handles all wifi communication for MQTT
    if (WiFi.status() == WL_CONNECTED)
    { 
      if (commGateway) 
        commGateway->processLoop();
      else
        if (lnMQTT) 
          lnMQTT->processLoop();
    }
    else
    {
      Serial.println("Reconnect WiFi");
      establishWifiConnection(myWebServer,dnsServer);
    }
  else
    if (lnSerial) 
      lnSerial->processLoop(); //handling all LocoNet communication

  processBufferUpdates(); //updating DigitraxBuffers by querying information from LocoNet, e.g. slot statuses
  if ((commMode == 0) && (modMode == 0)) //DCC/Decoder
    if (millis() > dispStatusTimer)
    {
      sendRefreshBuffer();
      dispStatusTimer = millis() + dispStatusInterval; //exact interval not important, we start with millis as base
    }
}
