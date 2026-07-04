import React, { useState } from "react";
import { Equipment } from "../types";
import { Check, Info, Cpu, Radio, ShieldAlert, Battery, ToggleLeft, Layers, Zap } from "lucide-react";

const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: "esp32",
    name: "ESP32 DevKit C",
    thName: "บอร์ดไมโครคอนโทรลเลอร์ ESP32",
    icon: "cpu",
    description: "The main brain of the device. Handles sensor reading, timing, LEDs, motor triggering, and Wi-Fi transmission.",
    thDescription: "สมองกลหลักของอุปกรณ์ ทำหน้าที่อ่านค่ามุมจากเซนเซอร์ ควบคุมการสั่น แจ้งเตือนผ่านไฟ LED และส่งข้อความเข้า LINE ผ่าน Wi-Fi",
    roleInProject: "ควบคุมและประมวลผลมุมก้มของศีรษะ เมื่อครบ 10 วินาทีจะสั่งมอเตอร์สั่นและต่อเน็ตส่ง LINE",
    pins: [
      { pin: "3V3", function: "แหล่งจ่ายไฟเลี้ยงบอร์ด 3.3V ให้ MPU6050" },
      { pin: "GND", function: "กราวด์ร่วมของทั้งระบบ" },
      { pin: "D21 (SDA)", function: "เชื่อมต่อขาข้อมูล I2C SDA ของ MPU6050" },
      { pin: "D22 (SCL)", function: "เชื่อมต่อขาเวลา I2C SCL ของ MPU6050" },
      { pin: "D13", function: "ขาสัญญาณควบคุมมอเตอร์สั่น (Vibration Motor)" },
      { pin: "D12", function: "ขาสัญญาณควบคุม LED สีแดง (แจ้งเตือน)" },
      { pin: "D14", function: "ขาสัญญาณควบคุม LED สีเขียว (ปกติ)" }
    ],
    specs: [
      "ใช้ชิป ESP32-WROOM-32",
      "มี Wi-Fi ในตัว (2.4GHz) และ Bluetooth",
      "แรงดันไฟทำงาน 3.3V (รับไฟเข้าทางขา Vin ได้ 5V)",
      "สวิตช์ EN (Reset) และ BOOT ในตัว"
    ]
  },
  {
    id: "mpu6050",
    name: "MPU6050 (6-Axis IMU)",
    thName: "เซนเซอร์วัดความเอียง MPU6050",
    icon: "gyro",
    description: "Combines a 3-axis accelerometer and 3-axis gyroscope to measure tilt angles accurately.",
    thDescription: "เซนเซอร์วัดความเร่งและมุมหมุนแบบ 6 แกน ใช้คำนวณองศาการก้มคอ (Pitch Angle) ได้อย่างแม่นยำ",
    roleInProject: "หนีบเข้ากับขาแว่นตา เพื่อวัดว่าศีรษะก้มกี่องศาเทียบกับแนวราบ",
    pins: [
      { pin: "VCC", function: "รับไฟเลี้ยง 3.3V - 5V" },
      { pin: "GND", function: "ต่อลงกราวด์ร่วม" },
      { pin: "SDA", function: "ส่งข้อมูลแนวราบ I2C Data -> ต่อเข้า ESP32 D21" },
      { pin: "SCL", function: "สัญญาณนาฬิกา I2C Clock -> ต่อเข้า ESP32 D22" }
    ],
    specs: [
      "ช่วงวัดความเร่ง: ±2g, ±4g, ±8g, ±16g",
      "ช่วงวัดมุมหมุน: ±250, ±500, ±1000, ±2000 °/s",
      "ใช้โปรโตคอลสื่อสารแบบ I2C"
    ]
  },
  {
    id: "vibration_motor",
    name: "Coin Vibration Motor",
    thName: "มอเตอร์สั่นแบบเหรียญ (Vibration Motor)",
    icon: "vibe",
    description: "Compact flat motor that produces physical vibration feedback when powered.",
    thDescription: "มอเตอร์สั่นขนาดเล็กกะทัดรัดคล้ายเหรียญ สั่นสะเทือนเมื่อมีกระแสไฟฟ้าผ่านเพื่อเตือนผู้ใช้",
    roleInProject: "ติดไว้ที่ขอบกางเกงเพื่อสั่นสะเทือนเตือนเบาๆ ที่เอวเมื่อก้มคอเกิน 15 องศานานเกิน 10 วินาที",
    pins: [
      { pin: "สายสีแดง (+)", function: "ขั้วบวก รับสัญญาณไฟควบคุมจากบอร์ดผ่านทรานซิสเตอร์หรือต่อตรงเข้าขา GPIO 13" },
      { pin: "สายสีน้ำเงิน/ดำ (-)", function: "ขั้วลบ ต่อเข้ากราวด์ร่วม (GND)" }
    ],
    specs: [
      "แรงดันไฟทำงาน: 2.5V - 4.0V",
      "กระแสไฟทำงานสูงสุด: ~90mA",
      "ขนาดเส้นผ่านศูนย์กลาง: 10 มม."
    ]
  },
  {
    id: "tp4056",
    name: "TP4056 Charger Module",
    thName: "โมดูลชาร์จแบตเตอรี่ TP4056 (USB-C)",
    icon: "zap",
    description: "Safely charges Lithium Polymer batteries from standard USB-C chargers with over-discharge protection.",
    thDescription: "แผงวงจรควบคุมการชาร์จแบตเตอรี่ LiPo ปลอดภัยด้วยระบบตัดไฟอัตโนมัติเมื่อชาร์จเต็มและป้องกันไฟหมดเกลี้ยง",
    roleInProject: "ใช้ชาร์จไฟเข้าแบตเตอรี่ลิเธียมของอุปกรณ์ผ่านสาย USB-C เพื่อใช้พกพาได้",
    pins: [
      { pin: "B+", function: "ต่อขั้วบวกของแบตเตอรี่ LiPo" },
      { pin: "B-", function: "ต่อขั้วลบของแบตเตอรี่ LiPo" },
      { pin: "OUT+", function: "ไฟจ่ายออกขั้วบวก -> ต่อเข้าสวิตช์ก่อนไป ESP32 5V/Vin" },
      { pin: "OUT-", function: "ไฟจ่ายออกขั้วลบ -> ต่อลงกราวด์ (GND) ของ ESP32" }
    ],
    specs: [
      "กระแสชาร์จสูงสุด: 1A (ปรับแต่งได้ด้วยตัวต้านทาน)",
      "ตัดไฟชาร์จเมื่อแรงดันแบตเตอรี่แตะ: 4.2V",
      "ไฟแสดงสถานะ: สีแดงขณะชาร์จ, สีน้ำเงิน/เขียวเมื่อชาร์จเต็ม"
    ]
  },
  {
    id: "lipo_battery",
    name: "3.7V LiPo Battery",
    thName: "แบตเตอรี่ลิเธียมโพลิเมอร์ 3.7V (LiPo)",
    icon: "battery",
    description: "Rechargeable high-capacity lightweight power source suitable for wearable devices.",
    thDescription: "แบตเตอรี่ขนาดกะทัดรัด น้ำหนักเบา สามารถชาร์จซ้ำได้ สำหรับทำให้อุปกรณ์พกพาใช้งานไร้สายได้",
    roleInProject: "จ่ายพลังงานสำรองให้ทั้งวงจรขณะพกพาติดตัว (ใช้งานยาวนาน 5-8 ชั่วโมง)",
    specs: [
      "แรงดันไฟเฉลี่ย: 3.7V (ชาร์จเต็ม 4.2V)",
      "ความจุยอดนิยมสำหรับโปรเจกต์นี้: 2000mAh",
      "ควรเก็บไว้ในกล่องปิดสนิทเพื่อความปลอดภัย"
    ]
  },
  {
    id: "switch",
    name: "Slide Switch (SPDT)",
    thName: "สวิตช์เปิด-ปิด (Slide Switch)",
    icon: "switch",
    description: "Simple switch to toggle the power flow from the battery to the micro-controller.",
    thDescription: "สวิตช์สไลด์ขนาดเล็ก ใช้เพื่อเปิดหรือปิดวงจรการจ่ายไฟจากแบตเตอรี่",
    roleInProject: "ตัดต่อกระแสไฟขั้วบวกที่วิ่งจากแผ่น TP4056 (ขา OUT+) ไปเข้าบอร์ด ESP32 เพื่อทำหน้าที่เป็นสวิตช์เปิด-ปิดเครื่อง",
    specs: [
      "ชนิดสวิตช์: SPDT (Single Pole Double Throw)",
      "มี 3 ขา (เชื่อมต่อขากลาง และขาซ้าย/ขวาเพื่อเลือกสวิตช์)"
    ]
  },
  {
    id: "led_modules",
    name: "Status LED Modules",
    thName: "ไฟ LED แสดงสถานะ (แดง, เขียว, เหลือง)",
    icon: "led",
    description: "Individual light-emitting diode modules to easily view the posture state without looking at a screen.",
    thDescription: "ไฟแสดงสถานะที่มองเห็นได้ชัดเจนทันที ใช้แทนการมองหน้าจอคอมพิวเตอร์เพื่อรู้ว่าท่านั่งปกติหรือก้มคออยู่",
    roleInProject: "ไฟสีเขียวติดสว่างเมื่อนั่งท่าปกติ, ไฟสีแดงกระพริบเมื่อตรวจจับว่าก้มคอนานเกิน 10 วินาที",
    pins: [
      { pin: "VCC IN", function: "ต่อสัญญาณควบคุมจาก ESP32 (เช่น ขา 14 สีเขียว, ขา 12 สีแดง)" },
      { pin: "GND", function: "ต่อสายลงกราวด์ร่วม (GND)" }
    ]
  }
];

