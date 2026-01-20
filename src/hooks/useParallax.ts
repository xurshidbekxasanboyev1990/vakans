import { useEffect, useRef } from 'react'

interface UseParallaxOptions {
  speed?: number
  direction?: 'up' | 'down'
}

export function useParallax({ speed = 0.5, direction = 'up' }: UseParallaxOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const rect = element.getBoundingClientRect()
      const elementTop = rect.top + scrolled
      const elementHeight = rect.height
      const windowHeight = window.innerHeight

      // Check if element is in viewport
      if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
        const parallax = (scrolled - elementTop) * speed * (direction === 'up' ? -1 : 1)
        element.style.transform = `translateY(${parallax}px)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [speed, direction])

  return ref
}
