local Promise = require(script.Parent.Promise)

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local ThatIsPlugin = plugin ~= nil

local OUTPUT_PREFIX = "roblox-ts: "
local NODE_MODULES = "node_modules"
local DEFAULT_SCOPE = "@rbxts"

local TS = {}

TS.Promise = Promise

local function isPlugin(context)
	if (plugin ~= nil) then
		return true
	end

	return RunService:IsStudio() and context:FindFirstAncestorWhichIsA("Plugin") ~= nil
end

function TS.getModule(context, scope, moduleName)
	-- legacy call signature
	if moduleName == nil then
		moduleName = scope
		scope = DEFAULT_SCOPE
	end

	-- ensure modules have fully replicated
	if RunService:IsRunning() and RunService:IsClient() and not isPlugin(context) and not game:IsLoaded() then
		game.Loaded:Wait()
	end

	local object = context
	repeat
		local nodeModulesFolder = object:FindFirstChild(NODE_MODULES)
		if nodeModulesFolder then
			local scopeFolder = nodeModulesFolder:FindFirstChild(scope)
			if scopeFolder then
				local module = scopeFolder:FindFirstChild(moduleName)
				if module then
					return module
				end
			end
		end
		object = object.Parent
	until object == nil

	error(OUTPUT_PREFIX .. "Could not find module: " .. moduleName, 2)
end

-- This is a hash which TS.import uses as a kind of linked-list-like history of [Script who Loaded] -> Library
local currentlyLoading = {}
local registeredLibraries = {}

-- Addon to ease plugin reloading
local ModuleSources = {}
local function CanUseCache(Module)
	if not ThatIsPlugin then return true end
	return ModuleSources[Module] ~= nil
end

function TS._ReloadModuleThatChangedStep1() 
	local AllModulesThatChanged = {}
	for k,v in ModuleSources do
		if ModuleSources[k] and ModuleSources[k] ~= k.Source then
			table.insert(AllModulesThatChanged, k)
			registeredLibraries[k] = nil
			ModuleSources[k] = nil
		end
	end
	
	return AllModulesThatChanged
end

function TS.import(context, module, ...)
	-- Call as normal if no errors

	-- If it's an external module, it shouldn't have any dependencies inside our game, so we can load it right of the bat
	local ModuleInstance = module
	for i = 1, select("#", ...) do
		if ThatIsPlugin then
			ModuleInstance = ModuleInstance:FindFirstChild((select(i, ...)))
		else
			ModuleInstance = ModuleInstance:WaitForChild((select(i, ...)))
		end
	end

	if ModuleInstance:IsDescendantOf(ReplicatedStorage:WaitForChild("rbxts_include")) or ModuleInstance.Name == "PluginUtils" then
		local ok, result = pcall(TS.importMODIFIED, context, module, ...)
		if ok then return result end
	end

	-- If errors, we wrap it so it get loaded later down the line
	local DLoaded = nil
	local Args = {...}
	return setmetatable({
		__forceLoad = function()
			if DLoaded and CanUseCache(ModuleInstance) then return DLoaded end

			DLoaded = TS.importMODIFIED(context, module, table.unpack(Args))
			return DLoaded
		end,
	}, {
		__index = function(_, index1) 
			if DLoaded and CanUseCache(ModuleInstance) then return DLoaded[index1] end

			return setmetatable({
				__forceLoad = function()
					if DLoaded then return DLoaded[index1] end
		
					DLoaded = TS.importMODIFIED(context, module, table.unpack(Args))
					return DLoaded[index1]
				end,
			}, {
				__index = function(_, index2)
					if DLoaded and CanUseCache(ModuleInstance) then return DLoaded[index1][index2] end
					
					DLoaded = TS.importMODIFIED(context, module, table.unpack(Args))
					return DLoaded[index1][index2]
				end,
				__newindex = function(_, index2, value)
					if DLoaded and CanUseCache(ModuleInstance) then 
						DLoaded[index1][index2] = value 
						return
					end
		
					DLoaded = TS.importMODIFIED(context, module, table.unpack(Args))
					DLoaded[index1][index2] = value
				end,
				__call = function(_, ...)
					if DLoaded and CanUseCache(ModuleInstance) then return DLoaded[index1](...) end
			
					DLoaded = TS.importMODIFIED(context, module, table.unpack(Args))
					return DLoaded[index1](...)
				end,
				__iter = function(_)
					if DLoaded and CanUseCache(ModuleInstance) then return next, DLoaded[index1] end
		
					DLoaded = TS.importMODIFIED(context, module, table.unpack(Args))
					return next, DLoaded[index1]
				end
			})
		end,
		__newindex = function(_, index1, value)
			if DLoaded and CanUseCache(ModuleInstance) then 
				DLoaded[index1] = value 
				return
			end

			DLoaded = TS.importMODIFIED(context, module, table.unpack(Args))
			DLoaded[index1] = value
		end,
		__call = function(_, ...)
			if DLoaded and CanUseCache(ModuleInstance) then return DLoaded(...) end
	
			DLoaded = TS.importMODIFIED(context, module, table.unpack(Args))
			return DLoaded(...)
		end,
		__iter = function(_)
			if DLoaded and CanUseCache(ModuleInstance) then return next, DLoaded end

			DLoaded = TS.importMODIFIED(context, module, table.unpack(Args))
			return next, DLoaded
		end,
	})
	
