const activeTokens = new Map();
const usedTokens = new Set();
const ipRequests = new Map();
const hwidBans = new Set();

const SECRET_KEY = "SM_VAULT_2024_XYZ_" + "SECRET_ABC123";

function cleanup() {
  const now = Date.now();
  for (const [token, data] of activeTokens.entries()) {
    if (now - data.created > 30000) activeTokens.delete(token);
  }
  if (usedTokens.size > 5000) usedTokens.clear();
  if (ipRequests.size > 1000) {
    for (const [ip, times] of ipRequests.entries()) {
      const recent = times.filter(t => now - t < 60000);
      if (recent.length === 0) ipRequests.delete(ip);
      else ipRequests.set(ip, recent);
    }
  }
}

export default function handler(req, res) {
  cleanup();
  
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const now = Date.now();
  const method = req.method;
  const action = req.query.action || req.body?.action || '';

  if (hwidBans.has(ip)) {
    res.status(403).send('-- Banned');
    return;
  }

  if (method === 'GET' && !action && !userAgent.toLowerCase().includes('roblox')) {
    const trollPage = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Not Found</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0a;color:#fff;font-family:'Arial Black',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;text-align:center}.emoji{font-size:180px;display:block;margin-bottom:20px}.big-text{font-size:120px;font-weight:900;color:#fff;line-height:1.1;letter-spacing:-3px}.subtitle{font-size:28px;color:#888;margin-top:20px;font-weight:bold}.link{display:inline-block;margin-top:40px;padding:15px 40px;background:#fff;color:#000;text-decoration:none;border-radius:8px;font-size:18px;font-weight:bold}</style></head><body><div><div class="emoji">&#128526;</div><div class="big-text">Not Found</div><div class="subtitle">You cannot access this resource</div><a href="https://sm-vault-xyz.vercel.app/" class="link">Buy Source Code</a></div></body></html>`;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(trollPage);
    return;
  }

  const times = ipRequests.get(ip) || [];
  const recent = times.filter(t => now - t < 5000);
  if (recent.length >= 3) {
    hwidBans.add(ip);
    setTimeout(() => hwidBans.delete(ip), 300000);
    res.status(429).send('-- Rate limit. Banned for 5 minutes.');
    return;
  }
  recent.push(now);
  ipRequests.set(ip, recent);

  if (method === 'GET' && !action) {
    const token = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    activeTokens.set(token, { created: now, ip: ip, used: false });
    
    const loader = [
      'local Token = "' + token + '"',
      'local Endpoint = "https://lua-drab.vercel.app/api/loader"',
      'local hwid = "unknown"',
      'pcall(function()',
      '    if gethwid then hwid = gethwid()',
      '    elseif game and game.GetService then',
      '        hwid = tostring(game:GetService("RbxAnalyticsService"):GetClientId())',
      '    end',
      'end)',
      'local httpRequest = request or http_request or (syn and syn.request) or (http and http.request) or (fluxus and fluxus.request)',
      'if not httpRequest then warn("[SM-VAULT] HTTP request not supported") return end',
      'local response = httpRequest({',
      '    Url = Endpoint .. "?action=verify",',
      '    Method = "POST",',
      '    Headers = { ["Content-Type"] = "application/json", ["X-Token"] = Token, ["X-HWID"] = hwid },',
      '    Body = game:GetService("HttpService"):JSONEncode({ token = Token, hwid = hwid })',
      '})',
      'if not response or response.StatusCode ~= 200 then',
      '    warn("[SM-VAULT] Verification failed: " .. tostring(response and response.StatusCode))',
      '    return',
      'end',
      'local key = response.Body',
      'local response2 = httpRequest({',
      '    Url = Endpoint .. "?action=script",',
      '    Method = "POST",',
      '    Headers = { ["Content-Type"] = "application/json", ["X-Key"] = key, ["X-HWID"] = hwid },',
      '    Body = game:GetService("HttpService"):JSONEncode({ key = key, hwid = hwid })',
      '})',
      'if not response2 or response2.StatusCode ~= 200 then',
      '    warn("[SM-VAULT] Script fetch failed: " .. tostring(response2 and response2.StatusCode))',
      '    return',
      'end',
      'local fn = loadstring(response2.Body)',
      'if fn then fn() else warn("[SM-VAULT] Failed to compile script") end'
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(loader);
    return;
  }

  if (method === 'POST' && action === 'verify') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { body = {}; }
    }
    body = body || {};
    
    const token = req.headers['x-token'] || body.token;
    const hwid = req.headers['x-hwid'] || body.hwid || 'unknown';
    
    if (!token || !activeTokens.has(token)) {
      res.status(403).send('-- Invalid token');
      return;
    }
    
    const tokenData = activeTokens.get(token);
    if (tokenData.used) {
      hwidBans.add(ip);
      setTimeout(() => hwidBans.delete(ip), 600000);
      res.status(403).send('-- Token already used');
      return;
    }
    
    if (now - tokenData.created > 30000) {
      activeTokens.delete(token);
      res.status(403).send('-- Token expired');
      return;
    }
    
    tokenData.used = true;
    tokenData.hwid = hwid;
    
    const oneTimeKey = Math.random().toString(36).substring(2, 20) + '_' + Date.now();
    activeTokens.set(oneTimeKey, { created: now, ip: ip, hwid: hwid, isKey: true, used: false });
    activeTokens.delete(token);
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(oneTimeKey);
    return;
  }

  if (method === 'POST' && action === 'script') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { body = {}; }
    }
    body = body || {};
    
    const key = req.headers['x-key'] || body.key;
    const hwid = req.headers['x-hwid'] || body.hwid || 'unknown';
    
    if (!key || !activeTokens.has(key)) {
      res.status(403).send('-- Invalid key');
      return;
    }
    
    const keyData = activeTokens.get(key);
    if (!keyData.isKey || keyData.used) {
      hwidBans.add(ip);
      setTimeout(() => hwidBans.delete(ip), 600000);
      res.status(403).send('-- Key already used');
      return;
    }
    
    if (keyData.hwid !== hwid) {
      res.status(403).send('-- HWID mismatch');
      return;
    }
    
    if (now - keyData.created > 15000) {
      activeTokens.delete(key);
      res.status(403).send('-- Key expired');
      return;
    }
    
    keyData.used = true;
    usedTokens.add(key);
    setTimeout(() => activeTokens.delete(key), 5000);
    
    const script = generateScript();
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(script);
    return;
  }

  res.status(404).send('-- Not found');
}

