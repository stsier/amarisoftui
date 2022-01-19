import { useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

let isDarkMode = false; // the state of the module
let updateSubscribers = (mode) => {}; //update subscribers callback - do nothing by default

// pre-existing functions to manipulate the state
export const getDarkMode = () => isDarkMode;


export const sendCommand = (newMode) => {
 isDarkMode = newMode; 
 webSocketSingleton.sendMessage('{"message": "config_get"}');
 updateSubscribers(isDarkMode); // call updateSubscribers when setting new state
};

// new function - custom hook for components to subscribe.
// using getDarkMode as an init callback to get most relevant state
export const webSocketSingleton = singletonHook(getDarkMode, () => {
 const [mode, setMode] = useState(getDarkMode);
 updateSubscribers = setMode; // subscribing for further updates

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
    callback([lastMessage.data, connectionStatus]);
  }
  else callback("nothing");
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
   
 } , []);


 return mode;
});