end

function TS.importMODIFIED(context, module, ...)
	for i = 1, select("#", ...) do
		if ThatIsPlugin then
			module = module:FindFirstChild((select(i, ...)))
		else
			module = module:WaitForChild((select(i, ...)))
		end
	end

	if module.ClassName ~= "ModuleScript" then
		error(OUTPUT_PREFIX .. "Failed to import! Expected ModuleScript, got " .. module.ClassName, 2)
	end

	currentlyLoading[context] = module

	-- Check to see if a case like this occurs:
	-- module -> Module1 -> Module2 -> module

	-- WHERE currentlyLoading[module] is Module1
	-- and currentlyLoading[Module1] is Module2
	-- and currentlyLoading[Module2] is module

	local currentModule = module
	local depth = 0

	while currentModule do
		depth = depth + 1
		currentModule = currentlyLoading[currentModule]

		if currentModule == module then
			local str = currentModule.Name -- Get the string traceback

			for _ = 1, depth do
				currentModule = currentlyLoading[currentModule]
				str = str .. "  ⇒ " .. currentModule.Name
			end

			currentlyLoading[context] = nil
			error(OUTPUT_PREFIX .. "Failed to import! Detected a circular dependency chain: " .. str, 2)
		end
	end

	if not registeredLibraries[module] and not isPlugin(context) then
		if _G[module] then
			error(
				OUTPUT_PREFIX
				.. "Invalid module access! Do you have multiple TS runtimes trying to import this? "
				.. module:GetFullName(),
				2
			)
		end

		_G[module] = TS
		registeredLibraries[module] = true -- register as already loaded for subsequent calls
	end

	local data = require(module)

	if currentlyLoading[context] == module then -- Thread-safe cleanup!
		currentlyLoading[context] = nil
	end

	if (ThatIsPlugin) then ModuleSources[module] = module.Source end
	return data
end

function TS.instanceof(obj, class)
	-- custom Class.instanceof() check
	if type(class) == "table" and type(class.instanceof) == "function" then
		return class.instanceof(obj)
	end

	-- metatable check
	if type(obj) == "table" then
		obj = getmetatable(obj)
		while obj ~= nil do
			if obj == class then
				return true
			end
			local mt = getmetatable(obj)
			if mt then
				obj = mt.__index
			else
				obj = nil
			end
		end
	end

	return false
end

function TS.async(callback)
	return function(...)
		local n = select("#", ...)
		local args = { ... }
		return Promise.new(function(resolve, reject)
			coroutine.wrap(function()
				local ok, result = pcall(callback, unpack(args, 1, n))
				if ok then
					resolve(result)
				else
					reject(result)
				end
			end)()
		end)
	end
end

function TS.await(promise)
	if not Promise.is(promise) then
		return promise
	end

	local status, value = promise:awaitStatus()
	if status == Promise.Status.Resolved then
		return value
	elseif status == Promise.Status.Rejected then
		error(value, 2)
	else
		error("The awaited Promise was cancelled", 2)
	end
end

local SIGN = 2 ^ 31
local COMPLEMENT = 2 ^ 32
local function bit_sign(num)
	-- Restores the sign after an unsigned conversion according to 2s complement.
	if bit32.btest(num, SIGN) then
		return num - COMPLEMENT
	else
		return num
	end
end

function TS.bit_lrsh(a, b)
	return bit_sign(bit32.arshift(a, b))
end

TS.TRY_RETURN = 1
TS.TRY_BREAK = 2
TS.TRY_CONTINUE = 3

function TS.try(func, catch, finally)
	local err, traceback
	local success, exitType, returns = xpcall(
		func,
		function(errInner)
			err = errInner
			traceback = debug.traceback()
		end
	)
	if not success and catch then
		local newExitType, newReturns = catch(err, traceback)
		if newExitType then
			exitType, returns = newExitType, newReturns
		end
	end
	if finally then
		local newExitType, newReturns = finally()
		if newExitType then
			exitType, returns = newExitType, newReturns
		end
	end
	return exitType, returns
end

function TS.generator(callback)
	local co = coroutine.create(callback)
	return {
		next = function(...)
			if coroutine.status(co) == "dead" then
				return { done = true }
			else
				local success, value = coroutine.resume(co, ...)
				if success == false then
					error(value, 2)
				end
				return {
					value = value,
					done = coroutine.status(co) == "dead",
				}
			end
		end,
	}
end

return TS
