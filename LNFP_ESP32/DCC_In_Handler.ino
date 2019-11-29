// This function is called whenever a normal DCC Turnout Packet is received and we're in Output Addressing Mode

void notifyDccAccTurnoutOutput(uint16_t Addr, uint8_t Direction, uint8_t OutputPower )
{
  setSwitchStatus(Addr-1, Direction, OutputPower);
  Serial.print("notifyDccAccTurnoutOutput: ") ;
  Serial.print(Addr,DEC) ;
  Serial.print(',');
  Serial.print(Direction,DEC) ;
  Serial.print(',');
  Serial.println(OutputPower, HEX) ;
/*
  if (globalClient != NULL)
  {
    lnReceiveBuffer newData;
    newData.lnMsgSize = 5;
    newData.lnData[0] = 0; //Switch
    newData.lnData[1] = Addr & 0x00FF;
    newData.lnData[2] = (Addr & 0xFF00) >> 8;
    newData.lnData[3] = Direction;
    newData.lnData[4] = OutputPower;
    processDCCtoWebClient(&newData);
  }
*/
}

// This function is called whenever a DCC Signal Aspect Packet is received
void notifyDccSigOutputState(uint16_t Addr, uint8_t State)
{
  setSignalAspect(Addr, State);
  Serial.print("notifyDccSigOutputState: ") ;
  Serial.print(Addr,DEC) ;
  Serial.print(',');
  Serial.println(State, HEX) ;
/*  
   if (globalClient != NULL)
  {
    lnReceiveBuffer newData;
    newData.lnMsgSize = 4;
    newData.lnData[0] = 1; //Signal
    newData.lnData[1] = Addr & 0x00FF;
    newData.lnData[2] = (Addr & 0xFF00) >> 8;
    newData.lnData[3] = State;
    processDCCtoWebClient(&newData);
  }
*/
}

void notifyDccMsg(DCC_MSG * Msg)
{
//  Serial.printf("DCC Raw Pre %i Data %i ", Msg->PreambleBits, Msg->Size);
  if (globalClient != NULL)
  {
    lnReceiveBuffer newData;
    newData.lnMsgSize = Msg->Size + 1; //room for preambel count in byte 0
    newData.lnData[0] = Msg->PreambleBits;
    for (int i = 0; i < Msg->Size; i++)
      newData.lnData[i+1] = Msg->Data[i];
    processDCCtoWebClient(&newData);
  }
}

void processDCCtoWebClient(lnReceiveBuffer * newData) //if a web browser is conneted, DCC messages are sent via Websockets
                                                      //this is the hook for a web based DCC viewer
{
    DynamicJsonDocument doc(1200);
    char myMqttMsg[400];
    doc["Cmd"] = "DCC";
    JsonArray data = doc.createNestedArray("Data");
    for (byte i=0; i < newData->lnMsgSize; i++)
      data.add(newData->lnData[i]);
    serializeJson(doc, myMqttMsg);
    globalClient->text(myMqttMsg);
    lastWifiUse = millis();
}
