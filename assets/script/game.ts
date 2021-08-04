// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

let globalResponse: Object = new Object;
let wsStandBy: string = "";
let currentInst: string = '';
@ccclass
export default class NewClass extends cc.Component {

    /*BASIC COMPONEMTS */
    @property(cc.Prefab)
    block: cc.Prefab = null;
    @property(WebSocket)
    ws: WebSocket = null;
    @property(cc.Node)
    camera: cc.Node = null;
    @property(cc.EditBox)
    nameEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    IpEditBox: cc.EditBox = null;
    @property(cc.Node)
    ERR: cc.Node = null;

    /*MOVES*/
    @property(Boolean)
    accLeft: boolean = false;
    @property(Boolean)
    accRight: boolean = false;
    @property(Boolean)
    accUp: boolean = false;
    @property(Boolean)
    accDown: boolean = false;
    @property(Number)
    backMovespeed: number = 10;

    /*GAME IMFORMATIONS */
    @property(Object)
    lastBoarddata: object = new (Object);
    @property(Array)
    instructionQueue: string[] = new (Array);
    @property(Number)
    instBusyCounter: number = 0;


    @property(Boolean)
    map = false;
    @property(Object)
    colorTable: object = new (Object);
    @property(Object)
    gameInfotmation: object = new (Object);
    @property(Object)
    playerImfor: object = new (Object);
    @property(Boolean)
    mouseIsLeftkeyNow = false;

    /*UI*/
    @property(cc.Node)
    UI: cc.Node = null;
    /*block needs */
    @property(Boolean)
    canClick: boolean = false;
    @property(Number)
    blockIndex: number = -1;
    @property(Boolean)
    blockClickFlag: boolean = false;

    // LIFE-CYCLE CALLBACKS:


