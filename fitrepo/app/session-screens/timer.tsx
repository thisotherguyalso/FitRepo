import { SessionCountdownScreen } from '@/components/session-countdown-screen';

export default function Timer() {
  return (
    <SessionCountdownScreen
      title="TIMER SCREEN"
      nextRoute="/session-screens/breathe"
      skipLabel="Double tap screen to skip to Breathe"
      cardColor="#313131"
    />
  )
}
