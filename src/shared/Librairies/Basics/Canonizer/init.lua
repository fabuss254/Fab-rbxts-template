-- Canonizer / Fingerprint for Roblox Instances
-- Drop this in a ModuleScript and require() it from your plugin code.

local HttpService = game:GetService("HttpService")

-- ========= Utilities =========

local function round(n, step)
	if n == math.huge or n == -math.huge or n ~= n then return 0 end
	step = step or 1e-4
	return math.floor(n/step + 0.5) * step
end

local function encBool(b) return b and "1" or "0" end

local function encNumber(n)
	return string.format("%.4f", round(n, 1e-4))
end

local function encVector2(v)
	return table.concat({encNumber(v.X), encNumber(v.Y)}, ",")
end

local function encVector3(v)
	return table.concat({encNumber(v.X), encNumber(v.Y), encNumber(v.Z)}, ",")
end

local function encColor3(c)
	return table.concat({encNumber(c.R), encNumber(c.G), encNumber(c.B)}, ",")
end

local function encNumberRange(c: NumberRange)
	return table.concat({encNumber(c.Min), encNumber(c.Max)}, ",")
end

local function encColorSequence(seq)
	-- ColorSequence has Keypoints: { ColorSequenceKeypoint(Time, Color3) }
	local parts = {}
	for _,kp in ipairs(seq.Keypoints) do
		table.insert(parts,
			table.concat({
				encNumber(kp.Time),
				encColor3(kp.Value)
			}, ",")
		)
	end
	return table.concat(parts, "|")
end

local function encNumberSequence(seq)
	-- NumberSequence has Keypoints: { NumberSequenceKeypoint(Time, Value, Envelope) }
	local parts = {}
	for _,kp in ipairs(seq.Keypoints) do
		table.insert(parts,
			table.concat({
				encNumber(kp.Time),
				encNumber(kp.Value),
				encNumber(kp.Envelope or 0)
			}, ",")
		)
	end
	return table.concat(parts, "|")
end

local function encCFrame(cf)
	local comps = {cf:GetComponents()}
	for i=1,#comps do comps[i] = encNumber(comps[i]) end
	return table.concat(comps, ",")
end

-- Simple deterministic key-sort JSON-ish encoder for a flat table of props.
local function encodePropsSorted(props)
	local keys = {}
	for k in pairs(props) do table.insert(keys, k) end
	table.sort(keys)
	local out = {}
	for _,k in ipairs(keys) do
		table.insert(out, k .. "=" .. tostring(props[k]))
	end
	return table.concat(out, ";")
end

-- ========= Fast (simple) hash: FNV-1a 32 =========
-- (Good enough for editor pipelines; swap for xxHash64 if you prefer.)
local function fnv1a32(str)
	local hash = 0x811C9DC5
	for i = 1, #str do
		hash = bit32.bxor(hash, string.byte(str, i))
		hash = bit32.band(bit32.lshift(hash, 5) + hash, 0xFFFFFFFF) -- * 33
	end
	return string.format("%08x", hash)
end

-- ========= Property whitelist per class =========

