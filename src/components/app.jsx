import React, { useState, useEffect, useRef } from 'react';

import {
  f7,
  f7ready,
  App,
  View
  
} from 'framework7-react';


import routes from '../js/routes';
import store from '../js/store';


//import { sendCommand, webSocketSingleton } from '../components/WebSocketSingleton';


//import WebSocketClass from '../components/WebSocketClass';

const AmarisoftUI = () => {

  // Framework7 Parameters
  const f7params = {
    name: 'Amarisoft UI', // App name
      theme: 'auto', // Automatic theme detection

      // App store
      store: store,
      // App routes
      routes: routes,
  };

  
  f7ready(() => {

    //node  ws.js  192.168.35.78:9001 '{"message": "config_get"}' > c.json 
  //  node  ws.js  192.168.35.78:9001 '{"message": "cell_gain", "cell_id":2,"gain":0}' > cell_gain.json 
    // Call F7 APIs here
   //let  webSocket = new WebSocketClass(null);
   // webSocket.send();
   //sendCommand();
   //const mode = webSocketSingleton();
   
   //console.log(getMe())
  });


  return (
    <App { ...f7params } >
     
    {/* <WebSocket ref={webSocket}></WebSocket>
         Your main view, should have "view-main" class */}
      
        <View main className="safe-areas" url="/" bool={true}  />

    </App>
  ); 

}

export default AmarisoftUI;