const activeTokens = new Map();
const usedTokens = new Set();
const ipRequests = new Map();
const hwidBans = new Set();

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
  const action = req.query.action || (req.body && req.body.action) || '';

  if (hwidBans.has(ip)) {
    res.status(403).send('print("Nice Try")');
    return;
  }

  if (method === 'GET' && !action && !userAgent.toLowerCase().includes('roblox')) {
    const trollPage = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Not Found</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0a;color:#fff;font-family:\'Arial Black\',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;text-align:center}.emoji{font-size:180px;display:block;margin-bottom:20px}.big-text{font-size:120px;font-weight:900;color:#fff;line-height:1.1;letter-spacing:-3px}.subtitle{font-size:28px;color:#888;margin-top:20px;font-weight:bold}.link{display:inline-block;margin-top:40px;padding:15px 40px;background:#fff;color:#000;text-decoration:none;border-radius:8px;font-size:18px;font-weight:bold}</style></head><body><div><div class="emoji">&#128526;</div><div class="big-text">Not Found</div><div class="subtitle">You cannot access this resource</div><a href="https://sm-vault-xyz.vercel.app/" class="link">Buy Source Code</a></div></body></html>';
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(trollPage);
    return;
  }

  const times = ipRequests.get(ip) || [];
  const recent = times.filter(t => now - t < 10000);
  if (recent.length >= 10) {
    hwidBans.add(ip);
    setTimeout(() => hwidBans.delete(ip), 30000);
    res.status(429).send('print("Nice Try")');
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
      res.status(403).send('print("Nice Try")');
      return;
    }
    
    const tokenData = activeTokens.get(token);
    if (tokenData.used) {
      hwidBans.add(ip);
      setTimeout(() => hwidBans.delete(ip), 60000);
      res.status(403).send('print("Nice Try")');
      return;
    }
    
    if (now - tokenData.created > 30000) {
      activeTokens.delete(token);
      res.status(403).send('print("Nice Try")');
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
      res.status(403).send('print("Nice Try")');
      return;
    }
    
    const keyData = activeTokens.get(key);
    if (!keyData.isKey || keyData.used) {
      hwidBans.add(ip);
      setTimeout(() => hwidBans.delete(ip), 60000);
      res.status(403).send('print("Nice Try")');
      return;
    }
    
    if (keyData.hwid !== hwid) {
      res.status(403).send('print("Nice Try")');
      return;
    }
    
    if (now - keyData.created > 15000) {
      activeTokens.delete(key);
      res.status(403).send('print("Nice Try")');
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

  res.status(404).send('print("Nice Try")');
}

function generateScript() {
  return [
    'local originalClipboard = {}',
    'local function BlockedClipboard(text)',
    '    if type(text) == "string" then',
    '        if text:find("lua%-drab") or text:find("HttpGet") or text:find("loadstring") or text:find("sm%-vault") or #text > 300 then',
    '            warn("[SM-VAULT] Clipboard blocked")',
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
    'warn("==========================================")',
    'warn("     SM-VAULT LOADED")',
    'warn("     Debug = 1x0")',
    'warn("     Debug = 2x0")',
    'warn("     Debug = 0x1")',
    'warn("==========================================")',
    '',
    'print("hey")'
  ].join('\n');
}

export const config = {
  api: {
    bodyParser: true,
  },
}
