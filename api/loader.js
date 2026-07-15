export default function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  
  // =============================================
  // JESLI KTOS OTWIERA W PRZEGLADARCE - TROLLUJEMY GO
  // =============================================
  if (!userAgent.toLowerCase().includes('roblox')) {
    const trollPage = `
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title>404 - Page Not Found</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a0a;
    color: #00ff00;
    font-family: 'Courier New', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    overflow: hidden;
  }
  .container {
    text-align: center;
    z-index: 10;
    position: relative;
  }
  .troll-face {
    font-size: 120px;
    animation: bounce 0.5s infinite alternate;
  }
  .title {
    font-size: 42px;
    color: #ff0000;
    margin: 20px 0;
    text-shadow: 0 0 20px #ff0000;
    animation: glitch 0.3s infinite;
  }
  .subtitle {
    font-size: 22px;
    color: #ff6600;
    margin: 10px 0;
  }
  .message {
    font-size: 18px;
    color: #00ff00;
    margin: 15px 0;
    max-width: 600px;
    line-height: 1.6;
  }
  .laugh {
    font-size: 30px;
    color: #ffff00;
    margin: 20px 0;
    animation: shake 0.2s infinite;
  }
  .fake-error {
    background: #1a0000;
    border: 2px solid #ff0000;
    padding: 15px 25px;
    margin: 20px auto;
    max-width: 500px;
    border-radius: 8px;
    color: #ff4444;
    font-size: 14px;
  }
  .redirect-msg {
    color: #666;
    font-size: 14px;
    margin-top: 30px;
  }
  .matrix {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 1;
    opacity: 0.1;
  }
  @keyframes bounce {
    from { transform: translateY(0px) rotate(-5deg); }
    to { transform: translateY(-20px) rotate(5deg); }
  }
  @keyframes glitch {
    0% { text-shadow: 2px 0 #ff0000, -2px 0 #00ff00; }
    25% { text-shadow: -2px 0 #ff0000, 2px 0 #0000ff; }
    50% { text-shadow: 2px 2px #ff0000, -2px -2px #00ff00; }
    75% { text-shadow: -2px 2px #0000ff, 2px -2px #ff0000; }
    100% { text-shadow: 2px 0 #00ff00, -2px 0 #ff0000; }
  }
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-3px); }
    100% { transform: translateX(3px); }
  }
  .ip-box {
    background: #000;
    border: 1px solid #333;
    padding: 10px 20px;
    margin: 15px auto;
    max-width: 400px;
    border-radius: 5px;
    color: #ff0000;
    font-size: 16px;
  }
</style>
</head>
<body>

<div class="container">
  <div class="troll-face">&#128128;</div>
  <div class="title">NICE TRY BUDDY!</div>
  <div class="subtitle">Mysla les ze ukradniesz kod? XD</div>
  
  <div class="laugh">&#128514;&#128514;&#128514; HAHAHAHA &#128514;&#128514;&#128514;</div>
  
  <div class="message">
    Ten kod jest chroniony przez SM-VAULT Protection System.<br>
    Nie masz dostepu do zrodla skryptu.<br>
    Twoja proba zostala zapisana w logach.
  </div>

  <div class="fake-error">
    &#9888; [SM-VAULT SECURITY] Wykryto nieautoryzowany dostep!<br>
    &#9888; User-Agent: BROWSER (BLOCKED)<br>
    &#9888; Status: ACCESS DENIED<br>
    &#9888; Incydent zostal zarejestrowany.
  </div>

  <div class="ip-box">
    &#128373; Twoje IP zostalo zapisane w logach &#128373;
  </div>

  <div class="message" style="color: #888; font-size: 14px;">
    Chcesz dostep do kodu zrodlowego?<br>
    Kup go tutaj: <a href="https://sm-vault-xyz.vercel.app/" style="color: #00aaff;">sm-vault-xyz.vercel.app</a>
  </div>

  <div class="redirect-msg">
    Przekierowanie za <span id="countdown">5</span> sekund...
  </div>
</div>

<canvas class="matrix" id="matrix"></canvas>

<script>
// Countdown do rickrolla
let count = 5;
const countEl = document.getElementById('countdown');
setInterval(() => {
  count--;
  if (countEl) countEl.textContent = count;
  if (count <= 0) {
    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }
}, 1000);

// Matrix rain effect
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const chars = 'SMVAULT01';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);
function draw() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f0';
  ctx.font = fontSize + 'px monospace';
  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}
setInterval(draw, 33);
</script>

</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(trollPage);
    return;
  }

  // =============================================
  // KOD LUA DLA ROBLOXA - GUI + ZABEZPIECZENIA
  // =============================================
  const luaCode = `
-- =============================================
-- SM-VAULT PROTECTED SCRIPT v2.0
-- Buy Source Code: https://sm-vault-xyz.vercel.app/
-- =============================================

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")

if not game:IsLoaded() then game.Loaded:Wait() end
if string.dump or getscriptbytecode then return end

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Usun stare GUI
if playerGui:FindFirstChild("SMVaultGUI") then
    playerGui:FindFirstChild("SMVaultGUI"):Destroy()
end

-- ============ TWORZENIE GUI ============
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "SMVaultGUI"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

-- Glowna ramka
local mainFrame = Instance.new("Frame")
mainFrame.Name = "MainFrame"
mainFrame.Size = UDim2.new(0, 420, 0, 320)
mainFrame.Position = UDim2.new(0.5, -210, 0.5, -160)
mainFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 25)
mainFrame.BackgroundTransparency = 1
mainFrame.BorderSizePixel = 0
mainFrame.Parent = screenGui

