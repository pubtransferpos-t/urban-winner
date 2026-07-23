import { useState } from 'react';
import { useLocation } from 'wouter';
import { GameSettings, DEFAULT_SETTINGS } from '@/hooks/use-gambit';
import { EFFECTS, EffectType } from '@/hooks/gambit-engine';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Simple module-level store so game settings survive navigation
let _settings: GameSettings = { ...DEFAULT_SETTINGS };
export function getGameSettings(): GameSettings {
  return _settings;
}

const MODES: { id: GameSettings['mode']; label: string; desc: string }[] = [
  { id: 'bot',          label: '⚡ vs Bot',      desc: 'Play against an AI opponent' },
  { id: 'pass-and-play',label: '👥 Pass & Play',  desc: 'Two players, one device' },
  { id: 'custom',       label: '⚙️ Custom',       desc: 'Configure your own rules' },
  { id: 'online',       label: '🌐 Online',       desc: 'Play with a friend online' },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useState<GameSettings>({ ..._settings });
  const [showEffects, setShowEffects] = useState(false);

  const startGame = () => {
    _settings = settings;
    setLocation('/game');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-7">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-6xl font-black tracking-tight text-amber-400 font-serif">GAMBIT</h1>
          <p className="mt-1 text-gray-400 text-base">Chess, but chaos.</p>
        </div>

        {/* Mode selection */}
        <div className="grid grid-cols-2 gap-3">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setSettings(s => ({ ...s, mode: mode.id }))}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                settings.mode === mode.id
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              }`}
            >
              <div className="font-semibold text-sm">{mode.label}</div>
              <div className="text-xs text-gray-400 mt-1">{mode.desc}</div>
            </button>
          ))}
        </div>

        {/* Settings panel */}
        <div className="bg-gray-900 rounded-xl p-5 space-y-5">

          {/* Bot difficulty */}
          {settings.mode === 'bot' && (
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-300">Bot difficulty</Label>
              <Select
                value={settings.botDifficulty}
                onValueChange={v =>
                  setSettings(s => ({ ...s, botDifficulty: v as GameSettings['botDifficulty'] }))
                }
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Player color */}
          {settings.mode === 'bot' && (
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-300">Play as</Label>
              <Select
                value={settings.playerColor}
                onValueChange={v =>
                  setSettings(s => ({ ...s, playerColor: v as GameSettings['playerColor'] }))
                }
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="w">White</SelectItem>
                  <SelectItem value="b">Black</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Spin interval */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-300">Spin every</Label>
              <span className="text-sm text-amber-400 font-mono tabular-nums">
                {settings.spinInterval} moves
              </span>
            </div>
            <Slider
              min={3}
              max={10}
              step={1}
              value={[settings.spinInterval]}
              onValueChange={([v]) => setSettings(s => ({ ...s, spinInterval: v }))}
            />
          </div>

          {/* Custom effects toggle */}
          {settings.mode === 'custom' && (
            <div>
              <button
                onClick={() => setShowEffects(v => !v)}
                className="text-sm text-amber-400 hover:underline"
              >
                {showEffects ? '▲ Hide' : '▼ Customize'} effects&nbsp;
                <span className="text-gray-500">({settings.enabledEffects.length} active)</span>
              </button>

              {showEffects && (
                <div className="mt-3 grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {(Object.entries(EFFECTS) as [EffectType, (typeof EFFECTS)[EffectType]][]).map(
                    ([id, def]) => (
                      <label key={id} className="flex items-center gap-2 cursor-pointer">
                        <Switch
                          checked={settings.enabledEffects.includes(id)}
                          onCheckedChange={checked =>
                            setSettings(s => ({
                              ...s,
                              enabledEffects: checked
                                ? [...s.enabledEffects, id]
                                : s.enabledEffects.filter(e => e !== id),
                            }))
                          }
                        />
                        <span
                          className={`text-xs truncate ${
                            def.category === 'buff' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {def.label}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

          {/* Online worker URL */}
          {settings.mode === 'online' && (
            <div className="space-y-1">
              <Label className="text-sm text-gray-300">Cloudflare Worker URL</Label>
              <input
                type="url"
                placeholder="https://gambit-chess.yourname.workers.dev"
                defaultValue={localStorage.getItem('gambit_worker_url') ?? ''}
                onChange={e => localStorage.setItem('gambit_worker_url', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400"
              />
              <p className="text-xs text-gray-500">
                Deploy the Worker first — see <code>worker/README.md</code>
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={startGame}
          className="w-full h-14 text-lg font-bold bg-amber-400 hover:bg-amber-300 text-gray-900"
        >
          Start Game
        </Button>
      </div>
    </div>
  );
}
