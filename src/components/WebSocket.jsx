import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import {
  f7,
  Page,
  Navbar,
  NavTitle,
  NavTitleLarge,
  Link,
  BlockTitle,
  Button,
  Block,
} from 'framework7-react';
import App from '../components/app.jsx';

const  WebSocket = ({props, callback}, ref)  => {
  var options = {extraHeaders: {"origin": "Test"}};
  var proto = 'ws';
  //Public API that will echo messages sent to it back to the client
  
  const [socketUrl, setSocketUrl] = useState( proto + '://' + props.address + '/');

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl, {
    onOpen: () =>  {
      sendMessage('{"message": "config_get"}');
    },
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });

  
  useEffect(() => {
    if (lastMessage !== null) {
      callback(JSON.parse(lastMessage.data), connectionStatus);
    }
    else callback("nothing", connectionStatus);
  }, [lastMessage, readyState]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

 

  // external component API
  React.useImperativeHandle(ref, () => ({
    getStatus() {
      sendMessage('{"message": "config_get"}');
    },
    setSocket(url) {
      setSocketUrl( proto + '://' + url + '/' ); 
      
    },
    getConfig() {
      sendMessage('{"message": "config_get"}');
     // sendMessage('{"message": "register", "register" : "ue_measurement_report"}');
    },
    sendCommand(command) {
        try {
          let a = JSON.parse(command);
          sendMessage(command);
      } catch (e) {
        f7.dialog.alert(e,"incorrect JSON");

       
      }
      
     // sendMessage('{"message": "register", "register" : "ue_measurement_report"}');
    },
    getLog() {
      let msg = {
        message: "log_get",
        min: 1,
        max: 4096,
        headers: false,
        
      }
      sendMessage(JSON.stringify(msg));
    },

    setGain(cell_id, gain) {
      let msg = {
        message: "cell_gain",
        cell_id: parseInt(cell_id),
        gain: gain,
      }
      sendMessage(JSON.stringify(msg));
    },

    setNoiseLevel(noise_level) {
      let msg = {
        message: "noise_level",
        noise_level: noise_level,
      }
      sendMessage(JSON.stringify(msg));
    },
  
    getUE() {
      //sendMessage('{"event": "ue_measurement_report", "message": "ran_ue_id"}');
      let msg = {
        message: "config_set",
        logs: {
          layers: {
            all : {
              level: error
            }
          },
          signal: true,
        }
      }
      sendMessage(JSON.stringify(msg));
    },

    resetLog() {
      
      let msg = {
        message: "log_reset",
       
      }
      sendMessage(JSON.stringify(msg));
    },
    setLogs() {
      let msg = {
        message: "config_set",
        logs: {
          layers: {
            phy : {
              signal: 1
            },
            all: {
              level: "info",
              time: "full"
            }
          },
          time: "full"
         // signal: 1,
        } 
     //   message: "log_set",
       // log: "phy",
       // layer: "phy",
       // level: "debug"
      }


      //sendMessage(JSON.stringify(msg));
    },
  
  }), []);
    return null;
 /* return (
    <Block>
      <BlockTitle>Amarisoft is currently {connectionStatus}</BlockTitle>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null} 
    </Block>
  );*/
};
export default React.forwardRef(WebSocket); 

//export default WebSocket;

