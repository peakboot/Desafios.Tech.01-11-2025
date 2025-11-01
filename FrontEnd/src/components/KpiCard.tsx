/**
 * Etapa 3: Componente KpiCard
 *
 * Este componente substitui os cards "chumbados" no Dashboard.
 * Ele recebe 'title', 'value' e 'isLoading'.
 * Se 'isLoading' for true, ele mostra o Skeleton.
 * Se for false, mostra o valor formatado.
 */
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  title: string;
  value: string;
  isLoading: boolean;
}

export function KpiCard({ title, value, isLoading }: KpiCardProps) {
  return (
    <Card className="col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
