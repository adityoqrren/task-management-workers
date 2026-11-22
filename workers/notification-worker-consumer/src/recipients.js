import prisma from "./config/db.js";

export const getActiveProjectMemberUserIds = async (projectId) => {
  const members = await prisma.projectMembers.findMany({
    where: { projectId, isActive: true },
    select: { userId: true },
  });

  return [...new Set(members.map((member) => member.userId).filter(Boolean))];
};

export const resolveArchiveRecipients = async ({
  projectId,
  actorId,
  candidateUserIds = [],
}) => {
  const activeUserIds = new Set(await getActiveProjectMemberUserIds(projectId));
  const candidates = candidateUserIds.length > 0
    ? candidateUserIds
    : [...activeUserIds];

  return [...new Set(candidates)]
    .filter((userId) => Boolean(userId))
    .filter((userId) => userId !== actorId)
    .filter((userId) => activeUserIds.has(userId));
};
