import { useRef, useState, useEffect, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Card3DTiltProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  glareEffect?: boolean
}

export function Card3DTilt({
  children,
  className,
  intensity = 20,
  glareEffect = true,
}: Card3DTiltProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * intensity
      const rotateY = ((x - centerX) / centerX) * intensity

      setRotation({ x: -rotateX, y: rotateY })
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      })
    }

    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [intensity])

  const style: CSSProperties = {
    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    transition: 'transform 0.1s ease-out',
  }

  return (
    <div ref={ref} className={cn('relative', className)} style={{ transformStyle: 'preserve-3d' }}>
      <motion.div
        style={style}
        className="relative rounded-2xl"
      >
        {children}

        {/* Glare Effect */}
        {glareEffect && (
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
              opacity: rotation.x !== 0 || rotation.y !== 0 ? 1 : 0,
              transition: 'opacity 0.3s ease-out',
            }}
          />
        )}
      </motion.div>
    </div>
  )
}