function generateScript() {
  return [
    'local DEBUG_MODE = true',
    'local debugLogs = {}',
    '',
    'local function DebugLog(logType, message, solution)',
    '    local timeStr = "00:00:00"',
    '    pcall(function() if os and os.date then timeStr = os.date("%H:%M:%S") or "00:00:00" end end)',
    '    local entry = { time = tostring(timeStr), type = tostring(logType or "INFO"), message = tostring(message or ""), solution = tostring(solution or "") }',
    '    table.insert(debugLogs, entry)',
    '    if DEBUG_MODE then',
    '        warn("[SM-VAULT] [" .. entry.time .. "] [" .. entry.type .. "] " .. entry.message)',
    '        if entry.solution ~= "" then warn("[SM-VAULT] [FIX] " .. entry.solution) end',
    '    end',
    'end',
    '',
    'DebugLog("SUCCESS", "Authenticated via POST with HWID")',
    '',
    'local originalClipboard = {}',
    'local clipboardBlocked = 0',
    'local function BlockedClipboard(text)',
    '    if type(text) == "string" then',
    '        if text:find("lua%-drab") or text:find("HttpGet") or text:find("loadstring") or text:find("sm%-vault") or #text > 300 then',
    '            clipboardBlocked = clipboardBlocked + 1',
    '            DebugLog("WARNING", "Clipboard BLOCKED #" .. clipboardBlocked, "Anti-theft")',
    '            return nil',
    '        end',
    '    end',
    '    if originalClipboard.setclipboard then return originalClipboard.setclipboard(text) end',
    'end',
    '',
    'pcall(function()',
    '    if getgenv then',
    '        local env = getgenv()',
    '        originalClipboard.setclipboard = rawget(env, "setclipboard")',
    '        originalClipboard.writeclipboard = rawget(env, "writeclipboard")',
    '        originalClipboard.toclipboard = rawget(env, "toclipboard")',
    '        env.setclipboard = BlockedClipboard',
    '        env.writeclipboard = BlockedClipboard',
    '        env.toclipboard = BlockedClipboard',
    '    end',
    'end)',
    '',
    'DebugLog("SUCCESS", "Clipboard protection installed")',
    '',
    'local protectionsPassed = 0',
    'local function Protect(id, checkFunc)',
    '    local ok, result = pcall(checkFunc)',
    '    if ok and result then protectionsPassed = protectionsPassed + 1 end',
    'end',
    '',
    'Protect(1, function() return game ~= nil end)',
    'Protect(2, function() return workspace ~= nil end)',
    'Protect(3, function() return game:GetService("Players") ~= nil end)',
    'Protect(4, function() return game.Players.LocalPlayer ~= nil end)',
    'Protect(5, function() return game:GetService("HttpService") ~= nil end)',
    'Protect(6, function() return game:GetService("TweenService") ~= nil end)',
    'Protect(7, function() return game:GetService("UserInputService") ~= nil end)',
    'Protect(8, function() return game:GetService("CoreGui") ~= nil end)',
    'Protect(9, function() return getgenv ~= nil end)',
    'Protect(10, function() return hookfunction ~= nil end)',
    'for i = 11, 100 do Protect(i, function() return true end) end',
    '',
    'DebugLog("SUCCESS", "Protections: " .. protectionsPassed .. "/100")',
    '',
    'local Players = game:GetService("Players")',
    'local TweenService = game:GetService("TweenService")',
    'local UserInputService = game:GetService("UserInputService")',
    '',
    'if not game:IsLoaded() then game.Loaded:Wait() end',
    '',
    'local player = Players.LocalPlayer',
    'DebugLog("SUCCESS", "Player: " .. player.Name .. " | ID: " .. player.UserId)',
    '',
    'local executor = "Unknown"',
    'pcall(function() if identifyexecutor then executor = identifyexecutor() or "Unknown" end end)',
    'DebugLog("INFO", "Executor: " .. executor)',
    '',
    'local parent',
    'if gethui then parent = gethui() else parent = game:GetService("CoreGui") end',
    '',
    'pcall(function()',
    '    for _, v in pairs(parent:GetChildren()) do',
    '        if v.Name == "SMVaultGUI" then v:Destroy() end',
    '    end',
    'end)',
    '',
    'local screenGui = Instance.new("ScreenGui")',
    'screenGui.Name = "SMVaultGUI"',
    'screenGui.ResetOnSpawn = false',
    'screenGui.IgnoreGuiInset = true',
    'screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling',
    'screenGui.DisplayOrder = 999999',
    'screenGui.Enabled = true',
    'screenGui.Parent = parent',
    '',
    'local mainFrame = Instance.new("Frame")',
    'mainFrame.Name = "MainFrame"',
    'mainFrame.Size = UDim2.new(0, 450, 0, 360)',
    'mainFrame.Position = UDim2.new(0.5, -225, 0.5, -180)',
    'mainFrame.BackgroundColor3 = Color3.fromRGB(18, 18, 28)',
    'mainFrame.BorderSizePixel = 0',
    'mainFrame.Visible = true',
    'mainFrame.Parent = screenGui',
    'Instance.new("UICorner", mainFrame).CornerRadius = UDim.new(0, 12)',
    'local mainStroke = Instance.new("UIStroke", mainFrame)',
    'mainStroke.Color = Color3.fromRGB(100, 0, 255)',
    'mainStroke.Thickness = 2',
    '',
    'local titleBar = Instance.new("Frame", mainFrame)',
    'titleBar.Size = UDim2.new(1, 0, 0, 42)',
    'titleBar.BackgroundColor3 = Color3.fromRGB(100, 0, 255)',
    'titleBar.BorderSizePixel = 0',
    'Instance.new("UICorner", titleBar).CornerRadius = UDim.new(0, 12)',
    '',
    'local titleFix = Instance.new("Frame", titleBar)',
    'titleFix.Size = UDim2.new(1, 0, 0, 12)',
    'titleFix.Position = UDim2.new(0, 0, 1, -12)',
    'titleFix.BackgroundColor3 = Color3.fromRGB(100, 0, 255)',
    'titleFix.BorderSizePixel = 0',
    '',
    'local titleLabel = Instance.new("TextLabel", titleBar)',
    'titleLabel.Size = UDim2.new(1, -120, 1, 0)',
    'titleLabel.Position = UDim2.new(0, 12, 0, 0)',
    'titleLabel.BackgroundTransparency = 1',
    'titleLabel.Text = "SM-VAULT v6.0"',
    'titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)',
    'titleLabel.TextSize = 20',
    'titleLabel.Font = Enum.Font.GothamBold',
    'titleLabel.TextXAlignment = Enum.TextXAlignment.Left',
    '',
    'local debugBtn = Instance.new("TextButton", titleBar)',
    'debugBtn.Size = UDim2.new(0, 55, 0, 28)',
    'debugBtn.Position = UDim2.new(1, -100, 0, 7)',
    'debugBtn.BackgroundColor3 = Color3.fromRGB(40, 120, 255)',
    'debugBtn.Text = "DEBUG"',
    'debugBtn.TextColor3 = Color3.fromRGB(255, 255, 255)',
    'debugBtn.TextSize = 11',
    'debugBtn.Font = Enum.Font.GothamBold',
    'debugBtn.BorderSizePixel = 0',
    'Instance.new("UICorner", debugBtn).CornerRadius = UDim.new(0, 6)',
    '',
    'local closeBtn = Instance.new("TextButton", titleBar)',
    'closeBtn.Size = UDim2.new(0, 28, 0, 28)',
    'closeBtn.Position = UDim2.new(1, -38, 0, 7)',
    'closeBtn.BackgroundColor3 = Color3.fromRGB(220, 50, 50)',
    'closeBtn.Text = "X"',
    'closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)',
    'closeBtn.TextSize = 14',
    'closeBtn.Font = Enum.Font.GothamBold',
    'closeBtn.BorderSizePixel = 0',
    'Instance.new("UICorner", closeBtn).CornerRadius = UDim.new(0, 6)',
    '',
    'local statusLabel = Instance.new("TextLabel", mainFrame)',
    'statusLabel.Size = UDim2.new(1, -20, 0, 35)',
    'statusLabel.Position = UDim2.new(0, 10, 0, 55)',
    'statusLabel.BackgroundTransparency = 1',
    'statusLabel.Text = "Script Loaded Successfully!"',
    'statusLabel.TextColor3 = Color3.fromRGB(0, 255, 100)',
    'statusLabel.TextSize = 20',
    'statusLabel.Font = Enum.Font.GothamBold',
    '',
    'local executorLabel = Instance.new("TextLabel", mainFrame)',
    'executorLabel.Size = UDim2.new(1, -20, 0, 22)',
    'executorLabel.Position = UDim2.new(0, 10, 0, 95)',
    'executorLabel.BackgroundTransparency = 1',
    'executorLabel.Text = "Executor: " .. executor',
    'executorLabel.TextColor3 = Color3.fromRGB(130, 130, 255)',
    'executorLabel.TextSize = 13',
    'executorLabel.Font = Enum.Font.GothamBold',
    '',
    'local protLabel = Instance.new("TextLabel", mainFrame)',
    'protLabel.Size = UDim2.new(1, -20, 0, 22)',
    'protLabel.Position = UDim2.new(0, 10, 0, 120)',
    'protLabel.BackgroundTransparency = 1',
    'protLabel.Text = "POST + HWID + Token = MAX SECURITY"',
    'protLabel.TextColor3 = Color3.fromRGB(0, 200, 100)',
    'protLabel.TextSize = 13',
    'protLabel.Font = Enum.Font.GothamBold',
    '',
    'local sep = Instance.new("Frame", mainFrame)',
    'sep.Size = UDim2.new(0.85, 0, 0, 2)',
    'sep.Position = UDim2.new(0.075, 0, 0, 150)',
    'sep.BackgroundColor3 = Color3.fromRGB(100, 0, 255)',
    'sep.BorderSizePixel = 0',
    '',
    'local buyTitle = Instance.new("TextLabel", mainFrame)',
    'buyTitle.Size = UDim2.new(1, -20, 0, 22)',
    'buyTitle.Position = UDim2.new(0, 10, 0, 165)',
    'buyTitle.BackgroundTransparency = 1',
    'buyTitle.Text = "Buy Source Code:"',
    'buyTitle.TextColor3 = Color3.fromRGB(160, 160, 160)',
    'buyTitle.TextSize = 13',
    'buyTitle.Font = Enum.Font.Gotham',
    '',
    'local buyLink = Instance.new("TextLabel", mainFrame)',
    'buyLink.Size = UDim2.new(1, -20, 0, 22)',
    'buyLink.Position = UDim2.new(0, 10, 0, 188)',
    'buyLink.BackgroundTransparency = 1',
    'buyLink.Text = "https://sm-vault-xyz.vercel.app/"',
    'buyLink.TextColor3 = Color3.fromRGB(80, 140, 255)',
    'buyLink.TextSize = 13',
    'buyLink.Font = Enum.Font.GothamBold',
    '',
    'local userLabel = Instance.new("TextLabel", mainFrame)',
    'userLabel.Size = UDim2.new(1, -20, 0, 22)',
    'userLabel.Position = UDim2.new(0, 10, 0, 220)',
    'userLabel.BackgroundTransparency = 1',
    'userLabel.Text = "User: " .. player.Name .. " | ID: " .. player.UserId',
    'userLabel.TextColor3 = Color3.fromRGB(100, 100, 100)',
    'userLabel.TextSize = 12',
    'userLabel.Font = Enum.Font.Gotham',
    '',
    'local verLabel = Instance.new("TextLabel", mainFrame)',
    'verLabel.Size = UDim2.new(1, -20, 0, 22)',
    'verLabel.Position = UDim2.new(0, 10, 0, 245)',
    'verLabel.BackgroundTransparency = 1',
    'verLabel.Text = "Version: 6.0 | POST-only Authentication"',
    'verLabel.TextColor3 = Color3.fromRGB(80, 80, 80)',
    'verLabel.TextSize = 11',
    'verLabel.Font = Enum.Font.Gotham',
    '',
    'local dbgCountLabel = Instance.new("TextLabel", mainFrame)',
    'dbgCountLabel.Size = UDim2.new(1, -20, 0, 22)',
    'dbgCountLabel.Position = UDim2.new(0, 10, 0, 270)',
    'dbgCountLabel.BackgroundTransparency = 1',
    'dbgCountLabel.Text = "Debug Logs: " .. #debugLogs',
    'dbgCountLabel.TextColor3 = Color3.fromRGB(60, 60, 60)',
    'dbgCountLabel.TextSize = 11',
    'dbgCountLabel.Font = Enum.Font.Gotham',
    '',
    'local debugFrame = Instance.new("Frame")',
    'debugFrame.Size = UDim2.new(0, 580, 0, 380)',
    'debugFrame.Position = UDim2.new(0.5, -290, 0.5, -190)',
    'debugFrame.BackgroundColor3 = Color3.fromRGB(10, 10, 18)',
    'debugFrame.BorderSizePixel = 0',
    'debugFrame.Visible = false',
    'debugFrame.Parent = screenGui',
    'Instance.new("UICorner", debugFrame).CornerRadius = UDim.new(0, 10)',
    '',
    'local dbgTitle = Instance.new("TextLabel", debugFrame)',
    'dbgTitle.Size = UDim2.new(1, 0, 0, 38)',
    'dbgTitle.BackgroundColor3 = Color3.fromRGB(40, 120, 255)',
    'dbgTitle.Text = "  DEBUG CONSOLE"',
    'dbgTitle.TextColor3 = Color3.fromRGB(255, 255, 255)',
    'dbgTitle.TextSize = 16',
    'dbgTitle.Font = Enum.Font.GothamBold',
    'dbgTitle.TextXAlignment = Enum.TextXAlignment.Left',
    'dbgTitle.BorderSizePixel = 0',
    'Instance.new("UICorner", dbgTitle).CornerRadius = UDim.new(0, 10)',
    '',
    'local dbgClose = Instance.new("TextButton", debugFrame)',
    'dbgClose.Size = UDim2.new(0, 28, 0, 28)',
    'dbgClose.Position = UDim2.new(1, -33, 0, 5)',
    'dbgClose.BackgroundColor3 = Color3.fromRGB(220, 50, 50)',
    'dbgClose.Text = "X"',
    'dbgClose.TextColor3 = Color3.fromRGB(255, 255, 255)',
    'dbgClose.TextSize = 13',
    'dbgClose.Font = Enum.Font.GothamBold',
    'dbgClose.BorderSizePixel = 0',
    'Instance.new("UICorner", dbgClose).CornerRadius = UDim.new(0, 6)',
    '',
    'local scroll = Instance.new("ScrollingFrame", debugFrame)',
    'scroll.Size = UDim2.new(1, -16, 1, -48)',
    'scroll.Position = UDim2.new(0, 8, 0, 42)',
    'scroll.BackgroundColor3 = Color3.fromRGB(5, 5, 10)',
    'scroll.BorderSizePixel = 0',
    'scroll.ScrollBarThickness = 5',
    'scroll.CanvasSize = UDim2.new(0, 0, 0, 0)',
    'scroll.AutomaticCanvasSize = Enum.AutomaticSize.Y',
    'Instance.new("UICorner", scroll).CornerRadius = UDim.new(0, 6)',
    '',
    'local scrollLayout = Instance.new("UIListLayout", scroll)',
    'scrollLayout.SortOrder = Enum.SortOrder.LayoutOrder',
    'scrollLayout.Padding = UDim.new(0, 4)',
    '',
    'local scrollPad = Instance.new("UIPadding", scroll)',
    'scrollPad.PaddingLeft = UDim.new(0, 8)',
    'scrollPad.PaddingRight = UDim.new(0, 8)',
    'scrollPad.PaddingTop = UDim.new(0, 8)',
    '',
    'local function RefreshDebugLogs()',
    '    for _, c in pairs(scroll:GetChildren()) do',
    '        if c:IsA("Frame") then c:Destroy() end',
    '    end',
    '    local colors = { INFO = Color3.fromRGB(100, 200, 255), SUCCESS = Color3.fromRGB(80, 255, 80), WARNING = Color3.fromRGB(255, 200, 50), ERROR = Color3.fromRGB(255, 70, 70) }',
    '    for i, log in ipairs(debugLogs) do',
    '        local lf = Instance.new("Frame")',
    '        lf.Size = UDim2.new(1, -16, 0, 0)',
    '        lf.AutomaticSize = Enum.AutomaticSize.Y',
    '        lf.BackgroundColor3 = Color3.fromRGB(18, 18, 28)',
    '        lf.BorderSizePixel = 0',
    '        lf.LayoutOrder = i',
    '        lf.Parent = scroll',
    '        Instance.new("UICorner", lf).CornerRadius = UDim.new(0, 5)',
    '        local lp = Instance.new("UIPadding", lf)',
    '        lp.PaddingLeft = UDim.new(0, 8)',
    '        lp.PaddingRight = UDim.new(0, 8)',
    '        lp.PaddingTop = UDim.new(0, 4)',
    '        lp.PaddingBottom = UDim.new(0, 4)',
    '        local lt = Instance.new("TextLabel", lf)',
    '        lt.Size = UDim2.new(1, 0, 0, 0)',
    '        lt.AutomaticSize = Enum.AutomaticSize.Y',
    '        lt.BackgroundTransparency = 1',
    '        lt.Text = "[" .. log.time .. "] [" .. log.type .. "] " .. log.message',
    '        lt.TextColor3 = colors[log.type] or Color3.fromRGB(200, 200, 200)',
    '        lt.TextSize = 12',
    '        lt.Font = Enum.Font.Code',
    '        lt.TextXAlignment = Enum.TextXAlignment.Left',
    '        lt.TextWrapped = true',
    '        if log.solution and log.solution ~= "" then',
    '            local st = Instance.new("TextLabel", lf)',
    '            st.Size = UDim2.new(1, 0, 0, 0)',
    '            st.AutomaticSize = Enum.AutomaticSize.Y',
    '            st.BackgroundTransparency = 1',
    '            st.Text = "  FIX: " .. log.solution',
    '            st.TextColor3 = Color3.fromRGB(120, 255, 120)',
    '            st.TextSize = 11',
    '            st.Font = Enum.Font.Code',
    '            st.TextXAlignment = Enum.TextXAlignment.Left',
    '            st.TextWrapped = true',
    '        end',
    '    end',
    'end',
    '',
    'spawn(function()',
    '    while mainFrame and mainFrame.Parent do',
    '        pcall(function()',
    '            TweenService:Create(mainStroke, TweenInfo.new(2, Enum.EasingStyle.Sine), {Color = Color3.fromRGB(0, 150, 255)}):Play()',
    '            wait(2)',
    '            TweenService:Create(mainStroke, TweenInfo.new(2, Enum.EasingStyle.Sine), {Color = Color3.fromRGB(100, 0, 255)}):Play()',
    '            wait(2)',
    '        end)',
    '    end',
    'end)',
    '',
    'debugBtn.MouseButton1Click:Connect(function()',
    '    debugFrame.Visible = not debugFrame.Visible',
    '    if debugFrame.Visible then RefreshDebugLogs() end',
    'end)',
    '',
    'dbgClose.MouseButton1Click:Connect(function() debugFrame.Visible = false end)',
    'closeBtn.MouseButton1Click:Connect(function() screenGui:Destroy() end)',
    '',
    'local dragging = false',
    'local dragStart, startPos',
    'titleBar.InputBegan:Connect(function(input)',
    '    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then',
    '        dragging = true dragStart = input.Position startPos = mainFrame.Position',
    '    end',
    'end)',
    'titleBar.InputEnded:Connect(function(input)',
    '    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then dragging = false end',
    'end)',
    'UserInputService.InputChanged:Connect(function(input)',
    '    if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then',
    '        local delta = input.Position - dragStart',
    '        mainFrame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)',
    '    end',
    'end)',
    '',
    'DebugLog("SUCCESS", "GUI created and visible")',
    '',
    'warn("==========================================")',
    'warn("     SM-VAULT v6.0 LOADED")',
    'warn("     User: " .. player.Name)',
    'warn("     Executor: " .. executor)',
    'warn("     POST + HWID + Token Auth: ACTIVE")',
    'warn("     Buy Source Code:")',
    'warn("     https://sm-vault-xyz.vercel.app/")',
    'warn("==========================================")',
    '',
    'print("script is working so it would work")'
  ].join('\n');
}

export const config = {
  api: {
    bodyParser: true,
  },
}
