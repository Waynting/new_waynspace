import Link from 'next/link';

interface TagListProps {
  tags: string[];
  linkable?: boolean;
}

export default function TagList({ tags, linkable = true }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {tags.map((tag) =>
        linkable ? (
          <Link
            key={tag}
            href={`/photos/tags/${tag}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {tag}
          </Link>
        ) : (
          <span
            key={tag}
            className="text-sm text-muted-foreground"
          >
            {tag}
          </span>
        )
      )}
    </div>
  );
}
