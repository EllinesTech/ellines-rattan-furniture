import OptimizedImage from './OptimizedImage'
import './PageHero.css'

export default function PageHero({ eyebrow, title, subtitle, image, position = 'center center' }) {
  return (
    <section className="page-hero" aria-label={title}>
      <div className="page-hero__bg" aria-hidden="true">
        <OptimizedImage
          src={image}
          alt=""
          className="page-hero__img"
          loading="eager"
          fetchPriority="high"
          objectPosition={position}
          useThumb
          thumbWidth={1280}
        />
        <div className="page-hero__veil" />
      </div>
      <div className="container page-hero__content">
        {eyebrow && <p className="page-hero__eyebrow">{eyebrow}</p>}
        <h1 className="page-hero__title">{title}</h1>
        {subtitle && <p className="page-hero__sub">{subtitle}</p>}
      </div>
    </section>
  )
}
