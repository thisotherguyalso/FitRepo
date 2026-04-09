import { SessionCountdownScreen } from '@/components/session-countdown-screen';

export default function Breathe() {
  return (
    <SessionCountdownScreen
      title="BREATHE SCREEN"
      nextRoute="/session-screens/summary"
      skipLabel="Double tap screen to skip to Summary"
    />
  )
}
