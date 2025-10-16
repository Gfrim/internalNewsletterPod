import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function PageHeader({ title, description, children, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col items-start gap-4 p-4 sm:p-6 md:p-8 md:flex-row md:items-center md:justify-between", className)} {...props}>
      <div className="grid gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground/90 font-headline">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="w-full md:w-auto flex shrink-0 items-center justify-start gap-2">{children}</div>}
    </div>
  );
}
