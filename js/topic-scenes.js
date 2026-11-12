/**
 * Scene presets for every atlas topic id.
 * Generated/maintained for detail.html topic viewer.
 * kind: implant | multi | implantRow | sinus | gbr | split | softTissue | guided |
 *       tooth | arch | space | denture | bridge | hygiene | scan | tad | expander |
 *       mouthguard | sealant | ssc | compare | boneQuality | impression
 */
export const TOPIC_SCENES = {
  "implant-crown": {
    "kind": "implant",
    "explode": 0.85,
    "labels": [
      "牙冠",
      "中央螺丝",
      "基台",
      "种植体"
    ],
    "caption": "种植牙由种植体、基台与牙冠组成",
    "highlight": null
  },
  "implant-healing-abutment": {
    "kind": "implant",
    "healing": true,
    "explode": 0.5,
    "labels": [
      "愈合基台",
      "种植体"
    ],
    "caption": "愈合基台帮助塑形牙龈轮廓",
    "highlight": "healing"
  },
  "implant-abutment": {
    "kind": "implant",
    "explode": 0.75,
    "labels": [
      "牙冠",
      "基台",
      "种植体"
    ],
    "caption": "基台连接种植体与牙冠",
    "highlight": "abutment"
  },
  "implant-screw": {
    "kind": "implant",
    "explode": 0.9,
    "labels": [
      "牙冠",
      "中央螺丝",
      "基台",
      "种植体"
    ],
    "caption": "中央螺丝把上部结构固定住",
    "highlight": "screw"
  },
  "implant-anterior-esthetic": {
    "kind": "implant",
    "explode": 0.35,
    "anterior": true,
    "labels": [
      "牙冠",
      "基台",
      "种植体"
    ],
    "caption": "前牙区更强调牙龈与外形协调"
  },
  "implant-single": {
    "kind": "implant",
    "explode": 0.2,
    "labels": [
      "牙冠",
      "种植体"
    ],
    "caption": "单颗缺失时常见的种植修复"
  },
  "implant-splinted": {
    "kind": "implantRow",
    "count": 2,
    "bar": false,
    "bridge": true,
    "labels": [
      "连冠",
      "种植体"
    ],
    "caption": "相邻种植牙可连成一体"
  },
  "implant-bridge": {
    "kind": "implantRow",
    "count": 2,
    "bridge": true,
    "bar": false,
    "labels": [
      "桥体",
      "种植体"
    ],
    "caption": "用种植体当「基牙」的固定桥"
  },
  "implant-screw-retained": {
    "kind": "implant",
    "explode": 0.7,
    "labels": [
      "牙冠",
      "中央螺丝",
      "种植体"
    ],
    "caption": "螺丝固位：必要时可拆下维护",
    "highlight": "screw"
  },
  "implant-cement-retained": {
    "kind": "implant",
    "explode": 0.25,
    "labels": [
      "牙冠",
      "基台",
      "种植体"
    ],
    "caption": "粘接固位：牙冠粘在基台上"
  },
  "implant-custom-abutment": {
    "kind": "implant",
    "customAbutment": true,
    "explode": 0.55,
    "labels": [
      "个性化基台",
      "种植体"
    ],
    "caption": "按牙龈形态定制的基台外形",
    "highlight": "abutment"
  },
  "implant-temp-crown": {
    "kind": "implant",
    "tempCrown": true,
    "explode": 0.3,
    "labels": [
      "临时牙冠",
      "种植体"
    ],
    "caption": "过渡阶段的临时种植冠"
  },
  "implant-full-options": {
    "kind": "compare",
    "caption": "半口全口可有固定、半固定等不同选择"
  },
  "implant-semi-fixed": {
    "kind": "multi",
    "count": 2,
    "locators": true,
    "bridge": false,
    "labels": [
      "覆盖义齿",
      "附着体"
    ],
    "caption": "您可以取下来清洁的覆盖义齿"
  },
  "implant-segmented": {
    "kind": "implantRow",
    "count": 3,
    "bridge": true,
    "labels": [
      "分段桥",
      "种植体"
    ],
    "caption": "分区完成，减轻单次负担"
  },
  "implant-allon6": {
    "kind": "multi",
    "count": 6,
    "angled": true,
    "bridge": true,
    "labels": [
      "全弓桥",
      "种植体"
    ],
    "caption": "六枚种植体支持一整弓固定桥"
  },
  "implant-allon4": {
    "kind": "multi",
    "count": 4,
    "angled": true,
    "bridge": true,
    "labels": [
      "全弓桥",
      "倾斜种植体"
    ],
    "caption": "四枚种植体支持一整弓修复"
  },
  "implant-malone": {
    "kind": "multi",
    "count": 4,
    "angled": true,
    "bridge": true,
    "locators": false,
    "caption": "混合固位的全弓方案示意"
  },
  "implant-bar-overdenture": {
    "kind": "multi",
    "count": 4,
    "bar": true,
    "locators": false,
    "bridge": false,
    "labels": [
      "杆",
      "覆盖义齿"
    ],
    "caption": "杆卡式附着体增强固位"
  },
  "implant-locator": {
    "kind": "multi",
    "count": 2,
    "locators": true,
    "bridge": false,
    "labels": [
      "Locator 按扣",
      "覆盖义齿"
    ],
    "caption": "按扣式附着体，便于取戴清洁"
  },
  "implant-monolithic-bridge": {
    "kind": "multi",
    "count": 4,
    "bridge": true,
    "labels": [
      "一体式桥"
    ],
    "caption": "整弓桥体一次就位的示意"
  },
  "implant-zygoma": {
    "kind": "multi",
    "count": 4,
    "zygoma": true,
    "angled": true,
    "bridge": true,
    "labels": [
      "颧骨种植体"
    ],
    "caption": "上颌严重萎缩时的特殊路径示意"
  },
  "implant-sinus-internal": {
    "kind": "sinus",
    "external": false,
    "labels": [
      "窦腔",
      "植骨",
      "种植体"
    ],
    "caption": "经牙槽嵴抬高窦底，增加骨高度"
  },
  "implant-sinus-external": {
    "kind": "sinus",
    "external": true,
    "labels": [
      "开窗",
      "生物膜",
      "植骨",
      "种植体"
    ],
    "caption": "侧壁开小窗植骨，扩大可用骨量"
  },
  "implant-split": {
    "kind": "split",
    "labels": [
      "骨板",
      "植骨",
      "种植体"
    ],
    "caption": "窄嵴劈开增宽后放入种植体"
  },
  "implant-gbr": {
    "kind": "gbr",
    "labels": [
      "生物膜",
      "植骨材料",
      "种植体"
    ],
    "caption": "用膜和植骨材料引导新骨生成"
  },
  "implant-block-graft": {
    "kind": "gbr",
    "block": true,
    "labels": [
      "块状骨",
      "种植体"
    ],
    "caption": "较大缺损时的块状植骨示意"
  },
  "implant-socket-preserve": {
    "kind": "gbr",
    "labels": [
      "拔牙窝",
      "植骨材料"
    ],
    "caption": "拔牙同期减少牙槽骨吸收"
  },
  "implant-immediate": {
    "kind": "implant",
    "explode": 0.15,
    "labels": [
      "种植体",
      "牙槽窝"
    ],
    "caption": "拔牙同期植入种植体"
  },
  "implant-early": {
    "kind": "implant",
    "explode": 0.1,
    "healing": false,
    "caption": "软组织愈合后较早植入"
  },
  "implant-delayed": {
    "kind": "implant",
    "explode": 0.1,
    "caption": "骨与软组织稳定后再植入"
  },
  "implant-soft-tissue": {
    "kind": "softTissue",
    "labels": [
      "软组织增量",
      "种植体"
    ],
    "caption": "改善牙龈厚度与美学轮廓"
  },
  "implant-guided": {
    "kind": "guided",
    "labels": [
      "导板",
      "种植体"
    ],
    "caption": "数字化导板引导植入方向"
  },
  "implant-provisional-loading": {
    "kind": "implant",
    "tempCrown": true,
    "explode": 0.2,
    "labels": [
      "临时牙",
      "种植体"
    ],
    "caption": "条件合适时当日可戴临时牙"
  },
  "implant-rescue": {
    "kind": "tooth",
    "boneLoss": 0.7,
    "caption": "种植体周围炎时骨吸收示意（科普）"
  },
  "implant-system-overview": {
    "kind": "implant",
    "explode": 0.8,
    "labels": [
      "牙冠",
      "基台",
      "种植体"
    ],
    "caption": "不同系统细节有别，结构层次相近"
  },
  "implant-domestic-import": {
    "kind": "compare",
    "caption": "国产与进口：看证据与适配，而不只比价格"
  },
  "implant-preop": {
    "kind": "implant",
    "explode": 0,
    "caption": "术前检查结合全身与口腔评估"
  },
  "implant-systemic": {
    "kind": "implant",
    "explode": 0,
    "caption": "全身状况会影响种植可行性"
  },
  "implant-bone-quality": {
    "kind": "boneQuality",
    "labels": [
      "骨质分型示意"
    ],
    "caption": "骨质密度影响稳定性与愈合"
  },
  "implant-surgery-heal": {
    "kind": "implant",
    "explode": 0.4,
    "labels": [
      "种植体",
      "骨结合区"
    ],
    "caption": "植入后需要时间完成骨结合"
  },
  "implant-impression": {
    "kind": "impression",
    "labels": [
      "印模托盘",
      "种植体"
    ],
    "caption": "开窗/非开窗取模示意"
  },
  "implant-ios": {
    "kind": "scan",
    "caption": "光学口扫可代替部分传统印模"
  },
  "implant-delivery": {
    "kind": "implant",
    "explode": 0.15,
    "labels": [
      "牙冠",
      "基台"
    ],
    "caption": "试戴、调咬合后完成安装"
  },
  "implant-home-care": {
    "kind": "hygiene",
    "tool": "brush",
    "caption": "种植牙同样需要认真清洁"
  },
  "implant-maintenance": {
    "kind": "implant",
    "explode": 0,
    "caption": "定期复查与专业维护很重要"
  },
  "implant-faq-pain": {
    "kind": "implant",
    "explode": 0,
    "caption": "术后轻度不适常见；加重需尽快复诊"
  },
  "implant-lifespan": {
    "kind": "implant",
    "explode": 0,
    "caption": "能用多久，取决于维护与咬合负担"
  },
  "ortho-ideal": {
    "kind": "arch",
    "caption": "正常覆合、覆盖与中线关系示意"
  },
  "ortho-crowding": {
    "kind": "arch",
    "crowding": 1.2,
    "caption": "间隙不足时，牙齿会挤在一起"
  },
  "ortho-spacing": {
    "kind": "arch",
    "spacing": 1.4,
    "caption": "散在间隙或中切牙间隙示意"
  },
  "ortho-deep-open": {
    "kind": "arch",
    "caption": "深覆合或开合属于垂直向问题"
  },
  "ortho-crossbite": {
    "kind": "arch",
    "crowding": 0.6,
    "caption": "反合、锁合等咬合异常示意"
  },
  "ortho-overjet-overbite": {
    "kind": "arch",
    "caption": "覆合与覆盖是常用测量指标"
  },
  "ortho-angle": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "安氏分类帮助描述咬合关系"
  },
  "ortho-dental-skeletal": {
    "kind": "arch",
    "caption": "牙性与骨性问题决定方案难度"
  },
  "ortho-midline": {
    "kind": "arch",
    "crowding": 0.4,
    "caption": "上下牙中线与面中线要对齐评估"
  },
  "ortho-asymm": {
    "kind": "arch",
    "crowding": 0.8,
    "caption": "颜面不对称需综合评估"
  },
  "ortho-impacted": {
    "kind": "tooth",
    "caption": "阻生牙可能需要牵引助萌"
  },
  "ortho-missing": {
    "kind": "arch",
    "spacing": 1.8,
    "caption": "先天缺牙时的间隙管理示意"
  },
  "ortho-metal-bracket": {
    "kind": "arch",
    "brackets": "metal",
    "labels": [
      "托槽",
      "弓丝"
    ],
    "caption": "金属托槽是经典固定矫治方式"
  },
  "ortho-ceramic-bracket": {
    "kind": "arch",
    "brackets": "ceramic",
    "labels": [
      "陶瓷托槽",
      "弓丝"
    ],
    "caption": "陶瓷托槽颜色更接近牙齿"
  },
  "ortho-self-ligating": {
    "kind": "arch",
    "brackets": "metal",
    "selfLigating": true,
    "labels": [
      "自锁托槽"
    ],
    "caption": "自锁托槽用滑盖代替结扎丝"
  },
  "ortho-lingual": {
    "kind": "arch",
    "brackets": "lingual",
    "labels": [
      "舌侧托槽"
    ],
    "caption": "托槽粘在舌侧，外观更隐蔽"
  },
  "ortho-archwire": {
    "kind": "arch",
    "brackets": "metal",
    "labels": [
      "弓丝"
    ],
    "caption": "弓丝引导牙齿按计划移动"
  },
  "ortho-buccal-tube": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "磨牙颊面管固定弓丝末端"
  },
  "ortho-auxiliaries": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "结扎圈、弹簧、钩等辅助附件"
  },
  "ortho-bracket-looks": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "不同托槽外观对比示意"
  },
  "ortho-metal-sl-demo": {
    "kind": "arch",
    "brackets": "metal",
    "selfLigating": true,
    "caption": "金属自锁托槽示意"
  },
  "ortho-ceramic-sl-demo": {
    "kind": "arch",
    "brackets": "ceramic",
    "selfLigating": true,
    "caption": "陶瓷自锁托槽示意"
  },
  "ortho-lingual-demo": {
    "kind": "arch",
    "brackets": "lingual",
    "caption": "舌侧托槽示意"
  },
  "ortho-conventional-demo": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "传统结扎托槽示意"
  },
  "ortho-clear-aligner": {
    "kind": "arch",
    "aligner": true,
    "labels": [
      "透明牙套"
    ],
    "caption": "透明矫治器包裹牙冠，逐步排齐"
  },
  "ortho-attachments": {
    "kind": "arch",
    "aligner": true,
    "attachments": true,
    "labels": [
      "附件"
    ],
    "caption": "附件帮助牙套更好地移动牙齿"
  },
  "ortho-ipr": {
    "kind": "arch",
    "spacing": 0.3,
    "caption": "邻面去釉可创造少量间隙"
  },
  "ortho-elastics-aligner": {
    "kind": "arch",
    "aligner": true,
    "caption": "牙套也可配合牵引等辅助"
  },
  "ortho-aligner-wear": {
    "kind": "arch",
    "aligner": true,
    "caption": "按医嘱时长佩戴、按时换套"
  },
  "ortho-retainers": {
    "kind": "arch",
    "retainer": true,
    "labels": [
      "保持器"
    ],
    "caption": "矫治结束后用保持器稳定效果"
  },
  "ortho-hawley": {
    "kind": "arch",
    "hawley": true,
    "labels": [
      "哈雷保持器"
    ],
    "caption": "活动式哈雷保持器示意"
  },
  "ortho-fixed-retainer": {
    "kind": "arch",
    "retainer": true,
    "labels": [
      "固定保持丝"
    ],
    "caption": "粘在舌侧的固定保持器"
  },
  "ortho-tad": {
    "kind": "tad",
    "labels": [
      "支抗钉"
    ],
    "caption": "种植钉提供额外支抗"
  },
  "ortho-elastics": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "橡皮筋牵引调整咬合关系"
  },
  "ortho-bite-plane": {
    "kind": "arch",
    "hawley": true,
    "caption": "平导、斜导等咬合诱导装置"
  },
  "ortho-expander": {
    "kind": "expander",
    "labels": [
      "扩弓螺旋"
    ],
    "caption": "扩弓装置增宽上颌牙弓"
  },
  "ortho-headgear": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "口外支抗装置示意（外观示意）"
  },
  "ortho-twinblock": {
    "kind": "arch",
    "hawley": true,
    "caption": "Twin-Block 功能矫治器示意"
  },
  "ortho-herbst": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "Herbst 矫治器示意"
  },
  "ortho-frankel-ii": {
    "kind": "arch",
    "hawley": true,
    "caption": "Frankel II 型肌功能矫治器示意"
  },
  "ortho-frankel-iii": {
    "kind": "arch",
    "hawley": true,
    "caption": "Frankel III 型肌功能矫治器示意"
  },
  "ortho-myofunctional": {
    "kind": "arch",
    "aligner": true,
    "caption": "肌功能矫治相关装置示意"
  },
  "ortho-biology": {
    "kind": "tooth",
    "caption": "牙齿移动依赖牙周组织改建"
  },
  "ortho-records": {
    "kind": "scan",
    "caption": "模型、照片与影像共同记录起点"
  },
  "ortho-plan-talk": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "方案需要结合目标与风险一起谈"
  },
  "ortho-extraction": {
    "kind": "arch",
    "spacing": 1.2,
    "caption": "拔牙与否取决于拥挤与面型"
  },
  "ortho-surgery": {
    "kind": "arch",
    "crowding": 0.5,
    "caption": "骨性严重时可能需正畸正颌联合"
  },
  "ortho-ipr-flow": {
    "kind": "arch",
    "spacing": 0.4,
    "caption": "邻面去釉按步骤、少量进行"
  },
  "ortho-visits": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "复诊时调整弓丝或更换牙套"
  },
  "ortho-hygiene": {
    "kind": "hygiene",
    "tool": "brush",
    "caption": "戴矫治器期间清洁更关键"
  },
  "ortho-diet": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "避免过硬过黏食物保护托槽"
  },
  "ortho-emergency": {
    "kind": "arch",
    "brackets": "metal",
    "caption": "托槽脱落等应急处理要及时联系医生"
  },
  "prostho-metal-crown": {
    "kind": "tooth",
    "crownRestore": "metal",
    "labels": [
      "金属全冠"
    ],
    "caption": "金属全冠强度高，颜色不自然"
  },
  "prostho-pfm": {
    "kind": "tooth",
    "crownRestore": "pfm",
    "labels": [
      "烤瓷冠"
    ],
    "caption": "金属底冠外覆瓷层"
  },
  "prostho-all-ceramic": {
    "kind": "tooth",
    "crownRestore": "ceramic",
    "labels": [
      "全瓷冠"
    ],
    "caption": "全瓷冠美观，适合前牙区"
  },
  "prostho-zirconia": {
    "kind": "tooth",
    "crownRestore": "zirconia",
    "labels": [
      "氧化锆冠"
    ],
    "caption": "氧化锆强度高、颜色可调"
  },
  "prostho-temp-crown": {
    "kind": "tooth",
    "crownRestore": "temp",
    "labels": [
      "临时冠"
    ],
    "caption": "正式牙做好前的过渡牙冠"
  },
  "prostho-inlay": {
    "kind": "tooth",
    "inlay": true,
    "labels": [
      "嵌体"
    ],
    "caption": "嵌体嵌在牙洞内，保留更多牙体"
  },
  "prostho-onlay": {
    "kind": "tooth",
    "inlay": true,
    "labels": [
      "高嵌体"
    ],
    "caption": "高嵌体覆盖牙尖，保护薄弱牙体"
  },
  "prostho-overlay": {
    "kind": "tooth",
    "crownRestore": "ceramic",
    "labels": [
      "覆盖体"
    ],
    "caption": "覆盖咬合面的修复方式"
  },
  "prostho-veneer-porcelain": {
    "kind": "tooth",
    "veneer": "porcelain",
    "labels": [
      "瓷贴面"
    ],
    "caption": "薄薄的瓷片贴在牙齿唇面"
  },
  "prostho-veneer-resin": {
    "kind": "tooth",
    "veneer": "resin",
    "labels": [
      "树脂贴面"
    ],
    "caption": "树脂贴面可一次成形，耐磨性较弱"
  },
  "prostho-veneer-prep": {
    "kind": "tooth",
    "veneer": "porcelain",
    "caption": "贴面只需少量预备牙面"
  },
  "prostho-edentulous-change": {
    "kind": "denture",
    "complete": true,
    "caption": "缺牙后牙槽骨会逐渐吸收"
  },
  "prostho-fixed-bridge": {
    "kind": "bridge",
    "labels": [
      "桥体",
      "基牙冠"
    ],
    "caption": "固定桥靠两侧基牙承托中间假牙"
  },
  "prostho-maryland": {
    "kind": "bridge",
    "maryland": true,
    "labels": [
      "翼板",
      "桥体"
    ],
    "caption": "马里兰桥用舌侧翼板粘接"
  },
  "prostho-rpd": {
    "kind": "denture",
    "complete": false,
    "labels": [
      "卡环",
      "假牙"
    ],
    "caption": "可摘局部义齿可自行取戴清洁"
  },
  "prostho-complete": {
    "kind": "denture",
    "complete": true,
    "labels": [
      "基托",
      "人工牙"
    ],
    "caption": "全口义齿恢复无牙颌的外观与功能"
  },
  "prostho-suction": {
    "kind": "denture",
    "complete": true,
    "caption": "吸附性义齿依靠边缘封闭固位"
  },
  "prostho-flexible": {
    "kind": "denture",
    "complete": false,
    "flexible": true,
    "labels": [
      "弹性基托"
    ],
    "caption": "弹性义齿卡环更隐蔽"
  },
  "prostho-choose-few": {
    "kind": "bridge",
    "caption": "缺一两颗牙：种植、桥或活动义齿等可选"
  },
  "prostho-mat-domestic": {
    "kind": "tooth",
    "crownRestore": "zirconia",
    "caption": "冠材料要看适应证与美学需求"
  },
  "prostho-veneer-mat": {
    "kind": "tooth",
    "veneer": "porcelain",
    "caption": "贴面材料影响美学与强度"
  },
  "prostho-residual": {
    "kind": "tooth",
    "cutaway": true,
    "post": "fiber",
    "caption": "残根残冠常需桩核后做冠"
  },
  "prostho-fracture": {
    "kind": "tooth",
    "caries": true,
    "caption": "折裂深度决定能否保留"
  },
  "prostho-discolor": {
    "kind": "tooth",
    "crownRestore": "ceramic",
    "caption": "变色牙可用贴面或全冠改善"
  },
  "prostho-post-core": {
    "kind": "tooth",
    "post": "fiber",
    "crownRestore": "ceramic",
    "labels": [
      "桩",
      "核",
      "冠"
    ],
    "caption": "桩核为牙冠提供固位核心"
  },
  "prostho-fiber-post": {
    "kind": "tooth",
    "post": "fiber",
    "labels": [
      "纤维桩"
    ],
    "caption": "纤维桩弹性模量更接近牙本质"
  },
  "prostho-metal-post": {
    "kind": "tooth",
    "post": "metal",
    "labels": [
      "金属桩核"
    ],
    "caption": "金属桩核强度高，颜色偏深"
  },
  "prostho-after-rct": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "crownRestore": "ceramic",
    "caption": "根管治疗后常需冠保护"
  },
  "prostho-crown-lengthen": {
    "kind": "tooth",
    "boneLoss": 0.35,
    "caption": "牙冠延长可暴露更多健康牙体"
  },
  "prostho-prep": {
    "kind": "tooth",
    "crownRestore": "ceramic",
    "caption": "牙体预备为修复体留出空间"
  },
  "prostho-impression": {
    "kind": "impression",
    "caption": "传统取模或口扫都用于制作修复体"
  },
  "prostho-shade": {
    "kind": "tooth",
    "crownRestore": "ceramic",
    "caption": "比色要兼顾邻牙与肤色"
  },
  "prostho-provisional": {
    "kind": "tooth",
    "crownRestore": "temp",
    "caption": "临时修复体保护牙髓与牙龈"
  },
  "prostho-tryin": {
    "kind": "tooth",
    "crownRestore": "ceramic",
    "caption": "试戴时检查邻接、咬合与美观"
  },
  "prostho-care": {
    "kind": "hygiene",
    "tool": "floss",
    "caption": "修复体周围清洁决定寿命"
  },
  "prostho-longevity": {
    "kind": "tooth",
    "crownRestore": "zirconia",
    "caption": "寿命与咬合、清洁和维护有关"
  },
  "gen-incisor-canine": {
    "kind": "tooth",
    "caption": "切牙负责切割，尖牙负责撕裂"
  },
  "gen-premolar-molar": {
    "kind": "tooth",
    "caption": "前磨牙与磨牙负责研磨食物"
  },
  "gen-crown-root": {
    "kind": "tooth",
    "cutaway": true,
    "labels": [
      "牙冠",
      "牙根"
    ],
    "caption": "牙冠露在外面，牙根在骨头里"
  },
  "gen-tissues": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "labels": [
      "釉质",
      "本质",
      "牙髓"
    ],
    "caption": "由外到内：釉质、本质、牙髓"
  },
  "gen-caries-lesion": {
    "kind": "tooth",
    "caries": true,
    "labels": [
      "龋损"
    ],
    "caption": "龋齿从脱矿开始，逐渐深入"
  },
  "gen-pulp-chamber": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "labels": [
      "牙髓腔"
    ],
    "caption": "牙髓腔里有神经与血管"
  },
  "gen-canal": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "labels": [
      "根管"
    ],
    "caption": "根管从髓腔通向根尖"
  },
  "gen-periapical": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "caption": "根尖周组织连接牙与牙槽骨"
  },
  "gen-pulpitis": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "caries": true,
    "caption": "炎症波及牙髓时会出现疼痛"
  },
  "gen-gingiva": {
    "kind": "tooth",
    "labels": [
      "牙龈"
    ],
    "caption": "健康牙龈紧贴牙齿颈部"
  },
  "gen-pdl": {
    "kind": "tooth",
    "cutaway": true,
    "caption": "牙周膜像弹簧，缓冲咬合力"
  },
  "gen-alveolar": {
    "kind": "tooth",
    "labels": [
      "牙槽骨"
    ],
    "caption": "牙槽骨是牙齿的「地基」"
  },
  "gen-cementum": {
    "kind": "tooth",
    "cutaway": true,
    "caption": "牙骨质覆盖牙根表面"
  },
  "gen-toothbrush": {
    "kind": "hygiene",
    "tool": "brush",
    "caption": "选择合适的牙刷并掌握方法"
  },
  "gen-floss": {
    "kind": "hygiene",
    "tool": "floss",
    "caption": "牙线清洁牙缝里刷不到的地方"
  },
  "gen-interdental": {
    "kind": "hygiene",
    "tool": "floss",
    "caption": "牙间隙刷适合较大牙缝"
  },
  "gen-waterflosser": {
    "kind": "hygiene",
    "tool": "water",
    "caption": "冲牙器辅助清洁桥体与种植牙周"
  },
  "gen-composite": {
    "kind": "tooth",
    "filling": "resin",
    "labels": [
      "树脂充填"
    ],
    "caption": "复合树脂颜色接近牙齿"
  },
  "gen-flowable": {
    "kind": "tooth",
    "filling": "resin",
    "caption": "流动树脂用于细小缺损"
  },
  "gen-gi": {
    "kind": "tooth",
    "filling": "gi",
    "labels": [
      "玻璃离子"
    ],
    "caption": "玻璃离子可释放氟，多用于特定情况"
  },
  "gen-amalgam": {
    "kind": "tooth",
    "filling": "amalgam",
    "labels": [
      "银汞充填"
    ],
    "caption": "银汞合金充填（概览示意）"
  },
  "gen-primary-perm": {
    "kind": "tooth",
    "primary": true,
    "caption": "乳牙与恒牙大小、形态不同"
  },
  "gen-names": {
    "kind": "arch",
    "caption": "了解牙齿名称方便沟通"
  },
  "gen-fdi": {
    "kind": "arch",
    "caption": "FDI 编号是国际通用牙位写法"
  },
  "gen-arches": {
    "kind": "arch",
    "caption": "上颌、下颌与左右侧要分清"
  },
  "gen-pa": {
    "kind": "tooth",
    "cutaway": true,
    "caption": "根尖片看单颗牙根尖情况"
  },
  "gen-opg": {
    "kind": "arch",
    "caption": "全景片看整体牙列与颌骨"
  },
  "gen-cbct": {
    "kind": "implant",
    "explode": 0.3,
    "caption": "CBCT 提供三维骨量信息"
  },
  "gen-ceph": {
    "kind": "arch",
    "caption": "头颅侧位片常用于正畸分析"
  },
  "gen-photos": {
    "kind": "arch",
    "caption": "口内照片记录外观与咬合"
  },
  "gen-scan": {
    "kind": "scan",
    "labels": [
      "口扫"
    ],
    "caption": "数字化口扫生成三维牙列模型"
  },
  "gen-read-xray": {
    "kind": "tooth",
    "cutaway": true,
    "caption": "片子上的亮暗对应不同组织密度"
  },
  "gen-demineral": {
    "kind": "tooth",
    "caries": true,
    "caption": "脱矿是龋齿最早的阶段"
  },
  "gen-caries-depth": {
    "kind": "tooth",
    "caries": true,
    "cutaway": true,
    "showPulp": true,
    "caption": "浅中深龋决定治疗方式"
  },
  "gen-defect": {
    "kind": "tooth",
    "caries": true,
    "caption": "牙体缺损可用充填或修复体恢复"
  },
  "gen-filling": {
    "kind": "tooth",
    "filling": "resin",
    "caption": "充填修复恢复外形与封闭"
  },
  "gen-wedge": {
    "kind": "tooth",
    "caries": true,
    "caption": "楔状缺损多见于牙颈部"
  },
  "gen-rct-anatomy": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "labels": [
      "髓腔",
      "根管"
    ],
    "caption": "根管治疗前先看清解剖"
  },
  "gen-rct-steps": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "caption": "根管治疗：清理、成形、充填"
  },
  "gen-rubber-dam": {
    "kind": "tooth",
    "caption": "橡皮障隔离术区，更干净安全"
  },
  "gen-prep-fill": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "caption": "预备根管后严密充填"
  },
  "gen-capping": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "caption": "盖髓试图保留活髓"
  },
  "gen-pulpotomy": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "primary": true,
    "caption": "冠髓切断多用于乳牙或年轻恒牙"
  },
  "gen-retreatment": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "caption": "再治疗清理旧充填，重新封闭"
  },
  "gen-internal-bleach": {
    "kind": "tooth",
    "cutaway": true,
    "caption": "死髓牙可变色，有时做内漂白"
  },
  "gen-perio": {
    "kind": "tooth",
    "boneLoss": 0.45,
    "labels": [
      "牙龈炎症"
    ],
    "caption": "牙龈炎与牙周炎是不同程度的问题"
  },
  "gen-bone-loss": {
    "kind": "tooth",
    "boneLoss": 0.7,
    "labels": [
      "骨吸收"
    ],
    "caption": "牙槽骨吸收会让牙齿松动"
  },
  "gen-mobility": {
    "kind": "tooth",
    "boneLoss": 0.6,
    "caption": "松动程度提示牙周支持情况"
  },
  "gen-scaling": {
    "kind": "hygiene",
    "tool": "brush",
    "caption": "洁治、刮治清除菌斑牙石"
  },
  "gen-gtr": {
    "kind": "gbr",
    "labels": [
      "再生膜"
    ],
    "caption": "牙周再生尽量恢复附着"
  },
  "gen-perio-maint": {
    "kind": "tooth",
    "boneLoss": 0.25,
    "caption": "牙周维护决定长期稳定"
  },
  "gen-wisdom": {
    "kind": "tooth",
    "caption": "智齿阻生可能引起疼痛与龋坏"
  },
  "gen-extract-eval": {
    "kind": "tooth",
    "caption": "拔牙前评估位置、邻牙与全身状况"
  },
  "gen-extract-types": {
    "kind": "tooth",
    "caption": "常规拔牙与外科拔牙难度不同"
  },
  "gen-extract-care": {
    "kind": "tooth",
    "caption": "拔牙后按医嘱咬棉、忌吸吮"
  },
  "gen-which-extract": {
    "kind": "tooth",
    "caption": "是否拔牙由医生结合检查决定"
  },
  "gen-local-anesthesia": {
    "kind": "tooth",
    "caption": "局部麻醉让治疗过程更舒适"
  },
  "gen-which-dept": {
    "kind": "arch",
    "caption": "不同问题可能对应不同专科"
  },
  "pedo-incisor": {
    "kind": "tooth",
    "primary": true,
    "caption": "乳切牙帮助发音与美观"
  },
  "pedo-canine": {
    "kind": "tooth",
    "primary": true,
    "caption": "乳尖牙引导咬合发育"
  },
  "pedo-molar": {
    "kind": "tooth",
    "primary": true,
    "caption": "乳磨牙维持咬合高度与间隙"
  },
  "pedo-roots": {
    "kind": "tooth",
    "primary": true,
    "cutaway": true,
    "labels": [
      "乳牙牙根"
    ],
    "caption": "乳牙牙根相对更纤细"
  },
  "pedo-root-resorb": {
    "kind": "tooth",
    "primary": true,
    "cutaway": true,
    "caption": "换牙时乳牙牙根会逐渐吸收"
  },
  "pedo-eruption": {
    "kind": "tooth",
    "caption": "恒牙按大致顺序萌出"
  },
  "pedo-mixed": {
    "kind": "arch",
    "caption": "混合牙列阶段乳恒牙并存"
  },
  "pedo-retained": {
    "kind": "arch",
    "crowding": 0.7,
    "caption": "乳牙滞留可能导致双排牙"
  },
  "pedo-ectopic-6": {
    "kind": "arch",
    "crowding": 0.5,
    "caption": "六龄牙异位萌出需尽早评估"
  },
  "pedo-extract-primary": {
    "kind": "tooth",
    "primary": true,
    "caption": "乳牙拔除要考虑后继恒牙"
  },
  "pedo-supernumerary": {
    "kind": "arch",
    "crowding": 0.9,
    "caption": "多生牙可能阻挡正常萌出"
  },
  "pedo-timeline": {
    "kind": "arch",
    "caption": "换牙时间有个体差异"
  },
  "pedo-young-perm": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "caption": "新萌出恒牙牙根往往未完全形成"
  },
  "pedo-open-apex": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "caption": "根尖孔开放的年轻恒牙需特殊处理"
  },
  "pedo-apex": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "labels": [
      "根尖孔"
    ],
    "caption": "根尖孔是神经血管进出的通道"
  },
  "pedo-dens-evaginatus": {
    "kind": "tooth",
    "caption": "畸形中央尖易折断，需早期保护"
  },
  "pedo-brush-floss": {
    "kind": "hygiene",
    "tool": "brush",
    "caption": "儿童也要建立刷牙牙线习惯"
  },
  "pedo-sealant": {
    "kind": "sealant",
    "labels": [
      "窝沟封闭"
    ],
    "caption": "窝沟封闭预防磨牙龋齿"
  },
  "pedo-fluoride": {
    "kind": "tooth",
    "primary": true,
    "caption": "涂氟增强牙齿抗龋能力"
  },
  "pedo-space-maintainer": {
    "kind": "space",
    "kindSpace": "band-loop",
    "labels": [
      "带环",
      "丝圈"
    ],
    "caption": "早失乳牙后用装置保持间隙"
  },
  "pedo-infant-check": {
    "kind": "tooth",
    "primary": true,
    "caption": "婴幼儿口腔检查越早越好"
  },
  "pedo-caries": {
    "kind": "tooth",
    "primary": true,
    "caries": true,
    "caption": "乳牙龋进展快，要早治"
  },
  "pedo-filling": {
    "kind": "tooth",
    "primary": true,
    "filling": "resin",
    "caption": "乳牙充填恢复外形，保护牙髓"
  },
  "pedo-ssc": {
    "kind": "ssc",
    "labels": [
      "金属预成冠"
    ],
    "caption": "金属预成冠常用于大面积乳磨牙缺损"
  },
  "pedo-esthetic-crown": {
    "kind": "tooth",
    "primary": true,
    "crownRestore": "ceramic",
    "labels": [
      "美观预成冠"
    ],
    "caption": "前牙可用更美观的预成冠"
  },
  "pedo-pulp-therapy": {
    "kind": "tooth",
    "primary": true,
    "cutaway": true,
    "showPulp": true,
    "caption": "乳牙牙髓治疗尽量保留到换牙"
  },
  "pedo-primary-rct": {
    "kind": "tooth",
    "primary": true,
    "cutaway": true,
    "showPulp": true,
    "caption": "乳牙根管治疗考虑继承恒牙"
  },
  "pedo-vital-pulp": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "caption": "年轻恒牙尽量保存活髓"
  },
  "pedo-apexification": {
    "kind": "tooth",
    "cutaway": true,
    "showPulp": true,
    "caption": "根尖屏障或牙髓再生促进根尖闭合"
  },
  "pedo-anterior-crossbite": {
    "kind": "arch",
    "crowding": 0.5,
    "caption": "乳牙反合宜早期干预评估"
  },
  "pedo-mixed-eval": {
    "kind": "arch",
    "caption": "混合牙列期评估发育与间隙"
  },
  "pedo-habits": {
    "kind": "arch",
    "caption": "口呼吸、吮指等习惯影响牙颌发育"
  },
  "pedo-early-appliance": {
    "kind": "arch",
    "hawley": true,
    "caption": "早期矫治装置引导颌骨与牙列"
  },
  "pedo-facemask": {
    "kind": "arch",
    "caption": "前方牵引用于特定骨性反合"
  },
  "pedo-timing": {
    "kind": "arch",
    "caption": "早期矫治时机因问题类型而异"
  },
  "pedo-space-mgmt": {
    "kind": "space",
    "kindSpace": "band-loop",
    "caption": "间隙管理保护继承恒牙萌出空间"
  },
  "pedo-band-loop": {
    "kind": "space",
    "kindSpace": "band-loop",
    "labels": [
      "带环丝圈"
    ],
    "caption": "带环丝圈式间隙保持器"
  },
  "pedo-lingual-arch": {
    "kind": "space",
    "kindSpace": "lingual-arch",
    "labels": [
      "舌弓"
    ],
    "caption": "舌弓式保持器维持下颌牙弓长度"
  },
  "pedo-nance": {
    "kind": "space",
    "kindSpace": "nance",
    "labels": [
      "Nance 弓"
    ],
    "caption": "Nance 弓靠腭部支托固位"
  },
  "pedo-crown-fracture": {
    "kind": "tooth",
    "caries": true,
    "caption": "牙冠折断后尽快就医"
  },
  "pedo-avulsion": {
    "kind": "tooth",
    "caption": "牙齿完全脱出要正确保存并急诊"
  },
  "pedo-trauma-follow": {
    "kind": "tooth",
    "caption": "外伤后需按计划随访拍片"
  },
  "pedo-mouthguard": {
    "kind": "mouthguard",
    "labels": [
      "运动牙托"
    ],
    "caption": "运动防护牙托降低外伤风险"
  }
};

export function getTopicScene(topicId) {
  if (TOPIC_SCENES[topicId]) return { ...TOPIC_SCENES[topicId], id: topicId };
  // sensible specialty fallback by prefix — never empty canvas
  if (topicId.startsWith("implant-")) return { id: topicId, kind: "implant", explode: 0.35, caption: "种植相关结构示意" };
  if (topicId.startsWith("ortho-")) return { id: topicId, kind: "arch", brackets: "metal", caption: "正畸相关结构示意" };
  if (topicId.startsWith("prostho-")) return { id: topicId, kind: "tooth", crownRestore: "ceramic", caption: "修复相关结构示意" };
  if (topicId.startsWith("pedo-")) return { id: topicId, kind: "tooth", primary: true, caption: "儿童口腔结构示意" };
  if (topicId.startsWith("gen-")) return { id: topicId, kind: "tooth", caption: "口腔结构示意" };
  return { id: topicId, kind: "tooth", caption: "口腔结构科普示意" };
}

export const TOPIC_SCENE_STATS = { total: 237, explicit: 237, fallback: 0 };
