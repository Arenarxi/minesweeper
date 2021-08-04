// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    charts: cc.Node = null;
    @property(cc.Node)
    game: cc.Node = null;
    @property(cc.Node)
    nicknameLabel: cc.Node = null;
    @property(cc.Node)
    scoreLabel: cc.Node = null;
    @property(cc.Node)
    serverLabel: cc.Node = null;
    @property(cc.Node)
    menu: cc.Node = null;
    @property(cc.Node)
    hint: cc.Node = null;

    @property(Object)
    information: object = new (Object);
    @property(Object)
    nameAndScoreObj: object = new (Object);
    @property(Object)
    colorTable: object = new (Object);

    @property(Object)
    page: object = new (Object);
    @property(Number)
    pageNumber: number = 0;

    @property(cc.Node)
    infoPage: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.information["changeFlag"] = false;
        this.nameAndScoreObj["changeFlag"] = false;
        this.node.zIndex = 1;
        this.colorTable["flag"] = false;
        this.closeInfo();
        this.closeMenu();
        this.nicknameLabel.active = false;
        this.scoreLabel.active = false;
        this.serverLabel.active = false;
    }

    start() {

    }
    closeMenu() {
        let menu = this.node.getChildByName("menu");
        menu.active = false;
        let openMenu = this.node.getChildByName("openMenu");
        openMenu.active = true;
    }
    openMenu() {
        let menu = this.node.getChildByName("menu");
        menu.active = true;
        let openMenu = this.node.getChildByName("openMenu");
        openMenu.active = false;
    }

    somethingInfo(info: object) {
        this.infoPage.active = true;
        let menu = this.node.getChildByName("menu");
        menu.active = false;
        let openMenu = this.node.getChildByName("openMenu");
        openMenu.active = false;

        let tital = this.infoPage.getChildByName("tital");
        let content = this.infoPage.getChildByName("info");
        tital.getComponent(cc.Label).string = info["tital"];
        if (info["tital"] == "History") {
            let data: object[] = info["data"];
            data.forEach(et => {
                let apage: string = this.page[et["GID"]];
                apage = "Game Index: " + this.page[et["GID"]] + "\n";
                for (let i = 0; i < ((et["Players"].length < 20) ? (et["Players"].length) : 20); i++) {
                    apage += et["Players"][i]["Name"] + "          " + et["Players"][i]["Score"] + "\n";
                }
            })
            this.pageNumber = 0;
            content.getComponent(cc.Label).string = this.page[this.pageNumber];
            if (data.length == 0)
                content.getComponent(cc.Label).string = "nope";
        }
        if (info["tital"] == "Alives") {
            console.log(info);
            let data: object[] = info["data"];
            let apage: string = "";
            data.forEach(et => {
                if (et['Alive']) {
                    apage += et['Name'] + "\n";
                }
            })
            this.pageNumber = 0;
            content.getComponent(cc.Label).string = apage;
            if (data.length == 0)
                content.getComponent(cc.Label).string = "nope";
        }
    }
    closeInfo() {
        this.infoPage.active = false;
        this.openMenu();
    }
    takeHint() {
        this.hint.active = true;
        this.closeMenu();
    }
    closeHint() {
        this.hint.active = false;
        this.openMenu();
    }

    openHistory() {
        let ainfo: object = new Object;
        ainfo['tital'] = "History";
        ainfo['data'] = "tteesstt\nfucklalal\n3row";
        this.somethingInfo(ainfo);
        this.closeMenu();
        let openMenu = this.node.getChildByName("openMenu");
        openMenu.active = false;
    }

    refCharts() {
        Object.assign(this.charts.getComponent('charts').information, this.information);
    }
    update(dt) {
        if (this.information["changeFlag"]) {
            this.refCharts();
            this.information["changeFlag"] = false;
        }
        if (!this.colorTable["flag"]) {
            this.colorTable["table"] = this.game.getComponent("game").colorTable;
            this.colorTable["flag"] = true;
            this.charts.getComponent("charts").colorTable = this.colorTable;
        }
        if (this.nameAndScoreObj["changeFlag"]) {
            this.nicknameLabel.active = true;
            this.scoreLabel.active = true;
            this.nicknameLabel.getComponent(cc.Label).string = "Name: " + this.nameAndScoreObj["name"];
            this.scoreLabel.getComponent(cc.Label).string = "Score: " + this.nameAndScoreObj["score"];
            this.nameAndScoreObj["changeFlag"] = false;
        }

    }
}
