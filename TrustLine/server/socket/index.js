const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");
const {
  ConversationModel,
  MessageModel,
} = require("../models/ConversationModel");
const getConversation = require("../helpers/getConversation");

const app = express();

/***socket connection */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

/***
 * socket running at http://localhost:8080/
 */

// Online user
const onlineUser = new Set();

// Function to check for restricted content
function containsRestrictedContent(text) {
  const restrictedWords = ["fight", "kill", "shoot", "hate", "bomb", "attack"];
  const restrictedPatterns = [
    {
      pattern: /\b(?:\d{3}-\d{3}-\d{4}|\d{10})\b/,
      message: "Message contains a phone number",
    },
    { pattern: /\b\d{16}\b/, message: "Message contains a credit card number" },
    { pattern: /\b\d{12}\b/, message: "Message contains an ID card number" },
    {
      pattern: /\b(?:\d{4}-){3}\d{4}\b/,
      message: "Message contains a credit card number",
    },
    {
      pattern: /\bhttps?:\/\/[^\s/$.?#].[^\s]*\b/,
      message: "Message contains a URL",
    },
    {
      pattern: /\bwww\.[^\s/$.?#].[^\s]*\b/,
      message: "Message contains a URL",
    },
    {
      pattern: /\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}\b/,
      message: "Message contains a URL",
    },
  ];
  for (let word of restrictedWords) {
    if (text.toLowerCase().includes(word.toLowerCase())) {
      return `Message contains restricted word: ${word}`;
    }
  }

  for (let { pattern, message } of restrictedPatterns) {
    if (pattern.test(text)) {
      return message;
    }
  }

  return null;
}

io.on("connection", async (socket) => {
  console.log("Connected user", socket.id);

  const token = socket.handshake.auth.token;
  const user = await getUserDetailsFromToken(token);

  if (user && user._id) {
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());
  }

  io.emit("onlineUser", Array.from(onlineUser));

  socket.on("message-page", async (userId) => {
    console.log("userId", userId);
    const userDetails = await UserModel.findById(userId).select("-password");

    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      profile_pic: userDetails?.profile_pic,
      online: onlineUser.has(userId),
    };
    socket.emit("message-user", payload);

    const getConversationMessage = await ConversationModel.findOne({
      $or: [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    socket.emit("message", getConversationMessage?.messages || []);
  });

  socket.on("new message", async (data) => {
    const validationError = containsRestrictedContent(data.text);
    if (validationError) {
      socket.emit("error", { message: validationError });
      return;
    }

    let conversation = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    });

    if (!conversation) {
      const createConversation = new ConversationModel({
        sender: data?.sender,
        receiver: data?.receiver,
      });
      conversation = await createConversation.save();
    }

    const message = new MessageModel({
      text: data.text,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      msgByUserId: data?.msgByUserId,
    });
    const saveMessage = await message.save();

    await ConversationModel.updateOne(
      { _id: conversation?._id },
      {
        $push: { messages: saveMessage?._id },
      }
    );

    const getConversationMessage = await ConversationModel.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    io.to(data?.sender).emit("message", getConversationMessage?.messages || []);
    io.to(data?.receiver).emit(
      "message",
      getConversationMessage?.messages || []
    );

    const conversationSender = await getConversation(data?.sender);
    const conversationReceiver = await getConversation(data?.receiver);

    io.to(data?.sender).emit("conversation", conversationSender);
    io.to(data?.receiver).emit("conversation", conversationReceiver);
  });

  socket.on("sidebar", async (currentUserId) => {
    console.log("current user", currentUserId);

    const conversation = await getConversation(currentUserId);
    socket.emit("conversation", conversation);
  });

  socket.on("seen", async (msgByUserId) => {
    let conversation = await ConversationModel.findOne({
      $or: [
        { sender: user?._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user?._id },
      ],
    });

    const conversationMessageId = conversation?.messages || [];

    await MessageModel.updateMany(
      { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
      { $set: { seen: true } }
    );

    const conversationSender = await getConversation(user?._id?.toString());
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(user?._id?.toString()).emit("conversation", conversationSender);
    io.to(msgByUserId).emit("conversation", conversationReceiver);
  });

  socket.on("disconnect", () => {
    onlineUser.delete(user?._id?.toString());
    console.log("Disconnected user", socket.id);
  });
});

module.exports = {
  app,
  server,
};
