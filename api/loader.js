export default function handler(req, res) {
  const PUBLIC_URL = "https://lua-drab.vercel.app/api/loader";
  const SALT = "SMV3_PRIVATE_SALT_9xQ_2026";

  function sendNoCache(res) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  }

  function browserPage() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Not Found</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a;
    color: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    text-align: center;
  }
  .box {
    padding: 30px;
  }
  .emoji {
    font-size: 120px;
    margin-bottom: 20px;
  }
  .title {
    font-size: 95px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: -3px;
  }
  .sub {
    margin-top: 18px;
    color: #999999;
    font-size: 24px;
    font-weight: 600;
  }
  .btn {
    margin-top: 35px;
    display: inline-block;
    padding: 14px 34px;
    background: #ffffff;
    color: #000000;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 800;
  }
</style>
</head>
<body>
  <div class="box">
    <div class="emoji">&#128526;</div>
    <div class="title">Not Found</div>
    <div class="sub">You cannot access this resource</div>
    <a class="btn" href="https://sm-vault-xyz.vercel.app/">Buy Source Code</a>
  </div>
</body>
</html>`;
  }

  function makeKey(nonce) {
    return Buffer.from(String(nonce) + "|" + SALT, "utf8");
  }

  function encryptPayload(luaCode, nonce) {
    const input = Buffer.from(luaCode, "utf8");
    const key = makeKey(nonce);
    const out = Buffer.alloc(input.length);

    for (let i = 0; i < input.length; i++) {
      out[i] = (input[i] + key[i % key.length]) & 255;
    }

    return out.toString("base64");
  }

  const realLuaPayload = `
-- =============================================
-- SM-VAULT ENCRYPTED PAYLOAD v4.0
-- Buy Source Code: https://sm-vault-xyz.vercel.app/
-- =============================================

local DEBUG_MODE = true

local function SafeTime()
    local t = "00:00:00"
    pcall(function()
        if os and os.date then
            t = os.date("%H:%M:%S") or "00:00:00"
        end
    end)
    return tostring(t)
end

local function Log(level, message, fix)
    level = tostring(level or "INFO")
    message = tostring(message or "")
    fix = tostring(fix or "")

    warn("[SM-VAULT] [" .. SafeTime() .. "] [" .. level .. "] " .. message)

    if fix ~= "" then
        warn("[SM-VAULT] [FIX] " .. fix)
    end
end

Log("INFO", "Encrypted payload started")

local okServices, services = pcall(function()
    return {
        Players = game:GetService("Players"),
        RunService = game:GetService("RunService")
    }
end)

if not okServices then
    Log("ERROR", "Failed to load Roblox services", "Run this inside a Roblox game")
    return
end

local Players = services.Players

if not game:IsLoaded() then
    Log("INFO", "Game is not loaded yet, waiting")
    game.Loaded:Wait()
end

local player = Players.LocalPlayer

if not player then
    Log("ERROR", "LocalPlayer not found", "Wait until your character fully loads")
    return
end

local executor = "Unknown"

pcall(function()
    if identifyexecutor then
        executor = tostring(identifyexecutor() or "Unknown")
    end
end)

Log("SUCCESS", "Player detected: " .. player.Name .. " | ID: " .. tostring(player.UserId))
Log("INFO", "Executor: " .. executor)

-- Soft clipboard guard.
-- This cannot block setclipboard(game:HttpGet(...)) before the script runs.
-- It only protects after the script has already executed.
pcall(function()
    if setclipboard and not getgenv().SMVaultClipboardGuard then
        getgenv().SMVaultClipboardGuard = true

        local oldSetClipboard = setclipboard

        setclipboard = function(text)
            local str = tostring(text or "")

            if str:find("SM%-VAULT") or str:find("lua%-drab%.vercel%.app") or str:find("sm%-vault%-xyz") then
                oldSetClipboard("Not Found")
                Log("WARNING", "Clipboard copy attempt blocked", "User tried to copy protected SM-VAULT content")
                return
            end

            return oldSetClipboard(text)
        end

        Log("SUCCESS", "Clipboard guard enabled")
    end
end)

warn("==========================================")
warn("     SM-VAULT v4.0 LOADED")
warn("     User: " .. player.Name)
warn("     Executor: " .. executor)
warn("     Payload: Encrypted POST")
warn("     Buy Source Code:")
warn("     https://sm-vault-xyz.vercel.app/")
warn("==========================================")

print("script is working so it would work")

Log("SUCCESS", "Script loaded without errors")
`;

  // =============================================
  // POST = ENCRYPTED PAYLOAD ENDPOINT
  // =============================================
  if (req.method === "POST") {
    sendNoCache(res);

    const clientHeader = req.headers["x-sm-client"] || "";

    if (clientHeader !== "SMV4") {
      res.status(404).send("Not Found");
      return;
    }

    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const nonce = body && body.nonce ? String(body.nonce) : "";

    if (!nonce || nonce.length < 8 || nonce.length > 128) {
      res.status(400).json({
        ok: false,
        error: "Invalid nonce"
      });
      return;
    }

    const encrypted = encryptPayload(realLuaPayload, nonce);

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      ok: true,
      version: "4.0",
      data: encrypted
    });
    return;
  }

  // =============================================
  // GET = BROWSER PAGE OR ROBLOX STUB LOADER
  // =============================================
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const userAgent = String(req.headers["user-agent"] || "").toLowerCase();

  if (!userAgent.includes("roblox")) {
    sendNoCache(res);
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(browserPage());
    return;
  }

  sendNoCache(res);

  const stubLua = `
