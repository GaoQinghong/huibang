/* 慧邦生物 · 网站默认内容
 * 这是网站的"出厂内容"。部署后台后，管理员在 /admin.html 修改的内容会保存到
 * Cloudflare KV，前台优先读取后台内容；后台不可用时自动回退到本文件。
 * 因此本文件不需要手工维护 —— 改内容请用后台。
 */

var DEFAULT_SITE = {

  /* 公司信息（页脚、联系页共用） */
  company: {
    factory: '巨野县韦恩生物科技有限公司',
    service: '山东慧邦生物科技有限公司',
    slogan: '灭生性除草剂专业厂家的先行者',
    address: '山东省菏泽市巨野县化工产业园',
    phone: '',
    email: ''
  },

  /* 首页 */
  home: {
    tag: 'HUIBANG BIO-TECH',
    title: '灭生性除草剂专业厂家的先行者',
    subtitle: '巨野县韦恩生物科技有限公司 · 山东慧邦生物科技有限公司',
    lead: '国家农业部核准的高科技生物环保型农药定点企业，集农药研发、生产、销售于一体，专注高效杀虫剂、杀螨剂、除草剂、杀菌剂、生长调节剂。',
    heroImage: 'assets/img/cover.webp',
    stats: [
      { n: '100+', label: '企业员工' },
      { n: '10+', label: '高级科研技术人员' },
      { n: '86', label: '在册产品' },
      { n: '15', label: '农药登记证件' }
    ],
    bannerImage: 'assets/img/spirit.webp',
    bannerTitle: '不忘初心　砥砺前行',
    bannerText: '以"产品质量为生命，人才建设为主线"的发展原则，与各界朋友携手共进、共创辉煌。'
  },

  /* 企业介绍 */
  about: {
    image: 'assets/img/about.webp',
    imageCaption: '企业画册 · 企业介绍页',
    sections: [
      {
        title: '关于我们',
        paragraphs: [
          '<strong>巨野县韦恩生物科技有限公司</strong>是国家农业部核准的高科技生物环保型农药定点企业，专业从事农药研发、生产和销售于一体的现代化科技企业，生产基地位于山东省菏泽市巨野县化工产业园。<strong>山东慧邦生物科技有限公司</strong>是专业病虫草害技术推广及销售于一体的科技服务公司。',
          '工厂拥有完备的自动化加工、分装、检验设备和制剂研发团队及市场推广队伍，专注于高效杀虫剂、杀螨剂、除草剂、杀菌剂、生长调节剂等产品的生产和销售。',
          '公司拥有员工 100 多人，其中专业化的高级科研技术人员 10 余名。高素质的营销团队、科学高效的管理模式、营销网络遍布全国。产品以优异的质量，先进的技术服务模式受到广大经销商和农民朋友的欢迎。'
        ]
      },
      {
        title: '发展理念',
        paragraphs: [
          '我们秉承"着眼未来、以人为本，技术先行"的发展战略，坚持"质量第一、信誉第一、服务第一、用户第一"的信念，以市场为导向为企业定位，成为"中国食品和农产品安全源头"的捍卫者。我们满怀信心，愿与各界朋友携手共进、共创辉煌。'
        ]
      }
    ],
    values: [
      { k: '核心价值观', v: '责任 · 创新 · 品牌 · 未来' },
      { k: '发展使命', v: '关爱健康，造福子孙' },
      { k: '经营理念', v: '发展绿色，倡导有机' },
      { k: '服务宗旨', v: '合作共赢，共同成长' }
    ]
  },

  /* 公司证件 */
  certs: {
    image: 'assets/img/certs.webp',
    imageCaption: '企业画册 · 公司证件页',
    current: [
      '19.5% 二甲·草铵膦可溶液剂',
      '41% 草甘膦异丙胺盐水剂',
      '95% 草甘膦原药',
      '5% 阿维菌素乳油',
      '8000IU/微升 苏云金杆菌悬浮剂',
      '10% 吡虫啉可湿性粉剂',
      '40% 丙溴磷乳油',
      '25克/升 联苯菊酯乳油'
    ],
    registered: [
      '8% 甲维盐可溶液剂',
      '12% 甲维·唑虫悬浮剂',
      '45% 联苯肼酯·乙螨唑悬浮剂',
      '25% 敌草快二氯可溶液剂',
      '25% 丙炔·精草铵膦可溶液剂',
      '30% 噻唑膦水乳剂',
      '16.8% 甲维·虫螨腈悬浮剂'
    ]
  },

  /* 企业画册 */
  brochure: [
    { src: 'assets/img/cover.webp', title: '封面' },
    { src: 'assets/img/about.webp', title: '企业介绍' },
    { src: 'assets/img/certs.webp', title: '公司证件' },
    { src: 'assets/img/spirit.webp', title: '不忘初心 砥砺前行' },
    { src: 'assets/img/catalog.webp', title: '产品目录（P3）' },
    { src: 'assets/img/p-zhuganji.webp', title: '注干剂产品（P4）' },
    { src: 'assets/img/p-zhuganji2.webp', title: '解除者 / 注干青（P5）' },
    { src: 'assets/img/p-newreg.webp', title: '新登记产品（P6）' }
  ],

  /* 联系我们 */
  contact: {
    cards: [
      { icon: '🏭', title: '生产企业', line1: '巨野县韦恩生物科技有限公司', line2: '国家农业部核准的高科技生物<br>环保型农药定点企业' },
      { icon: '🤝', title: '技术推广与销售', line1: '山东慧邦生物科技有限公司', line2: '病虫草害技术推广<br>及销售科技服务公司' },
      { icon: '📍', title: '生产基地', line1: '山东省菏泽市巨野县化工产业园', line2: '营销网络遍布全国' }
    ]
  },

  /* 产品目录 */
  catalog:
[
  {
    id: 'zhuganji',
    name: '注干剂产品',
    en: 'INJECT THE DRY AGENT',
    page: '04',
    image: 'assets/img/p-zhuganji.webp',
    items: [
      {
        name: '到喜', spec: '8%甲维盐可溶液剂', page: '04',
        image: 'assets/img/p-zhuganji.webp',
        tagline: '松材线虫用到喜　保护松树用到喜',
        features: [
          '产品持效期长，药效稳定：杀虫活性高，低温环境下杀虫活性是阿维菌素的 3 倍，因此注干使用，能够更有效的杀灭松材线虫。在优势松株使用能够预防松材线虫病害的发生。本品在植株体内有效成分不易流失降解，持效期长。',
          '产品杀虫谱广，保护全面：对危害松树的鳞翅目害虫等绝大多数害虫均有效果，因此是松树及林业害虫综合防治的理想药剂。',
          '吸收传导迅速，药效快速：由于添加了进口渗透助剂，药液吸收速度快，因此更能快速发挥作用。'
        ],
        packing: '20毫升*150瓶　30毫升*150瓶'
      },
      {
        name: '解除者', spec: '5%阿维菌素乳油', page: '05',
        image: 'assets/img/p-zhuganji2.webp',
        tagline: '解除松材线虫危害的使者',
        features: [
          '本品根据松材线虫发生特性而研制的仿生物制剂，阿维菌素对松材线虫具有特效，可起到预防和杀死线虫，对松树体内的松墨天牛幼虫具有触杀和胃毒作用，有效阻止松墨天牛羽化，有效切断传播松树线虫。'
        ],
        usage: '在松褐天牛羽化期前两个月注入。每年 11 - 次年 3 月份松树休眠期注药，能够达到理想预防效果。',
        packing: '20毫升*150瓶　30毫升*150瓶　40毫升*100瓶　50毫升*100瓶'
      },
      {
        name: '注干青', spec: '2%甲维盐乳油', page: '05',
        image: 'assets/img/p-zhuganji2.webp',
        tagline: '松材线虫注干剂　首选注干青',
        features: [
          '本品根据松材线虫发生特性而研制的仿生物制剂，甲氨基阿维菌素苯甲酸盐具有持效期长、杀虫活性高、在松树体内传导速度快等特点，能有效杀灭松材线虫媒介昆虫，同时对松材线虫具有良好的预防和杀灭效果。'
        ],
        usage: '在松褐天牛羽化期前两个月注入。根据当地森防部门推荐使用时期使用。',
        packing: '20毫升*150瓶　30毫升*150瓶　40毫升*100瓶　50毫升*100瓶'
      }
    ]
  },
  {
    id: 'xindengji',
    name: '新登记产品',
    en: 'NEWLY REGISTERED',
    page: '06',
    image: 'assets/img/p-newreg.webp',
    items: [
      {
        name: '到喜', spec: '8%甲维盐可溶液剂', page: '06',
        image: 'assets/img/p-newreg.webp',
        tagline: '超高含量　超高防效',
        features: [
          '本品含量高，剂型先进，杀虫活性高，低温环境下杀虫活性是阿维菌素的 3 倍，持效期长。',
          '对鳞翅目害虫等绝大多数害虫均有效果，因此是农业害虫综合防治的理想药剂。',
          '由于添加了进口渗透助剂，药液吸收速度快，因此更能快速发挥作用。'
        ],
        packing: '200克*40瓶　500克*20瓶'
      },
      { name: '索迪克', spec: '12%甲维·唑虫酰胺悬浮剂', page: '07' },
      { name: '博满', spec: '45%联苯肼酯·乙螨唑悬浮剂', page: '08' },
      { name: '恶阔星', spec: '25%敌草快二氯盐可溶液剂', page: '09' },
      { name: '保速得', spec: '25%丙炔·精草铵膦可溶液剂', page: '10' },
      { name: '田盼', spec: '30%噻唑膦水乳剂', page: '11' },
      { name: '乐持', spec: '16.8%甲维·虫螨腈悬浮剂', page: '12' }
    ]
  },
  {
    id: 'tuijian',
    name: '推荐产品',
    en: 'RECOMMENDED',
    page: '13',
    items: [
      { name: '火火火', spec: '19.5%二甲·草铵膦可溶液剂', page: '13' },
      { name: '宝速达', spec: '41%草甘膦异丙胺盐水剂', page: '14' },
      { name: '赢宽', spec: '8000UI/微升苏云金杆菌悬浮剂', page: '15' },
      { name: '粉赢赢', spec: '25克/升联苯菊酯乳油', page: '16' },
      { name: '解除者', spec: '5%阿维菌素乳油', page: '17' },
      { name: '好刺', spec: '10%吡虫啉可湿性粉剂', page: '18' },
      { name: '满威', spec: '40%丙溴磷乳油', page: '19' }
    ]
  },
  {
    id: 'woluo',
    name: '蜗螺害虫产品',
    en: 'SNAIL & SLUG CONTROL',
    page: '20',
    items: [
      { name: '粒粒星 / 梅搭 / 宝速达', spec: '6%四聚乙醛颗粒剂', page: '21' },
      { name: '祺星', spec: '10%四聚乙醛颗粒剂', page: '22' },
      { name: '解除者 / 蜗霸', spec: '15%四聚乙醛颗粒剂', page: '23' },
      { name: '粉赢赢', spec: '80%四聚乙醛可湿性粉剂', page: '24' }
    ]
  },
  {
    id: 'shachong',
    name: '高效杀虫产品',
    en: 'INSECTICIDES',
    page: '25',
    items: [
      { name: '通打', spec: '10%唑虫酰胺悬浮剂', page: '26' },
      { name: '静喜', spec: '15%氟啶虫酰胺·联苯菊酯悬浮剂', page: '27' },
      { name: '通打', spec: '10%联苯·噻虫胺悬浮剂', page: '28' },
      { name: '世荣', spec: '16%甲维·茚虫威悬浮剂', page: '29' },
      { name: '屠润', spec: '3%甲维盐微乳剂', page: '30' },
      { name: '蓝屠', spec: '0.5%甲维盐微乳剂', page: '31' }
    ]
  },
  {
    id: 'shaman',
    name: '杀螨剂产品',
    en: 'ACARICIDES',
    page: '32',
    items: [
      { name: '朗危', spec: '10%阿维·螺螨酯悬浮剂', page: '32' },
      { name: '虹萨', spec: '20%乙螨唑悬浮剂', page: '33' },
      { name: '朗危', spec: '5%唑螨酯悬浮剂', page: '34' },
      { name: '虹萨 + 优加利', spec: '20%乙螨唑悬浮剂 + 天然植物油', page: '35' },
      { name: '铭牌', spec: '醇醚复合型助剂', page: '36' },
      { name: '优加利', spec: '天然植物油助剂', page: '37' }
    ]
  },
  {
    id: 'shaxianchong',
    name: '杀线虫产品',
    en: 'NEMATICIDES',
    page: '38',
    items: [
      { name: '粒粒星', spec: '10.5%阿维·噻唑膦颗粒剂', page: '39' },
      { name: '田盼', spec: '10%噻唑膦颗粒剂', page: '39' },
      { name: '田盼', spec: '20%噻唑膦水乳剂', page: '39' }
    ]
  },
  {
    id: 'zuhe',
    name: '组合产品',
    en: 'COMBINATIONS',
    page: '40',
    items: [
      { name: '通打', spec: '12%甲维·虫螨腈悬浮剂', page: '40' },
      { name: '通打', spec: '5%虱螨脲悬浮剂', page: '40' },
      { name: '世荣', spec: '16%甲维·茚虫威悬浮剂', page: '41' },
      { name: '世荣', spec: '10%虱螨脲悬浮剂', page: '41' },
      { name: '宏击', spec: '40%毒死蜱乳油', page: '42' },
      { name: '优加利', spec: '天然植物油助剂', page: '42' },
      { name: '百农亲', spec: '5%阿维菌素微乳剂', page: '43' },
      { name: '百农亲', spec: '30%噻虫嗪悬浮剂', page: '43' },
      { name: '百农亲', spec: '复合型植物油助剂', page: '43' },
      { name: '全夺', spec: '9%甲维·茚虫威悬浮剂', page: '44' },
      { name: '全夺', spec: '5%虱螨脲悬浮剂', page: '44' }
    ]
  },
  {
    id: 'changgui',
    name: '常规产品',
    en: 'REGULAR PRODUCTS',
    page: '45',
    items: [
      { name: '功欣', spec: '10%高效氯氟氰菊酯水乳剂', page: '46' },
      { name: '索纳', spec: '25克/升高效氯氟氰菊酯乳油', page: '46' },
      { name: '索迪克', spec: '2.5%高效氯氟氰菊酯水乳剂', page: '46' },
      { name: '解除者', spec: '5%高效氯氟氰菊酯微乳剂', page: '46' },
      { name: '标击', spec: '1.8%阿维菌素乳油', page: '47' },
      { name: '戈世', spec: '3.2%阿维菌素乳油', page: '47' },
      { name: '解除者', spec: '5%阿维菌素乳油', page: '47' },
      { name: '全夺', spec: '5%阿维菌素微乳剂', page: '47' },
      { name: '粒粒星', spec: '40%啶虫脒水分散粒剂', page: '48' },
      { name: '傲刺', spec: '70%吡虫啉水分散粒剂', page: '48' },
      { name: '龙擒', spec: '30%噻虫嗪悬浮剂', page: '48' },
      { name: '噬虫嗪', spec: '25%噻虫嗪水分散粒剂', page: '48' },
      { name: '通打 / 狠打 / 全夺', spec: '12%甲维·虫螨腈悬浮剂', page: '49' },
      { name: '全夺', spec: '5%虱螨脲悬浮剂', page: '49' },
      { name: '格锐斯', spec: '1%甲维盐微乳剂', page: '49' },
      { name: '宏击', spec: '40%毒死蜱乳油', page: '50' },
      { name: '乐持', spec: '9%甲维·茚虫威悬浮剂', page: '50' },
      { name: '备战', spec: '14%虫螨腈·茚虫威悬浮剂', page: '50' },
      { name: '达刺飞', spec: '10%烯啶虫胺水剂', page: '50' },
      { name: '屠润', spec: '2.5%联苯菊酯乳油', page: '51' },
      { name: '备战', spec: '3.2%甲维盐·氯氰微乳剂', page: '51' },
      { name: '达刺飞', spec: '5%啶虫脒乳油', page: '51' },
      { name: '潜刺', spec: '10%啶虫脒微乳剂', page: '51' },
      { name: '备战', spec: '20%高氯·马乳油', page: '52' },
      { name: '好刺', spec: '20%溴氰·吡虫啉悬浮剂', page: '52' },
      { name: '傲刺', spec: '20%呋虫胺悬浮剂', page: '52' },
      { name: '潜丝清', spec: '31%阿维·灭蝇胺悬浮剂', page: '52' }
    ]
  },
  {
    id: 'chucao',
    name: '除草剂产品',
    en: 'HERBICIDES',
    page: '53',
    items: [
      { name: '草净挫', spec: '33%草甘膦盐水剂', page: '53' }
    ]
  },
  {
    id: 'shajun',
    name: '杀菌剂产品',
    en: 'FUNGICIDES',
    page: '54',
    items: [
      { name: '铭牌', spec: '2%春雷霉素水剂', page: '55' },
      { name: '戏菌', spec: '6%春雷霉素水剂', page: '55' },
      { name: '安科雷 / 正726', spec: '58%甲霜灵·锰锌可湿性粉剂', page: '56' },
      { name: '富贵 / 安科雷', spec: '40%氟硅唑乳油', page: '56' },
      { name: '慧生', spec: '80%代森锰锌可湿性粉剂', page: '57' },
      { name: '鸿艳', spec: '450克/升咪鲜胺水乳剂', page: '57' },
      { name: '安科雷', spec: '25%吡唑醚菌酯悬浮剂', page: '57' },
      { name: '根覆', spec: '3%甲霜·噁霉灵水剂', page: '58' },
      { name: '祺润', spec: '30%霜霉威盐酸盐·噁霉灵水剂', page: '58' },
      { name: '田盼', spec: '0.5%氨基寡糖素水剂', page: '58' }
    ]
  },
  {
    id: 'tiaojieji',
    name: '生长调节剂 / 肥料',
    en: 'GROWTH REGULATOR & FERTILIZER',
    page: '60',
    items: [
      { name: '磷酸二氢钾', spec: '植物源', page: '61' }
    ]
  }
]
};

/* ---------- 运行期 ---------- */
/* SITE 由 site.js 注入：后台内容优先，后台不可用时保持默认内容 */
var SITE = DEFAULT_SITE;

/* 为每个产品生成稳定 id：分类id-序号 */
function indexCatalog(catalog) {
  (catalog || []).forEach(function (cat) {
    (cat.items || []).forEach(function (item, i) {
      item.id = cat.id + '-' + (i + 1);
      item.category = cat.name;
      item.categoryId = cat.id;
    });
  });
  return catalog;
}

function findProduct(id) {
  var cats = (typeof SITE !== 'undefined' && SITE.catalog) || [];
  for (var i = 0; i < cats.length; i++) {
    var items = cats[i].items || [];
    for (var j = 0; j < items.length; j++) {
      if (items[j].id === id) return items[j];
    }
  }
  return null;
}

indexCatalog(DEFAULT_SITE.catalog);
