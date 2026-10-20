interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  centered?: boolean
  light?: boolean
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
  light = false,
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      {eyebrow && (
        <span className="inline-block text-sm font-bold tracking-widest uppercase text-brand mb-3">
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-3xl md:text-4xl font-extrabold leading-tight mb-4 ${
          light ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-lg leading-relaxed max-w-2xl ${
            centered ? 'mx-auto' : ''
          } ${light ? 'text-slate-300' : 'text-slate-500'}`}
        >
          {description}
        </p>
      )}
    </div>
  )
}
