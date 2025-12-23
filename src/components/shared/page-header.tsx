type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 mb-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center space-x-2 w-full md:w-auto">
        {children}
      </div>
    </div>
  );
}
