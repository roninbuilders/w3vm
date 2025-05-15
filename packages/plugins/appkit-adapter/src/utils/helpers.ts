export function parseWalletCapabilities(str: string) {
  try {
    return JSON.parse(str)
  } catch (error) {
    throw new Error('Error parsing wallet capabilities')
  }
}
