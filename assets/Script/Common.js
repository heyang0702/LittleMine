// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        messageBoxNode: {
            default: null,
            type: cc.Node,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
      1
    },

    messageBox({ title, content, leftButton, rightButton = '确定', leftCallback, rightCallback }) {
        if (typeof this.messageBoxNode !== 'object') { 
            throw new Error('messageBoxNode对象不存在,请检查this指向!');
        }

        this.messageBoxNode.parent.active = true;

        const titleNode = this.messageBoxNode.getChildren()[0]; // 获取标题元素
        const contentNode = this.messageBoxNode.getChildren()[1]; // 获取内容元素
        const buttonsNode = this.messageBoxNode.getChildren()[2]; // 获取按钮元素
        titleNode.getComponent(cc.Label).string = title;
        contentNode.getComponent(cc.Label).string = content;
        if (leftButton) {
            buttonsNode.getChildren()[0].active = true;
            buttonsNode.getChildren()[0].getChildren()[0].getComponent(cc.Label).string = leftButton;
            buttonsNode.getChildren()[0].once(cc.Node.EventType.TOUCH_END, () => {
                if (typeof leftCallback === 'function') {
                    leftCallback();
                }
                this.clearAll();
                this.messageBoxNode.parent.active = false;
            });
        }
        if (rightButton) {
            buttonsNode.getChildren()[1].active = true;
            buttonsNode.getChildren()[1].getChildren()[0].getComponent(cc.Label).string = rightButton;
            buttonsNode.getChildren()[1].once(cc.Node.EventType.TOUCH_END, () => {
                if (typeof rightCallback === 'function') {
                    rightCallback();
                }
                this.clearAll();
                this.messageBoxNode.parent.active = false;
            });
        }
    },

    /**
     * @description 使用完成之后清空
     * @author Liu_Qi
     * @date 2019-08-25
     */
    clearAll() {
        const titleNode = this.messageBoxNode.getChildren()[0]; // 获取标题元素
        const contentNode = this.messageBoxNode.getChildren()[1]; // 获取内容元素
        const buttonsNode = this.messageBoxNode.getChildren()[2]; // 获取按钮元素
        titleNode.getComponent(cc.Label).string = '';
        contentNode.getComponent(cc.Label).string = '';
        buttonsNode.getChildren()[0].active = false;
        buttonsNode.getChildren()[0].getChildren()[0].getComponent(cc.Label).string = '';
        buttonsNode.getChildren()[1].active = false;
        buttonsNode.getChildren()[1].getChildren()[0].getComponent(cc.Label).string = '';
    }

    // update (dt) {},
});
