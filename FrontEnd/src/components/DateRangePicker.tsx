/**
 * Etapa 3: Componente DateRangePicker
 *
 * Este é o componente real que usa Popover e Calendar do shadcn/ui.
 * Ele permite que o usuário selecione um período (de/até).
 *
 * (Baseado na documentação oficial do shadcn/ui)
 */
import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale"; // Importa o locale Português
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// O componente precisa informar ao 'pai' (Dashboard) quando a data mudar.
interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal cursor-pointer", // Tamanho ajustado
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 " />
            {date?.from ? (
              date.to ? (
                <>
                  {/* Formata a data para o padrão PT-BR */}
                  {format(date.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={ptBR} // Aplica o locale PT-BR no calendário
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