local mainCorner = Instance.new("UICorner")
mainCorner.CornerRadius = UDim.new(0, 14)
mainCorner.Parent = mainFrame

local mainStroke = Instance.new("UIStroke")
mainStroke.Color = Color3.fromRGB(128, 0, 255)
mainStroke.Thickness = 2
mainStroke.Parent = mainFrame

-- Gorna belka (tytul)
local titleBar = Instance.new("Frame")
titleBar.Size = UDim2.new(1, 0, 0, 45)
titleBar.BackgroundColor3 = Color3.fromRGB(128, 0, 255)
titleBar.BorderSizePixel = 0
titleBar.Parent = mainFrame

local titleCorner = Instance.new("UICorner")
titleCorner.CornerRadius = UDim.new(0, 14)
titleCorner.Parent = titleBar

local titleFix = Instance.new("Frame")
titleFix.Size = UDim2.new(1, 0, 0, 15)
titleFix.Position = UDim2.new(0, 0, 1, -15)
titleFix.BackgroundColor3 = Color3.fromRGB(128, 0, 255)
titleFix.BorderSizePixel = 0
titleFix.Parent = titleBar

-- Tytul
local titleLabel = Instance.new("TextLabel")
titleLabel.Size = UDim2.new(1, -50, 1, 0)
titleLabel.Position = UDim2.new(0, 15, 0, 0)
titleLabel.BackgroundTransparency = 1
titleLabel.Text = "SM-VAULT"
titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
titleLabel.TextSize = 22
titleLabel.Font = Enum.Font.GothamBold
titleLabel.TextXAlignment = Enum.TextXAlignment.Left
titleLabel.Parent = titleBar

-- Przycisk X (zamknij)
local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0, 32, 0, 32)
closeBtn.Position = UDim2.new(1, -40, 0, 7)
closeBtn.BackgroundColor3 = Color3.fromRGB(255, 50, 50)
closeBtn.Text = "X"
closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
closeBtn.TextSize = 16
closeBtn.Font = Enum.Font.GothamBold
closeBtn.BorderSizePixel = 0
closeBtn.Parent = titleBar

local closeBtnCorner = Instance.new("UICorner")
closeBtnCorner.CornerRadius = UDim.new(0, 8)
closeBtnCorner.Parent = closeBtn

-- Ikona zabezpieczenia
local shieldIcon = Instance.new("TextLabel")
shieldIcon.Size = UDim2.new(0, 50, 0, 50)
shieldIcon.Position = UDim2.new(0.5, -25, 0, 60)
shieldIcon.BackgroundTransparency = 1
shieldIcon.Text = "🛡️"
shieldIcon.TextSize = 40
shieldIcon.Parent = mainFrame

-- Status
local statusLabel = Instance.new("TextLabel")
statusLabel.Size = UDim2.new(1, -20, 0, 30)
statusLabel.Position = UDim2.new(0, 10, 0, 115)
statusLabel.BackgroundTransparency = 1
statusLabel.Text = "Script Loaded Successfully!"
statusLabel.TextColor3 = Color3.fromRGB(0, 255, 100)
statusLabel.TextSize = 20
statusLabel.Font = Enum.Font.GothamBold
statusLabel.Parent = mainFrame

