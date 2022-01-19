import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import {
  Page,
  Navbar,
  NavTitle,
  NavTitleLarge,
  Link,
  BlockTitle,
  Button,
  Block,
} from 'framework7-react';

const  WebSocket = ({props, callback}, ref)  => {
  var options = {extraHeaders: {"origin": "Test"}};
  var proto = 'ws';
  var server = '192.168.35.78:9001';
  let url = proto + '://' + server + '/'
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(url);

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl);

  
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

  const handleClickChangeSocketUrl = useCallback(() =>
   {
    setSocketUrl(url);
   }
    , []);

  const handleClickSendMessage = useCallback(() =>
  {
    sendMessage('{"message": "config_get"}');
   }
    , []);
    

  // external component API
  React.useImperativeHandle(ref, () => ({
    getStatus() {
        handleClickChangeSocketUrl();
    },
    getConfig() {
      sendMessage('{"message": "config_get"}');
     
    },
    setGain(cell_id, gain) {
      sendMessage('{"message": "cell_gain", "cell_id":'+cell_id+',"gain":'+gain+'}');
     
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
export default React.forwardRef(WebSocket); ;

//export default WebSocket;

