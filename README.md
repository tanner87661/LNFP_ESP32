# LNFP_ESP32
Arduino Sketch for CTC Panel and Signaling System

New Version 1.2.0
- added hyperlink on LED configuration web page to switch on selected LED address for 5 Secs for identification purposes
- fixed reload/override of configuration web pages in case of web socket communication interruption
- added possibility to download and upload configuration data to/from local disk file
- some minor bug fixes

Watch Video #31 on YouTube Channel IoTTCloud https://youtu.be/MuUwa7XUilw
and Video #32 as well: https://youtu.be/sOKhavg7B9w

A main directory named LNFP_ESP32. Inside, Inside, there are 8 ino files containing the code from the eight tabs in the sketch. The main file of course is LNFP_ESP32.ino and when you open this file from the Arduino IDE, all other files will open as well.
Then, there is a sub directory named data. Inside this directory is everything that will be loaded to the SPIFFS file of the ESP32. Inside data there are 2 more sub directories named www and configdata. The www directory is the root directory of the web server, so it has all web pages that can be accessed from the browser. The server is programmed to automatically open index.htm if it is called with no further arguments.
The configdata directory has the configuration files for all the libraries. This is where the configuration of the sketch really is defined, where it is specified how to use buttons, LEDs, etc.
Going two levels up, you see four directories with a name starting with sample data. In each of the directories you see the same configuration files as in the configdata directory. In fact, these are the four different configurations of the nodes I am using on my test layout. CTC has the configuration for the picture frame CTC panel from Video #9. It is using buttons, button handler, LED’s and also communicates via LocoNet and MQTT and provides the gateway functionality. 
Signal System has the configuration for the Signaling system from Video #13. It has LED’s, but no buttons, and uses the LocoNet interface in Decoder mode.
BB Control Panel provides the configuration for the Picture Frame control panel from Videos #29 and #30. Again, buttons, button handler, this time using some analog input as well, and LED’s. To communicate it uses MQTT in ALM work mode, as I normally use it as battery powered wireless device to walk around.
And the test system example is for the BlueBox that is sitting on my work desk and is used for development. It has no buttons, but 16 LED’s that are configured the same way as the signaling system. Right now it is configured to work as ALM and picking up signals from LocoNet.
With these four sets of configuration files you have various options to play around and compare. If you make changes manually, always make sure that the syntax matches the JSON rules or the file will not load to the sketch. A good way to verify this is just loading the file in an online JSON checker like JSONLint.com. 
