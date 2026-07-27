import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
  ...props
}) {
  const [ref, visible] = useScrollReveal()

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  )
}
