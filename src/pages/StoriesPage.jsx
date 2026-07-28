import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import OptimizedImage from '../components/OptimizedImage'
import Reveal from '../components/Reveal'
import { subscribePosts } from '../utils/cms'
import '../components/ContentPages.css'
import './StoriesPages.css'

export default function StoriesPage() {
  const [posts, setPosts] = useState([])

  useEffect(() => subscribePosts(setPosts, { publishedOnly: true }), [])

  return (
    <>
      <PageHero
        compact
        eyebrow="Journal"
        title="Project Stories"
        subtitle="Workshop notes, hospitality installs, and custom builds from Nyeri & Nairobi."
        image="/images/projects/project-original-living-set-wide.jpg"
        position="center 40%"
      />
      <section className="section content-page content-page--standalone stories-page">
        <div className="container">
          {posts.length === 0 ? (
            <Reveal className="content-page__intro">
              <p>Stories are on the way. Browse our projects meanwhile, or book a visit.</p>
              <div className="content-page__cta-row" style={{ justifyContent: 'center', marginTop: 16 }}>
                <Link to="/projects" className="btn btn-outline">
                  Projects
                </Link>
                <Link to="/visit" className="btn btn-primary">
                  Book a visit
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="stories-grid">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={i * 60}>
                  <article className="stories-card">
                    <Link to={`/stories/${post.slug}`} className="stories-card__link">
                      <div className="stories-card__media">
                        {post.cover ? (
                          <OptimizedImage
                            src={post.cover}
                            alt=""
                            loading="lazy"
                            useThumb
                            thumbWidth={640}
                          />
                        ) : (
                          <div className="stories-card__placeholder" />
                        )}
                      </div>
                      <div className="stories-card__body">
                        <h2>{post.title}</h2>
                        {post.excerpt && <p>{post.excerpt}</p>}
                        <span className="stories-card__more">Read story</span>
                      </div>
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
