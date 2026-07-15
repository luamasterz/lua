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
    const troll = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Not Found</title><style>body{background:#000;color:#0f0;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh}div{text-align:center}</style></head><body><div><h1>NICE TRY</h1><p>You cannot access this resource.</p><a href="https://sm-vault-xyz.vercel.app/">Buy Source Code</a></div></body></html>';
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
      'local original = {}',
      'local blocked = 0',
      'local function block(text)',
      '    if type(text)=="string" and (text:find("lua%-drab") or text:find("HttpGet") or text:find("loadstring") or text:find("sm%-vault") or #text>400) then',
      '        blocked=blocked+1 warn("[BLOCKED] Clipboard/File attempt #"..blocked)',
      '        return nil',
      '    end',
      '    if original.setclipboard then return original.setclipboard(text) end',
      'end',
      'pcall(function()',
      '    if getgenv then',
      '        local e=getgenv()',
      '        original.setclipboard=rawget(e,"setclipboard")',
      '        original.writeclipboard=rawget(e,"writeclipboard")',
      '        original.toclipboard=rawget(e,"toclipboard")',
      '        e.setclipboard=block',
      '        e.writeclipboard=block',
      '        e.toclipboard=block',
      '    end',
      '    if hookfunction and setclipboard then',
      '        original.setclipboard=hookfunction(setclipboard,block)',
      '    end',
      '    if writefile then hookfunction(writefile,function() warn("[BLOCKED] writefile attempt") end) end',
      '    if appendfile then hookfunction(appendfile,function() warn("[BLOCKED] appendfile attempt") end) end',
      '    if makefolder then hookfunction(makefolder,function() warn("[BLOCKED] makefolder attempt") end) end',
      'end)',
      'warn("==========================================")',
      'warn("     SM-VAULT v6.0 LOADED")',
      'warn("     MAXIMUM PROTECTION ENABLED")',
      'warn("     Buy Source Code:")',
      'warn("     https://sm-vault-xyz.vercel.app/")',
      'warn("==========================================")',
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
