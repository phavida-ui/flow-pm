import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/my-work");

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-[20px] border border-line bg-surface p-8 shadow-card">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-lg font-black text-[#20445f]">
            F
          </div>
          <div>
            <p className="text-base font-bold tracking-wide">FLOW</p>
            <p className="text-[10px] text-muted">ส่งต่องานและวางแผนแคมเปญ</p>
          </div>
        </div>

        <h1 className="mb-1 text-xl font-bold tracking-tight">เข้าสู่ระบบ</h1>
        <p className="mb-6 text-xs text-muted">ใช้บัญชี FLOW ของคุณเพื่อดูสิ่งที่ต้องดำเนินการ</p>

        <LoginForm />

        <p className="mt-6 rounded-lg border border-dashed border-line bg-[#fafbfc] px-3 py-2 text-[10px] leading-relaxed text-muted">
          บัญชีทดลอง: jane@flow.demo, nan@flow.demo, marketing.head@flow.demo, management@flow.demo — รหัสผ่าน{" "}
          <strong>flow-demo-2026</strong>
        </p>
      </div>
    </div>
  );
}
