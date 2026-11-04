/**
 * Atlas specialty catalogs + patient-facing article stubs.
 * Source of truth for pages/*.html and detail.html.
 * All copy is original educational wording for clinic communication.
 */
window.AtlasData = {
  specialties: {
    implant: {
      id: "implant",
      title: "种植",
      lead: "认识种植体部件、半全口方案、相关术式与术后维护。",
      groups: [
        {
          title: "种植体与修复",
          topics: [
            { id: "implant-crown", title: "种植体与牙冠", subtitle: "植入体、基台与可见牙冠如何衔接" },
            { id: "implant-healing-abutment", title: "愈合基台", subtitle: "二期开窗后塑形牙龈轮廓" },
            { id: "implant-abutment", title: "修复基台", subtitle: "连接种植体与牙冠的中间结构" },
            { id: "implant-screw", title: "中央螺丝", subtitle: "固定基台或牙冠的螺丝连接" },
            { id: "implant-anterior-esthetic", title: "前牙美学种植", subtitle: "微笑区软硬组织与外形协调" },
            { id: "implant-single", title: "常规单颗种植", subtitle: "缺一颗牙时的常见修复路径" },
            { id: "implant-splinted", title: "种植连冠", subtitle: "相邻种植体联冠修复" },
            { id: "implant-bridge", title: "种植支持固定桥", subtitle: "以种植体作基牙的固定桥" },
            { id: "implant-screw-retained", title: "螺丝固位冠", subtitle: "可拆卸维护的上部结构" },
            { id: "implant-cement-retained", title: "粘接固位冠", subtitle: "以粘接剂固定的牙冠方式" },
            { id: "implant-custom-abutment", title: "个性化基台", subtitle: "按牙龈与咬合定制外形" },
            { id: "implant-temp-crown", title: "临时种植冠", subtitle: "过渡期外形与咬合管理" },
          ],
        },
        {
          title: "半全口种植",
          topics: [
            { id: "implant-full-options", title: "半口与全口缺牙怎么选", subtitle: "固定、半固定与活动方案对比" },
            { id: "implant-semi-fixed", title: "半固定修复", subtitle: "患者可取下清洁的覆盖义齿" },
            { id: "implant-segmented", title: "分段种植修复", subtitle: "分区完成、降低单次手术负担" },
            { id: "implant-allon6", title: "All-on-6", subtitle: "六枚种植体支持全弓固定桥" },
            { id: "implant-allon4", title: "All-on-4", subtitle: "四枚倾斜种植体支持全弓修复" },
            { id: "implant-malone", title: "马龙桥式修复", subtitle: "混合固位的全弓方案示意" },
            { id: "implant-bar-overdenture", title: "杆卡式覆盖义齿", subtitle: "杆附着体增强固位与稳定" },
            { id: "implant-locator", title: "Locator 覆盖义齿", subtitle: "按扣式附着体便于取戴清洁" },
            { id: "implant-monolithic-bridge", title: "一体式全口桥", subtitle: "整弓桥体一次就位示意" },
            { id: "implant-zygoma", title: "颧骨种植（概览）", subtitle: "严重上颌骨萎缩时的特殊路径" },
          ],
        },
        {
          title: "种植相关术式",
          topics: [
            { id: "implant-sinus-internal", title: "上颌窦内提", subtitle: "经牙槽嵴提升窦底增加骨高度" },
            { id: "implant-sinus-external", title: "上颌窦外提", subtitle: "侧壁开窗植骨扩大可用骨量" },
            { id: "implant-split", title: "骨劈开", subtitle: "窄嵴增宽以便植入种植体" },
            { id: "implant-gbr", title: "引导骨再生（GBR）", subtitle: "膜与植骨材料重建缺损区" },
            { id: "implant-block-graft", title: "块状骨移植", subtitle: "较大三维缺损时的植骨方式" },
            { id: "implant-socket-preserve", title: "拔牙位点保存", subtitle: "拔牙同期减少牙槽骨吸收" },
            { id: "implant-immediate", title: "即刻种植", subtitle: "拔牙同期植入种植体" },
            { id: "implant-early", title: "早期种植", subtitle: "软组织愈合后较早植入" },
            { id: "implant-delayed", title: "延期种植", subtitle: "骨与软组织稳定后再植入" },
            { id: "implant-soft-tissue", title: "软组织增量", subtitle: "改善牙龈厚度与美学轮廓" },
            { id: "implant-guided", title: "导板引导种植", subtitle: "数字化设计后精准植入" },
            { id: "implant-provisional-loading", title: "即刻负重（概览）", subtitle: "满足条件时当日戴临时牙" },
            { id: "implant-rescue", title: "种植体周围炎处理", subtitle: "维护失败时的干预方向" },
          ],
        },
        {
          title: "种植体系统说明",
          topics: [
            { id: "implant-system-overview", title: "种植系统怎么看", subtitle: "连接方式、表面处理与通用性" },
            { id: "implant-domestic-import", title: "国产与进口（沟通要点）", subtitle: "如何比较而非简单比价" },
          ],
        },
        {
          title: "种植流程与维护",
          topics: [
            { id: "implant-preop", title: "术前检查", subtitle: "全身与口腔评估清单" },
            { id: "implant-systemic", title: "全身疾病与种植", subtitle: "需与医师共同评估的风险点" },
            { id: "implant-bone-quality", title: "骨量与骨质", subtitle: "影像上如何理解可用骨条件" },
            { id: "implant-surgery-heal", title: "手术与骨结合愈合", subtitle: "从植入到上部修复的时间窗" },
            { id: "implant-impression", title: "开窗与非开窗取模", subtitle: "传统印模方式示意" },
            { id: "implant-ios", title: "数字化口扫", subtitle: "光学印模用于种植修复" },
            { id: "implant-delivery", title: "修复体安装", subtitle: "试戴、咬合与固位检查" },
            { id: "implant-home-care", title: "术后与居家护理", subtitle: "清洁工具与复查节奏" },
            { id: "implant-maintenance", title: "定期维护", subtitle: "种植牙也需要洗牙与检查" },
            { id: "implant-faq-pain", title: "疼痛与不适常见问题", subtitle: "哪些情况需要尽快复诊" },
            { id: "implant-lifespan", title: "种植牙能用多久", subtitle: "寿命取决于维护与咬合" },
          ],
        },
      ],
    },

    ortho: {
      id: "ortho",
      title: "正畸",
      lead: "牙列咬合问题、矫治器类型、辅助装置与全程维护沟通。",
      groups: [
        {
          title: "牙列与咬合",
          topics: [
            { id: "ortho-ideal", title: "正常咬合示意", subtitle: "覆合、覆盖与中线的基本关系" },
            { id: "ortho-crowding", title: "牙齿拥挤", subtitle: "间隙不足导致的排列不齐" },
            { id: "ortho-spacing", title: "牙间隙", subtitle: "散在间隙与中切牙间隙" },
            { id: "ortho-deep-open", title: "深覆合与开合", subtitle: "垂直向咬合异常" },
            { id: "ortho-crossbite", title: "反合与锁合", subtitle: "前后向或横向咬合异常" },
            { id: "ortho-overjet-overbite", title: "覆合与覆盖", subtitle: "常用测量指标的含义" },
            { id: "ortho-angle", title: "安氏分类", subtitle: "I / II / III 类咬合关系入门" },
            { id: "ortho-dental-skeletal", title: "牙性与骨性问题", subtitle: "决定方案难度的关键分层" },
            { id: "ortho-midline", title: "中线偏斜", subtitle: "上下牙中线与面中线" },
            { id: "ortho-asymm", title: "颜面不对称（概览）", subtitle: "何时需要正畸正颌联合评估" },
            { id: "ortho-impacted", title: "阻生牙与埋伏牙", subtitle: "牵引萌出相关沟通" },
            { id: "ortho-missing", title: "先天缺牙", subtitle: "间隙管理与修复协同" },
          ],
        },
        {
          title: "固定矫治",
          topics: [
            { id: "ortho-metal-bracket", title: "金属托槽", subtitle: "强度高、适应证广的经典选择" },
            { id: "ortho-ceramic-bracket", title: "陶瓷托槽", subtitle: "颜色更接近牙齿的固定矫治" },
            { id: "ortho-self-ligating", title: "自锁与传统托槽", subtitle: "结扎方式不同，效果因人而异" },
            { id: "ortho-lingual", title: "舌侧托槽", subtitle: "托槽粘在舌侧，外观更隐蔽" },
            { id: "ortho-archwire", title: "弓丝", subtitle: "引导牙齿移动的弹性丝材" },
            { id: "ortho-buccal-tube", title: "颊面管与带环", subtitle: "磨牙上的固定装置" },
            { id: "ortho-auxiliaries", title: "结扎与辅助附件", subtitle: "橡皮圈、弹簧与钩等" },
          ],
        },
        {
          title: "托槽外观沟通",
          topics: [
            { id: "ortho-bracket-looks", title: "托槽外观总览", subtitle: "金属 / 陶瓷 / 舌侧对比" },
            { id: "ortho-metal-sl-demo", title: "金属自锁示意", subtitle: "开合盖设计示意" },
            { id: "ortho-ceramic-sl-demo", title: "陶瓷自锁示意", subtitle: "美学托槽示意" },
            { id: "ortho-lingual-demo", title: "舌侧托槽示意", subtitle: "内侧粘接的位置关系" },
            { id: "ortho-conventional-demo", title: "传统托槽示意", subtitle: "结扎丝或橡皮圈固位" },
          ],
        },
        {
          title: "隐形矫治",
          topics: [
            { id: "ortho-clear-aligner", title: "透明矫治器", subtitle: "可摘戴的序列透明牙套" },
            { id: "ortho-attachments", title: "附件（附件凸点）", subtitle: "帮助牙齿移动的树脂凸起" },
            { id: "ortho-ipr", title: "邻面去釉（IPR）", subtitle: "微量片切创造间隙" },
            { id: "ortho-elastics-aligner", title: "牵引与辅助装置", subtitle: "配合隐形矫治的橡皮筋等" },
            { id: "ortho-aligner-wear", title: "佩戴时长与换套", subtitle: "依从性如何影响进度" },
          ],
        },
        {
          title: "保持装置",
          topics: [
            { id: "ortho-retainers", title: "压膜保持器", subtitle: "透明可摘保持" },
            { id: "ortho-hawley", title: "哈雷保持器", subtitle: "经典活动保持器" },
            { id: "ortho-fixed-retainer", title: "固定保持器", subtitle: "舌侧粘结丝长期稳定" },
          ],
        },
        {
          title: "矫治辅助装置",
          topics: [
            { id: "ortho-tad", title: "支抗钉（种植钉）", subtitle: "提供稳定支抗的微型种植体" },
            { id: "ortho-elastics", title: "橡皮筋牵引", subtitle: "调整咬合关系的常用手段" },
            { id: "ortho-bite-plane", title: "平导与斜导", subtitle: "打开咬合或引导下颌" },
            { id: "ortho-expander", title: "扩弓装置", subtitle: "增加牙弓宽度" },
            { id: "ortho-headgear", title: "头帽与口外弓", subtitle: "口外支抗装置示意" },
          ],
        },
        {
          title: "功能矫治器",
          topics: [
            { id: "ortho-twinblock", title: "Twin-Block 矫治器", subtitle: "引导下颌向前的双板装置" },
            { id: "ortho-herbst", title: "Herbst 矫治器", subtitle: "固定式功能矫治" },
            { id: "ortho-frankel-ii", title: "Frankel II 型", subtitle: "肌功能引导（安氏 II 类）" },
            { id: "ortho-frankel-iii", title: "Frankel III 型", subtitle: "肌功能引导（安氏 III 类）" },
            { id: "ortho-myofunctional", title: "肌功能矫治器", subtitle: "配合唇舌肌训练的装置" },
          ],
        },
        {
          title: "正畸流程与维护",
          topics: [
            { id: "ortho-biology", title: "牙齿移动原理", subtitle: "压力侧与张力侧的简单解释" },
            { id: "ortho-records", title: "检查与影像记录", subtitle: "模型、照片与头影的作用" },
            { id: "ortho-plan-talk", title: "方案沟通", subtitle: "拔牙与否、疗程与预期" },
            { id: "ortho-extraction", title: "拔牙与非拔牙方案", subtitle: "间隙来源如何决定" },
            { id: "ortho-surgery", title: "正畸正颌联合", subtitle: "骨性畸形的联合路径" },
            { id: "ortho-ipr-flow", title: "邻面去釉流程", subtitle: "适应证与感受说明" },
            { id: "ortho-visits", title: "复诊调整", subtitle: "多久复诊、做什么检查" },
            { id: "ortho-hygiene", title: "矫治期间清洁", subtitle: "托槽与牙套的清洁要点" },
            { id: "ortho-diet", title: "饮食注意", subtitle: "避免托槽脱落的食物" },
            { id: "ortho-emergency", title: "托槽脱落等应急", subtitle: "居家临时处理与何时就诊" },
          ],
        },
      ],
    },

    prostho: {
      id: "prostho",
      title: "修复",
      lead: "冠桥贴面、嵌体义齿与缺损修复的沟通要点。",
      groups: [
        {
          title: "牙冠",
          topics: [
            { id: "prostho-metal-crown", title: "金属全冠", subtitle: "强度高，多用于后牙" },
            { id: "prostho-pfm", title: "烤瓷冠", subtitle: "金属内冠外覆瓷层" },
            { id: "prostho-all-ceramic", title: "全瓷冠", subtitle: "无金属基底的美学修复" },
            { id: "prostho-zirconia", title: "氧化锆冠", subtitle: "高强度全瓷常用材料" },
            { id: "prostho-temp-crown", title: "临时冠", subtitle: "正式冠完成前的过渡修复" },
          ],
        },
        {
          title: "嵌体与高嵌体",
          topics: [
            { id: "prostho-inlay", title: "嵌体", subtitle: "嵌入牙体缺损区的修复体" },
            { id: "prostho-onlay", title: "高嵌体", subtitle: "覆盖牙尖的较大范围修复" },
            { id: "prostho-overlay", title: "覆盖体", subtitle: "更大范围牙合面覆盖" },
          ],
        },
        {
          title: "贴面",
          topics: [
            { id: "prostho-veneer-porcelain", title: "瓷贴面", subtitle: "薄层瓷片改善前牙外观" },
            { id: "prostho-veneer-resin", title: "树脂贴面", subtitle: "椅旁完成的贴面方式" },
            { id: "prostho-veneer-prep", title: "贴面预备量", subtitle: "尽量少磨牙的沟通要点" },
          ],
        },
        {
          title: "义齿与缺牙修复",
          topics: [
            { id: "prostho-edentulous-change", title: "缺牙后的牙列变化", subtitle: "邻牙倾斜与对颌伸长" },
            { id: "prostho-fixed-bridge", title: "固定桥", subtitle: "以邻牙作基牙的固定修复" },
            { id: "prostho-maryland", title: "粘接桥（马里兰桥）", subtitle: "少磨牙的粘接固定桥" },
            { id: "prostho-rpd", title: "可摘局部义齿", subtitle: "可自行取戴的局部假牙" },
            { id: "prostho-complete", title: "全口义齿", subtitle: "无牙颌的活动全口假牙" },
            { id: "prostho-suction", title: "吸附性义齿", subtitle: "强调边缘封闭与吸附力" },
            { id: "prostho-flexible", title: "弹性义齿（隐形义齿）", subtitle: "无金属钩的活动义齿" },
            { id: "prostho-choose-few", title: "缺一两颗牙怎么选", subtitle: "种植、桥与活动方案对比" },
          ],
        },
        {
          title: "材料沟通",
          topics: [
            { id: "prostho-mat-domestic", title: "冠材料如何比较", subtitle: "强度、美学与适应证" },
            { id: "prostho-veneer-mat", title: "贴面材料选择", subtitle: "瓷与树脂的取舍" },
          ],
        },
        {
          title: "牙体缺损",
          topics: [
            { id: "prostho-residual", title: "残根与残冠", subtitle: "能否保留取决于剩余牙体" },
            { id: "prostho-fracture", title: "牙齿折裂", subtitle: "裂纹深度决定能否保住" },
            { id: "prostho-discolor", title: "牙齿变色", subtitle: "氟斑牙、四环素牙等沟通" },
          ],
        },
        {
          title: "桩核与冠修复",
          topics: [
            { id: "prostho-post-core", title: "桩、核与冠", subtitle: "根管治疗后重建固位形" },
            { id: "prostho-fiber-post", title: "纤维桩", subtitle: "弹性模量更接近牙本质" },
            { id: "prostho-metal-post", title: "金属桩核", subtitle: "传统铸造桩核示意" },
            { id: "prostho-after-rct", title: "根管治疗后的修复", subtitle: "为何常需做冠保护" },
            { id: "prostho-crown-lengthen", title: "牙冠延长与牵引", subtitle: "暴露健康牙体边缘" },
          ],
        },
        {
          title: "修复流程与维护",
          topics: [
            { id: "prostho-prep", title: "牙体预备", subtitle: "磨除量与边缘位置说明" },
            { id: "prostho-impression", title: "取模与口扫", subtitle: "传统印模与数字化印模" },
            { id: "prostho-shade", title: "比色与形态设计", subtitle: "颜色与邻牙协调" },
            { id: "prostho-provisional", title: "临时修复体", subtitle: "保护牙髓与维持间隙" },
            { id: "prostho-tryin", title: "试戴与粘接", subtitle: "就位、邻接与咬合检查" },
            { id: "prostho-care", title: "清洁与复查", subtitle: "牙线、冲牙器与定期检查" },
            { id: "prostho-longevity", title: "各种修复体能用多久", subtitle: "材料与维护共同决定" },
          ],
        },
      ],
    },

    general: {
      id: "general",
      title: "全科",
      lead: "牙齿结构、龋病牙髓、牙周、拔牙与影像检查科普。",
      groups: [
        {
          title: "牙齿结构",
          topics: [
            { id: "gen-incisor-canine", title: "切牙与尖牙", subtitle: "前牙形态与功能" },
            { id: "gen-premolar-molar", title: "前磨牙与磨牙", subtitle: "后牙咬合与窝沟" },
            { id: "gen-crown-root", title: "牙冠与牙根", subtitle: "可见部分与埋在骨内的部分" },
            { id: "gen-tissues", title: "釉质、本质与骨质", subtitle: "牙齿硬组织分层" },
          ],
        },
        {
          title: "牙体牙髓",
          topics: [
            { id: "gen-caries-lesion", title: "龋损", subtitle: "脱矿到成洞的过程" },
            { id: "gen-pulp-chamber", title: "牙髓腔", subtitle: "牙冠内部的活组织空间" },
            { id: "gen-canal", title: "根管系统", subtitle: "牙根内细小管道" },
            { id: "gen-periapical", title: "根尖周组织", subtitle: "根尖周围的骨与膜" },
            { id: "gen-pulpitis", title: "牙髓炎与根尖周炎", subtitle: "疼痛来源的简单分层" },
          ],
        },
        {
          title: "牙周组织",
          topics: [
            { id: "gen-gingiva", title: "牙龈", subtitle: "包裹牙颈的软组织" },
            { id: "gen-pdl", title: "牙周膜", subtitle: "连接牙根与骨的纤维" },
            { id: "gen-alveolar", title: "牙槽骨", subtitle: "承托牙齿的颌骨部分" },
            { id: "gen-cementum", title: "牙骨质", subtitle: "覆盖牙根表面的硬组织" },
          ],
        },
        {
          title: "口腔清洁",
          topics: [
            { id: "gen-toothbrush", title: "牙刷", subtitle: "刷毛软硬与替换节奏" },
            { id: "gen-floss", title: "牙线", subtitle: "清洁邻面菌斑" },
            { id: "gen-interdental", title: "牙间隙刷", subtitle: "适合较大缝隙" },
            { id: "gen-waterflosser", title: "冲牙器", subtitle: "水流辅助清洁" },
          ],
        },
        {
          title: "补牙材料",
          topics: [
            { id: "gen-composite", title: "复合树脂", subtitle: "常见的同色充填材料" },
            { id: "gen-flowable", title: "流动树脂", subtitle: "流动性更好的树脂" },
            { id: "gen-gi", title: "玻璃离子", subtitle: "可释放氟的材料" },
            { id: "gen-amalgam", title: "银汞合金（概览）", subtitle: "传统后牙充填材料" },
          ],
        },
        {
          title: "牙位与牙列",
          topics: [
            { id: "gen-primary-perm", title: "乳牙与恒牙", subtitle: "两套牙列的更替" },
            { id: "gen-names", title: "牙齿名称与方位", subtitle: "近中远中、颊舌侧" },
            { id: "gen-fdi", title: "牙位编号（FDI）", subtitle: "两位数标记法" },
            { id: "gen-arches", title: "上下颌与左右侧", subtitle: "读懂病历上的方位" },
          ],
        },
        {
          title: "口腔检查与影像",
          topics: [
            { id: "gen-pa", title: "根尖片", subtitle: "看单颗牙根与根尖" },
            { id: "gen-opg", title: "全景片", subtitle: "全口牙齿与颌骨总览" },
            { id: "gen-cbct", title: "CBCT", subtitle: "三维骨量与解剖结构" },
            { id: "gen-ceph", title: "头颅侧位片", subtitle: "正畸常用的侧面影像" },
            { id: "gen-photos", title: "口内照片", subtitle: "记录颜色与排列" },
            { id: "gen-scan", title: "数字化口扫", subtitle: "牙齿三维表面数据" },
            { id: "gen-read-xray", title: "怎么看懂自己的片子", subtitle: "与医生对照阅读的要点" },
          ],
        },
        {
          title: "龋齿与牙体缺损",
          topics: [
            { id: "gen-demineral", title: "牙齿脱矿", subtitle: "白垩斑阶段可逆干预" },
            { id: "gen-caries-depth", title: "浅中深龋", subtitle: "深度与治疗选择" },
            { id: "gen-defect", title: "牙体缺损", subtitle: "龋、折、磨耗造成的缺损" },
            { id: "gen-filling", title: "充填修复", subtitle: "补牙的基本步骤" },
            { id: "gen-wedge", title: "楔状缺损", subtitle: "牙颈部缺损的常见原因" },
          ],
        },
        {
          title: "根管治疗与牙髓保存",
          topics: [
            { id: "gen-rct-anatomy", title: "牙髓腔与根管", subtitle: "治疗对象是什么" },
            { id: "gen-rct-steps", title: "根管治疗流程", subtitle: "开髓、预备、充填" },
            { id: "gen-rubber-dam", title: "橡皮障", subtitle: "隔湿与防误吞" },
            { id: "gen-prep-fill", title: "根管预备与充填", subtitle: "清理感染并严密封闭" },
            { id: "gen-capping", title: "直接与间接盖髓", subtitle: "尽量保留活髓" },
            { id: "gen-pulpotomy", title: "冠髓切断术", subtitle: "去除冠部牙髓保根髓" },
            { id: "gen-retreatment", title: "再治疗与根尖手术", subtitle: "首次治疗失败后的路径" },
            { id: "gen-internal-bleach", title: "死髓牙内漂白", subtitle: "根管治疗后的变色改善" },
          ],
        },
        {
          title: "牙周健康与治疗",
          topics: [
            { id: "gen-perio", title: "牙龈炎与牙周炎", subtitle: "炎症是否累及支持骨" },
            { id: "gen-bone-loss", title: "牙槽骨吸收", subtitle: "影像上可见的骨高度下降" },
            { id: "gen-mobility", title: "牙齿松动", subtitle: "松动度与预后" },
            { id: "gen-scaling", title: "洁治与龈下刮治", subtitle: "清除菌斑牙石" },
            { id: "gen-gtr", title: "牙周再生（GTR）", subtitle: "尝试恢复附着的手术" },
            { id: "gen-perio-maint", title: "牙周维护", subtitle: "治疗后的定期复诊" },
          ],
        },
        {
          title: "拔牙与智齿",
          topics: [
            { id: "gen-wisdom", title: "智齿与阻生", subtitle: "为何常需评估拔除" },
            { id: "gen-extract-eval", title: "拔牙前评估", subtitle: "全身状况与影像" },
            { id: "gen-extract-types", title: "常规与外科拔牙", subtitle: "是否需要去骨分牙" },
            { id: "gen-extract-care", title: "拔牙后护理", subtitle: "止血、饮食与禁忌" },
            { id: "gen-which-extract", title: "哪些牙需要拔", subtitle: "与正畸、修复方案相关" },
          ],
        },
        {
          title: "麻醉与就诊",
          topics: [
            { id: "gen-local-anesthesia", title: "局部麻醉", subtitle: "常见注射方式与感受" },
            { id: "gen-which-dept", title: "该挂哪个科", subtitle: "牙疼、拔牙、洗牙指引" },
          ],
        },
      ],
    },

    pedo: {
      id: "pedo",
      title: "儿牙",
      lead: "乳牙替牙、预防保健、早期矫治与外伤防护。",
      groups: [
        {
          title: "乳牙",
          topics: [
            { id: "pedo-incisor", title: "乳切牙", subtitle: "乳前牙的萌出与替换" },
            { id: "pedo-canine", title: "乳尖牙", subtitle: "乳尖牙的位置与作用" },
            { id: "pedo-molar", title: "乳磨牙", subtitle: "维持后方间隙的关键乳牙" },
            { id: "pedo-roots", title: "乳牙牙根", subtitle: "生理性吸收与恒牙萌出" },
          ],
        },
        {
          title: "替牙期",
          topics: [
            { id: "pedo-root-resorb", title: "乳牙牙根吸收", subtitle: "换牙时的正常现象" },
            { id: "pedo-eruption", title: "恒牙萌出", subtitle: "萌出顺序与时间窗" },
            { id: "pedo-mixed", title: "混合牙列", subtitle: "乳恒牙并存阶段" },
            { id: "pedo-retained", title: "乳牙滞留与双排牙", subtitle: "何时需要拔除滞留乳牙" },
            { id: "pedo-ectopic-6", title: "第一恒磨牙异位萌出", subtitle: "六龄齿萌出异常" },
            { id: "pedo-extract-primary", title: "乳牙拔除", subtitle: "适应证与间隙管理" },
            { id: "pedo-supernumerary", title: "多生牙", subtitle: "额外牙对萌出的影响" },
            { id: "pedo-timeline", title: "乳牙换牙时间表", subtitle: "给家长的大致参考" },
          ],
        },
        {
          title: "年轻恒牙",
          topics: [
            { id: "pedo-young-perm", title: "新萌出恒牙", subtitle: "釉质尚未完全成熟" },
            { id: "pedo-open-apex", title: "未完成发育的牙根", subtitle: "根尖孔宽大阶段" },
            { id: "pedo-apex", title: "根尖孔", subtitle: "与牙髓治疗策略相关" },
            { id: "pedo-dens-evaginatus", title: "畸形中央尖", subtitle: "易折断导致牙髓感染" },
          ],
        },
        {
          title: "儿童口腔护理",
          topics: [
            { id: "pedo-brush-floss", title: "儿童牙刷与牙线", subtitle: "家长协助清洁的要点" },
            { id: "pedo-sealant", title: "窝沟封闭", subtitle: "保护后牙深窝沟" },
            { id: "pedo-fluoride", title: "涂氟", subtitle: "增强抗龋能力" },
            { id: "pedo-space-maintainer", title: "间隙保持装置", subtitle: "早失乳牙后的间隙管理" },
            { id: "pedo-infant-check", title: "婴幼儿口腔检查", subtitle: "第一次看牙建议时间" },
          ],
        },
        {
          title: "乳牙龋病与修复",
          topics: [
            { id: "pedo-caries", title: "乳牙龋齿", subtitle: "进展快，需尽早处理" },
            { id: "pedo-filling", title: "乳牙充填", subtitle: "适合中小缺损" },
            { id: "pedo-ssc", title: "金属预成冠", subtitle: "大面积缺损的常用保护冠" },
            { id: "pedo-esthetic-crown", title: "透明冠与瓷预成冠", subtitle: "前牙美学修复选择" },
          ],
        },
        {
          title: "儿童牙髓与年轻恒牙治疗",
          topics: [
            { id: "pedo-pulp-therapy", title: "乳牙牙髓治疗", subtitle: "尽量保留至替换期" },
            { id: "pedo-primary-rct", title: "乳牙根管治疗", subtitle: "与恒牙根管的差异" },
            { id: "pedo-vital-pulp", title: "年轻恒牙牙髓保存", subtitle: "优先活髓保存技术" },
            { id: "pedo-apexification", title: "根尖屏障与牙髓再生", subtitle: "根尖未闭合时的治疗" },
          ],
        },
        {
          title: "早期矫治与习惯管理",
          topics: [
            { id: "pedo-anterior-crossbite", title: "乳牙反合", subtitle: "地包天需尽早评估" },
            { id: "pedo-mixed-eval", title: "混合牙列评估", subtitle: "一期矫治指征筛查" },
            { id: "pedo-habits", title: "口呼吸与口腔习惯", subtitle: "吮指、吐舌等干预" },
            { id: "pedo-early-appliance", title: "早期矫治装置", subtitle: "活动与功能矫治器入门" },
            { id: "pedo-facemask", title: "前方牵引矫治器", subtitle: "骨性 III 类早期干预" },
            { id: "pedo-timing", title: "早期矫治时机", subtitle: "什么时候开始更合适" },
          ],
        },
        {
          title: "间隙管理",
          topics: [
            { id: "pedo-space-mgmt", title: "间隙保持总览", subtitle: "为何要“占住”位置" },
            { id: "pedo-band-loop", title: "带环丝圈式保持器", subtitle: "单侧乳磨牙早失常用" },
            { id: "pedo-lingual-arch", title: "舌弓式保持器", subtitle: "下颌双侧间隙维持" },
            { id: "pedo-nance", title: "Nance 弓", subtitle: "上颌腭部支抗保持器" },
          ],
        },
        {
          title: "牙外伤与运动防护",
          topics: [
            { id: "pedo-crown-fracture", title: "牙冠折断", subtitle: "露髓与否决定急诊处理" },
            { id: "pedo-avulsion", title: "牙齿脱位", subtitle: "完全脱出后的急救要点" },
            { id: "pedo-trauma-follow", title: "外伤检查与随访", subtitle: "影像与牙髓活力复查" },
            { id: "pedo-mouthguard", title: "运动防护牙托", subtitle: "接触性运动的防护" },
          ],
        },
      ],
    },
  },

  /** Patient-facing article stubs (implant + ortho mix). */
  articles: {
    "implant-crown": {
      title: "种植体与牙冠",
      specialty: "implant",
      specialtyLabel: "种植",
      summary: "种植牙看得见的是牙冠，看不见的是植入颌骨的种植体，中间靠基台连接。",
      sections: [
        {
          heading: "它由哪几部分组成",
          paragraphs: [
            "一颗常见的种植修复，大致可看成三层：种植体固定在颌骨里；基台连接种植体与上部结构；牙冠恢复咀嚼和外观。",
            "不同品牌的连接方式、螺丝位置会有差别，门诊沟通时医生会结合您的影像说明具体设计。",
          ],
          bullets: ["种植体：承担骨内固位", "基台：过渡与支持牙冠", "牙冠：恢复外形与咬合"],
        },
        {
          heading: "沟通时可以关注什么",
          paragraphs: [
            "除了“能不能种”，还常会谈到：骨量是否足够、是否需要植骨、愈合时间、临时牙如何过渡，以及上部牙冠是螺丝固位还是粘接固位。",
          ],
        },
        {
          heading: "和真牙有什么不同",
          paragraphs: [
            "种植牙没有牙周膜，咬合感觉与天然牙略有不同；清洁方式也更强调邻面与桥体下方。定期维护与天然牙同样重要。",
          ],
        },
      ],
      links: { simulate: true, try: "crown", related: ["implant-abutment", "implant-single", "implant-home-care"] },
    },

    "implant-gbr": {
      title: "引导骨再生（GBR）",
      specialty: "implant",
      specialtyLabel: "种植",
      summary: "当缺牙区骨量不足时，可用生物膜与植骨材料引导新骨形成，为种植创造条件。",
      sections: [
        {
          heading: "为什么需要植骨",
          paragraphs: [
            "牙齿缺失后，牙槽骨常会吸收变窄或变矮。骨宽度或高度不够时，直接植入可能稳定性不足，或影响最终牙冠外形。",
          ],
        },
        {
          heading: "GBR 在做什么",
          paragraphs: [
            "引导骨再生通常在缺损区放入植骨材料，并用可吸收或不可吸收膜覆盖，隔开软组织，给骨组织再生留出空间。",
          ],
          bullets: ["可与种植同期完成", "也可分阶段：先植骨，愈合后再植入种植体", "愈合时间因缺损大小与个体差异而不同"],
        },
        {
          heading: "术后需要知道的",
          paragraphs: [
            "术区肿胀、轻痛较常见；需遵医嘱用药、冷敷与饮食。吸烟、过早戴用压迫性假牙可能影响愈合，请按复诊计划复查。",
          ],
        },
      ],
      links: { simulate: true, try: null, related: ["implant-bone-quality", "implant-sinus-internal", "implant-socket-preserve"] },
    },

    "implant-allon4": {
      title: "All-on-4",
      specialty: "implant",
      specialtyLabel: "种植",
      summary: "用四枚种植体支持一整弓固定义齿，常用于半口或全口无牙颌患者。",
      sections: [
        {
          heading: "适合怎样沟通的场景",
          paragraphs: [
            "当余牙所剩无几或已全口无牙，又希望固定、少摘戴时，医生可能介绍“少量种植体支持整弓假牙”的方案。All-on-4 是其中一种设计思路。",
          ],
        },
        {
          heading: "基本结构示意",
          paragraphs: [
            "通常在颌骨内植入四枚种植体，后方两枚常带一定倾斜角度，以避开解剖结构并增加支持跨度；上部连接整弓桥或固定义齿。",
          ],
          bullets: ["种植体数量相对较少", "有时当日可戴临时牙（需满足条件）", "最终修复体需精准咬合与清洁通道设计"],
        },
        {
          heading: "需要特别说明的",
          paragraphs: [
            "并非所有骨条件都能做；是否即刻负重、是否需植骨、最终材料选择，都要结合 CBCT 与全身状况评估。本页仅为科普示意。",
          ],
        },
      ],
      links: { simulate: true, try: "bridge", related: ["implant-allon6", "implant-full-options", "implant-bar-overdenture"] },
    },

    "implant-immediate": {
      title: "即刻种植",
      specialty: "implant",
      specialtyLabel: "种植",
      summary: "拔牙的同时植入种植体，缩短部分患者的治疗周期，但并非人人适合。",
      sections: [
        {
          heading: "什么叫即刻种植",
          paragraphs: [
            "传统路径是拔牙后等待数月骨愈合再种植。即刻种植则在拔牙窝内同期植入种植体，有时还可戴上临时牙冠作过渡。",
          ],
        },
        {
          heading: "哪些条件更重要",
          paragraphs: [
            "牙根周围是否有急性感染、拔牙后骨壁是否完整、初期稳定性够不够、软组织能否关闭或塑形，都会影响是否推荐即刻方案。",
          ],
          bullets: ["骨壁完整、无广泛感染时更常考虑", "美学区对软组织管理要求更高", "临时牙咬合需严格控制"],
        },
        {
          heading: "和延期种植怎么选",
          paragraphs: [
            "即刻种植的优势是减少手术次数、缩短“缺牙等待”；延期种植则在条件不确定时更稳妥。最终选择以临床评估为准。",
          ],
        },
      ],
      links: { simulate: true, try: "crown", related: ["implant-early", "implant-socket-preserve", "implant-anterior-esthetic"] },
    },

    "ortho-crowding": {
      title: "牙齿拥挤",
      specialty: "ortho",
      specialtyLabel: "正畸",
      summary: "牙量大于骨量时，牙齿会扭转、重叠或唇颊向错位，是最常见的矫治诉求之一。",
      sections: [
        {
          heading: "看起来是什么样子",
          paragraphs: [
            "前牙可能“叠在一起”，侧面观嘴唇较突；后牙也可能因拥挤出现咬合干扰。拥挤程度常用间隙分析来量化。",
          ],
        },
        {
          heading: "间隙从哪里来",
          paragraphs: [
            "矫治需要空间排齐牙齿。常见来源包括：扩弓、邻面去釉、推磨牙向后，或拔除部分牙齿。选择取决于拥挤量、面型和骨性关系。",
          ],
          bullets: ["轻度：扩弓或邻面去釉常可解决", "中重度：可能讨论拔牙方案", "成人与青少年的生长潜力不同"],
        },
        {
          heading: "矫治后如何稳住",
          paragraphs: [
            "排齐后仍需保持器。前牙舌侧固定丝或透明压膜保持器都很常见，佩戴依从性直接影响是否复发。",
          ],
        },
      ],
      links: { simulate: true, try: "aligner", related: ["ortho-extraction", "ortho-clear-aligner", "ortho-retainers"] },
    },

    "ortho-clear-aligner": {
      title: "透明矫治器（隐形矫治）",
      specialty: "ortho",
      specialtyLabel: "正畸",
      summary: "通过一系列可摘透明牙套，分步移动牙齿；外观隐蔽，但依赖每天足够的佩戴时间。",
      sections: [
        {
          heading: "工作方式",
          paragraphs: [
            "医生根据口扫或模型做数字化排牙，每副牙套产生小范围移动。您按计划更换牙套，并可能粘接附件（牙齿上的小凸点）帮助移动。",
          ],
        },
        {
          heading: "适合与局限",
          paragraphs: [
            "许多轻中度错合可用隐形矫治完成；复杂骨性畸形、需大幅压低/伸长或旋转的病例，可能更适合固定矫治或联合方案。",
          ],
          bullets: ["每日佩戴时长通常需达标（常见约 20–22 小时）", "进食与刷牙时取下", "丢失或变形的牙套要及时联系诊室"],
        },
        {
          heading: "和托槽怎么选",
          paragraphs: [
            "隐形矫治优势是美观与可摘；固定托槽在某些移动类型上更高效。没有绝对“更好”，只有更匹配目标与依从性的方案。",
          ],
        },
      ],
      links: { simulate: true, try: "aligner", related: ["ortho-attachments", "ortho-ipr", "ortho-metal-bracket"] },
    },

    "ortho-twinblock": {
      title: "Twin-Block 矫治器",
      specialty: "ortho",
      specialtyLabel: "正畸",
      summary: "一种常用的功能矫治器，通过上下两块斜导板引导下颌向前，多用于生长发育期的安氏 II 类病例。",
      sections: [
        {
          heading: "它想解决什么",
          paragraphs: [
            "当下颌相对靠后、前牙深覆盖明显，且患者仍有生长潜力时，功能矫治可帮助改善下颌位置与面型协调。",
          ],
        },
        {
          heading: "佩戴感受",
          paragraphs: [
            "初戴时说话与吞咽需要适应，可能有轻微酸胀。通常要求白天与夜晚尽量佩戴，具体时长遵医嘱。",
          ],
          bullets: ["多为活动装置，可取下清洁", "常作为一期（早期）治疗的一部分", "后续可能衔接固定或隐形矫治精调"],
        },
        {
          heading: "注意事项",
          paragraphs: [
            "功能矫治对骨性 III 类或已无生长潜力的成人效果有限。是否适用需结合头影测量与临床检查，不能仅凭“嘴突”自行判断。",
          ],
        },
      ],
      links: { simulate: true, try: null, related: ["pedo-timing", "ortho-angle", "ortho-herbst"] },
    },

    "ortho-retainers": {
      title: "保持装置",
      specialty: "ortho",
      specialtyLabel: "正畸",
      summary: "牙齿排齐只是阶段目标，保持器帮助牙周组织改建期稳定新位置，降低复发风险。",
      sections: [
        {
          heading: "常见类型",
          paragraphs: [
            "压膜透明保持器外观接近隐形牙套；哈雷保持器带腭/舌侧基托与钢丝；固定保持器粘在前牙舌侧，患者不易遗失。",
          ],
          bullets: ["压膜：美观，需按时佩戴", "哈雷：可微调，耐用", "固定丝：省心，但需精细清洁"],
        },
        {
          heading: "佩戴节奏",
          paragraphs: [
            "拆除矫治器后的前几个月通常佩戴时间最长，之后可能改为夜间。具体计划因人而异，请以医嘱为准，不要自行停戴。",
          ],
        },
        {
          heading: "清洁与复查",
          paragraphs: [
            "活动保持器可用清水与专用清洁片；固定丝周围要用牙线穿引器或冲牙器。保持器损坏、不贴合时及时复诊重做。",
          ],
        },
      ],
      links: { simulate: true, try: "aligner", related: ["ortho-hawley", "ortho-fixed-retainer", "ortho-hygiene"] },
    },
  },
};

/** Resolve topic meta (title/subtitle) by id across specialties. */
window.AtlasData.findTopic = function (topicId) {
  const specs = window.AtlasData.specialties;
  for (const key of Object.keys(specs)) {
    const spec = specs[key];
    for (const group of spec.groups) {
      const hit = group.topics.find((t) => t.id === topicId);
      if (hit) return { topic: hit, specialty: spec };
    }
  }
  return null;
};
