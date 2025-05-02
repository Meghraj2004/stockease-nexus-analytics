
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Function to check if screen is mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial state
    checkIsMobile()
    
    // Add event listener
    window.addEventListener('resize', checkIsMobile)
    
    // Clean up listener on unmount
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}
