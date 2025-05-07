
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PredictionModelType } from "@/types/crypto";

interface ModelOption {
  value: PredictionModelType;
  label: string;
  description: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  { 
    value: 'arima', 
    label: 'ARIMA', 
    description: 'Statistical baseline forecasting using Autoregressive Integrated Moving Average model' 
  },
  { 
    value: 'prophet', 
    label: 'Prophet', 
    description: 'Trend + seasonality based model (similar to Facebook Prophet)' 
  },
  { 
    value: 'lstm', 
    label: 'LSTM', 
    description: 'Deep learning based Long Short-Term Memory neural network approach' 
  },
];

interface ModelSelectorProps {
  selectedModel: PredictionModelType;
  onModelChange: (model: PredictionModelType) => void;
}

const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">Select Prediction Model:</h4>
      <RadioGroup 
        className="flex flex-col sm:flex-row gap-4"
        value={selectedModel}
        onValueChange={(value) => onModelChange(value as PredictionModelType)}
      >
        {MODEL_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-start space-x-2">
            <RadioGroupItem value={option.value} id={`model-${option.value}`} />
            <div className="grid gap-1">
              <Label htmlFor={`model-${option.value}`}>{option.label}</Label>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default ModelSelector;
