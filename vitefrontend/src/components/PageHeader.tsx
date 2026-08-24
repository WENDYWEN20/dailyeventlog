type PageHeaderProps = {
  title: string
  description: string
  aside?: React.ReactNode
}

export function PageHeader({ title, description, aside }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {aside}
    </header>
  )
}
