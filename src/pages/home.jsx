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
  f7ready,
  NavLeft,
  BlockFooter,
  ListItemContent,
  ListGroup
} from 'framework7-react';

import WebSocket from '../components/WebSocket';


const HomePage = (props) => {

  const webSocket = useRef();

  const [messageHistory, setMessageHistory] = useState([]);
  let [nbCellsElement, setNbCellsElement] = useState([]);
  let [cellsElement, setCellsElement] = useState([]);

  let [status, setStatus] = useState([]);
  let [configTime, setConfigTime] = useState([]);
  let [cinrElement, setCinrElement] = useState([]);
  let [noiseLevelElement, setNoiseLevelElement] = useState([]);
  let [logElement, setLogElement] = useState([]);

  let cells = [];
  let nbCells = [];
  let noise_level = 0;

  const onGainChange = (idx, value, type) => {
    console.log(type + " id=" + idx + " gain=" + value);
    type == "lte" ? cells[idx].gain = value : nbCells[idx].gain = value;
  };
  const onNoiseLevelChange = (value) => {
    console.log(" noise_level=" + value);
    noise_level = value;
    setCinrElement(<BlockFooter>CINR: {-value}</BlockFooter>);
    // type=="lte" ? cells[idx].gain = value : nbCells[idx].gain = value;
  };
  const getTime = (t) => {
    let d = new Date(t);
    return d.toLocaleTimeString("fr-Fr");
  }
  const getLogHeaders= (log) => {
    let l = {};
    Object.assign(l, log);
    delete l.timestamp;
    delete l.data;
    delete l.src;
    delete l.idx;
    delete l.level;
    let text = l.dir == "DL" ? "\u2193" : "\u2191";
    text += " ";
    delete l.dir;
    
    for (let key of Object.keys(l)) {
      text +=key + ": " + l[key] +" "; 
    }
    
    return text;
  }

  let update = (data, status) => {
    console.log(data);
    setStatus(status);

    /* if (data !== null) {
       
       setMessageHistory(prev => prev.concat({time: date.toLocaleTimeString('en-US'), data:data}));
     }
     else  setMessageHistory(prev => prev.concat({time: date.toLocaleTimeString('en-US'), data:"empty message"}));
 */

    if (data.message == "log_get") {
      setTimeout(() => {
        setLogElement(<List mediaList>{
          data.logs.reverse().map((log, idx) =>
                <ListItem   title={getLogHeaders(log)} 
               
                className="flex-shrink-3" key={idx} after={getTime(log.timestamp)}  >
               <ListItemCell style={{fontSize:14}}>{JSON.stringify(log.data, undefined, 4)}</ListItemCell>
               </ListItem>
          )
        }</List>);
      }, 10);

    }

    if (data.message == "config_get") {
      let now = new Date();
      setConfigTime(now.toLocaleTimeString('fr-Fr'));
      setNoiseLevelElement(<></>);
      setCellsElement(<></>);
      setNbCellsElement(<></>);

      setTimeout(() => {

        onNoiseLevelChange(parseInt(data.rf_ports[0].channel_sim.noise_level));
        setNoiseLevelElement(<List>
          <ListItem key={99} >
            <ListItemCell className="flex-shrink-3">
              <Range key={99} min={-50} max={50} step={1} value={parseInt(noise_level)} label={true} scale={true} scaleSteps={20} onRangeChanged={(value) => onNoiseLevelChange(value)} />
            </ListItemCell>
            <ListItemCell className="width-auto flex-shrink-0">
              <Button onClick={() => {/* console.log(cell.gain+" " + cell.n_id_cell) */webSocket.current.setNoiseLevel(noise_level); }} >Set</Button>
            </ListItemCell>
          </ListItem>
        </List>
        );
      }, 30);

      setTimeout(() => {
        cells = [];

        for (let key of Object.keys(data.cells)) {
          cells.push(data.cells[key]);
          cells[cells.length - 1].id = key;

        }


        setCellsElement(<List >{
          cells.map((cell, idx) =>
            <ListItem key={idx} title={cell.id} tooltip={" ul_earfcn: " + cell.ul_earfcn} after={"pci: " + cell.n_id_cell + " dl_earfcn: " + cell.dl_earfcn} /*footer={JSON.stringify(cell)}*/>
              <ListItemCell className="width-auto flex-shrink-0">
                <Icon md="f7:radiowaves_right" />
              </ListItemCell>
              <ListItemCell className="flex-shrink-3">
                <Range key={idx} min={-100} max={0} step={1} value={parseInt(cell.gain)} label={true} scale={true} scaleSteps={10} onRangeChanged={(value) => onGainChange(idx, value, "lte")} />
              </ListItemCell>
              <ListItemCell className="width-auto flex-shrink-0">
                <Icon md="f7:badge_plus_radiowaves_right" />
              </ListItemCell>
              <ListItemCell className="width-auto flex-shrink-0">
                <Button onClick={() => {/* console.log(cell.gain+" " + cell.n_id_cell) */webSocket.current.setGain(cell.id, cell.gain); }} >Set</Button>
              </ListItemCell>
            </ListItem>
          )
        }</List>);
      }, 20);
      setTimeout(() => {
        nbCells = [];
        for (let key of Object.keys(data.nb_cells)) {
          nbCells.push(data.nb_cells[key]);
          nbCells[nbCells.length - 1].id = key;
        }
        setNbCellsElement(<List >{
          nbCells.map((cell, idx) =>
            <ListItem key={idx} title={cell.id} tooltip={" ul_earfcn: " + cell.ul_earfcn} after={"pci: " + cell.n_id_ncell + " dl_earfcn: " + cell.dl_earfcn} /*footer={JSON.stringify(cell)}*/>

              <ListItemCell className="width-auto flex-shrink-0">
                <Icon md="f7:radiowaves_right" />
              </ListItemCell>
              <ListItemCell className="flex-shrink-3">
                <Range key={idx} min={-100} max={0} step={1} value={parseInt(cell.gain)} label={true} scale={true} scaleSteps={10} onRangeChanged={(value) => onGainChange(idx, value, "nb")} />
              </ListItemCell>
              <ListItemCell className="width-auto flex-shrink-0">
                <Icon md="f7:badge_plus_radiowaves_right" />
              </ListItemCell>
              <ListItemCell className="width-auto flex-shrink-0">
                <Button onClick={() => { webSocket.current.setGain(cell.id, cell.gain); }} >Set</Button>
              </ListItemCell> <br />

            </ListItem>
          )
        }</List>);
      }, 10);
    }

  }

  var setAll = () => {


  }

  return (
    <Page name="home" onPageInit={() => { webSocket.current.getConfig(); }}>
      <Panel resizable right push onPanelOpen={() => { webSocket.current.getLog(); }}>
        <View  >
          <Page>
            <BlockTitle>Log</BlockTitle>
            <Block >
              {logElement}
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
        <NavLeft>Last update: {configTime}</NavLeft>
        <NavRight>Websocket is: {status}</NavRight>
      </Navbar>
      {/* Toolbar */}
      <Toolbar bottom>
        <Button onClick={() => { webSocket.current.getConfig(); }}
        //  disabled={  webSocket.current.readyState !== ReadyState.OPEN}
        >Get config</Button>
        <Button onClick={() => { webSocket.current.getUE(); }}  >Get UE</Button>
        <Button large onClick={() => { setAll(); }}> Set All </Button>
        <Button panelOpen="right">Log</Button>
      </Toolbar>
      <Block strong>
        <BlockTitle>Noise level</BlockTitle>
        {noiseLevelElement}
        {cinrElement}
      </Block>
      {/* Page content */}

      <Block strong>
        <BlockTitle>Narrow-band cells</BlockTitle>
        {nbCellsElement}
      </Block>
      <Block strong>
        <BlockTitle>LTE cells</BlockTitle>
        {cellsElement}
      </Block>


      <WebSocket ref={webSocket} props={"homepage"} callback={(data, status) => update(data, status)}></WebSocket>
    </Page>
  )
};
export default HomePage;