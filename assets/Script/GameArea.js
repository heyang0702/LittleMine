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
        prefabGard: {
            default: null,
            type: cc.Prefab,
        },
        gameScrollView: {
            default: null,
            type: cc.ScrollView
        },
        instanceGirds: [],
        baseConfig: {
            default: null,
        },
        findMineNumb: {
            default: null,
        },
        findMineSprite: {
            default: null,
            type: cc.SpriteFrame,
        },
        originMineSprite: {
            default: null,
            type: cc.SpriteFrame,
        },
        scrollContent: {
            default: null,
            type: cc.Node
        },
        rankConfig: {
            default: null,
        },
        topBanner: {
            default: null,
            type: cc.Layout,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // 初始化基础配置
        this.baseConfig = {
            mineNumb: 10,
            rows: 13,
            column: 10,
        };
        // 初始化雷的数量
        this.findMineNumb = {
            chooseNumb: 0,
            realNumb: 0
        };
        // 初始化比赛参数
        this.rankConfig = {
            time: 0,
            customsPass: 0,
            timePause: false
        }
        // this.messageBox({
        //     title: '测试', content: '我就是个测试', leftButton: '取消', rightButton: '确定', leftCallback: () => {
        //         console.log('left')
        //     },
        //     rightCallback: () => { 
        //         console.log('right')
        //     }
        // })

    },



    start() {
        // console.log(cc.find("Canvas/dialog").active)
        // console.log(cc.find("Canvas/dialog").enabled)
        const common = cc.find('Canvas/Common').getComponent('Common');
        this.MessageBox = common.messageBox.bind(common);

        this.MessageBox({
            title: '游戏规则', content: '长按标记和取消地雷\n当所有地雷被标记时取得胜利', rightButton: '确定',
            rightCallback: () => {
                this.logRankConfig();
            }
        })
        this.initGrid(this.baseConfig);

        this.gridOneTouch();
    },

    /**
     * @description 更新顶部banner时间和雷的数量
     * @author Liu_Qi
     * @date 2019-08-24
     */
    logRankConfig() {
        // console.log(this.topBanner)
        const topBanner = this.topBanner.node.getChildren();
        const topTimeout = topBanner[1].getChildren()[0].getComponent(cc.Label);
        const component = cc.director.getScheduler();
        component.schedule(() => {
            // 这里的 this 指向 component
            this.rankConfig.time++;
            let decade = Math.floor(this.rankConfig.time / 60);
            let theUnit = Math.floor(this.rankConfig.time % 60);
            if (decade > 60) {
                decade = 60;
                theUnit = 60;
            }
            topTimeout.string = `${decade.toString().length > 1 ? decade : ('0' + decade.toString())}:${theUnit.toString().length > 1 ? theUnit : ('0' + theUnit.toString())}`;
        }, this, 1, cc.macro.REPEAT_FOREVER, 0, this.rankConfig.timePause);
        // setInterval(() => {
        //     this.rankConfig.time++;
        //     let decade = Math.floor(this.rankConfig.time / 60);
        //     let theUnit = Math.floor(this.rankConfig.time % 60);
        //     if (decade > 60) {
        //         decade = 60;
        //         theUnit = 60;
        //     }
        //     topTimeout.string = `${decade.toString().length > 1 ? decade : ('0' + decade.toString())}:${theUnit.toString().length > 1 ? theUnit : ('0' + theUnit.toString())}`;
        // }, 1000);
    },

    /**
     * @description 更新顶部雷的数量
     * @author Liu_Qi
     * @date 2019-08-25
     */
    updateTopFindMine() {
        const topBanner = this.topBanner.node.getChildren();
        const findMine = topBanner[0].getChildren()[0].getComponent(cc.Label);

        findMine.string = `${this.findMineNumb.chooseNumb}/${this.baseConfig.mineNumb}`;
    },

    /**
     * @description 添加事件处理
     * @author Liu_Qi
     * @date 2019-08-24
     */
    gridOneTouch() {
        this.scrollContent.on('gridOneTouchOpen', (event) => {
            event.stopPropagation();
            const targetGridOne = event.target.getChildren();
            const targetGridOneLabel = targetGridOne[0].getComponent(cc.Label);
            if (targetGridOneLabel.string < 0) {
                this.MessageBox({
                    title: '提示', content: '我不得不说您真是个渣渣!', rightButton: '确定',
                    rightCallback: () => {
                        this.initGrid(this.baseConfig, 'failed');
                    }
                })
            } else if (targetGridOneLabel.string === '') {
                this.removeBlank({ currentItem: event.target.instanceGirdsIndex });
            } else {
                targetGridOne[1].destroy();
            }
        });

        this.scrollContent.on('gridOneTouchFlag', (event) => {
            event.stopPropagation();
            const targetGridOne = event.target.getChildren();
            const targetGridOneLabel = targetGridOne[0].getComponent(cc.Label);
            const targetGridOneFlag = targetGridOne[2].getChildren()[1];
            if (targetGridOneFlag.active) {
                this.findMineNumb.chooseNumb++;
                if (targetGridOneLabel.string <= 0) {
                    this.findMineNumb.realNumb++;
                }
            } else {
                this.findMineNumb.chooseNumb--;
                if (targetGridOneLabel.string <= 0) {
                    this.findMineNumb.realNumb--;
                }
            }

            //更新顶部雷数
            this.updateTopFindMine();
            if (this.findMineNumb.realNumb >= this.baseConfig.mineNumb) {
                this.rankConfig.timePause = true;
                this.MessageBox({
                    title: '提示', content: `恭喜你闯关成功,用时${this.topBanner.node.getChildren()[1].getChildren()[0].getComponent(cc.Label).string},接下来难度更大哟!`, rightButton: '继续',
                    rightCallback: () => {
                        this.rankConfig.timePause = false;
                        this.initGrid({ mineNumb: this.baseConfig.mineNumb * 2, rows: this.baseConfig.rows + 5, column: 10 });
                    }
                })

            }

        })

    },

    /**
     * @description 初始化网格
     * @author Liu_Qi
     * @date 2019-08-06
     * @param {*} [{ mineNumb = 10(累的数量默认10个), rows = 13(生成网格的行数), column = 10(生成网格的列数) }={}]
     */
    initGrid({ mineNumb = 10, rows = 13, column = 10 } = baseConfig, status) {
        // 清空数组
        this.scrollContent.removeAllChildren();
        // 清除雷数
        this.findMineNumb = {
            chooseNumb: 0,
            realNumb: 0
        };
        //更新顶部雷数
        this.updateTopFindMine();

        if (status === 'failed') {
            this.rankConfig.time = 0;
        }

        this.baseConfig = {
            mineNumb,
            rows,
            column
        };
        const initArray = this.sortGrid();
        for (let i = 0, arryLength = initArray.length; i < arryLength; i++) {
            const oneGird = this.addElementAndListeners({ initArray, i, rows, column });
            oneGird.instanceGirdsIndex = i;
            oneGird.instanceGirdsPressTime = 0;
            oneGird.instanceGirdsSelected = false;
            // this.instanceGirds.push(oneGird);
            this.gameScrollView.content.addChild(oneGird);
            // this.gameScrollView.addComponent(cc.Prefab);
        }
        // this.instanceGirds = 
        // console.log(this.gameScrollView.content.getChildren());

    },

    /**
     * @description 创建网格元素并添加监听器
     * @author Liu_Qi
     * @date 2019-08-07
     * @returns 
     */
    addElementAndListeners({ initArray = [], i, rows, column }) {
        const oneGird = cc.instantiate(this.prefabGard);

        const nearList = this.getNearMineNumb({ list: initArray, currentItem: i });
        let nearNumb = '';
        if (initArray[i] === 0) {
            for (let i = 0, nearListLength = nearList.length; i < nearListLength; i++) {
                if (nearList[i] < 0) {
                    nearNumb = nearNumb ? nearNumb + 1 : 1;
                }
            }
        } else {
            nearNumb = initArray[i];
        }
        // console.log(oneGird.getComponent('GridOne').setLabelPro)
        // console.log(oneGird.getChildren()[0])
        oneGird.getComponent('GridOne').setLabelPro({ numb: nearNumb, color: this.getColorByNum(nearNumb) });
        return oneGird;
    },

    /**
     * @description 随机排序
     * @author Liu_Qi
     * @date 2019-08-06
     * @param {*} [{ mineNumb = 10, rows = 13, column = 10 }={}]
     * @returns 
     */
    sortGrid({ mineNumb = this.baseConfig.mineNumb, rows = this.baseConfig.rows, column = this.baseConfig.column } = {}) {
        const initArray = [];
        for (let i = 0, arryLength = rows * column; i < arryLength; i++) {
            if (i < mineNumb) {
                initArray.push(-1);
            } else {
                initArray.push(0);
            }
        }
        for (let i = 0, arryLength = rows * column; i < arryLength; i++) {
            const randomNum = Math.floor(Math.random() * (arryLength - i) + i);
            const temp = initArray[i];
            initArray[i] = initArray[randomNum];
            initArray[randomNum] = temp;
        }
        return initArray;
    },

    /**
     * @description 获取数字对应颜色
     * @author Liu_Qi
     * @date 2019-08-06
     * @param {number} [numb=1]
     * @returns 
     */
    getColorByNum(numb = 1) {
        switch (numb) {
            case 1:
                return cc.color(0, 250, 154);
            case 2:
                return cc.color(255, 215, 0);
            case 3:
                return cc.color(255, 69, 0);
            case 4:
                return cc.color(255, 105, 180);
            case 5:
                return cc.color(255, 20, 147);
            case 6:
                return cc.color(255, 0, 255);
            case 7:
                return cc.color(255, 69, 0);
            case 8:
                return cc.color(220, 20, 60);
            default:
                return cc.color(0, 0, 0);
        }
    },

    /**
     * @description 获取附近的方块
     * @author Liu_Qi
     * @date 2019-08-06
     * @param {*} { list = [], currentItem = 0, rows = 13, column = 10 }
     * @returns 
     */
    getNearMineNumb({ list = [], currentItem = 0, rows = this.baseConfig.rows, column = this.baseConfig.column }) {
        // const currentRows = currentItem / rows;
        // const currentColumn = currentItem % rows;
        const nearArray = [];
        //判断首列
        if (currentItem % column === 0) {
            nearArray.push(
                list[currentItem - column], list[currentItem - column + 1], //上一行
                list[currentItem], list[currentItem + 1],
                list[currentItem + column], list[currentItem + column + 1],
            );
        }
        //判断尾列
        else if ((currentItem + 1) % column === 0) {
            nearArray.push(
                list[currentItem - column - 1], list[currentItem - column], //上一行
                list[currentItem - 1], list[currentItem],
                list[currentItem + column - 1], list[currentItem + column],
            );
        }
        // 中间列
        else {
            nearArray.push(
                list[currentItem - column - 1], list[currentItem - column], list[currentItem - column + 1], //上一行
                list[currentItem - 1], list[currentItem], list[currentItem + 1],
                list[currentItem + column - 1], list[currentItem + column], list[currentItem + column + 1],
            );
        }

        return nearArray;
    },

    /**
     * @description 重新开始游戏
     * @author Liu_Qi
     * @date 2019-08-07
     */
    restartGame() {
        this.gameScrollView.content.removeAllChildren();
        this.initGrid({ mineNumb: 20, rows: 13, column: 10 });
    },

    /**
     * @description 激活对话框
     * @author Liu_Qi
     * @date 2019-08-07
     */
    activeDialog() {
        const dialogNode = cc.find("Canvas/dialog");
        dialogNode.active = true;
        // console.log(cc.find("Canvas/dialog/button").getComponent(cc.Button))
        cc.find("Canvas/dialog/button").getComponent(cc.Button).node.on(cc.Node.EventType.TOUCH_END, (event) => {
            this.restartGame();
        })
    },

    /**
     * @description 删除附近的空白
     * @author Liu_Qi
     * @date 2019-08-07
     */
    removeBlank({ instanceGirds = this.gameScrollView.content.getChildren(), currentItem, column = this.baseConfig.column }) {

        //判断首列
        if (currentItem % column === 0) {
            this.removeOne(instanceGirds[currentItem + 1]);
        }
        //判断尾列
        else if ((currentItem + 1) % column === 0) {
            this.removeOne(instanceGirds[currentItem - 1]);
        }
        // 中间列
        else {
            this.removeOne(instanceGirds[currentItem - 1]);
            this.removeOne(instanceGirds[currentItem + 1]);
        }
        this.removeOne(instanceGirds[currentItem + column]);
        this.removeOne(instanceGirds[currentItem - column]);
    },

    /**
     * @description 移除一个元素 原本是使用cc.isValid来判断该节点是否已被销毁,但是存在已经调用destroy方法,
     * 但是在该周期内cc.isValid判断不出来,导致循环递归, 所以同时使用active来判断该节点是否已经删除
     * @author Liu_Qi
     * @date 2019-08-07
     * @param {*} oneGird
     */
    removeOne(oneGird, recursion = true) {
        const girdNode = (oneGird && oneGird.getChildren()[2]) || {};
        const girdOneLabel = (oneGird && oneGird.getChildren()[0]) || {};

        if (girdNode.active && cc.isValid(girdNode) && girdOneLabel.getComponent(cc.Label).string === '') {
            girdNode.active = false;
            girdNode.destroy();
            if (recursion) {
                this.removeBlank({ currentItem: oneGird.instanceGirdsIndex });
            }
        } else if (girdNode.active && cc.isValid(girdNode) && girdOneLabel.getComponent(cc.Label).string > 0) {
            girdNode.active = false;
            girdNode.destroy();
        }
    }

});