const activeTokens = new Map();
const usedTokens = new Set();
const ipRequests = new Map();
const hwidBans = new Set();

function cleanup() {
  const now = Date.now();
  for (const [token, data] of activeTokens.entries()) {
    if (now - data.created > 25000) activeTokens.delete(token);
  }
  if (usedTokens.size > 8000) usedTokens.clear();
  if (ipRequests.size > 1500) {
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
  const action = req.query.action || (req.body && req.body.action) || '';

  if (hwidBans.has(ip)) {
    res.status(403).send('print("Nice Try")');
    return;
  }

  const times = ipRequests.get(ip) || [];
  const recent = times.filter(t => now - t < 8000);
  if (recent.length >= 6) {
    hwidBans.add(ip);
    setTimeout(() => hwidBans.delete(ip), 120000);
    res.status(429).send('print("Nice Try")');
    return;
  }
  recent.push(now);
  ipRequests.set(ip, recent);

  if (!userAgent.toLowerCase().includes('roblox')) {
    const troll = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Not Found</title><style>body{background:#000;color:#0f0;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh}div{text-align:center}h1{font-size:80px}a{color:#0af}</style></head><body><div><h1>NICE TRY</h1><p>You cannot access this resource.</p><a href="https://sm-vault-xyz.vercel.app/">Buy Source Code</a></div></body></html>';
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(troll);
    return;
  }

  if (method === 'GET' && !action) {
    const token = Math.random().toString(36).substring(2, 18) + Date.now().toString(36);
    activeTokens.set(token, { created: now, ip: ip, used: false });

    const loader = [
      'local Token = "' + token + '"',
      'local Endpoint = "https://lua-drab.vercel.app/api/loader"',
      'local hwid = "unknown"',
      'pcall(function() if gethwid then hwid = gethwid() elseif game and game.GetService then hwid = tostring(game:GetService("RbxAnalyticsService"):GetClientId()) end end)',
      'local http = request or http_request or (syn and syn.request) or (http and http.request)',
      'if not http then warn("No HTTP function") return end',
      'local r1 = http({Url=Endpoint.."?action=verify",Method="POST",Headers={["Content-Type"]="application/json",["X-Token"]=Token,["X-HWID"]=hwid},Body=game:GetService("HttpService"):JSONEncode({token=Token,hwid=hwid})})',
      'if not r1 or r1.StatusCode~=200 then warn("Verification failed") return end',
      'local key = r1.Body',
      'local r2 = http({Url=Endpoint.."?action=script",Method="POST",Headers={["Content-Type"]="application/json",["X-Key"]=key,["X-HWID"]=hwid},Body=game:GetService("HttpService"):JSONEncode({key=key,hwid=hwid})})',
      'if not r2 or r2.StatusCode~=200 then warn("Script fetch failed") return end',
      'loadstring(r2.Body)()'
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.status(200).send(loader);
    return;
  }

  if (method === 'POST' && action === 'verify') {
    let body = req.body || {};
    if (typeof body === 'string') try { body = JSON.parse(body); } catch(e){}
    const token = req.headers['x-token'] || body.token;
    const hwid = req.headers['x-hwid'] || body.hwid || 'unknown';

    if (!token || !activeTokens.has(token)) {
      res.status(403).send('print("Nice Try")');
      return;
    }

    const data = activeTokens.get(token);
    if (data.used || (now - data.created > 25000)) {
      hwidBans.add(ip);
      setTimeout(() => hwidBans.delete(ip), 120000);
      res.status(403).send('print("Nice Try")');
      return;
    }

    data.used = true;
    const oneTimeKey = Math.random().toString(36).substring(2, 22) + '_' + Date.now();
    activeTokens.set(oneTimeKey, { created: now, ip: ip, hwid: hwid, isKey: true, used: false });
    activeTokens.delete(token);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(oneTimeKey);
    return;
  }

  if (method === 'POST' && action === 'script') {
    let body = req.body || {};
    if (typeof body === 'string') try { body = JSON.parse(body); } catch(e){}
    const key = req.headers['x-key'] || body.key;
    const hwid = req.headers['x-hwid'] || body.hwid || 'unknown';

    if (!key || !activeTokens.has(key)) {
      res.status(403).send('print("Nice Try")');
      return;
    }

    const data = activeTokens.get(key);
    if (!data.isKey || data.used || data.hwid !== hwid || (now - data.created > 15000)) {
      hwidBans.add(ip);
      setTimeout(() => hwidBans.delete(ip), 120000);
      res.status(403).send('print("Nice Try")');
      return;
    }

    data.used = true;
    setTimeout(() => activeTokens.delete(key), 8000);

    const finalScript = [
      'local detectionCount = 0',
      '',
      'local function Detect(methodName)',
      '    detectionCount = detectionCount + 1',
      '    warn("[Lua.XYZ] (" .. methodName .. ") Was Detected By Lua.XYZ v1.2")',
      '    return nil',
      'end',
      '',
      'local function TryHook(funcName, replacementFunc)',
      '    pcall(function()',
      '        local gg = getgenv and getgenv() or _G',
      '        local originalFunc = gg[funcName]',
      '        if originalFunc and type(originalFunc) == "function" then',
      '            if hookfunction then',
      '                pcall(hookfunction, originalFunc, replacementFunc)',
      '            end',
      '            if getgenv then',
      '                pcall(function() getgenv()[funcName] = replacementFunc end)',
      '            end',
      '        end',
      '    end)',
      'end',
      '',
      'TryHook("setclipboard", function(t) Detect("setclipboard") return nil end)',
      'TryHook("writeclipboard", function(t) Detect("writeclipboard") return nil end)',
      'TryHook("toclipboard", function(t) Detect("toclipboard") return nil end)',
      'TryHook("writefile", function(p, d) Detect("writefile") return nil end)',
      'TryHook("appendfile", function(p, d) Detect("appendfile") return nil end)',
      'TryHook("makefolder", function(p) Detect("makefolder") return nil end)',
      'TryHook("delfile", function(p) Detect("delfile") return nil end)',
      'TryHook("rconsoleprint", function(t) Detect("rconsoleprint") return nil end)',
      'TryHook("rconsoleinfo", function(t) Detect("rconsoleinfo") return nil end)',
      'TryHook("decompile", function(...) Detect("decompile") return "" end)',
      'TryHook("getscriptbytecode", function(...) Detect("getscriptbytecode") return "" end)',
      'TryHook("dumpstring", function(...) Detect("dumpstring") return "" end)',
      '',
      'pcall(function()',
      '    if hookfunction and game and game.HttpGet then',
      '        local origHttpGet = nil',
      '        local hooked = function(self, url, ...)',
      '            if type(url)=="string" and (url:find("lua%-drab") or url:find("sm%-vault")) then',
      '                Detect("HttpGet(hook)")',
      '            end',
      '            if origHttpGet then',
      '                return origHttpGet(self, url, ...)',
      '            end',
      '        end',
      '        origHttpGet = hookfunction(game.HttpGet, hooked)',
      '    end',
      'end)',
      '',
      'local Players = game:GetService("Players")',
      'local TweenService = game:GetService("TweenService")',
      'local UserInputService = game:GetService("UserInputService")',
      '',
      'if not game:IsLoaded() then game.Loaded:Wait() end',
      '',
      'local player = Players.LocalPlayer',
      'local executor = "Unknown"',
      'pcall(function() if identifyexecutor then executor = identifyexecutor() or "Unknown" end end)',
      '',
      'local parent',
      'if gethui then parent = gethui() else parent = game:GetService("CoreGui") end',
      '',
      'pcall(function()',
      '    for _, v in pairs(parent:GetChildren()) do',
      '        if v.Name == "LuaXYZGUI" then v:Destroy() end',
      '    end',
      'end)',
      '',
      'local screenGui = Instance.new("ScreenGui")',
      'screenGui.Name = "LuaXYZGUI"',
      'screenGui.ResetOnSpawn = false',
      'screenGui.IgnoreGuiInset = true',
      'screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling',
      'screenGui.DisplayOrder = 999999',
      'screenGui.Enabled = true',
      'screenGui.Parent = parent',
      '',
      'local mainFrame = Instance.new("Frame")',
      'mainFrame.Name = "MainFrame"',
      'mainFrame.Size = UDim2.new(0, 400, 0, 260)',
      'mainFrame.Position = UDim2.new(0.5, -200, 0.5, -130)',
      'mainFrame.BackgroundColor3 = Color3.fromRGB(20, 20, 30)',
      'mainFrame.BorderSizePixel = 0',
      'mainFrame.Visible = true',
      'mainFrame.Parent = screenGui',
      'Instance.new("UICorner", mainFrame).CornerRadius = UDim.new(0, 10)',
      'local mainStroke = Instance.new("UIStroke", mainFrame)',
      'mainStroke.Color = Color3.fromRGB(100, 0, 255)',
      'mainStroke.Thickness = 2',
      '',
      'local titleBar = Instance.new("Frame", mainFrame)',
      'titleBar.Size = UDim2.new(1, 0, 0, 40)',
      'titleBar.BackgroundColor3 = Color3.fromRGB(100, 0, 255)',
      'titleBar.BorderSizePixel = 0',
      'Instance.new("UICorner", titleBar).CornerRadius = UDim.new(0, 10)',
      '',
      'local titleFix = Instance.new("Frame", titleBar)',
      'titleFix.Size = UDim2.new(1, 0, 0, 10)',
      'titleFix.Position = UDim2.new(0, 0, 1, -10)',
      'titleFix.BackgroundColor3 = Color3.fromRGB(100, 0, 255)',
      'titleFix.BorderSizePixel = 0',
      '',
      'local titleLabel = Instance.new("TextLabel", titleBar)',
      'titleLabel.Size = UDim2.new(1, -50, 1, 0)',
      'titleLabel.Position = UDim2.new(0, 15, 0, 0)',
      'titleLabel.BackgroundTransparency = 1',
      'titleLabel.Text = "Lua.XYZ v1.2"',
      'titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)',
      'titleLabel.TextSize = 20',
      'titleLabel.Font = Enum.Font.GothamBold',
      'titleLabel.TextXAlignment = Enum.TextXAlignment.Left',
      '',
      'local closeBtn = Instance.new("TextButton", titleBar)',
      'closeBtn.Size = UDim2.new(0, 28, 0, 28)',
      'closeBtn.Position = UDim2.new(1, -35, 0, 6)',
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
      'protLabel.Text = "Protection: ACTIVE"',
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
      'warn("==========================================")',
      'warn("     Lua.XYZ v1.2 - PROTECTION ACTIVE")',
      'warn("     Buy Source Code:")',
      'warn("     https://sm-vault-xyz.vercel.app/")',
      'warn("==========================================")',
      '',
      'print("hey")'
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(finalScript);
    return;
  }

  res.status(404).send('print("Nice Try")');
}

export const config = {
  api: { bodyParser: true }
}
