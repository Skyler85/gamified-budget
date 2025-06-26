'use client'
import { useOnboarding } from '@/lib/onboarding-context'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import WelcomeStep from './steps/WelcomeStep'
import GoalStep from './steps/GoalStep'
import CategoryStep from './steps/CategoryStep'
import FirstTransactionStep from './steps/FirstTransactionStep'
import GameificationStep from './steps/GameificationStep'

export default function OnboardingModal() {
  const { isOnboarding, currentStep } = useOnboarding()

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />
      case 2:
        return <GoalStep />
      case 3:
        return <CategoryStep />
      case 4:
        return <FirstTransactionStep />
      case 5:
        return <GameificationStep />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOnboarding} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {renderStep()}
      </DialogContent>
    </Dialog>
  )
}
