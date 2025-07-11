import React, { useState, useEffect, useRef } from 'react';
import { Palette, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Slider } from '@/components/ui/slider';

// You can replace this with an actual Google icon asset if you have one
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <g>
      <path fill="#4285F4" d="M21.805 10.023h-9.765v3.955h5.617c-.241 1.296-1.454 3.809-5.617 3.809-3.378 0-6.135-2.804-6.135-6.262s2.757-6.262 6.135-6.262c1.924 0 3.217.818 3.957 1.514l2.711-2.639c-1.729-1.607-3.96-2.595-6.668-2.595-5.522 0-10 4.477-10 10s4.478 10 10 10c5.746 0 9.548-4.027 9.548-9.71 0-.651-.073-1.15-.162-1.592z"/>
      <path fill="#34A853" d="M3.537 7.548l3.252 2.387c.886-1.684 2.511-2.865 4.311-2.865 1.178 0 2.224.422 3.053 1.112l2.748-2.672c-1.611-1.516-3.704-2.41-5.801-2.41-3.49 0-6.441 2.007-7.89 4.938z"/>
      <path fill="#FBBC05" d="M12.1 22c2.5 0 4.585-.821 6.113-2.237l-2.825-2.328c-.788.552-1.798.891-3.288.891-2.552 0-4.721-1.73-5.495-4.083h-3.376v2.372c1.443 3.038 4.666 5.385 8.871 5.385z"/>
      <path fill="#EA4335" d="M21.805 10.023h-9.765v3.955h5.617c-.241 1.296-1.454 3.809-5.617 3.809-3.378 0-6.135-2.804-6.135-6.262s2.757-6.262 6.135-6.262c1.924 0 3.217.818 3.957 1.514l2.711-2.639c-1.729-1.607-3.96-2.595-6.668-2.595-5.522 0-10 4.477-10 10s4.478 10 10 10c5.746 0 9.548-4.027 9.548-9.71 0-.651-.073-1.15-.162-1.592z"/>
    </g>
  </svg>
);

type UserInfo = {
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
};

