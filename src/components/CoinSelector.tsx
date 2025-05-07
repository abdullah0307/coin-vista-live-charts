
import { useState, useEffect } from "react";
import { Check, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CoinSelectorProps {
  availableCoins: { id: string; name: string; symbol: string }[];
  selectedCoins: string[];
  onSelectionChange: (coins: string[]) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const CoinSelector = ({
  availableCoins,
  selectedCoins,
  onSelectionChange,
  onRefresh,
  isLoading,
}: CoinSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCoin = (coinId: string) => {
    if (selectedCoins.includes(coinId)) {
      // Don't allow deselecting if only one coin is selected
      if (selectedCoins.length <= 1) return;
      onSelectionChange(selectedCoins.filter((id) => id !== coinId));
    } else {
      // Limit selection to 8 coins
      if (selectedCoins.length >= 8) return;
      onSelectionChange([...selectedCoins, coinId]);
    }
  };

  // Filter coins based on search query
  const filteredCoins = availableCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex items-center justify-between gap-1 px-3 min-w-[180px]"
          >
            <span>Select Coins</span>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search coins..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty>No coins found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {filteredCoins.map((coin) => (
                <CommandItem
                  key={coin.id}
                  value={coin.id}
                  onSelect={() => toggleCoin(coin.id)}
                  className={cn(
                    "flex items-center justify-between",
                    selectedCoins.includes(coin.id) ? "bg-accent" : ""
                  )}
                  disabled={!selectedCoins.includes(coin.id) && selectedCoins.length >= 8}
                >
                  <div className="flex items-center">
                    <span>
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </span>
                  </div>
                  {selectedCoins.includes(coin.id) && (
                    <Check className="w-4 h-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {availableCoins
          .filter((coin) => selectedCoins.includes(coin.id))
          .map((coin) => (
            <Badge
              key={coin.id}
              variant="secondary"
              className="px-2 py-1"
            >
              {coin.name}
            </Badge>
          ))}
      </div>

      <div className="ml-auto">
        <Button 
          size="icon" 
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          className={cn(isLoading && "animate-spin")}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CoinSelector;
