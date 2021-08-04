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
    game: cc.Node = null;
    @property(Number)
    index: number = -5;

    // LIFE-CYCLE CALLBACKS:

    click() {
        this.game.getComponent("game").blockIndex = this.index;
        this.game.getComponent("game").blockClickFlag = true;
    }

    onLoad() { }

    start() {

    }

    // update (dt) {}
}
