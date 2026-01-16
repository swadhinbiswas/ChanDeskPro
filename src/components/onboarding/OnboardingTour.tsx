import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Sparkles, Grid, MessageSquare, Star, Filter, Keyboard } from 'lucide-react'

interface TourStep {
    target: string // CSS selector
    title: string
    content: string
    icon?: ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="sidebar"]',
        title: 'Welcome to ChanDesk Pro!',
        content: 'Browse boards from the sidebar. Click any board to view its catalog.',
        icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
        position: 'right',
    },
    {
        target: '[data-tour="favorites"]',
        title: 'Favorite Boards',
        content: 'Star your favorite boards for quick access. Drag to reorder them!',
        icon: <Star className="w-5 h-5 text-yellow-400" />,
        position: 'right',
    },
    {
        target: '[data-tour="catalog"]',
        title: 'Thread Catalog',
        content: 'Click any thread card to open it. Use the search bar to filter threads.',
        icon: <Grid className="w-5 h-5 text-purple-400" />,
        position: 'bottom',
    },
    {
        target: '[data-tour="filters"]',
        title: 'Content Filters',
        content: 'Create filters to hide unwanted content. Filter by keyword, name, tripcode, or regex.',
        icon: <Filter className="w-5 h-5 text-red-400" />,
        position: 'bottom',
    },
    {
        target: '[data-tour="reply"]',
        title: 'Quick Reply',
        content: 'Click any post number to quote it. Use the Reply button to open the quick reply form.',
        icon: <MessageSquare className="w-5 h-5 text-green-400" />,
        position: 'left',
    },
    {
        target: '[data-tour="shortcuts"]',
        title: 'Keyboard Shortcuts',
        content: 'Press ? anytime to see all keyboard shortcuts. Use R to refresh, Esc to go back.',
        icon: <Keyboard className="w-5 h-5 text-blue-400" />,
        position: 'bottom',
    },
]

interface OnboardingContextType {
    startTour: () => void
    isActive: boolean
}

const OnboardingContext = createContext<OnboardingContextType>({
    startTour: () => { },
    isActive: false,
})

export function useOnboarding() {
    return useContext(OnboardingContext)
}

interface OnboardingProviderProps {
    children: ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
    const [currentStep, setCurrentStep] = useState(-1)
    const [hasSeenTour, setHasSeenTour] = useState(() => {
        return localStorage.getItem('chandesk_tour_completed') === 'true'
    })

    const isActive = currentStep >= 0

    useEffect(() => {
        // Auto-start tour for first-time users
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                setCurrentStep(0)
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [hasSeenTour])

    const startTour = () => {
        setCurrentStep(0)
    }

    const nextStep = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            completeTour()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const completeTour = () => {
        setCurrentStep(-1)
        setHasSeenTour(true)
        localStorage.setItem('chandesk_tour_completed', 'true')
    }

    const skipTour = () => {
        completeTour()
    }

    const step = currentStep >= 0 ? TOUR_STEPS[currentStep] : null

    return (
        <OnboardingContext.Provider value={{ startTour, isActive }}>
            {children}

            <AnimatePresence>
                {step && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-[200]"
                            onClick={skipTour}
                        />

                        {/* Tour Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed z-[201] bg-dark-surface border border-dark-border rounded-xl shadow-elevation-3 p-5 max-w-sm"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {step.icon}
                                    <h3 className="text-lg font-semibold">{step.title}</h3>
                                </div>
                                <button
                                    onClick={skipTour}
                                    className="text-gray-500 hover:text-white p-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <p className="text-gray-300 mb-6">{step.content}</p>

                            {/* Progress */}
                            <div className="flex gap-1 mb-4">
                                {TOUR_STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-colors ${i <= currentStep ? 'bg-purple-500' : 'bg-dark-border'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={skipTour}
                                    className="text-sm text-gray-500 hover:text-white"
                                >
                                    Skip tour
                                </button>

                                <div className="flex gap-2">
                                    {currentStep > 0 && (
                                        <button
                                            onClick={prevStep}
                                            className="btn btn-secondary flex items-center gap-1"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Back
                                        </button>
                                    )}
                                    <button
                                        onClick={nextStep}
                                        className="btn btn-primary flex items-center gap-1"
                                    >
                                        {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </OnboardingContext.Provider>
    )
}

export default OnboardingProvider
