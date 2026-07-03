import prisma from "../config/prisma.js";

export const saveMessage = async (senderId, receiverId, interestId, content) => {
  if (!content || !content.trim()) {
    throw new Error("Message content cannot be empty");
  }

  // Verify interest is ACCEPTED
  const interest = await prisma.interestRequest.findUnique({
    where: { id: interestId },
  });

  if (!interest) {
    throw new Error("Interest request not found");
  }

  if (interest.status !== "ACCEPTED") {
    throw new Error("Chat is only allowed after the interest request is accepted");
  }

  // Verify sender and receiver are parts of the interest request
  const isAuthorized =
    (interest.tenantId === senderId && interest.ownerId === receiverId) ||
    (interest.tenantId === receiverId && interest.ownerId === senderId);

  if (!isAuthorized) {
    throw new Error("Unauthorized to send message in this chat");
  }

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      senderId,
      receiverId,
      interestId,
    },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return message;
};

export const getMessages = async (interestId, userId) => {
  const interest = await prisma.interestRequest.findUnique({
    where: { id: interestId },
  });

  if (!interest) {
    throw new Error("Interest request not found");
  }

  if (interest.tenantId !== userId && interest.ownerId !== userId) {
    throw new Error("Unauthorized to view messages in this chat");
  }

  const messages = await prisma.message.findMany({
    where: { interestId },
    include: {
      sender: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return messages;
};

export const getConversations = async (userId) => {
  // Get all ACCEPTED interest requests involving this user
  const interests = await prisma.interestRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ tenantId: userId }, { ownerId: userId }],
    },
    include: {
      tenant: { select: { id: true, name: true, email: true } },
      owner: { select: { id: true, name: true, email: true } },
      listing: { select: { id: true, title: true, location: true, rent: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return interests.map((interest) => {
    // Determine the other user
    const otherUser = interest.tenantId === userId ? interest.owner : interest.tenant;
    const lastMessage = interest.messages[0] || null;

    return {
      id: interest.id,
      listing: interest.listing,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        email: otherUser.email,
      },
      lastMessage,
      updatedAt: lastMessage ? lastMessage.createdAt : interest.createdAt,
    };
  });
};
