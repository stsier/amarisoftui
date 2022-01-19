
//import React from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

class WebSocketClass /* extends React.Component*/ {

    /*constructor(props) {
     // super(props)
  
      var options = {extraHeaders: {"origin": "Test"}};
      var proto = 'ws';
      var server = '192.168.35.78:9001';
      this.url = proto + '://' + server + '/';
        //Public API that will echo messages sent to it back to the client
      //  const [socketUrl, setSocketUrl] = useState(url);

      let readyState = 0;
        const connectionStatus = {
            [ReadyState.CONNECTING]: 'Connecting',
            [ReadyState.OPEN]: 'Open',
            [ReadyState.CLOSING]: 'Closing',
            [ReadyState.CLOSED]: 'Closed',
            [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
          }[readyState];

       
         

    }*/
   
    send() {
        useWebSocket(this.url).sendMessage('{"message": "config_get"}').then((resp)=> {
            console.log(resp);
        });
    }
   

    

    /*
    openLastImage() {
      f7.popup.open("#last-photo-popup");
    }*/
};
export default WebSocketClass;