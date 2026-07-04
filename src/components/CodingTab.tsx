import React, { useState } from "react";
import { CodeConfig } from "../types";
import { Copy, Check, Info, Settings, Code, HelpCircle, Download } from "lucide-react";

export default function CodingTab() {
  const [config, setConfig] = useState<CodeConfig>({
    wifiSsid: "MyHome_WiFi",
    wifiPass: "12345678",
    lineToken: "YOUR_LINE_NOTIFY_TOKEN",
    angleThreshold: 15,
    delaySec: 10,
    enableLine: true,
    enableSerialDebug: true,
    enableLeds: true
  });

  const [copied, setCopied] = useState(false);

  const handleInputChange = (field: keyof CodeConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const generatedCode = `/**
 * โครงงาน: อุปกรณ์ตรวจจับและแจ้งเตือนการก้มคอเพื่อป้องกันภาวะ Text Neck Syndrome
 * ระดับชั้น: ม.2/3 กลุ่ม 310
 * อุปกรณ์หลัก: ESP32 DevKit + เซนเซอร์ MPU6050 + มอเตอร์สั่นสะเทือน + ไฟ LED และ LINE Notify
 */

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <WiFi.h>
#include <HTTPClient.h>

// --- ตั้งค่าพินอุปกรณ์ ---
#define VIB_PIN 13       // พินควบคุมมอเตอร์สั่น
#define RED_LED_PIN 12   // พินไฟ LED สีแดง (เตือนก้มคอ)
#define GREEN_LED_PIN 14 // พินไฟ LED สีเขียว (ท่านั่งปกติ)

// --- ตั้งค่าพารามิเตอร์ระบบ ---
const char* ssid = "${config.wifiSsid}";       // ชื่อ Wi-Fi บ้าน/มือถือของคุณ
const char* password = "${config.wifiPass}";   // รหัสผ่าน Wi-Fi
const char* lineToken = "${config.lineToken}"; // LINE Notify Token

const float ANGLE_THRESHOLD = ${config.angleThreshold}.0; // มุมวิกฤตเริ่มก้มคอ (องศา)
const unsigned long DURATION_THRESHOLD = ${config.delaySec} * 1000; // เวลาดีเลย์เตือน (มิลลิวินาที)

// --- ตัวแปรภายในระบบ ---
Adafruit_MPU6050 mpu;
unsigned long badPostureStartTime = 0; // เวลาเริ่มทำท่าไม่ถูกต้อง
bool isPostureBad = false;             // สถานะปัจจุบัน: ก้มคอหรือไม่
bool hasNotified = false;              // ส่งไลน์เตือนรอบนี้ไปแล้วหรือยัง
float baselinePitch = 0.0;            // มุมเริ่มต้นเมื่อสวมใส่แว่นตาตรง (Calibration Baseline)

// ฟังก์ชันส่งการแจ้งเตือนผ่าน LINE Notify แบบไม่ต้องใช้ไลบรารีเพิ่ม
void sendLineNotification(String message) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // ละเว้นการตรวจสอบใบรับรอง SSL ชั่วคราวเพื่อความเร็ว
    HTTPClient http;
    
    http.begin(client, "https://notify-api.line.me/api/notify");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    http.addHeader("Authorization", "Bearer " + String(lineToken));
    
    String httpRequestData = "message=" + message;
    int httpResponseCode = http.POST(httpRequestData);
    
    #if ${config.enableSerialDebug ? "1" : "0"}
    if (httpResponseCode > 0) {
      Serial.print("LINE Notify ส่งสำเร็จ! รหัสการตอบกลับ: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("เกิดข้อผิดพลาดในการส่ง LINE Notify: ");
      Serial.println(httpResponseCode);
    }
    #endif
    
    http.end();
  } else {
    #if ${config.enableSerialDebug ? "1" : "0"}
    Serial.println("Wi-Fi หลุดการเชื่อมต่อ ไม่สามารถส่ง LINE ได้");
    #endif
  }
}

// ฟังก์ชัน คาลิเบรต หาค่ามาตรฐานตอนแว่นตาอยู่บนศีรษะตรง
void calibrateMPU6050() {
  Serial.println("กำลัง Calibrate มุมเริ่มต้น กรุณานั่งตัวตรงหน้ามองตรงนิ่งๆ 2 วินาที...");
  float sum = 0;
  int samples = 50;
  for (int i = 0; i < samples; i++) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    
    // คำนวณหา Pitch Angle จากแรงดึงดูดโลกแกน X และ Z
    float pitch = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180.0 / M_PI;
    sum += pitch;
    delay(40);
  }
  baselinePitch = sum / samples;
  Serial.print("บันทึกค่า Baseline ของท่านั่งตรงสำเร็จ: ");
  Serial.print(baselinePitch);
  Serial.println(" องศา");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // กำหนดโหมดพินควบคุมเอาต์พุต
  pinMode(VIB_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  
  // สั่งปิดการสั่นและปิดไฟสีแดงช่วงเริ่มต้น ให้ไฟสีเขียวสว่างนวล
  digitalWrite(VIB_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);

  // เริ่มต้นทำงานของโมดูล MPU6050
  if (!mpu.begin()) {
    Serial.println("ไม่สามารถตรวจจับเซนเซอร์ MPU6050 ได้! กรุณาตรวจสอบสายเชื่อมต่อ SDA/SCL");
    while (1) {
      // แฟลชไฟสีแดงกระพริบถ้าระบบตรวจไม่เจอเซนเซอร์
      digitalWrite(RED_LED_PIN, HIGH);
      delay(200);
      digitalWrite(RED_LED_PIN, LOW);
      delay(200);
    }
  }
  Serial.println("เชื่อมต่อเซนเซอร์ MPU6050 ค้นพบสำเร็จ!");
  
  // ตั้งค่าความปลอดภัยและสปีดเซนเซอร์
  mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
  mpu.setGyroRange(MPU6050_RANGE_250_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  // ทำการ calibrate
  calibrateMPU6050();

  #if ${config.enableLine ? "1" : "0"}
  // เชื่อมต่อ Wi-Fi เพื่อเตรียมรายงานเข้า LINE
  Serial.print("กำลังเชื่อมต่อเครือข่าย Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("เชื่อมต่อ Wi-Fi สำเร็จเรียบร้อย!");
  Serial.print("หมายเลข IP ของ ESP32: ");
  Serial.println(WiFi.localIP());
  sendLineNotification("🔔 ระบบตรวจจับท่านั่งป้องกัน Text Neck Syndrome บูตระบบสำเร็จและพร้อมใช้งาน!");
  #endif
}

void loop() {
  // รับค่าข้อมูลเหตุการณ์แกนหมุนของเซนเซอร์
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // คำนวณหามุมก้ม (Pitch Angle) จากแกน Acceleration x, y, z
  float currentRawPitch = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180.0 / M_PI;
  
  // วัดองศาการก้มสัมพัทธ์เทียบกับแนว Baseline ที่คาลิเบรตตอนใส่ตรง
  float tiltAngle = currentRawPitch - baselinePitch;

  // ตรวจจับมุมที่เป็นลบหรือเป็นบวกตามการก้ม (ใช้ abs ป้องกันความคลาดเคลื่อนทางทิศทาง)
  float absTilt = abs(tiltAngle);

  #if ${config.enableSerialDebug ? "1" : "0"}
  Serial.print(" Raw Pitch: ");
  Serial.print(currentRawPitch, 1);
  Serial.print(" | Relative Tilt: ");
  Serial.print(absTilt, 1);
  Serial.println(" deg");
  #endif

  // เช็คเงื่อนไขท่านั่งก้มศีรษะเกินเกณฑ์ความปลอดภัยหรือไม่
  if (absTilt >= ANGLE_THRESHOLD) {
    if (!isPostureBad) {
      // เพิ่งเริ่มก้มคอเกินขีดจำกัดเป็นวินาทีแรก
      isPostureBad = true;
      badPostureStartTime = millis();
      #if ${config.enableSerialDebug ? "1" : "0"}
      Serial.println("⚠️ ตรวจพบการก้มศีรษะเกิน 15 องศา! เริ่มจับเวลา 10 วินาที...");
      #endif
    } else {
      // ก้มอยู่อย่างต่อเนื่อง: ตรวจดูว่าเวลาก้มสะสมนานเกินช่วงเตือนที่ตั้งไว้หรือไม่
      unsigned long elapsed = millis() - badPostureStartTime;
      if (elapsed >= DURATION_THRESHOLD) {
        // เกิดการก้มคอแช่นานเกินไป! ส่งเสียงหรือสั่นเตือนผู้ใช้ทันที
        digitalWrite(VIB_PIN, HIGH); // สั่งมอเตอร์สั่นทำงานสั่นเตือนที่เอว
        
        #if ${config.enableLeds ? "1" : "0"}
        // แฟลชสลับไฟสีแดงเพื่อแสดงการเตือนและปิดสีเขียว
        digitalWrite(RED_LED_PIN, HIGH);
        digitalWrite(GREEN_LED_PIN, LOW);
        #endif

        if (!hasNotified) {
          // แจ้งเตือนเข้าไลน์เพียงแค่ครั้งเดียวต่อการก้มหนึ่งรอบ เพื่อไม่ให้สแปมข้อความผู้ใช้
          #if ${config.enableLine ? "1" : "0"}
          sendLineNotification("🚨 แจ้งเตือนด่วน: คุณก้มศีรษะเกินเกณฑ์ความปลอดภัยสม่ำเสมอนานเกิน " + String(${config.delaySec}) + " วินาทีแล้ว! กรุณาเงยศีรษะขึ้นเพื่อรักษาสุขภาพต้นคอ");
          #endif
          hasNotified = true;
        }
      }
    }
  } else {
    // ผู้ใช้งานอยู่ในท่าทางที่ดี ปกติ ไม่ก้มเกินขีดจำกัด
    if (isPostureBad) {
      #if ${config.enableSerialDebug ? "1" : "0"}
      Serial.println("✅ ผู้ใช้ปรับศีรษะตั้งตรงแล้ว ปิดสัญญาณเตือน");
      #endif
    }
    
    isPostureBad = false;
    hasNotified = false;
    badPostureStartTime = 0;
    
    // ปิดระบบสั่นเตือน ปล่อยไฟสถานะปกติสีเขียวขึ้น
    digitalWrite(VIB_PIN, LOW);
    #if ${config.enableLeds ? "1" : "0"}
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, HIGH);
    #endif
  }

  delay(200); // พักการวนลูป 0.2 วินาที เพื่อไม่ให้ชิปเกิดความร้อนและรวบรวมค่าเสถียร
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadInoFile = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "PostureGuard_ESP32.ino";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="code-generation-section">
      {/* Parameter Settings Panel */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Settings className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 text-sm">ปรับแต่งการตั้งค่าพารามิเตอร์</h3>
          </div>

          {/* WiFi Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">ชื่ออินเทอร์เน็ต Wi-Fi (SSID)</label>
            <input 
              type="text" 
              value={config.wifiSsid}
              onChange={(e) => handleInputChange("wifiSsid", e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors"
              placeholder="เช่น WiFi_House"
            />
          </div>

          {/* WiFi Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">รหัสผ่าน Wi-Fi (Password)</label>
            <input 
              type="password" 
              value={config.wifiPass}
              onChange={(e) => handleInputChange("wifiPass", e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors"
              placeholder="รหัสผ่านเชื่อมต่อ"
            />
          </div>

          {/* LINE Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">LINE Notify Token</label>
              <a 
                href="https://notify-bot.line.me/my/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-indigo-600 hover:underline flex items-center"
              >
                วิธีออก Token ↗
              </a>
            </div>
            <input 
              type="text" 
              value={config.lineToken}
              onChange={(e) => handleInputChange("lineToken", e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors"
              placeholder="ใส่ Token หรือสไลด์ปิดส่งไลน์ด้านล่าง"
            />
          </div>

          {/* Angle slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span className="font-semibold">องศาเริ่มก้มคอเตือน</span>
              <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">{config.angleThreshold}°</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="45" 
              value={config.angleThreshold}
              onChange={(e) => handleInputChange("angleThreshold", parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">กลุ่ม 310 ม.2/3 เลือกความเอียงที่ปลอดภัยที่ 15 องศาขึ้นไป</p>
          </div>

          {/* Delay seconds slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span className="font-semibold">เวลาจำกัดก่อนเริ่มสั่นเตือน</span>
              <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">{config.delaySec} วินาที</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="30" 
              value={config.delaySec}
              onChange={(e) => handleInputChange("delaySec", parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">ถ้าก้มคอเกินขีดจำกัดค้างนานเกินเวลาที่กำหนด มอเตอร์ถึงจะเริ่มทำงาน</p>
          </div>

          {/* Extra Checkboxes */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={config.enableLine}
                onChange={(e) => handleInputChange("enableLine", e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
              <span className="font-medium">เปิดใช้งานส่งข้อความเตือนเข้า LINE Notify</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={config.enableLeds}
                onChange={(e) => handleInputChange("enableLeds", e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
              <span className="font-medium">เปิดใช้งานแสดงผลไฟ LED สถานะ (D12/D14)</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={config.enableSerialDebug}
                onChange={(e) => handleInputChange("enableSerialDebug", e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
              <span className="font-medium">เปิดใช้งาน Serial Debug ในระบบ (พิมพ์มอนิเตอร์)</span>
            </label>
          </div>
        </div>

        {/* Library Installation steps helper */}
        <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-5 rounded-3xl border border-indigo-100/40 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-950 font-bold text-sm border-b border-indigo-100 pb-2">
            <Download className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>ขั้นตอนเตรียมพร้อมเครื่องมือและไลบรารี 🛠️</span>
          </div>
          
          <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-sans">
            <div>
              <span className="font-bold text-indigo-700 block mb-1">ขั้นที่ 1: ติดตั้งบอร์ด ESP32 ในโปรแกรม Arduino IDE</span>
              <p className="text-slate-600 mb-1.5">หากยังไม่มีบอร์ด ESP32 ให้เลือก ให้ไปที่เมนู <strong className="font-semibold">File → Preferences</strong> แล้วใส่ลิงก์นี้ในช่อง Additional Board Manager URLs:</p>
              <div className="bg-slate-100 p-2 rounded-xl font-mono text-[10.5px] text-slate-800 select-all border border-slate-200 break-all mb-1.5">
                https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
              </div>
              <p className="text-slate-600">จากนั้นไปที่ <strong className="font-semibold">Tools → Board → Board Manager</strong> ค้นหาคำว่า <strong className="font-semibold">ESP32 by Espressif</strong> และกด Install</p>
            </div>

            <div className="border-t border-indigo-50/50 pt-3">
              <span className="font-bold text-indigo-700 block mb-1">ขั้นที่ 2: ติดตั้ง Library เซนเซอร์ที่จำเป็น</span>
              <p className="text-slate-600 mb-2">ไปที่เมนู <strong className="font-semibold">Tools → Manage Libraries... (Ctrl+Shift+I)</strong> ค้นหาและกดยืนยันการติดตั้งไลบรารีดังต่อไปนี้:</p>
              
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-1.5 font-bold">•</span>
                  <div>
                    <strong className="font-bold text-slate-800">Adafruit MPU6050</strong>
                    <span className="text-slate-500 block text-[10.5px]">(คีย์หลักสำหรับคุยกับเซนเซอร์แกนหมุน และกรองค่ามุม)</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-1.5 font-bold">•</span>
                  <div>
                    <strong className="font-bold text-slate-800">Adafruit Unified Sensor</strong>
                    <span className="text-slate-500 block text-[10.5px]">(โมดูลแกนกลางสำหรับการเข้าถึงค่ามาตรฐานวิทยาศาสตร์)</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-1.5 font-bold">•</span>
                  <div>
                    <strong className="font-bold text-slate-800">Adafruit BusIO</strong>
                    <span className="text-slate-500 block text-[10.5px]">(สำหรับการเชื่อมต่อระบบสื่อสารอนุกรม I2C และ SPI ความเร็วสูง)</span>
                  </div>
                </li>
              </ul>
              <div className="mt-2 bg-amber-50 text-amber-900 p-2.5 rounded-xl text-[10.5px] border border-amber-100">
                💡 <strong className="font-semibold">ทริกเด็ด:</strong> ตอนที่กดติดตั้ง <strong className="font-bold text-slate-800">Adafruit MPU6050</strong> โปรแกรมจะเด้งถามขึ้นมาว่าต้องการติดตั้งไลบรารีคู่หูตัวอื่นด้วยไหม ให้กดปุ่ม <strong className="font-semibold text-indigo-800">"Install All"</strong> เพื่อให้ตัวช่วยโปรแกรมลงครบทั้ง 3 ตัวอัตโนมัติได้ทันทีเลยครับ!
              </div>
            </div>

            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-850">
              ⚡ <strong className="font-semibold">ข้อดีของโค้ดชุดนี้:</strong> โค้ดนี้ใช้ SSL ข้อมูลตรงยิงเข้า <strong className="font-semibold">LINE Notify API</strong> ด้วยฟังก์ชันภายในแบบเนทีฟ ไม่ผ่านไลบรารีภายนอก ป้องกันโค้ดเอเรอร์บนบอร์ด ESP32S2/S3/C3 และ ESP32 รุ่นใหม่ได้สมบูรณ์แบบ
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="lg:col-span-8 flex flex-col h-[650px] bg-slate-900 rounded-3xl overflow-hidden shadow-md border border-slate-800">
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
              <Code className="w-3.5 h-3.5 text-slate-500" />
              <span>PostureGuard_ESP32.ino</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadInoFile}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
              title="ดาวน์โหลดไฟล์ PostureGuard_ESP32.ino ไปเปิดใน Arduino IDE ได้ทันที"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดไฟล์ .ino</span>
            </button>

            <button
              onClick={copyToClipboard}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                copied 
                  ? "bg-emerald-600 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>คัดลอกโค้ดแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกโค้ด C++</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="flex-1 overflow-auto p-5 font-mono text-xs leading-relaxed text-slate-300 scrollbar-thin scrollbar-thumb-slate-800" id="code-editor-area">
          <pre className="font-mono text-[11px] whitespace-pre select-all text-emerald-400">
            {generatedCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
