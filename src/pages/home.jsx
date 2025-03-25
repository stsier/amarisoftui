import React, { useState, useEffect, useRef } from 'react';
import {
  Page,
  Navbar,
  Subnavbar,
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
  Toggle,
  Searchbar,
  Input
} from 'framework7-react';
import ReactJson from 'react-json-view'
import LazyList from 'lazylist-react'
import { isIP, isIPv4 } from 'is-ip';

import WebSocket from '../components/WebSocket';
import { width } from 'dom7';

let logs = [];
let cellsToLog = [];
let layers = ['NAS', 'RRC', 'S1AP', 'PHY', 'RLC', 'MAC'];
let layersToLog = layers;
let defaultAddress = '192.168.35.78:9001';
let defaultCommand = '{"message":"sib_set","cells":{"1":{"sib1":{"p_max":10}}}}';


const HomePage = (props) => {

  const webSocket = useRef();
  const dateRange = useRef();

  let [serverAddress, setServerAddress] = useState(defaultAddress);
  let [commandInput, setCommandInput] = useState(defaultCommand);
  let [websocketElement, setWebsocketElement] = useState([]);

  const [messageHistory, setMessageHistory] = useState([]);
  let [nbCellsElement, setNbCellsElement] = useState([]);
  let [cellsElement, setCellsElement] = useState([]);

  let [status, setStatus] = useState([]);
  let [configTime, setConfigTime] = useState([]);
  let [cinrElement, setCinrElement] = useState([]);
  let [noiseLevelElement, setNoiseLevelElement] = useState([]);
  let [logElement, setLogElement] = useState([]);
  let [logControlsElement, setLogControlsElement] = useState([]);
  let [searchWord, setSearchWord] = useState([]);
  let [timeStamp, setTimeStamp] = useState({ min: 0, max: 10 });
  const [vlData, setVlData] = useState({
    items: [],
  });
  const renderExternal = (vl, newData) => {
    setVlData({ ...newData });
  };
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

    let d = t > 7 * 24 * 60 * 60 * 1000 ? new Date(t) : new Date();
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
    let text = l.dir == ("DL" || "TO") ? "\u2193" : "\u2191";
    text += " ";
    delete l.dir;

    for (let key of Object.keys(l)) {
      text += key + ": " + l[key] + " ";
    }

    return text;
  }

  let update = (data, status) => {
    if (data.logs && data.logs.length > 0) console.log(data);
    setStatus(status);

    /* if (data !== null) {
       
       setMessageHistory(prev => prev.concat({time: date.toLocaleTimeString('en-US'), data:data}));
     }
     else  setMessageHistory(prev => prev.concat({time: date.toLocaleTimeString('en-US'), data:"empty message"}));
 */

    if (data.message == "log_get") {

      if (logs.length == 0)
        setTimeout(() => {

          setLogControlsElement(<List style={{ width: "100%" }}>
            <ListItem> <Row> {
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
            }
              <Col><Button onClick={webSocket.current.resetLog()}>Reset</Button></Col>
            </Row>

            </ListItem>
            {/** 
               * 
          let d = new Date();
          let hour = 60*60*1000;
          let max =  d.getTime();
      
          let min =  max-24*hour;
      
          <ListItem after="Date" after={<span>{timeStamp.min} - {timeStamp.max} </span>}> 
          <ListItemCell className="flex-shrink-3" >
           <Range  ref={dateRange}  min={min} max={max} step={1000} dual={true} value={[max-6*hour, max]} label={false} scale={false} 
              label={true}  formatLabel={(value) => {  let d = new Date(value); return (d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()) ; } }  onRangeChanged={(value) => { setTimeStamp({min:value[0], max:value[1]}); }} />
          </ListItemCell>
          </ListItem>
          */}
            <ListItem> <Searchbar
              // className="searchbar-demo"
              onChange={(e) => { setSearchWord(e.target.value) }}
              searchContainer=".search-list"
              searchIn=".item-title"
            //disableButton={!theme.aurora}
            ></Searchbar></ListItem>
          </List>);

        }, 1000);
      else {

        //console.log(dateRange.current);

      }

      setTimeout(() => {


        logs.unshift(...data.logs.reverse());

        let logsToShow = [];
        logsToShow = logs.filter((log, index) => {

          /* if(log.layer == "S1AP" || log.layer == "RRC") {
             //log.data[0] = {"title":log.data[0]};

             console.log(log.data.slice(1).join(""))
             log.data = JSON.parse(log.data.slice(1).join(""))
           }*/
          // console.log(log.timestamp + " " + timeStamp.max)

          return ( /*log.timestamp > timeStamp.min && log.timestamp < timeStamp.max && */
            JSON.stringify(log).toUpperCase().trim().includes(searchWord.toString().toUpperCase()) &&
            (log.cell != null && cellsToLog.includes(log.cell.toString()) && layersToLog.includes(log.layer) &&
              (layersToLog.includes('RRC') || layersToLog.includes('MAC') || layersToLog.includes('PHY')) ||
              (log.cell == null && layersToLog.includes(log.layer))));
        });
        logsToShow = logsToShow.slice(0, 300);

        //console.log(logs.length + " " + data.logs.length + " " + logsToShow.length);

        setLogElement(
          <List
            mediaList
            virtualList
            className="search-list searchbar-found"
            virtualListParams={{ logsToShow, height: 70 }}
          >{
              //cellsToLog;

              logsToShow.map((log, idx) =>

              (<ListItem title={getLogHeaders(log)} virtualListIndex={logsToShow.indexOf(log)}
              /*className="flex-shrink-3"*/ key={idx} header={getDate(log.timestamp) + " " + getTime(log.timestamp)}  >
                <ListItemCell className="item-title" style={{ fontSize: 14 }}>
                  {/* {JSON.stringify(log.data, undefined, 4)} */}
                  <ReactJson collapsed displayDataTypes={false} name={log.data[0]} src={log.data} />

                </ListItemCell>
              </ListItem>)
              )
            }</List>);
      }, 10);
    }

    if (data.message == "config_get") {

      setCellsElement(<></>);
      setNbCellsElement(<></>);

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

      if (data.cells)
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

      if (data.nb_cells)
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
        return <Row>
          <BlockHeader>Cell id #{cell.id}</BlockHeader>
          <Col width="100">
            <Row>
              <Col width="5">
                <Icon md="f7:radiowaves_right" />
              </Col>
              <Col width="80">
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
              <Col> dl_earfcn:  {cell.dl_earfcn} ( {cell.dl_freq / 1000000}MHz) </Col>
              <Col > ul_earfcn:  {cell.ul_earfcn} ({cell.ul_freq / 1000000}Mhz) </Col>
              {type == "nb" ?
                <>
                  <Col> opmode:  {cell.operation_mode} </Col>
                </> :
                <><Col > n_rb_dl:  {cell.n_rb_dl} (BW={cell.n_rb_dl / 5}MHz)</Col>
                  <Col> n_rb_ul:  {cell.n_rb_ul} (BW={cell.n_rb_ul / 5}MHz)</Col> </>
              }
              <Col> n_antenna:  {cell.n_antenna_dl}/ {cell.n_antenna_ul}</Col>
              <Col> rf_port:  {cell.rf_port} </Col>
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


      if (null == loggerInterval) {
        loggerInterval = setInterval(() => {
          webSocket.current.getLog();

        }, 3000);
      }
      else if (0 == cellsToLog.length) {
        clearInterval(loggerInterval);
        loggerInterval = null;
      }
    }
  }

  var setAll = () => {
  }


  const saveSettings = () => {
    document.getElementById("address-button").classList.add("disabled");
    
    let settings = { address: serverAddress, command: commandInput };
    console.log(settings);
    localStorage.setItem("cached_settings", JSON.stringify(settings));
    
  }
  const getCachedSettings = (callback) => {
    let tmp = JSON.parse(localStorage.getItem("cached_settings"));

    callback(tmp);
  }
  const switchDarkMode = (e) => {
    if(e) {
      document.getElementById("app").classList.add("dark")
    }
    else document.getElementById("app").classList.remove("dark");
    //  console.log(f7.views.main.router.dark)
  }
  return (
    <Page name="home" onPageInit={() => {
      switchDarkMode(true);
      getCachedSettings((settings) => {
        let address = (null != settings && null != settings.address ? settings.address : defaultAddress);
        let command = (null != settings && null != settings.command ? settings.command : defaultCommand);
        let p = { address: address };
        setServerAddress(address);
        setCommandInput(command);
        document.getElementById("address-input").firstChild.value = address;
        document.getElementById("command-input").firstChild.value = command;
        setWebsocketElement(
          <WebSocket ref={webSocket} props={p} callback={(data, status) => update(data, status)}></WebSocket>
        ), (() => {

          //webSocket.current.setSocket(serverAddress);
          webSocket.current.setLogs();
          //  webSocket.current.getConfig(); 
          webSocket.current.getLog();
        });


      })
    }}>
      <Panel /* opened */ resizable right push onPanelOpen={() => { webSocket.current.getLog(); }}>
        <View  >
          <Page>
            <Navbar style={{ height: "180px" }} header="Logs">
              {logControlsElement}
              {/*  <ul>
            {messageHistory
              .map((message, idx) => <span key={idx}><h5>{message.time}</h5>{JSON.stringify(message.data)}</span>)}
          </ul>*/}
            </Navbar>
            <BlockTitle>Log List</BlockTitle>
            <List className="searchbar-not-found">
              <ListItem title="Nothing found"></ListItem>
            </List>
            {logElement}
          </Page>
        </View>
      </Panel>
      {/* Top Navbar */}
      <Navbar>
        <NavTitle>Amarisoft UI </NavTitle>
        {/* <NavTitleLarge>Amarisoft UI</NavTitleLarge>*/}
        <NavLeft><Row style={{minWidth: "500px", fontSize:"smaller"}}>
          <Col width="25">  <Row>Last update: </Row> <Row>{configTime} </Row>  </Col>

          <Col width="50" >  <Row> Server address:</Row>
            <Row><Col width="70"><Input id="address-input" onChange={(e) => {
              let ipValid = isIP(e.target.value.split(":")[0]);
              let portValid = !isNaN(e.target.value.split(":")[1]);
              if (ipValid && portValid) {
                document.getElementById("address-button").classList.remove("disabled");
                setServerAddress(e.target.value);
              } else {
                document.getElementById("address-button").classList.add("disabled");
              }
            }}
              // validate:onValidate={(isValid) => console.log(isValid)}
              type="text" defaultValue={serverAddress}></Input></Col>
               <Col  width="30"><Button id="address-button" disabled onClick={() => {  webSocket.current.setSocket(serverAddress); saveSettings();}}>Set</Button>  </Col>
            </Row>
           
          </Col>

          <Col  width="25" >  <Row>Websocket is: </Row> <Row>{status}  </Row>    </Col>
        </Row>
        
        <Col width="100" > 
            <Row><Col width="70"><Input id="command-input" onChange={(e) => {
                setCommandInput(e.target.value);
            }}
              // validate:onValidate={(isValid) => console.log(isValid)}
              type="text" defaultValue={commandInput}></Input>
              </Col>
               <Col  width="30"><Button id="command-button"  onClick={() => { webSocket.current.sendCommand(commandInput); saveSettings(); }}> Send</Button>  </Col>
            </Row>
           
          </Col>

        </NavLeft>
        <NavRight>
                <span>Dark mode&nbsp;</span>
                <Toggle defaultChecked onToggleChange = {switchDarkMode} ></Toggle>
          </NavRight>
      </Navbar>
      {/* Toolbar */}
      <Toolbar bottom>
        <Button onClick={() => { webSocket.current.getConfig(); }}
        //  disabled={  webSocket.current.readyState !== ReadyState.OPEN}
        >Get config</Button>
        {/*  <Button onClick={() => { webSocket.current.getUE(); }}  >Get UE</Button>*/}
        <Button disabled large onClick={() => { setAll(); }}> Set All </Button>
        <Button panelOpen="right">Log</Button>
      </Toolbar>

      <BlockTitle>Noise level</BlockTitle>
      {noiseLevelElement}
      {cinrElement}
      <BlockTitle>Narrow-band cells</BlockTitle>
      {nbCellsElement}
      <BlockTitle>LTE cells</BlockTitle>
      {cellsElement}
      {websocketElement}

    </Page>
  )
};
export default HomePage;