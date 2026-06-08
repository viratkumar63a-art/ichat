// This module accepts the running Socket.io instance from your main app
function initBot(io) {
     const BOT_NAME = "Server Assistant 🤖";
     const BOT_ID = "SERVER_BOT_INTERNAL";

     console.log(`[Bot Module] Initialized and linked internally.`);

     io.on("connection", (socket) => {
          // Listen to messages coming from real user sockets
          socket.on("chat-message", (data) => {
               // Prevent infinite loops by blocking the bot from replying to itself
               if (data.senderId === BOT_ID) return;

               const incomingText = data.message.toLowerCase().trim();
               let responseText = "";

               // Rules-based AI routing logic
               if (incomingText.includes("hello") || incomingText.includes("hi")) {
                    responseText = `Hello ${data.user}! Welcome to the  Messenger chat app. How can I assist you today?`;
               } else if (incomingText.includes("help")) {
                    responseText = "Available keywords: 'status' for server health, or 'time' for the system clock.";
               } else if (incomingText.includes("status")) {
                    responseText = `Server status: Operational 🟢. Node cluster healthy.`;
               } else if (incomingText.includes("time")) {
                    responseText = `The current server system time is: ${new Date().toLocaleTimeString()}`;
               } else {
                    return; // Silent if no keyword match to avoid spamming the chat
               }

               // Simulate human typing latency (1.2 seconds)
               setTimeout(() => {
                    io.emit("chat-message", {
                         user: BOT_NAME,
                         message: responseText,
                         senderId: BOT_ID // Flagged as bot internal ID
                    });
               }, 1200);
          });
     });
}


module.exports = initBot;
// needProcessor.js
function initNeedProcessor(io) {
     const ASST_NAME = "Need Resolver 🛠️";
     const ASST_ID = "NEED_PROCESSOR_INTERNAL";

     io.on("connection", (socket) => {
          socket.on("chat-message", (data) => {
               // Ignore messages sent by the system processors
               if (data.senderId === ASST_ID || data.senderId === "SERVER_BOT_INTERNAL") return;

               const incomingText = data.message.toLowerCase().trim();
               let responseText = "";

               // Regex to capture anything after "i need" or "we need"
               const needMatch = incomingText.match(/(?:i|we)\s+need\s+(.+)/);

               if (needMatch) {
                    const itemNeeded = needMatch[1].replace(/[?.!]/g, ""); // Clean punctuation
                    responseText = `Received! You noted a need for: "${itemNeeded}". I have logged this request for ${data.user}.`;
               } else if (incomingText === "needs" || incomingText === "help need") {
                    responseText = "To register a systemic requirement, simply type: 'I need [your request here]'.";
               }

               // If a specific need condition was met, reply with a tiny delay
               if (responseText) {
                    setTimeout(() => {
                         io.emit("chat-message", {
                              user: ASST_NAME,
                              message: responseText,
                              senderId: ASST_ID
                         });
                    }, 1000);
               }
          });
     });
}

module.exports = initNeedProcessor;
