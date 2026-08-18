"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import * as notificationService from "@/server/services/notification.service";

export async function markReadAction(notificationId: string) {
  const user = await requireUser();
  await notificationService.markRead(notificationId, user.id);
  revalidatePath("/notifications");
}

export async function markAllReadAction() {
  const user = await requireUser();
  await notificationService.markAllRead(user.id);
  revalidatePath("/notifications");
}
