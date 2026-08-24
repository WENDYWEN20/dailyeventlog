import type { Category } from '../../types/domain'

type CategoryListProps = {
  categories: Category[]
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <ul className="category-list">
      {categories.map((category) => (
        <li className="category-row" key={category.id}>
          <span>
            <span
              className="category-dot"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </span>
        </li>
      ))}
    </ul>
  )
}