interface HeaderProps {
  user: UserInfo | null;
  onLogout: () => void;
  onOpenSignup?: () => void; // so parent can optionally open signup modal
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenSignup }) => {
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { darknessLevel, setDarknessLevel } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const signupModalRef = useRef<HTMLDivElement>(null);
  const signupButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isOnHomePage = location.pathname === '/';

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isThemeModalOpen) {
          setIsThemeModalOpen(false);
          buttonRef.current?.focus();
        }
        if (isSignupModalOpen) {
          setIsSignupModalOpen(false);
          signupButtonRef.current?.focus();
        }
        if (isLogoutModalOpen) {
          setIsLogoutModalOpen(false);
        }
      }
    };

    if (isThemeModalOpen || isSignupModalOpen || isLogoutModalOpen) {
      document.addEventListener('keydown', handleEscape);
      if (isThemeModalOpen) modalRef.current?.focus();
      if (isSignupModalOpen) signupModalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isThemeModalOpen, isSignupModalOpen, isLogoutModalOpen]);

  // Handle clicking outside modal to close
  const handleOverlayClick = (e: React.MouseEvent, type: "theme" | "signup" | "logout") => {
    if (e.target === e.currentTarget) {
      if (type === "theme") setIsThemeModalOpen(false);
      if (type === "signup") setIsSignupModalOpen(false);
      if (type === "logout") setIsLogoutModalOpen(false);
    }
  };

  const handleSliderChange = (values: number[]) => {
    setDarknessLevel(values[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        setDarknessLevel(Math.max(0, darknessLevel - 5));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        setDarknessLevel(Math.min(100, darknessLevel + 5));
        break;
      case 'Home':
        e.preventDefault();
        setDarknessLevel(0);
        break;
      case 'End':
        e.preventDefault();
        setDarknessLevel(100);
        break;
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    // Simple validation
    if (!signupEmail || !signupPassword) {
      setSignupError('Email and password are required.');
      return;
    }
    // TODO: Connect to backend or show success feedback
    alert(`Signup submitted for email: ${signupEmail}`);
    setIsSignupModalOpen(false);
    setSignupEmail('');
    setSignupPassword('');
  };

  const handleGoogleSignup = () => {
  const next = window.location.pathname + window.location.search;
  window.location.href = `http://localhost:5000/login?next=${encodeURIComponent(next)}`;
};

  // Logout handler calls parent callback and navigates to home
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/logout', {
        method: 'GET',
        credentials: 'include',
      });
      setIsLogoutModalOpen(false);
      onLogout();
      navigate('/'); // return to home
    } catch (err) {
      alert('Logout failed');
    }
  };

  // Open signup modal via prop if available
  const handleOpenSignup = () => {
    setIsSignupModalOpen(true);
    if (onOpenSignup) onOpenSignup();
  };

  return (
    <>
      {/* Header Bar */}
      <header 
        className="fixed top-0 left-0 right-0 z-40 h-16 shadow-sm border-b"
        style={{
          backgroundColor: 'var(--theme-bg)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text)'
        }}
      >
        <div className="flex items-center justify-between h-full px-6">
          {/* App Logo/Name and Home Button */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🧮</div>
              <h1 className="text-xl font-semibold">STEM Tutor</h1>
            </div>
            <button
              onClick={handleHomeClick}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer ${
                isOnHomePage 
                  ? 'font-bold underline' 
                  : 'hover:opacity-80'
              }`}
              style={{
                color: 'var(--theme-text)'
              }}
            >
              Home
            </button>
          </div>

          {/* Right Side Buttons: Theme & Signup/Logout */}
          <div className="flex items-center space-x-3">
            {/* If user is logged in, show logout button */}
            {user ? (
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center justify-center px-4 h-10 rounded-lg transition-all duration-200 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                style={{
                  backgroundColor: '#ef4444'
                }}
                aria-label="Logout"
              >
                Logout
              </button>
            ) : (
              <button
                ref={signupButtonRef}
                onClick={handleOpenSignup}
                className="flex items-center justify-center px-4 h-10 rounded-lg transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                style={{
                  backgroundColor: 'var(--theme-accent, #2563eb)'
                }}
                aria-label="Open signup modal"
                aria-expanded={isSignupModalOpen}
              >
                Sign Up
              </button>
            )}
            {/* Theme Control Button */}
            <button
              ref={buttonRef}
              onClick={() => setIsThemeModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-border)'
              }}
              aria-label="Open theme settings"
              aria-expanded={isThemeModalOpen}
            >
              <Palette size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Theme Modal Overlay */}
      {isThemeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={(e) => handleOverlayClick(e, "theme")}
          role="dialog"
          aria-modal="true"
          aria-labelledby="theme-modal-title"
        >
          {/* Backdrop Blur Effect */}
          <div className="absolute inset-0 backdrop-blur-sm" />
          
          {/* Theme Control Modal */}
          <div
            ref={modalRef}
            className="relative bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-6 shadow-2xl min-w-[320px] max-w-md mx-4 animate-scale-in"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text)'
            }}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-lg">🌈</div>
                <h3 id="theme-modal-title" className="font-semibold text-lg">Theme Control</h3>
                <span className="text-sm opacity-70 ml-auto">{darknessLevel}%</span>
              </div>
              <button
                onClick={() => setIsThemeModalOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Close theme settings"
              >
                <X size={16} />
              </button>
            </div>

            {/* Theme Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {/* Sun Icon */}
                <div className="flex-shrink-0">
                  <div 
                    className={`text-lg transition-all duration-200 ${
                      darknessLevel < 30 ? 'scale-110' : 'scale-100 opacity-60'
                    }`}
                  >
                    ☀️
                  </div>
                </div>

                {/* Slider */}
                <div className="flex-1 px-2">
                  <Slider
                    value={[darknessLevel]}
                    onValueChange={handleSliderChange}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                    onKeyDown={handleKeyDown}
                    aria-label="Theme darkness level"
                    aria-valuetext={`${darknessLevel}% darkness`}
                  />
                </div>

                {/* Moon Icon */}
                <div className="flex-shrink-0">
                  <div 
                    className={`text-lg transition-all duration-200 ${
                      darknessLevel > 70 ? 'scale-110' : 'scale-100 opacity-60'
                    }`}
                  >
                    🌙
                  </div>
                </div>
              </div>

              {/* Gradient Bar Visual */}
              <div className="relative h-2 rounded-full overflow-hidden bg-gradient-to-r from-yellow-200 via-gray-400 to-slate-800">
                <div 
                  className="absolute top-0 left-0 h-full bg-white/30 rounded-full transition-all duration-200"
                  style={{ width: `${darknessLevel}%` }}
                />
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Light', value: 10, emoji: '☀️' },
                  { label: 'Auto', value: 30, emoji: '🌤️' },
                  { label: 'Dim', value: 60, emoji: '🌙' },
                  { label: 'Dark', value: 90, emoji: '🌑' }
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setDarknessLevel(preset.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      Math.abs(darknessLevel - preset.value) < 5
                        ? 'ring-2 ring-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{
                      backgroundColor: Math.abs(darknessLevel - preset.value) < 5 
                        ? 'var(--theme-accent)' 
                        : undefined,
                      opacity: Math.abs(darknessLevel - preset.value) < 5 ? 0.8 : 0.6
                    }}
                    aria-label={`Set theme to ${preset.label} (${preset.value}%)`}
                  >
                    <span className="text-base">{preset.emoji}</span>
                    <span className="font-medium">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={e => handleOverlayClick(e, "logout")}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-8 shadow-2xl min-w-[320px] max-w-sm mx-4 animate-scale-in"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text)'
            }}
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-semibold text-xl mb-4 text-center">
              Are you sure you want to log out?
            </h3>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal Overlay */}
      {!user && isSignupModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={(e) => handleOverlayClick(e, "signup")}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-modal-title"
        >
          {/* Backdrop Blur Effect */}
          <div className="absolute inset-0 backdrop-blur-sm" />
          
          {/* Signup Modal */}
          <div
            ref={signupModalRef}
            className="relative bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-8 shadow-2xl min-w-[320px] max-w-sm mx-4 animate-scale-in"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text)'
            }}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 id="signup-modal-title" className="font-semibold text-xl">Sign Up</h3>
              <button
                onClick={() => setIsSignupModalOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Close signup modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Signup Form */}
            <form className="space-y-4" onSubmit={handleSignupSubmit}>
              <div>
                <label htmlFor="signup-email" className="block mb-1 text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  required
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block mb-1 text-sm font-medium">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  required
                  placeholder="Password"
                  autoComplete="new-password"
                />
              </div>
              {signupError && (
                <div className="text-red-600 text-sm">{signupError}</div>
              )}
              <button
                type="submit"
                className="w-full py-2 mt-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Sign Up
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="px-2 text-sm text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Google SSO */}
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-all shadow-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Sign up with Google"
              type="button"
            >
              <span className="w-6 h-6 flex items-center justify-center">
                <GoogleIcon />
              </span>
              <span>Sign up with Google</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;