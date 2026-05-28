import { TileEvent, PlayerState } from './gameTypes';

const TILE_EVENTS: Record<number, (p: PlayerState) => TileEvent> = {
  0: () => ({
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
