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
        label: {
            default: null,
            type: cc.Label,
        },
        showGirdOne: {
            default: null,
            type: cc.Sprite,
        },
        footprint: {
            default: null,
            type: cc.Sprite,
        },
        flag: {
            default: null,
            type: cc.Sprite
        },
        footprintAnimation: {
            default: null,
            type: cc.Animation
        },
        failSkull: {
            default: null,
            type: cc.Sprite
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        //初始化
        this.initGird();
    },

    onLoad() {
        // this.label.string = '8';
    },

    /**
     * @description 初始化格子添加监听
     * @author Liu_Qi
     * @date 2019-08-12
     */
    initGird() {
        this.showGirdOne.getComponent(cc.Sprite).node.on(cc.Node.EventType.TOUCH_START, (e) => {
            //按下则显示footprint
            if (!this.flag.node.active) {
                // this.footprintAnimation.play('footprintAnimation');
                this.footprint.node.active = true;
                // console.log(this.getComponent(cc.Animation).play('footprintAnimation'))
            }
            e.currentTarget.pressTime = new Date().getTime();
        });
        this.showGirdOne.getComponent(cc.Sprite).node.on(cc.Node.EventType.TOUCH_END, (e) => {
            //松开则隐藏footprint
            this.footprint.node.active = false;
            //判断按压时间
            const pressTime = new Date().getTime() - e.currentTarget.pressTime;
            //如果大于350毫秒则判断为长按
            if (pressTime > 350) {
                this.flag.node.active = !this.flag.node.active;
                this.node.dispatchEvent(new cc.Event.EventCustom('gridOneTouchFlag', true));
            } else if (!this.flag.node.active) {
                this.showGirdOne.node.active = false;
                this.node.dispatchEvent(new cc.Event.EventCustom('gridOneTouchOpen', true));
            }

        });
        
        this.showGirdOne.getComponent(cc.Sprite).node.on(cc.Node.EventType.TOUCH_CANCEL, (e) => {
            this.footprint.node.active = false;
        })
    },

    /**
     * @description 设置label文字和颜色
     * @author Liu_Qi
     * @date 2019-08-07
     * @param {*} { numb = '', color = cc.color(255, 225, 225) }
     */
    setLabelPro({ numb = '', color = cc.color(255, 225, 225) }) {
        this.label.string = numb;
        this.label.node.color = color;
        if (numb < 0) {
            this.label.node.active = false;
            this.failSkull.node.active = true;
        }
        // console.log(this.label)
        // console.log('start ..s')
    },



    // update (dt) {},
});
