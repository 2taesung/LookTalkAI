import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedLanguage?: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, selectedLanguage = 'en' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rateLimitedUntil, setRateLimitedUntil] = useState<Date | null>(null);

  const getText = (ko: string, en: string, zh: string) => {
    switch (selectedLanguage) {
      case 'ko': return ko;
      case 'zh': return zh;
      default: return en;
    }
  };

  // 컴포넌트가 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setError('');
      setSuccess('');
      setRateLimitedUntil(null);
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setSuccess('');
    setLoading(false);
    setRateLimitedUntil(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 이미 로딩 중이면 중복 실행 방지
    if (loading) {
      console.log('이미 처리 중입니다.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    console.log(`${isLogin ? '로그인' : '회원가입'} 시작:`, { email, isLogin });

    try {
      if (isLogin) {
        // 로그인 처리
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        console.log('로그인 응답:', { data, error, user: data?.user });

        if (error) {
          console.error('로그인 에러:', error);
          
          if (error.message.includes('email_not_confirmed')) {
            setError(getText(
              '이메일 확인이 필요합니다. 이메일을 확인하고 인증 링크를 클릭해주세요.',
              'Please check your email and click the confirmation link before signing in.',
              '请检查您的电子邮件并点击确认链接后再登录。'
            ));
          } else if (error.message.includes('Invalid login credentials')) {
            setError(getText(
              '이메일 또는 비밀번호가 올바르지 않습니다.',
              'Invalid email or password.',
              '电子邮件或密码无效。'
            ));
          } else {
            setError(error.message);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          console.log('로그인 성공:', data.user);
          setSuccess(getText('로그인 성공!', 'Successfully signed in!', '登录成功！'));
          
          // 성공 처리
          setTimeout(() => {
            console.log('로그인 성공 콜백 실행');
            onSuccess();
            resetForm();
            onClose();
          }, 1000);
          return;
        }
      } else {
        // 회원가입 처리
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName.trim(),
            },
          },
        });

        console.log('회원가입 응답:', { data, error });

        if (error) {
          console.error('회원가입 에러:', error);
          
          if (error.message.includes('over_email_send_rate_limit')) {
            const waitTimeMatch = error.message.match(/(\d+)\s*seconds?/);
            const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 60;
            
            const rateLimitEnd = new Date(Date.now() + waitTime * 1000);
            setRateLimitedUntil(rateLimitEnd);
            
            setError(getText(
              `이메일 요청이 너무 많습니다. ${waitTime}초 후에 다시 시도해주세요.`,
              `Too many email requests. Please wait ${waitTime} seconds before trying again.`,
              `电子邮件请求过多。请等待${waitTime}秒后重试。`
            ));
            
            const timer = setInterval(() => {
              if (Date.now() >= rateLimitEnd.getTime()) {
                setRateLimitedUntil(null);
                setError('');
                clearInterval(timer);
              }
            }, 1000);
          } else if (error.message.includes('User already registered')) {
            setError(getText(
              '이미 등록된 이메일입니다. 로그인을 시도해주세요.',
              'This email is already registered. Please try signing in.',
              '此电子邮件已注册。请尝试登录。'
            ));
          } else {
            setError(error.message);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          console.log('회원가입 성공:', data.user);
          setSuccess(getText(
            '계정이 생성되었습니다! 이메일을 확인하여 인증을 완료해주세요.',
            'Account created! Please check your email for a confirmation link.',
            '账户已创建！请检查您的电子邮件以获取确认链接。'
          ));
          
          // 회원가입 성공 시 폼 초기화하지만 모달은 열어둠
          setEmail('');
          setPassword('');
          setDisplayName('');
        }
      }
    } catch (err: any) {
      console.error('인증 처리 중 예외 발생:', err);
      setError(err.message || getText(
        '예상치 못한 오류가 발생했습니다.',
        'An unexpected error occurred.',
        '发生了意外错误。'
      ));
    } finally {
      // 항상 로딩 상태 해제
      console.log('로딩 상태 해제');
      setLoading(false);
    }
  };

  const getRemainingTime = () => {
    if (!rateLimitedUntil) return 0;
    return Math.max(0, Math.ceil((rateLimitedUntil.getTime() - Date.now()) / 1000));
  };

  const remainingTime = getRemainingTime();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isLogin 
              ? getText('로그인', 'Sign In', '登录')
              : getText('회원가입', 'Create Account', '创建账户')
            }
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              {error.includes('rate_limit') ? (
                <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
                {remainingTime > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {getText(
                      `남은 시간: ${remainingTime}초`,
                      `Time remaining: ${remainingTime} seconds`,
                      `剩余时间：${remainingTime}秒`
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={getText('닉네임', 'Display Name', '昵称')}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder={getText('이메일', 'Email', '电子邮件')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder={getText('비밀번호', 'Password', '密码')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || remainingTime > 0}
            className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-teal-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{getText('처리 중...', 'Processing...', '处理中...')}</span>
              </div>
            ) : remainingTime > 0 ? (
              getText(`${remainingTime}초 대기`, `Wait ${remainingTime}s`, `等待${remainingTime}秒`)
            ) : (
              isLogin 
                ? getText('로그인', 'Sign In', '登录')
                : getText('회원가입', 'Create Account', '创建账户')
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setRateLimitedUntil(null);
                setLoading(false); // 모드 변경 시 로딩 상태 해제
              }}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              disabled={loading}
            >
              {isLogin 
                ? getText(
                    '계정이 없으신가요? 회원가입',
                    "Don't have an account? Sign up",
                    '没有账户？注册'
                  )
                : getText(
                    '이미 계정이 있으신가요? 로그인',
                    'Already have an account? Sign in',
                    '已有账户？登录'
                  )
              }
            </button>
          </div>

          {isLogin && (
            <div className="text-center">
              <p className="text-xs text-gray-500 mt-2">
                {getText(
                  '이메일 확인을 아직 하지 않으셨다면, 받은 편지함과 스팸 폴더를 확인해주세요.',
                  'If you haven\'t confirmed your email yet, please check your inbox and spam folder.',
                  '如果您尚未确认电子邮件，请检查您的收件箱和垃圾邮件文件夹。'
                )}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}