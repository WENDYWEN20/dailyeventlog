import { PageHeader } from '../components/PageHeader'
import { CategoryList } from '../features/categories/CategoryList'
import type { Category } from '../types/domain'

type SettingsPageProps = {
  categories: Category[]
}

export function SettingsPage({ categories }: SettingsPageProps) {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage user-owned categories and future account settings."
      />

      <section className="panel">
        <h3>Categories</h3>
        <CategoryList categories={categories} />
      </section>
    </>
  )
}
