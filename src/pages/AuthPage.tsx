import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthForm } from '@/components/AuthForm'
import { useAuth } from '@/contexts/AuthContext'

const AuthPage = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (!loading && user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <img 
          src="/hero-cinema.jpg" 
          alt="Cinema theater"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              The Blockbuster Arena
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Test your movie knowledge with the ultimate cast guessing game
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold">🎬 Multiple Modes</div>
                <div className="text-white/80">Popular, Top Rated & More</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold">📊 Track Stats</div>
                <div className="text-white/80">Personal Performance</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold">🔗 Share Games</div>
                <div className="text-white/80">Challenge Friends</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold">🏆 Leaderboards</div>
                <div className="text-white/80">Compete Globally</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile hero */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
              The Blockbuster Arena
            </h1>
            <p className="text-muted-foreground">
              Test your movie knowledge with cast guessing games
            </p>
          </div>

          {/* Auth Form */}
          <AuthForm />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage