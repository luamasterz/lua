export default function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  
  if (!userAgent.toLowerCase().includes('roblox')) {
    res.status(404).send('Not Found');
    return;
  }

  const luaCode = `
-- =============================================
-- SM-VAULT PROTECTED SCRIPT
-- Buy Source Code: https://sm-vault-xyz.vercel.app/
-- =============================================

if not game:IsLoaded() then game.Loaded:Wait() end
if string.dump or getscriptbytecode then return end

warn("==========================================")
warn("     SM-VAULT")
warn("     Buy Source Code:")
warn("     https://sm-vault-xyz.vercel.app/")
warn("==========================================")

print("dziala skrypt wiec by dzialalo")
`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(luaCode);
}
