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
      '        local originalFunc = gg[funcName] or getfenv()[funcName]',
      '        if originalFunc then',
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
      'local function TryHookNested(parentName, funcName, replacementFunc)',
      '    pcall(function()',
      '        local gg = getgenv and getgenv() or _G',
      '        local parent = gg[parentName] or _G[parentName]',
      '        if parent and parent[funcName] then',
      '            if hookfunction then',
      '                pcall(hookfunction, parent[funcName], replacementFunc)',
      '            end',
      '            pcall(function() parent[funcName] = replacementFunc end)',
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
      'TryHook("rconsolewarn", function(t) Detect("rconsolewarn") return nil end)',
      'TryHook("rconsoleerr", function(t) Detect("rconsoleerr") return nil end)',
      '',
      'TryHook("getgc", function(...) Detect("getgc") return {} end)',
      'TryHook("getreg", function(...) Detect("getreg") return {} end)',
      'TryHook("getloadedmodules", function(...) Detect("getloadedmodules") return {} end)',
      'TryHook("getscripts", function(...) Detect("getscripts") return {} end)',
      'TryHook("getrunningscripts", function(...) Detect("getrunningscripts") return {} end)',
      'TryHook("getconnections", function(...) Detect("getconnections") return {} end)',
      '',
      'TryHook("decompile", function(...) Detect("decompile") return "" end)',
      'TryHook("getscriptbytecode", function(...) Detect("getscriptbytecode") return "" end)',
      'TryHook("getscripthash", function(...) Detect("getscripthash") return "" end)',
      'TryHook("dumpstring", function(...) Detect("dumpstring") return "" end)',
      '',
      'TryHookNested("string", "dump", function(...) Detect("string.dump") return "" end)',
      '',
      'TryHookNested("debug", "getupvalues", function(...) Detect("debug.getupvalues") return {} end)',
      'TryHookNested("debug", "getupvalue", function(...) Detect("debug.getupvalue") return nil end)',
      'TryHookNested("debug", "getconstants", function(...) Detect("debug.getconstants") return {} end)',
      'TryHookNested("debug", "getconstant", function(...) Detect("debug.getconstant") return nil end)',
      'TryHookNested("debug", "getproto", function(...) Detect("debug.getproto") return nil end)',
      'TryHookNested("debug", "getprotos", function(...) Detect("debug.getprotos") return {} end)',
      'TryHookNested("debug", "getinfo", function(f) Detect("debug.getinfo") return {source="?", short_src="?", currentline=0} end)',
      '',
      'pcall(function()',
      '    local realG = _G',
      '    local blockedKeys = {}',
      '    local mt = getmetatable(_G)',
      '    if not mt then',
      '        mt = {}',
      '        setmetatable(_G, mt)',
      '    end',
      '    local oldNewindex = mt.__newindex',
      '    mt.__newindex = function(t, k, v)',
      '        if type(v) == "string" and (v:find("lua%-drab") or v:find("sm%-vault") or v:find("HttpGet") or v:find("loadstring") or #v > 200) then',
      '            Detect("_G write")',
      '            return',
      '        end',
      '        if oldNewindex then',
      '            oldNewindex(t, k, v)',
      '        else',
      '            rawset(t, k, v)',
      '        end',
      '    end',
      'end)',
      '',
      'pcall(function()',
      '    if hookfunction and game.HttpGet then',
      '        local origHttpGet',
      '        origHttpGet = hookfunction(game.HttpGet, function(self, url, ...)',
      '            if type(url)=="string" and (url:find("lua%-drab") or url:find("sm%-vault")) then',
      '                Detect("HttpGet(hook)")',
      '            end',
      '            return origHttpGet(self, url, ...)',
      '        end)',
      '    end',
      'end)',
      '',
      'warn("==========================================")',
      'warn("     Lua.XYZ v1.2 - PROTECTION ACTIVE")',
      'warn("     All theft methods are monitored")',
      'warn("     Any attempt will be detected")',
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
