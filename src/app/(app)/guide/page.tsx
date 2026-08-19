import { PageHeader } from "@/components/page-header";
import { SimpleStatusBadge } from "@/components/simple-status-badge";
import { BlockedFlagBadge } from "@/components/blocked-flag-badge";
import { Home, LayoutGrid, CheckCircle2, Plus, AlertTriangle, Link2, KanbanSquare, Bell } from "lucide-react";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[17px] border border-line bg-white p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="grid h-9 w-9 flex-none place-items-center rounded-[11px] bg-primary-soft text-[#2a81bc]">
          <Icon size={17} />
        </div>
        <h2 className="text-[15px] font-extrabold">{title}</h2>
      </div>
      <div className="grid gap-3 text-[13px] leading-relaxed text-[#3c4a5c]">{children}</div>
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary-soft text-[11px] font-extrabold text-[#2a81bc]">
        {n}
      </div>
      <div className="pt-0.5">{children}</div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="คู่มือ" title="วิธีใช้งาน FLOW" />

      <div className="mb-5 rounded-[17px] border border-dashed border-line bg-[#fafbfc] p-6 text-[13px] leading-relaxed text-[#3c4a5c]">
        เปิด FLOW แล้วต้องรู้ทันทีว่า <strong>&ldquo;ตอนนี้ฉันต้องทำอะไร&rdquo;</strong> — และเมื่อทำงานเสร็จ ระบบต้องรู้เองว่า{" "}
        <strong>&ldquo;ใครทำต่อ&rdquo;</strong> แล้วแจ้งคนนั้นให้อัตโนมัติ ไม่ต้องทักไปถามหรือส่งข้อความบอกเอง
      </div>

      <div className="grid gap-4">
        <Section icon={Home} title="หน้า “งานของฉัน” — จุดเริ่มต้นทุกครั้งที่เปิดระบบ">
          <p>ทุกคนเปิดมาแล้วจะเห็นเฉพาะงานที่เกี่ยวกับตัวเอง แบ่งเป็น 4 กลุ่ม:</p>
          <div className="grid gap-2.5">
            <div className="flex items-start gap-3">
              <SimpleStatusBadge status="DOING" className="mt-0.5 flex-none" />
              <span><strong>กำลังทำ</strong> — งานที่กดเริ่มทำแล้ว ยังไม่เสร็จ</span>
            </div>
            <div className="flex items-start gap-3">
              <SimpleStatusBadge status="READY" className="mt-0.5 flex-none" />
              <span><strong>เริ่มได้แล้ว</strong> — เป็นงานของคุณ และไม่มีอะไรต้องรอแล้ว กดเริ่มทำได้เลย</span>
            </div>
            <div className="flex items-start gap-3">
              <SimpleStatusBadge status="WAITING" className="mt-0.5 flex-none" />
              <span>
                <strong>กำลังรอ</strong> — เป็นงานของคุณ แต่ยังเริ่มไม่ได้ ระบบจะบอกด้วยว่า &ldquo;รออะไร รอใคร&rdquo; ไม่ต้องเดา
                และไม่ต้องตามเอง — พอคนที่ต้องรอทำเสร็จ งานจะเปลี่ยนเป็น &ldquo;เริ่มได้แล้ว&rdquo; และแจ้งเตือนให้คุณเอง
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex-none rounded-lg bg-[#edf1f5] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#6f7b8d]">
                งานถัดไป
              </span>
              <span>งานที่ยังไม่ต้องทำตอนนี้ เพราะแคมเปญยังไม่เริ่ม — เก็บไว้ให้เห็นล่วงหน้าเฉยๆ</span>
            </div>
          </div>
        </Section>

        <Section icon={Plus} title="เพิ่มงาน">
          <p>มี 2 แบบ เลือกตามความจำเป็น:</p>
          <Step n={1}>
            <strong>งานเดี่ยว</strong> — กด <span className="rounded-md bg-[#edf1f5] px-1.5 py-0.5 font-mono text-[11px]">+ งาน</span>{" "}
            ที่มุมขวาบนของหน้า &ldquo;งานของฉัน&rdquo; พิมพ์ชื่องานแล้วกดเพิ่มได้เลย เช่น &ldquo;โทรหา supplier&rdquo; ไม่ต้องผูกกับแคมเปญ
            ไม่ต้องรอใครอนุมัติ เริ่มทำได้ทันที
          </Step>
          <Step n={2}>
            <strong>งานในแคมเปญ</strong> — เข้าไปที่แคมเปญ แท็บ &ldquo;แผนงาน&rdquo; แล้วกด &ldquo;เพิ่มงาน&rdquo; เหมาะกับงานที่ต้องรอคนอื่นก่อน
            หรือมีคนอื่นต้องรอต่อจากเรา
          </Step>
        </Section>

        <Section icon={CheckCircle2} title="ทำงานหนึ่งงานให้เสร็จ">
          <Step n={1}>เห็นงานอยู่ใน &ldquo;เริ่มได้แล้ว&rdquo; → กด <strong>เริ่มทำ</strong></Step>
          <Step n={2}>งานย้ายไป &ldquo;กำลังทำ&rdquo; → ทำงานจริงตามปกติ (ถ่ายวิดีโอ ออกแบบ เขียนสคริป ฯลฯ)</Step>
          <Step n={3}>
            ทำเสร็จ → กด <strong>เสร็จแล้ว</strong> (ถ้ามีคนตรวจงาน ปุ่มจะขึ้นว่า <strong>ส่งตรวจสอบ</strong> แทน)
          </Step>
          <Step n={4}>
            ถ้างานนี้เป็นสิ่งที่คนอื่นต้องรอ ระบบจะแจ้งเตือนคนถัดไปให้เองทันทีว่า &ldquo;พร้อมเริ่มแล้ว&rdquo; — ไม่ต้องไปบอกเขาเอง
          </Step>
          <div className="mt-1 flex items-center gap-2 rounded-[11px] border border-line bg-[#fafbfc] px-3 py-2.5">
            <AlertTriangle size={14} className="flex-none text-[#a56e16]" />
            <span>
              ถ้าทำงานอยู่แล้วติดปัญหา (รอคน / รอคำตอบ / รอไฟล์) กด <strong>ติดปัญหา</strong> เลือกสาเหตุ — เพื่อนร่วมทีมและหัวหน้าจะเห็นทันที
              เช่น <BlockedFlagBadge blockedAt={new Date()} blockedReason="WAITING_FILE" />
            </span>
          </div>
        </Section>

        <Section icon={Link2} title="แนบลิงก์งานให้หัวหน้าตรวจ">
          <p>
            ทำงานเสร็จแล้วมีไฟล์ (เช่น อยู่ใน Google Drive, Canva, YouTube) ให้เปิดหน้ารายละเอียดงาน แล้ววางลิงก์ในช่อง{" "}
            <strong>&ldquo;ลิงก์แนบไฟล์&rdquo;</strong> — หัวหน้าจะเห็นลิงก์นี้ตรงจุดเดียวกับปุ่มอนุมัติพอดี ไม่ต้องส่งลิงก์แยกทางแชท
          </p>
        </Section>

        <Section icon={LayoutGrid} title="แคมเปญ — เมื่องานหลายชิ้นต้องรอกัน">
          <p>ใช้ &ldquo;แคมเปญ&rdquo; เมื่องานหลายคนต้องต่อกันเป็นขั้นตอน เช่น คิดโปรโมชั่น → ทำกราฟิก/วิดีโอ → ยิงแอด → สรุปผล</p>
          <Step n={1}>ผู้จัดการสร้างแคมเปญ ใส่งานทั้งหมด พร้อมกำหนดว่างานไหน &ldquo;ต้องรอ&rdquo; งานไหนก่อน</Step>
          <Step n={2}>
            กด <strong>ตรวจความพร้อม</strong> ระบบจะเช็กให้ว่าทุกงานมีคนรับผิดชอบครบหรือยัง ถ้ายังไม่ครบจะบอกเป็นภาษาคน เช่น
            &ldquo;ยิงแอด ยังไม่มีคนรับผิดชอบ&rdquo;
          </Step>
          <Step n={3}>
            กด <strong>เริ่มแคมเปญ</strong> — งานที่เริ่มได้ทันทีจะกลายเป็น &ldquo;เริ่มได้แล้ว&rdquo; ส่วนงานที่ต้องรอจะเป็น &ldquo;กำลังรอ&rdquo;
            โดยอัตโนมัติ
          </Step>
        </Section>

        <Section icon={KanbanSquare} title="บอร์ด — ดูภาพรวมงานสร้างสรรค์">
          <p>
            ในแต่ละแคมเปญ แท็บ <strong>&ldquo;บอร์ด&rdquo;</strong> แสดงงานเป็นการ์ด ไล่จาก <strong>รับบรีฟ → กำลังดำเนินการ (ดราฟ 1 / 2 / 3) →
            เสร็จสิ้น</strong> ใช้ปุ่ม ‹ › บนการ์ดเพื่อย้ายไปคอลัมน์ถัดไปหรือก่อนหน้า เป็นแค่ตัวช่วยดูภาพรวมรอบการแก้งาน
            ไม่กระทบสถานะจริงของงาน (เริ่มทำ/ส่งตรวจ/เสร็จ ยังคงกดจากหน้ารายละเอียดงานตามปกติ)
          </p>
          <p>กดไอคอนดินสอบนการ์ดเพื่อแก้ไขชื่องาน คนรับผิดชอบ กำหนดส่ง หรือความสำคัญได้โดยตรง ไม่ต้องเข้าไปหน้าอื่น</p>
        </Section>

        <Section icon={CheckCircle2} title="สำหรับหัวหน้า/ผู้อนุมัติ">
          <p>
            ถ้าเป็นคนที่ต้องตรวจงาน จะเห็นงานที่รอตรวจอยู่ในกล่อง &ldquo;รอการอนุมัติจากคุณ&rdquo; ในหน้างานของฉัน หรือเมนู{" "}
            <strong>&ldquo;การอนุมัติ&rdquo;</strong> เปิดงานเข้าไปดูลิงก์ที่แนบไว้ แล้วเลือก:
          </p>
          <div className="grid grid-cols-2 gap-2.5 max-[560px]:grid-cols-1">
            <div className="rounded-[11px] border border-line bg-green-soft/40 px-3 py-2.5">
              <strong className="text-green">อนุมัติ</strong> — งานเสร็จสมบูรณ์ ระบบแจ้งคนถัดไปต่อให้อัตโนมัติ
            </div>
            <div className="rounded-[11px] border border-line bg-red-soft/40 px-3 py-2.5">
              <strong className="text-red">ขอให้แก้ไข</strong> — ใส่คอมเมนต์ว่าต้องแก้อะไร ส่งกลับให้เจ้าของงานทันที
            </div>
          </div>
        </Section>

        <Section icon={Bell} title="การแจ้งเตือน">
          <p>
            กระดิ่งที่แถบด้านซ้ายจะขึ้นเลขแดงเมื่อมีเรื่องใหม่ — ได้รับมอบหมายงาน, งานพร้อมเริ่มแล้ว, หรือถูกขอให้แก้ไข ไม่ต้องกลัวพลาด
            ไม่ต้องรอให้ใครมาบอก
          </p>
        </Section>

        <div className="rounded-[17px] border border-dashed border-line bg-[#fafbfc] p-6 text-[12px] text-muted">
          <strong className="text-[#3c4a5c]">สรุปสั้นๆ:</strong> เปิดแอปแล้วดูที่ &ldquo;งานของฉัน&rdquo; ก่อนเสมอ — เห็นอะไรใน &ldquo;เริ่มได้แล้ว&rdquo; ให้เริ่มก่อน
          ทำเสร็จกด &ldquo;เสร็จแล้ว&rdquo; ที่เหลือระบบจัดการต่อให้เอง
        </div>
      </div>
    </div>
  );
}