export default function EquipmentTab() {
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(INITIAL_EQUIPMENT[0]);
  const [checkedEq, setCheckedEq] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedEq((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case "cpu": return <Cpu className="w-5 h-5 text-indigo-500" />;
      case "gyro": return <Radio className="w-5 h-5 text-sky-500 animate-pulse" />;
      case "vibe": return <ShieldAlert className="w-5 h-5 text-emerald-500 animate-bounce" />;
      case "zap": return <Zap className="w-5 h-5 text-amber-500" />;
      case "battery": return <Battery className="w-5 h-5 text-orange-500" />;
      case "switch": return <ToggleLeft className="w-5 h-5 text-blue-500" />;
      default: return <Layers className="w-5 h-5 text-violet-500" />;
    }
  };

  const percentChecked = Math.round(
    (Object.values(checkedEq).filter(Boolean).length / INITIAL_EQUIPMENT.length) * 100
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="equipment-check-section">
      {/* List of Equipment */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-800 text-lg">เช็คลิสต์เตรียมอุปกรณ์ ({percentChecked}%)</h3>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {Object.values(checkedEq).filter(Boolean).length} / {INITIAL_EQUIPMENT.length} รายการ
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-1">
            <div 
              className="bg-indigo-600 h-full transition-all duration-500 ease-out" 
              style={{ width: `${percentChecked}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            ติ๊กถูกหน้าอุปกรณ์ที่คุณเตรียมไว้ เพื่อตรวจสอบความพร้อมก่อนเริ่มต่อวงจรและเขียนโค้ดจริง
          </p>
        </div>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {INITIAL_EQUIPMENT.map((eq) => {
            const isSelected = selectedEq?.id === eq.id;
            const isChecked = checkedEq[eq.id] || false;
            return (
              <div
                key={eq.id}
                id={`eq-card-${eq.id}`}
                onClick={() => setSelectedEq(eq)}
                className={`p-4 rounded-2xl transition-all duration-200 cursor-pointer border flex items-center justify-between group ${
                  isSelected 
                    ? "bg-indigo-50/70 border-indigo-200 shadow-sm" 
                    : "bg-white border-slate-100 hover:border-slate-200 shadow-xs"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <button
                    onClick={(e) => toggleCheck(eq.id, e)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors border ${
                      isChecked 
                        ? "bg-indigo-600 border-indigo-600 text-white" 
                        : "bg-slate-50 border-slate-200 text-transparent group-hover:border-slate-300"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm">{eq.thName}</h4>
                    <span className="text-xs text-slate-400 font-mono block">{eq.name}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
                    {getIconComponent(eq.icon)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspect Detail Card */}
      <div className="lg:col-span-7">
        {selectedEq ? (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full justify-between" id="eq-inspect-detail">
            <div>
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      ข้อมูลอุปกรณ์
                    </span>
                    {checkedEq[selectedEq.id] && (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" /> เตรียมพร้อมแล้ว
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 text-xl mt-2">{selectedEq.thName}</h3>
                  <p className="text-sm text-slate-500 font-mono">{selectedEq.name}</p>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                  {getIconComponent(selectedEq.icon)}
                </div>
              </div>

              {/* Main Content Info */}
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">หน้าที่ในโครงงานนี้</h4>
                  <p className="text-slate-700 text-sm leading-relaxed font-sans bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    💡 <strong className="text-slate-800 font-medium">บทบาท:</strong> {selectedEq.roleInProject}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">คำอธิบายรายละเอียด</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{selectedEq.thDescription}</p>
                  <p className="text-slate-400 text-xs italic mt-1 font-mono">{selectedEq.description}</p>
                </div>

                {selectedEq.pins && selectedEq.pins.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ตารางการเชื่อมต่อขา (Pinout Map)</h4>
                    <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-3 bg-slate-50 p-2.5 font-semibold text-slate-700 border-b border-slate-100">
                        <div>ชื่อขาอุปกรณ์</div>
                        <div className="col-span-2">การทำหน้าที่ในวงจรนี้</div>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {selectedEq.pins.map((p, idx) => (
                          <div key={idx} className="grid grid-cols-3 p-2.5 text-slate-600 hover:bg-slate-50 transition-colors">
                            <div className="font-mono font-bold text-slate-800">{p.pin}</div>
                            <div className="col-span-2">{p.function}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedEq.specs && selectedEq.specs.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">คุณสมบัติเด่น (Specifications)</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 font-sans">
                      {selectedEq.specs.map((spec, idx) => (
                        <li key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-50">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Hint Box */}
            <div className="mt-6 p-4 bg-amber-50/70 border border-amber-100 rounded-2xl flex items-start space-x-2.5">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <strong>คำแนะนำการเลือกใช้อุปกรณ์:</strong> สำหรับโครงงานป้องกัน Office Neck ในกลุ่มของคุณ ตัวรับมุม <strong className="font-semibold">{selectedEq.id === "mpu6050" ? "MPU6050" : "MPU6050"}</strong> จะถูกหนีบติดขาแว่นตา ในขณะที่ <strong className="font-semibold">ESP32 + แบตเตอรี่ + TP4056</strong> จะใส่กล่องขนาดเล็กหนีบไว้ที่ขอบกางเกง มีสายไฟเส้นเล็กๆ โยงถึงกันตามแบบของกลุ่ม 310 ม.2/3 เลยครับ!
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full border border-dashed border-slate-200">
            <Layers className="w-12 h-12 mb-3 text-slate-300" />
            <p className="text-sm">เลือกอุปกรณ์ในรายการซ้ายเพื่อตรวจสอบคุณสมบัติและขาต่อ</p>
          </div>
        )}
      </div>
    </div>
  );
}
