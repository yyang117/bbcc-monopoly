'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { PlayerState, TileEvent, SubEvent, TileOption, INITIAL_PLAYER_STATE } from '@/lib/gameTypes';
import { BOARD_TILES } from '@/lib/board';
import { triggerLLMEvent } from '@/lib/events';

function formatCash(n: number): string {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toLocaleString();
}

/* ─── Confetti ─── */
function ConfettiShower() {
  const pieces = Array.from({ length: 48 }, (_, i) => i);
  const colors = ['#f5a0c0','#ffe066','#7bed9f','#70a1ff','#ff6b81','#eccc68','#a29bfe'];
  return (
    <>
      {pieces.map(i => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20 + 10}px`,
            background: colors[i % colors.length],
            width: `${Math.random() * 8 + 6}px`,
            height: `${Math.random() * 8 + 6}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDuration: `${Math.random() * 1.5 + 1.2}s`,
            animationDelay: `${Math.random() * 0.8}s`,
          }}
        />
      ))}
    </>
  );
}

/* ─── Stat display with flash on change ─── */
function StatNum({ value, format }: { value: number; format?: (v: number) => string }) {
  const prevRef = useRef(value);
  const [flashClass, setFlashClass] = useState('');
  const [delta, setDelta] = useState<{ key: number; value: number } | null>(null);
  const display = format ? format(value) : String(value);

  useEffect(() => {
    if (prevRef.current === value) return;
    const diff = value - prevRef.current;
    setFlashClass(diff > 0 ? 'stat-up' : 'stat-down');
    setDelta({ key: Date.now(), value: diff });
    prevRef.current = value;
    const t = setTimeout(() => setFlashClass(''), 650);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <>
      {delta && (
        <span
          key={delta.key}
          className={`stat-delta ${delta.value > 0 ? 'stat-delta-up' : 'stat-delta-down'}`}
        >
          {delta.value > 0 ? '+' : ''}{format ? format(delta.value) : delta.value}
        </span>
      )}
      <span className={`gs-num ${flashClass}`}>{display}</span>
    </>
  );
}

/* Real dice face with dots */
function DiceFace({ value, size = 52 }: { value: number; size?: number }) {
  const dotSize = size * 0.2;
  const positions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  };
  const dots = positions[value] || positions[1];
  return (
    <div className="dice-face" style={{ width: size, height: size }}>
      {dots.map(([x, y], i) => (
        <div
          key={i}
          className="dice-dot"
          style={{
            width: dotSize,
            height: dotSize,
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

// Map 18 tiles to a rectangle loop (6 cols × 5 rows outer ring):
// Top row: 0-5 (6 tiles, left→right)
// Right col: 6-8 (3 tiles, top→bottom, rows 1-3)
// Bottom row: 9-14 (6 tiles, right→left, row 4)
// Left col: 15-17 (3 tiles, bottom→top, rows 3-1)
function getTileGridPos(id: number): { row: number; col: number } {
  if (id <= 5) return { row: 0, col: id };           // top row
  if (id <= 8) return { row: id - 5, col: 5 };       // right col
  if (id <= 14) return { row: 4, col: 14 - id };     // bottom row (reversed)
  return { row: 18 - id, col: 0 };                   // left col (reversed)
}

/* ─── Onboarding ─── */
function OnboardingScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);

  return (
    <div className="ob-screen">
      <div className="ob-card">
        {step === 0 && (
          <div className="ob-step fade-up">
            <div className="ob-logo">BBCC</div>
            <div className="ob-sub">Monopoly</div>
            <div className="ob-line" />
            <label className="ob-label">请输入你的昵称</label>
            <input
              className="ob-input"
              placeholder="输入昵称..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) setStep(1); }}
              autoFocus
            />
            <button className="ob-btn" disabled={!name.trim()} onClick={() => setStep(1)}>确认</button>
          </div>
        )}
        {step === 1 && (
          <div className="ob-step fade-up">
            <div className="ob-big-emoji">🏭</div>
            <h2 className="ob-title">欢迎，<span className="ob-hl">{name.trim()}老板</span>！</h2>
            <p className="ob-desc">
              欢迎入驻京东，即将完成从 <strong>签约 → 入仓 → 出库 → 结算</strong> 的全链路流程。
              <br />每一步都有意想不到的惊喜……祝好运！
            </p>
            <div className="ob-tips">
              <div className="ob-tip"><span>💰</span>资金归零 = 破产出局</div>
              <div className="ob-tip"><span>🧠</span>血压不健康 = 送医出局</div>
              <div className="ob-tip"><span>🎲</span>掷骰子沿流程前进，触发供应链事件</div>
            </div>
            <div className="ob-kpi">
              <div className="kp kp-y"><div className="kp-l">Cash</div><div className="kp-v">12万</div></div>
              <div className="kp kp-b"><div className="kp-l">工厂库存</div><div className="kp-v">1000件</div></div>
              <div className="kp kp-g"><div className="kp-l">京仓库存</div><div className="kp-v">0件</div></div>
              <div className="kp kp-o"><div className="kp-l">现货率</div><div className="kp-v">0%</div></div>
              <div className="kp kp-p"><div className="kp-l">周转天数</div><div className="kp-v">30天</div></div>
              <div className="kp kp-c"><div className="kp-l">血压</div><div className="kp-v">100</div></div>
            </div>
            <button className="ob-btn" onClick={() => onStart(name.trim())}>开始冒险 🚀</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Win / Achievement Screen ─── */
function calcScore(p: PlayerState): number {
  const cashScore = Math.max(0, p.cash) / 10000;
  const sanityScore = p.sanity * 100;
  const rollPenalty = p.totalRolls * 50;
  return Math.round(cashScore + sanityScore - rollPenalty);
}

function calcRank(score: number): { rank: string; percentile: number } {
  if (score >= 8000) return { rank: 'S', percentile: 1 };
  if (score >= 6000) return { rank: 'A', percentile: 10 };
  if (score >= 4000) return { rank: 'B', percentile: 30 };
  if (score >= 2000) return { rank: 'C', percentile: 60 };
  return { rank: 'D', percentile: 90 };
}

function WinScreen({ player, nickname, onRestart }: { player: PlayerState; nickname: string; onRestart: () => void }) {
  const achievements: string[] = [];
  if (player.sanity >= 80) achievements.push('🧘 心如止水 — 血压始终健康');
  if (player.sanity < 40) achievements.push('🤯 压力山大 — 血压一度告急');
  if (player.totalSpent < 300000) achievements.push('💰 精打细算 — 总花费低于30万');
  if (player.totalSpent >= 500000) achievements.push('🤑 大手大脚 — 总花费超过50万');
  if (player.hiddenRoute) achievements.push('🔍 火眼金睛 — 发现隐藏关卡');
  if (player.inventoryC > 120) achievements.push('📦 C仓达人 — C仓库存超120');
  if (player.totalRolls <= 5) achievements.push('🎯 速通高手 — 5次以内通关');
  achievements.push('🏆 全链路通关 — 完成BBCC全链路流程');

  const score = calcScore(player);
  const { rank, percentile } = calcRank(score);

  return (
    <div className="win-screen">
      <ConfettiShower />
      <div className="win-card fade-up win-glow">
        <div className="win-emoji win-emoji-bounce">🎉</div>
        <h1 className="win-title">恭喜通关！</h1>
        <p className="win-sub">{nickname}老板，您已完成 BBCC 全链路流程！</p>

        <div className="rank-section">
          <div className="rank-badge rank-{rank}">{rank}</div>
          <div className="rank-info">
            <div className="rank-score">综合评分 {score} 分</div>
            <div className="rank-pct">超越 {100 - percentile}% 的玩家</div>
          </div>
        </div>

        <div className="win-summary">
          <div className="ws-item"><span className="ws-label">剩余资金</span><span className="ws-val">¥{formatCash(player.cash)}</span></div>
          <div className="ws-item"><span className="ws-label">总计花费</span><span className="ws-val ws-spent">¥{formatCash(player.totalSpent)}</span></div>
          <div className="ws-item"><span className="ws-label">最终血压</span><span className="ws-val">{player.sanity}</span></div>
          <div className="ws-item"><span className="ws-label">掷骰次数</span><span className="ws-val">{player.totalRolls}次</span></div>
          <div className="ws-item"><span className="ws-label">工厂库存</span><span className="ws-val">{player.inventoryFactory}件</span></div>
          <div className="ws-item"><span className="ws-label">B仓库存</span><span className="ws-val">{player.inventoryB}件</span></div>
          <div className="ws-item"><span className="ws-label">C仓库存</span><span className="ws-val">{player.inventoryC}件</span></div>
        </div>
        <div className="win-achv-title">🏅 成就结算</div>
        <div className="win-achv-list">
          {achievements.map((a, i) => (
            <div key={i} className="achv-item fade-up" style={{ animationDelay: `${i * 0.1}s` }}>{a}</div>
          ))}
        </div>
        <button className="ob-btn" onClick={onRestart}>再来一局</button>
      </div>
    </div>
  );
}

/* ─── Game Over Screen ─── */
function GameOverScreen({ player, nickname, onRestart }: { player: PlayerState; nickname: string; onRestart: () => void }) {
  const reason = player.sanity <= 0
    ? '血压归零，你已被紧急送医……'
    : player.sanity >= 128
    ? '血压飙到128！高血压危象，紧急送医……'
    : player.sanity < 82
    ? `血压过低(${player.sanity})！低血压休克，紧急送医……`
    : '资金链断裂，公司已破产……';

  return (
    <div className="win-screen">
      <div className="gameover-flash" />
      <div className="win-card fade-up screen-shake">
        <div className="win-emoji win-emoji-bounce">😵</div>
        <h1 className="win-title" style={{ color: '#ef4444' }}>啊哦，Game Over!</h1>
        <p className="win-sub">{nickname}老板，{reason}</p>
        <div className="win-summary">
          <div className="ws-item"><span className="ws-label">剩余资金</span><span className="ws-val">¥{formatCash(player.cash)}</span></div>
          <div className="ws-item"><span className="ws-label">总计花费</span><span className="ws-val ws-spent">¥{formatCash(player.totalSpent)}</span></div>
          <div className="ws-item"><span className="ws-label">最终血压</span><span className="ws-val">{player.sanity}</span></div>
          <div className="ws-item"><span className="ws-label">掷骰次数</span><span className="ws-val">{player.totalRolls}次</span></div>
          <div className="ws-item"><span className="ws-label">走到了</span><span className="ws-val">第{player.position + 1}关</span></div>
          <div className="ws-item"><span className="ws-label">进度</span><span className="ws-val">{Math.round(((player.position + 1) / 15) * 100)}%</span></div>
        </div>
        <button className="ob-btn" onClick={onRestart}>再来一局</button>
      </div>
    </div>
  );
}

/* ─── Scene Drama — SVG 小人互动 ─── */
type SceneType = 'good' | 'bad' | 'mix' | 'neutral';

function pickScene(resultText: string): SceneType {
  const cashUp   = /Cash \+/.test(resultText);
  const cashDown = /Cash -/.test(resultText);
  const sanUp    = /血压 \+/.test(resultText);
  const sanDown  = /血压 -/.test(resultText);
  const good = cashUp || sanUp;
  const bad  = cashDown || sanDown;
  if (good && bad) return 'mix';
  if (good)        return 'good';
  if (bad)         return 'bad';
  return 'neutral';
}

/* 猫猫老板（左）*/
function SvgBoss({ scene }: { scene: SceneType }) {
  const mouth = scene === 'bad'
    ? 'M 11 19 Q 15 16 19 19'
    : scene === 'good'
    ? 'M 11 17 Q 15 21 19 17'
    : 'M 12 18 L 18 18';
  return (
    <svg className={`fig-svg fig-boss fig-boss-${scene}`} width="56" height="100" viewBox="0 0 30 60">
      <polygon points="5,14 9,4 13,14"  fill="#f5a0c0"/>
      <polygon points="17,14 21,4 25,14" fill="#f5a0c0"/>
      <g className="boss-head">
        <circle cx="15" cy="18" r="10" fill="#7b5b3a" stroke="#5a3d25" strokeWidth="1"/>
        {scene === 'bad'
          ? <><text x="9" y="20" fontSize="5" fill="#555">＞</text><text x="16" y="20" fontSize="5" fill="#555">＜</text></>
          : <><circle cx="11" cy="18" r="1.8" fill="#1a1a1a"/><circle cx="19" cy="18" r="1.8" fill="#1a1a1a"/></>
        }
        <path d={mouth} stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M 21 10 Q 24 8 23 11 Q 24 14 21 12 Q 18 14 19 11 Q 18 8 21 10 Z" fill="#f5a0c0"/>
      </g>
      <rect x="8" y="29" width="14" height="16" rx="3" fill="#f5a0c0" stroke="#d4789e" strokeWidth="1"/>
      <path d="M 13 34 Q 15 32 17 34 Q 19 36 15 39 Q 11 36 13 34 Z" fill="#e74c6f"/>
      <rect className="boss-arm-l" x="3"  y="30" width="5" height="13" rx="2.5" fill="#f5a0c0" stroke="#d4789e" strokeWidth="1"/>
      <rect className="boss-arm-r" x="22" y="30" width="5" height="13" rx="2.5" fill="#f5a0c0" stroke="#d4789e" strokeWidth="1"/>
      <rect className="boss-leg-l" x="9"  y="44" width="5" height="14" rx="2.5" fill="#555"/>
      <rect className="boss-leg-r" x="16" y="44" width="5" height="14" rx="2.5" fill="#555"/>
    </svg>
  );
}

/* 京东小二（右）*/
function SvgJD({ scene }: { scene: SceneType }) {
  const mouth = scene === 'bad'
    ? 'M 11 19 Q 15 16 19 19'
    : 'M 11 17 Q 15 21 19 17';
  return (
    <svg className={`fig-svg fig-jd fig-jd-${scene}`} width="56" height="100" viewBox="0 0 30 60">
      <g className="jd-head">
        <circle cx="15" cy="18" r="10" fill="#ffe0b2" stroke="#e0a060" strokeWidth="1"/>
        <rect x="5" y="7" width="20" height="7" rx="2" fill="#e74c3c"/>
        <text x="15" y="13.5" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">JD</text>
        <circle cx="11" cy="19" r="1.8" fill="#1a1a1a"/>
        <circle cx="19" cy="19" r="1.8" fill="#1a1a1a"/>
        <path d={mouth} stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </g>
      <rect x="8" y="29" width="14" height="16" rx="3" fill="#e74c3c" stroke="#c0392b" strokeWidth="1"/>
      <text x="15" y="40" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">JD</text>
      <rect className="jd-arm-l" x="3"  y="30" width="5" height="13" rx="2.5" fill="#e74c3c" stroke="#c0392b" strokeWidth="1"/>
      <rect className="jd-arm-r" x="22" y="30" width="5" height="13" rx="2.5" fill="#e74c3c" stroke="#c0392b" strokeWidth="1"/>
      <rect className="jd-leg-l" x="9"  y="44" width="5" height="14" rx="2.5" fill="#555"/>
      <rect className="jd-leg-r" x="16" y="44" width="5" height="14" rx="2.5" fill="#555"/>
    </svg>
  );
}

const SCENE_LABELS: Record<SceneType, string> = {
  good:    '一切顺利，恭喜老板！',
  bad:     '这单出问题了，钱或者血压都受影响，下次注意……',
  mix:     '有赚有亏，供应链嘛，就这样，继续跑吧',
  neutral: '流程走完了，数据没啥变化，等下一步通知吧',
};
const SCENE_EFFECTS: Record<SceneType, string> = {
  good: '🤝', bad: '💢', mix: '🤷', neutral: '📋',
};

function SceneDrama({ resultText }: { resultText: string }) {
  const scene = useMemo(() => pickScene(resultText), [resultText]);
  return (
    <div className="drama-stage">
      <div className="drama-scene">
        <SvgBoss scene={scene} />
        <div className={`drama-effect drama-effect-${scene}`}>{SCENE_EFFECTS[scene]}</div>
        <SvgJD scene={scene} />
      </div>
      <div className="drama-caption">{SCENE_LABELS[scene]}</div>
    </div>
  );
}

/* ─── Result Modal (shown AFTER choice) ─── */
function ResultModal({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="modal-bg">
      <div className="modal modal-bounce">
        <h2 className="modal-title modal-title-pop">📢 结果</h2>
        <SceneDrama resultText={text} />
        <p className="modal-desc">{text}</p>
        <button className="ob-btn" onClick={onClose}>确认</button>
      </div>
    </div>
  );
}

/* ─── Main Game ─── */
export default function Home() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerState>({ ...INITIAL_PLAYER_STATE });
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [diceAnim, setDiceAnim] = useState<'idle' | 'throwing' | 'landed'>('idle');
  const [currentEvent, setCurrentEvent] = useState<TileEvent | null>(null);
  const [subEvent, setSubEvent] = useState<SubEvent | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [resultText, setResultText] = useState<string | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  const restartGame = useCallback(() => {
    setPlayer({ ...INITIAL_PLAYER_STATE });
    setDiceValue(1);
    setIsRolling(false);
    setIsWalking(false);
    setDiceAnim('idle');
    setCurrentEvent(null);
    setSubEvent(null);
    setGameOver(false);
    setResultText(null);
    setMessage(`${nickname}老板，新的冒险开始了！`);
  }, [nickname]);

  const bossName = nickname ? `${nickname}老板` : '';
  const playerRef = useRef(player);
  playerRef.current = player;

  useEffect(() => {
    if (nickname) setMessage(`${bossName}，掷骰子开始你的供应链之旅！`);
  }, [nickname, bossName]);

  const applyEffect = useCallback((effect: Partial<PlayerState>, prev: PlayerState): PlayerState => {
    const u = { ...prev };
    if (effect.cash) { u.cash += effect.cash; u.totalSpent += Math.max(0, -effect.cash); }
    if (effect.inventoryFactory) u.inventoryFactory = Math.max(0, u.inventoryFactory + effect.inventoryFactory);
    if (effect.inventoryB) u.inventoryB = Math.max(0, u.inventoryB + effect.inventoryB);
    if (effect.inventoryC) u.inventoryC = Math.max(0, u.inventoryC + effect.inventoryC);
    if (effect.oor) u.oor = Math.max(0, Math.min(100, u.oor + effect.oor));
    if (effect.doi) u.doi = Math.max(1, u.doi + effect.doi);
    if (effect.sanity) u.sanity = Math.max(0, Math.min(130, u.sanity + effect.sanity));
    return u;
  }, []);

  const buildResultText = useCallback((effect: Partial<PlayerState>): string => {
    const parts: string[] = [];
    if (effect.cash) parts.push(`💰 Cash ${effect.cash > 0 ? '+' : ''}${formatCash(effect.cash)}`);
    if (effect.sanity) parts.push(`🧠 血压 ${effect.sanity > 0 ? '+' : ''}${effect.sanity}`);
    if (effect.inventoryFactory) parts.push(`🏭 工厂 ${effect.inventoryFactory > 0 ? '+' : ''}${effect.inventoryFactory}`);
    if (effect.inventoryB) parts.push(`📦 B仓 ${effect.inventoryB > 0 ? '+' : ''}${effect.inventoryB}`);
    if (effect.inventoryC) parts.push(`📦 C仓 ${effect.inventoryC > 0 ? '+' : ''}${effect.inventoryC}`);
    if (effect.oor) parts.push(`🌐 现货率 ${effect.oor > 0 ? '+' : ''}${effect.oor}%`);
    if (effect.doi) parts.push(`📅 周转天数 ${effect.doi > 0 ? '+' : ''}${effect.doi}天`);
    return parts.join('\n') || '无变化';
  }, []);

  const checkGameOver = useCallback((p: PlayerState) => {
    if (p.sanity <= 0) {
      setGameOver(true);
      setMessage(`${bossName}，你的血压归零了…已紧急送医！Game Over!`);
      return true;
    }
    if (p.sanity >= 128) {
      setGameOver(true);
      setMessage(`${bossName}，血压飙到128！高血压危象，紧急送医！Game Over!`);
      return true;
    }
    if (p.sanity < 82 && p.sanity > 0) {
      setGameOver(true);
      setMessage(`${bossName}，血压过低(${p.sanity})！低血压休克，紧急送医！Game Over!`);
      return true;
    }
    if (p.cash <= 0) {
      setGameOver(true);
      setMessage(`${bossName}，资金链断裂！公司已破产…Game Over!`);
      return true;
    }
    return false;
  }, [bossName]);

  // Step-by-step walking animation
  const walkToTile = useCallback((startPos: number, steps: number, callback: (finalPos: number) => void) => {
    if (steps <= 0) {
      callback(startPos);
      return;
    }
    setIsWalking(true);
    const maxTile = 17;
    let currentStep = 0;

    const walkInterval = setInterval(() => {
      currentStep++;
      const nextPos = Math.min(startPos + currentStep, maxTile);
      setPlayer(prev => ({ ...prev, position: nextPos }));

      if (currentStep >= steps || nextPos >= maxTile) {
        clearInterval(walkInterval);
        setIsWalking(false);
        callback(nextPos);
      }
    }, 400);
  }, []);

  const doWalk = useCallback((startPos: number, steps: number) => {
    walkToTile(startPos, steps, (finalPos) => {
      const tile = BOARD_TILES[finalPos];
      setMessage(`${bossName}，到达「${tile.name}」`);

      setPlayer(prev => {
        const event = triggerLLMEvent(finalPos, prev);
        if (event.autoPass) {
          const afterEffect = applyEffect(event.autoEffect || {}, prev);
          if (event.autoEffect?.stuckTurns) {
            afterEffect.stuckTurns = (afterEffect.stuckTurns || 0) + event.autoEffect.stuckTurns;
          }
          if (event.autoEffect && Object.keys(event.autoEffect).length > 0) {
            const parts: string[] = [];
            parts.push(`📍 ${event.title}`);
            const display = { ...event.autoEffect };
            const stuck = display.stuckTurns;
            delete display.stuckTurns;
            if (Object.keys(display).length > 0) parts.push(buildResultText(display));
            if (stuck) parts.push(`⏳ 原地等待 ${stuck} 步`);
            if (parts.length > 0) setResultText(parts.join('\n'));
          }
          setMessage(`${bossName}，${tile.name}～ ${event.description}`);
          checkGameOver(afterEffect);
          return afterEffect;
        } else {
          setModalKey(k => k + 1);
          setCurrentEvent(event);
          return prev;
        }
      });
    });
  }, [walkToTile, bossName, applyEffect, buildResultText, checkGameOver]);

  const rollDice = useCallback(() => {
    if (isRolling || isWalking || currentEvent || subEvent || gameOver || playerRef.current.completed || resultText) return;

    setIsRolling(true);
    setDiceAnim('throwing');
    setMessage(`${bossName}，骰子滚动中...`);

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 15) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setDiceAnim('landed');

        setTimeout(() => {
          setDiceAnim('idle');
          setIsRolling(false);

          setPlayer(prev => ({ ...prev, totalRolls: prev.totalRolls + 1 }));

          const stuck = playerRef.current.stuckTurns;
          if (stuck > 0) {
            const consumed = Math.min(finalValue, stuck);
            const remaining = stuck - consumed;
            const movableSteps = finalValue - consumed;
            setPlayer(prev => ({ ...prev, stuckTurns: remaining }));

            if (movableSteps <= 0) {
              setMessage(`${bossName}，掷出了 ${finalValue}，原地等待消耗 ${consumed} 步${remaining > 0 ? `，还需等待 ${remaining} 步` : '，等待结束！'}`);
              return;
            }

            setMessage(`${bossName}，掷出了 ${finalValue}，消耗等待 ${consumed} 步，前进 ${movableSteps} 步！`);
            const startPos = playerRef.current.position;
            const maxTile = playerRef.current.hiddenRoute ? 17 : 16;
            const actualSteps = Math.min(movableSteps, maxTile - startPos);
            doWalk(startPos, actualSteps);
            return;
          }

          setMessage(`${bossName}，掷出了 ${finalValue}！前进中...`);

          const startPos = playerRef.current.position;
          const maxTile = playerRef.current.hiddenRoute ? 17 : 16;
          const actualSteps = Math.min(finalValue, maxTile - startPos);
          doWalk(startPos, actualSteps);
        }, 800);
      }
    }, 65);
  }, [isRolling, isWalking, currentEvent, subEvent, gameOver, resultText, bossName, doWalk]);

  const handleChoice = useCallback((choice: 'A' | 'B' | 'C') => {
    if (!currentEvent) return;
    const option: TileOption | undefined = choice === 'A' ? currentEvent.optionA : choice === 'B' ? currentEvent.optionB : currentEvent.optionC;
    if (!option) return;

    if (choice === 'A' && currentEvent.optionA?.subEvent) {
      setPlayer(prev => {
        const updated = applyEffect(option.effect, prev);
        checkGameOver(updated);
        return updated;
      });
      setResultText(`📍 ${currentEvent.title}\n\n${option.effectDescription}\n\n${buildResultText(option.effect)}`);
      setSubEvent(currentEvent.optionA.subEvent);
      setCurrentEvent(null);
      return;
    }

    if (option.stuckTurns) {
      setPlayer(prev => ({ ...prev, stuckTurns: option.stuckTurns! }));
      setMessage(`${bossName}，无待处理单据！原地停留 ${option.stuckTurns} 步`);
      setResultText(`📍 ${currentEvent.title}\n\n${option.effectDescription}\n\n⏳ 原地停留 ${option.stuckTurns} 步！`);
      setCurrentEvent(null);
      return;
    }

    if (option.triggerHidden) {
      setPlayer(prev => {
        const updated = applyEffect(option.effect, prev);
        return { ...updated, hiddenRoute: true, position: 17 };
      });
      setResultText(`📍 ${currentEvent.title}\n\n${option.effectDescription}\n\n${buildResultText(option.effect)}`);
      setCurrentEvent(null);
      setTimeout(() => {
        const event = triggerLLMEvent(17, player);
        setModalKey(k => k + 1);
        setCurrentEvent(event);
        setMessage(`${bossName}，触发隐藏关卡——清理滞销！`);
      }, 2000);
      return;
    }

    const isWinChoice = currentEvent.isWin && !option.triggerHidden;
    const isWinTile15 = currentEvent.isWin && player.position === 17;

    setPlayer(prev => {
      const updated = applyEffect(option.effect, prev);
      if (checkGameOver(updated)) return updated;
      if (isWinChoice || isWinTile15) {
        return { ...updated, completed: true };
      }
      return updated;
    });
    setResultText(`📍 ${currentEvent.title}\n\n${option.effectDescription}\n\n${buildResultText(option.effect)}`);
    setCurrentEvent(null);
  }, [currentEvent, bossName, applyEffect, checkGameOver, buildResultText, player]);

  const handleSubChoice = useCallback((choice: 'A' | 'B') => {
    if (!subEvent) return;
    const option = choice === 'A' ? subEvent.optionA : subEvent.optionB;
    setPlayer(prev => {
      const updated = applyEffect(option.effect, prev);
      checkGameOver(updated);
      return updated;
    });
    setResultText(`📍 ${subEvent.title}\n\n${option.effectDescription}\n\n${buildResultText(option.effect)}`);
    setSubEvent(null);
  }, [subEvent, applyEffect, checkGameOver, buildResultText]);

  if (!nickname) return <OnboardingScreen onStart={setNickname} />;
  if (player.completed && !resultText) return <WinScreen player={player} nickname={nickname} onRestart={restartGame} />;
  if (gameOver && !resultText) return <GameOverScreen player={player} nickname={nickname} onRestart={restartGame} />;

  // Build 5 rows × 6 cols grid for rectangle map
  const grid: (number | null)[][] = Array.from({ length: 5 }, () => Array(6).fill(null) as (number | null)[]);
  const maxTile = player.hiddenRoute ? 17 : 16;
  for (let i = 0; i <= maxTile; i++) {
    const pos = getTileGridPos(i);
    grid[pos.row][pos.col] = i;
  }

  return (
    <div className="game-screen">
      {/* Header */}
      <header className="g-header">
        <div className="g-title">BBCC Monopoly</div>
        <div className="g-info">
          <span className="g-boss">{bossName}</span>
        </div>
      </header>

      {/* Stats */}
      <div className="g-stats">
        <div className={`gs ${player.cash < 50000 ? 'gs-warn' : ''}`}>
          <span className="gs-icon">💰</span>
          <StatNum value={player.cash} format={formatCash} />
          <span className="gs-label">Cash</span>
        </div>
        <div className="gs">
          <span className="gs-icon">🏭</span>
          <StatNum value={player.inventoryFactory} />
          <span className="gs-label">工厂</span>
        </div>
        <div className="gs">
          <span className="gs-icon">📦</span>
          <StatNum value={player.inventoryB} />
          <span className="gs-label">B仓</span>
        </div>
        <div className="gs">
          <span className="gs-icon">📦</span>
          <StatNum value={player.inventoryC} />
          <span className="gs-label">C仓</span>
        </div>
        <div className={`gs ${player.oor > 20 ? 'gs-warn' : ''}`}>
          <span className="gs-icon">🌐</span>
          <StatNum value={player.oor} format={(v) => `${v.toFixed(1)}%`} />
          <span className="gs-label">现货率</span>
        </div>
        <div className="gs">
          <span className="gs-icon">📅</span>
          <StatNum value={player.doi} />
          <span className="gs-label">周转</span>
        </div>
        <div className={`gs ${player.sanity < 30 ? 'gs-warn' : ''}`}>
          <span className="gs-icon">🧠</span>
          <StatNum value={player.sanity} />
          <span className="gs-label">血压</span>
        </div>
      </div>

      {/* Message */}
      <div className="g-msg">{message}</div>

      {/* Square board map */}
      <div className="g-board-area" ref={boardRef}>
        {/* Starting position: person standing before the board */}
        {player.position === -1 && (
          <div className="start-person">
            <div className="kitty-char idle">
              <div className="kt-afro" />
              <div className="kt-head">
                <div className="kt-bow" />
                <div className="kt-eye kt-eye-l" />
                <div className="kt-eye kt-eye-r" />
                <div className="kt-nose" />
                <div className="kt-whisker kt-wh-l" />
                <div className="kt-whisker kt-wh-r" />
              </div>
              <div className="kt-body">
                <div className="kt-heart" />
              </div>
              <div className="kt-leg kt-leg-l" />
              <div className="kt-leg kt-leg-r" />
            </div>
            <div className="start-label">准备出发</div>
          </div>
        )}
        <div className="board-grid-square">
          {grid.map((row, r) =>
            row.map((tileId, c) => {
              // Center cell: put dice + roll button here
              if (r === 2 && c === 3 && tileId === null) {
                return (
                  <div key={`${r}-${c}`} className="tile-cell center-controls">
                    <div className={`dice ${isRolling ? 'dice-roll' : ''}`}>
                      <DiceFace value={diceValue} size={44} />
                    </div>
                    {!gameOver ? (
                      <button
                        className="roll-btn-center"
                        onClick={rollDice}
                        disabled={isRolling || isWalking || !!currentEvent || !!subEvent || !!resultText}
                      >
                        {playerRef.current.stuckTurns > 0 ? `扣${playerRef.current.stuckTurns}步` : isRolling ? '...' : isWalking ? '移动中' : '掷骰子'}
                      </button>
                    ) : (
                      <button className="roll-btn-center restart" onClick={restartGame}>重来</button>
                    )}
                  </div>
                );
              }
              if (tileId === null) {
                return <div key={`${r}-${c}`} className="tile-cell empty" />;
              }
              const tile = BOARD_TILES[tileId];
              const isCurrent = tileId === player.position;
              const isPast = tileId < player.position;
              const isFuture = tileId > player.position;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`tile-cell ${isCurrent ? 'tile-current' : ''} ${isPast ? 'tile-past tile-trail' : ''} ${isFuture ? 'tile-future' : ''} tile-cat-${tile.category}`}
                >
                  <div className="tile-inner">
                    {isCurrent && <div className="tile-pulse-ring" />}
                    {isCurrent && (
                      <div className={`kitty-char ${isWalking ? 'walking' : 'idle'}`}>
                        <div className="kt-afro" />
                        <div className="kt-head">
                          <div className="kt-bow" />
                          <div className="kt-eye kt-eye-l" />
                          <div className="kt-eye kt-eye-r" />
                          <div className="kt-nose" />
                          <div className="kt-whisker kt-wh-l" />
                          <div className="kt-whisker kt-wh-r" />
                        </div>
                        <div className="kt-body">
                          <div className="kt-heart" />
                        </div>
                        <div className="kt-leg kt-leg-l" />
                        <div className="kt-leg kt-leg-r" />
                      </div>
                    )}
                    <span className="tile-emoji-icon">{tile.emoji}</span>
                    <span className="tile-name-text">{tile.name}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dice throw animation overlay */}
      {diceAnim !== 'idle' && (
        <div className="dice-overlay">
          <div className={`dice-3d ${diceAnim === 'throwing' ? 'dice-throwing' : 'dice-landed'}`}>
            <DiceFace value={diceValue} size={100} />
          </div>
        </div>
      )}

      {/* Event modal — NO effectDescription shown */}
      {currentEvent && !subEvent && !resultText && (
        <div className="modal-bg">
          <div key={modalKey} className="modal modal-bounce">
            <h2 className="modal-title modal-title-pop">{currentEvent.title}</h2>
            <p className="modal-desc">{currentEvent.description}</p>
            <div className="modal-btns">
              {currentEvent.optionA && (
                <button className="choice-btn choice-fly" style={{ animationDelay: '0.05s' }} onClick={() => handleChoice('A')}>
                  {currentEvent.optionA.label}
                </button>
              )}
              {currentEvent.optionB && (
                <button className="choice-btn choice-fly" style={{ animationDelay: '0.15s' }} onClick={() => handleChoice('B')}>
                  {currentEvent.optionB.label}
                </button>
              )}
              {currentEvent.optionC && (
                <button className="choice-btn choice-fly" style={{ animationDelay: '0.25s' }} onClick={() => handleChoice('C')}>
                  {currentEvent.optionC.label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-event modal */}
      {subEvent && !resultText && (
        <div className="modal-bg">
          <div className="modal modal-bounce">
            <h2 className="modal-title modal-title-pop">{subEvent.title}</h2>
            <p className="modal-desc">{subEvent.description}</p>
            <div className="modal-btns">
              <button className="choice-btn choice-fly" style={{ animationDelay: '0.05s' }} onClick={() => handleSubChoice('A')}>
                {subEvent.optionA.label}
              </button>
              <button className="choice-btn choice-fly" style={{ animationDelay: '0.15s' }} onClick={() => handleSubChoice('B')}>
                {subEvent.optionB.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result modal — shown AFTER choice */}
      {resultText && (
        <ResultModal text={resultText} onClose={() => setResultText(null)} />
      )}
    </div>
  );
}

