import React, { useState } from 'react';
import { Button } from "../../components/ui/button.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Label } from "../../components/ui/label.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.tsx";
import { useAuth } from './AuthContext.tsx';

const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn.withEmail(email, password);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'microsft') => {
    setError('');
    try {
      const { error } = await (provider === 'google' 
        ? signIn.withGoogle() 
        : provider === 'microsft' ? signIn.withMicrosoft() : signIn.withFacebook());

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] pointer-events-none" />
      <div className="max-w-[420px] w-full backdrop-blur-[2px]">
        <Card className="border-gradient bg-white">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold">
              {isSignUp ? 'צור חשבון חדש' : 'ברוך הבא בחזרה'}
              <br/>              
              <span className='text-cadetblue-500 text-sm'>למתכנן שיעורים לחדר אימרסיבי</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">אימייל</Label>
                <Input
                  dir='ltr'
                  id="email"
                  type="email"
                  autoComplete='username'
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required
                  className="h-11 pr-5"
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">סיסמה</Label>
                <Input
                  dir='ltr'
                  id="password"
                  type="password"
                  value={password}
                  autoComplete='current-password' 
                  onChange={(e: any) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-5"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
                {isSignUp ? 'הרשמה' : 'התחברות'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  או המשך עם
                </span>
              </div>
            </div>

            <div className="grid gap-3 items-center content-center
">
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-white hover:bg-slate-50"
                onClick={() => handleOAuthSignIn('google')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className='mr-2'>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                </svg>                
                התחברות עם Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-white hover:bg-slate-50"
                onClick={() => handleOAuthSignIn('facebook')}
              >
                <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24">
                  <path
                    d="M9.945 22v-8.834H7V9.485h2.945V6.54c0-3.043 1.926-4.54 4.64-4.54 1.3 0 2.418.097 2.744.14v3.18h-1.883c-1.476 0-1.82.703-1.82 1.732v2.433h3.68l-.736 3.68h-2.944L13.685 22"
                    fill="#1877F2"
                  />
                </svg>
                התחברות עם Facebook
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-white hover:bg-slate-50"
                onClick={() => handleOAuthSignIn('microsft')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" className="mr-2 h-6 w-6">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                התחברות עם Microsft Account
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-6 w-full text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              {isSignUp ? 'כבר יש לך חשבון? התחבר' : 'אין לך חשבון? הירשם'}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;