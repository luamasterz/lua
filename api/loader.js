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
      'local env = getfenv()',
      'local gg = getgenv and getgenv() or _G',
      '',
      'local origSetclipboard = gg.setclipboard or setclipboard',
      'local origWriteclipboard = gg.writeclipboard or writeclipboard',
      'local origToclipboard = gg.toclipboard or toclipboard',
      'local origWritefile = gg.writefile or writefile',
      'local origAppendfile = gg.appendfile or appendfile',
      'local origMakefolder = gg.makefolder or makefolder',
      'local origDelfile = gg.delfile or delfile',
      'local origRconsoleprint = gg.rconsoleprint or rconsoleprint',
      'local origRconsoleinfo = gg.rconsoleinfo or rconsoleinfo',
      'local origGetgc = gg.getgc or getgc',
      'local origGetreg = gg.getreg or getreg',
      'local origGetloadedmodules = gg.getloadedmodules or getloadedmodules',
      'local origGetscripts = gg.getscripts or getscripts',
      'local origGetrunningscripts = gg.getrunningscripts or getrunningscripts',
      'local origGetconnections = gg.getconnections or getconnections',
      'local origDecompile = gg.decompile or decompile',
      'local origGetscriptbytecode = gg.getscriptbytecode or getscriptbytecode',
      'local origDumpstring = gg.dumpstring or dumpstring',
      'local origStringDump = string.dump',
      'local origDebugGetupvalues = debug and debug.getupvalues',
      'local origDebugGetupvalue = debug and debug.getupvalue',
      'local origDebugGetconstants = debug and debug.getconstants',
      'local origDebugGetconstant = debug and debug.getconstant',
      'local origDebugGetproto = debug and debug.getproto',
      'local origDebugGetprotos = debug and debug.getprotos',
      '',
      'local function newSetclipboard(t) Detect("setclipboard") return nil end',
      'local function newWriteclipboard(t) Detect("writeclipboard") return nil end',
      'local function newToclipboard(t) Detect("toclipboard") return nil end',
      'local function newWritefile(p, d) Detect("writefile") return nil end',
      'local function newAppendfile(p, d) Detect("appendfile") return nil end',
      'local function newMakefolder(p) Detect("makefolder") return nil end',
      'local function newDelfile(p) Detect("delfile") return nil end',
      'local function newRconsoleprint(t) Detect("rconsoleprint") return nil end',
      'local function newRconsoleinfo(t) Detect("rconsoleinfo") return nil end',
      'local function newGetgc(...) Detect("getgc") return {} end',
      'local function newGetreg(...) Detect("getreg") return {} end',
      'local function newGetloadedmodules(...) Detect("getloadedmodules") return {} end',
      'local function newGetscripts(...) Detect("getscripts") return {} end',
      'local function newGetrunningscripts(...) Detect("getrunningscripts") return {} end',
      'local function newGetconnections(...) Detect("getconnections") return {} end',
      'local function newDecompile(...) Detect("decompile") return "" end',
      'local function newGetscriptbytecode(...) Detect("getscriptbytecode") return "" end',
      'local function newDumpstring(...) Detect("dumpstring") return "" end',
      'local function newStringDump(...) Detect("string.dump") return "" end',
      'local function newDebugGetupvalues(...) Detect("debug.getupvalues") return {} end',
      'local function newDebugGetupvalue(...) Detect("debug.getupvalue") return nil end',
      'local function newDebugGetconstants(...) Detect("debug.getconstants") return {} end',
      'local function newDebugGetconstant(...) Detect("debug.getconstant") return nil end',
      'local function newDebugGetproto(...) Detect("debug.getproto") return nil end',
      'local function newDebugGetprotos(...) Detect("debug.getprotos") return {} end',
      '',
      'if getgenv then',
      '    local e = getgenv()',
      '    if origSetclipboard then e.setclipboard = newSetclipboard end',
      '    if origWriteclipboard then e.writeclipboard = newWriteclipboard end',
      '    if origToclipboard then e.toclipboard = newToclipboard end',
      '    if origWritefile then e.writefile = newWritefile end',
      '    if origAppendfile then e.appendfile = newAppendfile end',
      '    if origMakefolder then e.makefolder = newMakefolder end',
      '    if origDelfile then e.delfile = newDelfile end',
      '    if origRconsoleprint then e.rconsoleprint = newRconsoleprint end',
      '    if origRconsoleinfo then e.rconsoleinfo = newRconsoleinfo end',
      '    if origGetgc then e.getgc = newGetgc end',
      '    if origGetreg then e.getreg = newGetreg end',
      '    if origGetloadedmodules then e.getloadedmodules = newGetloadedmodules end',
      '    if origGetscripts then e.getscripts = newGetscripts end',
      '    if origGetrunningscripts then e.getrunningscripts = newGetrunningscripts end',
      '    if origGetconnections then e.getconnections = newGetconnections end',
      '    if origDecompile then e.decompile = newDecompile end',
      '    if origGetscriptbytecode then e.getscriptbytecode = newGetscriptbytecode end',
      '    if origDumpstring then e.dumpstring = newDumpstring end',
      'end',
      '',
      'if string then string.dump = newStringDump end',
      '',
      'if debug then',
      '    if origDebugGetupvalues then debug.getupvalues = newDebugGetupvalues end',
      '    if origDebugGetupvalue then debug.getupvalue = newDebugGetupvalue end',
      '    if origDebugGetconstants then debug.getconstants = newDebugGetconstants end',
      '    if origDebugGetconstant then debug.getconstant = newDebugGetconstant end',
      '    if origDebugGetproto then debug.getproto = newDebugGetproto end',
      '    if origDebugGetprotos then debug.getprotos = newDebugGetprotos end',
      'end',
      '',
      'pcall(function()',
      '    if hookfunction then',
      '        if origSetclipboard then hookfunction(origSetclipboard, newSetclipboard) end',
      '        if origWriteclipboard then hookfunction(origWriteclipboard, newWriteclipboard) end',
      '        if origToclipboard then hookfunction(origToclipboard, newToclipboard) end',
      '        if origWritefile then hookfunction(origWritefile, newWritefile) end',
      '        if origAppendfile then hookfunction(origAppendfile, newAppendfile) end',
      '        if origMakefolder then hookfunction(origMakefolder, newMakefolder) end',
      '        if origDelfile then hookfunction(origDelfile, newDelfile) end',
      '        if origRconsoleprint then hookfunction(origRconsoleprint, newRconsoleprint) end',
      '        if origRconsoleinfo then hookfunction(origRconsoleinfo, newRconsoleinfo) end',
      '        if origGetgc then hookfunction(origGetgc, newGetgc) end',
      '        if origGetreg then hookfunction(origGetreg, newGetreg) end',
      '        if origGetloadedmodules then hookfunction(origGetloadedmodules, newGetloadedmodules) end',
      '        if origGetscripts then hookfunction(origGetscripts, newGetscripts) end',
      '        if origGetrunningscripts then hookfunction(origGetrunningscripts, newGetrunningscripts) end',
      '        if origGetconnections then hookfunction(origGetconnections, newGetconnections) end',
      '        if origDecompile then hookfunction(origDecompile, newDecompile) end',
      '        if origGetscriptbytecode then hookfunction(origGetscriptbytecode, newGetscriptbytecode) end',
      '        if origDumpstring then hookfunction(origDumpstring, newDumpstring) end',
      '        if origDebugGetupvalues then hookfunction(origDebugGetupvalues, newDebugGetupvalues) end',
      '        if origDebugGetupvalue then hookfunction(origDebugGetupvalue, newDebugGetupvalue) end',
      '        if origDebugGetconstants then hookfunction(origDebugGetconstants, newDebugGetconstants) end',
      '        if origDebugGetconstant then hookfunction(origDebugGetconstant, newDebugGetconstant) end',
      '        if origDebugGetproto then hookfunction(origDebugGetproto, newDebugGetproto) end',
      '        if origDebugGetprotos then hookfunction(origDebugGetprotos, newDebugGetprotos) end',
      '    end',
      'end)',
      '',
      'pcall(function()',
      '    local realG = _G',
      '    local fakeG = setmetatable({}, {',
      '        __index = function(t, k) return rawget(realG, k) end,',
      '        __newindex = function(t, k, v)',
      '            if type(v) == "string" and (v:find("lua%-drab") or v:find("sm%-vault") or v:find("HttpGet") or v:find("loadstring") or #v > 200) then',
      '                Detect("_G write")',
      '                return',
      '            end',
      '            rawset(realG, k, v)',
      '        end',
      '    })',
      '    if getgenv then getgenv()._G = fakeG end',
      '    env._G = fakeG',
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
