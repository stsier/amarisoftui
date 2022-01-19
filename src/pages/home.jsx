import React, { useState, useEffect, useRef } from 'react';
import {
  Page,
  Navbar,
  NavTitle,
  NavTitleLarge,
  NavRight,
  Link,
  Toolbar,
  Panel,
  View,
  Block,
  BlockTitle,
  Button,
  List,
  ListItem,
  ListItemCell,
  ListItemRow,
  Icon,
  Range,
  f7ready
} from 'framework7-react';

import WebSocket from '../components/WebSocket';


const HomePage = (props) => {

  const webSocket = useRef();

  const [messageHistory, setMessageHistory] = useState([]);
  const [nbCellsElement, setNbCellsElement] = useState([]);
  const [cellsElement, setCellsElement] = useState([]);
  const [status, setStatus] = useState([]);




  let update = (data, status) => {
    console.log(data);
    setStatus(status);
    let date = new Date();
    /* if (data !== null) {
       
       setMessageHistory(prev => prev.concat({time: date.toLocaleTimeString('en-US'), data:data}));
     }
     else  setMessageHistory(prev => prev.concat({time: date.toLocaleTimeString('en-US'), data:"empty message"}));
 */

    if (data.message == "config_get") {

      let cells = [];
      for (let key of Object.keys(data.cells)) {
        cells.push(data.cells[key]);
        cells[cells.length-1].id=key;

      }
      let nbCells = [];
      for (let key of Object.keys(data.nb_cells)) {
        nbCells.push(data.nb_cells[key]);
        nbCells[nbCells.length-1].id=key;
      }

      const onGainChange = (idx, value, type) => {
        console.log(type+ " id="+ idx +" gain="  + value);
        type=="lte" ? cells[idx].gain = value : nbCells[idx].gain = value;
      };

      setCellsElement(<List ><BlockTitle>LTE cells</BlockTitle>{
        cells.map((cell, idx) => 
        <ListItem   key={idx}  title={cell.id} tooltip={" ul_earfcn: "+cell.ul_earfcn}  after={"pci: "+cell.n_id_cell + " dl_earfcn: "+cell.dl_earfcn} /*footer={JSON.stringify(cell)}*/>
          <ListItemCell className="width-auto flex-shrink-0">
            <Icon md="f7:radiowaves_right" />
          </ListItemCell>
          <ListItemCell className="flex-shrink-3">
            <Range key={idx} min={-100} max={0} step={1} value={parseInt(cell.gain)} label={true} scale={true} scaleSteps={20}  onRangeChanged={ (value) => onGainChange(idx, value, "lte") }/>
          </ListItemCell>
          <ListItemCell className="width-auto flex-shrink-0">
            <Icon md="f7:badge_plus_radiowaves_right"/>
          </ListItemCell>
          <ListItemCell className="width-auto flex-shrink-0">
            <Button onClick={() => {/* console.log(cell.gain+" " + cell.n_id_cell) */webSocket.current.setGain(cell.id,cell.gain); }} >Set</Button>
          </ListItemCell>
        </ListItem>
        )
      }</List>);



      setNbCellsElement(<List ><BlockTitle>Narrow-band cells</BlockTitle>{
        nbCells.map((cell, idx) => 
        <ListItem   key={idx} title={cell.id} tooltip={" ul_earfcn: "+cell.ul_earfcn} after={"pci: "+cell.n_id_ncell + " dl_earfcn: "+cell.dl_earfcn} /*footer={JSON.stringify(cell)}*/>
         
          <ListItemCell className="width-auto flex-shrink-0">
            <Icon md="f7:radiowaves_right" />
          </ListItemCell>
          <ListItemCell className="flex-shrink-3">
            <Range key={idx} min={-100} max={0} step={1} value={parseInt(cell.gain)} label={true} scale={true} scaleSteps={20} onRangeChanged={ (value) => onGainChange(idx, value, "nb") }/>
          </ListItemCell>
          <ListItemCell className="width-auto flex-shrink-0">
            <Icon md="f7:badge_plus_radiowaves_right"/>
          </ListItemCell>
          <ListItemCell className="width-auto flex-shrink-0">
            <Button onClick={() => { webSocket.current.setGain(cell.id,cell.gain); }} >Set</Button>
          </ListItemCell> <br/>
          
        </ListItem>
        )
      }</List>);

    }

  }

  return (
    <Page name="home" onPageInit= {() => { webSocket.current.getConfig(); }}>
      <Panel resizable right push>
        <View>
          <Page>
            <BlockTitle>Log</BlockTitle>
            <Block >

              {/*  <ul>
            {messageHistory
              .map((message, idx) => <span key={idx}><h5>{message.time}</h5>{JSON.stringify(message.data)}</span>)}
          </ul>*/}
            </Block>
          </Page>
        </View>
      </Panel>
      {/* Top Navbar */}
      <Navbar>
        <NavTitle>Amarisoft UI </NavTitle>
        {/* <NavTitleLarge>Amarisoft UI</NavTitleLarge>*/}
        <NavRight>Websocket is: {status}</NavRight>
      </Navbar>
      {/* Toolbar */}
      <Toolbar bottom>
        <Button onClick={() => { webSocket.current.getConfig(); }}
        //  disabled={  webSocket.current.readyState !== ReadyState.OPEN}
        >Get config</Button>

        <Button panelOpen="right" >Log</Button>
      </Toolbar>
      {/* Page content */}
      <Block strong>
        {cellsElement}
        {nbCellsElement}
        <Button large> Set All gains </Button>
      </Block>
      
      <WebSocket ref={webSocket} props={"homepage"} callback={(data, status) => update(data, status)}></WebSocket>
    </Page>
  )
};
export default HomePage;