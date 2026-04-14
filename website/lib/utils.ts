import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatEther } from "viem"
import { TIER_NAMES, TIER_COLORS, TIER_THRESHOLDS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatXP(xp: number | bigint): string {
  return `${Number(xp).toLocaleString()} XP`
}

export function getTierName(tierEnum: number): string {
  return TIER_NAMES[tierEnum] ?? 'Bronze'
}

export function getTierColor(tierEnum: number): string {
  const name = getTierName(tierEnum)
  return TIER_COLORS[name] ?? 'text-amber-600'
}

export function getNextTierThreshold(currentXP: number): number {
  const thresholds = Object.values(TIER_THRESHOLDS)
  for (const t of thresholds) {
    if (t > currentXP) return t
  }
  return thresholds[thresholds.length - 1]
}

export function formatWire(value: bigint): string {
  const formatted = formatEther(value)
  const num = parseFloat(formatted)
  if (num === 0) return '0 WIRE'
  if (num < 0.0001) return '<0.0001 WIRE'
  return `${num.toFixed(4)} WIRE`
}

export function formatFAN(value: bigint): string {
  const formatted = formatEther(value)
  const num = parseFloat(formatted)
  return `${Math.floor(num).toLocaleString()} FAN`
}

export function formatVotes(value: bigint): string {
  const formatted = formatEther(value)
  const num = parseFloat(formatted)
  if (num === 0) return '0'
  return Math.floor(num).toLocaleString()
}
