export default function StatsCard({ title, value, icon, trend }) {
  const isPositive = trend.startsWith('+');
  
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card to-muted/20">
      <div className="absolute right-0 top-0 h-24 w-24 opacity-10">
        <Icon className="h-full w-full" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-xl ${
          isPositive 
            ? 'bg-green-100/80 text-green-600 dark:bg-green-500/10' 
            : 'bg-red-100/80 text-red-600 dark:bg-red-500/10'
        }`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold tracking-tight">
              {(title.includes('Revenue') || title.includes('Spent')) 
                ? `$${Number(value).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}` 
                : Number(value).toLocaleString()}
            </div>
            {percentage !== undefined && (
              <div className={`flex items-center text-sm font-semibold ${
                isPositive 
                  ? 'text-green-600 dark:text-green-500' 
                  : 'text-red-600 dark:text-red-500'
              }`}>
                <ArrowIcon className="h-4 w-4 mr-0.5" strokeWidth={2.5} />
                {Math.abs(percentage).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground/80">
            {description || 'Compared to last month'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
