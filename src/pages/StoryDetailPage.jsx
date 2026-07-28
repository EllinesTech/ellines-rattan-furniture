import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import OptimizedImage from '../components/OptimizedImage'
import Reveal from '../components/Reveal'
import { getPostBySlug } from '../utils/cms'
import '../components/ContentPages.css'
import './StoriesPages.css'

function paragraphs(body = '') {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default function StoryDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPostBySlug(slug).then((found) => {
      if (!cancelled) {
        setPost(found && found.published ? found : null)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <section className="section content-page content-page--standalone">
        <div className="container">
          <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Loading story…</p>
        </div>
      </section>
    )
  }

  if (!post) {
    return (
      <>
        <PageHero
          compact
          eyebrow="Journal"
          title="Story not found"
          subtitle="This story may be unpublished or the link is outdated."
          image="/images/projects/project-craftsmanship-weaving.jpg"
          position="center 40%"
          actions={
            <Link to="/stories" className="btn btn-primary">
              All stories
            </Link>
          }
        />
      </>
    )
  }

  const paras = paragraphs(post.body)

  return (
    <>
      <PageHero
        compact
        eyebrow="Journal"
        title={post.title}
        subtitle={post.excerpt || ''}
        image={post.cover || '/images/projects/project-original-living-set-wide.jpg'}
        position="center 40%"
      />
      <section className="section content-page content-page--standalone story-detail">
        <div className="container story-detail__wrap">
          {post.cover && (
            <Reveal className="story-detail__cover">
              <OptimizedImage src={post.cover} alt="" loading="eager" />
            </Reveal>
          )}
          <Reveal className="story-detail__body">
            {paras.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </Reveal>
          <Reveal className="content-page__cta card" delay={80}>
            <p>Planning a similar build? Share measurements or book a showroom visit.</p>
            <div className="content-page__cta-row">
              <Link to="/quote" className="btn btn-primary">
                Request a quote
              </Link>
              <Link to="/stories" className="btn btn-outline">
                More stories
              </Link>
              <Link to="/visit" className="btn btn-outline">
                Book a visit
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
