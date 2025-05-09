
import { useState } from "react";
import { Check, ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";
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

  // Make sure availableCoins is an array and provide a default empty array
  const coins = Array.isArray(availableCoins) ? availableCoins : [];

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

  const removeCoin = (e: React.MouseEvent, coinId: string) => {
    e.stopPropagation();
    if (selectedCoins.length > 1) {
      onSelectionChange(selectedCoins.filter((id) => id !== coinId));
    }
  };

  // Get coin logo URL
  const getCoinLogo = (coinId: string) => {
    return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/${coinId.toLowerCase()}.png`;
  };

  // Filter coins based on search query
  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate the list of selected coins for display
  const selectedCoinItems = selectedCoins
    .map(coinId => coins.find(coin => coin.id === coinId))
    .filter(Boolean)
    .map(coin => coin!);

  // Handle refresh button click
  const handleRefreshClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRefresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex items-center justify-between gap-1 px-3 min-w-[180px] bg-background border-border hover:bg-accent"
          >
            <span>Select Coins</span>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 bg-popover" align="start">
          <Command>
            <CommandInput 
              placeholder="Search coins..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-b border-border"
            />
            <CommandEmpty>No coins found.</CommandEmpty>
            {filteredCoins.length > 0 && (
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {filteredCoins.map((coin) => {
                  const isSelected = selectedCoins.includes(coin.id);
                  const isDisabled = !isSelected && selectedCoins.length >= 8;
                  
                  return (
                    <CommandItem
                      key={coin.id}
                      value={coin.id}
                      onSelect={() => toggleCoin(coin.id)}
                      className={cn(
                        "flex items-center justify-between",
                        isSelected ? "bg-accent" : "",
                        isDisabled ? "opacity-50 cursor-not-allowed" : ""
                      )}
                      disabled={isDisabled}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-muted">
                          <img
                            src={getCoinLogo(coin.symbol)}
                            alt={coin.name}
                            width={20}
                            height={20}
                            onError={(e) => {
                              // If image fails to load, use first letter of symbol as fallback
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerText = 
                                coin.symbol.charAt(0).toUpperCase();
                            }}
                          />
                        </div>
                        <span>
                          {coin.name} <span className="text-muted-foreground text-xs">({coin.symbol.toUpperCase()})</span>
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {selectedCoinItems.map((coin) => (
          <Badge
            key={coin.id}
            variant="secondary"
            className="px-2 py-1 flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          >
            <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={getCoinLogo(coin.symbol)}
                alt={coin.name}
                width={16}
                height={16}
                onError={(e) => {
                  // If image fails to load, use first letter of symbol as fallback
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerText = 
                    coin.symbol.charAt(0).toUpperCase();
                }}
              />
            </div>
            {coin.symbol.toUpperCase()}
            {selectedCoins.length > 1 && (
              <X 
                className="w-3 h-3 ml-0.5 cursor-pointer text-muted-foreground hover:text-foreground" 
                onClick={(e) => removeCoin(e, coin.id)}
              />
            )}
          </Badge>
        ))}
      </div>

      <div className="ml-auto">
        <Button 
          size="icon" 
          variant="outline"
          onClick={handleRefreshClick}
          disabled={isLoading}
          className={cn(
            "bg-background border-border hover:bg-accent",
            isLoading && "animate-spin"
          )}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CoinSelector;
