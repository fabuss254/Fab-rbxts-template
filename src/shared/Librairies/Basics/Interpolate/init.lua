function Lerp(p0, p1, alpha)
    if (typeof(p0) == "CFrame") then
        return p0:Lerp(p1, alpha)
    elseif (typeof(p0) == "Color3") then
        return p0:Lerp(p1, alpha)
    elseif (typeof(p0) == "NumberRange") then
        local Min = Lerp(p0.Min, p1.Min, alpha)
        local Max = Lerp(p0.Max, p1.Max, alpha)
        return NumberRange.new(Min, Max)
    elseif (typeof(p0) == "Vector3" or typeof(p0) == "UDim2") then
        return p0:Lerp(p1, alpha)
    elseif (typeof(p0) == "number") then
        return math.lerp(p0, p1, alpha)
    end

    return p0 + (p1 - p0) * alpha
end

function PreciseLerp(p0, p1, dt, t)
    return Lerp(p0, p1, 1-math.pow(1/100, dt/t))
end

function ClampedLerp(p0: CFrame, p1, alpha)
    alpha = math.clamp(alpha, 0, 1)
    return Lerp(p0, p1, alpha)
end

function ClampedPreciseLerp(p0, p1, dt, t)
    return ClampedLerp(p0, p1, 1-math.pow(1/100, dt/t))
end

function Bezier(p0, p1, p2, alpha)
    local p01 = Lerp(p0, p1, alpha)
    local p12 = Lerp(p1, p2, alpha)
    return Lerp(p01, p12, alpha)
end

function CubicBezier(p0, p1, p2, p3, alpha)
    local p01 = Lerp(p0, p1, alpha)
    local p12 = Lerp(p1, p2, alpha)
    local p23 = Lerp(p2, p3, alpha)
    return Bezier(p01, p12, p23, alpha)
end

function EaseCubicBezier(x1, y1, x2, y2, t)
    if (t <= 0 or t >= 1) then
        return t
    end

    return CubicBezier(Vector2.new(0, 0), Vector2.new(x1, y1), Vector2.new(x2, y2), Vector2.new(1, 1), t).Y
end

function GetAlphaInRange(Start: number, End: number, Value: number): number
    if Value <= Start then
        return 0
    elseif Value >= End then
        return 1
    else
        return (Value - Start) / (End - Start)
    end
end

return {
    Interpolate = {
        Lerp = Lerp,
        ClampedLerp = ClampedLerp,
        PreciseLerp = PreciseLerp,
        ClampedPreciseLerp = ClampedPreciseLerp,
        Bezier = Bezier,
        CubicBezier = CubicBezier,
        EaseCubicBezier = EaseCubicBezier,
        GetAlphaInRange = GetAlphaInRange,
    }
}