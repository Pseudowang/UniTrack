interface PageLoadingProps {
  title: string;
  description: string;
}

export function PageLoading({ title, description }: PageLoadingProps) {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-3xl items-center justify-center px-4 py-16">
      <div className="w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
