import React from "react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  stepStatus: string[];
  stepAllowed: boolean[];
  onStepClick: (index: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  stepStatus,
  stepAllowed,
  onStepClick,
}) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div
            className={`flex items-center gap-2 cursor-pointer ${
              !stepAllowed[index] ? "opacity-50" : ""
            }`}
            onClick={() => onStepClick(index)}
          >
            <div
              className={`rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium ${
                index === currentStep
                  ? "bg-orange-500 text-white"
                  : stepStatus[index] === "Completed"
                  ? "bg-green-500 text-white"
                  : stepStatus[index] === "Not Completed"
                  ? "bg-gray-300 text-gray-700"
                  : stepAllowed[index]
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              <span>{index + 1}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">{step}</span>
              <span className="text-xs text-muted-foreground">
                {stepStatus[index]}
              </span>
              {!stepAllowed[index] && (
                <span className="text-xs text-muted-foreground">
                  (You don&lsquo;t have edit permission)
                </span>
              )}
            </div>
          </div>
          {index < steps.length - 1 && <div className="h-1 bg-muted w-12" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
