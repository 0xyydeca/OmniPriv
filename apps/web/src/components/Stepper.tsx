'use client';

import { CheckCircleIcon, ArrowPathIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

export type StepState = 'idle' | 'in_progress' | 'done' | 'error';

export interface Step {
  id: string;
  label: string;
  description?: string;
  state: StepState;
}

export interface StepperProps {
  steps: Step[];
  className?: string;
}

export function Stepper({ steps, className = '' }: StepperProps) {
  const getStepIcon = (state: StepState) => {
    switch (state) {
      case 'done':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'in_progress':
        return <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStepColor = (state: StepState) => {
    switch (state) {
      case 'done':
        return 'text-green-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getConnectorColor = (currentState: StepState, nextState: StepState) => {
    if (currentState === 'done') {
      return 'bg-green-500';
    }
    if (currentState === 'in_progress') {
      return 'bg-blue-500';
    }
    return 'bg-gray-600';
  };

  return (
    <div className={`space-y-0 ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Step content */}
          <div className="flex items-start gap-4 pb-8">
            {/* Icon */}
            <div className="relative flex-shrink-0 z-10">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-300
                ${step.state === 'in_progress' ? 'ring-4 ring-blue-500/20' : ''}
                ${step.state === 'done' ? 'ring-4 ring-green-500/20' : ''}
                ${step.state === 'error' ? 'ring-4 ring-red-500/20' : ''}
                bg-gray-800
              `}>
                {getStepIcon(step.state)}
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  absolute left-5 top-10 w-0.5 h-full
                  transition-colors duration-500
                  ${getConnectorColor(step.state, steps[index + 1]?.state)}
                `} />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 pt-2">
              <h4 className={`
                font-semibold text-base mb-1
                transition-colors duration-300
                ${getStepColor(step.state)}
              `}>
                {step.label}
              </h4>
              {step.description && (
                <p className="text-sm text-gray-400">
                  {step.description}
                </p>
              )}
              
              {/* In-progress animation text */}
              {step.state === 'in_progress' && (
                <p className="text-xs text-blue-400 mt-1 animate-pulse">
                  Processing...
                </p>
              )}
              
              {/* Error message */}
              {step.state === 'error' && (
                <p className="text-xs text-red-400 mt-1">
                  Failed - please try again
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Compact horizontal stepper variant (optional)
export function HorizontalStepper({ steps, className = '' }: StepperProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-300
              ${step.state === 'done' ? 'bg-green-500' : ''}
              ${step.state === 'in_progress' ? 'bg-blue-500 animate-pulse' : ''}
              ${step.state === 'idle' ? 'bg-gray-600' : ''}
              ${step.state === 'error' ? 'bg-red-500' : ''}
            `}>
              {step.state === 'done' && <CheckCircleIcon className="w-5 h-5 text-white" />}
              {step.state === 'in_progress' && <ArrowPathIcon className="w-5 h-5 text-white animate-spin" />}
              {step.state === 'idle' && <span className="text-white text-xs">{index + 1}</span>}
              {step.state === 'error' && <XCircleIcon className="w-5 h-5 text-white" />}
            </div>
            <span className={`
              mt-2 text-xs text-center max-w-[80px]
              ${step.state === 'done' ? 'text-green-400' : ''}
              ${step.state === 'in_progress' ? 'text-blue-400' : ''}
              ${step.state === 'idle' ? 'text-gray-400' : ''}
              ${step.state === 'error' ? 'text-red-400' : ''}
            `}>
              {step.label}
            </span>
          </div>
          
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className={`
              flex-1 h-0.5 mx-2
              transition-colors duration-500
              ${step.state === 'done' ? 'bg-green-500' : 'bg-gray-600'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
}