-- SM-VAULT SECURE STUB v4.0
-- This is only a loader. Real payload is encrypted and fetched using POST.

local function C(tbl)
    local s = ""
    for _, v in ipairs(tbl) do
        s = s .. string.char(v)
    end
    return s
end

local URL = C({
    104,116,116,112,115,58,47,47,108,117,97,45,100,114,97,98,46,118,101,114,99,101,108,46,97,112,112,47,97,112,105,47,108,111,97,100,101,114
})

local SALT = C({
    83,77,86,51,95,80,82,73,86,65,84,69,95,83,65,76,84,95,57,120,81,95,50,48,50,54
})

local function Log(level, msg)
    warn("[SM-VAULT-STUB] [" .. tostring(level) .. "] " .. tostring(msg))
end

local function GetRequest()
    return request
        or http_request
        or (syn and syn.request)
        or (http and http.request)
        or (fluxus and fluxus.request)
end

local function B64Decode(data)
    local b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    data = tostring(data or ""):gsub("[^" .. b .. "=]", "")

    return (data:gsub(".", function(x)
        if x == "=" then
            return ""
        end

        local r, f = "", (b:find(x) - 1)

        for i = 6, 1, -1 do
            r = r .. ((f % 2^i - f % 2^(i - 1) > 0) and "1" or "0")
        end

        return r
    end):gsub("%d%d%d?%d?%d?%d?%d?%d?", function(x)
        if #x ~= 8 then
            return ""
        end

        local c = 0

        for i = 1, 8 do
            c = c + ((x:sub(i, i) == "1") and 2^(8 - i) or 0)
        end

        return string.char(c)
    end))
end

local function MakeKey(nonce)
    local raw = tostring(nonce) .. "|" .. SALT
    local key = {}

    for i = 1, #raw do
        key[i] = string.byte(raw, i)
    end

    return key
end

local function DecryptPayload(base64Data, nonce)
    local encrypted = B64Decode(base64Data)
    local key = MakeKey(nonce)
    local out = {}

    for i = 1, #encrypted do
        local encByte = string.byte(encrypted, i)
        local keyByte = key[((i - 1) % #key) + 1]
        out[i] = string.char((encByte - keyByte) % 256)
    end

    return table.concat(out)
end

local function JsonEncode(tbl)
    local HttpService = game:GetService("HttpService")
    return HttpService:JSONEncode(tbl)
end

local function JsonDecode(str)
    local HttpService = game:GetService("HttpService")
    return HttpService:JSONDecode(str)
end

local function MakeNonce()
    local uid = 0

    pcall(function()
        uid = game:GetService("Players").LocalPlayer.UserId
    end)

    return tostring(uid) .. "-" .. tostring(math.random(10000000, 99999999)) .. "-" .. tostring(tick())
end

local function Main()
    if not loadstring then
        Log("ERROR", "loadstring is not available")
        return
    end

    local req = GetRequest()

    if not req then
        Log("ERROR", "HTTP request function not found")
        Log("FIX", "Use an executor with request/http_request support")
        return
    end

    local nonce = MakeNonce()

    local response = req({
        Url = URL,
        Method = "POST",
        Headers = {
            ["Content-Type"] = "application/json",
            ["X-SM-Client"] = "SMV4"
        },
        Body = JsonEncode({
            nonce = nonce,
            version = "4.0"
        })
    })

    local status = tonumber(response.StatusCode or response.Status or 0)
    local body = tostring(response.Body or response.body or "")

    if status ~= 200 then
        Log("ERROR", "Payload request failed. Status: " .. tostring(status))
        Log("DEBUG", string.sub(body, 1, 200))
        return
    end

    local okDecode, decoded = pcall(function()
        return JsonDecode(body)
    end)

    if not okDecode or not decoded or not decoded.ok or not decoded.data then
        Log("ERROR", "Failed to decode payload response")
        Log("DEBUG", string.sub(body, 1, 200))
        return
    end

    local realCode = DecryptPayload(decoded.data, nonce)

    if not realCode or #realCode < 10 then
        Log("ERROR", "Decrypted payload is empty")
        return
    end

    local fn, err = loadstring(realCode)

    if not fn then
        Log("ERROR", "loadstring failed: " .. tostring(err))
        return
    end

    local okRun, runErr = pcall(fn)

    if not okRun then
        Log("ERROR", "Payload runtime error: " .. tostring(runErr))
        return
    end
end

Main()
`;

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(stubLua);
}
