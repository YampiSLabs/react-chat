import type { Room } from '../features/chat/types'

export const mockRooms: Room[] = [
  {
    id: 'general',
    name: 'general',
    description: 'Team chat and status updates',
    icon: 'G',
    createdAt: 1_700_000_000_000,
  },
  {
    id: 'support',
    name: 'support',
    description: 'Customer support and troubleshooting',
    icon: 'S',
    createdAt: 1_700_000_000_001,
  },
  {
    id: 'iot-alerts',
    name: 'iot-alerts',
    description: 'Real-time IoT alerts and system notifications',
    icon: 'I',
    createdAt: 1_700_000_000_002,
  },
  {
    id: 'network-ops',
    name: 'network-ops',
    description: 'Network diagnostics and connectivity issues',
    icon: 'N',
    createdAt: 1_700_000_000_003,
  },
  {
    id: 'device-fleet',
    name: 'device-fleet',
    description: 'Device fleet management and firmware updates',
    icon: 'D',
    createdAt: 1_700_000_000_004,
  },
  // Old custom room — seeded but will be cleaned up by retention on first load.
  // >30 days old and has no messages → should be deleted by room retention.
  {
    id: 'retention-test-room',
    name: 'retention-test-room',
    description: '[RETENTION TEST] Room >30 days old with no messages — should be deleted by cleanup.',
    icon: 'R',
    createdAt: 1_700_000_000_000,
  },
]