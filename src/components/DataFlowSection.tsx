import React, { useState } from "react";
import { ArrowRight, Cpu, Radio, ShieldAlert, Wifi, Bell, MessageSquare, Sparkles } from "lucide-react";

export default function DataFlowSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: "1. การป้อนข้อมูล (Input Module)",
      device: "เซนเซอร์ MPU6050",
      description: "วัดค่าความเร่ง (Accelerometer) และความเร็วเชิงมุม (Gyroscope) แบบเรียลไทม์ 3 แกนหลัก เพื่อนำมาคำนวณหามุมก้มคอ (Pitch Angle) สัมพัทธ์",
      connection: "สายสัญญาณ I2C (SDA/SCL) 400kHz",
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50/70 border-blue-100",
      shadowColor: "shadow-blue-100",
    },
    {
      id: 2,
      title: "2. การประมวลผล (Processor)",
      device: "ชิปไมโครคอนโทรลเลอร์ ESP32",
      description: "รับสัญญาณดิจิตอล นำมาหาความเอียงเทียบกับตารางคาลิเบรต คอยควบคุมเกณฑ์ความปลอดภัย 15 องศา และตั้งเวลาเตือน 10 วินาที",
      connection: "ตรรกะโปรแกรม (Logic Controller)",
      color: "from-indigo-600 to-violet-600",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50/70 border-indigo-100",
      shadowColor: "shadow-indigo-100",
    },
    {
      id: 3,
      title: "3. ระบบส่งออกและสั่งการ (Outputs)",
      device: "การแจ้งเตือนพหุรูปแบบ (Multi-Alerts)",
      description: "สั่งงานมอเตอร์สั่นที่ต้นคอหรือเอวให้สั่นสะกิด, สลับไฟ LED สีแดงเตือน, และสั่งให้การ์ด Wi-Fi ยิง API แจ้งเตือนตรงไปยังระบบ LINE Notify ของผู้ใช้ทันที",
      connection: "WiFi & สัญญาณไฟ GPIO เอาต์พุต",
      color: "from-rose-500 to-amber-500",
      textColor: "text-rose-600",
      bgColor: "bg-rose-50/70 border-rose-100",
      shadowColor: "shadow-rose-100",
    }
  ];

  return (
    <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6" id="data-flow-diagram-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>สถาปัตยกรรมระบบ (System Architecture)</span>
          </div>
          <h3 className="font-bold text-slate-800 text-xl mt-1">แผนผังจำลองการไหลของข้อมูล (Data Flow Diagram)</h3>
          <p className="text-xs text-slate-500">ทำความเข้าใจการเชื่อมโยงข้อมูลจากสิ่งแวดล้อมจริง แปลงเป็นพลังงานไฟ และส่งข้อความรายงานเข้าโลกออนไลน์</p>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          📍 ข้อมูลอัปเดตความถี่: 16 ครั้งต่อวินาที (16Hz)
        </div>
      </div>

      {/* Interactive Desktop Diagram Layout */}
      <div className="relative py-6 hidden lg:block">
        <div className="absolute top-[48%] left-[10%] right-[10%] h-0.5 bg-dashed border-t border-dashed border-slate-200 -z-10" />
        
        <div className="grid grid-cols-3 gap-8 relative z-10">
          {steps.map((s) => {
            const isHovered = activeStep === s.id;
            return (
              <div
                key={s.id}
                onMouseEnter={() => setActiveStep(s.id)}
                onMouseLeave={() => setActiveStep(null)}
                className={`p-6 rounded-2xl border transition-all duration-300 bg-white cursor-help ${
                  isHovered 
                    ? "border-indigo-500 shadow-xl shadow-indigo-50/50 -translate-y-1.5" 
                    : "border-slate-100 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${s.color}`}>
                    {s.title}
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-bold">#0{s.id}</span>
                </div>

                <h4 className="font-bold text-slate-800 text-base mb-1.5">{s.device}</h4>
                <p className="text-xs text-slate-500 leading-relaxed min-h-[64px]">{s.description}</p>
                
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">ตัวกลางส่งสัญญาณ:</span>
                  <span className="text-[10px] font-mono font-bold bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md">
                    {s.connection}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic arrows indicating data flow in desktop */}
        <div className="absolute top-[48%] left-[29.5%] z-20">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm animate-pulse">
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="absolute top-[48%] left-[63.5%] z-20">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm animate-pulse">
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Beautiful visual flowchart for smaller mobile devices & fallback */}
      <div className="block lg:hidden space-y-4">
        {steps.map((s, idx) => (
          <div key={s.id} className="space-y-3">
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shrink-0 font-mono font-bold text-lg`}>
                {s.id}
              </div>
              <div className="space-y-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${s.textColor}`}>
                  {s.title}
                </span>
                <h4 className="font-bold text-slate-800 text-sm">{s.device}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                <div className="pt-2 text-[10px] text-slate-400 font-mono">
                  <strong>การรับส่ง:</strong> {s.connection}
                </div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detailed Node Connections and Pin Map block */}
      <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-indigo-300 pb-2 border-b border-slate-800">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-4 h-4" />
            <span>ตารางจำลองพินทางเทคนิค (Wiring Signals Path)</span>
          </span>
          <span className="text-emerald-400 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
            <span>กำลังส่งกระแสไฟฟ้า</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block mb-1">🔌 สายส่งไฟ VCC/GND:</span>
            <p className="text-white font-mono font-medium leading-relaxed">
              [MPU6050 VCC] → 3.3V <br />
              [MPU6050 GND] → GND <br />
              [LED / Motor GND] → GND
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block mb-1">📬 สัญญาณ I2C (SDA/SCL):</span>
            <p className="text-white font-mono font-medium leading-relaxed">
              [SDA Data] → ESP32 GPIO 21 <br />
              [SCL Clock] → ESP32 GPIO 22 <br />
              *ใช้อัตราสปีด 115200 bps
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block mb-1">🔔 สัญญาณเตือน (Alert Outputs):</span>
            <p className="text-white font-mono font-medium leading-relaxed">
              [สั่นควบคุม] → ESP32 GPIO 13 <br />
              [ไฟปกติเขียว] → ESP32 GPIO 14 <br />
              [ไฟเตือนแดง] → ESP32 GPIO 12
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
