"use client";

import { useEffect, useState, use } from "react";
import { Printer, X, FileText, RefreshCw } from "lucide-react";
import { getApiPath } from "@/app/utils/apiPath";

function arabicToThaiBaht(numbers: number, includeParentheses: boolean = false): string {
  if (isNaN(numbers) || numbers === null || numbers === undefined) return "";
  const numberText = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const unitText = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  const numStr = Math.abs(numbers).toFixed(2);
  const [bahtStr, satangStr] = numStr.split(".");

  let bahtText = "";
  const bahtLen = bahtStr.length;

  for (let i = 0; i < bahtLen; i++) {
    const digit = parseInt(bahtStr[i]);
    const pos = bahtLen - 1 - i;

    if (digit !== 0) {
      if (pos % 6 === 1 && digit === 1) {
        bahtText += "สิบ";
      } else if (pos % 6 === 1 && digit === 2) {
        bahtText += "ยี่สิบ";
      } else if (pos % 6 === 0 && digit === 1 && i > 0 && bahtStr[i - 1] !== "0") {
        bahtText += "เอ็ด";
      } else {
        bahtText += numberText[digit] + unitText[pos % 6];
      }
    } else if (pos % 6 === 0 && pos > 0 && bahtLen > 6) {
      bahtText += "ล้าน";
    }
  }

  bahtText += "บาท";

  if (parseInt(satangStr) === 0) {
    bahtText += "ถ้วน";
  } else {
    const satangLen = satangStr.length;
    for (let i = 0; i < satangLen; i++) {
      const digit = parseInt(satangStr[i]);
      const pos = satangLen - 1 - i;
      if (digit !== 0) {
        if (pos === 1 && digit === 1) {
          bahtText += "สิบ";
        } else if (pos === 1 && digit === 2) {
          bahtText += "ยี่สิบ";
        } else if (pos === 0 && digit === 1 && satangStr[0] !== "0") {
          bahtText += "เอ็ด";
        } else {
          bahtText += numberText[digit] + (pos === 1 ? "สิบ" : "");
        }
      }
    }
    bahtText += "สตางค์";
  }

  if (includeParentheses) {
    return `(${bahtText})`;
  }
  return bahtText;
}

