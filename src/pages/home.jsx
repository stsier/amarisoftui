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
  ListGroup,
  Row,
  Col,
  BlockHeader,
  Toggle

} from 'framework7-react';

import WebSocket from '../components/WebSocket';

let logs = [];
let cellsToLog = [];
let layers = ['NAS', 'RRC', 'S1AP', 'PHY', 'RLC', 'MAC'];
let layersToLog = layers;


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
  let [logControlsElement, setLogControlsElement] = useState([]);

  let loggerInterval = null;

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
  const getDate = (t) => {
    let d = new Date(t);
    return d.toLocaleDateString("fr-Fr");
  }
  const getLogHeaders = (log) => {
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
      text += key + ": " + l[key] + " ";
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
        // console.log(logs.length + " " + data.logs.length);

        logs.unshift(...data.logs.reverse());

        let logsToShow = [];

        logsToShow = logs.filter(log => {

          return (log.cell != null && cellsToLog.includes(log.cell.toString()) && layersToLog.includes(log.layer) && (layersToLog.includes('RRC') || layersToLog.includes('PHY') || layersToLog.includes('PHY')) ||
            log.cell == null && layersToLog.includes(log.layer));
        });

        setLogElement(<List mediaList>{
          //cellsToLog;

          logsToShow.map((log, idx) =>
            <ListItem title={getLogHeaders(log)}
              /*className="flex-shrink-3"*/ key={idx} header={getDate(log.timestamp) + " " + getTime(log.timestamp)}  >
              <ListItemCell style={{ fontSize: 14 }}>{JSON.stringify(log.data, undefined, 4)}</ListItemCell>
            </ListItem>
          )
        }</List>);
      }, 10);
    }

    if (data.message == "config_get") {
      let now = new Date();
      setConfigTime(now.toLocaleTimeString('fr-Fr'));
      //setNoiseLevelElement(<></>);
      // setCellsElement(<></>);
      //  setNbCellsElement(<></>);

      setTimeout(() => {

        if (null != data.rf_ports[0].channel_sim) {
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
        } else {
          setNoiseLevelElement(<>Unavailable</>)

        }
      }, 30);


      setTimeout(() => {
        cells = [];
        for (let key of Object.keys(data.cells)) {
          cells.push(data.cells[key]);
          cells[cells.length - 1].id = key;
          cellsToLog.push(data.cells[key].id);
        }
        setCellsElement(<>{
          cells.map((cell, idx) =>
            <Block key={idx}>{buildCellElement(cell, idx, "lte")}</Block>)
        }</>);
      }, 20);

      setTimeout(() => {
        nbCells = [];
        for (let key of Object.keys(data.nb_cells)) {
          nbCells.push(data.nb_cells[key]);
          nbCells[nbCells.length - 1].id = key;
          cellsToLog.push(data.nb_cells[key].id);
        }
        setNbCellsElement(<>{
          nbCells.map((cell, idx) =>
            <Block key={idx}>{buildCellElement(cell, idx, "nb")}</Block>)
        }</>);
      }, 10);


      let buildCellElement = (cell, idx, type) => {
        return <Row >
          <BlockHeader>Cell id #{cell.id}</BlockHeader>
          <Col width="100">
            <Row >
              <Col width="5">
                <Icon md="f7:radiowaves_right" />
              </Col>
              <Col width="80" >
                <Range key={idx} min={-100} max={0} step={1} value={parseInt(cell.gain)} label={true} scale={true} scaleSteps={10} onRangeChanged={(value) => onGainChange(idx, value, type)} />
              </Col>
              <Col width="5">
                <Icon md="f7:badge_plus_radiowaves_right" />
              </Col>
              <Col width="5">
                <Button onClick={() => {/* console.log(cell.gain+" " + cell.n_id_cell) */webSocket.current.setGain(cell.id, cell.gain); }} >Set</Button>
              </Col>
            </Row>
          </Col>
          <Col width="100">
            <Row >
              <Col width="100"> &nbsp; </Col>
              <Col> pci: {type == "lte" ? cell.n_id_cell : cell.n_id_ncell} </Col>
              <Col> band:  {cell.band} </Col>
              <Col> dl_earfcn:  {cell.dl_earfcn} </Col>
              <Col> dl_freq:  {cell.dl_freq / 1000000}MHz </Col>
              <Col > ul_earfcn:  {cell.ul_earfcn} </Col>
              <Col > ul_freq:  {cell.ul_freq / 1000000}Mhz </Col>
              <Col > ul_earfcn:  {cell.ul_earfcn} </Col>
              {type == "nb" ? <Col> operation_mode:  {cell.operation_mode} </Col> :
                <><Col > n_rb_dl:  {cell.n_rb_dl} (BW={cell.n_rb_dl / 5}MHz)</Col>
                  <Col> n_rb_ul:  {cell.n_rb_ul} (BW={cell.n_rb_ul / 5}MHz)</Col> </>
              }
            </Row>
          </Col>
          <Col width="100">

            <span>Logs </span>
            <Toggle checked title="Logs" onChange={(e) => {

              if (e.target.checked) {
                if (!cellsToLog.includes(cell.id)) cellsToLog.push(cell.id);
              } else {
                cellsToLog = cellsToLog.filter(e => e !== cell.id)
              }

            }}>

            </Toggle>

          </Col>
        </Row>
      }
      setTimeout(() => {
        setLogControlsElement(<>{
          layers.map((layer, idx) =>
            <Col key={idx}>
              <span checked> {layer} </span>
              <Toggle checked onChange={(e) => {
                if (e.target.checked) {
                  if (!layersToLog.includes(layer)) layersToLog.push(layer);
                } else {
                  layersToLog = layersToLog.filter(l => l !== layer)
                }
              }}>
              </Toggle>
            </Col>
          )
        }</>);

      }, 100);

      if (null == loggerInterval) {
        loggerInterval = setInterval(() => {
          webSocket.current.getLog();

        }, 1000);
      }
      else if (0 == cellsToLog.length) {
        clearInterval(loggerInterval);
        loggerInterval = null;
      }
    }
  }

  var setAll = () => {

  }


  return (
    <Page name="home" onPageInit={() => { webSocket.current.getConfig(); webSocket.current.getLog(); }}>
      <Panel resizable right push onPanelOpen={() => { webSocket.current.getLog(); }}>
        <View  >
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

      <Row>
        <Col >
          <Row style={{ minWidth: '700px', 'maxHeight': '70%', 'overflowY': "auto", 'overflowX': "hidden" }}>

            <BlockTitle>Noise level</BlockTitle>
            {noiseLevelElement}
            {cinrElement}

          </Row>
          {/* Page content */}
          <Row style={{ minWidth: '700px', 'maxHeight': '70%', 'overflowY': "auto", 'overflowX': "hidden" }}>

            <BlockTitle>Narrow-band cells</BlockTitle>
            {nbCellsElement}
          </Row>
          <Row style={{ minWidth: '700px', 'maxHeight': '70%', 'overflowY': "auto", 'overflowX': "hidden" }}>
            <BlockTitle>LTE cells</BlockTitle>
            {cellsElement}
          </Row>
        </Col>
        <Col >
          <Block >
          <BlockHeader>Logs</BlockHeader>
            <Row> 
           
              {logControlsElement}
            </Row>
          </Block>
          <Row style={{ 'maxHeight': '700px', 'overflowY': "auto", 'overflowX': "auto" }}>
            {logElement}
          </Row>
        </Col>
      </Row>

      <WebSocket ref={webSocket} props={"homepage"} callback={(data, status) => update(data, status)}></WebSocket>
    </Page>
  )
};
export default HomePage;