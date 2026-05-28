import { Tile } from './gameTypes';

export const BOARD_TILES: Tile[] = [
  { id: 0,  name: '物流维护BC仓网覆盖中', emoji: '🗺️', description: '物流维护BC仓网覆盖关系中',              category: 'start' },
  { id: 1,  name: '确认费率和折扣',      emoji: '🎁', description: '确认费率和折扣，可能命中大礼包！',        category: 'event' },
  { id: 2,  name: '确认入仓方案',        emoji: '🏭', description: '选择B仓数量，1B发全国还是3B分区？',       category: 'choice' },
  { id: 3,  name: '签订运输协议',        emoji: '📝', description: '签订B运输服务协议',                    category: 'process' },
  { id: 4,  name: '物流数据创建中',      emoji: '⏳', description: '物流数据创建中',                      category: 'process' },
  { id: 5,  name: '京麦权限开通',        emoji: '🔑', description: '京麦权限开通中',                      category: 'process' },
  { id: 6,  name: '算法C仓选品',         emoji: '🤖', description: '算法C仓选品中',                      category: 'process' },
  { id: 7,  name: '开始销量预测',        emoji: '📊', description: '销量预测启动，马上要入仓了！',            category: 'process' },
  { id: 8,  name: '自动补货配置中',      emoji: '⚙️', description: '自动补货规则配置中，即将入仓！',          category: 'process' },
  { id: 9,  name: '需求单来了！',        emoji: '📋', description: '需求单到达，回告还是驳回？',             category: 'choice' },
  { id: 10, name: '拆ASN预约送仓',       emoji: '🚛', description: '选择自己送还是TC上门揽收？',            category: 'choice' },
  { id: 11, name: 'B仓收货中',          emoji: '📦', description: 'B仓收货时发现少件！',                  category: 'event' },
  { id: 12, name: 'B仓库存更新',        emoji: '📊', description: 'B仓库存数据已更新',                    category: 'process' },
  { id: 13, name: 'BC调拨已发起',        emoji: '🔄', description: 'BC调拨流程已发起',                    category: 'process' },
  { id: 14, name: 'C仓库存更新',        emoji: '📈', description: '恭喜！现货率提升！',                   category: 'event' },
  { id: 15, name: '查询账单',           emoji: '🧾', description: '查询您的费用账单',                     category: 'process' },
  { id: 16, name: '支付费用',           emoji: '💳', description: '支付运费和仓储费，或查查保质期？',         category: 'win' },
  { id: 17, name: '清理滞销',           emoji: '🧹', description: '发现滞销商品，促销还是退供？',            category: 'hidden' },
];