export default function OrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(getApiPath(`/api/orders/${id}`));
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "ไม่พบข้อมูลคำสั่งซื้อ");
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-gray-600">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-700 mb-3" />
        <p className="font-semibold text-sm">กำลังโหลดข้อมูลเอกสารใบวางบิล...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-rose-600">
        <p className="font-bold text-base mb-2">⚠️ เกิดข้อผิดพลาด</p>
        <p className="text-sm text-gray-700">{error || "ไม่พบออเดอร์"}</p>
        <button
          onClick={() => window.close()}
          className="mt-4 px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded-xl"
        >
          ปิดหน้านี้
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans print:p-0 print:bg-white">
      {/* Top Action Bar for Screen view */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 text-white shadow flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>ใบวางบิล (Billing Note) - {order.billingNo || order.orderNo}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105"
          >
            <Printer className="w-4 h-4" />
            <span>📄 พิมพ์เอกสาร / บันทึกเป็น PDF</span>
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>ปิดแท็บนี้</span>
          </button>
        </div>
      </div>

      {/* A4 PRINTABLE CONTENT CONTAINER */}
      <div id="printable-document" className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200 print:shadow-none print:border-none print:p-0 print:max-w-none print:w-full relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
          <div className="text-center font-black text-6xl text-emerald-900 rotate-[-20deg]">
            ZYKA MEDIC
          </div>
        </div>

        {/* Billing Note Template */}
        <div className="space-y-2 text-xs font-sans relative z-10 text-black">
          {/* Header */}
          <div className="flex justify-between items-start pb-1.5 border-b border-gray-300">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-7 h-7 rounded bg-[#284532] text-white flex items-center justify-center font-black text-xs shrink-0">
                  ZM
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-black leading-tight">บริษัท ไซกา เมดิค จำกัด</h2>
                  <p className="text-[11px] font-bold text-gray-800 tracking-wider">ZYKA MEDIC CO.,LTD</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-800 leading-tight">
                เลขที่ 51 อาคารเมเจอร์ ทาวเวอร์ พระราม9-รามคำแหง ห้องเลขที่ 7 ชั้นที่ 7 ถ.พระราม 9
              </p>
              <p className="text-[10px] text-gray-800 leading-tight">
                แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร 10240 โทร 02-1151758
              </p>
              <p className="text-[10px] text-gray-800 leading-tight">
                E-mail : contact@zykamedic.com Fax. 02 115 1759
              </p>
            </div>

            <div className="text-right space-y-0.5">
              <h1 className="text-lg font-bold text-black tracking-wide">ใบวางบิล</h1>
              <p className="text-xs font-semibold text-gray-700">Billing Note</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-0.5 text-xs text-black border-b border-gray-300 pb-1.5">
            <div className="flex justify-between">
              <div><span className="font-bold">เล่มที่</span> <span className="font-mono">01/2568</span></div>
              <div><span className="font-bold">เลขที่</span> <span className="font-mono font-bold">{order.billingNo || order.orderNo}</span></div>
            </div>
            <div className="flex justify-between">
              <div><span className="font-bold">ในนาม(ลูกค้า)</span> <span className="font-semibold">{order.customerName}</span></div>
              <div>
                <span className="font-bold">วันที่</span>{" "}
                {order.billingDate
                  ? new Date(order.billingDate).toLocaleDateString("th-TH")
                  : new Date(order.orderDate).toLocaleDateString("th-TH")}
              </div>
            </div>
            <div className="flex justify-between">
              <div><span className="font-bold">ที่อยู่</span> {order.customerAddress || "-"}</div>
              <div><span className="font-bold">เลขประจำตัวผู้เสียภาษี</span> <span className="font-mono">{order.customerTaxId || "-"}</span></div>
            </div>
          </div>

          {/* Notice Line */}
          <div className="py-1 px-3 text-center text-[11px] font-semibold text-black bg-gray-50 border border-black">
            ได้รับบิลเงินเชื่อหรือเงินสดไว้ เพื่อตรวจสอบและพร้อมที่จะชำระเงินให้ตามบิลต่อไปนี้
          </div>

          {/* Table Header & Rows */}
          <table className="w-full text-left text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-black text-black">
                <th className="py-1.5 px-2 border-r border-black text-center w-12">ลำดับที่</th>
                <th className="py-1.5 px-3 border-r border-black text-center">เลขที่ใบวางบิล / รายการสินค้า</th>
                <th className="py-1.5 px-3 border-r border-black text-center w-28">วันที่บิล</th>
                <th className="py-1.5 px-3 border-r border-black text-center w-28">วันครบรอบชำระ</th>
                <th className="py-1.5 px-4 text-right border-black w-32">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-black">
                  <td className="py-1.5 px-2 border-r border-black text-center font-mono">{idx + 1}</td>
                  <td className="py-1.5 px-3 border-r border-black">
                    <span className="font-mono font-bold block text-black">{order.billingNo || order.orderNo}</span>
                    <span className="text-[11px] font-semibold text-gray-800 block">
                      {item.productName} ({item.quantity} {item.unit})
                    </span>
                  </td>
                  <td className="py-1.5 px-3 border-r border-black text-center font-mono">
                    {new Date(order.orderDate).toLocaleDateString("th-TH")}
                  </td>
                  <td className="py-1.5 px-3 border-r border-black text-center font-mono">
                    {order.dueDate ? new Date(order.dueDate).toLocaleDateString("th-TH") : "-"}
                  </td>
                  <td className="py-1.5 px-4 text-right font-mono font-bold border-black">
                    {(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Totals Table */}
          <table className="w-full text-left text-xs border-collapse border border-black font-mono">
            <tbody>
              <tr className="border-b border-black">
                <td rowSpan={2} colSpan={3} className="py-1 px-3 border-r border-black bg-gray-200 text-center font-bold text-xs text-black align-middle font-sans">
                  {arabicToThaiBaht(order.grandTotal, false)}
                </td>
                <td className="py-1 px-3 border-r border-black font-bold text-gray-900 w-28 font-sans">รวมเงิน</td>
                <td className="py-1 px-4 text-right font-bold text-black w-32">
                  {(order.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className="py-1 px-3 border-r border-black font-bold text-gray-900 font-sans">VAT {order.taxRate}%</td>
                <td className="py-1 px-4 text-right font-bold text-black">
                  {(order.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="py-1 px-3 border-r border-black text-black font-sans font-medium">
                  รวม ........{order.items?.length || 0}....... รายการ
                </td>
                <td className="py-1 px-3 border-r border-black font-extrabold text-black font-sans">จำนวนเงินทั้งสิ้น</td>
                <td className="py-1 px-4 text-right font-extrabold text-black text-sm">
                  {(order.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signatures Section with ample vertical space for signatures */}
          <div className="grid grid-cols-2 gap-8 pt-12 text-xs text-black">
            <div className="space-y-3">
              <p><span className="font-bold">ชื่อผู้รับวางบิล</span> .........................................................</p>
              <p className="pt-1"><span className="font-bold">วันที่รับ</span> ......../......../........</p>
              <p><span className="font-bold">วันที่ได้รับเงิน</span> ......../......../........</p>
            </div>

            <div className="space-y-3 text-right">
              <p><span className="font-bold">ชื่อผู้วางบิล</span> .........................................................</p>
              <p className="pt-1"><span className="font-bold">วันที่</span> ......../......../........</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