local function propsFor(inst: Instance)
	local t = { __c = inst.ClassName }

	-- BasePart-like
	if inst:IsA("BasePart") then
		t.Size = encVector3(inst.Size)
		t.CFrame = encCFrame(inst.CFrame)
		t.Material = inst.Material and inst.Material.Name or "nil"
		t.MaterialVariant = inst.MaterialVariant
		t.Color = encColor3(inst.Color)
		t.Transparency = encNumber(inst.Transparency)
		t.Reflectance = encNumber(inst.Reflectance)
	end

	if inst:IsA("MeshPart") then
		t.MeshId = inst.MeshId or ""
		t.TextureID = inst.TextureID or ""
		t.DoubleSided = encBool(inst.DoubleSided)
	end

	if inst:IsA("UnionOperation") then
		t.UsePartColor = encBool(inst.UsePartColor)
	end

	if inst:IsA("Decal") or inst:IsA("Texture") then
		t.Texture = inst.Texture or ""
		t.Face = tostring(inst.Face)
		t.DecalTransparency = encNumber(inst.Transparency or 0)
		t.DecalColor3 = encColor3(inst.Color3 or Color3.new(1,1,1))
	end

	-- Attachments influence rigs/FX placement
	if inst:IsA("Attachment") then
		t.AttCF = encCFrame(inst.CFrame)
	end

	if inst:IsA("ParticleEmitter") then
		t.Enabled = encBool(inst.Enabled)
		t.Texture = inst.Texture or ""
		t.Rate = encNumber(inst.Rate or 0)
		t.Lifetime = encNumberRange(inst.Lifetime)
		t.Speed = encNumberRange(inst.Speed)
		t.Accel = encVector3(inst.Acceleration or Vector3.new())
		t.Drag = encNumber(inst.Drag or 0)
		t.LockedToPart = encBool(inst.LockedToPart)
		t.EmissionDirection = tostring(inst.EmissionDirection)
		t.SpreadAngle = inst.SpreadAngle and encVector2(inst.SpreadAngle) or "0,0"
		t.Rotation = encNumberRange(inst.Rotation)
		t.RotSpeed = encNumberRange(inst.RotSpeed)
		t.SizeSeq = encNumberSequence(inst.Size)
		t.TranspSeq = encNumberSequence(inst.Transparency)
		t.ColorSeq = encColorSequence(inst.Color)
		t.LightEmission = encNumber(inst.LightEmission or 0)
		t.LightInfluence = encNumber(inst.LightInfluence or 0)
		t.ZOffset = encNumber(inst.ZOffset or 0)
		-- Optional: Shape settings (if you use them)
		if inst.Shape then
			t.Shape = inst.Shape.Name
		end
		if inst.ShapeStyle then
			t.ShapeStyle = inst.ShapeStyle.Name
		end
		if inst.ShapeInOut then
			t.ShapeInOut = inst.ShapeInOut.Name
		end
	end

	if inst:IsA("PointLight") then
		t.Enabled = encBool(inst.Enabled)
		t.Color = encColor3(inst.Color)
		t.Brightness = encNumber(inst.Brightness or 0)
		t.Range = encNumber(inst.Range or 0)
		t.Shadows = encBool(inst.Shadows)
	end

	if inst:IsA("SpotLight") then
		t.Enabled = encBool(inst.Enabled)
		t.Color = encColor3(inst.Color)
		t.Brightness = encNumber(inst.Brightness or 0)
		t.Range = encNumber(inst.Range or 0)
		t.Angle = encNumber(inst.Angle or 0)
		t.Face = tostring(inst.Face)
		t.Shadows = encBool(inst.Shadows)
	end

	if inst:IsA("Beam") then
		t.Enabled = encBool(inst.Enabled)
		t.ColorSeq = encColorSequence(inst.Color)
		t.TranspSeq = encNumberSequence(inst.Transparency)
		t.Width0 = encNumber(inst.Width0 or 0)
		t.Width1 = encNumber(inst.Width1 or 0)
		t.CurveSize0 = encNumber(inst.CurveSize0 or 0)
		t.CurveSize1 = encNumber(inst.CurveSize1 or 0)
		t.Segments = tostring(inst.Segments or 0)
		t.FaceCamera = encBool(inst.FaceCamera)
		t.Texture = inst.Texture or ""
		t.TextureLength = encNumber(inst.TextureLength or 0)
		t.TextureMode = inst.TextureMode and inst.TextureMode.Name or "Wrap"
		t.TextureSpeed = encNumber(inst.TextureSpeed or 0)
		t.LightEmission = encNumber(inst.LightEmission or 0)
		t.LightInfluence = encNumber(inst.LightInfluence or 0)
		-- Note: we intentionally ignore Attachment0/1 references for hashing
	end

	if inst:IsA("Trail") then
		t.Enabled = encBool(inst.Enabled)
		t.ColorSeq = encColorSequence(inst.Color)
		t.TranspSeq = encNumberSequence(inst.Transparency)
		t.Lifetime = encNumber(inst.Lifetime or 0)
		t.MinLength = encNumber(inst.MinLength or 0)
		t.MaxLength = encNumber(inst.MaxLength or 0) -- if available in your engine version
		t.Texture = inst.Texture or ""
		t.TextureLength = encNumber(inst.TextureLength or 0)
		t.TextureMode = inst.TextureMode and inst.TextureMode.Name or "Wrap"
		t.LightEmission = encNumber(inst.LightEmission or 0) -- (older properties—keep if present)
		t.FaceCamera = encBool(inst.FaceCamera or false) -- some versions expose this
		t.WidthScale = encNumberSequence(inst.WidthScale) -- NumberSequence
		-- Note: we intentionally ignore Attachment0/1 refs
	end

	-- Optionally include Name if you want name-changes to invalidate
	t.__n = inst.Name

	return t
end

-- ========= Order-independent node fingerprint =========

local SEP = "\n"

local function nodeFingerprint(inst, cache)
	cache = cache or {}

	-- Optional: Cache by Instance (only during a single pass)
	if cache[inst] then return cache[inst] end

	-- Build canonical props string
	local p = propsFor(inst)
	local classTag = p.__c ; p.__c = nil
	local propsBlob = encodePropsSorted(p)

	-- Recurse into children: hash each child, then sort the child hashes (order-independent)
	local childHashes = {}
	local children = inst:GetChildren()
	for _,child in ipairs(children) do
		table.insert(childHashes, nodeFingerprint(child, cache))
	end
	table.sort(childHashes) -- sort by hex string

	local payload = table.concat({
		classTag, SEP,
		propsBlob, SEP,
		table.concat(childHashes, SEP)
	}, "")

	local fp = fnv1a32(payload)
	cache[inst] = fp
	return fp
end

-- Public API
local Canonizer = {}

function Canonizer.Fingerprint(rootInstance)
	-- Returns a hex string fingerprint of the entire subtree.
	return nodeFingerprint(rootInstance, {})
end

return {
    Canonizer = Canonizer
}