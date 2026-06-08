const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// ==========================================
// MODULE 1: Standard Greeting Bot Logic
// ==========================================
function initBot(io) {
     const BOT_NAME = "Server Assistant 🤖";
     const BOT_ID = "SERVER_BOT_INTERNAL";

     console.log(`[Bot Module] Initialized and linked internally.`);

     io.on("connection", (socket) => {
          socket.on("chat-message", (data) => {
               // Prevent loop spamming between automated components
               if (data.senderId === BOT_ID || data.senderId === "NEED_PROCESSOR_INTERNAL") return;

               const incomingText = data.message.toLowerCase().trim();
               let responseText = "";

               if (incomingText.includes("hello") || incomingText.includes("hi")) {
                    responseText = `Hello ${data.user}! Welcome to the Messenger chat app. How can I assist you today?`;
               } else if (incomingText.includes("help")) {
                    responseText = "Available keywords: 'status' for server health, or 'time' for the system clock.";
               } else if (incomingText.includes("status")) {
                    responseText = `Server status: Operational 🟢. Node cluster healthy.`;
               } else if (incomingText.includes("time")) {
                    responseText = `The current server system time is: ${new Date().toLocaleTimeString()}`;
               } else {
                    return;
               }

               setTimeout(() => {
                    io.emit("chat-message", {
                         user: BOT_NAME,
                         message: responseText,
                         senderId: BOT_ID
                    });
               }, 1200);
          });
     });
}

// ==========================================
// MODULE 2: Custom "Need" Extraction Processor
// ==========================================
function initNeedProcessor(io) {
     const ASST_NAME = "Need Resolver 🛠️";
     const ASST_ID = "NEED_PROCESSOR_INTERNAL";

     console.log(`[Need Processor Module] Initialized and linked internally.`);

     io.on("connection", (socket) => {
          socket.on("chat-message", (data) => {
               if (data.senderId === ASST_ID || data.senderId === "SERVER_BOT_INTERNAL") return;

               const incomingText = data.message.toLowerCase().trim();
               let responseText = "";

               const needMatch = incomingText.match(/(?:i|we)\s+need\s+(.+)/);

               if (needMatch) {
                    const itemNeeded = needMatch[1].replace(/[?.!]/g, "");
                    responseText = `Received! You noted a need for: "${itemNeeded}". I have logged this request for ${data.user}.`;
               } else if (incomingText === "needs" || incomingText === "help need") {
                    responseText = "To register a systemic requirement, simply type: 'I need [your request here]'.";
               }

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

// ==========================================
// INITIALIZE CENTRAL SOCKET MATRIX
// ==========================================
io.on("connection", (socket) => {
     socket.on("chat-message", (data) => {
          io.emit("chat-message", data);
     });
});

// Run both internal service agents
initBot(io);
initNeedProcessor(io);

// ==========================================
// UI WEB ROUTE DELIVERY LAYER
// ==========================================
app.get("/", (req, res) => {
     res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>3D Web Messenger</title>
     <style>
          :root {
               --wa-bg: #efeae2;
               --wa-green: #00a884;
               --bubble-sent: #d9fdd3;
               --bubble-received: #ffffff;
               --shadow-depth: 0 15px 35px rgba(0, 0, 0, 0.12), 0 5px 15px rgba(0, 0, 0, 0.08);
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
               font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
               background: linear-gradient(135deg, #111b21 0%, #222e35 100%);
               height: 100vh;
               display: flex;
               justify-content: center;
               align-items: center;
               padding: 20px;
          }
          .messenger-wrapper {
               width: 100%; max-width: 850px; height: 85vh;
               background: var(--wa-bg); border-radius: 16px;
               box-shadow: var(--shadow-depth); display: flex;
               flex-direction: column; overflow: hidden;
          }
          .header {
               background-color: #f0f2f5; padding: 14px 20px;
               display: flex; align-items: center; gap: 15px;
               border-bottom: 1px solid #e1e1e1;
          }
          .avatar {
               width: 40px; height: 40px; background: var(--wa-green);
               border-radius: 50%; display: flex; align-items: center;
               justify-content: center; color: white; font-weight: bold;
          }
          .header-info h2 { font-size: 16px; color: #111b21; }
          .header-info p { font-size: 12px; color: #667781; }
          #messages {
               flex: 1; padding: 24px; overflow-y: auto;
               display: flex; flex-direction: column; gap: 12px;
               background-image: url('https://githubusercontent.com');
               background-blend-mode: overlay; background-color: rgba(239, 234, 226, 0.95);
          }
          .message { max-width: 65%; padding: 8px 14px; font-size: 14.5px; line-height: 1.4; position: relative; word-wrap: break-word; box-shadow: 0 2px 5px rgba(0,0,0,0.06); }
          .sender-title { font-size: 12px; font-weight: 700; margin-bottom: 3px; display: block; }
          .sent { align-self: flex-end; background: var(--bubble-sent); color: #111b21; border-radius: 12px 0px 12px 12px; }
          .sent .sender-title { color: #0b8066; }
          .received { align-self: flex-start; background: var(--bubble-received); color: #111b21; border-radius: 0px 12px 12px 12px; }
          .received .sender-title { color: #51585b; }
          .footer-inputs { background-color: #f0f2f5; padding: 12px 20px; display: flex; align-items: center; gap: 12px; border-top: 1px solid #e1e1e1; }
          input { outline: none; border: 1px solid #fff; border-radius: 8px; padding: 12px 16px; font-size: 14px; background: #ffffff; }
          #name { width: 160px; font-weight: 600; color: #4f5e64; }
          #text { flex: 1; }
          button { background-color: var(--wa-green); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
          button:hover { background-color: #008f70; }
     </style>
</head>
<body>

     <div class="messenger-wrapper">
          <div class="header">
               <div class="avatar">💬</div>
               <div class="header-info">
                    <h2>Global Chatroom</h2>
                    <p>An online messenger app</p>
               </div>
          </div>

          <div id="messages"></div>

          <div class="footer-inputs">
               <input id="name" placeholder="Username" value="User_\${Math.floor(1000 + Math.random() * 9000)}">
               <input id="text" placeholder="Type a message or state a need...">
               <button onclick="sendMessage()">Send</button>
          </div>
     </div>

     <script src="/socket.io/socket.io.js"></script>
     <script>
          const socket = io();
          const messagesContainer = document.getElementById("messages");

          function addMessage(data) {
               const div = document.createElement("div");
               const isMine = data.senderId === socket.id;

               div.className = "message " + (isMine ? "sent" : "received");

               div.innerHTML = \`
                    <span class="sender-title">\${isMine ? "You" : data.user}</span>
                    <div>\${data.message}</div>
               \`;

               messagesContainer.appendChild(div);
               messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }

          // Main Send Trigger
          function sendMessage() {
               const userField = document.getElementById("name");
               const messageInput = document.getElementById("text");

               const user = userField.value.trim() || "Anonymous";
               const message = messageInput.value.trim();

               if (!message) return;

               socket.emit("chat-message", {
                    user,
                    message,
                    senderId: socket.id
               });

               messageInput.value = "";
          }

          document.getElementById("text").addEventListener("keypress", e => {
               if (e.key === "Enter") sendMessage();
          });

          socket.on("chat-message", data => {
               addMessage(data);
          });
     </script>
</body>
</html>
  `);
});

// Run single unified server
server.listen(PORT, () => {
     console.log(`3D Messenger running at http://localhost:${PORT}`);
});
