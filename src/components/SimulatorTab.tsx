import React, { useState, useEffect, useRef } from "react";
import { Check, ShieldAlert, RotateCcw, AlertOctagon, HelpCircle, Power, Zap, MessageSquare } from "lucide-react";

export default function SimulatorTab() {
  const [angle, setAngle] = useState(0); // Current tilt angle in degrees (0 - 60)
  const [calibrationOffset, setCalibrationOffset] = useState(0); // Calibration offset
  const [isRunning, setIsRunning] = useState(true); // Device on/off
  const [timer, setTimer] = useState(10); // Countdown timer in seconds
  const [isVibrating, setIsVibrating] = useState(false); // Vibration motor state
  const [lineNotified, setLineNotified] = useState(false); // Has sent simulated LINE message
  const [showLineToast, setShowLineToast] = useState(false); // Show the pop-up LINE notification
  const [fastForward, setFastForward] = useState(false); // Fast forward timer for testing

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate adjusted angle based on calibration baseline
  const relativeAngle = Math.max(0, Math.min(60, angle - calibrationOffset));

  // Piecewise interpolation for cervical weight (from slide 2 metadata)
  const getCervicalWeight = (deg: number) => {
    if (deg <= 0) return 5.0;
    if (deg >= 60) return 27.0;
    
    // Key-points: (0, 5), (15, 12), (30, 18), (45, 22), (60, 27)
    if (deg < 15) {
      return 5.0 + (12.0 - 5.0) * (deg / 15.0);
    } else if (deg < 30) {
      return 12.0 + (18.0 - 12.0) * ((deg - 15.0) / 15.0);
    } else if (deg < 45) {
      return 18.0 + (22.0 - 18.0) * ((deg - 30.0) / 15.0);
    } else {
      return 22.0 + (27.0 - 22.0) * ((deg - 45.0) / 15.0);
    }
  };

  const currentWeightKg = getCervicalWeight(relativeAngle);
  const currentWeightLbs = currentWeightKg * 2.20462;

  // Posture evaluation threshold
  const isPosturingBad = relativeAngle >= 15;

  // Posture category & text color
  const getPostureStatus = () => {
    if (!isRunning) return { label: "ปิดเครื่อง", desc: "สวิตช์ปิดระบบอยู่", color: "text-slate-400 bg-slate-100 border-slate-200" };
    if (relativeAngle < 15) {
      return { label: "ดีเยี่ยม (Excellent)", desc: "แรงกดที่กระดูกคอน้อย สุขภาพดีมาก", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    }
    if (!isVibrating) {
      return { label: "เริ่มก้มศีรษะ (Warning)", desc: "เริ่มรับแรงกดเพิ่มขึ้น กำลังนับเวลาถอยหลัง...", color: "text-amber-700 bg-amber-50 border-amber-200" };
    }
    return { label: "อันตรายต่อต้นคอ (Danger!)", desc: "ก้มคอแช่นานเกิน 10 วินาที มอเตอร์สั่นทำงาน!", color: "text-rose-700 bg-rose-50 border-rose-200 animate-pulse" };
  };

  const status = getPostureStatus();

  // Reset calibration
  const handleCalibrate = () => {
    setCalibrationOffset(angle);
    setTimer(10);
    setIsVibrating(false);
    setLineNotified(false);
    setShowLineToast(false);
  };

  const handleResetCalibration = () => {
    setCalibrationOffset(0);
    setTimer(10);
    setIsVibrating(false);
    setLineNotified(false);
    setShowLineToast(false);
  };

  // Timer logic for posture warning
  useEffect(() => {
    if (!isRunning) {
      setIsVibrating(false);
      setTimer(10);
      setLineNotified(false);
      setShowLineToast(false);
      return;
    }

    if (isPosturingBad) {
      // Countdown
      if (timer > 0) {
        const intervalTime = fastForward ? 150 : 1000; // Faster tick if fast forward enabled
        timerRef.current = setTimeout(() => {
          setTimer((t) => Math.max(0, t - 1));
        }, intervalTime);
      } else {
        // Trigger vibration warning
        setIsVibrating(true);
        if (!lineNotified) {
          setLineNotified(true);
          setShowLineToast(true);
          // Auto close LINE Notify toast after 6 seconds
          setTimeout(() => setShowLineToast(false), 6000);
        }
      }
    } else {
      // Safe state, reset timers & warning
      setIsVibrating(false);
      setTimer(10);
      setLineNotified(false);
      setShowLineToast(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [relativeAngle, isPosturingBad, timer, isRunning, fastForward, lineNotified]);

  // CSS injection for shake animation
  useEffect(() => {
    const styleId = "vibration-animation-style";
    let style = document.getElementById(styleId) as HTMLStyleElement;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(0px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          75% { transform: translate(2px, 1px) rotate(-1deg); }
          90% { transform: translate(-1px, -1px) rotate(1deg); }
          100% { transform: translate(1px, -2px) rotate(0deg); }
        }
        .vibrating-canvas {
          animation: shake 0.3s infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="simulator-tab-container">
      {/* Simulation Workspace Panel */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {/* Animated head & spine visualizer canvas */}
        <div 
          className={`relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 overflow-hidden border border-slate-800 transition-all duration-300 h-[380px] flex flex-col justify-between ${
            isVibrating ? "vibrating-canvas border-red-500/50 shadow-lg shadow-red-500/10" : ""
          }`}
          id="simulator-canvas"
        >
          {/* Status Header inside the canvas */}
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center space-x-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                !isRunning ? "bg-slate-500" : isVibrating ? "bg-rose-500 animate-ping" : "bg-emerald-500 animate-pulse"
              }`} />
              <span className="text-xs font-mono text-slate-400">
                {!isRunning ? "OFFLINE" : isVibrating ? "ALERT SYSTEM ACTIVE!" : "SENSOR CONNECTED (16Hz)"}
              </span>
            </div>

            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                isRunning 
                  ? "bg-rose-950/50 text-rose-400 border border-rose-800/50 hover:bg-rose-900/40" 
                  : "bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/40"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isRunning ? "สไลด์ปิดระบบ" : "เปิดสวิตช์อุปกรณ์"}</span>
            </button>
          </div>

          {/* SVG representation of the neck angle and pressure weight */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <svg viewBox="0 0 400 300" className="w-full max-w-[400px] h-full opacity-90">
              {/* Reference Gridlines */}
              <line x1="200" y1="50" x2="200" y2="250" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="100" y1="180" x2="300" y2="180" stroke="#1e293b" strokeDasharray="3,3" />
              
              {/* Normal Baseline angle helper */}
              <line 
                x1="200" 
                y1="130" 
                x2="200" 
                y2="50" 
                stroke={isPosturingBad ? "#94a3b8" : "#10b981"} 
                strokeWidth="1.5" 
                strokeDasharray="4,4" 
              />

              {/* Dynamic Neck Tilt Angle line helper */}
              {isRunning && (
                <line 
                  x1="200" 
                  y1="130" 
                  // Math to rotate based on tilt relativeAngle (from vertial axis)
                  x2={200 + 80 * Math.sin((relativeAngle * Math.PI) / 180)}
                  y2={130 - 80 * Math.cos((relativeAngle * Math.PI) / 180)}
                  stroke={isPosturingBad ? "#f43f5e" : "#10b981"}
                  strokeWidth="3"
                />
              )}

              {/* Head Outline (drawn at the end of the tilt line) */}
              {/* xCenter: 200 + 80 * sin(rad), yCenter: 130 - 80 * cos(rad) */}
              {isRunning ? (
                <g transform={`translate(${200 + 85 * Math.sin((relativeAngle * Math.PI) / 180)}, ${130 - 85 * Math.cos((relativeAngle * Math.PI) / 180)}) rotate(${relativeAngle})`}>
                  {/* Eyeglasses structure with MPU6050 attached */}
                  <line x1="0" y1="-5" x2="-25" y2="-5" stroke="#475569" strokeWidth="2" />
                  <rect x="-35" y="-12" width="10" height="12" rx="2" fill="none" stroke="#475569" strokeWidth="2" />
                  {/* MPU6050 Blue module visual representation on temple */}
                  <rect x="-24" y="-11" width="12" height="6" rx="1" fill="#0284c7" />
                  <circle cx="-18" cy="-8" r="1.5" fill="#facc15" /> {/* sensor IC */}
                  
                  {/* Face Profile Head shape */}
                  <circle cx="0" cy="0" r="30" fill="#334155" />
                  <path d="M 12 -5 Q 26 -5 22 15 Q 18 25 5 22" fill="#334155" stroke="#475569" strokeWidth="1" /> {/* jaw/nose */}
                  
                  {/* Brain visual overlay */}
                  <circle cx="-5" cy="-8" r="22" fill="#1e293b" opacity="0.6" />
                  
                  {/* Dynamic eye */}
                  <circle cx="15" cy="-5" r="2.5" fill={isPosturingBad ? "#ef4444" : "#10b981"} />
                </g>
              ) : (
                <g transform="translate(200, 45)">
                  <circle cx="0" cy="85" r="30" fill="#1e293b" />
                  <text x="0" y="90" fill="#64748b" textAnchor="middle" className="text-[10px] font-mono">OFF</text>
                </g>
              )}

              {/* Spine/Back Support Structure */}
              {/* Base body anchor */}
              <circle cx="200" cy="205" r="12" fill="#475569" />
              {/* Cervical vertebrae chain */}
              {/* Vert 1 */}
              <circle cx="200" cy="180" r="8" fill={isPosturingBad ? "#fda4af" : "#cbd5e1"} stroke={isPosturingBad ? "#f43f5e" : "#475569"} />
              {/* Vert 2 */}
              <circle cx="200" cy="155" r="8" fill={isPosturingBad ? "#f43f5e" : "#cbd5e1"} stroke={isPosturingBad ? "#e11d48" : "#475569"} />
              {/* Vert 3 at neck joint */}
              <circle cx="200" cy="130" r="8" fill={isPosturingBad ? "#e11d48 animate-pulse" : "#94a3b8"} stroke={isPosturingBad ? "#be123c" : "#334155"} />

              {/* Angle Arc Indicator */}
              {relativeAngle > 5 && isRunning && (
                <path 
                  d={`M 200,80 A 50,50 0 0,1 ${200 + 50 * Math.sin((relativeAngle * Math.PI) / 180)},${130 - 50 * Math.cos((relativeAngle * Math.PI) / 180)}`}
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="2" 
                />
              )}
            </svg>
          </div>

          {/* Real-time statistics overlaid inside the slate panel */}
          <div className="flex justify-between items-end z-10 pt-24">
            <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider">แรงกดที่กระดูกคอ</span>
              <span className="text-2xl font-bold font-mono text-amber-500">
                {currentWeightKg.toFixed(1)} <span className="text-xs">กก.</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                (~{currentWeightLbs.toFixed(1)} ปอนด์)
              </span>
            </div>

            {/* Simulated LEDs block */}
            <div className="flex space-x-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <div className="flex flex-col items-center">
                <div className={`w-5.5 h-5.5 rounded-full border border-slate-700 shadow-md transition-all ${
                  isRunning && !isVibrating ? "bg-emerald-500 shadow-emerald-500/40 scale-105" : "bg-emerald-950 text-slate-700"
                }`} />
                <span className="text-[9px] text-slate-400 font-mono mt-1">LED เขียว</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-5.5 h-5.5 rounded-full border border-slate-700 shadow-md transition-all ${
                  isRunning && isVibrating ? "bg-red-500 animate-ping shadow-red-500/50 scale-105" : "bg-red-950 text-slate-700"
                }`} />
                <span className="text-[9px] text-slate-400 font-mono mt-1">LED แดง</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-5.5 h-5.5 rounded-full border border-slate-700 shadow-md transition-all ${
                  isRunning && isVibrating ? "bg-amber-500 animate-bounce" : "bg-amber-950 text-slate-700"
                }`} />
                <span className="text-[9px] text-slate-400 font-mono mt-1">มอเตอร์สั่น</span>
              </div>
            </div>
          </div>

          {/* LINE Notify Simulated Toast overlay inside the canvas */}
          {showLineToast && isRunning && (
            <div className="absolute top-14 left-4 right-4 bg-[#212121] border border-[#2d2d2d] rounded-2xl p-3.5 shadow-xl flex items-start space-x-3 animate-bounce z-40 max-w-sm mx-auto">
              <div className="bg-[#00c300] p-1.5 rounded-xl text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">LINE Notify</span>
                  <span className="text-[10px] text-slate-500 font-mono">เมื่อสักครู่</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-normal truncate">
                  🚨 แจ้งเตือน: คุณก้มศีรษะนานเกิน 10 วินาทีแล้ว! กรุณาตั้งตัวตรงรักษาสุขภาพ
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Posture status alert footer block */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${status.color}`}>
          <div className="flex items-center space-x-3">
            {isVibrating ? (
              <AlertOctagon className="w-6 h-6 text-rose-500 shrink-0 animate-bounce" />
            ) : isPosturingBad ? (
              <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
            ) : (
              <Check className="w-6 h-6 text-emerald-500 shrink-0" />
            )}
            <div>
              <h4 className="font-semibold text-sm">{status.label}</h4>
              <p className="text-xs opacity-90">{status.desc}</p>
            </div>
          </div>
          {isPosturingBad && !isVibrating && isRunning && (
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase block tracking-wider opacity-65">จะเตือนในอีก</span>
              <span className="text-xl font-bold font-mono text-slate-800">{timer}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Control sliders & Calibration Panel */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Zap className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">แผงจำลองการตั้งท่าก้ม</h3>
          </div>

          {/* Head Tilt Angle slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="font-semibold">องศาการก้มศีรษะ (จริง)</span>
              <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{angle}°</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="60" 
              value={angle}
              disabled={!isRunning}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0° (มองตรง)</span>
              <span>30° (กลาง)</span>
              <span>60° (ก้มสุดตัว)</span>
            </div>
          </div>

          {/* Relative angle indicator after calibration */}
          {calibrationOffset > 0 && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">หักลบ Baseline ที่ Calibrate</span>
                <span className="font-semibold text-slate-800">มุมวัดจริงสะสมสัมพัทธ์:</span>
              </div>
              <span className="text-sm font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                {relativeAngle}°
              </span>
            </div>
          )}

          {/* Simulation testing tools (Fast forward, reset) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ตัวช่วยทดสอบระบบ</h4>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">สปีดจำลองลดเวลาถอยหลัง</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={fastForward}
                  onChange={(e) => setFastForward(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCalibrate}
                disabled={!isRunning}
                className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Calibrate {angle}°</span>
              </button>

              <button
                onClick={handleResetCalibration}
                disabled={calibrationOffset === 0 || !isRunning}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                <span>รีเซ็ต Calibrate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Explain the Calibration & Weight concepts to the students */}
        <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl flex items-start space-x-2.5">
          <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed font-sans">
            <strong className="font-semibold block mb-1">ทำไมต้องมีปุ่ม Calibrate?</strong>
            ในระบบอุปกรณ์ป้องกัน Text Neck Syndrome ที่นักเรียนกลุ่ม 310 ม.2/3 ออกแบบ ตัวบอร์ด <strong className="font-semibold">MPU6050</strong> จะถูกสวมติดแว่นตา ซึ่งเวลาสวมใส่มุมเริ่มต้นอาจเอียงไม่ตรงกับ 0 องศาแท้จริง การกด <strong className="font-semibold">Calibrate (หรือเขียนโค้ดตั้ง Baseline)</strong> จะเป็นการจดจำองศาเริ่มต้นที่แว่นตานั้นสวมอยู่ ให้กลายเป็น 0° และคำนวณหามุมก้มที่สัมพัทธ์กับการก้มคอจริง ถือเป็นทริคทางวิศวกรรมที่ทำให้เซนเซอร์ใช้งานได้สม่ำเสมอยิ่งขึ้นครับ!
          </div>
        </div>
      </div>
    </div>
  );
}
