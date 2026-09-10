// 线索板数据
//  main  主线索卡：可点开看大图、双击翻面看背面档案
//  bg    背景卡：铺在下面、互相重叠，不作说明，也不可点
// 图片全部来自 njmuseum/photos/raw（已压缩到 assets/relics/）

const ARCHIVE = {
  title: '文物档案',
  cards: [
    /* ============ 主线索卡（有背面档案）============ */
    { id: 'r01', kind: 'main', file: 'assets/relics/relic-01.jpg', name: '霁蓝釉瓶',
      era: '明代 · 官窑', source: '守夜人 保存', state: '完好',
      note: '深蓝如天色。一窑只成一两件，烧它的人得等火候自己到位。它传了六百年，装过粮，也盛过水。',
      related: ['r02', 'r03'], x: 12, y: 27, w: 178, rot: -3, z: 12 },

    { id: 'r02', kind: 'main', file: 'assets/relics/relic-02.jpg', name: '青花高足碗',
      era: '明中期', source: '青瓷 保存', state: '完好',
      note: '碗足细高，缠枝莲纹。它不是被谁珍藏下来的，是没人当回事，才躲过一劫。',
      related: ['r01', 'r06'], x: 30, y: 17, w: 162, rot: 2, z: 11 },

    { id: 'r03', kind: 'main', file: 'assets/relics/relic-03.jpg', name: '玉如意',
      era: '清', source: '如意 追回', state: '完好',
      note: '2014 年从老藏家家里被请走，2015 年出现在私下交易群里。有人跑了三趟，把它劝了回来。',
      related: ['r08', 'r01'], x: 47, y: 25, w: 168, rot: -2, z: 13 },

    { id: 'r04', kind: 'main', file: 'assets/relics/relic-04.jpg', name: '水墨山水长卷',
      era: '清', source: '长卷 保存', state: '绢面起翘',
      note: '长卷怕潮。2016 年梅雨季，房间湿度到过 78%。恒温柜申请了三次，驳回了三次。',
      related: ['r05'], x: 64, y: 16, w: 158, rot: 3, z: 12 },

    { id: 'r05', kind: 'main', file: 'assets/relics/relic-05.jpg', name: '梅花工笔画',
      era: '清中期 · 绢本', source: '过客 建档', state: '有霉斑',
      note: '一株梅花。有人给它建了档：每个月拍一次照，记下绢面的变化。',
      related: ['r04'], x: 80, y: 28, w: 168, rot: -4, z: 14 },

    { id: 'r06', kind: 'main', file: 'assets/relics/relic-06.jpg', name: '斗彩大盘',
      era: '明宣德 · 斗彩', source: '陈列室', state: '2017-07-16 失窃',
      note: '柜子没有撬痕，钥匙人手一把，前一晚十点还有人签退。警方说：来源说不清，立案先缓缓。',
      related: ['r02', 'r07'], x: 20, y: 59, w: 182, rot: 2, z: 15 },

    { id: 'r07', kind: 'main', file: 'assets/relics/relic-07.jpg', name: '四人合影',
      era: '2016-12-28', source: '博物院门前', state: '手写批注',
      note: '第一次，也是唯一一次聚齐。右下角有人后来补了一行字：2017.12.28。那天不是合影的日子，是站里最后还有人的一天。',
      related: ['r06', 'r09'], x: 72, y: 63, w: 192, rot: -3, z: 16 },

    { id: 'r08', kind: 'main', file: 'assets/relics/relic-08.jpg', name: '漆占盘',
      era: '西汉 · 天文占盘', source: '民间保存', state: '边缘有裂',
      note: '盘上刻着二十八宿。有人用它占过吉凶，也有人拿它算过一件东西还能留多久。',
      related: ['r03', 'r09'], x: 42, y: 49, w: 152, rot: 4, z: 13 },

    { id: 'r09', kind: 'main', file: 'assets/relics/relic-09.jpg', name: '鎏金舍利塔',
      era: '明 · 鎏金', source: '来路不明', state: '待考',
      note: '照片上没写它叫什么，只写了一行："不知何物，先收着。"后来也没人再提过它。',
      related: ['r08', 'r07'], x: 55, y: 71, w: 158, rot: -2, z: 14 },

    /* ============ 背景卡（无说明、不可点、互相重叠）============ */
    { id: 'b10', kind: 'bg', file: 'assets/relics/relic-10.jpg', x: 5,  y: 53, w: 132, rot: -6, z: 3 },
    { id: 'b11', kind: 'bg', file: 'assets/relics/relic-11.jpg', x: 24, y: 41, w: 128, rot: 5,  z: 2 },
    { id: 'b12', kind: 'bg', file: 'assets/relics/relic-12.jpg', x: 36, y: 76, w: 138, rot: -4, z: 4 },
    { id: 'b13', kind: 'bg', file: 'assets/relics/relic-13.jpg', x: 58, y: 36, w: 126, rot: 6,  z: 2 },
    { id: 'b14', kind: 'bg', file: 'assets/relics/relic-14.jpg', x: 7,  y: 84, w: 120, rot: 4,  z: 3 },
    { id: 'b15', kind: 'bg', file: 'assets/relics/relic-15.jpg', x: 88, y: 47, w: 134, rot: -5, z: 4 },
    { id: 'b16', kind: 'bg', file: 'assets/relics/relic-16.jpg', x: 67, y: 85, w: 128, rot: 3,  z: 2 },
    { id: 'b17', kind: 'bg', file: 'assets/relics/relic-17.jpg', x: 90, y: 13, w: 124, rot: -3, z: 3 },
    { id: 'b18', kind: 'bg', file: 'assets/relics/relic-18.jpg', x: 4,  y: 15, w: 118, rot: 5,  z: 4 },
    { id: 'b19', kind: 'bg', file: 'assets/relics/relic-19.jpg', x: 44, y: 87, w: 122, rot: -3, z: 3 },
    { id: 'b20', kind: 'bg', file: 'assets/relics/relic-20.jpg', x: 78, y: 79, w: 130, rot: 4,  z: 2 },
    { id: 'b21', kind: 'bg', file: 'assets/relics/relic-21.jpg', x: 92, y: 63, w: 126, rot: -4, z: 3 },
    { id: 'b22', kind: 'bg', file: 'assets/relics/relic-22.jpg', x: 16, y: 73, w: 116, rot: 6,  z: 2 },
  ]
};

window.ARCHIVE = ARCHIVE;