    onLoad() {
        this.ws = new WebSocket('wss://192.168.50.62:1234');
        this.ws.addEventListener('message', function (evt) {
            //console.log("listenner: ", currentInst);
            globalResponse['reciveType'] = currentInst;
            globalResponse['data'] = JSON.parse(evt.data);
            globalResponse['changeFlag'] = true;
        })
        this.ws.onopen = function (evt) {
            wsStandBy = "onOpen";
        };

        globalResponse['changeFlag'] = false;
        globalResponse['reciveType'] = '';

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeydown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.schedule(this.sendInst, 0.025);
        this.schedule(this.refplayinfo, 1);
        this.makeColorTable();

        this.gameInfotmation['Player'] = new (Object);
        this.gameInfotmation['History'] = new (Object);

        this.ERR.zIndex = 1;
        this.ERR.active = false;
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDown, this);

    }
    refplayinfo() {
        this.instructionQueue.push("getPlayer");
    }
    makeColorTable() {
        for (let index = 0; index < 64; index++) {
            let aColor = cc.color(Math.floor(0xff * Math.random()), Math.floor(0xff * Math.random()), Math.floor(0xff * Math.random()), 0xff);
            this.colorTable[index] = aColor;
        }
    }
    sendInst() {
        if (wsStandBy == "standBy") {
            let inst = this.instructionQueue.shift()
            //console.log("run " + inst);
            if (inst) {
                if (inst == "getPlayer") {
                    currentInst = inst.slice();
                    this.getPlayer();
                }
                else if (inst == "getBoard") {
                    currentInst = inst.slice();
                    this.getBoard();
                }
                else if (inst == "getHistory") {
                    currentInst = inst.slice();
                    this.getHistory();
                }
                else if (inst == "actionJoin") {
                    currentInst = inst.slice();
                    this.actionJoin();
                }
                else if (inst == "actionClick") {
                    currentInst = inst.slice();
                    this.actionClick(this.blockIndex, this.mouseIsLeftkeyNow);
                }
                else {
                    console.log("wrong inst :", inst);
                }
                //console.log("send: ", currentInst);
                wsStandBy = "busy";
                this.instBusyCounter = 0;
            }
        }
        else if (wsStandBy == "busy") {
            this.instBusyCounter++;
            if (this.instBusyCounter >= 50) {
                console.log("inst timeout");
                this.somethingERR("bad connect!?");
                //wsStandBy = "standBy";
            }
        }
    }

    onKeydown(event) {
        if (event.keyCode == cc.macro.KEY.a) {
            this.accLeft = true;
            this.accRight = false;
        }
        if (event.keyCode == cc.macro.KEY.d) {
            this.accLeft = false;
            this.accRight = true;
        }
        if (event.keyCode == cc.macro.KEY.w) {
            this.accUp = true
            this.accDown = false;
        }
        if (event.keyCode == cc.macro.KEY.s) {
            this.accUp = false;
            this.accDown = true;
        }
    }
    onKeyUp(event) {
        if (event.keyCode == cc.macro.KEY.a)
            this.accLeft = false;
        if (event.keyCode == cc.macro.KEY.d)
            this.accRight = false;
        if (event.keyCode == cc.macro.KEY.w)
            this.accUp = false;
        if (event.keyCode == cc.macro.KEY.s)
            this.accDown = false;
    }

    onMouseDown(evt) {
        //console.log(evt._button);
        if (evt._button == 2)
            this.mouseIsLeftkeyNow = true;
        else
            this.mouseIsLeftkeyNow = false;
    }

    initMap() {
        let i: number = 0;
        let data: number[] = globalResponse["data"]["Client"];
        console.log(data);
        if (data) {
            for (let index = 0; index < data.length; index++) {
                const et: number = data[index];
                let aBlock = cc.instantiate(this.block);
                aBlock.getComponent('block').index = index;
                aBlock.getComponent('block').game = this.node;
                if (et != -1) {
                    let PID = Math.floor(et / 10);
                    aBlock.color = this.colorTable[PID];
                    let symbol = (et % 10);
                    if (symbol < 9) {
                        aBlock.getChildByName('imformation').getComponent(cc.Label).string = symbol.toString();
                    }
                    else {
                        aBlock.getChildByName('imformation').getComponent(cc.Label).string = "?";
                        aBlock.getChildByName('imformation').color = cc.color(0xff, 0x24, 0x00, 0xff);
                    }
                    aBlock.getComponent(cc.Button).interactable = false;

                }
                this.node.addChild(aBlock);
            }
            this.lastBoarddata["Client"] = new (Object);
            Object.assign(this.lastBoarddata["Client"], globalResponse['data']['Client']);

            this.map = true;
        }
    }
    refMap() {
        //console.log("refmap")
        for (let index = 0; index < globalResponse['data']["Client"].length; index++) {
            if (globalResponse['data']["Client"][index] != this.lastBoarddata[index]) {
                let et = globalResponse['data']["Client"][index];
                if (et != -1) {
                    let PID = Math.floor(et / 10);
                    let blocks = this.node.children;
                    let aBlock = blocks[index];
                    aBlock.color = this.colorTable[PID];
                    let symbol = (et % 10);
                    if (symbol < 9) {
                        aBlock.getChildByName('imformation').getComponent(cc.Label).string = symbol.toString();
                    }
                    else {
                        aBlock.getChildByName('imformation').getComponent(cc.Label).string = "?";
                        aBlock.getChildByName('imformation').color = cc.color(0xff, 0x24, 0x00, 0xff);
                    }
                    aBlock.getComponent(cc.Button).interactable = false;
                }
            }
        }
    }

    closeERR() {
        this.ERR.active = false;
    }
    somethingERR(str: string) {
        this.ERR.active = true;
        let lebal = this.ERR.getChildByName('error').getComponent(cc.Label);
        lebal.string = str;
    }

    changeServer() {
        let ip: string = "wss://" + this.IpEditBox.string;
        wsStandBy = "";
        let serverLabel: cc.Node = this.UI.getComponent("UI").serverLabel;
        serverLabel.getComponent(cc.Label).string = "";
        if (this.ws) {
            this.ws.close()
        }
        this.ws = new WebSocket(ip);
        this.ws.addEventListener('message', function (evt) {
            //console.log("listenner: ", currentInst);
            globalResponse['reciveType'] = currentInst;
            globalResponse['data'] = JSON.parse(evt.data);
            globalResponse['changeFlag'] = true;
        })
        this.ws.onopen = function (evt) {
            wsStandBy = "onOpen";
        };

        this.scheduleOnce(function () {
            if (wsStandBy != "") {
                serverLabel.active = true;
                serverLabel.getComponent(cc.Label).string = "server: " + this.IpEditBox.string.slice();
            }
            else {
                this.somethingERR("fail to connect server");
            }
        }, 3);
    }
    changeColor() {
        this.makeColorTable();

    }
    joinToGame() {
        this.instructionQueue.unshift("actionJoin");
    }
    takeHystory() {
        this.instructionQueue.unshift("getHistory");
    }
    takeAlives() {
        let callUI = this.UI.getComponent("UI");
        let infoObj = new Object;
        infoObj["tital"] = "Alives";
        infoObj["data"] = this.gameInfotmation["Player"]["data"].slice();
        console.log(infoObj);
        callUI.somethingInfo(infoObj);
    }

    /*Request:
    {
        "Type": "get.board"     // Request type
    }
 
    Response:
    {
        "GID": 0,               // Game index
        "Height": 64,           // Number of game rows
        "Width": 64,            // Number of game columns
        "Playing": true,        // Game has started
        "Client": [-1, -1, ...] // Integer Array with (Height * Width) elements, -1 value is means unknown, other value is PlayerID * 10 + X, X is the number of mines around, if X is 9 it means the flag has been set up 
    }*/
    getBoard() {
        let req: Object = new Object();
        req["Type"] = "get.board";
        this.ws.send(JSON.stringify(req));
    }
    /*Request:
    {
        "Type": "get.players"   // Request type
    }
 
    Response:
    [
        {
            "Alive": true,      // The player is Alive
            "Name": "nickname", // Player's nickname
            "Score": 0,         // Player's score
        }, ...
    ]   // All players in current game */
    getPlayer() {
        let req: Object = new Object();
        req["Type"] = "get.players";
        this.ws.send(JSON.stringify(req));
    }
    /*Request:
    {
        "Type": "get.history"   // Request type
    }
 
    Response:
    [
        {
            "GID": 0,       // Game index
            "Players":  [
                            {
                                "Alive": true,      // The player is Alive
                                "Name": "nickname", // Player's nickname
                                "Score": 0,         // Player's score
                            }, ...
                        ]   // All players in that game
        }, ...
    ]   // All player records in server*/
    getHistory() {
        let req: Object = new Object();
        req["Type"] = "get.history";
        this.ws.send(JSON.stringify(req));
    }
    /*Request:
    {
        "Type": "action.join"   // Request type
        "Name": "nickname"      // Player's nickname
    }
 
    Response:
    {
        "Code": 0,  // Status code, 0: successed, 1: name already used, 2: current players is full, 3: game players is full, 4: already in the game
        "Pid": 0    // If successed, this is your player index
    }*/
    actionJoin() {
        let req: Object = new Object();
        req["Type"] = "action.join";
        req["Name"] = this.nameEditBox.string;
        this.ws.send(JSON.stringify(req));
    }
    /*Request:
    {
        "Type": "action.click" // Request type
        "Index": 0          // Element index of game array
        "Flag": false       // false: normal click, true: set up flag
    }
 
    Response:
    {
        "Code": 0,  // Status code, 0: successed, 1: has been clicked, 2: player is dead, 3: have not join game, 4: game has not started
        "Score": 0  // -1: you died, 0: click failed, other: score obtained
    }*/
    actionClick(index: number, flag: boolean) {
        let req: Object = new Object();
        req["Type"] = "action.click";
        req["Index"] = index;
        if (flag)
            req["Flag"] = true;
        else
            req["Flag"] = false;

        this.ws.send(JSON.stringify(req));
    }

    makeGamePlayerinformation() {
        let dataArr: object[] = globalResponse['data'];
        //console.log(dataArr);
        //console.log(currentInst);
        this.gameInfotmation["Player"]["data"] = dataArr.slice();
        this.gameInfotmation["Player"]["changeFlag"] = true;
        this.gameInfotmation["changeFlag"] = true;
    }




    start() {

    }

    update(dt) {
        //console.log(globalResponse);
        if (wsStandBy == 'onOpen') {
            wsStandBy = 'standBy';
            this.instructionQueue.push("getPlayer");
            this.instructionQueue.push("getBoard");
        }

        if (globalResponse['changeFlag']) {
            if (globalResponse['reciveType'] == 'getBoard') {
                if (!this.map) {
                    this.initMap();
                    console.log("initmap");
                }
                else {
                    this.refMap();
                }
                this.instructionQueue.push("getBoard");
            }
            else if (globalResponse['reciveType'] == 'getPlayer') {
                //console.log("getPlayer: ", globalResponse);
                this.makeGamePlayerinformation();
                //console.log("game imfo: ", this.gameInfotmation);
            }
            else if (globalResponse['reciveType'] == 'getHistory') {
                let infoObj: object = new Object;
                infoObj['tital'] = "History";
                infoObj['data'] = globalResponse['data'].slice();
                console.log(globalResponse);
                this.UI.getComponent("UI").somethingInfo(infoObj);
            }
            else if (globalResponse['reciveType'] == 'actionJoin') {
                if (globalResponse['data']['Code'] != 0) {
                    if (globalResponse['data']['Code'] == 1) {
                        this.somethingERR("name already used");
                    }
                    else if (globalResponse['data']['Code'] == 2) {
                        this.somethingERR("current players is full");
                    }
                    else if (globalResponse['data']['Code'] == 3) {
                        this.somethingERR("game players is full");
                    }
                    else if (globalResponse['data']['Code'] == 4) {
                        this.somethingERR("already in the game");
                    }
                    else this.somethingERR("yo what the fuck?");
                }
                else if (globalResponse['data']['Code'] == 0) {
                    this.UI.getComponent('UI').closeMenu();
                    Object.assign(this.playerImfor, globalResponse['data']);
                    console.log("join to the game");
                    console.log("PID =", this.playerImfor['Pid']);
                    this.playerImfor["name"] = this.nameEditBox.string;
                    this.playerImfor["score"] = 0;
                    this.playerImfor["changeFlag"] = true;
                    this.canClick = true;
                }
            }
            else if (globalResponse['reciveType'] == 'actionClick') {
                console.log(globalResponse['data']['Score']);
                if (globalResponse['data']['Code'] != 0) {

                    if (globalResponse['data']['Code'] == 3) {
                        this.somethingERR("U R Not In Za Game");
                    }
                    if (globalResponse['data']['Code'] == 4) {
                        this.somethingERR("game has not started");
                    }
                }
                else {
                    console.log(globalResponse['data']['Score']);
                    if (globalResponse['data']['Score'] == -1) {
                        this.somethingERR("GGGGGGGGGGGGG");
                    }
                    else {
                        this.playerImfor["score"] += globalResponse['data']['Score'];
                        this.playerImfor["changeFlag"] = true;
                    }

                }
            }


            if (this.gameInfotmation["changeFlag"] == true) {
                let UIimfor = this.UI.getComponent("UI").information;
                Object.assign(UIimfor, this.gameInfotmation);
                //console.log(UIimfor);
                this.gameInfotmation["changeFlag"] = false;
            }
            if (this.playerImfor['changeFlag']) {
                let ns: object = this.UI.getComponent("UI").nameAndScoreObj;
                Object.assign(ns, this.playerImfor);
                this.playerImfor['changeFlag'] = false;
            }
            globalResponse['changeFlag'] = false;
            wsStandBy = 'standBy';
        }
        if (this.blockClickFlag) {

            //console.log(this.mouseIsLeftkeyNow);

            //if (this.canClick)
            this.instructionQueue.unshift("actionClick");

            this.blockClickFlag = false;
        }


        /*mapmove */
        if (this.accUp) {
            if (this.node.y > -(this.node.height - this.camera.height) / 2)
                this.node.y -= this.backMovespeed;
        }
        if (this.accDown) {
            if (this.node.y < (this.node.height - this.camera.height) / 2)
                this.node.y += this.backMovespeed;
        }
        if (this.accRight) {
            if (this.node.x > -(this.node.width - this.camera.width) / 2)
                this.node.x -= this.backMovespeed;
        }
        if (this.accLeft) {
            if (this.node.x < (this.node.width - this.camera.width) / 2)
                this.node.x += this.backMovespeed;
        }


        /* */


    }
}
