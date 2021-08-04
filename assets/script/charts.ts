// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(Object)
    information: object = new (Object);
    @property(cc.Prefab)
    chartsBar: cc.Node = null;
    @property(Boolean)
    chartsBarFlag: boolean = false;
    @property(Object)
    colorTable: object = new (Object);
    @property(Boolean)
    minifyFlag: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.information['Player'] = new (Object);
        this.information['Player']['changeFlag'] = false;
        this.information['changeFlag'] = false;
        this.colorTable["flag"] = false;
    }

    start() {

    }

    chartsMinyfy() {
        if (!this.minifyFlag) {
            let bars = this.node.children;
            for (let i = 0; i < 6; i++) {
                bars[i].active = false;
            }
            this.node.width = 50;
            this.node.height = 50;
            this.node.y += 60;
            this.node.x += 60;
            this.minifyFlag = true;
        }
        else {
            let bars = this.node.children;
            for (let i = 0; i < 6; i++) {
                bars[i].active = true;
            }
            this.minifyFlag = false;
            this.node.width = 240;
            this.node.height = 160;
            this.node.y -= 60;
            this.node.x -= 60;
        }
    }

    refCharts() {
        console.log("rRRRR");
        let bestFive: object[] = this.information["Player"]["data"];
        if (this.colorTable['flag']) {
            for (let i = 0; i < bestFive.length; i++) {
                bestFive[i]['color'] = this.colorTable["table"][i];
            }
        }

        bestFive.sort(function (a, b) {
            if (a["Score"] < b["Score"])
                return 1;
            if (a["Score"] > b["Score"])
                return -1;
            return 0;
        });

        if (!this.chartsBarFlag) {
            for (let i = 0; i < 6; i++) {
                let aBar = cc.instantiate(this.chartsBar);
                let barLabel = aBar.getComponent(cc.Label);
                if (i == 0) {
                    barLabel.string = "charts";
                    aBar.color = cc.color(0, 0, 0, 0);
                    aBar.getChildByName("score").active = false;
                }
                else {
                    aBar.anchorX = 0;
                    aBar.x = -100;
                    barLabel.string = "#" + i;
                }
                this.node.addChild(aBar);
            }
            this.chartsBarFlag = true;
        }
        if (this.chartsBarFlag) {
            let howManyBar: number = (bestFive.length < 5) ? (bestFive.length + 1) : 6;
            let bars = this.node.children;

            for (let i = 1; i < howManyBar; i++) {
                let aBar = bars[i];
                let barLabel = aBar.getComponent(cc.Label);
                let scoreLabel = aBar.getChildByName("score").getComponent(cc.Label);
                barLabel.string = "#" + i + ": " + bestFive[i - 1]["Name"];
                scoreLabel.string = bestFive[i - 1]["Score"]
                aBar.color = bestFive[i - 1]["color"];
            }
        }

        //console.log(bestFive);
    }

    update(dt) {
        if (this.information["changeFlag"]) {
            if (this.information['Player']['changeFlag']) {
                if (this.colorTable["flag"]) {
                    this.refCharts();
                }
            }
            this.information["changeFlag"] = false;
        }
        if (this.minifyFlag) {

        }
    }
}
