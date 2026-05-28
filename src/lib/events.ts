import { TileEvent, PlayerState } from './gameTypes';

const TILE_EVENTS: Record<number, (p: PlayerState) => TileEvent> = {
  // 格子0：仓网维护，等待+血压重扣
  0: () => ({
    title: '🗺️ 物流维护BC仓网覆盖关系',
    description: '系统正在维护BC仓网覆盖关系，您的仓网版图正在生成中……需要原地等待，系统还顺手扣了一笔维护服务费。',
    autoPass: true,
    autoEffect: { sanity: -18, cash: -8000, stuckTurns: 1 } as Partial<PlayerState>,
  }),

  // 格子1：大礼包（少给点）
  1: () => ({
    title: '🎁 大礼包！费率优惠',
    description: '恭喜命中入仓大礼包——减免半个月仓储费！虽然没想象中多，但也是真金白银。',
    autoPass: true,
    autoEffect: { cash: 20000, sanity: 5 },
  }),

  // 格子2：入仓方案，选项加重
  2: () => ({
    title: '🏭 确认入仓方案',
    description: '请选择入仓策略：1个B仓发全国，成本低但跨区率高；还是入3个B仓分区覆盖，成本高但体验好？',
    optionA: {
      label: '📍 1B发全国',
      effect: { cash: -50000, oor: 8, sanity: -5 },
      effectDescription: 'Cash -5万 | 现货率 +8% | 血压 -5（跨区投诉不断）',
    },
    optionB: {
      label: '🏭🏭🏭 入3个B仓',
      effect: { cash: -100000, oor: -5, sanity: -20 },
      effectDescription: 'Cash -10万 | 现货率 -5% | 血压 -20（操作量翻三倍）',
    },
    optionC: {
      label: '🚀 我想直接送到C仓',
      effect: { sanity: -100, cash: -15000 },
      effectDescription: '血压 -100 | Cash -1.5万（C仓不支持直送，还被罚款了）',
    },
  }),

  // 格子3：签约成功，扣钱多一点
  3: () => ({
    title: '📝 恭喜签约成功！',
    description: '运输协议签订完成！B运输服务协议生效，首年服务费一次性收取。',
    autoPass: true,
    autoEffect: { cash: -30000, sanity: 5 },
  }),

  // 格子4：数据创建中，加血压惩罚
  4: () => ({
    title: '⏳ 物流数据创建中',
    description: '后台系统数据创建中，请耐心等待……对接BD三次、打电话催了两遍，终于有回音了。',
    autoPass: true,
    autoEffect: { sanity: -15, stuckTurns: 1 } as Partial<PlayerState>,
  }),

  // 格子5：京麦权限，但开通过程被坑
  5: (p) => ({
    title: '🔑 京麦权限开通',
    description: p.cash < 60000
      ? '京麦权限开通了，但账上快没钱了，系统还提示年费到期……'
      : '京麦权限已开通！但开通过程中发现需要补缴年费。',
    autoPass: true,
    autoEffect: { cash: -10000, sanity: p.cash < 60000 ? -20 : 5 },
  }),

  // 格子6：算法选品，等待+扣钱
  6: () => ({
    title: '🤖 算法C仓选品中',
    description: '智能算法正在选品，结果迟迟不来，客服说"系统正在优化"……等了两天还收了技术服务费。',
    autoPass: true,
    autoEffect: { sanity: -20, cash: -12000, stuckTurns: 2 } as Partial<PlayerState>,
  }),

  // 格子7：销量预测，结果不准扣血压
  7: () => ({
    title: '📊 开始销量预测',
    description: '销量预测模型跑完了，预测准确率62%……比扔硬币强一点点。还需要等待系统同步。',
    autoPass: true,
    autoEffect: { sanity: -10, stuckTurns: 1 } as Partial<PlayerState>,
  }),

  // 格子8：自动补货配置，操作复杂血压扣
  8: () => ({
    title: '⚙️ 自动补货配置中',
    description: '自动补货规则配置页面有28个参数需要填写，填到第25个发现页面超时……重新填。',
    autoPass: true,
    autoEffect: { sanity: -15, stuckTurns: 1 } as Partial<PlayerState>,
  }),

  // 格子9：需求单，选项惩罚加重
  9: () => ({
    title: '📋 需求单来了！',
    description: '一张需求单摆在面前，请确认数量进行回告，或者驳回这张单据。\n\n提示：回告前记得检查箱规哦……',
    optionA: {
      label: '✅ 回告确认数量',
      effect: { cash: -30000, sanity: -10 },
      effectDescription: 'Cash -3万（备货成本）| 血压 -10',
      subEvent: {
        title: '💥 哎呀！箱规还没维护！',
        description: '刚要回告才发现——箱规还没维护！没有箱规数据，仓库没法收货，还被系统自动驳回扣了信誉分。',
        optionA: {
          label: '🔧 赶紧去维护箱规',
          effect: { sanity: -10, cash: -5000 },
          effectDescription: '血压 -10 | Cash -5000（加急维护费）',
        },
        optionB: {
          label: '📦 散装送货算了',
          effect: { sanity: -35, cash: -10000 },
          effectDescription: '血压 -35 | Cash -1万（仓库拒收，重新安排运输）',
        },
      },
    },
    optionB: {
      label: '❌ 驳回',
      effect: { sanity: -20, cash: -8000 },
      effectDescription: '血压 -20 | Cash -8000（驳回违约金）| 原地停留3步',
      stuckTurns: 3,
    },
  }),

  // 格子10：送仓，自送代价更大
  10: () => ({
    title: '🚛 拆ASN单预约送仓',
    description: 'ASN单已拆好，现在要选择送仓方式。自己安排物流送过去，还是让TC上门揽收？',
    optionA: {
      label: '🏃 自己送',
      effect: { cash: -50000, sanity: -30 },
      effectDescription: 'Cash -5万 | 血压 -30（堵了4小时，货还压了一晚上）',
    },
    optionB: {
      label: '🤝 TC上门揽收',
      effect: { cash: -25000, sanity: -5 },
      effectDescription: 'Cash -2.5万 | 血压 -5（等了半天才来）',
    },
  }),

  // 格子11：B仓少件，损失加重
  11: (p) => ({
    title: '📦 B仓收货 — 发现少件！',
    description: p.sanity < 85
      ? 'B仓收货盘点后发现少了8件！而且对方态度强硬，非说是你自己发货时少装的……'
      : 'B仓收货盘点后发现少了5件！这是运输丢失还是破损？需要判定原因。',
    optionA: {
      label: '💔 判定为破损申请理赔',
      effect: { sanity: -10, cash: 8000, inventoryB: -5 },
      effectDescription: '血压 -10（扯皮过程很累）| 获赔 ¥8000 | B仓 -5件',
    },
    optionB: {
      label: '❓ 自认倒霉',
      effect: { sanity: -25, inventoryB: -5, cash: -5000 },
      effectDescription: '血压 -25 | B仓 -5件 | Cash -5000（重新补货）',
    },
  }),

  // 格子12：B仓更新，但有仓储费
  12: () => ({
    title: '📊 B仓库存更新',
    description: 'B仓库存数据同步完成，但本月仓储费账单也同步来了……',
    autoPass: true,
    autoEffect: { inventoryB: 50, sanity: -5, cash: -15000 },
  }),

  // 格子13：BC调拨，调拨费用扣现金
  13: () => ({
    title: '🔄 BC调拨已发起',
    description: 'BC调拨指令已下发，货物从B仓向C仓转运，现货率上升，但调拨运费不便宜。',
    autoPass: true,
    autoEffect: { inventoryB: -30, inventoryC: 30, oor: 12, cash: -18000, sanity: -5 },
  }),

  // 格子14：C仓更新，好事但有小坑
  14: (p) => ({
    title: '📈 C仓库存更新',
    description: p.inventoryC > 20
      ? 'C仓库存更新完成，现货率大幅提升！但系统提示部分商品即将过期……'
      : 'C仓库存更新完成，但数量偏少，现货率提升有限，系统给了个差评。',
    autoPass: true,
    autoEffect: {
      sanity: p.inventoryC > 20 ? 5 : -15,
      inventoryC: 20,
      oor: p.inventoryC > 20 ? -2 : -8,
      cash: -8000,
    },
  }),

  // 格子15：查账单，账单比预期多
  15: () => ({
    title: '🧾 查询账单',
    description: '账单出来了——运费、仓储费、增值服务费、系统使用费……每一项单独看都合理，加起来看直接血压拉满。',
    autoPass: true,
    autoEffect: { sanity: -20, cash: -10000 },
  }),

  // 格子16：支付，最终费用加重
  16: () => ({
    title: '💳 支付运费和仓储费',
    description: '最后一步！支付费用即可完成全流程通关。\n\n或者……你想先查查在库商品的保质期？有可能增加现金流',
    optionA: {
      label: '💰 支付费用，完成通关',
      effect: { cash: -80000 },
      effectDescription: 'Cash -8万（运费+仓储费+各类杂费）',
    },
    optionB: {
      label: '🔍 查询在库商品保质期',
      effect: { sanity: -25, cash: -5000 },
      effectDescription: '血压 -25 | Cash -5000（发现滞销商品！触发隐藏关卡）',
      triggerHidden: true,
    },
    isWin: true,
  }),

  // 格子17：隐藏关卡，选项代价更真实
  17: () => ({
    title: '🧹 隐藏关卡 — 清理滞销！',
    description: '检查保质期后发现大批商品滞销，距离过期只剩45天！促销清仓还是退供处理？两条路都不好走……',
    optionA: {
      label: '🏷️ 促销清仓（5折甩）',
      effect: { cash: 15000, sanity: -15, inventoryC: -20 },
      effectDescription: 'Cash +1.5万（回款打折）| 血压 -15（心疼死了）| C仓 -20件',
    },
    optionB: {
      label: '↩️ 退供处理',
      effect: { cash: -30000, sanity: -20, inventoryB: -30 },
      effectDescription: 'Cash -3万（退货物流+损耗）| 血压 -20 | B仓 -30件',
    },
    isWin: true,
  }),
};
    title: '🗺️ 物流维护BC仓网覆盖关系',
    description: '系统正在维护BC仓网覆盖关系，您的仓网版图正在生成中……需要原地等待。',
    autoPass: true,
    autoEffect: { sanity: -10, stuckTurns: 1 } as Partial<PlayerState>,
  }),

  1: () => ({
    title: '🎁 大礼包！费率优惠',
    description: '恭喜！经过费率确认，您命中了入仓大礼包——入仓免一个月仓储费！直接省下一笔！',
    autoPass: true,
    autoEffect: { cash: 50000 },
  }),

  2: () => ({
    title: '🏭 确认入仓方案',
    description: '请选择入仓策略：1个B仓发全国，成本低但跨区率高；还是入3个B仓分区覆盖，成本高但体验好？',
    optionA: {
      label: '📍 1B发全国',
      effect: { cash: -50000, oor: 5 },
      effectDescription: 'Cash -5万 | 现货率 +5%',
    },
    optionB: {
      label: '🏭🏭🏭 入3个B仓',
      effect: { cash: -150000, oor: -3, sanity: -10 },
      effectDescription: 'Cash -15万 | 现货率 -3% | 血压 -10（操作复杂）',
    },
    optionC: {
      label: '🚀 我想直接送到C仓',
      effect: { sanity: -100 },
      effectDescription: '血压 -100（你在想什么？C仓不支持商家直送！）',
    },
  }),

  3: () => ({
    title: '📝 恭喜签约成功！',
    description: '运输协议签订完成！恭喜，B运输服务协议已正式生效。',
    autoPass: true,
    autoEffect: { cash: -20000, sanity: 5 },
  }),

  4: () => ({
    title: '⏳ 物流数据创建中',
    description: '后台系统数据创建中，请耐心等待……数据同步需要时间。',
    autoPass: true,
    autoEffect: {},
  }),

  5: () => ({
    title: '🔑 京麦权限开通',
    description: '京麦权限已成功开通！您现在可以在京麦平台上管理您的供应链了。',
    autoPass: true,
    autoEffect: { sanity: 10 },
  }),

  6: () => ({
    title: '🤖 算法C仓选品中',
    description: '智能算法正在根据历史销量和地区需求进行C仓选品推荐……需要原地等待选品结果。',
    autoPass: true,
    autoEffect: { sanity: -10, stuckTurns: 1 } as Partial<PlayerState>,
  }),

  7: () => ({
    title: '📊 开始销量预测',
    description: '销量预测模型启动中！马上就要入仓了，商家有点激动……需要原地等待。',
    autoPass: true,
    autoEffect: { sanity: 10, stuckTurns: 1 } as Partial<PlayerState>,
  }),

  8: () => ({
    title: '⚙️ 自动补货配置中',
    description: '自动补货规则正在配置，即将入仓！激动得血压都上来了……需要原地等待。',
    autoPass: true,
    autoEffect: { sanity: 10, stuckTurns: 1 } as Partial<PlayerState>,
  }),

  9: () => ({
    title: '📋 需求单来了！',
    description: '一张需求单摆在面前，请确认数量进行回告，或者驳回这张单据。\n\n提示：回告前记得检查箱规哦……',
    optionA: {
      label: '✅ 回告确认数量',
      effect: { cash: -30000 },
      effectDescription: 'Cash -3万（备货成本）',
      subEvent: {
        title: '💥 哎呀！箱规还没维护！',
        description: '刚要回告才发现——箱规还没维护！没有箱规数据，仓库没法收货。你打算……',
        optionA: {
          label: '🔧 赶紧去维护箱规',
          effect: { sanity: 10 },
          effectDescription: '血压 +10（做事靠谱心态好）',
        },
        optionB: {
          label: '📦 散装送货算了',
          effect: { sanity: -20 },
          effectDescription: '血压 -20（仓库骂人了）',
        },
      },
    },
    optionB: {
      label: '❌ 驳回',
      effect: { sanity: -10 },
      effectDescription: '无待处理单据，原地停留5步！血压 -10',
      stuckTurns: 5,
    },
  }),

  10: () => ({
    title: '🚛 拆ASN单预约送仓',
    description: 'ASN单已拆好，现在要选择送仓方式。自己安排物流送过去，还是让TC上门揽收？',
    optionA: {
      label: '🏃 自己送',
      effect: { cash: -40000, sanity: -20 },
      effectDescription: 'Cash -4万 | 血压 -20（路上堵车心态炸了）',
    },
    optionB: {
      label: '🤝 TC上门揽收',
      effect: { cash: -20000, sanity: 10 },
      effectDescription: 'Cash -2万 | 血压 +10（省心省力）',
    },
  }),

  11: () => ({
    title: '📦 B仓收货 — 发现少件！',
    description: 'B仓收货盘点后发现少了2件！这是运输丢失还是破损呢？需要判定原因。',
    optionA: {
      label: '💔 判定为破损',
      effect: { sanity: 5, cash: 5000, inventoryB: -2 },
      effectDescription: '血压 +5 | 获赔 ¥5000（京东物流责任，商家获赔）',
    },
    optionB: {
      label: '❓ 判定为丢失',
      effect: { sanity: -5, inventoryB: -2 },
      effectDescription: '血压 -5 | B仓 -2件（经验证是商家自己的问题）',
    },
  }),

  12: () => ({
    title: '📊 B仓库存更新',
    description: 'B仓库存数据已完成更新同步，一切正常。',
    autoPass: true,
    autoEffect: { inventoryB: 50, sanity: 10 },
  }),

  13: () => ({
    title: '🔄 BC调拨已发起',
    description: 'BC调拨指令已下发，货物正从B仓向C仓转运中……现货率提升！',
    autoPass: true,
    autoEffect: { inventoryB: -30, inventoryC: 30, oor: 10 },
  }),

  14: () => ({
    title: '📈 C仓库存更新',
    description: '恭喜！C仓库存已更新，现货率大幅提升！用户体验直线上升！',
    autoPass: true,
    autoEffect: { sanity: 10, inventoryC: 20, oor: -2 },
  }),

  15: () => ({
    title: '🧾 查询账单',
    description: '您的费用账单已生成，包含运费、仓储费、增值服务费等各项明细。',
    autoPass: true,
    autoEffect: {},
  }),

  16: () => ({
    title: '💳 支付运费和仓储费',
    description: '最后一步！支付费用即可完成全流程通关。\n\n或者……你想先查查在库商品的保质期？有可能增加现金流',
    optionA: {
      label: '💰 支付费用，完成通关',
      effect: { cash: -80000 },
      effectDescription: 'Cash -8万（运费+仓储费）',
    },
    optionB: {
      label: '🔍 查询在库商品保质期',
      effect: { sanity: -20 },
      effectDescription: '血压 -20（发现滞销商品！触发隐藏关卡）',
      triggerHidden: true,
    },
    isWin: true,
  }),

  17: () => ({
    title: '🧹 隐藏关卡 — 清理滞销！',
    description: '检查保质期后发现部分商品已滞销！需要紧急处理，促销清仓还是退供处理？',
    optionA: {
      label: '🏷️ 促销清仓',
      effect: { cash: 30000, sanity: 10 },
      effectDescription: 'Cash +3万（回款成功）| 血压 +10',
    },
    optionB: {
      label: '↩️ 退供处理',
      effect: { cash: -20000, sanity: -10, inventoryB: -30 },
      effectDescription: 'Cash -2万 | 血压 -10 | B仓 -30件',
    },
    isWin: true,
  }),
};

/**
 * triggerLLMEvent — 根据格子ID和当前玩家状态生成游戏事件。
 *
 * 当前为 Mock 实现，硬编码了18个供应链节点的事件逻辑。
 * 未来接入 LLM API 后，此函数将调用大模型动态生成事件：
 *   - 输入：tileId（格子ID）、playerState（当前玩家全部指标）
 *   - 输出：TileEvent（包含标题、描述、选项及其影响）
 *   - LLM 可基于 playerState 动态调整事件难度和叙事
 *
 * @param tileId - 当前格子ID
 * @param playerState - 当前玩家状态
 * @returns TileEvent
 */
export function triggerLLMEvent(
  tileId: number,
  playerState: PlayerState
): TileEvent {
  const generator = TILE_EVENTS[tileId];
  if (!generator) {
    return { title: '前进中...', description: '继续前进！', autoPass: true, autoEffect: {} };
  }
  return generator(playerState);
}