-- Linia oddzielajaca
local separator = Instance.new("Frame")
separator.Size = UDim2.new(0.8, 0, 0, 2)
separator.Position = UDim2.new(0.1, 0, 0, 155)
separator.BackgroundColor3 = Color3.fromRGB(128, 0, 255)
separator.BorderSizePixel = 0
separator.Parent = mainFrame

-- Info o kupnie
local buyTitle = Instance.new("TextLabel")
buyTitle.Size = UDim2.new(1, -20, 0, 25)
buyTitle.Position = UDim2.new(0, 10, 0, 170)
buyTitle.BackgroundTransparency = 1
buyTitle.Text = "Buy Source Code:"
buyTitle.TextColor3 = Color3.fromRGB(180, 180, 180)
buyTitle.TextSize = 14
buyTitle.Font = Enum.Font.Gotham
buyTitle.Parent = mainFrame

local buyLink = Instance.new("TextLabel")
buyLink.Size = UDim2.new(1, -20, 0, 25)
buyLink.Position = UDim2.new(0, 10, 0, 195)
buyLink.BackgroundTransparency = 1
buyLink.Text = "https://sm-vault-xyz.vercel.app/"
buyLink.TextColor3 = Color3.fromRGB(100, 150, 255)
buyLink.TextSize = 14
buyLink.Font = Enum.Font.GothamBold
buyLink.Parent = mainFrame

-- Informacja o uzytkowniku
local userInfo = Instance.new("TextLabel")
userInfo.Size = UDim2.new(1, -20, 0, 25)
userInfo.Position = UDim2.new(0, 10, 0, 230)
userInfo.BackgroundTransparency = 1
userInfo.Text = "User: " .. player.Name .. " | ID: " .. player.UserId
userInfo.TextColor3 = Color3.fromRGB(100, 100, 100)
userInfo.TextSize = 12
userInfo.Font = Enum.Font.Gotham
userInfo.Parent = mainFrame

-- Status protection
local protStatus = Instance.new("TextLabel")
protStatus.Size = UDim2.new(1, -20, 0, 25)
protStatus.Position = UDim2.new(0, 10, 0, 260)
protStatus.BackgroundTransparency = 1
protStatus.Text = "Protection: ACTIVE | Version: 2.0"
protStatus.TextColor3 = Color3.fromRGB(0, 200, 0)
protStatus.TextSize = 12
protStatus.Font = Enum.Font.GothamBold
protStatus.Parent = mainFrame

-- ============ ANIMACJE ============

-- Fade in
TweenService:Create(mainFrame, TweenInfo.new(0.6, Enum.EasingStyle.Quint), {BackgroundTransparency = 0}):Play()

-- Pulsowanie ramki
spawn(function()
    while mainFrame and mainFrame.Parent do
        TweenService:Create(mainStroke, TweenInfo.new(1.5, Enum.EasingStyle.Sine), {Color = Color3.fromRGB(0, 150, 255)}):Play()
        wait(1.5)
        TweenService:Create(mainStroke, TweenInfo.new(1.5, Enum.EasingStyle.Sine), {Color = Color3.fromRGB(128, 0, 255)}):Play()
        wait(1.5)
    end
end)

-- Hover na przycisk close
closeBtn.MouseEnter:Connect(function()
    TweenService:Create(closeBtn, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(255, 0, 0)}):Play()
end)
closeBtn.MouseLeave:Connect(function()
    TweenService:Create(closeBtn, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(255, 50, 50)}):Play()
end)

-- ============ DRAGGABLE ============
local dragging = false
local dragStart, startPos

titleBar.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        dragging = true
        dragStart = input.Position
        startPos = mainFrame.Position
    end
end)

titleBar.InputEnded:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        dragging = false
    end
end)

UserInputService.InputChanged:Connect(function(input)
    if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
        local delta = input.Position - dragStart
        mainFrame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
    end
end)

-- ============ CLOSE BUTTON ============
closeBtn.MouseButton1Click:Connect(function()
    TweenService:Create(mainFrame, TweenInfo.new(0.3, Enum.EasingStyle.Quint), {BackgroundTransparency = 1}):Play()
    wait(0.3)
    screenGui:Destroy()
end)

-- ============ KONSOLA ============
warn("==========================================")
warn("     SM-VAULT v2.0 LOADED")
warn("     User: " .. player.Name)
warn("     Buy Source Code:")
warn("     https://sm-vault-xyz.vercel.app/")
warn("==========================================")

print("dziala skrypt wiec by dzialalo")
`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(luaCode);
}
