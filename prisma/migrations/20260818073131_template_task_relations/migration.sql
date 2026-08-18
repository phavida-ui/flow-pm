-- AddForeignKey
ALTER TABLE "WorkflowTemplateTask" ADD CONSTRAINT "WorkflowTemplateTask_defaultTeamId_fkey" FOREIGN KEY ("defaultTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTemplateTask" ADD CONSTRAINT "WorkflowTemplateTask_defaultOwnerId_fkey" FOREIGN KEY ("defaultOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTemplateTask" ADD CONSTRAINT "WorkflowTemplateTask_defaultApproverId_fkey" FOREIGN KEY ("defaultApproverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
